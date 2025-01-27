import { DuesUser, Payment, PendingDues, UpiMode, User } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//

const roles = [
  "MANAGER",
  "CO_OWNER",
  "CAPTAIN",
  "MARKETING_AGENT",
  "RESTAURANT_OWNER",
];
const duesRouter = new Hono()
  .get(
    "/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const duesUsers = await DuesUser.find({ businessId: businessId })
        .select("userId totalDuesAmount")
        .populate({
          path: "userId",
          select: "name phone",
        });
      return c.json({
        message: "Dues Users",
        data: duesUsers,
        err: false,
      });
    },
  )
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(50),
        name: z.string().min(1).max(50),
        phone: z.string().min(10).max(10),
      }),
    ),
    async (c) => {
      const { businessId, name, phone } = await c.req.json();

      const user = await User.findOne({ phone });

      const existingDuesUser = await DuesUser.findOne({
        userId: user?._id,
        businessId,
      });

      if (existingDuesUser) {
        return c.json(
          {
            message: "Dues User Already Exists",
            data: existingDuesUser,
            err: true,
          },
          409,
        );
      }

      let createdUser;
      if (!user) {
        createdUser = await User.create({ name, phone, role: roles });
      }

      // Create a new DuesUser
      const duesUser = await DuesUser.create({
        businessId,
        userId: user?._id || createdUser?._id,
      });

      return c.json({
        message: "Dues User Created",
        data: duesUser,
        err: false,
      });
    },
  )
  .get(
    "/user/:phone/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(50),
        phone: z.string().min(10).max(10),
      }),
    ),
    async (c) => {
      const { businessId, phone } = c.req.param();

      const user = await User.findOne({ phone });

      const duesUser = await DuesUser.findOne({
        businessId: businessId,
        userId: user?._id,
      })
        .select("userId")
        .populate({
          path: "userId",
          select: "name phone",
        });
      if (!duesUser) {
        return c.json(
          {
            message: "Dues User Not Found",
            data: {},
            err: true,
          },
          404,
        );
      }
      return c.json({
        message: "Dues User",
        data: duesUser,
        err: false,
      });
    },
  )

  .get(
    "/pending_dues/:duesUserId/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(50),
        duesUserId: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      const { duesUserId, businessId } = c.req.param();

      const pendingDues = await PendingDues.find({
        duesUserId,
        businessId,
      })
        .select("billId date isSettled")
        .populate("billId");

      const duesUser = await DuesUser.findById(duesUserId);

      return c.json({
        message: "Pending Dues",
        data: {
          totalDuesAmount: duesUser?.totalDuesAmount,
          duesUserId,
          bill: pendingDues,
        },
        err: false,
      });
    },
  )

  .put(
    "/settle_dues",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(50),
        duesUserId: z.string().min(1).max(50),
        billIds: z.array(z.string().min(1).max(50)),
        settleModes: z
          .array(
            z.object({
              name: z.string().max(100),
              amount: z.coerce.number().positive(),
              _id: z.string().max(100),
            }),
          )
          .min(1)
          .default([])
          .optional(),
      }),
    ),
    async (c) => {
      const { businessId, duesUserId, billIds, settleModes } =
        await c.req.json();
      const paymentMode = await UpiMode.findById(settleModes[0]?._id);

      const findBills = await Payment.find({
        _id: { $in: billIds },
      });

      console.log("findBills", findBills);

      const totalAmount = findBills.reduce((acc, bill) => {
        return acc + bill.total;
      }, 0);

      const updateBills = await Payment.updateMany(
        {
          _id: { $in: billIds },
        },
        {
          mode: paymentMode?.name,
          paymentMode: paymentMode?.name,
          splitModes: settleModes,
          date: Date.now(),
        },
      );

      const alreadySettled = await PendingDues.find({
        billId: { $in: billIds },
        duesUserId,
        isSettled: true,
      });

      if (alreadySettled.length > 0) {
        return c.json(
          {
            message: "already settled",
            data: {},
            err: true,
          },
          409,
        );
      }

      const updatePendingDues = await PendingDues.updateMany(
        {
          billId: { $in: billIds },
          duesUserId,
        },
        {
          isSettled: true,
        },
      );

      if (updatePendingDues.matchedCount === 0) {
        return c.json(
          {
            message: "already settled",
            data: {},
            err: true,
          },
          409,
        );
      }

      await DuesUser.updateOne(
        { _id: duesUserId },
        { $inc: { totalDuesAmount: -totalAmount } },
      );

      return c.json({
        message: "Dues Settled",
        data: {},
        err: false,
      });
    },
  );

export default duesRouter;
