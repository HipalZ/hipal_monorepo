import { HotelAlert, HotelService, HotelServiceCategory, User } from '@hi/db-models';
import { hotelService, hotelServiceCategory, updateHotelService } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import mongoose from 'mongoose';
import { z } from 'zod';
import { ensureQuickActionDefaults } from '../../services/hotel/quickActions';
import { respond } from '../../utils/response';

const keepAvailableServices = <T extends { serviceIds?: unknown[] }>(category: T) => ({
  ...category,
  serviceIds: (category.serviceIds || []).filter((service: any) => service?.availability !== false),
});

const bulkUpdateHotelServiceTimings = z.object({
  businessId: z.string().min(24).max(24),
  services: z
    .array(
      z.object({
        serviceName: z.string().min(1).max(50),
        avgAcceptanceTime: z.number().positive(),
        avgCompletionTime: z.number().positive(),
        avgDeliveryTime: z.number().positive().optional(),
      }),
    )
    .min(1),
});

const serviceRouter = new Hono()
  .get(
    '/fetch_service',
    zValidator(
      'query',
      z.object({
        serviceId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { serviceId } = c.req.query();

      const service = await HotelService.findById(serviceId).lean();

      return service ? respond(c, 'Service details', false, 200, service) : respond(c, 'Service not found', true, 404, {});
    },
  )

  .get(
    '/fetch_services',
    zValidator(
      'query',
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const services = await HotelService.find({
        businessId,
      })
        .sort({ sequence: 1 })
        .lean();

      return respond(c, 'All services ', false, 200, services);
    },
  )

  .get(
    '/fetch_services_categories',
    zValidator(
      'query',
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const services = await HotelServiceCategory.find({
        businessId,
      })
        .sort({ sequence: 1 })
        .populate({
          path: 'serviceIds',
          select: 'name image availability quantityLimit serviceBehavior sequence',
          options: { sort: { sequence: 1 } },
        })
        .lean();

      return respond(
        c,
        'All services ',
        false,
        200,
        services.map(keepAvailableServices).filter((category) => category.serviceIds.length > 0),
      );
    },
  )

  .get(
    '/fetch_service_category',
    zValidator(
      'query',
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();

      // Lazily seeds the "Quick Actions" category + default services for
      // businesses that don't have them yet (idempotent).
      await ensureQuickActionDefaults(businessId);

      const categories = await HotelServiceCategory.find({
        businessId,
        availability: true,
      })
        .sort({ sequence: 1, _id: 1 })
        .populate({
          path: 'serviceIds',
          select: 'name image availability avgAcceptanceTime avgCompletionTime avgDeliveryTime quantityLimit serviceBehavior sequence systemKey',
          options: { sort: { sequence: 1, _id: 1 } },
        })
        .select('name image serviceIds sequence systemKey')
        .lean();

      const availableCategories = categories.map(keepAvailableServices).filter((category) => category.serviceIds.length > 0);

      return respond(c, 'All service categories', false, 200, availableCategories);
    },
  )

  .post(
    '/add_category',
    zValidator('json', hotelServiceCategory),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();

        // Check if category already exists
        const categoryExists = await HotelServiceCategory.exists({
          businessId: requestData.businessId,
          name: requestData.name,
          availability: true,
        });

        if (categoryExists) {
          return respond(c, 'Category service already exists', true, 409, {});
        }

        const [category] = await HotelServiceCategory.create([requestData], {
          session,
        });

        if (!category) {
          throw new Error('Category not created');
        }

        return respond(c, 'Category created', false, 201, {
          _id: category._id,
        });
      });
    },
  )

  .post(
    '/add_service',
    zValidator('json', hotelService),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();

        // Check if service already exists
        const serviceExists = await HotelService.exists({
          businessId: requestData.businessId,
          name: requestData.name,
        });

        if (serviceExists) {
          return respond(c, 'Service already exists', true, 409, {});
        }

        const [service] = await HotelService.create([requestData], { session });

        if (!service) {
          throw new Error('Service not created');
        }

        await HotelServiceCategory.findOneAndUpdate({ _id: requestData.categoryId }, { $push: { serviceIds: service._id } }, { session });

        await User.updateMany(
          {
            customRole: {
              $elemMatch: {
                businessId: requestData.businessId,
                isDeleted: { $ne: true },
              },
            },
          },
          {
            $addToSet: {
              'customRole.$[role].serviceIds': service._id,
            },
          },
          {
            session,
            arrayFilters: [
              {
                'role.businessId': new mongoose.Types.ObjectId(requestData.businessId),
                'role.isDeleted': { $ne: true },
              },
            ],
          },
        );

        return respond(c, 'Service created', false, 201, { _id: service._id });
      });
    },
  )

  .put('/edit_service', zValidator('json', updateHotelService), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { serviceId, name } = requestData;

      if (name) {
        const serviceExists = await HotelService.exists({
          name,
          _id: { $ne: serviceId },
          businessId: requestData.businessId,
        });

        if (serviceExists) {
          return respond(c, 'Service already exists', true, 409, {});
        }
      }

      const isServiceActive = await HotelAlert.exists({
        serviceIds: serviceId,
        businessId: requestData.businessId,
        alertProgress: {
          $nin: ['RESOLVED', 'MESSAGE', 'DELIVERED', 'REJECTED'],
        },
      });

      if (isServiceActive) {
        return respond(c, 'Service is active and cannot be edited', true, 409, {});
      }

      const updatedService = await HotelService.findOneAndUpdate({ _id: serviceId }, { $set: requestData }, { session, new: true });

      if (!updatedService) {
        return respond(c, 'Service not found or not updated', true, 404, {});
      }

      return respond(c, 'Service updated successfully', false, 200, {
        _id: updatedService._id,
      });
    });
  })

  .put('/bulk_update_timings', zValidator('json', bulkUpdateHotelServiceTimings), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { businessId, services } = await c.req.json();

      const rowsByName = new Map<
        string,
        {
          serviceName: string;
          avgAcceptanceTime: number;
          avgCompletionTime: number;
          avgDeliveryTime?: number;
        }
      >();

      for (const row of services) {
        rowsByName.set(row.serviceName.trim().toLowerCase(), {
          ...row,
          serviceName: row.serviceName.trim(),
        });
      }

      const existingServices = await HotelService.find({ businessId }).select('_id name').lean();

      const serviceByName = new Map(existingServices.map((service) => [service.name.trim().toLowerCase(), service]));

      const matchedServiceIds: string[] = [];
      const notFound: string[] = [];

      for (const [serviceName, row] of rowsByName) {
        const service = serviceByName.get(serviceName);
        if (!service) {
          notFound.push(row.serviceName);
          continue;
        }
        matchedServiceIds.push(service._id.toString());
      }

      const activeServiceIds = await HotelAlert.distinct('serviceIds', {
        businessId,
        serviceIds: { $in: matchedServiceIds },
        alertProgress: {
          $nin: ['RESOLVED', 'MESSAGE', 'DELIVERED', 'REJECTED'],
        },
      });
      const activeServiceIdSet = new Set(activeServiceIds.map((id) => id.toString()));

      const skippedActive: string[] = [];
      const bulkOps = [];

      for (const [serviceName, row] of rowsByName) {
        const service = serviceByName.get(serviceName);
        if (!service) continue;

        const serviceId = service._id.toString();
        if (activeServiceIdSet.has(serviceId)) {
          skippedActive.push(service.name);
          continue;
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: service._id, businessId },
            update: {
              $set: {
                avgAcceptanceTime: row.avgAcceptanceTime,
                avgCompletionTime: row.avgCompletionTime,
                avgDeliveryTime: row.avgDeliveryTime ?? row.avgCompletionTime,
              },
            },
          },
        });
      }

      if (bulkOps.length) {
        await HotelService.bulkWrite(bulkOps, { session });
      }

      return respond(c, 'Service timings updated', false, 200, {
        updated: bulkOps.length,
        notFound,
        skippedActive,
      });
    });
  })

  .delete(
    '/delete_services',
    zValidator(
      'json',
      z.object({
        serviceIds: z.array(z.string().min(2).max(26)),
        businessId: z.string().min(2).max(26),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const { serviceIds, businessId } = requestData;

        await HotelService.deleteMany({
          _id: { $in: serviceIds },
          businessId: businessId,
        });

        return respond(c, 'Services deleted successfully', false, 200, {});
      });
    },
  )
  // single service delete
  .delete(
    '/delete_service/:serviceId',
    zValidator('param', z.object({ serviceId: z.string().min(24).max(24) })),
    zValidator('json', z.object({ businessId: z.string().min(24).max(24) })),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const businessId = requestData.businessId;
        const { serviceId } = c.req.param();
        const isServiceActive = await HotelAlert.exists({
          serviceIds: serviceId,
          businessId: requestData.businessId,
          alertProgress: {
            $exists: true,
            $nin: ['RESOLVED', 'MESSAGE', 'DELIVERED', 'REJECTED'],
          },
        });
        if (isServiceActive) {
          return respond(c, 'Service is active and cannot be deleted', true, 409, {});
        }

        const { deletedCount } = await HotelService.deleteOne({ _id: serviceId, businessId }, { session });

        if (!deletedCount) {
          return respond(c, 'Service not found', true, 404, {});
        }

        // pull serviceIds from user models
        await User.updateMany({ 'customRole.serviceIds': serviceId }, { $pull: { 'customRole.$[].serviceIds': serviceId } }, { session });

        return respond(c, 'Services deleted successfully', false, 200, {});
      });
    },
  )

  .post(
    '/update_category_sequence',
    zValidator(
      'json',
      z.object({
        sequences: z.array(
          z.object({
            id: z.string(),
            sequence: z.number(),
          }),
        ),
      }),
    ),
    async (c) => {
      const { sequences } = await c.req.json();

      const bulkOps = sequences.map((item: any) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(item.id) },
          update: { $set: { sequence: item.sequence } },
        },
      }));

      await HotelServiceCategory.bulkWrite(bulkOps);

      return respond(c, 'Category sequences updated', false, 200, {});
    },
  )
  .get(
    '/get_category_sequence',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();
      const categories = await HotelServiceCategory.find({
        businessId,
        availability: true,
      }).sort({ sequence: 1 });
      return respond(c, 'Category sequences', false, 200, { categories });
    },
  )

  .post(
    '/update_service_sequence',
    zValidator(
      'json',
      z.object({
        sequences: z.array(
          z.object({
            id: z.string(),
            sequence: z.number(),
          }),
        ),
      }),
    ),
    async (c) => {
      const { sequences } = await c.req.json();

      const bulkOps = sequences.map((item: any) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(item.id) },
          update: { $set: { sequence: item.sequence } },
        },
      }));

      await HotelService.bulkWrite(bulkOps);

      return respond(c, 'Service sequences updated', false, 200, {});
    },
  );

export default serviceRouter;
