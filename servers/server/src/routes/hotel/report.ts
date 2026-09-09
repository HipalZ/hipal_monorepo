import { Business, Cart, HotelAlert, HotelAnalytics, HotelRoomChat, OutLetInfo, Reviews } from '@hi/db-models';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { Types } from 'mongoose';
import { z } from 'zod';
import { syncHotelCompanionReadModel } from '../../services/hotelCompanions';
import {
  addBoldHeaderRow,
  addKeyValueRow,
  autoFitColumns,
  createReportWorkbook,
} from '../../utils/reportHelper/excelUtils';
import { respond } from '../../utils/response';

// ─── Guest Experience CSV helpers ──────────────────────────────────────────
// Bound on what the server will emit in one call. 92 days (~3 months) matches
// the client-side MAX_REPORT_MONTHS check; we enforce it here too so the
// endpoint can't be abused with a "from=0, to=now" range.
const MAX_REPORT_RANGE_MS = 92 * 24 * 60 * 60 * 1000;
const CSV_BATCH_FLUSH = 500;
const FOOD_ORDER_ACCEPTANCE_FALLBACK_MINS = 0.5;
const FOOD_ORDER_FULFILLMENT_FALLBACK_MINS = 30;

type FoodOrderSlaSettings = {
  avgAcceptanceTime: number;
  avgDeliveryTime: number;
  useItemPrepTime: boolean;
  effectiveFulfillmentTime?: number;
  capturedAt?: number;
};

const normalizeFoodOrderSlaSettings = (settings?: Partial<FoodOrderSlaSettings> | null): FoodOrderSlaSettings => ({
  avgAcceptanceTime: Number(settings?.avgAcceptanceTime) > 0 ? Number(settings?.avgAcceptanceTime) : FOOD_ORDER_ACCEPTANCE_FALLBACK_MINS,
  avgDeliveryTime: Number(settings?.avgDeliveryTime) > 0 ? Number(settings?.avgDeliveryTime) : FOOD_ORDER_FULFILLMENT_FALLBACK_MINS,
  useItemPrepTime: settings?.useItemPrepTime !== false,
});

const CSV_HEADERS = [
  "Guest Name",
  "Guest Phone",
  "Room No",
  "Visit Count Till Date",
  "Booking Source",
  "Check-In Date Time",
  "Check-Out Date Time",
  "Companions",
  "Companion Count",
  "Record Type",
  "Service Requested",
  "Quantity",
  "Order Items",
  "Requested At",
  "Accepted By Staff",
  "Accepted At",
  "Completed By Staff",
  "Completed At",
  "Acceptance Time",
  "Fulfillment Time",
  "Total Time",
  "Standard Acceptance Time",
  "Fulfillment SLA",
  "Total Standard SLA",
  "Total Actual Time",
  "SLA Performance",
  "Escalated",
  "Escalation Level",
  "Crossed Escalation SLA",
  "Service Rating",
  "Review Feedback",
  "Reviewed At",
] as const;

