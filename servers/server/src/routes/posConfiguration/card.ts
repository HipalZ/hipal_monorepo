import { PosCardConfig } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const cardPosConfigRouter = new Hono().get(
  "/fetch_card_pos_config",
  zValidator(
    "query",
    z.object({
      businessId: z.string(),
    }),
  ),

  async (c) => {
    const { businessId } = c.req.query();
    const cardPosConfig = await PosCardConfig.findOne({
      businessId: businessId,
    });

    if (!cardPosConfig) {
      return respond(c, "No card pos config found", true, 404);
    }

    return respond(c, "Menu fetched successfully", false, 200, cardPosConfig);
  },
);

export default cardPosConfigRouter;
