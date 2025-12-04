import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const admin = require("firebase-admin");

const salonPosRouter = new Hono()
  .post(
    "/bill",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(500).optional(),
        token: z.string().min(1).max(500).optional(),
        billSummary: z
          .object({
            billId: z.string().min(1).max(500).optional(),
            customerName: z.string().min(1).max(500).optional(),
            customerPhone: z.string().min(1).max(500).optional(),
            subTotal: z.number().optional(),
            gst: z.number().optional(),
            discount: z.number().optional(),
            claimedCoins: z.number().optional(),
            couponDiscount: z.number().optional(),
            serviceCharge: z.number().optional(),
            tips: z.number().optional(),
            total: z.number().optional(),
          })
          .optional(),
      }),
    ),
    async (c) => {
      const body = await c.req.json();
      return c.json({
        message: "success",
        err: false,
        data: {},
      });
    },
  )
  .post(
    "/payment/webhook",
    zValidator(
      "json",
      z.object({
        billId: z.string().min(1).max(500).optional(),
        token: z.string().min(1).max(500).optional(),
      }),
    ),
    async (c) => {
      const body = {
        businessId: "1",
        token: "1234567890",
        billSummary: {
          billId: 1,
          customerName: "guest",
          customerPhone: "1234567890",
          subTotal: 100,
          gst: 5,
          discount: 0,
          claimedCoins: 0,
          couponDiscount: 0,
          serviceCharge: 0,
          tips: 0,
          total: 105,
          mode: "upi",
          paymentStatus: 1,
        },
      };
      return c.json({
        message: "success",
        err: false,
        data: body,
      });
    },
  );

export default salonPosRouter;
