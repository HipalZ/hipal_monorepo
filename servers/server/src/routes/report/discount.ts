import { Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { formatToIST } from "../../utils/reportHelper/dateFormater";
import { buildDiscountReport } from "../../utils/reportHelper/discountReport";
import type { Payment as PaymentType } from "../../utils/reportHelper/itemType";
import { respond } from "../../utils/response";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const discountRouter = new Hono()
  .post("/", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      discount: { $exists: true },
      couponDiscount: { $exists: true },
      claimedCoins: { $exists: true },
    })) as PaymentType[];

    const discountReport = await buildDiscountReport(
      allPayments,
      businessIds,
      from,
      to,
    );

    return respond(
      c,
      "Discount report fetched successfully",
      false,
      200,
      discountReport,
    );
  })

  .post("/download_csv", zValidator("json", bodySchema), async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
      discount: { $exists: true },
      couponDiscount: { $exists: true },
      claimedCoins: { $exists: true },
    })) as PaymentType[];

    const discountReport = await buildDiscountReport(
      allPayments,
      businessIds,
      from,
      to,
    );

    const header = ["DiscountName", "DiscountCount", "Amount"].join(",");
    const csvLines: string[] = [];

    for (const { businessId, businessName, discounts } of discountReport) {
      csvLines.push(`BusinessId,${businessId}`);
      csvLines.push(`BusinessName,"${businessName.replace(/"/g, '""')}"`);
      csvLines.push(header);

      for (const discount of discounts as Array<{
        discountName: string;
        discountCount: number;
        amount: number;
      }>) {
        const cols = [
          `"${discount.discountName.replace(/"/g, '""')}"`,
          discount.discountCount,
          discount.amount,
        ];
        csvLines.push(cols.join(","));
      }

      csvLines.push("");
    }

    const csv = csvLines.join("\r\n");

    const fromIST = formatToIST(from, true).replace(/[:/ ]/g, "-");
    const toIST = formatToIST(to, true).replace(/[:/ ]/g, "-");
    const filename = `discount-report_${businessIds.join(
      "_",
    )}_${fromIST}_${toIST}.csv`;

    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    return c.body(csv);
  });

export default discountRouter;
