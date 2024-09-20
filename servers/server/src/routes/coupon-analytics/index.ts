import {
  Business,
  ChannelView,
  CouponChannel,
  CouponLink,
  CouponView,
  Couponz,
  Payment,
  UserCouponClaim,
  UserCouponGrabb,
} from "@hi/db-models";
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
  .put(
    "/channels/:couponId/:channelId",
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
      const { couponId, channelId } = await c.req.json();

      const updateLink = await CouponLink.findOneAndUpdate(
        {
          couponId: couponId,
          channelId: channelId,
        },
        {
          $set: {
            isActive: false,
          },
        },
      );

      if (!updateLink) {
        return c.json({ err: true, msg: "Link not found", data: {} }, 400);
      }

      return c.json(
        { err: false, msg: "channel created", data: updateLink },
        200,
      );
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
          link: `http://localhost:4500/coupon-analytics/social/${businessId}/${couponId}/${channelId}`,
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
      const activeCouponz = await Couponz.find({
        businessId,
        isActive: true,
        isDeleted: false,
      }).count();

      const totalCouponz = await CouponView.find({
        businessId,
      }).count();

      const totalGrabbed = await UserCouponGrabb.find({ businessId }).count();

      const payments = await Payment.find({
        businessId,
        couponId: { $exists: true },
      }).select("total");

      const totalSale = payments.reduce((acc, curr) => acc + curr.total, 0);

      const temp = {
        totalActiveCoupons: activeCouponz,
        totalReach: totalCouponz,
        totalGrabbed: totalGrabbed,
        totalClaimed: payments.length,
        totalSales: totalSale,
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
    zValidator(
      "query",
      z.object({
        from: z.string({
          message: "from should be a string",
        }),
        to: z.string({
          message: "to should be a string",
        }),
        timeRange: z
          .string({
            message: "timeRange should be a string",
          })
          .default("thisWeek")
          .optional(),
      }),
    ),

    async (c) => {
      const { couponId } = c.req.param();
      const { from, to, timeRange } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);

      const totalViews = await CouponView.find({
        couponId: couponId,
        date: { $gte: fromDate, $lte: toDate },
      }).count();
      const totalGrabs =
        (await UserCouponGrabb.find({
          couponId: couponId,
          date: { $gte: fromDate, $lte: toDate },
        }).count()) ?? 0;
      const totalClaims = await Payment.find({
        couponId: couponId,
        date: { $gte: fromDate, $lte: toDate },
      }).select("couponId total claimedCoins");

      const totalSales = totalClaims.reduce((acc, curr) => acc + curr.total, 0);
      const totalDiscount = totalClaims.reduce(
        (acc, curr) => acc + (curr.claimedCoins ?? 0),
        0,
      );

      const repeatUsers = (await UserCouponClaim.findOne({
        couponId: couponId,
      }).select("overAllLimit")) ?? { overAllLimit: 0 };

      let successPercentage = Math.round(
        Math.abs(((totalViews - totalClaims.length) / totalViews) * 100) ?? 0,
      );

      if (!successPercentage) {
        successPercentage = 0;
      }

      const summary = {
        totalReach: totalViews,
        totalGrabbed: totalGrabs,
        totalClaimed: totalClaims.length,
        totalDiscount: totalDiscount,
        totalSales: totalSales,
        newUsers: totalGrabs,
        repeatUsers: repeatUsers.overAllLimit,
        successPercentage: successPercentage,
      };

      return c.json({ err: false, msg: "fetch successfully", data: summary });
    },
  )
  .get(
    "/channels-analytics/:businessId/:couponId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
        couponId: z.string({
          message: "couponId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId, couponId } = c.req.param();

      const fetchChannels = await CouponLink.find({
        businessId: businessId,
        couponId: couponId,
      }).populate("channelId");
      const ans = [];

      for (const channel of fetchChannels) {
        const channelView = await ChannelView.findOne({
          channelId: channel.channelId,
          businessId: businessId,
        });
        const totalChannelGrabbed = await UserCouponGrabb.find({
          channelId: channel.channelId,
        }).count();

        const payments = await Payment.find({
          channelId: channel.channelId,
        }).select("total");

        const totalChannelSales = payments.reduce(
          (acc, curr) => acc + curr.total,
          0,
        );
        const channelData = {
          name: channel.channelId.name,
          isActive: channel.channelId.isActive,
          totalReach: channelView?.viewCount || 0,
          totalGrabbed: totalChannelGrabbed,
          totalSales: totalChannelSales,
        };
        ans.push(channelData);
      }

      return c.json({ err: false, msg: "fetch successfully", data: ans });
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

      const channels = await CouponChannel.find({
        businessId: businessId,
      });

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

      const totalGrabs =
        (await UserCouponGrabb.find({
          businessId: businessId,
        }).count()) ?? 0;

      const channelViews = await ChannelView.find({
        businessId: businessId,
      }).select("viewCount");
      const totalChannelViews = channelViews.reduce(
        (acc, curr) => acc + curr.viewCount,
        0,
      );

      const totalChannelgrabbed = await UserCouponGrabb.find({
        businessId: businessId,
        channelId: { $exists: true },
      }).count();
      const payments = await Payment.find({
        businessId: businessId,
        channelId: { $exists: true },
      }).select("total");
      const totalChannelSales = payments.reduce(
        (acc, curr) => acc + curr.total,
        0,
      );

      const obj = {
        totalReach: totalChannelViews,
        totalGrabbed: totalChannelgrabbed,
        totalSales: totalChannelSales,
        newUsers: totalGrabs,
      };

      return c.json({ err: false, msg: "fetch successfully", data: obj });
    },
  )
  .get(
    "/business-analytics/:businessId",
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
      const fetchChannels = await CouponChannel.find({
        businessId: businessId,
      });
      const ans = [];

      for (const channel of fetchChannels) {
        const channelView = await ChannelView.findOne({
          channelId: channel._id,
          businessId: businessId,
        });
        const totalChannelGrabbed = await UserCouponGrabb.find({
          channelId: channel._id,
        }).count();

        const payments = await Payment.find({
          channelId: channel._id,
        }).select("total");

        const totalChannelSales = payments.reduce(
          (acc, curr) => acc + curr.total,
          0,
        );
        const channelData = {
          name: channel.name,
          isActive: channel.isActive,
          totalReach: channelView?.viewCount || 0,
          totalGrabbed: totalChannelGrabbed || 0,
          totalSales: totalChannelSales || 0,
        };
        ans.push(channelData);
      }

      return c.json({ err: false, msg: "fetch successfully", data: ans });
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

      const activeCoupon = await CouponLink.findOne({
        couponId: couponId,
        channelId: channelId,
      });
      if (activeCoupon && !activeCoupon.isActive) {
        return c.redirect(`http://localhost:3000/${customLink?.customLink}`);
      }

      await CouponView.create({
        couponId: couponId,
        date: Date.now(),
        businessId: businessId,
      });
      await ChannelView.findOneAndUpdate(
        {
          channelId: channelId,
          businessId: businessId,
        },
        { $inc: { viewCount: 1 } },
        { upsert: true, new: true },
      );

      return c.redirect(
        `http://localhost:3000/${customLink?.customLink}/couponz/${couponId}/${channelId}`,
      );
    },
  )
  .get(
    "/couponz-links/:businessId/:couponId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "couponId should be a string",
        }),
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),

    async (c) => {
      const { couponId, businessId } = c.req.param();

      const links = await CouponLink.find({
        businessId: businessId,
        couponId: couponId,
      });

      return c.json({ err: false, msg: "fetch successfully", data: links });
    },
  );

export default couponAnalyticsRouter;
