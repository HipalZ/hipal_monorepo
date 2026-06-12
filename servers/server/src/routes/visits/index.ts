import {
  Business,
  Campaign,
  Subscriber,
  User,
  UserAnalytic,
  VisitEvent,
  WhatsAppAnalyticsUser,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import mongoose from "mongoose";
import { z } from "zod";
import { redis } from "../../queues/connection";
import { recordVisit } from "../../services/visitTracker";
import { respond } from "../../utils/response";

const objectIdString = z.string().regex(/^[a-f0-9]{24}$/i);

// Aggregations over a growing VisitEvent collection get cached in Redis
// so dashboards stay instant regardless of data size, and repeated
// reloads never re-run the pipelines. generatedAt is included in every
// payload so the UI can show "data as of X".
const ANALYTICS_CACHE_TTL_SECONDS = 180;

async function cacheGet(key: string): Promise<Record<string, unknown> | null> {
  try {
    const hit = await redis.get(key);
    return hit ? JSON.parse(hit) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key: string, value: unknown, ttl: number) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // cache failures must never break the API
  }
}

// Staff (captains/managers) scan QRs as part of work — their visits
// are counted like anyone's but tagged, so dashboards can show a clear
// "staff" label and a staff-vs-customer split.
async function getStaffObjectIds(
  businessId: string,
): Promise<mongoose.Types.ObjectId[]> {
  const business = await Business.findById(businessId)
    .select("staffIds")
    .lean();
  return (business?.staffIds ?? []).map(
    (id) => new mongoose.Types.ObjectId(String(id)),
  );
}

