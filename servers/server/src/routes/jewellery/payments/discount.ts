import { Couponz, JewelleryOrder } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import { recalcAndUpdateTotal } from "../../../utils/jewellery/payments";
import { respond } from "../../../utils/response";

const discountRouter = new Hono()

  .post(
    "/coins/add",
    zValidator(
      "json",
      z.object({
        orderId: z.string().length(24),
        coinsAppliedPercent: z.number().int().min(1).max(100),
      }),
    ),
    async (c) => {
      const { orderId, coinsAppliedPercent } = await c.req.json();
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const order = await JewelleryOrder.findById(orderId).session(session);
        if (!order) return respond(c, "Order not found", true, 404, {});
        if (order.isCouponApplied)
          return respond(c, "Coupon already applied", true, 400, {});

        const subTotal = order.subTotal ?? 0;
        const coinsApplied = Math.round((subTotal * coinsAppliedPercent) / 100);
        const finalCoin = Math.min(coinsApplied, subTotal);

        await recalcAndUpdateTotal(orderId, session, {
          claimedCoins: finalCoin,
          isCoinApplied: true,
          coinsAppliedPercent,
        });

        return respond(c, "Coins applied successfully", false, 200, {});
      });
    },
  )

  .post(
    "/coins/remove",
    zValidator("json", z.object({ orderId: z.string().length(24) })),
    async (c) => {
      const { orderId } = await c.req.json();
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const order = await JewelleryOrder.findById(orderId).session(session);
        if (!order) return respond(c, "Order not found", true, 404, {});

        await recalcAndUpdateTotal(orderId, session, {
          claimedCoins: 0,
          isCoinApplied: false,
          coinsAppliedPercent: 0,
        });

        return respond(c, "Coins removed successfully", false, 200, {});
      });
    },
  )

  .post(
    "/coupons/add",
    zValidator(
      "json",
      z.object({
        orderId: z.string().length(24),
        couponId: z.string().length(24),
      }),
    ),
    async (c) => {
      const { orderId, couponId } = await c.req.json();
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const order = await JewelleryOrder.findById(orderId).session(session);
        if (!order) return respond(c, "Order not found", true, 404, {});

        const coupon = await Couponz.findById(couponId).session(session);
        if (!coupon) return respond(c, "Coupon not found", true, 404, {});

        const subTotal = order.subTotal ?? 0;
        let couponDiscount = 0;
        // @ts-ignore
        if (coupon?.config?.discountType === "PERCENTAGE") {
          // @ts-ignore
          const percentValue = ((coupon?.config?.value || 0) / 100) * subTotal;
          couponDiscount = Math.min(
            percentValue,
            // @ts-ignore
            coupon?.config?.upto || Number.POSITIVE_INFINITY,
          );
        } else {
          // @ts-ignore
          couponDiscount = coupon?.config?.value || 0;
        }

        couponDiscount = Math.min(couponDiscount, subTotal);

        await recalcAndUpdateTotal(orderId, session, {
          couponId,
          couponDiscount,
          isCouponApplied: true,
          couponAppliedPercent: subTotal ? couponDiscount / subTotal : 0,
        });

        return respond(c, "Coupon applied successfully", false, 200, {});
      });
    },
  )

  .post(
    "/coupons/remove",
    zValidator("json", z.object({ orderId: z.string().length(24) })),
    async (c) => {
      const { orderId } = await c.req.json();
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const order = await JewelleryOrder.findById(orderId).session(session);
        if (!order) return respond(c, "Order not found", true, 404, {});

        await recalcAndUpdateTotal(orderId, session, {
          couponId: null,
          couponDiscount: 0,
          isCouponApplied: false,
          couponAppliedPercent: 0,
        });

        return respond(c, "Coupon removed successfully", false, 200, {});
      });
    },
  )

  .post(
    "/tips/add",
    zValidator(
      "json",
      z.object({
        orderId: z.string().length(24),
        tips: z.number().int().min(1),
      }),
    ),
    async (c) => {
      const { orderId, tips } = await c.req.json();
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const order = await JewelleryOrder.findById(orderId).session(session);
        if (!order) return respond(c, "Order not found", true, 404, {});

        await recalcAndUpdateTotal(orderId, session, {
          tips,
          isTipsApplied: true,
        });

        return respond(c, "Tips applied successfully", false, 200, {});
      });
    },
  )

  .post(
    "/tips/remove",
    zValidator("json", z.object({ orderId: z.string().length(24) })),
    async (c) => {
      const { orderId } = await c.req.json();
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const order = await JewelleryOrder.findById(orderId).session(session);
        if (!order) return respond(c, "Order not found", true, 404, {});

        await recalcAndUpdateTotal(orderId, session, {
          tips: 0,
          isTipsApplied: false,
          tipsAppliedPercent: 0,
        });

        return respond(c, "Tips removed successfully", false, 200, {});
      });
    },
  );

export default discountRouter;
