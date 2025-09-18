import { HotelServiceTemplateMapping } from "@hi/db-models";
import {
  hotelServiceTemplateMapping,
  updateHotelServiceTemplateMapping,
} from "@hi/db-models/src/validators";

import type { HotelServiceTemplateMappingType } from "@hi/db-models/src/validators";

import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const hotelServiceTemplateMappingRouter = new Hono()

  .post("/", zValidator("json", hotelServiceTemplateMapping), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData =
        (await c.req.json()) as HotelServiceTemplateMappingType;

      const existingMapping =
        await HotelServiceTemplateMapping.findOneAndUpdate(
          {
            businessId: requestData.businessId,
            serviceName: requestData.serviceName,
          },
          {
            $set: {
              isActive: requestData.isActive,
              templateId: requestData.templateId,
            },
          },
          { session, upsert: true },
        );

      if (!existingMapping) {
        return respond(
          c,
          "Service template created successfully",
          false,
          400,
          {},
        );
      }

      return respond(c, "Service template created successfully", false, 201, {
        _id: existingMapping._id,
      });
    });
  })
  .get(
    "/:businessId/service_names",

    zValidator(
      "param",
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();

      const serviceNames = [
        {
          serviceName: "welcome",
          isActive: true,
        },
        {
          serviceName: "delivery",
          isActive: true,
        },
        {
          serviceName: "service_rejection",
          isActive: true,
        },
        {
          serviceName: "thank_you",
          isActive: true,
        },
        {
          serviceName: "check_out",
          isActive: true,
        },
        {
          serviceName: "service_escalation",
          isActive: true,
        },
      ];

      return respond(
        c,
        "Service names fetched successfully",
        false,
        200,
        serviceNames,
      );
    },
  )

  .get(
    "/",

    zValidator(
      "query",
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();

      const serviceTemplateMappings = await HotelServiceTemplateMapping.find({
        businessId,
      });

      return respond(
        c,
        "Service template mappings fetched successfully",
        false,
        200,
        serviceTemplateMappings,
      );
    },
  )

  .get(
    "/:businessId/:serviceName",

    zValidator(
      "param",
      z.object({
        serviceName: z.string().min(1).max(50),
        businessId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { serviceName, businessId } = c.req.param();

      const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
        businessId,
        serviceName: serviceName,
      });
      if (!serviceTemplateMapping) {
        return respond(c, "Service template mapping not found", true, 404);
      }

      return respond(
        c,
        "Service template mappings fetched successfully",
        false,
        200,
        serviceTemplateMapping,
      );
    },
  )
  .put(
    "/:serviceTemplateMappingId",
    zValidator("json", updateHotelServiceTemplateMapping),
    zValidator(
      "param",
      z.object({
        serviceTemplateMappingId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { serviceTemplateMappingId } = c.req.param();
        const requestData = await c.req.json();

        const serviceTemplateMapping =
          await HotelServiceTemplateMapping.findByIdAndUpdate(
            serviceTemplateMappingId,
            {
              $set: {
                isActive: requestData.isActive,
                templateId: requestData.templateId,
              },
            },
            { new: true, session },
          );

        if (!serviceTemplateMapping) {
          throw new Error("Service template mapping not found");
        }

        return respond(
          c,
          "Service template mapping updated successfully",
          false,
          200,
          {
            _id: serviceTemplateMapping._id,
          },
        );
      });
    },
  );

export default hotelServiceTemplateMappingRouter;
