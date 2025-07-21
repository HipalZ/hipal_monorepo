import { Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { buildServiceChargeReport } from "../../utils/reportHelper/serviceChargeReport"; // Import helper function
import { respond } from "../../utils/response";

// Define the schema for incoming data
const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const serviceChargeRouter = new Hono()
  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // Fetch all payments that have a service charge and are within the specified date range
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      serviceCharge: { $exists: true },
    })) as PaymentType[];

    // Get the service charge report
    const serviceChargeData = await buildServiceChargeReport(
      allPayments,
      businessIds,
    );

    return respond(
      c,
      "Service charge report fetched successfully",
      false,
      200,
      serviceChargeData,
    );
  })

  // CSV download
  .post("/download_csv", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // Fetch all payments with service charge
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      serviceCharge: { $exists: true },
    })) as PaymentType[];

    // Get the service charge report
    const serviceChargeData = await buildServiceChargeReport(
      allPayments,
      businessIds,
    );

    // CSV header
    const header = ["BusinessId", "BusinessName", "ServiceCharge"].join(",");
    const csvLines: string[] = [header];

    // Add rows to CSV
    for (const item of serviceChargeData) {
      const cols = [
        item.businessId,
        `"${item.businessName.replace(/"/g, '""')}"`,
        item.serviceCharge,
      ];
      csvLines.push(cols.join(","));
    }

    const csv = csvLines.join("\r\n");

    const fromIST = formatToIST(from, true).replace(/[:/ ]/g, "-");
    const toIST = formatToIST(to, true).replace(/[:/ ]/g, "-");
    const filename = `service-charge-report_${businessIds.join(
      "_",
    )}_${fromIST}_${toIST}.csv`;

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(csv);
  });

export default serviceChargeRouter;
