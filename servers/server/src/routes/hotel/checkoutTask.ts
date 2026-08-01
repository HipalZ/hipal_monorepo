import { HotelCheckoutGroup, HotelCheckoutTask } from "@hi/db-models";
import {
  actOnCheckoutTask,
  triggerCheckoutTasks,
  upsertHotelCheckoutGroup,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { raiseCheckoutTasks } from "../../services/checkoutTasks/raise";
import { respond } from "../../utils/response";

const businessQuery = z.object({ businessId: z.string().min(24).max(24) });

const checkoutTaskRouter = new Hono()
  /* ── config ─────────────────────────────────────────────────────────── */
  .get("/group", zValidator("query", businessQuery), async (c) => {
    const { businessId } = c.req.query();
    const group = await HotelCheckoutGroup.findOne({ businessId }).populate({
      path: "services.serviceId",
      select: "name image categoryId",
    });
    return respond(c, "Checkout group fetched", false, 200, group);
  })

  .post("/group", zValidator("json", upsertHotelCheckoutGroup), async (c) => {
    const body = await c.req.json();
    const { businessId, ...rest } = body;
    // One group per business today; the schema allows more without a rewrite.
    const group = await HotelCheckoutGroup.findOneAndUpdate(
      { businessId },
      { $set: { businessId, ...rest } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return respond(c, "Checkout automation saved", false, 200, group);
  })

  /* ── trigger ────────────────────────────────────────────────────────── */
  /**
   * Called by hitable immediately after a successful checkout. Never fails the
   * caller: a missing config, an empty floor or a duplicate retry all return
   * 200, because the guest has already been checked out by this point.
   */
  .post("/trigger", zValidator("json", triggerCheckoutTasks), async (c) => {
    const { businessId, roomId, triggeredBy, checkoutAt, guests, guestName, guestPhone } = await c.req.json();
    // Shared with check_out, which raises the same tasks in-line so hitable
    // needs only one round-trip. See services/checkoutTasks/raise.ts.
    const { raised, tasks } = await raiseCheckoutTasks({
      businessId,
      roomId,
      triggeredBy,
      checkoutAt,
      guests,
      guestName,
      guestPhone,
    });
    return respond(c, "Checkout tasks raised", false, 200, { raised, tasks });
  })

  /* ── staff feed ─────────────────────────────────────────────────────── */
  .get(
    "/my_tasks",
    zValidator(
      "query",
      businessQuery.extend({ userId: z.string().min(24).max(24) }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();
      const tasks = await HotelCheckoutTask.find({
        businessId,
        status: { $in: ["PENDING", "ACCEPTED"] },
        $or: [{ audienceStaffIds: userId }, { acceptedBy: userId }],
      })
        .populate({ path: "roomId", select: "name" })
        .populate({ path: "serviceId", select: "name image" })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "triggeredBy", select: "name phone" })
        .populate({ path: "zoneId", select: "name" })
        .sort({ acceptDueAt: 1 })
        .lean();
      return respond(c, "Checkout tasks fetched", false, 200, tasks);
    },
  )

  /* ── actions ────────────────────────────────────────────────────────── */
  .post("/accept", zValidator("json", actOnCheckoutTask), async (c) => {
    const { taskId, userId } = await c.req.json();
    const now = Date.now();

    const existing = await HotelCheckoutTask.findById(taskId).lean();
    if (!existing) return respond(c, "Task not found", true, 404, {});

    // Conditional update is the lock: two staff tapping at once, one wins.
    const task = await HotelCheckoutTask.findOneAndUpdate(
      { _id: taskId, status: "PENDING" },
      {
        $set: {
          status: "ACCEPTED",
          acceptedBy: userId,
          acceptedAt: now,
          completeDueAt: now + existing.completeMins * 60_000,
        },
      },
      { new: true },
    );
    if (!task) {
      return respond(c, "This task was already accepted", true, 409, {});
    }
    return respond(c, "Task accepted", false, 200, task);
  })

  .post("/complete", zValidator("json", actOnCheckoutTask), async (c) => {
    const { taskId, userId } = await c.req.json();
    const task = await HotelCheckoutTask.findOneAndUpdate(
      { _id: taskId, status: "ACCEPTED" },
      { $set: { status: "COMPLETED", completedBy: userId, completedAt: Date.now() } },
      { new: true },
    );
    if (!task) return respond(c, "Task is not in progress", true, 409, {});
    return respond(c, "Task completed", false, 200, task);
  })

  .post(
    "/cancel",
    zValidator("json", actOnCheckoutTask),
    async (c) => {
      const { taskId, userId, reasonOfRejection } = await c.req.json();
      const task = await HotelCheckoutTask.findOneAndUpdate(
        { _id: taskId, status: { $in: ["PENDING", "ACCEPTED"] } },
        {
          $set: {
            status: "CANCELLED",
            cancelledAt: Date.now(),
            cancelledBy: userId,
            cancelReason: reasonOfRejection || "not specified",
          },
        },
        { new: true },
      );
      if (!task) return respond(c, "Task already closed", true, 409, {});
      return respond(c, "Task cancelled", false, 200, task);
    },
  )

  /* ── admin views ────────────────────────────────────────────────────── */
  .get("/active", zValidator("query", businessQuery), async (c) => {
    const { businessId } = c.req.query();
    const tasks = await HotelCheckoutTask.find({
      businessId,
      status: { $in: ["PENDING", "ACCEPTED"] },
    })
      .populate({ path: "roomId", select: "name" })
      .populate({ path: "serviceId", select: "name" })
      .populate({ path: "acceptedBy", select: "name" })
      .populate({ path: "triggeredBy", select: "name" })
      .populate({ path: "zoneId", select: "name" })
      .sort({ acceptDueAt: 1 })
      .lean();
    return respond(c, "Active checkout tasks", false, 200, tasks);
  })

  .get(
    "/history",
    zValidator(
      "query",
      businessQuery.extend({ from: z.string(), to: z.string() }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const tasks = await HotelCheckoutTask.find({
        businessId,
        createdAt: { $gte: Number(from), $lte: Number(to) },
      })
        .populate({ path: "roomId", select: "name" })
        .populate({ path: "serviceId", select: "name" })
        .populate({ path: "acceptedBy", select: "name" })
        .populate({ path: "completedBy", select: "name" })
        .populate({ path: "triggeredBy", select: "name phone" })
        .populate({ path: "zoneId", select: "name" })
        .sort({ createdAt: -1 })
        .lean();
      return respond(c, "Checkout task history", false, 200, tasks);
    },
  );

export default checkoutTaskRouter;
