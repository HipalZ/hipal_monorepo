import { Kitchen } from "@hi/db-models";
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
      const { businessId, name, description, staffIds, dishIds } =
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
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { businessId } = c.req.query();

        const kitchens = await Kitchen.find({ businessId })
          .session(session)
          .lean()
          .select("name description staffIds dishIds");

        return respond(c, "created successfully", false, 201, kitchens);
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

        return respond(c, "created successfully", false, 201, kitchen);
      });
    },
  )

  .put("/", zValidator("json", updateKitchenAttrs), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { kitchenId, name, description, staffIds, dishIds } =
        await c.req.json();
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

      return respond(c, "updated successfully", false, 200, {
        _id: kitchen._id,
      });
    });
  });

export default kitchenRouter;
