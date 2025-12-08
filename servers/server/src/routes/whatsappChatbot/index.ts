import { ChatbotSessionModel, WhatsappChatbotModel } from "@hi/db-models";
import { WhatsappChatbotSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Types } from "mongoose";

const whatsAppChatbotRouter = new Hono()
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

    const cleanName = chatbotName.trim().toLowerCase();

    /* -----------------------------------------
     * 1️⃣ Check chatbot name uniqueness
     * ----------------------------------------- */
    const existingFlow = await WhatsappChatbotModel.findOne({
      chatbotName: cleanName,
      businessId,
    });

    if (existingFlow) {
      return c.json(
        {
          message: `Chatbot name "${chatbotName}" already exists`,
          err: true,
          data: {},
        },
        409,
      );
    }

    /* -----------------------------------------
     * 2️⃣ Extract all keywords in THIS chatbot
     * ----------------------------------------- */
    const allKeywords = (triggers || [])
      .flatMap((t) => t.keywords || [])
      .map((k) => k.trim().toLowerCase());

    // Find duplicates inside same payload
    const keywordCounts: Record<string, number> = {};
    for (const k of allKeywords) {
      keywordCounts[k] = (keywordCounts[k] || 0) + 1;
    }

    const internalDuplicates = Object.entries(keywordCounts)
      .filter(([_, v]) => v > 1)
      .map(([k]) => k);

    if (internalDuplicates.length > 0) {
      return c.json(
        {
          message: `Duplicate trigger keyword(s): ${internalDuplicates.join(
            ", ",
          )}`,
          err: true,
          data: {},
        },
        409,
      );
    }

    /* -----------------------------------------
     * 3️⃣ Check if any keyword exists in OTHER chatbots
     * ----------------------------------------- */
    if (allKeywords.length > 0) {
      const otherBot = await WhatsappChatbotModel.findOne({
        businessId,
        chatbotName: { $ne: cleanName },
        "triggers.keywords": { $in: allKeywords },
      });

      if (otherBot) {
        const usedKeyword = otherBot.triggers
          .flatMap((t) => t.keywords)
          .find((k) => allKeywords.includes(k.toLowerCase()));

        return c.json(
          {
            message: `Trigger keyword "${usedKeyword}" already exists in chatbot: "${otherBot.chatbotName}"`,
            err: true,
            data: {},
          },
          409,
        );
      }
    }

    /* -----------------------------------------
     * 4️⃣ Create chatbot flow
     * ----------------------------------------- */
    const createFlow = await WhatsappChatbotModel.create({
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
        { message: "Chatbot not created", err: true, data: {} },
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

  .put(
    "/:chatbotId",
    zValidator("json", WhatsappChatbotSchema.partial()),
    async (c) => {
      try {
        const chatbotId = c.req.param("chatbotId");
        const body = await c.req.json();

        const {
          chatbotName,
          businessId,
          version,
          variables,
          triggers,
          nodes,
          description,
        } = body;

        if (!chatbotId) {
          return c.json(
            { message: "chatbotId is required", err: true, data: {} },
            400,
          );
        }

        if (!businessId) {
          return c.json(
            { message: "businessId is required", err: true, data: {} },
            400,
          );
        }

        // 1️⃣ Check if chatbot exists
        const existing = await WhatsappChatbotModel.findOne({
          _id: chatbotId,
          businessId,
        });

        if (!existing) {
          return c.json(
            {
              message: "Chatbot not found or does not belong to this business",
              err: true,
              data: {},
            },
            404,
          );
        }

        // 2️⃣ Prevent duplicate names under the same business (for other chatbots)
        if (chatbotName) {
          const duplicate = await WhatsappChatbotModel.findOne({
            _id: { $ne: chatbotId },
            businessId,
            chatbotName: chatbotName.trim().toLowerCase(),
          });

          if (duplicate) {
            return c.json(
              {
                message: "Another chatbot with same name exists",
                err: true,
                data: {},
              },
              409,
            );
          }
        }

        // 3️⃣ Update chatbot
        existing.chatbotName = chatbotName?.trim() || existing.chatbotName;
        existing.version = version ?? existing.version;
        existing.variables = variables ?? existing.variables;
        existing.triggers = triggers ?? existing.triggers;
        existing.nodes = nodes ?? existing.nodes;
        existing.description = description ?? existing.description;

        await existing.save();

        return c.json(
          {
            message: "Chatbot updated successfully",
            err: false,
            data: existing,
          },
          200,
        );
      } catch (err: any) {
        console.error("PUT /chatbot error:", err);
        return c.json(
          {
            message: err.message || "Something went wrong",
            err: true,
            data: {},
          },
          500,
        );
      }
    },
  )

  .get("/allchatbots", async (c) => {
    const businessId = c.req.query("businessId");
    if (!businessId) {
      return c.json(
        { message: "businessId is required", err: true, data: {} },
        400,
      );
    }

    // 1️⃣ Get all chatbots for this business
    const bots = await WhatsappChatbotModel.find({ businessId }).sort({
      updatedAt: -1,
    });

    if (!bots.length) {
      return c.json(
        { message: "No chatbots found", err: false, data: [] },
        200,
      );
    }

    const botIds = bots.map((b) => new Types.ObjectId(b._id));

    const sessionStats = await ChatbotSessionModel.aggregate([
      { $match: { chatbotId: { $in: botIds } } },
      {
        $group: {
          _id: "$chatbotId",
          totalSessions: { $sum: 1 },
          completedSessions: { $sum: { $cond: ["$completed", 1, 0] } },
          dropOffSessions: {
            $sum: { $cond: [{ $eq: ["$completed", false] }, 1, 0] },
          },
          avgSessionTime: {
            $avg: {
              $cond: [
                { $and: ["$startTime", "$endTime"] },
                { $subtract: ["$endTime", "$startTime"] },
                null,
              ],
            },
          },
          uniqueUsers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          totalSessions: 1,
          completedSessions: 1,
          dropOffSessions: 1,
          avgSessionTimeMinutes: { $divide: ["$avgSessionTime", 1000 * 60] },
          uniqueUsersCount: { $size: "$uniqueUsers" },
        },
      },
    ]);

    // 3️⃣ Merge stats with bot data
    const botsWithStats = bots.map((bot) => {
      const s =
        sessionStats.find((stat) => String(stat._id) === String(bot._id)) || {};
      const total = s.totalSessions || 0;
      const completed = s.completedSessions || 0;
      const dropOff = s.dropOffSessions || 0;
      const avgRate =
        total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
      const avgTime = s.avgSessionTimeMinutes
        ? s.avgSessionTimeMinutes.toFixed(1)
        : "0.0";
      const uniqueUsers = s.uniqueUsersCount || 0;

      return {
        _id: bot._id,
        chatbotName: bot.chatbotName,
        version: bot.version,
        businessId: bot.businessId,
        status: bot.status,
        createdAt: bot.createdAt,
        updatedAt: bot.updatedAt,
        stats: {
          totalSessions: total,
          completedSessions: completed,
          dropOffSessions: dropOff,
          avgCompletionRate: avgRate,
          avgSessionTimeMinutes: avgTime,
          uniqueUsers,
        },
        isDefault: bot.isDefault,
      };
    });

    return c.json(
      {
        message: "Chatbots fetched successfully",
        err: false,
        data: botsWithStats,
      },
      200,
    );
  })

  .get("/Id/:chatbotId", async (c) => {
    try {
      const chatbotId = c.req.param("chatbotId");
      const businessId = c.req.query("businessId");

      if (!chatbotId) {
        return c.json(
          { message: "chatbotId is required", err: true, data: {} },
          400,
        );
      }

      if (!businessId) {
        return c.json(
          { message: "businessId is required", err: true, data: {} },
          400,
        );
      }

      // 1️⃣ Find chatbot and ensure it belongs to this business
      const chatbot = await WhatsappChatbotModel.findOne({
        _id: chatbotId,
        businessId,
      });

      if (!chatbot) {
        return c.json(
          {
            message: "Chatbot not found or does not belong to this business",
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
          data: chatbot,
        },
        200,
      );
    } catch (err: any) {
      console.error("GET /:chatbotId error:", err);
      return c.json(
        {
          message: err.message || "Something went wrong",
          err: true,
          data: {},
        },
        500,
      );
    }
  })

  .put("/status/:chatbotId", async (c) => {
    try {
      const chatbotId = c.req.param("chatbotId");
      const { businessId, status } = await c.req.json();

      if (!chatbotId) {
        return c.json(
          { message: "chatbotId is required", err: true, data: {} },
          400,
        );
      }

      if (!businessId) {
        return c.json(
          { message: "businessId is required", err: true, data: {} },
          400,
        );
      }

      if (!["active", "inactive"].includes(status)) {
        return c.json(
          {
            message: "Status must be either 'active' or 'inactive'",
            err: true,
          },
          400,
        );
      }

      // Ensure chatbot exists
      const chatbot = await WhatsappChatbotModel.findOne({
        _id: chatbotId,
        businessId,
      });

      if (!chatbot) {
        return c.json(
          { message: "Chatbot not found", err: true, data: {} },
          404,
        );
      }

      // ⚡ Update status WITHOUT touching updatedAt
      await WhatsappChatbotModel.updateOne(
        { _id: chatbotId, businessId },
        { $set: { status } },
        { timestamps: false },
      );

      return c.json(
        {
          message: `Chatbot status updated to "${status}"`,
          err: false,
          data: { _id: chatbotId, status },
        },
        200,
      );
    } catch (err) {
      console.error("Toggle chatbot status error:", err);
      return c.json(
        { message: err.message || "Something went wrong", err: true },
        500,
      );
    }
  });

export default whatsAppChatbotRouter;
