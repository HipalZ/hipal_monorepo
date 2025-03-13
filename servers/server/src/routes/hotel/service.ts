import { HotelService, HotelServiceCategory } from "@hi/db-models";
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
          select: "name image availability",
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
  });

export default serviceRouter;
