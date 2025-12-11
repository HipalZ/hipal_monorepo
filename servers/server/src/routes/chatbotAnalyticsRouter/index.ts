import { ChatbotAnalyticsModel, ChatbotSessionModel } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ChatbotAnalyticsFilterSchema } from "@hi/db-models/src/validators/whatsappChatbot/chatbotAnalytics";

const chatbotAnalyticsRouter = new Hono()

  .get(
    "/:chatbotId/summary",
    zValidator("param", ChatbotAnalyticsFilterSchema.pick({ chatbotId: true })),
    async (c) => {
      const { chatbotId } = c.req.valid("param");

      const analytics = await ChatbotAnalyticsModel.findOne({ chatbotId });
      if (!analytics) {
        return c.json(
          { err: true, message: "No analytics found", data: {} },
          404,
        );
      }

      return c.json({
        err: false,
        message: "Chatbot analytics summary",
        data: analytics,
      });
    },
  )

  .get(
    "/:chatbotId/sessions",
    zValidator("param", ChatbotAnalyticsFilterSchema.pick({ chatbotId: true })),
    async (c) => {
      const { chatbotId } = c.req.valid("param");

      const sessions = await ChatbotSessionModel.find({ chatbotId })
        .select(
          "userId userName phone completed startTime endTime sessionDurationMs droppedAtNode",
        )
        .sort({ startTime: -1 })
        .limit(100)
        .lean();

      return c.json({
        err: false,
        message: "Chatbot session list fetched",
        data: sessions,
      });
    },
  );

export default chatbotAnalyticsRouter;
