import {
  CouponChannel,
  CouponLink,
  Couponz,
  GoogleAuthUser,
  GoogleReview,
  LoyaltySettings,
  OutLetInfo,
  Reviews,
  UrlModel,
  User,
  UserReward,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
// books.ts
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { schedule } from "node-cron";
import { z } from "zod";
import { respond } from "../../utils/response";
import { createAndScheduleCoupon } from "../couponz";

interface StaffReview {
  name: string;
  _id: string;
  1: number;
  3: number;
  5: number;
}

const couponCreated = async (
  businessId: string,
  userId: string,
  value: number,
  couponStartDate: number,
  couponEndDate: number,
  businessName: string,
  session: ClientSession,
) => {
  const obj = {
    name: "Special Offer",
    type: "FIX",
    businessId: businessId,
    config: {
      value: value,
      discountType: "AMOUNT",
      upto: value,
    },
    isActive: true,
    bgColour: "#9267EC",
    isPublish: true,
    isDeleted: false,
    cashbackAvailable: true,
    conditions: {
      individualUserLimit: {
        overAllLimit: 1,
      },
      billValue: 0,
      expiryClaimLimit: {
        overAllLimit: 1,
      },
      availability: {
        when: "allthetime",
        customDays: [],
        startTime: 0,
        endTime: 24,
      },
      eligibleUser: {
        allUsers: false,
        userIds: [userId],
        groupIds: [],
      },
      expiryAfterGrabbed: 0,
      couponStartDate: couponStartDate,
      couponEndDate: couponEndDate,
      tc: [
        `This coupon is created by ${businessName}  and has the final say in case of any disputes.`,
        "This is an Assigned coupon, hence transferring it to anyone else is not acceptable.",
        'This coupon works on bill value above "₹0" only.',
        "All the time",
        "This coupon works 24 hrs a day.",
        "This coupon is applicable only on dine-in.",
        "Hipalz has no role to play on issues, charges, refunds and other things related to this.",
      ],
    },
  };

  const createCoupon = await Couponz.create([obj], { session });
  const reminderDateObj = new Date(createCoupon[0].conditions.couponEndDate);
  const cronExpression = `${reminderDateObj.getMinutes()} ${reminderDateObj.getHours()} ${reminderDateObj.getDate()} ${
    reminderDateObj.getMonth() + 1
  } *`;
  schedule(cronExpression, async () => {
    await Couponz.findByIdAndUpdate(
      createCoupon[0]._id,
      {
        isActive: false,
        isDeleted: true,
        isExpired: true,
      },
      session,
    );
  });

  const channelId = await CouponChannel.findOne({
    name: "default",
    businessId: createCoupon[0].businessId,
  }).select("_id");
  // Generate short URL
  const longUrl = `https://api.hipalz.com/coupon-analytics/social/${createCoupon[0].businessId}/${createCoupon[0]._id}/${channelId?._id}`;
  const uniqueOrderId = nanoid(6);
  let createShortUrl = await UrlModel.findOne({ longUrl });

  if (!createShortUrl) {
    createShortUrl = await UrlModel.create(
      [
        {
          longUrl: longUrl,
          shortUrl: `https://api.hipalz.com/hipalz/${uniqueOrderId}`,
          urlCode: uniqueOrderId,
        },
      ],

      {
        session,
      },
    );
  }

  // Create coupon link
  await CouponLink.create(
    [
      {
        businessId: createCoupon[0].businessId,
        couponId: createCoupon[0]._id,
        channelId: channelId?._id,
        date: Date.now(),
        link: createShortUrl?.[0].shortUrl,
      },
    ],
    { session },
  );

  await createAndScheduleCoupon(
    userId.toString(),
    createCoupon[0].businessId.toString(),
    createCoupon[0].conditions.expiryAfterGrabbed ?? 0,
    createCoupon[0]._id.toString(),
    createCoupon[0].conditions.couponEndDate,
  );
  return { couponCreated: createCoupon[0], link: createShortUrl?.[0].shortUrl };
};

const calculateReward = async (
  exist: number,
  reward: number,
  limit: number,
) => {
  const total = exist + reward;
  const sum = Math.min(total, limit);
  const finalReward = Math.round(Math.abs(sum - exist));
  return { finalReward, curentBalance: sum };
};

const reviewRouter = new Hono()
  .get(
    "/googleReviews",
    zValidator(
      "query",
      z.object({
        placeId: z
          .string({
            message: "placeId is required",
          })
          .min(1)
          .max(100),
        businessId: z.string().min(1).max(100),
        userId: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const { placeId, businessId, userId } = c.req.query();

      const GOOGLE_API_KEY =
        process.env.GOOGLE_API_KEY || "AIzaSyCwLRn4hzSvhztHSz8fBLWawijGtKCXcuY";

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${GOOGLE_API_KEY}`,
      );

      const reviews = response.data.result.reviews;

      for (const review of reviews) {
        const existingUser = await GoogleAuthUser.findOne({
          authorName: review.author_name,
          businessId: businessId,
          userId,
        });
        if (existingUser) {
          await GoogleReview.updateOne(
            {
              userId: existingUser.userId,
              businessId: existingUser.businessId,
              authorName: existingUser.authorName,
            },
            {
              $set: {
                authorName: review.author_name,
                rating: review.rating,
                comment: review.text,
                profilePhotoUrl: review.profile_photo_url,
                userId: existingUser.userId,
                businessId: existingUser.businessId,
              },
            },
            { upsert: true },
          );
        }
      }

      const existingReviews = await GoogleReview.find({
        businessId: businessId,
      });

      return respond(c, "reviews fetched successfully", false, 200, {
        reviews: existingReviews,
      });
    },
  )
  .put(
    "/update-google-review",
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1).max(100),
        loyaltyId: z.string().min(1).max(100),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { userId, loyaltyId } = requestData;

      const reviewAlreadyExist = await UserReward.findOne({
        userId,
        loyaltyId,
        googleReviewCount: { $eq: 1 },
      });

      if (reviewAlreadyExist) {
        return respond(c, "Google review already exist", true, 409, {});
      }

      const userRewards = await UserReward.findOneAndUpdate(
        { userId, loyaltyId },
        {
          $inc: { googleReviewCount: 1 },
        },
        { new: true },
      );

      if (!userRewards) {
        return respond(c, "User not found", true, 404, {});
      }

      if (userRewards.googleReviewCount === 1) {
        await UserReward.findOneAndUpdate(
          { userId, loyaltyId },
          {
            $inc: { rewards: 25 },
          },
        );
      }

      return respond(
        c,
        "Google review count updated successfully",
        false,
        200,
        {
          googleReviewCount: userRewards.googleReviewCount,
        },
      );
    },
  )

  .get(
    "/staffReviews",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(100),
        from: z.string().optional(),
        to: z.string().optional(),
        best: z.string().optional(),
        worst: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, from, to, best, worst } = c.req.query() as {
        businessId: string;
        from?: string;
        to?: string;
        best?: string;
        worst?: string;
      };
      const fromDate = from ? Number(from) : undefined;
      const toDate = to ? Number(to) : undefined;

      const currentTime = Date.now();
      const fiveDaysAgo = currentTime - 15 * 24 * 60 * 60 * 1000;

      const fromTimestamp = fromDate ?? fiveDaysAgo;
      const toTimestamp = toDate ?? currentTime;

      const reviews = await Reviews.find({
        businessId,
        date: { $gte: new Date(fromTimestamp), $lte: new Date(toTimestamp) },
        staffs: { $exists: true, $ne: [] },
      }).populate({
        path: "staffs",
        select: "name",
      });

      interface ReviewObj {
        [key: string]: StaffReview;
      }
      const reviewObj: ReviewObj = {};

      for (const review of reviews) {
        for (const staff of review?.staffs || []) {
          if (!reviewObj[staff?._id]) {
            reviewObj[staff._id] = {
              name: staff.name,
              _id: staff._id,
              1: 0,
              3: 0,
              5: 0,
            };
          }
          reviewObj[staff._id][review.reviewRating] =
            (reviewObj[staff._id][review.reviewRating] || 0) + 1;
        }
      }

      let res = Object.values(reviewObj);

      if (best === "true") {
        res = res.filter((staff) => staff[5] > 0 && staff[1] === 0);
      }

      if (worst === "true") {
        res = res.filter((staff) => staff[1] > 0 && staff[5] === 0);
      }

      return respond(c, "reviews fetched successfully", false, 200, {
        res,
      });
    },
  )
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(100),
        from: z.string().optional(),
        to: z.string().optional(),
        pageNumber: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, from, to, pageNumber } = c.req.query() as {
        businessId: string;
        from?: string;
        to?: string;
        pageNumber?: string;
      };
      const fromDate = from ? Number(from) : undefined;
      const toDate = to ? Number(to) : undefined;

      const PAGE_SIZE = 20;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

      const currentTime = Date.now();
      const fiveDaysAgo = currentTime - 5 * 24 * 60 * 60 * 1000;

      const fromTimestamp = fromDate ?? fiveDaysAgo;
      const toTimestamp = toDate ?? currentTime;

      const reviews = await Reviews.find({
        businessId,
        date: { $gte: new Date(fromTimestamp), $lte: new Date(toTimestamp) },
      })
        .populate({
          path: "staffs",
          select: "name phone",
        })
        .populate({
          path: "order_id",
          select: "total",
        })
        .populate({
          path: "userId",
          select: "name phone",
        })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select(
          "userId reviewRating description staffs date order_id seen foodTaste ambience hygiene service",
        );
      return respond(c, "reviews fetched successfully", false, 200, {
        reviews,
      });
    },
  )
  .get(
    "/:reviewId",
    zValidator(
      "param",
      z.object({
        reviewId: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const { reviewId } = c.req.param();
      const review = await Reviews.findById(reviewId)
        .populate({
          path: "staffs",
          select: "name phone",
        })
        .populate({
          path: "order_id",
          select: "total",
        })
        .populate({
          path: "userId",
          select: "name phone",
        })

        .select("userId reviewRating description staffs date order_id");

      if (!review) {
        return respond(c, "Review not found", true, 404, {});
      }

      await Reviews.findByIdAndUpdate(reviewId, {
        seen: true,
      });

      return respond(c, "reviews fetched successfully", false, 200, {
        review,
      });
    },
  )
  .post(
    "/addCoins",
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1).max(100),
        loyaltyId: z.string().min(1).max(100),
        coins: z.number(),
        password: z.number(),
        businessId: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      const { userId, loyaltyId, coins, password, businessId } = requestData;

      const loyaltyUser = await UserReward.findOne({
        userId,
        loyaltyId,
        password,
      });

      if (!loyaltyUser) {
        return respond(c, "User not found", true, 404, {});
      }

      const loyaltySetting = await LoyaltySettings.findOne({
        businessId,
        isActive: true,
      }).select("rewardLimit");

      if (!loyaltySetting) {
        return respond(c, "Loyalty setting not found", true, 404, {});
      }

      const existingUserReward = await UserReward.findOne({
        userId,
        loyaltyId,
        password,
      }).select("rewards");

      if (!existingUserReward) {
        return respond(c, "User not found", true, 404, {});
      }

      const reward = await calculateReward(
        existingUserReward?.rewards,
        coins,
        loyaltySetting?.rewardLimit || 4999,
      );

      await UserReward.findOneAndUpdate(
        { userId, loyaltyId },
        {
          $inc: { rewards: reward.finalReward },
        },
      );

      return respond(c, "Coins added successfully", false, 200, {});
    },
  )
  .post(
    "/sendMessage",
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1).max(100),
        loyaltyId: z.string().optional(),
        coins: z.coerce
          .number({
            message: "coins is required",
          })
          .optional(),
        password: z.coerce
          .number({
            message: "password is required",
          })
          .optional(),
        businessId: z.string().min(1).max(100),
        value: z.coerce
          .number({
            message: "value is required",
          })
          .optional(),
        couponStartDate: z.number().optional(),
        couponEndDate: z.number().optional(),
        businessName: z.string().optional(),
        placeUrl: z.string().optional(),
        customLink: z.string().optional(),
        message: z.string().min(1).max(500),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const {
          userId,
          loyaltyId,
          coins,
          password,
          businessId,
          value,
          couponStartDate,
          couponEndDate,
          businessName,
          customLink,
          message,
        } = requestData;

        const user = await User.findById(userId);
        const placeUrl = await OutLetInfo.findOne({ businessId }).select(
          "placeUrl",
        );
        if (loyaltyId) {
          //add coins
          const loyaltyUser = await UserReward.findOne({
            userId,
            loyaltyId,
            password,
          });

          if (!loyaltyUser) {
            return respond(c, "User not found", true, 404, {});
          }

          const loyaltySetting = await LoyaltySettings.findOne({
            businessId,
            isActive: true,
          }).select("rewardLimit");

          if (!loyaltySetting) {
            return respond(c, "Loyalty setting not found", true, 404, {});
          }

          const existingUserReward = await UserReward.findOne({
            userId,
            loyaltyId,
            password,
          }).select("rewards");

          if (!existingUserReward) {
            return respond(c, "User not found", true, 404, {});
          }

          const reward = await calculateReward(
            existingUserReward?.rewards,
            coins,
            loyaltySetting?.rewardLimit || 4999,
          );

          // send whatsapp message
          const token =
            "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";
          const body = `${message}.\nhttps://hipalz.com/${customLink}/explore?tableName=review`;
          const whatappConfig = {
            method: "post",
            url: "https://graph.facebook.com/v21.0/365941956611521/messages",

            headers: { Authorization: `Bearer ${token}` },

            data: {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: `${user?.phone}`,
              type: "text",
              text: {
                body: body,
              },
            },
            session: session,
          };

          const res = await axios(whatappConfig);

          if (res.status === 200) {
            await UserReward.findOneAndUpdate(
              { userId, loyaltyId },
              {
                $inc: { rewards: reward.finalReward },
              },
              session,
            );
            return respond(c, "Coins added successfully", false, 200, {});
          }

          return respond(c, "Failed to send message", true, 400, {});
        }
        //create coupon
        if (!loyaltyId) {
          const createCoupon = await couponCreated(
            businessId,
            userId,
            value,
            couponStartDate,
            couponEndDate,
            businessName,
            session,
          );
          const token =
            "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";

          const body = `${message}\n\nHere your coupon link ${createCoupon.link}`;
          const whatappConfig = {
            method: "post",
            url: "https://graph.facebook.com/v21.0/365941956611521/messages",
            headers: { Authorization: `Bearer ${token}` },
            data: {
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: `${user?.phone}`,
              type: "text",
              text: {
                body: body,
              },
            },
          };

          const res = await axios(whatappConfig);

          if (res.status === 200) {
            return respond(
              c,
              "coupon created and send to what app successfully",
              false,
              200,
              {},
            );
          }

          return respond(c, "Failed to send message", true, 400, {});
        }

        const token =
          "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";

        const body = `${message}.\n\n Please review us on google ${placeUrl?.placeUrl}`;
        const whatappConfig = {
          method: "post",
          url: "https://graph.facebook.com/v21.0/365941956611521/messages",
          headers: { Authorization: `Bearer ${token}` },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `${user?.phone}`,
            type: "text",
            text: {
              body: body,
            },
          },
        };

        const res = await axios(whatappConfig);
        if (res.status === 200) {
          return respond(
            c,
            "coupon created and send to what app successfully",
            false,
            200,
            {},
          );
        }

        return respond(c, "Failed to send message", true, 400, {});
      });
    },
  )
  .post(
    "/createExtendCoupon",
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1).max(100),
        businessId: z.string().min(1).max(100),
        value: z.number().optional(),
        couponStartDate: z.number().optional(),
        couponEndDate: z.number().optional(),
        businessName: z.string().optional(),
        placeUrl: z.string().optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const requestData = await c.req.json();
        const {
          userId,

          businessId,
          value,
          couponStartDate,
          couponEndDate,
          businessName,
        } = requestData;

        const user = await User.findById(userId).select("name phone");
        const placeUrl = await OutLetInfo.findOne({ businessId }).select(
          "placeUrl",
        );

        const createCoupon = await couponCreated(
          businessId,
          userId,
          value,
          couponStartDate,
          couponEndDate,
          businessName,
          session,
        );
        const token =
          "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";

        const body = `Hi ${user?.name},\nWe are so glad that you loved our service. We work really hard to make sure that we make your every visit special.\nMake sure to use our loyalty program to grab exclusive rewards on every billing..\nWe would love for you to share your experience on Google & win more coinz. It really helps us! \nhere your coupon link ${createCoupon.link}  \nreview us on google ${placeUrl?.placeUrl}`;
        const whatappConfig = {
          method: "post",
          url: "https://graph.facebook.com/v21.0/365941956611521/messages",
          headers: { Authorization: `Bearer ${token}` },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: `${user?.phone}`,
            type: "text",
            text: {
              body: body,
            },
          },
        };

        await axios(whatappConfig);
        return respond(c, " successfully", false, 200, {});
      });
    },
  )
  .post(
    "/googleRatings",
    zValidator(
      "json",
      z.object({
        placeId: z
          .string({
            message: "placeId is required",
          })
          .min(1)
          .max(100),
        businessId: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const { placeId, businessId } = await c.req.json();

      const GOOGLE_API_KEY =
        process.env.GOOGLE_API_KEY || "AIzaSyCwLRn4hzSvhztHSz8fBLWawijGtKCXcuY";

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating&key=${GOOGLE_API_KEY}`,
      );

      const avgRating = response.data.result.rating;
      await OutLetInfo.findOneAndUpdate(
        { businessId },
        {
          avgRating,
        },
      );

      return respond(c, "rating fetched successfully", false, 200, {});
    },
  );

export default reviewRouter;
