import { Table, Zone } from "@hi/db-models";
import { updateZoneChema, zoneChema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//

const zoneRouter = new Hono()
  .post("/", zValidator("json", zoneChema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const {
        businessId,
        name,
        staffIds = [],
        visibility,
        taxes,
        couponIds = [],
        tableIds = [],
      } = await c.req.json();

      const alreadyExists = await Zone.findOne({
        businessId,
        name,
        active: true,
      });

      if (alreadyExists) {
        return c.json(
          {
            message: "Zone with this name already exists",
            err: true,
          },
          409,
        );
      }

      const zone = new Zone({
        businessId,
        name,
        staffIds,
        visibility,
        taxes,
        couponIds,
        tableIds,
      });

      await zone.save({ session });

      return c.json(
        {
          message: "Zone created successfully",
          err: false,
          data: {},
        },
        201,
      );
    });
  })

  .put(
    "/:businessId/:zoneId",
    zValidator("json", updateZoneChema),
    zValidator(
      "param",
      z.object({
        zoneId: z.string().min(24).max(24),
        businessId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const {
          name,
          staffIds = [],
          visibility,
          taxes,
          couponIds = [],
          tableIds = [],
        } = await c.req.json();
        const { zoneId, businessId } = c.req.param();

        const alreadyExists = await Zone.findOne({
          businessId,
          name,
          _id: {
            $ne: zoneId,
          },
        });

        if (alreadyExists) {
          return c.json(
            {
              message: "Zone with this name already exists",
              err: true,
            },
            409,
          );
        }

        const findActiveTable = await Table.findOne({
          internalZoneId: zoneId,
          status: "ACTIVE",
          businessId,
        });

        if (findActiveTable) {
          return c.json(
            {
              message:
                "you can't update this zone because this zone has active tables",
              err: true,
            },
            409,
          );
        }

        const updatedZone = await Zone.findOneAndUpdate(
          {
            _id: zoneId,
            businessId,
          },
          {
            name,
            staffIds,
            visibility,
            tableIds,
          },
          { session, new: true },
        );

        if (!updatedZone) {
          throw new Error("Zone not found");
        }

        return c.json(
          {
            message: "Zone update successfully",
            err: false,
            data: {},
          },
          200,
        );
      });
    },
  )
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const zones = await Zone.find({
        businessId,
        isDeleted: false,
        active: true,
      });
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

export default zoneRouter;
