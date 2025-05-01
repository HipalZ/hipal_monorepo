import { Cart, HotelAlert } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const timePeriods = [
  { name: "Morning", start: 4, end: 10 },
  { name: "Afternoon", start: 10, end: 16 },
  { name: "Evening", start: 16, end: 22 },
  { name: "Night", start: 22, end: 28 },
];

const getTimePeriod = (timestamp: number) => {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const adjustedHour = hour < 4 ? hour + 24 : hour;

  for (const period of timePeriods) {
    if (adjustedHour >= period.start && adjustedHour < period.end) {
      return period.name;
    }
  }
  return null;
};
const hotelReportRouter = new Hono()
  .post(
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
  )
  .post(
    "/fetch_item_reports",
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

      // Validate and construct the query
      const query: any = { businessId };
      if (from || to) {
        query.date = {};
        if (from) query.date.$gte = from;
        if (to) query.date.$lte = to;
      }

      // Fetch carts with pagination
      const carts = await Cart.find(query)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const dishCounts = new Map<
        string,
        { id: string; name: string; count: number }
      >();
      const timePeriodData = new Map<
        string,
        Map<string, { id: string; name: string; count: number }>
      >();

      // Initialize time period data
      for (const period of timePeriods) {
        timePeriodData.set(period.name, new Map());
      }

      // Process carts to populate dishCounts and timePeriodData
      for (const cart of carts) {
        if (!cart.date) continue;
        const timePeriod = getTimePeriod(cart.date);
        if (!timePeriod) continue;

        for (const item of cart.cart) {
          const dishId = item.dish?._id?.toString();
          const dishName = item.dish?.name;

          if (dishId && dishName) {
            // Count dishes globally
            if (!dishCounts.has(dishId)) {
              dishCounts.set(dishId, { id: dishId, name: dishName, count: 0 });
            }
            dishCounts.get(dishId)!.count += item.quantity || 1;

            // Count dishes per time period
            const periodData = timePeriodData.get(timePeriod)!;
            if (!periodData.has(dishId)) {
              periodData.set(dishId, { id: dishId, name: dishName, count: 0 });
            }
            periodData.get(dishId)!.count += item.quantity || 1;
          }
        }
      }

      // Get top 10 dishes globally
      const topDishes = Array.from(dishCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Get top dish per time period
      const timeBasedAnalytics = Array.from(timePeriodData.entries()).map(
        ([timePeriod, dishes]) => {
          const topDish = Array.from(dishes.values()).sort(
            (a, b) => b.count - a.count,
          )[0];
          return {
            timePeriod,
            topDish: topDish || null,
          };
        },
      );

      const analytics = {
        topDishes,
        timeBasedAnalytics,
      };

      return respond(
        c,
        "Top selling dishes retrieved successfully",
        false,
        200,
        analytics,
      );
    },
  );

export default hotelReportRouter;
