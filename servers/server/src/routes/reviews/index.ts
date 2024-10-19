import {
  GoogleAuthUser,
  GoogleReview,
  Reviews,
  User,
  UserReward,
} from "@hi/db-models";
import {
  GoogleAuthUsersAttrs,
  GoogleReviewsAttr,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
// books.ts
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

interface StaffReview {
  name: string;
  _id: string;
  1: number;
  3: number;
  5: number;
}

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
  .post(
    "/storeGoogleAuthUser",
    zValidator("json", GoogleAuthUsersAttrs),
    async (c) => {
      const requestData = await c.req.json();
      const { userId, loyaltyId, businessId } = requestData;
      console.log("requestData", requestData);

      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return respond(c, "User not found", true, 404, {});
      }

      const existingAuthUser = await GoogleAuthUser.findOne({
        userId,
        businessId: businessId,
      });

      console.log("existingAuthUser", existingAuthUser);

      if (existingAuthUser) {
        await UserReward.findOneAndUpdate(
          { userId, loyaltyId },
          {
            $inc: { googleReviewCount: 1 },
          },
        );

        return respond(
          c,
          "user already submitted reviews for this business",
          true,
          400,
          {},
        );
      }

      const saveUser = await GoogleAuthUser.create({
        userId,
        loyaltyId,
        businessId,
        authorName: requestData.authorName,
      });

      console.log("saveUser", saveUser);

      if (!saveUser) {
        return respond(c, "failed to save auth user", true, 400, {});
      }

      const rewards = await UserReward.findOneAndUpdate(
        { userId, loyaltyId },
        {
          $inc: { rewards: 20, googleReviewCount: 1 },
        },
      );

      console.log("rewardssave", rewards);

      if (!rewards) {
        return respond(c, "Rewards not found", true, 404, {});
      }

      return respond(c, "review post successFully", false, 200, {
        user: existingUser,
        count: rewards.scanCount,
        googleReviewCount: rewards.googleReviewCount,
        rewards: rewards.rewards,
      });
    },
  )
  .put(
    "/update-googlreview",
    zValidator("json", GoogleReviewsAttr),
    async (c) => {
      const requestData = await c.req.json();
      const { userId, loyaltyId } = requestData;

      await UserReward.findOneAndUpdate(
        { userId, loyaltyId },
        {
          $inc: { googleReviewCount: 1 },
        },
      );

      return respond(c, "review post successFully", false, 200, {});
    },
  )
  .post(
    "/staffReviews",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(100),
        from: z.number().optional(),
        to: z.number().optional(),
        best: z.boolean().optional(),
        worst: z.boolean().optional(),
      }),
    ),

    async (c) => {
      const requestData = await c.req.json();
      let { businessId, from, to, best, worst } = requestData;

      const currentTime = Date.now();
      const fifteenDaysAgo = currentTime - 15 * 24 * 60 * 60 * 1000;

      from = from ?? fifteenDaysAgo;
      to = to ?? currentTime;

      const reviews = await Reviews.find({
        businessId,
        date: { $gte: new Date(from), $lte: new Date(to) },
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

      if (best) {
        res = res.filter((staff) => staff[5] > 0 && staff[1] === 0);
      }

      if (worst) {
        res = res.filter((staff) => staff[1] > 0 && staff[5] === 0);
      }

      return respond(c, "reviews fetched successfully", false, 200, {
        res,
      });
    },
  );

export default reviewRouter;
