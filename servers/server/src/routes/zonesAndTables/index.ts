import {
  Business,
  BusinessPosConfig,
  Kitchen,
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
import { respond } from "../../utils/response";
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
        isDeleted: false,
        active: true,
        posName: {
          $ne: "HIPAL_Z",
        },
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
      const hipalZPos = await BusinessPosConfig.findOne({
        businessId: businessId,
        isDeleted: false,
        active: true,
        posName: "HIPAL_Z",
      });

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
        zoneId: nanoid(10),
        pos: !!hipalZPos,
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

  .put("/zone", zValidator("json", updateZoneChema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const {
        businessId,
        name,
        staffIds = [],
        visibility,
        tableIds = [],
        zoneId,
        kitchenIds = [],
      } = await c.req.json();

      const isHavePos = await BusinessPosConfig.findOne({
        businessId,
        isDeleted: false,
        active: true,
        posName: {
          $ne: "HIPAL_Z",
        },
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
          $set: {
            name,
            staffIds,
            visibility,
            tableIds,
            kitchenIds,
          },
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
          data: updatedZone,
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
        isDeleted: false,
        active: true,
        posName: {
          $ne: "HIPAL_Z",
        },
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

      const hipalZPos = await BusinessPosConfig.findOne({
        businessId: businessId,
        isDeleted: false,
        active: true,
        posName: "HIPAL_Z",
      });

      const zoneData = await Zone.findById(internalZoneId);

      if (!zoneData) {
        return respond(c, "Zone not found", true, 404, {});
      }

      const alreadyExists = await Table.findOne({
        businessId,
        name,
        active: true,
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

      // Check if the name contains a range pattern (e.g., a1-a5)
      const rangePattern = /^(.*?)(\d+)-(\d+)$/;
      const match = name.match(rangePattern);

      const tableNames = [];

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

          const longUrl = `https://hipal-test.hipalz.com/${businessInfo?.customLink}/explore?tableName=${tableName}`;

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
            tableId: nanoid(10),
            zoneId: zoneData.zoneId,
            pos: !!hipalZPos,
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

      const longUrl = `https://hipal-test.hipalz.com/${businessInfo?.customLink}/explore?tableName=${name}`;

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
        tableId: nanoid(10),
        zoneId: zoneData.zoneId,
        pos: !!hipalZPos,
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
        isDeleted: false,
        active: true,
        posName: {
          $ne: "HIPAL_Z",
        },
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

      const businessInfo =
        await Business.findById(businessId).select("customLink");

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

      await UrlModel.updateOne(
        {
          businessId,
          shortUrl: tableAlreadyActive?.tableLink,
        },
        {
          $set: {
            longUrl: `https://hipal-test.hipalz.com/${businessInfo?.customLink}/explore?tableName=${name}`,
          },
        },
        { session },
      );

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

      const businessPosConfig = await BusinessPosConfig.exists({
        businessId,
        isDeleted: false,
        active: true,
      });

      const tables = await Table.find({
        businessId,
        isDeleted: false,
        visibility: true,
        active: true,
        pos: !!businessPosConfig,
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

      const businessPosConfig = await BusinessPosConfig.exists({
        businessId,
        isDeleted: false,
        active: true,
      });

      const zones = await Zone.find({
        businessId,
        isDeleted: false,
        active: true,
        pos: !!businessPosConfig,
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
  )

  .get(
    "/zones/kitchen/:zoneId",
    zValidator(
      "param",
      z.object({
        zoneId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { zoneId } = c.req.param();
      const zone = await Zone.findOne({
        _id: zoneId,
        isDeleted: false,
      });
      if (!zone) {
        return respond(c, "Zone not found", true, 404, {});
      }

      const kitchenIds = zone.kitchenIds;

      const kitchens = await Kitchen.find({
        _id: { $in: kitchenIds },
      }).select("_id name");

      return respond(
        c,
        "Zone kitchen fetched successfully",
        false,
        200,
        kitchens,
      );
    },
  )

  .get(
    "/fetch_active_tables/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const businessPosConfig = await BusinessPosConfig.exists({
        businessId,
        isDeleted: false,
        active: true,
      });

      let totalTableAmount = 0;

      // Fetch zones
      const zones = await Zone.find({
        businessId,
        isDeleted: false,
        active: true,
        pos: !!businessPosConfig,
      });

      // Construct output array
      const outPut = await Promise.all(
        zones.map(async (zone) => {
          // Fetch tables for each zone
          const tables = await Table.find({
            businessId,
            zoneId: zone.zoneId,
            status: "ACTIVE",
            active: true,
          });

          // Construct tables array
          const tablesArray = tables.map((table) => {
            totalTableAmount += table.currentTableAmount || 0;
            return {
              tableName: table.name,
              currentTableAmount: table.currentTableAmount,
            };
          });

          return {
            zoneName: zone.name,
            tables: tablesArray,
          };
        }),
      );

      return c.json(
        {
          message: "Active tables fetched successfully",
          err: false,
          data: {
            totalTableAmount,
            zoneAndTables: outPut,
          },
        },
        200,
      );
    },
  );

export default zonesAndTablesRouter;
