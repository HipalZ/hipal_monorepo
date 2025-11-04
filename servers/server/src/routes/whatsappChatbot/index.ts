import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { WhatsappChatbotSchema } from "@hi/db-models/src/validators";
import { ChatbotSessionModel, WhatsappChatbotModel } from "@hi/db-models";
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

    const existingFlow = await WhatsappChatbotModel.findOne({
      chatbotName: chatbotName.trim().toLowerCase(),
      businessId,
    });

    if (existingFlow) {
      return c.json(
        { message: "Chatbot already exists", err: true, data: {} },
        409,
      );
    }

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

  .get("/", async (c) => {
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

  .get("/ping", (c) => c.text("Chatbot Flow API alive ✅"));

export default whatsAppChatbotRouter;
