import { Dish, Kitchen, Menu, PrinterConfig, Table, Zone } from "@hi/db-models";
import { KitchenAttrs, updateKitchenAttrs } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { addInTempMenuChanges } from "../../services/tempMenuChanges";
import { respond } from "../../utils/response";
//
//dates
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);
const roles = [
  "MANAGER",
  "CO_OWNER",
  "CAPTAIN",
  "MARKETING_AGENT",
  "RESTAURANT_OWNER",
];
const kitchenRouter = new Hono()
  .post("/", zValidator("json", KitchenAttrs), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { businessId, name, description, staffIds, dishIds, menuId } =
        await c.req.json();
      const updateName = name.trim().toLowerCase();

      const existingKitchen = await Kitchen.exists({
        name: updateName,
        businessId,
        menuId,
      }).session(session);

      if (existingKitchen) {
        return c.json(
          {
            message: "Kitchen Already Exists",
            data: {},
            err: true,
          },
          409,
        );
      }

      const menu = await Menu.findById(menuId);
      if (!menu) {
        return respond(c, "Menu not found", true, 404, {});
      }
      if (
        (menu.serviceType === "BASE" && dishIds?.length) ||
        staffIds?.length
      ) {
        return respond(c, "linking kitchen to menu not allowed", true, 400, {});
      }

      const allKitchens = await Kitchen.find({
        businessId,
        menuId,
        dishIds: {
          $in: dishIds,
        },
      });

      for (const kitchen of allKitchens) {
        await Kitchen.updateMany(
          { _id: kitchen._id },
          { $pull: { dishIds: { $in: dishIds } } },
          { session },
        );
      }

      const kitchen = new Kitchen({
        businessId,
        name: updateName,
        description,
        staffIds,
        dishIds,
        menuId,
      });

      await kitchen.save({ session });

      if (!kitchen) {
        return c.json(
          {
            message: "error",
            data: {},
            err: true,
          },
          400,
        );
      }

      if (menu.serviceType === "BASE") {
        await addInTempMenuChanges(
          "kitchen",
          kitchen._id.toString(),
          menu.businessId,
        );
      }

      await Dish.updateMany(
        { _id: { $in: dishIds } },
        { $set: { kitchenId: kitchen._id } },
      );

      return respond(c, "created successfully", false, 201, {
        _id: kitchen._id,
      });
    });
  })

  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(50),
        menuId: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, menuId } = c.req.query();

        // Scenario-1: “All” days

        const kitchens = await Kitchen.find({ businessId, menuId })
          .session(session)
          .lean()
          .select("name description staffIds dishIds");

        return respond(c, "fetched successfully", false, 200, kitchens);
      });
    },
  )
  .get(
    "/:kitchenId",
    zValidator(
      "param",
      z.object({
        kitchenId: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { kitchenId } = c.req.param();

        const kitchen = await Kitchen.findById(kitchenId)
          .session(session)
          .lean()
          .select("name description staffIds dishIds");

        if (!kitchen) {
          return c.json(
            {
              message: "Kitchen Not Found",
              data: {},
              err: true,
            },
            404,
          );
        }

        return respond(c, "fetch successfully", false, 200, kitchen);
      });
    },
  )
  .get(
    "/staff/:businessId/:staffId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(24).max(24),
        staffId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, staffId } = c.req.param();

        const kitchens = await Kitchen.find({
          businessId,
          staffIds: { $in: [staffId] },
        }).select("name");
        return respond(c, "fetched successfully", false, 200, kitchens);
      });
    },
  )

  .get(
    "/printer/kot",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        menuId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, menuId } = c.req.query();
        const printers = await PrinterConfig.find({
          businessId,
          menuId,
          kitchenId: { $ne: "BILL_PRINTER" },
        });

        return respond(c, "fetched successfully", false, 200, printers);
      });
    },
  )

  .get(
    "/printer/bill",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        menuId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId, menuId } = c.req.query();

        const printers = await PrinterConfig.find({
          kitchenId: "BILL_PRINTER",
          businessId,
          menuId,
        })
          .select("printerName zoneId zoneName menuId businessId kitchenId")
          .session(session);

        return respond(c, "fetched successfully", false, 200, printers);
      });
    },
  )

  .get(
    "/printer/kot/:kitchenId",
    zValidator(
      "param",
      z.object({
        kitchenId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { kitchenId } = c.req.param();
        const printer = await PrinterConfig.findOne({
          kitchenId,
        });

        if (!printer) {
          return c.json(
            {
              message: "Printer not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        return respond(c, "fetched successfully", false, 200, printer);
      });
    },
  )

  .get(
    "/printer/fetch_bill_printer/:tableName/:businessId",
    zValidator(
      "param",
      z.object({
        tableName: z.string().min(2).max(50),
        businessId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { tableName, businessId } = c.req.param();

        const tableInfo = await Table.findOne({
          name: tableName,
          businessId,
          pos: true,
          active: true,
        });

        if (!tableInfo) {
          return respond(c, "Table not found", true, 404, {});
        }

        const printer = await PrinterConfig.findOne({
          zoneId: tableInfo.zoneId,
          businessId,
        });

        if (!printer) {
          return c.json(
            {
              message: "Printer not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        return respond(c, "fetched successfully", false, 200, printer);
      });
    },
  )

  .put("/", zValidator("json", updateKitchenAttrs), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const {
        kitchenId,
        name,
        description,
        staffIds,
        dishIds,
        removeDishIds = [],
      } = await c.req.json();
      const updateName = name.trim().toLowerCase();

      const kitchenData = await Kitchen.findById(kitchenId);

      if (!kitchenData) {
        return respond(c, "Kitchen not found", true, 404, {});
      }

      const menu = await Menu.findById(kitchenData.menuId);
      if (!menu) {
        return respond(c, "Menu not found", true, 404, {});
      }
      if (
        (menu.serviceType === "BASE" && removeDishIds?.length) ||
        dishIds?.length ||
        staffIds?.length
      ) {
        return respond(c, "linking kitchen to menu not allowed", true, 400, {});
      }

      const allKitchens = await Kitchen.find({
        businessId: kitchenData.businessId,
        menuId: kitchenData.menuId,
        dishIds: {
          $in: dishIds,
        },
      });

      for (const kitchen of allKitchens) {
        await Kitchen.updateMany(
          { _id: kitchen._id },
          { $pull: { dishIds: { $in: dishIds } } },
          { session },
        );
      }

      const kitchen = await Kitchen.findByIdAndUpdate(
        kitchenId,
        {
          name: updateName,
          description,
          staffIds,
          dishIds,
        },
        { session },
      );

      if (!kitchen) {
        return c.json(
          {
            message: "Kitchen Not Found",
            data: {},
            err: true,
          },
          404,
        );
      }

      if (menu.serviceType === "BASE") {
        await addInTempMenuChanges(
          "kitchen",
          kitchen._id.toString(),
          menu.businessId,
        );
      }

      if (removeDishIds.length > 1) {
        await Dish.updateMany(
          { _id: { $in: removeDishIds } },
          { kitchenId: null },
        );
      }

      await Dish.updateMany(
        { _id: { $in: dishIds } },
        { $set: { kitchenId: kitchen._id } },
      );

      return respond(c, "updated successfully", false, 200, {
        _id: kitchen._id,
      });
    });
  })

  .post(
    "/printer/config",
    zValidator(
      "json",
      z.object({
        printers: z.array(
          z.object({
            kitchenId: z.string().min(2).max(50),
            printerName: z.string().min(2).max(100),
            businessId: z.string().min(2).max(50),
            menuId: z.string().min(2).max(50),
          }),
        ),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { printers } = await c.req.json();

        // Example processing logic
        for (const printer of printers) {
          const { kitchenId, printerName, businessId, menuId } = printer;

          await PrinterConfig.updateOne(
            { kitchenId, businessId, menuId },
            { $set: { printerName } },
            { upsert: true, session },
          );
        }

        return respond(c, "Printer config updated", false, 200, {});
      });
    },
  )

  .post(
    "/printer/bill_printer/config",
    zValidator(
      "json",
      z.object({
        printers: z.array(
          z.object({
            printerName: z.string().min(2).max(100),
            businessId: z.string().min(2).max(50),
            menuId: z.string().min(2).max(50),
            zoneId: z.string().min(2).max(50),
          }),
        ),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { printers } = await c.req.json();

        // Example processing logic
        for (const printer of printers) {
          const { printerName, businessId, menuId, zoneId } = printer;

          const zoneData = await Zone.findOne({
            zoneId: zoneId,
          });

          await PrinterConfig.updateOne(
            { zoneId, businessId, menuId },
            {
              $set: {
                printerName,
                kitchenId: "BILL_PRINTER",
                zoneName: zoneData?.name,
              },
            },
            { upsert: true, session },
          );
        }

        return respond(c, "Printer config updated", false, 200, {});
      });
    },
  );

export default kitchenRouter;
