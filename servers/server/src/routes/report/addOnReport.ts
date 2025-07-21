import { Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { buildAddOnReport } from "../../utils/reportHelper/addOnReport";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const addOnRouter = new Hono()
  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // Fetch all payments
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.extras": { $exists: true, $ne: [] },
    })) as PaymentType[];

    // Build Add-On report
    const report = await buildAddOnReport(allPayments, businessIds, from, to);

    return respond(c, "Add-on report fetched successfully", false, 200, report);
  })

  // CSV download for Add-On Report
  // CSV download for Add-On Report
  .post("/download_csv", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    // Fetch all payments
    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      "billItems.extras": { $exists: true, $ne: [] },
    })) as PaymentType[];

    // Build Add-On report
    const report = await buildAddOnReport(allPayments, businessIds, from, to);

    // CSV header
    const header = ["AddOnName", "AddOnCount", "Quantity", "Amount"].join(",");
    const csvLines: string[] = [];

    // Add rows to CSV
    for (const item of report) {
      // Add businessId and businessName as a header for each business block
      csvLines.push(`businessId: ${item.businessId}`);
      csvLines.push(`businessName: "${item.businessName.replace(/"/g, '""')}"`);
      csvLines.push(header); // Add header row after business information

      // Add the AddOn data for this business
      for (const addOn of item.addOns) {
        const cols = [
          `"${addOn.addOnName.replace(/"/g, '""')}"`,
          addOn.addOnCount,
          addOn.quantity,
          addOn.amount,
        ];
        csvLines.push(cols.join(","));
      }

      csvLines.push(""); // Blank line to separate different businesses
    }

    const csv = csvLines.join("\r\n");

    const fromIST = formatToIST(from, true).replace(/[:/ ]/g, "-");
    const toIST = formatToIST(to, true).replace(/[:/ ]/g, "-");
    const filename = `addon-report_${businessIds.join(
      "_",
    )}_${fromIST}_${toIST}.csv`;

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(csv);
  });

export default addOnRouter;
