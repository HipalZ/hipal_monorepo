import { BusinessPosConfig, PosDishConfig } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const dishPosConfigRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),

        visibility: z.boolean().optional(),
        availability: z.boolean().optional(),
        recommendationIds: z.boolean().optional(),
        name: z.boolean().optional(),
        price: z.boolean().optional(),
        avgTime: z.boolean().optional(),
        dishTypes: z.boolean().optional(),
        categoryIds: z.boolean().optional(),
        addOnIds: z.boolean().optional(),
        kitchenId: z.boolean().optional(),
        images: z.boolean().optional(),
        description: z.boolean().optional(),
        tags: z.boolean().optional(),
        portions: z.boolean().optional(),
        calories: z.boolean().optional(),
      }),
    ),

    async (c) => {
      const {
        businessId,
        description,
        images,
        visibility,
        availability,
        recommendationIds,
        name,
        price,
        avgTime,
        dishTypes,
        categoryIds,
        addOnIds,
        kitchenId,

        tags,
        portions,
        calories,
      } = await c.req.json();

      const dishPosConfig = new PosDishConfig({
        businessId,
        description,
        images,
        visibility,
        availability,
        recommendationIds,
        name,
        price,
        avgTime,
        dishTypes,
        categoryIds,
        addOnIds,
        kitchenId,
        tags,
        portions,
        calories,
      });
      await dishPosConfig.save();

      return respond(c, "Menu created successfully", false, 201, dishPosConfig);
    },
  )

  .get(
    "/fetch_dish_pos_config",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();

      const businessPosConfig = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
      });
      const dishPosConfig = await PosDishConfig.findOne({
        businessId: businessId,
      }).select(
        "description images visibility recommendationIds availability kitchenId menuId",
      );

      if (!dishPosConfig) {
        return respond(c, "No dish pos config found", true, 404);
      }

      return respond(c, "Menu fetched successfully", false, 200, dishPosConfig);
    },
  );

export default dishPosConfigRouter;
