import { Business, Menu, Table, UrlModel, Zone } from "@hi/db-models";
import {
  createTableSchema,
  updateTableSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { respond } from "../../../utils/response";
//

const tableRouter = new Hono()
  .post("/", zValidator("json", createTableSchema), async (c) => {
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

      const tables = await Table.find({
        businessId,
        isDeleted: false,
        visibility: true,
        active: true,
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
    "/:tableName/:businessId/menu",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
        tableName: z.string().min(1).max(30).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { tableName, businessId } = c.req.param();
        // Find the table by name and businessId
        const tableData = await Table.findOne({
          name: tableName,
          businessId,
        }).lean();

        if (!tableData) {
          const findDefaultZone = await Zone.findOne({
            businessId,
            name: "Default",
          });

          if (findDefaultZone) {
            const createTable = new Table({
              name: tableName,
              businessId,
              zoneId: findDefaultZone?._id,
              internalZoneId: findDefaultZone?._id,
              status: "EMPTY",
              date: Date.now(),
              visibility: true,
            });

            await createTable.save({ session });

            const updateZone = await Zone.findByIdAndUpdate(
              findDefaultZone?._id,
              {
                $push: {
                  tableIds: createTable._id,
                },
              },
              { session },
            );
          }
        }

        // Find the associated zone using either internalZoneId or zoneId
        const zone = await Zone.findOne({
          $or: [
            { _id: tableData?.internalZoneId, businessId },
            { zoneId: tableData?.zoneId, businessId },
          ],
        });

        const indianDate = new Date(
          new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        );

        let currentDay = indianDate.getDay();
        currentDay = currentDay === 0 ? 7 : currentDay;

        const currentTimeInMinutes =
          indianDate.getHours() * 60 + indianDate.getMinutes();

        // Find the active menu for the zone and business
        const menu = await Menu.findOne({
          zoneIds: zone?._id,
          businessId,
          isActive: true,
          $or: [
            {
              days: { $in: [currentDay] },
              startTime: { $lte: currentTimeInMinutes },
              endTime: { $gte: currentTimeInMinutes },
            },
            {
              days: { $in: [currentDay] },
              $expr: { $eq: ["$startTime", { $add: ["$endTime", 1] }] },
            },
          ],
        })
          .lean()
          .select(
            "menuType categoryLayout cardLayout primaryColor secondaryColor",
          );

        if (!menu) {
          const defaultMenuLayout = await Menu.findOne({
            businessId,
            isActive: true,
          }).select(
            "menuType categoryLayout cardLayout primaryColor secondaryColor",
          );

          return c.json(
            {
              message: "No active menu found for this zone",
              err: false,
              data: defaultMenuLayout,
            },
            200,
          );
        }

        return respond(c, "Menu fetched successfully", false, 200, menu);
      });
    },
  )

  .put(
    "/:tableId",
    zValidator("json", updateTableSchema),
    zValidator("param", z.object({ tableId: z.string().min(24).max(24) })),

    async (c) => {
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
        const { tableId } = c.req.param();

        const tableAlreadyActive = await Table.findById(tableId);

        if (tableAlreadyActive?.status === "ACTIVE") {
          return c.json(
            {
              message:
                "you can't update this table because this table is active",
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

        await UrlModel.updateOne(
          {
            businessId,
            shortUrl: tableAlreadyActive?.tableLink,
          },
          {
            $set: {
              longUrl: `https://hipal-test.hipalz.com/${businessId}/explore?tableName=${name}`,
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
    },
  );

export default tableRouter;
