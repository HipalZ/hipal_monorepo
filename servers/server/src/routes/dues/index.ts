import {
  DuesHistory,
  DuesUser,
  Order,
  Payment,
  PendingDues,
  TableSessionCounter,
  UpiMode,
  User,
} from "@hi/db-models";
import { duesSettleSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
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
    "/dues_history/:duesUserId/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(50),
        duesUserId: z.string().min(1).max(50),
      }),
    ),
    async (c) => {
      const { duesUserId, businessId } = c.req.param();

      let duesHistory = await DuesHistory.find({
        duesUserId: duesUserId,
      });

      // If no dues history, create a new one
      if (duesHistory.length === 0) {
        const newHistory = await DuesHistory.create({
          duesUserId: duesUserId,
          billInvoiceNumber: 0,
          settleAmount: 0,
          orderId: null,
          date: null,
        });
        duesHistory = [newHistory]; // Wrap in array to match return type
      }

      const pendingDues = await PendingDues.find({
        duesUserId: duesUserId,
        isSettled: false,
        businessId,
      });

      const billIds = pendingDues.map((due) => due.billId);

      const payments = await Payment.find({
        businessId,
        mode: "dues",
        _id: { $in: billIds },
      });

      const Obj: {
        duesHistory: typeof duesHistory;
        payments: typeof payments;
      } = {
        duesHistory,
        payments,
      };

      return c.json({
        message: "Dues History",
        data: Obj,
        err: false,
      });
    },
  )

  .put("/settle_dues", zValidator("json", duesSettleSchema), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { businessId, duesUserId, settleModes } = await c.req.json();
      const paymentMode = await UpiMode.findById(settleModes[0]?._id);

      const totalAmount = settleModes.reduce((acc, mode) => {
        return acc + mode.amount;
      }, 0);

      const duesUser = await DuesUser.findByIdAndUpdate(
        duesUserId,
        {
          $inc: { totalDuesAmount: -totalAmount },
        },
        { session, new: true },
      );

      const uniqueOrderId = nanoid(15);

      let modifyTotal = 0;
      if (
        paymentMode?.name === "npc" ||
        paymentMode?.name === "dues" ||
        paymentMode?.name === "complementary"
      ) {
        modifyTotal = 0;
      } else {
        modifyTotal = totalAmount;

        if (settleModes.length > 1) {
          for (const settle of settleModes) {
            if (settle.name === "complementary") {
              modifyTotal -= settle.amount;
            }
          }
        }
      }

      const saveOrder = await Order.create(
        [
          {
            total:
              paymentMode?.name === "npc" ||
              paymentMode?.name === "complementary"
                ? 0
                : totalAmount,
            currency: "INR",
            receipt: uniqueOrderId,
            userId: duesUser?.userId,
            claimedCoins: 0,
            tableName: "DUES",
            tips: 0,
            billValue: totalAmount,
            businessId: businessId,
            order_id: uniqueOrderId,

            date: Date.now(),
          },
        ],
        { session },
      );

      const saveTableSessionCounter = new TableSessionCounter({
        businessId: businessId,
        tableSessionId: saveOrder[0]._id,
      });

      await saveTableSessionCounter.save({ session });

      const sessionCount = await TableSessionCounter.countDocuments({
        businessId: businessId,
      });

      const savePayment = await Payment.create(
        [
          {
            businessId: businessId,
            order_id: saveOrder[0]._id,
            total: saveOrder[0].total,
            mode: settleModes.length > 1 ? "split" : paymentMode?.name,
            status: "SUCCESS",
            paymentMode: settleModes.length > 1 ? "split" : paymentMode?.name,
            userId: duesUser?.userId,
            claimedCoins: 0,
            billValue: saveOrder[0].billValue,
            tips: 0,
            tableName: saveOrder[0].tableName,
            earnCoins: 0,
            razorpayEventId: nanoid(15),
            razorpayOrderId: nanoid(15),
            razorpayPaymentId: nanoid(15),
            settleType: "DUES_SETTLE",
            comment: "DUES_SETTLE",

            splitModes: settleModes,
            date: Date.now(),
            billInvoice: sessionCount,
          },
        ],
        { session },
      );

      const newDuesHistory = new DuesHistory({
        orderId: saveOrder[0]._id,
        billInvoiceNumber: savePayment[0].billInvoice,
        settleAmount: totalAmount,
        duesUserId: duesUser?._id.toString(),
        date: Date.now(),
      });

      await newDuesHistory.save({ session });

      return c.json({
        message: "Dues Settled",
        data: {
          settleAmount: totalAmount,
        },
        err: false,
      });
    });
  });

export default duesRouter;
