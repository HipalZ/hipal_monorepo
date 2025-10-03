import { StaffAttendence } from "@hi/db-models";
import { staffAttendenceSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
import { endOfToday, startOfToday } from "../payments";

const attendenceRouter = new Hono()
  .post("/mark", zValidator("json", staffAttendenceSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { staffId, action, businessId } = requestData;

      const now = Date.now();
      const fromDate = startOfToday.getTime();
      const toDate = endOfToday.getTime();

      const attendenceData = await StaffAttendence.findOne({
        staffId,
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
      }).session(session);

      if (action === "IN") {
        if (attendenceData) {
          const hasOpenShift = attendenceData.shiftBreaks?.some(
            (s) => s.startTime === 0,
          );

          if (!hasOpenShift) {
            attendenceData.shiftBreaks.push({ startTime: now, endTime: 0 });
            attendenceData.lastActiveAt = now;
            await attendenceData.save({ session });
          }

          return respond(c, "Marked IN successfully", false, 200, {});
        }

        const newEntry = new StaffAttendence({
          staffId,
          businessId,
          shiftBreaks: [{ startTime: now, endTime: 0 }],
          activeHrs: 0,
          createdAt: now,
          lastActiveAt: Date.now(),
        });
        await newEntry.save({ session });

        return respond(c, "Marked IN successfully", false, 200, {});
      }

      if (action === "OUT") {
        if (!attendenceData) {
          return respond(c, "No active session found", true, 404, {});
        }

        const activeShift = attendenceData.shiftBreaks.find(
          (s) => s.startTime > 0 && s.endTime === 0,
        );

        if (!activeShift) {
          return respond(c, "No open shift to mark OUT", true, 400, {});
        }

        activeShift.endTime = now;
        attendenceData.lastActiveAt = now;

        let totalActiveMs = 0;
        for (const shift of attendenceData.shiftBreaks) {
          if (shift.startTime && shift.endTime) {
            totalActiveMs += shift.endTime - shift.startTime;
          }
        }

        attendenceData.activeHrs = Number(
          (totalActiveMs / (1000 * 60 * 60)).toFixed(2),
        ); // Convert ms to hours
        await attendenceData.save({ session });

        return respond(c, "Marked OUT successfully", false, 200, {});
      }

      return respond(c, "Invalid action", true, 400, {});
    });
  })

  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return respond(c, "Invalid date range", true, 400, {});
      }

      const existingAttendence = await StaffAttendence.find({
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
      })
        .sort({ _id: -1 })
        .populate({
          path: "staffId",
          select: "name phone",
        })
        .lean();

      return respond(
        c,
        "Attendence fetched successfully",
        false,
        200,
        existingAttendence,
      );
    },
  );

export default attendenceRouter;
