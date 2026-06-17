import { Cart, DeviceToken } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { sendPushToTokens } from "../../services/notifications";
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
//
const cartRouter = new Hono()
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const cart = await Cart.findById(id);
      if (!cart) {
        return respond(c, "cart not found", true, 404, {});
      }
      return respond(c, "cart retrieved successfully", false, 200, cart);
    },
  )
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const carts = await Cart.find({ businessId, isArchived: false }).populate(
        {
          path: "userId",
          select: "name phone",
        },
      );

      return respond(c, "carts retrieved successfully", false, 200, carts);
    },
  )
  .get(
    "/cartByUser/:userId",
    zValidator(
      "param",
      z.object({
        userId: z.string(),
      }),
    ),
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        tableName: z.string(),
      }),
    ),
    async (c) => {
      const { userId } = c.req.param();
      const { businessId, tableName } = c.req.query();

      const carts = await Cart.find({
        businessId,
        tableName,
        userId,
        isArchived: false,
      }).populate({
        path: "userId",
        select: "name phone",
      });

      if (carts.length === 0) {
        return respond(c, "no carts found", true, 404, []);
      }

      return respond(c, "carts retrieved successfully", false, 200, carts);
    },
  )
  .get(
    "/userAnalytics/:userId",
    zValidator(
      "param",
      z.object({
        userId: z.string(),
      }),
    ),
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { userId } = c.req.param();
      const { businessId } = c.req.query();

      const carts = await Cart.find({
        businessId,
        userId,
      }).populate({
        path: "userId",
        select: "name phone",
      });

      if (carts.length === 0) {
        return respond(c, "no carts found", true, 404, []);
      }

      return respond(c, "carts retrieved successfully", false, 200, carts);
    },
  )
  .get(
    "/:businessId/user",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const carts = await Cart.find({ businessId }).populate({
        path: "userId",
        select: "name phone",
      });

      if (!carts || carts.length === 0) {
        return respond(c, "No carts found", true, 404, []);
      }

      const users = carts.map((cart) => cart.userId).filter((user) => user);

      const uniqueUsers = Array.from(
        new Map(users.map((user) => [user._id.toString(), user])).values(),
      );

      return respond(
        c,
        "Users retrieved successfully",
        false,
        200,
        uniqueUsers,
      );
    },
  )
  .get(
    ":businessId/analytics",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const carts = await Cart.find({ businessId });

      if (!carts || carts.length === 0) {
        return respond(c, "No carts found", true, 404, []);
      }

      const dishCounts = {};
      const timePeriodData = timePeriods.reduce((acc, period) => {
        acc[period.name] = {};
        return acc;
      }, {});

      // Process carts to populate dishCounts and timePeriodData
      carts.forEach((cart) => {
        const timePeriod = getTimePeriod(cart.date);
        if (!timePeriod) return;

        cart.cart.forEach((item) => {
          const dishId = item.dish?._id;
          const dishName = item.dish?.name;

          if (dishId && dishName) {
            // Count dishes globally
            if (!dishCounts[dishId]) {
              dishCounts[dishId] = { id: dishId, name: dishName, count: 0 };
            }
            dishCounts[dishId].count += 1;

            // Count dishes per time period
            if (!timePeriodData[timePeriod][dishId]) {
              timePeriodData[timePeriod][dishId] = {
                id: dishId,
                name: dishName,
                count: 0,
              };
            }
            timePeriodData[timePeriod][dishId].count += 1;
          }
        });
      });

      // Get top 10 dishes globally
      const topDishes = Object.values(dishCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      // Get top dish per time period
      const timeBasedAnalytics = Object.entries(timePeriodData).map(
        ([timePeriod, dishes]) => {
          const topDish = Object.values(dishes).sort(
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
  )
  .post(
    "/create",

    async (c) => {
      const body = await c.req.json();
      const createCart = await Cart.create({
        ...body,
        date: Date.now(),
        createdAt: Date.now(),
      });
      if (!createCart) {
        return respond(c, "cart creation failed", true, 400, {});
      }
      const registrationToken = await DeviceToken.find({
        businessId: body.businessId,
        notification: true,
      });

      if (registrationToken.length > 0) {
        console.log("[cart:create:push:queue]", {
          businessId: body.businessId,
          tableName: body.tableName || "",
          tokenCount: registrationToken.length,
          title: "Shared cart request",
          type: "CART_ORDER_ALERT",
        });

        const pushResults = await sendPushToTokens(registrationToken, {
          title: "Shared cart request",
          body: `${body.tableName?.slice(-2)} `,
          data: {
            type: "CART_ORDER_ALERT",
            businessId: body.businessId,
            tableName: body.tableName || "",
          },
        });

        console.log("[cart:create:push:done]", {
          businessId: body.businessId,
          tableName: body.tableName || "",
          successCount: pushResults.filter((result) => result.success).length,
          failedCount: pushResults.filter((result) => !result.success).length,
        });
      }

      return respond(c, "cart created successfully", false, 201, {
        cartID: createCart._id,
      });
    },
  )
  .put(
    "/archive/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const cart = await Cart.findById(id);

      if (!cart) {
        return respond(c, "cart not found", true, 404, {});
      }

      cart.isArchived = true;
      await cart.save();

      return respond(c, "cart archived successfully", false, 200, {
        cartID: cart._id,
      });
    },
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const deletedCart = await Cart.findByIdAndDelete(id);

      if (!deletedCart) {
        return respond(c, "cart not found or already deleted", true, 404, {});
      }

      return respond(c, "cart deleted successfully", false, 200, {
        cartID: deletedCart._id,
      });
    },
  );

export default cartRouter;
