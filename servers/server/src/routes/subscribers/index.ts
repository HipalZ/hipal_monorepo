import {
  Business,
  LoyaltySettings,
  Subscriber,
  User,
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
        .limit(5)
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
  );

export default subsCriberRouter;
