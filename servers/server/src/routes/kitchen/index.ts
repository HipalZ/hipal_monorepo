import { Dish, Kitchen, PrinterConfig } from "@hi/db-models";
import { KitchenAttrs, updateKitchenAttrs } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
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
          businessId,
          menuId,
          kitchenId: { $eq: "BILL_PRINTER" },
        });

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
    "/printer/fetch_bill/:kitchenId/:businessId",
    zValidator(
      "param",
      z.object({
        kitchenId: z.string().min(2).max(50),
        businessId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { kitchenId, businessId } = c.req.param();
        const printer = await PrinterConfig.findOne({
          kitchenId,
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
  );

export default kitchenRouter;
