import {
  Couponz,
  LoyaltySettings,
  Subscriber,
  User,
  UserReward,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
import { addSignUpBonus } from "../users";

const loyaltyRouter = new Hono().post(
  "/verify_otp",
  zValidator(
    "json",
    z.object({
      phone: z.string().min(10).max(10),
      otp: z.string().min(4).max(4),
      name: z.string().min(2).max(50),
      businessId: z.string().min(1).max(50),
    }),
  ),

  async (c) => {
    const { phone, otp, name, businessId } = await c.req.json();

    // Verify OTP
    const otpResponse = await axios({
      method: "GET",
      url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
      headers: {
        accept: "application/json",
        authkey: "387796AmyGlDBq63b2d75aP1",
      },
    });

    const invalidOtpMessages = [
      "Mobile no. not found",
      "OTP not match",
      "OTP expired",
      "Otp empty or not numeric",
      "Max limit reached for this otp verification",
    ];

    if (invalidOtpMessages.includes(otpResponse?.data?.message)) {
      return respond(c, "Please enter valid Otp !!", true, 400, {});
    }

    // Check loyalty settings
    const loyaltySetting = await LoyaltySettings.findOne({
      businessId,
      isActive: true,
    });

    if (!loyaltySetting) {
      return respond(
        c,
        "Loyalty settings not found for this business",
        true,
        400,
        {},
      );
    }

    // Find or create user
    let userData = await User.findOne({ phone });
    if (!userData) {
      userData = await User.create({ phone, name });

      // Add subscriber if not exists
      const subscriberExists = await Subscriber.findOne({
        userId: userData._id,
        businessId,
      });

      if (!subscriberExists) {
        await Subscriber.create({
          userId: userData._id,
          businessId,
          date: Date.now(),
          userCount: 1,
        });
      }

      // Add sign-up bonus if applicable
      if (loyaltySetting.signUpBonus) {
        await addSignUpBonus(
          loyaltySetting.loyaltyId.toString(),
          userData._id,
          loyaltySetting.signUpBonus,
        );
      }
    }

    // Fetch user coins and coupons
    const [userCoins, userGrabbedCoupons] = await Promise.all([
      UserReward.findOne({
        loyaltyId: loyaltySetting.loyaltyId,
        userId: userData._id,
      }),
      Couponz.find({
        businessId,
        "conditions.eligibleUser.allUsers": true,
        isActive: true,
        isDeleted: false,
      }),
    ]);

    const userDataResponse = {
      coins: userCoins?.rewards || 0,
      coupons: userGrabbedCoupons,
      userData: userData,
    };

    return respond(c, "loyalty", false, 200, userDataResponse);
  },
);

export default loyaltyRouter;
