import { Table, Zone } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const zonesAndTablesRouter = new Hono()
  .get(
    "/tables/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const tables = await Table.find({ businessId, isDeleted: false });
      return c.json(
        {
          message: "Tables fetched successfully",
          err: false,
          data: tables,
        },
        200,
      );
    },
  )
  .get(
    "/zones/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const zones = await Zone.find({ businessId, isDeleted: false });
      return c.json(
        {
          message: "zones fetched successfully",
          err: false,
          data: zones,
        },
        200,
      );
    },
  );

export default zonesAndTablesRouter;