const visitsRouter = new Hono()

  // ── VISIT PING ──────────────────────────────────────────────────
  // Called by the customer client on menu/app load. Because returning
  // users are auto-logged-in from localStorage and never hit the
  // sign-in API, this ping is what captures their repeat visits.
  // Deduped server-side to one visit per user per day — the client can
  // call it on every page load with no double counting.
  .post(
    "/ping",
    zValidator(
      "json",
      z.object({
        businessId: objectIdString,
        userId: objectIdString,
        tableName: z.string().max(50).optional(),
      }),
    ),
    async (c) => {
      const { businessId, userId, tableName } = await c.req.json();
      const { isNewVisitDay } = await recordVisit({
        businessId,
        userId,
        source: "APP_OPEN",
        tableName,
      });
      return respond(c, "ok", false, 200, { counted: isNewVisitDay });
    },
  )

  // ── VISIT ANALYTICS ─────────────────────────────────────────────
  // Aggregates everything from VisitEvent, so it works identically for
  // every business: backfilled history where it exists, organic data
  // from deploy day everywhere else.
  .get(
    "/analytics",
    zValidator(
      "query",
      z.object({
        businessId: objectIdString,
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const businessObjectId = new mongoose.Types.ObjectId(businessId);

      const hasExplicitRange = from !== undefined || to !== undefined;
      const toDate = to ? Number(to) : Date.now();
      // Default summary is all-time. Date filters are reserved for callers
      // that explicitly ask for a range.
      const fromDate = from ? Number(from) : 0;

      const cacheKey = hasExplicitRange
        ? `visits:analytics:v3:${businessId}:${from ?? "auto"}:${to ?? "now"}`
        : `visits:analytics:v3:${businessId}:all-time`;
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return respond(c, "Visit analytics", false, 200, cached);
      }

      const staffObjectIds = await getStaffObjectIds(businessId);
      const staffIdStrings = new Set(staffObjectIds.map(String));

      const rangeMatch = {
        businessId: businessObjectId,
        date: { $gte: fromDate, $lte: toDate },
      };

      const [
        rangeStats,
        distribution,
        dailyTrend,
        sourceBreakdown,
        topVisitors,
        firstVisitInRange,
        lifetime,
        staffSplit,
      ] = await Promise.all([
        // visits + unique visitors in range
        VisitEvent.aggregate([
          { $match: rangeMatch },
          {
            $group: {
              _id: null,
              totalVisits: { $sum: 1 },
              uniqueVisitors: { $addToSet: "$userId" },
            },
          },
          {
            $project: {
              totalVisits: 1,
              uniqueVisitors: { $size: "$uniqueVisitors" },
            },
          },
        ]),

        // visit-frequency buckets (per visitor, within range)
        VisitEvent.aggregate([
          { $match: rangeMatch },
          { $group: { _id: "$userId", visits: { $sum: 1 } } },
          {
            $bucket: {
              groupBy: "$visits",
              boundaries: [1, 2, 3, 6, 11, 10000],
              default: "other",
              output: { customers: { $sum: 1 } },
            },
          },
        ]),

        // daily visit trend
        VisitEvent.aggregate([
          { $match: rangeMatch },
          { $group: { _id: "$day", visits: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),

        // where visits come from
        VisitEvent.aggregate([
          { $match: rangeMatch },
          { $group: { _id: "$source", visits: { $sum: 1 } } },
          { $sort: { visits: -1 } },
        ]),

        // top repeat customers in range (with identity)
        VisitEvent.aggregate([
          { $match: rangeMatch },
          {
            $group: {
              _id: "$userId",
              visits: { $sum: 1 },
              lastVisit: { $max: "$date" },
              firstVisit: { $min: "$date" },
            },
          },
          { $sort: { visits: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              userId: "$_id",
              visits: 1,
              lastVisit: 1,
              firstVisit: 1,
              name: "$user.name",
              phone: "$user.phone",
            },
          },
        ]),

        // new visitors: users whose FIRST-EVER visit falls in range
        VisitEvent.aggregate([
          { $match: { businessId: businessObjectId } },
          { $group: { _id: "$userId", firstVisit: { $min: "$date" } } },
          {
            $match: { firstVisit: { $gte: fromDate, $lte: toDate } },
          },
          { $count: "newVisitors" },
        ]),

        // lifetime numbers (all time)
        VisitEvent.aggregate([
          { $match: { businessId: businessObjectId } },
          {
            $group: {
              _id: null,
              totalVisits: { $sum: 1 },
              uniqueVisitors: { $addToSet: "$userId" },
              firstEvent: { $min: "$date" },
            },
          },
          {
            $project: {
              totalVisits: 1,
              uniqueVisitors: { $size: "$uniqueVisitors" },
              firstEvent: 1,
            },
          },
        ]),

        // staff vs customer split (in range) — staff are labelled, not
        // hidden, so the business sees exactly who is team vs guest
        VisitEvent.aggregate([
          { $match: rangeMatch },
          {
            $group: {
              _id: { $in: ["$userId", staffObjectIds] },
              visits: { $sum: 1 },
              visitors: { $addToSet: "$userId" },
            },
          },
          {
            $project: {
              isStaff: "$_id",
              visits: 1,
              visitors: { $size: "$visitors" },
            },
          },
        ]),
      ]);

      const totalVisits = rangeStats[0]?.totalVisits ?? 0;
      const uniqueVisitors = rangeStats[0]?.uniqueVisitors ?? 0;
      const newVisitors = firstVisitInRange[0]?.newVisitors ?? 0;

      const bucketLabel: Record<string, string> = {
        "1": "1 visit",
        "2": "2 visits",
        "3": "3-5 visits",
        "6": "6-10 visits",
        "11": "11+ visits",
      };

      // Subscriber ↔ customer overlap and the win-back segment (read a
      // campaign, never visited) — these power the overlap strip and
      // the reach & opportunity card.
      const [allVisitorIds, totalBusinessUsers, subscribersTotal, readerIds] =
        await Promise.all([
          VisitEvent.distinct("userId", { businessId: businessObjectId }),
          UserAnalytic.collection.countDocuments({
            $or: [{ businessId: businessObjectId }, { businessId }],
          }),
          Subscriber.countDocuments({ businessId: businessObjectId }),
          WhatsAppAnalyticsUser.distinct("userId", {
            businessId: businessObjectId,
            status: "read",
            userId: { $ne: null },
          }),
        ]);
      const visitorIdSet = new Set(allVisitorIds.map(String));
      const customerVisitorIds = allVisitorIds.filter(
        (id) => !staffIdStrings.has(String(id)),
      );
      const subscribedAndVisited = await Subscriber.countDocuments({
        businessId: businessObjectId,
        userId: { $in: customerVisitorIds },
      });
      const visitedNotSubscribed = Math.max(
        customerVisitorIds.length - subscribedAndVisited,
        0,
      );
      const readNeverVisited = readerIds.filter(
        (id) => id && !visitorIdSet.has(String(id)),
      ).length;

      const payload = {
        range: { from: fromDate, to: toDate },
        businessSummary: {
          totalUsers: totalBusinessUsers,
        },
        summary: {
          totalVisits,
          uniqueVisitors,
          newVisitors,
          returningVisitors: Math.max(uniqueVisitors - newVisitors, 0),
          repeatRate:
            uniqueVisitors > 0
              ? Number(
                  (
                    ((uniqueVisitors - newVisitors) / uniqueVisitors) *
                    100
                  ).toFixed(1),
                )
              : 0,
          avgVisitsPerVisitor:
            uniqueVisitors > 0
              ? Number((totalVisits / uniqueVisitors).toFixed(2))
              : 0,
        },
        lifetime: {
          totalVisits: lifetime[0]?.totalVisits ?? 0,
          uniqueVisitors: lifetime[0]?.uniqueVisitors ?? 0,
          trackedSince: lifetime[0]?.firstEvent ?? null,
        },
        frequencyDistribution: distribution.map(
          (b: { _id: number | string; customers: number }) => ({
            bucket: bucketLabel[String(b._id)] ?? String(b._id),
            customers: b.customers,
          }),
        ),
        dailyTrend: dailyTrend.map(
          (d: { _id: string; visits: number }) => ({
            day: d._id,
            visits: d.visits,
          }),
        ),
        sourceBreakdown: sourceBreakdown.map(
          (s: { _id: string; visits: number }) => ({
            source: s._id,
            visits: s.visits,
          }),
        ),
        staffBreakdown: {
          staffVisits:
            staffSplit.find((s: { isStaff: boolean }) => s.isStaff)?.visits ??
            0,
          staffVisitors:
            staffSplit.find((s: { isStaff: boolean }) => s.isStaff)
              ?.visitors ?? 0,
          customerVisits:
            staffSplit.find((s: { isStaff: boolean }) => !s.isStaff)?.visits ??
            0,
          customerVisitors:
            staffSplit.find((s: { isStaff: boolean }) => !s.isStaff)
              ?.visitors ?? 0,
        },
        topVisitors: topVisitors.map(
          (t: { userId: unknown } & Record<string, unknown>) => ({
            ...t,
            isStaff: staffIdStrings.has(String(t.userId)),
          }),
        ),
        audience: {
          subscribersTotal,
          totalCustomers: totalBusinessUsers,
          subscribedAndVisited,
          subscribedNeverVisited: Math.max(
            subscribersTotal - subscribedAndVisited,
            0,
          ),
          visitedNotSubscribed,
          readNeverVisited,
        },
        generatedAt: Date.now(),
        cacheTtlSeconds: ANALYTICS_CACHE_TTL_SECONDS,
      };

      await cacheSet(cacheKey, payload, ANALYTICS_CACHE_TTL_SECONDS);
      return respond(c, "Visit analytics", false, 200, payload);
    },
  )

  // ── CAMPAIGN → VISIT CONVERSION ─────────────────────────────────
  // "How many people who READ a campaign came back within N days?"
  // Reads = WhatsAppAnalyticsUser rows (status: read, userId set —
  // i.e. attributed campaign messages). A conversion = a VisitEvent
  // for that user within `windowDays` after the read.
  .get(
    "/campaign-conversion",
    zValidator(
      "query",
      z.object({
        businessId: objectIdString,
        windowDays: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, windowDays, from, to } = c.req.query();
      const businessObjectId = new mongoose.Types.ObjectId(businessId);
      const windowMs =
        (windowDays ? Number(windowDays) : 7) * 24 * 60 * 60 * 1000;
      const toDate = to ? Number(to) : Date.now();
      const fromDate = from ? Number(from) : toDate - 90 * 24 * 60 * 60 * 1000;

      const cacheKey = `visits:campaigns:${businessId}:${windowDays ?? 7}:${
        from ?? "auto"
      }:${to ?? Math.floor(Date.now() / 3_600_000)}`;
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return respond(c, "Campaign conversion", false, 200, cached);
      }

      // earliest read per (campaign, user)
      const reads: Array<{
        _id: { campaignId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId };
        readAt: number;
      }> = await WhatsAppAnalyticsUser.aggregate([
        {
          $match: {
            businessId: businessObjectId,
            status: "read",
            userId: { $ne: null },
            campaignId: { $ne: null },
            date: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: { campaignId: "$campaignId", userId: "$userId" },
            readAt: { $min: "$date" },
          },
        },
      ]).option({ allowDiskUse: true });

      if (reads.length === 0) {
        const emptyPayload = {
          windowDays: windowMs / (24 * 60 * 60 * 1000),
          campaigns: [],
          generatedAt: Date.now(),
          cacheTtlSeconds: ANALYTICS_CACHE_TTL_SECONDS,
        };
        await cacheSet(cacheKey, emptyPayload, ANALYTICS_CACHE_TTL_SECONDS);
        return respond(c, "Campaign conversion", false, 200, emptyPayload);
      }

      // all visits of the involved users in one query, then correlate
      const userIds = [...new Set(reads.map((r) => String(r._id.userId)))];
      const visits: Array<{ userId: mongoose.Types.ObjectId; date: number }> =
        await VisitEvent.find({
          businessId: businessObjectId,
          userId: { $in: userIds },
          date: { $gte: fromDate },
        })
          .select("userId date")
          .lean();

      const visitsByUser = new Map<string, number[]>();
      for (const v of visits) {
        const key = String(v.userId);
        const arr = visitsByUser.get(key) ?? [];
        arr.push(v.date);
        visitsByUser.set(key, arr);
      }

      type CampaignStat = { reads: number; returned: number };
      const perCampaign = new Map<string, CampaignStat>();
      for (const r of reads) {
        const key = String(r._id.campaignId);
        const stat = perCampaign.get(key) ?? { reads: 0, returned: 0 };
        stat.reads++;
        const userVisits = visitsByUser.get(String(r._id.userId)) ?? [];
        if (
          userVisits.some(
            (d) => d > r.readAt && d <= r.readAt + windowMs,
          )
        ) {
          stat.returned++;
        }
        perCampaign.set(key, stat);
      }

      const campaignDocs = await Campaign.find({
        _id: { $in: [...perCampaign.keys()] },
      })
        .select("campaignName date")
        .lean();
      const campaignNameById = new Map(
        campaignDocs.map((doc) => [
          String(doc._id),
          { name: doc.campaignName, date: doc.date },
        ]),
      );

      const campaigns = [...perCampaign.entries()]
        .map(([campaignId, s]) => ({
          campaignId,
          campaignName: campaignNameById.get(campaignId)?.name ?? "Campaign",
          sentAt: campaignNameById.get(campaignId)?.date ?? null,
          reads: s.reads,
          returnedWithinWindow: s.returned,
          conversionRate: Number(((s.returned / s.reads) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.reads - a.reads);

      const payload = {
        windowDays: windowMs / (24 * 60 * 60 * 1000),
        campaigns,
        generatedAt: Date.now(),
        cacheTtlSeconds: ANALYTICS_CACHE_TTL_SECONDS,
      };
      await cacheSet(cacheKey, payload, ANALYTICS_CACHE_TTL_SECONDS);
      return respond(c, "Campaign conversion", false, 200, payload);
    },
  );

export default visitsRouter;
