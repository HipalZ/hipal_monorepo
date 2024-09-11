import { CouponChannel } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const couponAnalyticsRouter = new Hono()
  .post(
    "/channels",
    zValidator(
      "json",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
        name: z.string({
          message: "name should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId, name } = await c.req.json();
      const alreadyExist = await CouponChannel.findOne({
        businessId: businessId,
        name: name,
      });
      if (alreadyExist) {
        return c.json(
          { err: true, msg: "Channel already exist", data: {} },
          400,
        );
      }

      const channel = new CouponChannel({
        businessId: businessId,
        name: name,
      });

      await channel.save();

      return c.json({ err: false, msg: "channel created", data: channel }, 201);
    },
  )
  .get(
    "/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();

      const temp = {
        businessId: businessId,
        totalActiveCoupons: 11,
        totalReach: 1000,
        totalGrabbed: 100,
        totalClaimed: 50,
        newUsers: 10,
        totalSales: 100000,
      };

      return c.json({ err: false, msg: "Coupon Analytics", data: temp });
    },
  )
  .get(
    "/couponDashboard/:couponId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "couponId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { couponId } = c.req.param();

      const summary = {
        totalReach: 1000,
        totalGrabbed: 100,
        totalClaimed: 50,
        totalDiscount: 10,
        totalSales: 100000,
        newUsers: 10,
        repeatUsers: 20,
        successPercentage: 50,
      };

      return c.json({ err: false, msg: "fetch successfully", data: summary });
    },
  )
  .get(
    "/channels-analytics/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();

      const channels = [
        {
          name: "Facebook",
          totalReach: 1000,
          totalGrabbed: 100,
          totalSales: 100000,
          _id: "1",
          isActive: true,
        },
        {
          name: "Instagram",
          totalReach: 3000,
          totalGrabbed: 500,
          totalSales: 25000,
          _id: "2",
          isActive: false,
        },
        {
          name: "Twitter",
          totalReach: 356,
          totalGrabbed: 500,
          totalSales: 3652,
          _id: "3",
          isActive: true,
        },
      ];

      return c.json({ err: false, msg: "fetch successfully", data: channels });
    },
  )
  .get(
    "/channels/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();

      const channels = [
        {
          name: "Facebook",
          _id: "1",
        },
        {
          name: "Instagram",
          _id: "2",
        },
        {
          name: "Twitter",
          _id: "3",
        },
      ];

      return c.json({ err: false, msg: "fetch successfully", data: channels });
    },
  )
  .get(
    "/channels-dashboard/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();

      const obj = {
        totalReach: 1000,
        totalGrabbed: 100,
        totalSales: 100000,
        newUsers: 10,
      };

      return c.json({ err: false, msg: "fetch successfully", data: obj });
    },
  );

export default couponAnalyticsRouter;
