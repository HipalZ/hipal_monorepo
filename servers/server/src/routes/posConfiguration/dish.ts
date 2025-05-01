import { PosDishConfig } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const dishPosConfigRouter = new Hono().get(
  "/fetch_dish_pos_config",
  zValidator(
    "query",
    z.object({
      businessId: z.string(),
    }),
  ),

  async (c) => {
    const { businessId } = c.req.query();
    const dishPosConfig = await PosDishConfig.findOne({
      businessId: businessId,
    });

    if (!dishPosConfig) {
      return respond(c, "No dish pos config found", true, 404);
    }

    return respond(c, "Menu fetched successfully", false, 200, dishPosConfig);
  },
);

export default dishPosConfigRouter;
