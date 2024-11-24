import {
  ChannelView,
  CouponChannel,
  CouponLink,
  CouponView,
  Couponz,
  GroupModel,
  UrlModel,
  User,
  UserCouponGrabb,
} from "@hi/db-models";
import {
  type CouponzAvailabilityType,
  type CouponzDays,
  type UserCouponGrabbType,
  couponSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { schedule } from "node-cron";
import { z } from "zod";

import { runInTransaction } from "@hi/utils";
import { nanoid } from "nanoid";
import { respond } from "../../utils/response";

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const weekends = ["saturday", "sunday"];
// Helper function to determine day eligibilityy
function switchDayEligibility(
  availability: CouponzAvailabilityType,
  currentDay: string,
) {
  switch (availability.when) {
    case "allthetime":
      return true;
    case "weekdays":
      return weekdays.includes(currentDay);
    case "weekends":
      return weekends.includes(currentDay);
    case "custom":
      return availability.customDays?.includes(currentDay as CouponzDays);
    default:
      return false;
  }
}

export const createAndScheduleCoupon = async (
  userId: string,
  businessId: string,
  expiryHour: number,
  couponId: string,
  couponEndDate: number,
  dob?: number,
  specialday?: number,
  channelId?: string,
) => {
  const currentDate = new Date();
  const expiryHours = expiryHour || 0;

  let expiryDate = new Date(currentDate.getTime() + expiryHours);

  if (expiryDate.getTime() > couponEndDate) {
    expiryDate = new Date(couponEndDate);
  }

  const grabbedCoupon = await UserCouponGrabb.create({
    businessId: businessId,
    count: 1,
    userId,
    couponId: couponId,
    date: Date.now(),
    expiryDate,
    dob,
    specialday,
    channelId,
  });

  if (expiryHours > 0) {
    const cronExpression = `${expiryDate.getMinutes()} ${expiryDate.getHours()} ${expiryDate.getDate()} ${
      expiryDate.getMonth() + 1
    } *`;

    schedule(cronExpression, async () => {
      await UserCouponGrabb.findByIdAndUpdate(grabbedCoupon._id, {
        isDeleted: true,
      });
    });
  }
};

// Helper function to determine time eligibility
function switchTimeEligibility(
  availability: CouponzAvailabilityType,
  currentTime: number,
) {
  return (
    availability.startTime == null ||
    (currentTime >= availability.startTime &&
      currentTime <= availability.endTime)
  );
}

function getCurrentTimeDecimal() {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  return Number(`${hours}.${minutes < 10 ? "0" : ""}${minutes}`);
}

const couponzRouter = new Hono()
  .get(
    "/all/:businessId",
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

      const coupons = await Couponz.find({
        isDeleted: false,
        businessId,
        isDeleted: false,
      })
        .sort({ _id: -1 })
        .lean();
      for (const coupon of coupons) {
        const couponLinks = await CouponLink.find({
          couponId: coupon._id,
        })
          .populate({
            path: "channelId",
            select: "name",
          })
          .select("link -_id");
        coupon.links = couponLinks;
      }
      return c.json(
        {
          message: "Coupons found",
          err: false,
          data: coupons,
        },
        200,
      );
    },
  )
  .get(
    "/:couponId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "CouponId should be a string",
        }),
      }),
    ),
    async (c) => {
      const { couponId } = c.req.param();
      const coupon = await Couponz.findOne({ _id: couponId, isDeleted: false });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      return c.json(
        {
          message: "Coupon found",
          err: false,
          data: coupon,
        },
        200,
      );
    },
  )
  .delete(
    "/:couponId",
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "CouponId should be a string",
        }),
      }),
    ),
    async (c) => {
      const { couponId } = c.req.param();
      const coupon = await Couponz.findByIdAndUpdate(couponId, {
        isDeleted: true,
      });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      const updateAllUserGrabb = await UserCouponGrabb.updateMany(
        {
          couponId: couponId,
        },
        {
          isDeleted: true,
        },
      );
      if (!updateAllUserGrabb) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      return respond(c, "Coupon deleted successfully", false, 200, {});
    },
  )
  .post("/", zValidator("json", couponSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { conditions } = await c.req.json();
      const requestData = await c.req.json();
      const { availability, eligibleUser } = conditions;

      const noExpiryWhenValues = [
        "allthetime",
        "birthday",
        "birthdayweek",
        "birthdaymonth",
      ];

      if (noExpiryWhenValues.includes(availability.when)) {
        conditions.couponStartDate = 0;
        conditions.couponEndDate = 0;
        availability.startTime = 0;
        availability.endTime = 24;
      }

      // Clear requiredFields if eligibleUser has userIds or groupIds
      if (
        eligibleUser?.userIds?.length > 0 ||
        eligibleUser?.groupIds?.length > 0
      ) {
        conditions.requiredFields = [];
      }
      if (availability.startTime === 0 && availability.endTime === 0) {
        availability.startTime = 0;
        availability.endTime = 24;
      }

      const createdCoupon = await Couponz.create([requestData], { session });

      if (!createdCoupon) {
        return c.json({
          err: true,
          message: "not created",
          data: {},
        });
      }

      // Schedule deactivation if couponEndDate is set
      if (createdCoupon[0].conditions.couponEndDate > 0) {
        const reminderDateObj = new Date(
          createdCoupon[0].conditions.couponEndDate,
        );
        const cronExpression = `${reminderDateObj.getMinutes()} ${reminderDateObj.getHours()} ${reminderDateObj.getDate()} ${
          reminderDateObj.getMonth() + 1
        } *`;

        schedule(cronExpression, async () => {
          await Couponz.findByIdAndUpdate(
            createdCoupon[0]._id,
            {
              isActive: false,
              isDeleted: true,
              isExpired: true,
            },
            { session },
          );
        });
      }

      // Find or create default channel
      let channelId = await CouponChannel.findOne({
        name: "default",
        businessId: createdCoupon[0].businessId,
      }).select("_id");

      if (!channelId) {
        channelId = await CouponChannel.create({
          businessId: createdCoupon[0].businessId,
          name: "default",
          date: Date.now(),
          isActive: true,
        });

        if (!channelId) {
          return c.json({
            err: true,
            message: "channel not created",
            data: {},
          });
        }
      }

      // Generate short URL
      const longUrl = `https://api.hipalz.com/coupon-analytics/social/${createdCoupon[0].businessId}/${createdCoupon[0]._id}/${channelId._id}`;
      const uniqueOrderId = nanoid(10);
      let createShortUrl = await UrlModel.findOne({ longUrl });

      if (!createShortUrl) {
        createShortUrl = await UrlModel.create({
          longUrl: longUrl,
          shortUrl: `https://api.hipalz.com/hipalz/${uniqueOrderId}`,
          urlCode: uniqueOrderId,
        });

        if (!createShortUrl) {
          return c.json({
            err: true,
            message: "short url not created",
            data: {},
          });
        }
      }

      // Create coupon link
      await CouponLink.create(
        [
          {
            businessId: createdCoupon[0].businessId,
            couponId: createdCoupon[0]._id,
            channelId: channelId._id,
            date: Date.now(),
            link: createShortUrl.shortUrl,
          },
        ],
        { session },
      );
      const { userIds = [], groupIds = [] } =
        createdCoupon?.[0].conditions?.eligibleUser || {};

      const scheduleCouponForUser = async (userId: string) => {
        await createAndScheduleCoupon(
          userId.toString(),
          createdCoupon[0].businessId.toString(),
          createdCoupon[0].conditions.expiryAfterGrabbed ?? 0,
          createdCoupon[0]._id.toString(),
          createdCoupon[0].conditions.couponEndDate,
        );
      };

      for (const userId of userIds) {
        await scheduleCouponForUser(userId.toString());
      }

      for (const groupId of groupIds) {
        const group = await GroupModel.findById(groupId);
        for (const userId of group?.userIds || []) {
          await scheduleCouponForUser(userId.toString());
        }
      }

      const couponResponse = {
        _id: createdCoupon[0]._id,
        businessId: createdCoupon[0].businessId,
        name: createdCoupon[0].name,
        config: {
          value: createdCoupon[0].config.value,
          discountType: createdCoupon[0].config.discountType,
          upto: createdCoupon[0].config.upto,
        },
        image: createdCoupon[0].image,
        bgColour: createdCoupon[0].bgColour,
        conditions: {
          billValue: createdCoupon[0].conditions.billValue,
          couponStartDate: createdCoupon[0].conditions.couponStartDate,
          couponEndDate: createdCoupon[0].conditions.couponEndDate,
          requiredFields: createdCoupon[0].conditions.requiredFields,
          availability: {
            when: createdCoupon[0].conditions.availability.when,
            startTime: createdCoupon[0].conditions.availability.startTime,
            endTime: createdCoupon[0].conditions.availability.endTime,
            customDays: createdCoupon[0].conditions.availability.customDays,
          },
          tc: createdCoupon[0].conditions.tc,
          links: [
            {
              channelId: {
                _id: channelId?._id,
                name: "default",
              },
              link: createShortUrl.shortUrl,
            },
          ],
        },
      };

      return respond(
        c,
        "Coupon created successfully",
        false,
        201,
        couponResponse,
      );
    });
  })
  .put(
    "/:couponId",
    zValidator("json", couponSchema.partial()),
    zValidator(
      "param",
      z.object({
        couponId: z.string({
          message: "CouponId should be a string",
        }),
      }),
    ),
    async (c) => {
      const requestData = await c.req.json();
      const { couponId } = c.req.param();

      const coupon = await Couponz.findOne({ _id: couponId, isDeleted: false });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }

      const updateCoupon = await Couponz.findByIdAndUpdate(
        couponId,
        { isPublish: requestData.isPublish },
        {
          new: true,
        },
      );

      if (!updateCoupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }

      return respond(
        c,
        "Coupon updated successfully",
        false,
        200,
        updateCoupon,
      );
    },
  )
  .get(
    "/eligible-coupons/:businessId/:userId",
    zValidator(
      "param",
      z.object({
        userId: z.string({ message: "userId should be a string" }),
        businessId: z.string({ message: "businessId should be a string" }),
      }),
    ),
    async (c) => {
      const { userId, businessId } = c.req.param();
      const currentDate = Date.now();
      const currentDay = new Date()
        .toLocaleString("en-us", { weekday: "long" })
        .toLowerCase();
      const currentTime = getCurrentTimeDecimal();

      const fetchAllGrabbedCoupons = await UserCouponGrabb.find({
        userId,
        businessId,
        isDeleted: false,
      }).select("couponId");

      const grabbedCouponIds = fetchAllGrabbedCoupons.map((coupon) =>
        coupon.couponId.toString(),
      );

      const fetchAllExpireGrabbedCoupons =
        (await UserCouponGrabb.find({
          userId,
          businessId,
          isDeleted: true,
        }).select("couponId")) || [];

      // Fetch all active coupons
      const coupons = await Couponz.find({
        $or: [
          {
            "conditions.couponStartDate": 0,
            "conditions.couponEndDate": 0,
            businessId: businessId,
            isDeleted: false,
            _id: { $in: grabbedCouponIds },
            isPublish: true,
          },
          {
            "conditions.couponStartDate": { $lte: currentDate },
            "conditions.couponEndDate": { $gte: currentDate },
            businessId: businessId,
            isDeleted: false,
            _id: { $in: grabbedCouponIds },
            isPublish: true,
          },
        ],
      });

      const eligibles = await Couponz.find({
        $or: [
          {
            "conditions.couponStartDate": 0,
            "conditions.couponEndDate": 0,
            businessId: businessId,
            isDeleted: false,
            "conditions.eligibleUser.allUsers": true,
            isPublish: true,
          },
          {
            "conditions.couponStartDate": { $lte: currentDate },
            "conditions.couponEndDate": { $gte: currentDate },
            businessId: businessId,
            isDeleted: false,
            "conditions.eligibleUser.allUsers": true,
            isPublish: true,
          },
        ],
      });

      const eligibleCoupons = eligibles.filter((coupon) => {
        const { conditions } = coupon;
        const isDayEligible = switchDayEligibility(
          conditions.availability,
          currentDay,
        );

        const isTimeEligible = switchTimeEligibility(
          conditions.availability,
          currentTime,
        );

        // Check overall day and time eligibility
        if (isDayEligible && isTimeEligible) return true;

        // Check user eligibility
        if (conditions.eligibleUser.allUsers && isTimeEligible) {
          return true; // Coupon is available to all users
        }

        // If none of the conditions match, the user is not eligible
      });

      const eligibleGrabCoupons = coupons.filter((coupon) => {
        const { conditions } = coupon;
        const isDayEligible = switchDayEligibility(
          conditions.availability,
          currentDay,
        );

        const isTimeEligible = switchTimeEligibility(
          conditions.availability,
          currentTime,
        );

        // Check overall day and time eligibility
        if (isDayEligible && isTimeEligible) return true;

        // If none of the conditions match, the user is not eligible
      });

      // Combine both arrays and filter unique coupons
      const allCoupons = [...eligibleGrabCoupons, ...eligibleCoupons];
      const uniqueCouponsMap = new Map();

      for (const coupon of allCoupons) {
        uniqueCouponsMap.set(coupon._id.toString(), coupon);
      }

      const uniqueCoupons = Array.from(uniqueCouponsMap.values());
      const expireGrabbedCouponIds = fetchAllExpireGrabbedCoupons.map(
        (coupon) => coupon.couponId.toString(),
      );

      const filterCouponz = uniqueCoupons.filter(
        (coupon) => !expireGrabbedCouponIds.includes(coupon._id.toString()),
      );

      return c.json({
        message: "Eligible coupons found",
        err: false,
        data: filterCouponz,
      });
    },
  )
  .get(
    "/promot-couponz/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId should be a string" }),
      }),
    ),
    zValidator(
      "query",
      z.object({
        userId: z.string({ message: "userId should be a string" }),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const { userId } = c.req.query();
      const currentDate = Date.now();
      const currentDay = new Date()
        .toLocaleString("en-us", { weekday: "long" })
        .toLowerCase();
      const currentTime = getCurrentTimeDecimal();

      let fetchAllGrabbedCoupons: UserCouponGrabbType[] = [];
      let fetchAllExpireGrabbedCoupons: UserCouponGrabbType[] = [];

      if (userId) {
        fetchAllGrabbedCoupons =
          (await UserCouponGrabb.find({
            userId,
            businessId,
            isDeleted: false,
          }).select("couponId")) || [];

        fetchAllExpireGrabbedCoupons =
          (await UserCouponGrabb.find({
            userId,
            businessId,
            isDeleted: true,
          }).select("couponId")) || [];
      }

      // Fetch all active coupons
      const coupons = await Couponz.find({
        $or: [
          {
            "conditions.couponStartDate": 0,
            "conditions.couponEndDate": 0,
            businessId: businessId,
            promote: true,
            isDeleted: false,
            isPublish: true,
          },
          {
            "conditions.couponStartDate": { $lte: currentDate },
            "conditions.couponEndDate": { $gte: currentDate },
            businessId: businessId,
            promote: true,
            isDeleted: false,
            isPublish: true,
          },
        ],
      });

      const promotCoupons = coupons.filter((coupon) => {
        const { conditions } = coupon;
        const isDayEligible = switchDayEligibility(
          conditions.availability,
          currentDay,
        );

        const isTimeEligible = switchTimeEligibility(
          conditions.availability,
          currentTime,
        );

        // Check overall day and time eligibility
        return isDayEligible && isTimeEligible;
      });

      const grabbedCouponIds = fetchAllGrabbedCoupons?.map((coupon) =>
        coupon?.couponId?.toString(),
      );

      const expireGrabbedCouponIds = fetchAllExpireGrabbedCoupons?.map(
        (coupon) => coupon.couponId.toString(),
      );

      const filteredAssignCouponz = promotCoupons?.filter(
        (coupon) => !grabbedCouponIds?.includes(coupon._id.toString()),
      );

      const filteredGrabbedCoupons = filteredAssignCouponz.filter(
        (coupon) => !expireGrabbedCouponIds?.includes(coupon._id.toString()),
      );

      return c.json({
        message: "Eligible coupons found",
        err: false,
        data: filteredGrabbedCoupons,
      });
    },
  )
  .post(
    "/grabbed-couponz",
    zValidator(
      "json",
      z.object({
        userId: z.string({ message: "userId should be a string" }),
        couponId: z.string({ message: "couponId should be a string" }),
        dob: z.number().optional(),
        specialday: z.number().optional(),
        businessId: z.string({ message: "businessId should be a string" }),
        channelId: z
          .string({ message: "channelId should be a string" })
          .optional(),
      }),
    ),
    async (c) => {
      const { userId, couponId, dob, specialday, channelId } =
        await c.req.json();

      const coupon = await Couponz.findOne({ _id: couponId, isDeleted: false });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }

      await CouponView.create({
        couponId: couponId,
        date: Date.now(),
        businessId: coupon.businessId,
      });
      if (channelId) {
        await ChannelView.findOneAndUpdate(
          {
            channelId: channelId,
            businessId: coupon.businessId,
          },
          { $inc: { viewCount: 1 } },
          { upsert: true, new: true },
        );
      }

      const user = await User.findOne({
        _id: userId,
        dob: { $exists: true },
      });
      const dateOfBirth = user?.dob ?? dob;

      await User.findByIdAndUpdate(
        userId,
        { $setOnInsert: { dob: dateOfBirth } },
        { upsert: true, new: true },
      );

      const alreadyGrabbed = await UserCouponGrabb.findOne({
        couponId: couponId,
        userId: userId,
        businessId: coupon.businessId,
      });

      if (alreadyGrabbed) {
        return respond(c, "Coupon already grabbed", true, 409, {});
      }

      await createAndScheduleCoupon(
        userId.toString(),
        coupon.businessId.toString(),
        coupon.conditions.expiryAfterGrabbed ?? 0,
        coupon._id.toString(),
        coupon.conditions.couponEndDate,
        dateOfBirth,
        specialday,
        channelId,
      );
      return respond(c, "Coupon grabbed successfully", false, 201, coupon);
    },
  )
  .post(
    "/check-grabbed-couponz",
    zValidator(
      "json",
      z.object({
        userId: z.string({ message: "userId should be a string" }),
        couponId: z.string({ message: "couponId should be a string" }),
        businessId: z.string({ message: "businessId should be a string" }),
        channelId: z
          .string({ message: "channelId should be a string" })
          .optional(),
      }),
    ),
    async (c) => {
      const { userId, couponId, businessId } = await c.req.json();
      const coupon = await Couponz.findOne({ _id: couponId, isDeleted: false });
      if (!coupon) {
        return respond(c, "Coupon not found", true, 404, {});
      }
      await CouponView.create({
        couponId: couponId,
        date: Date.now(),
        businessId: businessId,
      });

      const alreadyGrabbed = await UserCouponGrabb.findOne({
        couponId: couponId,
        userId: userId,
        businessId: businessId,
      });

      if (alreadyGrabbed) {
        return respond(c, "Coupon already grabbed", true, 409, {});
      }

      if (!alreadyGrabbed) {
        return respond(c, "Coupon not grabbed", true, 400, {});
      }
    },
  )
  .get(
    "/promotAfterBill-couponz/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId should be a string" }),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const currentDate = Date.now();
      const currentDay = new Date()
        .toLocaleString("en-us", { weekday: "long" })
        .toLowerCase();
      const currentTime = getCurrentTimeDecimal();

      // Fetch all active coupons
      const coupons = await Couponz.find({
        $or: [
          {
            "conditions.couponStartDate": 0,
            "conditions.couponEndDate": 0,
            businessId: businessId,
            promoteOnBill: true,
            isDeleted: false,
            isPublish: true,
          },
          {
            "conditions.couponStartDate": { $lte: currentDate },
            "conditions.couponEndDate": { $gte: currentDate },
            businessId: businessId,
            promoteOnBill: true,
            isDeleted: false,
            isPublish: true,
          },
        ],
      });

      const promotCoupons = coupons.filter((coupon) => {
        const { conditions } = coupon;
        const isDayEligible = switchDayEligibility(
          conditions.availability,
          currentDay,
        );

        const isTimeEligible = switchTimeEligibility(
          conditions.availability,
          currentTime,
        );

        // Check overall day and time eligibility
        return isDayEligible && isTimeEligible;
      });

      return c.json({
        message: "Eligible coupons found",
        err: false,
        data: promotCoupons,
      });
    },
  )
  .get(
    "/all-couponz/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "businessId should be a string",
        }),
      }),
    ),
    zValidator(
      "query",
      z.object({
        isActive: z.string({
          message: "isActive should be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const { isActive } = c.req.query();
      const isActiveValue = isActive === "true";
      const coupons = await Couponz.find({
        businessId,
        isDeleted: false,
        isActive: isActiveValue,
      }).select("businessId name config conditions.couponEndDate");

      return c.json(
        {
          message: "Coupons found",
          err: false,
          data: coupons,
        },
        200,
      );
    },
  );

export default couponzRouter;
