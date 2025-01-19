import { Business, UpiMode } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const upiModeRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(500),
        name: z.string().min(1).max(100),
      }),
    ),
    async (c) => {
      const { businessId, name } = await c.req.json();

      console.log("name", name);

      const existingUpiMode = await UpiMode.findOne({
        name: name.trim().toLowerCase(),
        businessId,
      });

      if (existingUpiMode) {
        return c.json(
          {
            message: "UpiMode already exist",
            err: true,
            data: {},
          },
          409,
        );
      }

      const createUpiMode = await UpiMode.create({
        name: name.trim().toLowerCase(),
        businessId,
      });

      if (!createUpiMode) {
        return c.json(
          {
            message: "UpiMode not created",
            err: true,
            data: {},
          },
          400,
        );
      }

      return c.json(
        {
          message: "UpiMode created successfully",
          err: false,
          data: createUpiMode,
        },
        201,
      );
    },
  )
  .get(
    "/:upiModeId",
    zValidator(
      "param",
      z.object({
        upiModeId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { upiModeId } = c.req.param();
      const upiMode = await UpiMode.findOne({
        _id: upiModeId,
        active: true,
      });

      if (!upiMode) {
        return c.json(
          {
            message: "UpiMode not found",
            err: true,
            data: null,
          },
          404,
        );
      }

      return c.json(
        {
          message: "UpiMode fetched successfully",
          err: false,
          data: upiMode,
        },
        200,
      );
    },
  )
  .put(
    "/:upiModeId",
    zValidator(
      "json",
      z.object({
        upiModeId: z.string().min(1).max(500),
        name: z.string().min(1).max(100),
        active: z.boolean().default(true).optional(),
      }),
    ),
    async (c) => {
      const { upiModeId, name, active } = await c.req.json();

      const upiMode = await UpiMode.findByIdAndUpdate(
        upiModeId,
        {
          $set: {
            active: active,
            name: name.trim().toLowerCase(),
          },
        },
        {
          new: true, // Return the updated document
        },
      );

      if (!upiMode) {
        return c.json(
          {
            message: "UpiMode not updated",
            err: true,
            data: null,
          },
          400,
        );
      }

      return c.json(
        {
          message: "UpiMode updated successfully",
          err: false,
          data: upiMode,
        },
        200,
      );
    },
  )
  .get(
    "/all/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const upiModes = await UpiMode.find({
        businessId,
        active: true,
      });

      return c.json(
        {
          message: "UpiModes fetched successfully",
          err: false,
          data: upiModes,
        },
        200,
      );
    },
  )

  .get(
    "/bulk_mode/upload",

    async (c) => {
      const modes = [
        {
          name: "upi",
          active: true,
        },
        {
          name: "cash",
          active: true,
        },
        {
          name: "card",
          active: true,
        },
        {
          name: "npc",
          active: true,
        },

        {
          name: "zomatopay",
          active: true,
        },
        {
          name: "swiggypay",
          active: true,
        },
      ];
      const businesses = await Business.find({});

      for (const business of businesses) {
        for (const mode of modes) {
          const existingUpiMode = await UpiMode.findOne({
            name: mode.name,
            businessId: business._id,
          });

          if (!existingUpiMode) {
            await UpiMode.create({
              name: mode.name,
              businessId: business._id,
              active: mode.active,
            });
          }
        }
      }

      return c.json(
        {
          message: "Bulk UpiMode created successfully",
          err: false,
          data: {},
        },
        201,
      );
    },
  );

export default upiModeRouter;
