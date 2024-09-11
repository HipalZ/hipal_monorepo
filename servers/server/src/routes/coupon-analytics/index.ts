import { Business, CouponChannel, CouponLink } from "@hi/db-models";
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
  .post(
    "/generate-links",
    zValidator(
      "json",
      z.object({
        couponId: z.string({
          message: "couponId should be a string",
        }),

        channelIds: z
          .array(
            z.string({
              message: "channelIds should be a string",
            }),
          )
          .default([])
          .optional(),
        removeChannelIds: z
          .array(
            z.string({
              message: "removeChannelIds should be a string",
            }),
          )
          .default([])
          .optional(),
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const {
        couponId,
        channelIds = [],
        removeChannelIds = [],
        businessId,
      } = await c.req.json();

      if (removeChannelIds.length > 0) {
        CouponLink.deleteMany({
          businessId: businessId,
          couponId: couponId,
          channelId: { $in: removeChannelIds },
        });

        await CouponChannel.updateMany(
          {
            _id: { $in: removeChannelIds },
          },
          {
            $pull: {
              couponIds: couponId,
            },
          },
        );
      }

      if (channelIds.length > 0) {
        await CouponChannel.updateMany(
          {
            _id: { $in: channelIds },
          },
          {
            $addToSet: {
              couponIds: couponId,
            },
          },
        );
      }

      const links = [];
      for (const channelId of channelIds) {
        const alreadyExist = await CouponLink.findOne({
          businessId: businessId,
          channelId: channelId,
          couponId: couponId,
        });

        if (alreadyExist) {
          return c.json(
            { err: true, msg: "Link already exist", data: {} },
            400,
          );
        }
        const link = new CouponLink({
          businessId: businessId,
          channelId: channelId,
          couponId: couponId,
          link: `https://api.hipalz.com/coupon-analytics/social/${businessId}/${couponId}/${channelId}`,
        });
        await link.save();
        links.push({
          channelId: channelId,
          link: link.link,
        });
      }

      return c.json({ err: false, msg: "Links generated", data: links }, 201);
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
  )
  .get(
    "/view-coupon/:couponId/:channelId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "couponId should be a string",
        }),
        channelId: z.string({
          message: "channelId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { couponId, channelId } = c.req.param();

      const viewLink = await CouponLink.findOne({
        couponId: couponId,
        channelId: channelId,
      });
      if (!viewLink) {
        return c.json({ err: true, msg: "Link not found", data: {} }, 400);
      }

      return c.json({ err: false, msg: "fetch successfully", data: viewLink });
    },
  )
  .get(
    "/social/:businessId/:couponId/:channelId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "couponId should be a string",
        }),
        channelId: z.string({
          message: "channelId should be a string",
        }),
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { couponId, channelId, businessId } = c.req.param();

      const customLink =
        await Business.findById(businessId).select("customLink");

      //logic to increase the count of the link

      return c.redirect(
        `https://hipalz.com/couponz/${customLink?.customLink}/${couponId}/${channelId}`,
      );
    },
  );

export default couponAnalyticsRouter;
