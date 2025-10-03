import { DuesUser, NpcUser, UpiMode } from "@hi/db-models";
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
          data: {
            _id: createUpiMode._id,
          },
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
      "param",
      z.object({
        upiModeId: z.string().min(1).max(500),
      }),
    ),
    zValidator(
      "json",
      z.object({
        active: z.boolean().default(true).optional(),
      }),
    ),
    async (c) => {
      const { active } = await c.req.json();
      const { upiModeId } = c.req.param();

      const upiMode = await UpiMode.findByIdAndUpdate(
        upiModeId,
        {
          $set: {
            active: active,
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
    "/business/:businessId/all",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const duesUser = await DuesUser.findOne({
        businessId,
      });

      const npcUser = await NpcUser.findOne({
        businessId,
      });

      let upiModes = await UpiMode.find({
        businessId,
        active: true,
      });

      if (!npcUser) {
        upiModes = upiModes.filter((mode) => mode.name !== "npc");
      }

      if (!duesUser) {
        upiModes = upiModes.filter((mode) => mode.name !== "dues");
      }

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
    "/business/:businessId",
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
  );

export default upiModeRouter;
