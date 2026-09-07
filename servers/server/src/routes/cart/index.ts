import { Cart, DeviceToken } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import type { Worksheet } from "exceljs";
import { Hono } from "hono";
import { z } from "zod";
import { sendPushToTokens } from "../../services/notifications";
import {
  addBoldHeaderRow,
  addKeyValueRow,
  autoFitColumns,
  createReportWorkbook,
} from "../../utils/reportHelper/excelUtils";
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

type AnalyticsCartItem = {
  dish?: {
    _id?: string | { toString(): string };
    name?: string;
    price?: number;
  } | null;
  portion?: {
    name?: string;
    price?: number;
  } | null;
  quantity?: number;
};

type ItemAnalyticsRow = {
  id: string;
  name: string;
  orderCount: number;
  quantity: number;
  estimatedSales: number;
  timePeriods: Record<string, number>;
};

type AnalyticsDishCount = {
  id: string;
  name: string;
  count: number;
};

const toItemId = (id: unknown) => {
  if (typeof id === "string") return id;
  if (id && typeof (id as { toString(): string }).toString === "function") {
    return (id as { toString(): string }).toString();
  }
  return "";
};

const getItemUnitPrice = (item: AnalyticsCartItem) => {
  const portionPrice =
    typeof item.portion?.price === "number" ? item.portion.price : undefined;
  const dishPrice =
    typeof item.dish?.price === "number" ? item.dish.price : undefined;
  return portionPrice ?? dishPrice ?? 0;
};

const buildItemAnalyticsRows = (
  carts: { date?: number; cart?: AnalyticsCartItem[] }[],
) => {
  const itemMap: Record<string, ItemAnalyticsRow> = {};

  for (const cart of carts) {
    const timePeriod =
      typeof cart.date === "number" ? getTimePeriod(cart.date) : null;

    for (const item of cart.cart ?? []) {
      const id = toItemId(item.dish?._id);
      const name = item.dish?.name;
      if (!id || !name) continue;

      const quantity = Math.max(Number(item.quantity ?? 1), 1);
      if (!itemMap[id]) {
        itemMap[id] = {
          id,
          name,
          orderCount: 0,
          quantity: 0,
          estimatedSales: 0,
          timePeriods: {},
        };
      }

      itemMap[id].orderCount += 1;
      itemMap[id].quantity += quantity;
      itemMap[id].estimatedSales += getItemUnitPrice(item) * quantity;

      if (timePeriod) {
        itemMap[id].timePeriods[timePeriod] =
          (itemMap[id].timePeriods[timePeriod] ?? 0) + quantity;
      }
    }
  }

  return Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);
};

const addRecommendationRows = (
  sheet: Worksheet,
  rows: ItemAnalyticsRow[],
) => {
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const totalSales = rows.reduce((sum, row) => sum + row.estimatedSales, 0);
  const bySales = [...rows].sort((a, b) => b.estimatedSales - a.estimatedSales);

  addBoldHeaderRow(sheet, [
    "Rank",
    "Item",
    "Orders",
    "Quantity",
    "Estimated Sales",
    "Share",
    "Recommendation",
  ]);

  rows.slice(0, 10).forEach((row, index) => {
    const isTopSeller = index === 0;
    const isRevenueDriver = bySales[0]?.id === row.id;
    const share = totalQuantity
      ? `${((row.quantity / totalQuantity) * 100).toFixed(1)}%`
      : "0%";
    const label = isTopSeller
      ? "Top seller"
      : isRevenueDriver
        ? "Revenue driver"
        : row.quantity <= 2
          ? "Low movement"
          : "Popular item";

    sheet.addRow([
      index + 1,
      row.name,
      row.orderCount,
      row.quantity,
      row.estimatedSales,
      share,
      label,
    ]);
  });

  sheet.addRow([]);
  addKeyValueRow(sheet, "Total Quantity", totalQuantity);
  addKeyValueRow(sheet, "Estimated Sales", totalSales);
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

      const users = carts.flatMap((cart) => {
        const user = cart.userId as unknown as
          | { _id?: { toString(): string } }
          | null
          | undefined;
        return user?._id ? [user as { _id: { toString(): string } }] : [];
      });

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

      const dishCounts: Record<string, AnalyticsDishCount> = {};
      const timePeriodData = timePeriods.reduce<
        Record<string, Record<string, AnalyticsDishCount>>
      >((acc, period) => {
        acc[period.name] = {};
        return acc;
      }, {});

      // Process carts to populate dishCounts and timePeriodData
      carts.forEach((cart) => {
        const timePeriod = getTimePeriod(cart.date);
        if (!timePeriod) return;

        cart.cart.forEach((item) => {
          const dishId = toItemId(item.dish?._id);
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
  .get(
    "/:businessId/analytics/download_xlsx",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const carts = (await Cart.find({ businessId }).lean()) as {
        date?: number;
        cart?: AnalyticsCartItem[];
      }[];

      const rows = buildItemAnalyticsRows(carts);
      const { workbook } = createReportWorkbook();

      const recommendationsSheet = workbook.addWorksheet("Top Recommendations");
      addKeyValueRow(recommendationsSheet, "BusinessId", businessId);
      addKeyValueRow(
        recommendationsSheet,
        "Generated At",
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      );
      recommendationsSheet.addRow([]);

      if (rows.length === 0) {
        recommendationsSheet.addRow(["No item analytics available"]);
      } else {
        addRecommendationRows(recommendationsSheet, rows);
      }
      autoFitColumns(recommendationsSheet);

      const detailsSheet = workbook.addWorksheet("Item Details");
      addBoldHeaderRow(detailsSheet, [
        "Item",
        "Orders",
        "Quantity",
        "Estimated Sales",
        "Average Quantity Per Order",
      ]);
      for (const row of rows) {
        detailsSheet.addRow([
          row.name,
          row.orderCount,
          row.quantity,
          row.estimatedSales,
          row.orderCount ? Number((row.quantity / row.orderCount).toFixed(2)) : 0,
        ]);
      }
      autoFitColumns(detailsSheet);

      const timeSheet = workbook.addWorksheet("Time Based Analytics");
      addBoldHeaderRow(timeSheet, [
        "Time Period",
        "Top Item",
        "Quantity",
      ]);
      for (const period of timePeriods) {
        const topItem = [...rows].sort(
          (a, b) =>
            (b.timePeriods[period.name] ?? 0) -
            (a.timePeriods[period.name] ?? 0),
        )[0];
        const quantity = topItem?.timePeriods[period.name] ?? 0;
        timeSheet.addRow([
          period.name,
          quantity > 0 ? topItem.name : "No data",
          quantity,
        ]);
      }
      autoFitColumns(timeSheet);

      const filename = `Item Analytics ${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();

      c.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
      );
      c.header(
        "Content-Disposition",
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
          filename,
        )}`,
      );

      return c.body(buffer);
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
