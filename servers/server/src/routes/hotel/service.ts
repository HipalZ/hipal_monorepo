import {
  HotelAlert,
  HotelService,
  HotelServiceCategory,
  User,
} from "@hi/db-models";
import {
  hotelService,
  hotelServiceCategory,
  updateHotelService,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const serviceRouter = new Hono()
  .get(
    "/fetch_service",
    zValidator(
      "query",
      z.object({
        serviceId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { serviceId } = c.req.query();

      const service = await HotelService.findById(serviceId).lean();

      return service
        ? respond(c, "Service details", false, 200, service)
        : respond(c, "Service not found", true, 404, {});
    },
  )

  .get(
    "/fetch_services",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const services = await HotelService.find({
        businessId,
      }).lean();

      return respond(c, "All services ", false, 200, services);
    },
  )

  .get(
    "/fetch_services_categories",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const services = await HotelServiceCategory.find({
        businessId,
      }).populate({
        path: "serviceIds",
        select: "name image availability",
      });

      return respond(c, "All services ", false, 200, services);
    },
  )

  .get(
    "/fetch_service_category",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const categories = await HotelServiceCategory.find({
        businessId,
        availability: true,
      })
        .populate({
          path: "serviceIds",
          select: "name image availability avgAcceptanceTime avgCompletionTime",
        })
        .select("name image serviceIds")
        .lean();

      return respond(c, "All service categories", false, 200, categories);
    },
  )

  .post(
    "/add_category",
    zValidator("json", hotelServiceCategory),

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
          return respond(c, "Category service already exists", true, 409, {});
        }

        const [category] = await HotelServiceCategory.create([requestData], {
          session,
        });

        if (!category) {
          throw new Error("Category not created");
        }

        return respond(c, "Category created", false, 201, {
          _id: category._id,
        });
      });
    },
  )

  .post(
    "/add_service",
    zValidator("json", hotelService),

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
          return respond(c, "Service already exists", true, 409, {});
        }

        const [service] = await HotelService.create([requestData], { session });

        if (!service) {
          throw new Error("Service not created");
        }

        await HotelServiceCategory.findOneAndUpdate(
          { _id: requestData.categoryId },
          { $push: { serviceIds: service._id } },
          { session },
        );

        return respond(c, "Service created", false, 201, { _id: service._id });
      });
    },
  )

  .put("/edit_service", zValidator("json", updateHotelService), async (c) => {
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
          return respond(c, "Service already exists", true, 409, {});
        }
      }

      const isServiceActive = await HotelAlert.exists({
        serviceIds: serviceId,
        businessId: requestData.businessId,
        alertProgress: {
          $exists: true,
          $ne: ["RESOLVED", "MESSAGE", "DELIVERED", "REJECTED"],
        },
      });

      if (isServiceActive) {
        return respond(
          c,
          "Service is active and cannot be edited",
          true,
          409,
          {},
        );
      }

      const updatedService = await HotelService.findOneAndUpdate(
        { _id: serviceId },
        { $set: requestData },
        { session, new: true },
      );

      if (!updatedService) {
        return respond(c, "Service not found or not updated", true, 404, {});
      }

      return respond(c, "Service updated successfully", false, 200, {
        _id: updatedService._id,
      });
    });
  })

  .delete(
    "/delete_services",
    zValidator(
      "json",
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

        return respond(c, "Services deleted successfully", false, 200, {});
      });
    },
  )
  // single service delete
  .delete(
    "/delete_service/:serviceId",
    zValidator("param", z.object({ serviceId: z.string().min(24).max(24) })),
    zValidator("json", z.object({ businessId: z.string().min(24).max(24) })),
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
            $ne: ["RESOLVED", "MESSAGE", "DELIVERED", "REJECTED"],
          },
        });
        if (isServiceActive) {
          return respond(
            c,
            "Service is active and cannot be deleted",
            true,
            409,
            {},
          );
        }

        const { deletedCount } = await HotelService.deleteOne(
          { _id: serviceId, businessId },
          { session },
        );

        if (!deletedCount) {
          return respond(c, "Service not found", true, 404, {});
        }

        // pull serviceIds from user models
        await User.updateMany(
          { "customRole.serviceIds": serviceId },
          { $pull: { "customRole.$[].serviceIds": serviceId } },
          { session },
        );

        return respond(c, "Services deleted successfully", false, 200, {});
      });
    },
  );

export default serviceRouter;
