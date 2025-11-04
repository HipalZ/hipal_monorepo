import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import whatsappChatbot from "@hi/db-models/src/models/whatsappChatbot/whatsappChatbot";
import { WhatsappChatbotSchema } from "@hi/db-models/src/validators";

export const whatsAppChatbotRouter = new Hono()
  .post("/", zValidator("json", WhatsappChatbotSchema), async (c) => {
    const {
      chatbotName,
      businessId,
      version,
      variables,
      triggers,
      nodes,
      description,
    } = await c.req.json();

    // ✅ Check for duplicates
    const existingFlow = await whatsappChatbot.findOne({
      chatbotName: chatbotName.trim().toLowerCase(),
      businessId,
    });

    if (existingFlow) {
      return c.json(
        {
          message: "Chatbot already exists",
          err: true,
          data: {},
        },
        409,
      );
    }

    // ✅ Create new chatbot flow
    const createFlow = await whatsappChatbot.create({
      chatbotName: chatbotName.trim(),
      businessId,
      version,
      variables,
      triggers,
      nodes,
      description,
      status: "active",
    });

    if (!createFlow) {
      return c.json(
        {
          message: "Chatbot not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "Chatbot flow created successfully",
        err: false,
        data: createFlow,
      },
      201,
    );
  })

  .get("/", async (c) => {
    const businessId = c.req.query("businessId");
    console.log("Fetching chatbots for business:", businessId);
    if (!businessId) {
      return c.json(
        {
          message: "businessId is required",
          err: true,
          data: {},
        },
        400,
      );
    }

    const flows = await whatsappChatbot
      .find({ businessId })
      .sort({ updatedAt: -1 });

    return c.json(
      {
        message: "Chatbots fetched successfully",
        err: false,
        data: flows,
      },
      200,
    );
  })

  // 🔵 Get one chatbot by ID
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const flow = await whatsappChatbot.findById(id);

    if (!flow) {
      return c.json(
        {
          message: "Chatbot not found",
          err: true,
          data: {},
        },
        404,
      );
    }

    return c.json(
      {
        message: "Chatbot fetched successfully",
        err: false,
        data: flow,
      },
      200,
    );
  });
whatsAppChatbotRouter.get("/ping", (c) => c.text("Chatbot Flow API alive ✅"));
