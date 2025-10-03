import {
  DuesUser,
  JewelleryOrder,
  JewelleryPayment,
  JewelleryPaymentAlert,
  LoyaltySettings,
  NpcUser,
  PendingDues,
  UpiMode,
} from "@hi/db-models";
import {
  jewelleryAcceptOrderSchema,
  paramsSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  calculateCashbackCoins,
  creditUserCoins,
  deductUserCoins,
} from "../../../utils/jewellery/common";
import { respond } from "../../../utils/response";
import { endOfToday, startOfToday } from "../../payments";
//
const alertRouter = new Hono()
  .put(
    "/:alertId/accept",

    zValidator("param", z.object({ alertId: z.string() })),
    zValidator("json", jewelleryAcceptOrderSchema),

    async (c) => {
      const { alertId } = c.req.param();
      const requestData = await c.req.json();
      const { staffId, settleModes = [], duesUserId, npcUserId } = requestData;
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const alert = await JewelleryPaymentAlert.findOne(
          { _id: alertId, isAccepted: false },
          null,
          { session },
        );

        if (!alert) {
          return c.json({ message: "Alert not found", err: true, data: {} });
        }

        const existingLoyalty = await LoyaltySettings.findOne({
          businessId: alert.businessId,
          isActive: true,
        }).select("loyaltyId");

        if (alert.alertType !== "OFFLINE") {
          const updateAlert = await JewelleryPaymentAlert.findByIdAndUpdate(
            alertId,
            { isAccepted: true, staffId },
            { new: true, session },
          );
          return c.json({
            message: "Order accepted successfully",
            err: false,
            data: updateAlert,
          });
        }

        if (alert.alertType === "OFFLINE") {
          if (alert && !alert.isAccepted) {
            const order = await JewelleryOrder.findById(alert.orderId);

            const paymentMode = await UpiMode.findById(settleModes[0]._id);

            if (!paymentMode) {
              return c.json({
                message: "Payment mode not found",
                err: true,
                data: {},
              });
            }

            if (order) {
              let finalCashBack = 0;
              if (
                paymentMode?.name !== "complementary" &&
                paymentMode?.name !== "npc"
              ) {
                let cashBack = await calculateCashbackCoins(
                  order.businessId.toString(),
                  Number(order.subTotal),
                  Number(order.claimedCoins),
                  Number(order.couponDiscount),
                  Number(order.discount),
                );

                if (existingLoyalty?.loyaltyId && order.claimedCoins > 0) {
                  await deductUserCoins(
                    Number(order?.claimedCoins),
                    existingLoyalty?.loyaltyId?.toString() || "",
                    order._id.toString(),
                    order.userId.toString(),
                    session,
                  );
                  if (order.cashbackAvailable === false) {
                    cashBack = 0;
                  }
                }

                finalCashBack = await creditUserCoins(
                  cashBack,
                  order.userId.toString(),
                  order._id.toString(),
                  order.businessId.toString(),

                  existingLoyalty?.loyaltyId.toString() || "",

                  session,
                );
              }

              const npcUser = await NpcUser.findById(npcUserId);

              let modifyTotal = 0;
              if (
                paymentMode?.name === "npc" ||
                paymentMode?.name === "dues" ||
                paymentMode?.name === "complementary"
              ) {
                modifyTotal = 0;
              } else {
                modifyTotal = order.total;

                if (settleModes.length > 1) {
                  for (const settle of settleModes) {
                    if (settle.name === "complementary") {
                      modifyTotal -= settle.amount ?? 0;
                    }
                  }
                }
              }

              await JewelleryOrder.updateOne(
                { _id: order._id },
                {
                  $set: {
                    total:
                      paymentMode?.name === "npc" ||
                      paymentMode?.name === "complementary"
                        ? 0
                        : order?.total,
                    claimedCoins:
                      paymentMode?.name === "npc" ||
                      paymentMode?.name === "complementary"
                        ? 0
                        : order?.claimedCoins,
                    isPaid: true,
                  },
                },
                { new: true, session },
              );

              const createPayment = await JewelleryPayment.create(
                [
                  {
                    businessId: alert.businessId,
                    orderId: order?._id,

                    mode: settleModes.length > 1 ? "split" : paymentMode?.name,
                    status: "SUCCESS",
                    paymentMode:
                      settleModes.length > 1 ? "split" : paymentMode?.name,
                    userId:
                      paymentMode?.name === "npc"
                        ? npcUser?.userId
                        : order?.userId,

                    earnCoins:
                      paymentMode?.name === "npc" ||
                      paymentMode?.name === "complementary"
                        ? 0
                        : finalCashBack,
                    razorpayEventId: nanoid(15),
                    razorpayOrderId: nanoid(15),
                    razorpayPaymentId: nanoid(15),

                    splitModes: settleModes,
                    date: Date.now(),
                    billItems: [],
                  },
                ],
                { session },
              );

              if (duesUserId && paymentMode?.name === "dues") {
                await PendingDues.create(
                  [
                    {
                      billId: createPayment[0]._id,
                      businessId: order.businessId,
                      date: Date.now(),
                      duesUserId: duesUserId,
                      isSettled: false,
                    },
                  ],
                  {
                    session,
                  },
                );

                await DuesUser.findByIdAndUpdate(
                  duesUserId,
                  {
                    $inc: {
                      totalDuesAmount: order.total,
                    },
                  },
                  { session },
                );
              }

              if (npcUserId && paymentMode?.name === "npc") {
                await NpcUser.findByIdAndUpdate(
                  npcUserId,
                  {
                    $inc: {
                      totalNpcAmount: order.total,
                    },
                  },
                  { session },
                );
              }
            }

            const updateAlert = await JewelleryPaymentAlert.findByIdAndUpdate(
              alertId,
              { isAccepted: true, staffId },
              { new: true, session },
            );

            return c.json({
              message: "Order accepted successfully",
              err: false,
              data: updateAlert,
            });
          }
        }
        return c.json({ message: "Invalid alert type", err: true, data: {} });
      });
    },
  )
  .put(
    "/:alertId/reject",

    zValidator("json", z.object({ staffId: z.string().min(24).max(24) })),

    async (c) => {
      const { alertId } = c.req.param();
      const requestData = await c.req.json();
      const { staffId } = requestData;

      const updateAlert = await JewelleryPaymentAlert.findByIdAndUpdate(
        alertId,
        { isRejected: true, isAccepted: true, staffId },
        { new: true },
      );

      if (!updateAlert)
        return c.json({ message: "Alert not found", err: true, data: {} });

      return c.json({
        message: "Order rejected successfully",
        err: false,
        data: {
          alertId: updateAlert._id,
        },
      });
    },
  )

  // .get(
  //   "/waiter",

  //   zValidator("query", z.object({ businessId: z.string() })),

  //   async (c) => {
  //     const { businessId } = c.req.query();

  //     const existingPaymentAlerts = await JewelleryPaymentAlert.find({
  //       businessId,
  //       alertType: ["WAITER"],
  //       isAccepted: false,
  //     })
  //       .sort({ _id: -1 })
  //       .populate({
  //         path: "order_id",
  //       })
  //       .populate({
  //         path: "userId",
  //         select: "name phone",
  //       });

  //     return respond(
  //       c,
  //       "existing paymentAlert",
  //       false,
  //       200,
  //       existingPaymentAlerts,
  //     );
  //   },
  // )
  .get(
    "/",
    zValidator("query", z.object({ businessId: z.string().min(24).max(24) })),

    async (c) => {
      const { businessId } = c.req.query();

      const existingPaymentAlerts = await JewelleryPaymentAlert.find({
        businessId,
        alertType: {
          $in: ["ONLINE", "NORMAL_SETTLE", "OFFLINE"],
        },
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate({
          path: "orderId",
        })
        .populate({
          path: "userId",
          select: "name phone",
        })
        .populate({
          path: "staffId",
          select: "name phone",
        });

      return respond(
        c,
        "existing paymentAlert",
        false,
        200,
        existingPaymentAlerts,
      );
    },
  )
  .get(
    "/history",

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }
      if (!from && !to) {
        const existingPaymentAlerts = await JewelleryPaymentAlert.find({
          businessId,
          isAccepted: true,
          isRejected: false,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "orderId",
          })
          .populate({
            path: "userId",
            select: "name phone",
          })
          .populate({
            path: "staffId",
            select: "name phone",
          });

        return c.json({
          data: existingPaymentAlerts,
          status: 200,
          err: false,
        });
      }

      if (from && to) {
        const existingPaymentAlerts = await JewelleryPaymentAlert.find({
          businessId,
          isAccepted: true,
          isRejected: false,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "orderId",
          })
          .populate({
            path: "userId",
            select: "name phone",
          })
          .populate({
            path: "staffId",
            select: "name phone",
          });

        return c.json({
          data: existingPaymentAlerts,
          status: 200,
          err: false,
        });
      }
      return c.json({
        err: true,
        data: {},
        message: "Invalid date range",
      });
    },
  );

export default alertRouter;
