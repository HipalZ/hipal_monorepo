import { HotelAlert } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const hotelReportRouter = new Hono().post(
  "/fetch_escalated_reports",
  zValidator(
    "json",
    z.object({
      businessId: z.string(),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      from: z.number().optional(),
      to: z.number().optional(),
    }),
  ),

  async (c) => {
    const requestData = await c.req.json();
    const { businessId, page, limit, from, to } = requestData;
    const escalatedReports = await HotelAlert.find({
      businessId,
      isEscalated: true,
      createdAt: {
        $gte: from ? from : 0,
        $lte: to ? to : Date.now(),
      },
    })
      .populate("roomId", "_id name")
      .populate("userId", "_id name phone")
      .populate("serviceIds", "_id name")
      .populate("createdBy", "_id name phone")

      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return respond(c, "All escalated reports", false, 200, escalatedReports);
  },
);

export default hotelReportRouter;