const escapeCsvCell = (value: unknown): string => {
  const str = value === undefined || value === null ? "" : String(value);
  if (
    str.includes('"') ||
    str.includes(",") ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getOrdinalDay = (day: number) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

const formatDateTime = (timestamp?: number | null) => {
  if (!timestamp) return "";
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(timestamp));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const day = Number(get("day"));
  return `${getOrdinalDay(day)} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} ${get("dayPeriod").toUpperCase()}`;
};

const formatFilenameDate = (timestamp?: number) => {
  if (!timestamp) return "unknown-date";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};

const formatDurationMinutes = (minutes?: number | null) => {
  if (minutes === undefined || minutes === null || !Number.isFinite(minutes)) {
    return "";
  }
  const totalSeconds = Math.max(0, Math.round(minutes * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} hr ${mins} min`;
  if (mins > 0) return seconds > 0 ? `${mins} min ${seconds} sec` : `${mins} min`;
  return `${seconds} sec`;
};

const getDurationLabel = (from?: number | null, to?: number | null) => {
  if (!from || !to || to < from) return "";
  return formatDurationMinutes((to - from) / 60_000);
};

const isSlaLate = (actual?: number | null, sla?: number | null) =>
  actual !== undefined &&
  actual !== null &&
  Number.isFinite(actual) &&
  sla !== undefined &&
  sla !== null &&
  sla > 0 &&
  actual > sla;

const buildOrderItems = (cart?: any[]) => {
  if (!cart?.length) return "";
  return cart
    .map((item) => {
      const dishName = item?.dish?.name || item?.name || item?.dishName || "";
      const portionName = item?.portion?.name ? ` - ${item.portion.name}` : "";
      const extras =
        item?.extras
          ?.map((extra: any) =>
            [extra?.name, extra?.quantity > 1 ? `x${extra.quantity}` : ""]
              .filter(Boolean)
              .join(" "),
          )
          .filter(Boolean)
          .join(", ") || "";
      const quantity = item?.quantity ?? 1;
      const price = item?.portion?.price ?? item?.dish?.price;
      const label = `${dishName}${portionName}${extras ? ` + ${extras}` : ""}`;
      if (!label) return "";
      return price !== undefined && price !== null
        ? `${label} x${quantity} (Rs ${price})`
        : `${label} x${quantity}`;
    })
    .filter(Boolean)
    .join(" | ");
};

const hasFoodCartItems = (cart?: any[]) =>
  Boolean(cart?.some((item) => item?.dish || item?.dishId || item?.name || item?.dishName));

const foodCartItemPrepMins = (item: any, fallbackMins: number) => {
  const prepMins = Number(item?.dish?.avgPrepTime ?? item?.dish?.avgPreparationTime ?? item?.avgPrepTime ?? item?.avgPreparationTime ?? 0);
  return prepMins > 0 ? prepMins : fallbackMins;
};

const foodOrderFulfillmentSla = (cart?: any[], settings?: Partial<FoodOrderSlaSettings> | null) => {
  if (!hasFoodCartItems(cart)) return 0;
  const normalized = normalizeFoodOrderSlaSettings(settings);
  const prepMins = normalized.useItemPrepTime ? Math.max(...cart!.map((item) => foodCartItemPrepMins(item, normalized.avgDeliveryTime))) : 0;
  return prepMins > 0 ? prepMins : normalized.avgDeliveryTime;
};

const foodOrderAcceptanceSla = (cart?: any[], settings?: Partial<FoodOrderSlaSettings> | null) =>
  hasFoodCartItems(cart) ? normalizeFoodOrderSlaSettings(settings).avgAcceptanceTime : 0;

const foodOrderFulfillmentSlaFromAlert = (
  alert: any,
  settings?: Partial<FoodOrderSlaSettings> | null,
) => {
  const snapshotFulfillment = Number(alert?.foodOrderSlaSnapshot?.effectiveFulfillmentTime);
  if (snapshotFulfillment > 0 && hasFoodCartItems(alert?.cart)) return snapshotFulfillment;
  return foodOrderFulfillmentSla(alert?.cart, settings);
};

const joinNames = (items?: { name?: string }[]) =>
  items?.map((item) => item?.name).filter(Boolean).join(", ") || "";

const serviceRequestedLabel = (alert: any) => {
  const names = joinNames(alert?.serviceIds);
  if (names) return names;
  return alert?.cart?.length ? "Food Order" : "";
};

const requestQuantity = (alert: any) => {
  const serviceTotal =
    alert?.serviceRequestItems?.reduce(
      (sum: number, item: any) => sum + (Number(item?.quantity) || 1),
      0,
    ) ?? 0;
  if (serviceTotal > 0) return serviceTotal;

  const cartTotal =
    alert?.cart?.reduce(
      (sum: number, item: any) => sum + (Number(item?.quantity) || 1),
      0,
    ) ?? 0;
  return cartTotal > 0 ? cartTotal : 1;
};

const staffName = (staff?: { name?: string } | null) => staff?.name || "";

const closedStatusPerformanceLabel = (status?: string) => {
  switch (status) {
    case "DELIVERED":
      return "Delivered (SLA not configured)";
    case "RESOLVED":
      return "Resolved (SLA not configured)";
    case "NOT_DELIVERED":
      return "Not delivered";
    case "REJECTED":
      return "Rejected";
    default:
      return "";
  }
};

// SLA analysis for the CSV — mirrors the client's computePerf so the download
// matches the on-screen report. Standards come from each service's
// avgAcceptanceTime / avgDeliveryTime (minutes); actuals from the timestamps.
const slaAnalysis = (alert: any, foodOrderSlaSettings?: Partial<FoodOrderSlaSettings> | null) => {
  const services = alert?.serviceIds ?? [];
  const effectiveFoodOrderSlaSettings = alert?.foodOrderSlaSnapshot || alert?.foodOrderSlaSettings || foodOrderSlaSettings;
  const serviceAccSla = services.reduce(
    (sum: number, s: any) => sum + (s?.avgAcceptanceTime ?? 0),
    0,
  );
  const accSla = serviceAccSla > 0 ? serviceAccSla : foodOrderAcceptanceSla(alert?.cart, effectiveFoodOrderSlaSettings);
  const serviceDelSla = services.reduce(
    (sum: number, s: any) =>
      sum + (s?.avgDeliveryTime ?? s?.avgCompletionTime ?? 0),
    0,
  );
  const effectiveDelSla = serviceDelSla > 0 ? serviceDelSla : foodOrderFulfillmentSlaFromAlert(alert, effectiveFoodOrderSlaSettings);
  const totalSla = accSla + effectiveDelSla;
  const totalActual =
    alert?.createdAt && alert?.deliveredAt && alert.deliveredAt >= alert.createdAt
      ? (alert.deliveredAt - alert.createdAt) / 60000
      : null;
  const actualAccept =
    alert?.createdAt && alert?.acceptedAt && alert.acceptedAt >= alert.createdAt
      ? (alert.acceptedAt - alert.createdAt) / 60000
      : null;
  const actualDeliver =
    alert?.acceptedAt && alert?.deliveredAt && alert.deliveredAt >= alert.acceptedAt
      ? (alert.deliveredAt - alert.acceptedAt) / 60000
      : null;
  const breachedLegSla = isSlaLate(actualAccept, accSla) || isSlaLate(actualDeliver, effectiveDelSla);

  let performance = "";
  if (totalSla > 0 && totalActual != null) {
    const diff = totalSla - totalActual;
    performance =
      diff >= 0
        ? `Completed ${formatDurationMinutes(diff)} before SLA`
        : `Exceeded SLA by ${formatDurationMinutes(-diff)}`;
  } else {
    performance = closedStatusPerformanceLabel(alert?.alertProgress);
  }

  return {
    stdAccept: accSla > 0 ? formatDurationMinutes(accSla) : "",
    stdDeliver: effectiveDelSla > 0 ? formatDurationMinutes(effectiveDelSla) : "",
    totalStd: totalSla > 0 ? formatDurationMinutes(totalSla) : "",
    totalActual: totalActual != null ? formatDurationMinutes(totalActual) : "",
    performance,
    breachedLegSla,
  };
};

const getCompanionGuests = (guests?: any[], primaryPhone?: string) =>
  (guests || []).filter((guest) => {
    if (!guest || typeof guest !== "object") return false;
    return !primaryPhone || guest.phone !== primaryPhone;
  });

const formatCompanions = (guests?: any[], primaryPhone?: string) =>
  getCompanionGuests(guests, primaryPhone)
    .map((guest) =>
      [guest.name || "Guest", guest.phone ? `(${guest.phone})` : ""]
        .filter(Boolean)
        .join(" "),
    )
    .join(" | ");

const servicesOverlap = (
  a?: { name?: string }[],
  b?: { name?: string }[],
) => {
  if (!a?.length || !b?.length) return false;
  const set = new Set(a.map((s) => s?.name?.toLowerCase()).filter(Boolean));
  return b.some((s) => set.has(s?.name?.toLowerCase()));
};



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

type HotelItemAnalyticsRow = {
  id: string;
  name: string;
  orderCount: number;
  quantity: number;
  estimatedSales: number;
  timePeriods: Record<string, number>;
};

const toItemId = (id: unknown) => {
  if (typeof id === "string") return id;
  if (id && typeof (id as { toString(): string }).toString === "function") {
    return (id as { toString(): string }).toString();
  }
  return "";
};

const getCartQuery = ({
  businessId,
  from,
  to,
}: {
  businessId: string;
  from?: number;
  to?: number;
}) => {
  const query: Record<string, unknown> = { businessId };
  if (from || to) {
    query.date = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }
  return query;
};

const getItemUnitPrice = (item: any) => {
  const portionPrice =
    typeof item?.portion?.price === "number" ? item.portion.price : undefined;
  const dishPrice =
    typeof item?.dish?.price === "number" ? item.dish.price : undefined;
  return portionPrice ?? dishPrice ?? 0;
};

const buildHotelItemAnalyticsRows = (carts: any[]) => {
  const itemMap: Record<string, HotelItemAnalyticsRow> = {};

  for (const cart of carts) {
    const timePeriod = typeof cart.date === "number" ? getTimePeriod(cart.date) : null;

    for (const item of cart.cart ?? []) {
      const id = toItemId(item?.dish?._id);
      const name = item?.dish?.name;
      if (!id || !name) continue;

      const quantity = Math.max(Number(item?.quantity ?? 1), 1);
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

const sanitizeFilenamePart = (value: string) =>
  value.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").trim() || "Hotel";

const hotelReportRouter = new Hono()
  /**
   * GET /hotel/report/guest_experience_csv?businessId=&from=&to=
   *
   * Streams the full Guest Experience Report as CSV directly to the response.
   * Replaces the old frontend-built flow which made one
   * `fetchIndividualUserAnalytics` call per unique guest (N+1 burst against
   * our own backend) and assembled the CSV in the browser main thread.
   *
   * Pipeline:
   *   1. Single `HotelAlert.find()` for the date range (already populated).
   *   2. Single `Reviews.find()` over the same range — used to match each
   *      alert with the user's review (by alertId, falling back to
   *      guest+room+service heuristics).
   *   3. Single `HotelAnalytics.find()` over the same range — gives the most
   *      recent stay context (source/checkIn/checkOut) per guest phone.
   *   4. ONE aggregation over `HotelAnalytics` grouped by userId for the
   *      LIFETIME visit count of every guest we saw in step 1.
   *   5. Stream CSV rows out in batches of CSV_BATCH_FLUSH so the response
   *      starts within milliseconds and peak memory stays flat.
   *
   * Safety:
   *   • Range capped at MAX_REPORT_RANGE_MS (~3 months) to mirror the client
   *     constraint and prevent open-ended scans.
   *   • Auth is enforced by the parent router (this endpoint is admin /
   *     dashboard only; client never calls it from an unauthed origin).
   */
  .get(
    "/guest_experience_csv",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        from: z.coerce.number().int().nonnegative(),
        to: z.coerce.number().int().nonnegative(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.valid("query");

      if (from >= to) {
        return respond(c, "Invalid date range (from >= to)", true, 400, {});
      }
      if (to - from > MAX_REPORT_RANGE_MS) {
        return respond(
          c,
          `Date range exceeds ${MAX_REPORT_RANGE_MS / (24 * 60 * 60 * 1000)} days`,
          true,
          400,
          {},
        );
      }

      // ── Step 1: alerts in range ─────────────────────────────────────────
      await syncHotelCompanionReadModel({
        businessId,
        from,
        to,
      });

      const outletInfo = await OutLetInfo.findOne({ businessId })
        .select("foodOrderSla")
        .lean();
      const foodOrderSlaSettings = normalizeFoodOrderSlaSettings((outletInfo as any)?.foodOrderSla);

      const alerts = await HotelAlert.find({
        businessId,
        createdAt: { $gte: from, $lte: to },
        alertProgress: { $in: ["DELIVERED", "RESOLVED", "NOT_DELIVERED", "REJECTED"] },
      })
        .populate({
          path: "serviceIds",
          select: "name avgAcceptanceTime avgCompletionTime avgDeliveryTime",
        })
        .populate({ path: "createdBy", select: "name phone" })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "deliveredBy", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .sort({ createdAt: 1 })
        .lean();

      const alertIds = (alerts as any[]).map((alert) => alert._id);
      const roomChats = alertIds.length
        ? await HotelRoomChat.find({
            alertId: { $in: alertIds },
            isDeleted: false,
          })
            .select("alertId userId cart date")
            .populate({ path: "userId", select: "name phone" })
            .lean()
        : [];
      const chatByAlertId = new Map((roomChats as any[]).map((chat) => [String(chat.alertId), chat]));
      const hydratedAlerts = (alerts as any[]).map((alert) => {
        const chat = chatByAlertId.get(String(alert._id));
        const alertCart = Array.isArray(alert.cart) ? alert.cart : [];
        const chatCart = Array.isArray(chat?.cart) ? chat.cart : [];
        return {
          ...alert,
          cart: alertCart.length ? alertCart : chatCart,
          foodOrderSlaSettings: alert.foodOrderSlaSnapshot || foodOrderSlaSettings,
          createdBy: alert.createdBy || chat?.userId,
          createdAt: alert.createdAt || chat?.date,
        };
      });

      const stays = await HotelAnalytics.find({
        businessId,
        $or: [
          { checkIn: { $gte: from, $lte: to } },
          { checkOut: { $gte: from, $lte: to } },
        ],
      })
        .select("userId roomId source checkIn checkOut guestUserIds serviceIds")
        .populate({ path: "userId", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .populate({ path: "guestUserIds", select: "name phone" })
        .sort({ checkIn: -1 })
        .lean();

      // Empty result is NOT a "route not found" — return a valid empty CSV
      // with a 200 so the client can distinguish "we asked for a range with
      // no data" from "the endpoint doesn't exist in the deployed image".
      // Browsers / fetch consumers can still detect "nothing to show" by
      // checking content length or the row count after parse.
      if (!alerts.length && !stays.length) {
        const filename = `guest_experience_report_${formatFilenameDate(from)}-to-${formatFilenameDate(to)}.csv`;
        c.header("Content-Type", "text/csv; charset=utf-8");
        c.header(
          "Content-Disposition",
          `attachment; filename="${filename}"`,
        );
        c.header("Cache-Control", "no-store");
        c.header("X-Hipalz-Report-Status", "empty");
        return c.body(
          [
            "﻿HOTEL GUEST EXPERIENCE REPORT",
            `Date Range: ${formatDateTime(from)} to ${formatDateTime(to)}`,
            `Generated At: ${formatDateTime(Date.now())}`,
            "No guest experience data was recorded in this range.",
            "--------------------------------------------",
            "",
            CSV_HEADERS.map(escapeCsvCell).join(","),
            "",
          ].join("\n"),
          200,
        );
      }

      // ── Step 2: reviews in range ────────────────────────────────────────
      const reviews = await Reviews.find({
        businessId,
        date: { $gte: from, $lte: to },
      })
        .populate({ path: "userId", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .populate({
          path: "alertId",
          select: "serviceIds",
          populate: { path: "serviceIds", select: "name" },
        })
        .lean();

      // ── Step 3: stay context (most recent per phone) ───────────────────
      type StayCtx = {
        source?: string;
        checkIn?: number;
        checkOut?: number;
        guests?: any[];
      };
      const stayByPhone = new Map<string, StayCtx>();
      for (const stay of stays as any[]) {
        const phone = stay.userId?.phone;
        if (!phone) continue;
        // sort is desc by checkIn so the first one we see per phone wins.
        if (!stayByPhone.has(phone)) {
          stayByPhone.set(phone, {
            source: stay.source,
            checkIn: stay.checkIn,
            checkOut: stay.checkOut,
            guests: stay.guestUserIds || [],
          });
        }
      }

      // ── Step 4: LIFETIME visit counts in ONE aggregation ───────────────
      const userIdSet = new Set<string>();
      for (const a of hydratedAlerts as any[]) {
        const id = a.createdBy?._id;
        if (id) userIdSet.add(String(id));
      }
      for (const stay of stays as any[]) {
        const id = stay.userId?._id;
        if (id) userIdSet.add(String(id));
      }
      const userObjectIds = Array.from(userIdSet)
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      const visitAgg = userObjectIds.length
        ? await HotelAnalytics.aggregate([
            { $match: { userId: { $in: userObjectIds } } },
            { $group: { _id: "$userId", count: { $sum: 1 } } },
          ])
        : [];

      // Map by phone (matches the client expectation). We need the
      // userId→phone link from `alerts` since visitAgg is keyed by userId.
      const phoneByUserId = new Map<string, string>();
      for (const a of hydratedAlerts as any[]) {
        const uid = a.createdBy?._id;
        const phone = a.createdBy?.phone;
        if (uid && phone) phoneByUserId.set(String(uid), phone);
      }
      for (const stay of stays as any[]) {
        const uid = stay.userId?._id;
        const phone = stay.userId?.phone;
        if (uid && phone) phoneByUserId.set(String(uid), phone);
      }
      const visitCountByPhone = new Map<string, number>();
      for (const row of visitAgg) {
        const phone = phoneByUserId.get(String(row._id));
        if (phone) visitCountByPhone.set(phone, row.count);
      }

      // ── Step 5: stream CSV ─────────────────────────────────────────────
      const filename = `guest_experience_report_${formatFilenameDate(from)}-to-${formatFilenameDate(to)}.csv`;
      c.header("Content-Type", "text/csv; charset=utf-8");
      c.header(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      c.header("Cache-Control", "no-store");

      const findMatchingReview = (alert: any) => {
        const alertId = alert?._id ? String(alert._id) : "";
        const exact = reviews.find((r: any) => {
          const rAlertId =
            r.alertId && typeof r.alertId === "object" ? String(r.alertId._id) : "";
          return alertId && rAlertId === alertId;
        });
        if (exact) return exact;
        return reviews.find((r: any) => {
          const user = r.userId && typeof r.userId === "object" ? r.userId : null;
          const sameGuest =
            user?.phone && user.phone === alert.createdBy?.phone;
          const sameRoom =
            r.roomId?.name && r.roomId.name === alert.roomId?.name;
          const reviewAlert =
            r.alertId && typeof r.alertId === "object" ? r.alertId : null;
          const sameService = servicesOverlap(
            alert.serviceIds,
            reviewAlert?.serviceIds,
          );
          const afterRequest =
            r.date && alert.createdAt ? r.date >= alert.createdAt : true;
          return Boolean(sameGuest && sameRoom && sameService && afterRequest);
        });
      };

      return stream(c, async (s) => {
        // UTF-8 BOM so Excel opens the file with the right encoding.
        await s.write("﻿");

        // Summary block, then a blank line, then headers.
        const uniqueGuests = new Set(
          [
            ...(hydratedAlerts as any[]).map((a) => a.createdBy?.phone),
            ...(stays as any[]).map((stay) => stay.userId?.phone),
          ]
            .filter(Boolean),
        ).size;
        const escalated = (hydratedAlerts as any[]).filter((a) => a.isEscalated || slaAnalysis(a, foodOrderSlaSettings).breachedLegSla).length;
        const summary = [
          "HOTEL GUEST EXPERIENCE REPORT",
          `Total Service Requests: ${hydratedAlerts.length}`,
          `Unique Guests: ${uniqueGuests}`,
          `Escalated Requests: ${escalated}`,
          `Date Range: ${formatDateTime(from)} to ${formatDateTime(to)}`,
          `Generated At: ${formatDateTime(Date.now())}`,
          "--------------------------------------------",
        ].join("\n");
        await s.write(`${summary}\n\n`);
        await s.write(CSV_HEADERS.map(escapeCsvCell).join(",") + "\n");

        // Emit rows in batches. Building rows row-by-row keeps a single 80MB
        // string from ever existing in process memory for large reports.
        let buffer: string[] = [];
        const phonesWithServiceRows = new Set<string>();
        for (const alert of hydratedAlerts as any[]) {
          const phone = alert.createdBy?.phone || "";
          if (phone) phonesWithServiceRows.add(phone);
          const review = findMatchingReview(alert);
          const stay = phone ? stayByPhone.get(phone) : undefined;
          const companionGuests = getCompanionGuests(
            stay?.guests,
            phone,
          );
          const sla = slaAnalysis(alert, foodOrderSlaSettings);
          const isEscalated = Boolean(alert.isEscalated || sla.breachedLegSla);

          const row = [
            alert.createdBy?.name || "Guest",
            phone,
            alert.roomId?.name || "",
            phone ? visitCountByPhone.get(phone) ?? "" : "",
            stay?.source || "",
            formatDateTime(stay?.checkIn),
            formatDateTime(stay?.checkOut),
            formatCompanions(stay?.guests, phone),
            companionGuests.length,
            "Service Request",
            serviceRequestedLabel(alert),
            requestQuantity(alert),
            buildOrderItems(alert.cart),
            formatDateTime(alert.createdAt),
            staffName(alert.acceptedBy),
            formatDateTime(alert.acceptedAt),
            staffName(alert.deliveredBy),
            formatDateTime(alert.deliveredAt),
            getDurationLabel(alert.createdAt, alert.acceptedAt),
            getDurationLabel(alert.acceptedAt, alert.deliveredAt),
            getDurationLabel(alert.createdAt, alert.deliveredAt),
            sla.stdAccept,
            sla.stdDeliver,
            sla.totalStd,
            sla.totalActual,
            sla.performance,
            isEscalated ? "Yes" : "No",
            alert.isEscalated ? alert.level ?? 0 : "",
            isEscalated ? "Yes" : "No",
            (review as any)?.reviewRating ?? "",
            (review as any)?.review ||
              (review as any)?.description ||
              (review as any)?.note ||
              (review as any)?.improvementAreas?.filter(Boolean).join(", ") ||
              "",
            formatDateTime((review as any)?.date),
          ]
            .map(escapeCsvCell)
            .join(",");

          buffer.push(row);
          if (buffer.length >= CSV_BATCH_FLUSH) {
            await s.write(buffer.join("\n") + "\n");
            buffer = [];
          }
        }
        for (const stay of stays as any[]) {
          const phone = stay.userId?.phone || "";
          if (!phone || phonesWithServiceRows.has(phone)) continue;

          const companionGuests = getCompanionGuests(
            stay.guestUserIds,
            phone,
          );
          const row = [
            stay.userId?.name || "Guest",
            phone,
            stay.roomId?.name || "",
            visitCountByPhone.get(phone) ?? "",
            stay.source || "",
            formatDateTime(stay.checkIn),
            formatDateTime(stay.checkOut),
            formatCompanions(stay.guestUserIds, phone),
            companionGuests.length,
            "Room Scan / Stay",
            joinNames(stay.serviceIds),
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]
            .map(escapeCsvCell)
            .join(",");

          buffer.push(row);
          if (buffer.length >= CSV_BATCH_FLUSH) {
            await s.write(buffer.join("\n") + "\n");
            buffer = [];
          }
        }
        if (buffer.length) await s.write(buffer.join("\n") + "\n");
      });
    },
  )

  .post(
    "/fetch_escalated_reports",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        from: z.number().optional(),
        to: z.number().optional(),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { businessId, from, to } = requestData;
      const escalatedReports = await HotelAlert.find({
        businessId,
        isEscalated: true,
        createdAt: {
          $gte: from,
          $lte: to,
        },
        alertProgress: {
          $nin: ["MESSAGE", "REJECTED" /* Exclude non-service alerts */],
        },
      })
        .populate("roomId", "_id name")
        .populate("userId", "_id name phone")
        .populate("serviceIds", "_id name")
        .populate("createdBy", "_id name phone")

        .sort({ _id: -1 })

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

      // Fetch carts with pagination
      const carts = await Cart.find(getCartQuery({ businessId, from, to }))
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
  )
  .post(
    "/fetch_item_reports/download_xlsx",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        from: z.number().optional(),
        to: z.number().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = await c.req.json();
      const business = await Business.findById(businessId)
        .select("name registeredName")
        .lean();
      const businessName =
        business?.name || business?.registeredName || "Hotel";
      const carts = await Cart.find(getCartQuery({ businessId, from, to }))
        .sort({ _id: -1 })
        .lean();

      const rows = buildHotelItemAnalyticsRows(carts);
      const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
      const totalSales = rows.reduce((sum, row) => sum + row.estimatedSales, 0);
      const { workbook } = createReportWorkbook();

      const summarySheet = workbook.addWorksheet("Top Recommendations");
      addKeyValueRow(summarySheet, "Business Name", businessName);
      addKeyValueRow(summarySheet, "From", from ? formatDateTime(from) : "");
      addKeyValueRow(summarySheet, "To", to ? formatDateTime(to) : "");
      addKeyValueRow(summarySheet, "Generated At", formatDateTime(Date.now()));
      summarySheet.addRow([]);

      if (rows.length === 0) {
        summarySheet.addRow(["No item report data available"]);
      } else {
        addBoldHeaderRow(summarySheet, [
          "Rank",
          "Item",
          "Orders",
          "Quantity",
          "Estimated Sales",
          "Share",
          "Recommendation",
        ]);

        const bySales = [...rows].sort((a, b) => b.estimatedSales - a.estimatedSales);
        rows.slice(0, 10).forEach((row, index) => {
          const share = totalQuantity
            ? `${((row.quantity / totalQuantity) * 100).toFixed(1)}%`
            : "0%";
          const recommendation =
            index === 0
              ? "Top requested item"
              : bySales[0]?.id === row.id
                ? "Highest total value"
                : row.quantity <= 2
                  ? "Low movement"
                  : "Popular item";

          summarySheet.addRow([
            index + 1,
            row.name,
            row.orderCount,
            row.quantity,
            row.estimatedSales,
            share,
            recommendation,
          ]);
        });

        summarySheet.addRow([]);
        addKeyValueRow(summarySheet, "Total Quantity", totalQuantity);
        addKeyValueRow(summarySheet, "Estimated Sales", totalSales);
      }
      autoFitColumns(summarySheet);

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
      addBoldHeaderRow(timeSheet, ["Time Period", "Top Item", "Quantity"]);
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

      const filename = `${sanitizeFilenamePart(businessName)} Item Reports ${formatFilenameDate(from)} to ${formatFilenameDate(to)}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();

      c.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8",
      );
      c.header(
        "Content-Disposition",
        `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      );

      return c.body(buffer);
    },
  );

export default hotelReportRouter;
