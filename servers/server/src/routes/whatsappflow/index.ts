import { WhatsAppFlow } from "@hi/db-models";
import {
  updateWhatsAppFlowSchema,
  whatsAppFlowSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const whatsAppFlowRouter = new Hono()
  .post("/", zValidator("json", whatsAppFlowSchema), async (c) => {
    const { name, businessId, flows, status, description } = await c.req.json();

    const existingWhatsAppFlow = await WhatsAppFlow.findOne({
      name: name.trim().toLowerCase(),
      businessId,
    });

    if (existingWhatsAppFlow) {
      return c.json(
        {
          message: "WhatsAppFlow already exist",
          err: true,
          data: {},
        },
        409,
      );
    }

    const createWhatsAppFlow = await WhatsAppFlow.create({
      name: name.trim().toLowerCase(),
      businessId,
      flows,
      status,
      description,
    });

    if (!createWhatsAppFlow) {
      return c.json(
        {
          message: "WhatsAppFlow not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "WhatsAppFlow created successfully",
        err: false,
        data: createWhatsAppFlow,
      },
      201,
    );
  })

  .put("/", zValidator("json", updateWhatsAppFlowSchema), async (c) => {
    const { name, businessId, flows, flowId, status, description } =
      await c.req.json();

    const existingWhatsAppFlow = await WhatsAppFlow.findOne({
      name: {
        $ne: name.trim().toLowerCase(),
      },
      businessId: {
        $ne: businessId,
      },
    });

    if (existingWhatsAppFlow) {
      return c.json(
        {
          message: "WhatsAppFlow already exist",
          err: true,
          data: {},
        },
        409,
      );
    }

    const updateWhatsAppFlow = await WhatsAppFlow.updateOne(
      {
        _id: flowId,
      },
      {
        name: name.trim().toLowerCase(),
        businessId,
        flows,
        status,
        description,
      },
    );

    if (!updateWhatsAppFlow) {
      return c.json(
        {
          message: "WhatsAppFlow not updated",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "WhatsAppFlow updated successfully",
        err: false,
        data: {},
      },
      200,
    );
  })

  .get(
    "/:businessId",
    zValidator("param", z.object({ businessId: z.string().min(1).max(100) })),
    async (c) => {
      const { businessId } = c.req.param();
      const whatsAppFlow = await WhatsAppFlow.find({
        businessId,
      });

      return c.json(
        {
          message: "WhatsAppFlow found",
          err: false,
          data: whatsAppFlow,
        },
        200,
      );
    },
  );

export default whatsAppFlowRouter;
