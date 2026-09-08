import { HotelService, HotelServiceAvailabilityGroup } from '@hi/db-models';
import { hotelServiceAvailabilityGroup, updateHotelServiceAvailabilityGroup } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '../../utils/response';

const serviceAvailabilityGroupRouter = new Hono()
  .get(
    '/fetch_groups',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();
      const groups = await HotelServiceAvailabilityGroup.find({ businessId })
        .sort({ updatedAt: -1, _id: -1 })
        .populate({
          path: 'serviceIds',
          select: '_id name categoryId availability',
        })
        .lean();

      return respond(c, 'Service availability groups fetched', false, 200, groups);
    },
  )
  .post('/add_group', zValidator('json', hotelServiceAvailabilityGroup), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const payload = await c.req.json();
      const serviceIds = payload.serviceIds || [];
      const linkedServices = serviceIds.length
        ? await HotelService.countDocuments({
            _id: { $in: serviceIds },
            businessId: payload.businessId,
          })
        : 0;

      if (linkedServices !== serviceIds.length) {
        return respond(c, 'One or more selected services do not belong to this hotel', true, 400, {});
      }

      const existingGroup = await HotelServiceAvailabilityGroup.exists({
        businessId: payload.businessId,
        name: payload.name,
      });

      if (existingGroup) {
        return respond(c, 'Availability group already exists', true, 409, {});
      }

      const [group] = await HotelServiceAvailabilityGroup.create([payload], { session });
      return respond(c, 'Availability group created', false, 201, { _id: group._id });
    });
  })
  .put('/edit_group', zValidator('json', updateHotelServiceAvailabilityGroup), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const payload = await c.req.json();
      const { groupId, businessId, ...updates } = payload;
      const serviceIds = updates.serviceIds || [];

      if (serviceIds.length) {
        const linkedServices = await HotelService.countDocuments({
          _id: { $in: serviceIds },
          businessId,
        });

        if (linkedServices !== serviceIds.length) {
          return respond(c, 'One or more selected services do not belong to this hotel', true, 400, {});
        }
      }

      if (updates.name) {
        const existingGroup = await HotelServiceAvailabilityGroup.exists({
          _id: { $ne: groupId },
          businessId,
          name: updates.name,
        });

        if (existingGroup) {
          return respond(c, 'Availability group already exists', true, 409, {});
        }
      }

      const group = await HotelServiceAvailabilityGroup.findOneAndUpdate(
        { _id: groupId, businessId },
        { $set: updates },
        { session, new: true },
      );

      if (!group) {
        return respond(c, 'Availability group not found', true, 404, {});
      }

      return respond(c, 'Availability group updated', false, 200, { _id: group._id });
    });
  })
  .delete(
    '/delete_group/:groupId',
    zValidator('param', z.object({ groupId: z.string().min(24).max(24) })),
    zValidator('json', z.object({ businessId: z.string().min(24).max(24) })),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { groupId } = c.req.param();
        const { businessId } = await c.req.json();
        const deleted = await HotelServiceAvailabilityGroup.findOneAndDelete({ _id: groupId, businessId }, { session });

        if (!deleted) {
          return respond(c, 'Availability group not found', true, 404, {});
        }

        return respond(c, 'Availability group deleted', false, 200, {});
      });
    },
  );

export default serviceAvailabilityGroupRouter;
