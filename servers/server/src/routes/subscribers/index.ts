import {
  Business,
  LoyaltySettings,
  Subscriber,
  User,
  UserAnalytic,
  UserReward,
} from "@hi/db-models";
import { businessSubscriberValidator } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { addSignUpBonus } from "../users";
const subsCriberRouter = new Hono()
  .post("/", zValidator("json", businessSubscriberValidator), async (c) => {
    const requestData = await c.req.json();
    const { userId, businessId } = requestData;
    const existingSubscriber = await Subscriber.findOne({
      userId,
      businessId,
      isDeleted: false,
    });

    const userAnalytics = await UserAnalytic.findOne({
      userId: userId,
      businessId: businessId,
    }).select("userId");

    if (!userAnalytics) {
      await UserAnalytic.create({
        userId: userId,
        businessId: businessId,
        avgSpend: 0,
        totalSpend: 0,
        visitCount: 0,
        coinzIssued: 0,
        coinzUsed: 0,
        dateOfJoining: Date.now(),
      });
    }

    //
    if (existingSubscriber) {
      return c.json(
        {
          message: "User already subscribed",
          err: true,
          data: {},
        },
        409,
      );
    }

    const createSubscriber = await Subscriber.create({
      ...requestData,
      date: Date.now(),
      userCount: 1,
    });

    if (!createSubscriber) {
      return c.json(
        {
          message: "Error creating subscriber",
          err: true,
          data: {},
        },
        400,
      );
    }
    const loyalty = await LoyaltySettings.findOne({ businessId });

    if (loyalty?.signUpBonus && loyalty.signUpBonus > 0) {
      await addSignUpBonus(
        loyalty.loyaltyId.toString(),
        userId,
        loyalty.signUpBonus,
      );
    }

    if (loyalty?.signUpBonus && loyalty.signUpBonus > 0) {
      const userReward = await UserReward.findOne({
        userId,
        loyaltyId: loyalty.loyaltyId,
      });

      if (!userReward) {
        return c.json(
          {
            message: "No user reward found",
            err: true,
            data: {},
          },
          404,
        );
      }
      return c.json({
        message: "User subscribed successfully",
        err: false,
        data: {
          reward: loyalty.signUpBonus,
          count: userReward.scanCount,
          totalCoins: userReward.rewards,
        },
      });
    }

    return c.json(
      {
        message: "User subscribed successfully",
        err: false,
        data: createSubscriber,
      },
      201,
    );
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        userId: z.string({
          message: "userId is required",
        }),
        businessId: z.string({
          message: "businessId is required",
        }),
        loyaltyId: z
          .string({
            message: "loyaltyId is required",
          })
          .optional(),
      }),
    ),
    async (c) => {
      const { userId, businessId, loyaltyId } = c.req.query();
      const subscriber = await Subscriber.findOne({
        userId,
        businessId,
        isDeleted: false,
      });
      if (!subscriber) {
        return c.json(
          {
            message: "No subscribers found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const userAnalytics = await UserAnalytic.findOne({
        userId: userId,
        businessId: businessId,
      }).select("userId");

      if (!userAnalytics) {
        await UserAnalytic.create({
          userId: userId,
          businessId: businessId,
          avgSpend: 0,
          totalSpend: 0,
          visitCount: 0,
          coinzIssued: 0,
          coinzUsed: 0,
          dateOfJoining: Date.now(),
        });
      }
      if (subscriber) {
        await Subscriber.updateOne(
          { userId, businessId, isDeleted: false },
          { $inc: { userCount: 1 } },
        );

        const userReward = await UserReward.findOne({
          userId,
          loyaltyId,
        }).select("rewards googleReviewCount");

        return c.json(
          {
            message: "User already subscribed, ",
            err: false,
            data: subscriber,
            rewards: userReward?.rewards || 0,
            googleReviewCount: userReward?.googleReviewCount || 0,
          },
          200,
        );
      }
    },
  )
  .delete(
    "/:userId",
    zValidator(
      "param",
      z.object({
        userId: z.string({ message: "userId is required" }),
      }),
    ),

    async (c) => {
      const { userId } = c.req.param();
      await Subscriber.updateOne({ userId }, { isDeleted: true });
      return c.json(
        {
          message: "User unsubscribed successfully",
          err: false,
          data: {},
        },
        200,
      );
    },
  )
  .put(
    "/:userId",
    zValidator("json", businessSubscriberValidator),

    async (c) => {
      const { userId } = c.req.param();
      const requestData = await c.req.json();
      await Subscriber.updateOne({ userId }, requestData);
      return c.json(
        {
          message: "User updated successfully",
          err: false,
          data: {},
        },
        200,
      );
    },
  )
  .get(
    "/allSubscribers/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const subscribers = await Subscriber.find({
        isDeleted: false,
        businessId,
      });

      const totalUserCount = subscribers.reduce(
        (acc, sub) => acc + (sub.userCount ?? 0),
        0,
      );

      return c.json(
        {
          message: "Subscribers fetched successfully",
          err: false,
          data: {
            totalUserCount,
          },
        },
        200,
      );
    },
  )
  .get("/bulkSubscriber", async (c) => {
    const businesses = await Business.find({});
    const users = await User.find({});

    for (const business of businesses) {
      for (const user of users) {
        const existingSubscriber = await Subscriber.findOne({
          userId: user._id,
          businessId: business._id,
        });
        if (!existingSubscriber) {
          await Subscriber.create({
            userId: user._id,
            businessId: business._id,
            userCount: 1,
            date: Date.now(),
          });
        }
      }
    }

    return c.json(
      {
        message: "Bulk subscribers created successfullyy",
        err: false,
        data: {},
      },
      201,
    );
  })
  .get(
    "/all-subs/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const subscribers = await Subscriber.find({
        isDeleted: false,
        businessId,
      })
        .sort({ _id: 1 })
        .select("userId businessId -_id")
        .limit(5)
        .populate({
          path: "userId",
          select: "phone name",
        });

      return c.json(
        {
          message: "Subscribers fetched successfully",
          err: false,
          data: subscribers,
        },
        200,
      );
    },
  )

  .get(
    "/all/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),
    zValidator(
      "query",
      z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("20"),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const { page, limit } = c.req.query();
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const activeQuery = {
        isDeleted: false,
        businessId,
        whatsappMsgUnseenCount: { $gt: 0 },
        userId: { $ne: null },
      };

      const inactiveQuery = {
        isDeleted: false,
        businessId,
        whatsappMsgUnseenCount: 0,
        userId: { $ne: null },
      };

      const totalActive = await Subscriber.countDocuments(activeQuery);
      const totalInactive = await Subscriber.countDocuments(inactiveQuery);
      const totalSubscribers = totalActive + totalInactive;

      let subscribers = [];

      if (pageNum === 1) {
        // Page 1: Fetch ALL active + limit number of inactive
        const activeSubscribers = await Subscriber.find(activeQuery)
          .sort({ whatsappMsgUnseenCount: -1 })
          .select("userId businessId whatsappMsgUnseenCount lastUserMessageAt")
          .populate({
            path: "userId",
            select: "phone name",
          });

        const inactiveSubscribers = await Subscriber.find(inactiveQuery)
          .sort({ updatedAt: -1 }) // Sort inactive by recent activity/update if possible, else default
          .select("userId businessId whatsappMsgUnseenCount lastUserMessageAt")
          .populate({
            path: "userId",
            select: "phone name",
          })
          .limit(limitNum);

        subscribers = [...activeSubscribers, ...inactiveSubscribers];
      } else {
        // Page > 1: Fetch only inactive, utilizing skip logic relative to inactive list
        // Note: Page 1 took "limit" count of inactive.
        // So for Page 2, we skip "limit" (which was page 1's share of inactive).
        // skip = (2-1)*limit = limit. Correct.
        subscribers = await Subscriber.find(inactiveQuery)
          .sort({ updatedAt: -1 })
          .select("userId businessId whatsappMsgUnseenCount lastUserMessageAt")
          .populate({
            path: "userId",
            select: "phone name",
          })
          .skip(skip)
          .limit(limitNum);
      }

      const validSubscribers = subscribers.filter(
        (subscriber) => subscriber.userId !== null,
      );

      return c.json(
        {
          message: "Subscribers fetched successfully",
          err: false,
          data: validSubscribers,
          pagination: {
            currentPage: pageNum,
            // Calculate total pages based on Inactive count, treating Active as page 1 bonus? 
            // Better: Just total / limit approximation for scrollbar.
            totalPages: Math.ceil(totalSubscribers / limitNum),
            totalSubscribers,
            hasMore: validSubscribers.length > 0 && (skip + limitNum < totalInactive || pageNum === 1),
          },
        },
        200,
      );
    },
  )

  .get(
    "/subscriber-phone/:businessId/:phone",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
        phone: z.string({ message: "phone is required" }),
      }),
    ),

    async (c) => {
      const { businessId, phone } = c.req.param();
      const user = await User.findOne({ phone });
      if (!user) {
        return c.json(
          {
            message: "User not found",
            err: true,
            data: {},
          },
          404,
        );
      }
      const subscriber = await Subscriber.findOne({
        isDeleted: false,
        businessId,
        userId: user._id,
      })
        .select("userId businessId -_id")
        .populate({
          path: "userId",
          select: "phone name",
        });

      return c.json(
        {
          message: "Subscribers fetched successfully",
          err: false,
          data: subscriber,
        },
        200,
      );
    },
  )

  .get(
    "/fetch_all_subscribers/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const subscribers = await Subscriber.find({
        isDeleted: false,
        businessId,
      })

        .select("userId")
        .populate({
          path: "userId",
          select: "phone name",
        });

      return c.json(
        {
          message: "Subscribers fetched successfully",
          err: false,
          data: subscribers,
        },
        200,
      );
    },
  );

export default subsCriberRouter;
