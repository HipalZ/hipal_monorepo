import {
  Business,
  BusinessPosConfig,
  Table,
  UrlModel,
  Zone,
} from "@hi/db-models";
import {
  createTableSchema,
  updateTableSchema,
  updateZoneChema,
  zoneChema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
//
const zonesAndTablesRouter = new Hono()
  .post("/zone", zValidator("json", zoneChema), async (c) => {
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

      const isHavePos = await BusinessPosConfig.findOne({
        businessId,
      });

      if (isHavePos) {
        return c.json(
          {
            message: "pos is enabled for this business you can't create zone",
            err: true,
          },
          409,
        );
      }

      const alreadyExists = await Zone.findOne({ businessId, name });

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

      // if (tableIds.length > 0) {
      //   await Table.updateMany(
      //     { _id: { $in: tableIds } },
      //     { $set: { internalZoneId: zone._id } },
      //     { session },
      //   );
      // }

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

  .put("/zone", zValidator("json", updateZoneChema), async (c) => {
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
        _id,
        zoneId,
      } = await c.req.json();

      const isHavePos = await BusinessPosConfig.findOne({
        businessId,
      });

      if (isHavePos) {
        return c.json(
          {
            message: "pos is enabled for this business you can't update zone",
            err: true,
          },
          409,
        );
      }

      const alreadyExists = await Zone.findOne({
        businessId,
        name,
        _id: {
          $ne: _id,
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
          _id: _id,
          businessId,
        },
        {
          name,
          staffIds,
          visibility,
          tableIds,
          taxes,
          couponIds,
        },
        { session, new: true },
      );

      if (!updatedZone) {
        throw new Error("Zone not found");
      }

      // if (tableIds.length > 0) {
      //   await Table.updateMany(
      //     { _id: { $in: tableIds } },
      //     { $addToSet: { internalZoneId: updatedZone._id } },
      //     { session },
      //   );
      // }

      return c.json(
        {
          message: "Zone update successfully",
          err: false,
          data: {},
        },
        200,
      );
    });
  })

  .post("/table", zValidator("json", createTableSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const {
        businessId,
        name,
        staffIds = [],
        visibility,
        capacity,
        internalZoneId,
      } = await c.req.json();
      const businessInfo =
        await Business.findById(businessId).select("customLink");
      //TODO: change the url to the actual url

      const uniqueOrderId = nanoid(5);

      const isHavePos = await BusinessPosConfig.findOne({
        businessId,
      });

      if (isHavePos) {
        return c.json(
          {
            message: "pos is enabled for this business you can't create table",
            err: true,
          },
          409,
        );
      }

      const alreadyExists = await Table.findOne({ businessId, name });

      if (alreadyExists) {
        return c.json(
          {
            message: "Table with this name already exists",
            err: true,
          },
          409,
        );
      }

      // Check if the name contains a range pattern (e.g., a1-a5)
      const rangePattern = /^(.*?)(\d+)-(\d+)$/;
      const match = name.match(rangePattern);

      let tableNames = [];

      if (match) {
        const baseName = match[1];
        const start = Number.parseInt(match[2], 10);
        const end = Number.parseInt(match[3], 10);

        for (let i = start; i <= end; i++) {
          tableNames.push(`${baseName}${i}`);
        }
      } else {
        tableNames.push(name);
      }

      if (tableNames.length > 1) {
        const createdTables = [];
        for (const tableName of tableNames) {
          const alreadyExists = await Table.findOne({
            businessId,
            name: tableName,
          });

          if (alreadyExists) {
            continue;
          }

           const uniqueOrderId = nanoid(5);

          const longUrl = `http://localhost:3000/${businessInfo?.customLink}/explore?tableName=${tableName}`;

          const createShortUrl = await UrlModel.create(
            [
              {
                longUrl: longUrl,
                shortUrl: `https://api.test.hipalz.com/surl/${uniqueOrderId}`,
                urlCode: uniqueOrderId,
                businessId: businessId,
              },
            ],
            {
              session,
            },
          );

          const table = new Table({
            businessId,
            name: tableName,
            staffIds,
            visibility,
            capacity,
            internalZoneId,
            tableLink: createShortUrl[0].shortUrl,
          });

          await table.save({ session });

          await Zone.updateOne(
            {
              _id: internalZoneId,
              businessId,
            },
            {
              $addToSet: {
                tableIds: table._id,
              },
            },
            { session },
          );

          createdTables.push(table);
        }

        if (createdTables.length === 0) {
          return c.json(
            {
              message: "No new tables were created because they already exist",
              err: true,
              data: {},
            },
            409,
          );
        }

        return c.json(
          {
            message: "Tables created successfully",
            err: false,
            data: createdTables,
          },
          201,
        );
      }

      const longUrl = `http://localhost:3000/${businessInfo?.customLink}/explore?tableName=${name}`;

      const createShortUrl = await UrlModel.create(
        [
          {
            longUrl: longUrl,
            shortUrl: `https://api.test.hipalz.com/surl/${uniqueOrderId}`,
            urlCode: uniqueOrderId,
            businessId: businessId,
          },
        ],
        {
          session,
        },
      );

      const table = new Table({
        businessId,
        name,
        staffIds,
        visibility,
        capacity,
        internalZoneId,
        tableLink: createShortUrl[0].shortUrl,
      });

      await table.save({ session });

      await Zone.updateOne(
        {
          _id: internalZoneId,
          businessId,
        },
        {
          $addToSet: {
            tableIds: table._id,
          },
        },
        { session },
      );

      return c.json(
        {
          message: "table created successfully",
          err: false,
          data: {},
        },
        201,
      );
    });
  })

  .put("/table", zValidator("json", updateTableSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const {
        businessId,
        name,
        staffIds = [],
        visibility,
        capacity,
        internalZoneId,
        tableId,
      } = await c.req.json();

      const isHavePos = await BusinessPosConfig.findOne({
        businessId,
      });

      if (isHavePos) {
        return c.json(
          {
            message: "pos is enabled for this business you can't create table",
            err: true,
          },
          409,
        );
      }

      const tableAlreadyActive = await Table.findById(tableId);

      if (tableAlreadyActive?.status === "ACTIVE") {
        return c.json(
          {
            message: "you can't update this table because this table is active",
            err: true,
          },
          409,
        );
      }

      const alreadyExists = await Table.findOne({
        businessId: {
          $ne: businessId,
        },
        name: {
          $eq: name,
        },
      });

      if (alreadyExists) {
        return c.json(
          {
            message: "Table with this name already exists",
            err: true,
          },
          409,
        );
      }

      if (!visibility) {
        const table = await Table.findById(tableId);
        if (!table) {
          throw new Error("Table not found");
        }

        if (table.status !== "EMPTY") {
          throw new Error(
            "you can't hide this table because this table is not empty",
          );
        }
      }

      const updatedTable = await Table.findOneAndUpdate(
        {
          _id: tableId,
          businessId,
        },
        {
          name,
          staffIds,
          visibility,
          capacity,
          internalZoneId,
        },
        { session, new: true },
      );

      if (!updatedTable) {
        throw new Error("Table not found");
      }

      await Zone.updateOne(
        {
          _id: internalZoneId,
          businessId,
        },
        {
          $addToSet: {
            tableIds: updatedTable._id,
          },
        },
        { session },
      );

      return c.json(
        {
          message: "table updated successfully",
          err: false,
          data: {},
        },
        200,
      );
    });
  })
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

      const tables = await Table.find({
        businessId,
        isDeleted: false,
        visibility: true,
      });
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

      const zones = await Zone.find({
        businessId,
        isDeleted: false,
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

export default zonesAndTablesRouter;
