import { JewelleryPayment } from "@hi/db-models";
import { paramsSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import Papa from "papaparse";
import { adjustFromToTimestamps } from "../../../utils/defaultBillingTime";
import { endOfToday, startOfToday } from "../../payments";
//

const billRouter = new Hono()

  .get(
    "/",

    zValidator("query", paramsSchema),

    async (c) => {
      let { appliedFilter } = c.req.query();
      const { businessId, from, to } = c.req.query();

      // Adjust `from` and `to` timestamps based on whether they are today's date or not
      const { adjustedFrom, adjustedTo } = adjustFromToTimestamps(
        Number(from),
        Number(to),
      );

      // Use the adjusted timestamps as `fromDate` and `toDate`
      const fromDate = adjustedFrom;
      const toDate = adjustedTo;

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      const filterConditions = [
        { businessId },
        { date: { $gte: fromDate, $lte: toDate } },
      ];

      if (typeof appliedFilter === "string") {
        try {
          appliedFilter = JSON.parse(appliedFilter);
        } catch (err) {
          console.error("Failed to parse appliedFilter", err);
          appliedFilter = [];
        }
      }

      if (
        appliedFilter &&
        Array.isArray(appliedFilter) &&
        appliedFilter.length > 0
      ) {
        const modeFilter = appliedFilter.find((f) => f.key === "mode");

        if (modeFilter && Array.isArray(modeFilter.value)) {
          const modeValues = modeFilter.value.map((v) => v.toLowerCase());
          const includesOnline = modeValues.includes("online");
          const offlineModes = modeValues.filter((value) => value !== "online");

          const combinedModes = [
            ...(includesOnline ? ["online"] : []),
            ...offlineModes,
          ];

          if (combinedModes.length > 0) {
            filterConditions.push({ paymentMode: { $in: combinedModes } });
          }
        }

        const typeFilter = appliedFilter.find((f) => f.key === "type");
        if (typeFilter && Array.isArray(typeFilter.value)) {
          const typeMapping = {
            Coinz: "COINZ",
            Couponz: "COUPONZ",
            "No Rewardz": "NO_REWARDZ",
            Disscount: "DISCOUNT",
          };
          const types = typeFilter.value.map((v) => typeMapping[v] || v);
          filterConditions.push({ discountType: { $in: types } });
        }

        const warningsFilter = appliedFilter.find((f) => f.key === "warnings");
        if (
          warningsFilter &&
          Array.isArray(warningsFilter.value) &&
          !warningsFilter.value.includes("All")
        ) {
          const warningsMapping = {
            "Force Settle": "FORCE_SETTLE",
            "Free Tables": "FREE_SETTLE",
          };
          const warnings = warningsFilter.value.map(
            (v) => warningsMapping[v] || v,
          );
          filterConditions.push({ settleType: { $in: warnings } });
        }
      }

      const queryObject = { $and: filterConditions, isDeleted: false };

      const existingPayments = await JewelleryPayment.find(queryObject)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate({ path: "orderId" })
        .populate({ path: "userId", select: "name phone" })
        .populate({ path: "staffId", select: "name phone" });

      let totalSale = 0;

      for (const payment of existingPayments) {
        const { total = 0, mode, splitModes } = payment;

        if (mode === "split" && Array.isArray(splitModes)) {
          let splitTotal = 0;

          for (const settle of splitModes) {
            if (settle.name !== "complementary") {
              splitTotal += settle.amount ?? 0;
            }
          }

          totalSale += splitTotal; // Only adding valid split mode amounts
        } else if (!["dues", "npc", "complementary"].includes(mode)) {
          totalSale += total; // Add total if it's not dues, npc, or complementary
        }
      }

      return c.json({
        err: false,
        data: {
          totalSale, // Excludes complementary but includes valid split amounts
          existingPayments,
        },
        message: "existing payment",
      });
    },
  )

  .get(
    "/csv",

    zValidator("query", paramsSchema),
    async (c) => {
      let { appliedFilter } = c.req.query();
      const { businessId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const filterConditions = [
        { businessId },
        { date: { $gte: fromDate, $lte: toDate } },
      ];

      if (typeof appliedFilter === "string") {
        try {
          appliedFilter = JSON.parse(appliedFilter);
        } catch (err) {
          console.error("Failed to parse appliedFilter", err);
          appliedFilter = [];
        }
      }

      if (
        appliedFilter &&
        Array.isArray(appliedFilter) &&
        appliedFilter.length > 0
      ) {
        const modeFilter = appliedFilter.find((f) => f.key === "mode");
        if (modeFilter && Array.isArray(modeFilter.value)) {
          const modeValues = modeFilter.value.map((v) => v.toLowerCase());
          const includesOnline = modeValues.includes("online");
          const offlineModes = modeValues.filter((value) => value !== "online");

          const combinedModes = [
            ...(includesOnline ? ["online"] : []),
            ...offlineModes,
          ];

          if (combinedModes.length > 0) {
            filterConditions.push({ paymentMode: { $in: combinedModes } });
          }
        }

        const typeFilter = appliedFilter.find((f) => f.key === "type");
        if (typeFilter && Array.isArray(typeFilter.value)) {
          const typeMapping = {
            Coinz: "COINZ",
            Couponz: "COUPONZ",
            "No Rewardz": "NO_REWARDZ",
            Disscount: "DISCOUNT",
          };
          const types = typeFilter.value.map((v) => typeMapping[v] || v);
          filterConditions.push({ discountType: { $in: types } });
        }

        const warningsFilter = appliedFilter.find((f) => f.key === "warnings");
        if (
          warningsFilter &&
          Array.isArray(warningsFilter.value) &&
          !warningsFilter.value.includes("All")
        ) {
          const warningsMapping = {
            "Force Settle": "FORCE_SETTLE",
            "Free Tables": "FREE_SETTLE",
          };
          const warnings = warningsFilter.value.map(
            (v) => warningsMapping[v] || v,
          );
          filterConditions.push({ settleType: { $in: warnings } });
        }
      }

      const queryObject = { $and: filterConditions, isDeleted: false };

      const existingPayments = await JewelleryPayment.find(queryObject)
        .sort({ _id: -1 })
        .populate({ path: "orderId" })
        .populate({ path: "userId", select: "name phone" });

      // initialize all totals
      let totalBillValue = 0;
      let totalInitialSubTotal = 0;
      let totalInitialTax = 0;
      let totalInitialTotal = 0;
      let totalFinalSubTotal = 0;
      let totalTax = 0;
      let totalServiceCharge = 0;
      let totalAmount = 0;
      let totalTips = 0;
      let totalClaimedCoins = 0;
      let totalEarnCoins = 0;
      let totalDiscount = 0;
      let totalCouponDiscount = 0;
      let totalSubtotal = 0;

      const rows = existingPayments.map((payment: any) => {
        const {
          _id,
          date,
          userId,
          tableName,
          mode,
          paymentMode,
          billValue = 0,
          tips = 0,
          claimedCoins = 0,
          earnCoins = 0,
          discount = 0,
          discountType,
          initialSubTotal = 0,
          initialTax = 0,
          initialTotal = 0,
          finalSubTotal = 0,
          tax = 0,
          serviceCharge = 0,
          total,
          order_id,
          waiterName,
          posBillId,
          posBillRequestId,
          settleType,
          comment,
          splitModes = [],
          billInvoice,
          couponDiscount,
          subTotal,
        } = payment;

        // aggregate totals
        totalBillValue += billValue;
        totalInitialSubTotal += initialSubTotal;
        totalInitialTax += initialTax;
        totalInitialTotal += initialTotal;
        totalFinalSubTotal += finalSubTotal;
        totalTax += tax;
        totalServiceCharge += serviceCharge;
        totalAmount += total;
        totalTips += tips;
        totalClaimedCoins += claimedCoins;
        totalEarnCoins += earnCoins;
        totalDiscount += discount;
        totalCouponDiscount += couponDiscount;
        totalSubtotal += billValue;

        // flatten splitModes
        const splitInfo = Array.isArray(splitModes)
          ? splitModes.map((m: any) => `${m.name}=${m.amount}`).join("; ")
          : "";

        return {
          PAYMENT_ID: _id.toString(),
          DATE: new Date(date).toLocaleString(),
          USER_NAME: userId?.name ?? "",
          USER_PHONE: userId?.phone ?? "",
          TABLE_NAME: tableName || "",
          MODE: mode,
          PAYMENT_MODE: paymentMode,
          BILL_VALUE: billValue,
          INITIAL_SUBTOTAL: initialSubTotal,
          INITIAL_TAX: initialTax,
          INITIAL_TOTAL: initialTotal,
          SUBTOTAL: billValue,
          CLAIMED_COINS: claimedCoins,
          EARNED_COINS: earnCoins,
          DISCOUNT: discount,
          DISCOUNT_TYPE: discountType,
          TAX: tax,
          SERVICE_CHARGE: serviceCharge,
          TIPS: tips,
          TOTAL: total,
          MODES: splitInfo,
          SETTLE_TYPE: settleType,
          COMMENT: comment,
          WAITER_NAME: waiterName,
          POS_BILL_ID: posBillId,
          POS_BILL_REQUEST_ID: posBillRequestId,
          ORDER_ID: order_id?._id.toString() ?? "",
          COUPON_DISCOUNT: couponDiscount,
          BILL_INVOICE: billInvoice,
        };
      });

      // push totals row
      rows.push({
        PAYMENT_ID: "TOTALS (DO NOT EDIT THIS ROW)",
        DATE: "",
        USER_NAME: "",
        USER_PHONE: "",
        TABLE_NAME: "",
        MODE: "",
        PAYMENT_MODE: "",
        BILL_VALUE: `="${totalBillValue.toFixed(2)}"`,
        INITIAL_SUBTOTAL: `="${totalInitialSubTotal.toFixed(2)}"`,
        INITIAL_TAX: `="${totalInitialTax.toFixed(2)}"`,
        INITIAL_TOTAL: `="${totalInitialTotal.toFixed(2)}"`,
        SUBTOTAL: `="${totalFinalSubTotal.toFixed(2)}"`,
        CLAIMED_COINS: `="${totalClaimedCoins.toFixed(2)}"`,
        EARNED_COINS: `="${totalEarnCoins.toFixed(2)}"`,
        DISCOUNT: `="${totalDiscount.toFixed(2)}"`,
        DISCOUNT_TYPE: "",
        TAX: `="${totalTax.toFixed(2)}"`,
        SERVICE_CHARGE: `="${totalServiceCharge.toFixed(2)}"`,
        TIPS: `="${totalTips.toFixed(2)}"`,
        TOTAL: `="${totalAmount.toFixed(2)}"`,
        MODES: "",
        SETTLE_TYPE: "",
        COMMENT: "",
        WAITER_NAME: "",
        POS_BILL_ID: "",
        POS_BILL_REQUEST_ID: "",
        ORDER_ID: "",
        COUPON_DISCOUNT: "",
        BILL_INVOICE: 0,
      });

      const csvString = Papa.unparse(rows, {
        header: true,
        quotes: true,
        skipEmptyLines: true,
      });

      const formatDate = (timestamp: number) => {
        const d = new Date(timestamp);
        // Example: "2023-03-19"
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0",
        )}-${String(d.getDate()).padStart(2, "0")}`;
      };

      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);
      const fileName = `payments_${fromStr}_to_${toStr}.csv`;

      // Set response headers
      c.header("Content-Type", "text/csv");
      c.header("Content-Disposition", `attachment; filename="${fileName}"`);

      // Return the CSV directly
      return c.body(csvString);
    },
  );

export default billRouter;
