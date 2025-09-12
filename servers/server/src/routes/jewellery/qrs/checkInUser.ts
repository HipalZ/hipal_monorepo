import { CheckInQrUser } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import Papa from "papaparse";
import { z } from "zod";
import { respond } from "../../../utils/response";
import { endOfToday, startOfToday } from "../../payments";

const checkInQrUserRouter = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        from: z.string().optional(),
        to: z.string().optional(),
        qrId: z.string().min(2).max(50).optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to, qrId } = c.req.query();

      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const checkInQrUsers = await CheckInQrUser.find({
        businessId,
        date: { $gte: fromDate, $lte: toDate },
        ...(qrId ? { qrId } : {}),
      })
        .sort({ date: -1 })
        .populate({
          path: "userId",
          select: "name phone email dob address profession",
        });

      return respond(
        c,
        "Check-in QRs users fetched successfully",
        false,
        200,
        checkInQrUsers,
      );
    },
  )
  .get(
    "/csv",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        from: z.string().optional(),
        to: z.string().optional(),
        qrId: z.string().min(2).max(50).optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to, qrId } = c.req.query();

      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const checkInQrUsers = await CheckInQrUser.find({
        businessId,
        date: { $gte: fromDate, $lte: toDate },
        ...(qrId ? { qrId } : {}),
      })
        .sort({ date: -1 })
        .populate("userId")
        .populate("qrId");

      const rows = checkInQrUsers.map((item) => ({
        QR_NAME: item.qrId?.name ?? "",
        CHECKIN_CODE: item.code,
        DATE: item.date ? new Date(item.date).toLocaleString("en-IN") : "",
        USER_NAME: item.userId?.name ?? "",
        USER_PHONE: item.userId?.phone ?? "",
      }));

      const csvString = Papa.unparse(rows, {
        header: true,
        quotes: true,
        skipEmptyLines: true,
      });

      const formatDate = (timestamp: number) => {
        const d = new Date(timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(d.getDate()).padStart(2, "0")}`;
      };
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const fileName = `checkin_users_${fromStr}_to_${toStr}.csv`;

      c.header("Content-Type", "text/csv");
      c.header("Content-Disposition", `attachment; filename="${fileName}"`);

      return c.body(csvString);
    },
  );
export default checkInQrUserRouter;
