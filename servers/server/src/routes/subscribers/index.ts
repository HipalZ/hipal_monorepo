import { LoyaltySettings, Subscriber, UserReward } from "@hi/db-models";
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

    const date = Date.now();
    console.log("createSubscriber", date);
    const createSubscriber = await Subscriber.create({
      ...requestData,
      date: Date.now(),
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
      await addSignUpBonus(userId, businessId, loyalty.signUpBonus);
    }

    if (loyalty?.signUpBonus && loyalty.signUpBonus > 0) {
      const userReward = await UserReward.findOne({ userId, businessId });
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
        message: "User already subscribed",
        err: false,
        data: { signUpBonus: loyalty.signUpBonus },
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
        }).select("rewards");

        return c.json(
          {
            message: "User already subscribed, ",
            err: false,
            data: subscriber,
            rewards: userReward?.rewards || 0,
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
  );

export default subsCriberRouter;
