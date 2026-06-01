import { DeviceToken, HotelRoom } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { sendPushToTokens } from "../../services/notifications";
import { respond } from "../../utils/response";

const notificationRouter = new Hono()
  .post(
    "/test",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50).optional(),
        title: z.string().min(1).max(120).default("Push test"),
        body: z.string().min(1).max(240).default("Backend test notification"),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const query: Record<string, unknown> = {
        businessId: requestData.businessId,
        notification: true,
      };
      if (requestData.userId) {
        query.userId = requestData.userId;
      }

      const tokens = await DeviceToken.find(query).lean();
      const results = await sendPushToTokens(tokens, {
        title: requestData.title,
        body: requestData.body,
        data: {
          type: "MVP_PUSH_TEST",
          businessId: requestData.businessId,
          userId: requestData.userId || "",
        },
      });

      return respond(c, "Push test completed", false, 200, {
        tokenCount: tokens.length,
        successCount: results.filter((result) => result.success).length,
        failureCount: results.filter((result) => !result.success).length,
        results,
      });
    },
  )
  .post(
    "/service-request-test",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(2).max(50),
        roomId: z.string().min(2).max(50).optional(),
        userId: z.string().min(2).max(50).optional(),
        serviceName: z.string().min(1).max(80).default("Test service"),
        roomName: z.string().min(1).max(80).default("MVP Room"),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      let roomName = requestData.roomName;
      let staffIds: string[] = [];

      if (requestData.roomId) {
        const room = await HotelRoom.findById(requestData.roomId)
          .select("name staffIds")
          .lean();
        if (room) {
          roomName = room.name || roomName;
          staffIds = (room.staffIds || []).map((id) => id.toString());
        }
      }

      const query: Record<string, unknown> = {
        businessId: requestData.businessId,
        notification: true,
      };
      if (requestData.userId) {
        query.userId = requestData.userId;
      } else if (staffIds.length > 0) {
        query.userId = { $in: staffIds };
      }

      const tokens = await DeviceToken.find(query).lean();
      const results = await sendPushToTokens(tokens, {
        title: "Room Attention Required",
        body: `${roomName} requires your attention for ${requestData.serviceName}. kindly respond to the alert!`,
        data: {
          type: "MVP_SERVICE_REQUEST",
          businessId: requestData.businessId,
          roomId: requestData.roomId || "",
          serviceName: requestData.serviceName,
        },
      });

      return respond(c, "Service request push test completed", false, 200, {
        tokenCount: tokens.length,
        successCount: results.filter((result) => result.success).length,
        failureCount: results.filter((result) => !result.success).length,
        results,
      });
    },
  );

export default notificationRouter;

