import {
  BusinessPosConfig,
  KotOrder,
  PasswordManager,
  PaymentAlert,
  Table,
  User,
  UserAnalytic,
  UserSession,
} from "@hi/db-models";
import type { UserSessionSchemaType } from "@hi/db-models/src/validators";

import { kotOrderAcceptSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { ubacMiddleware } from "../../../middleware/checkPermissions";
import { checkOriginBillIsSplit } from "../../services/splitBill";
import { calculateCartBill } from "../../utils/helper";
import {
  deleteKOTPrintEvent,
  sendKOTPrintEvent,
  sendReKOTPrintEvent,
} from "../../utils/kot";
import { respond } from "../../utils/response";

const kotRouter = new Hono()
  .get(
    "/table_kot/:tableId",
    zValidator(
      "param",
      z.object({
        tableId: z.string().min(1).max(100),
      }),
    ),
    async (c) => {
      const { tableId } = c.req.param();

      const tableName = await Table.findOne({
        _id: tableId,
      });

      if (!tableName) {
        return c.json(
          {
            message: "Table not found",
            err: true,
            data: null,
          },
          404,
        );
      }

      const kot = await KotOrder.find({
        tableName: tableName.name,
        businessId: tableName.businessId,
        settled: false,
        accepted: true,
      })
        .populate({
          path: "businessId",
          select: "name",
        })
        .populate({
          path: "transferedBy",
          select: "name phone",
        })
        .populate({
          path: "editedBy",
          select: "name phone",
        });

      return c.json(
        {
          message: "Kot fetched successfully",
          err: false,
          data: kot,
        },
        200,
      );
    },
  )
  .post(
    "/table_user",
    zValidator(
      "json",
      z.object({
        userIds: z.array(z.string()).min(1).max(100),
      }),
    ),
    async (c) => {
      const { userIds = [] } = await c.req.json();

      const kot = await UserAnalytic.find({
        userId: { $in: userIds },
      })
        .populate({
          path: "userId",
          select: "name phone dob",
        })
        .populate({
          path: "tagIds",
          select: "name",
        });

      return c.json(
        {
          message: "Data fetched successfully",
          err: false,
          data: kot,
        },
        200,
      );
    },
  )

  .post(
    "/reprint_kot",
    zValidator(
      "json",
      z.object({
        kotId: z.string().min(1).max(100),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { kotId } = await c.req.json();

        const kot = await KotOrder.findById(kotId).populate({
          path: "businessId",
          select: "name",
        });

        if (!kot) {
          return c.json(
            {
              message: "Kot not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        const captainInfo = await User.findById(kot.acceptedBy);

        sendReKOTPrintEvent({
          tableName: kot?.tableName ?? "",
          businessId: kot.businessId._id.toString(),
          customerName: kot.name || captainInfo?.name || "",
          customerPhone: kot.phone,
          cart: kot.cart,
          acceptedBy: captainInfo?.name || kot.name || "",
          kotId: kot.id.toString(),
          date: Date.now(),
          posRestName: kot.businessId.name,
          kotInvoiceNumber: kot.kotInvoiceNumber,
        });

        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: {},
          },
          200,
        );
      });
    },
  )

  .post(
    "/delete_kot",
    zValidator(
      "json",
      z.object({
        kotItems: z.array(
          z.object({
            itemId: z.string().min(24).max(24),
            quantity: z.number().min(1),
          }),
        ),
        deletedBy: z.string().min(1).max(50),
        reasonOfDeletion: z.string().min(1).max(500),
        password: z.string().min(4).max(50).optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { kotItems, deletedBy, reasonOfDeletion, password } =
          await c.req.json();

        // 1. Load and validate user
        const user = await User.findById(deletedBy).session(session);
        if (!user) {
          return respond(c, "User not found", true, 404);
        }

        const itemIds = kotItems.map((i) => i.itemId);
        const kotDocs = await KotOrder.find(
          { "cart._id": { $in: itemIds } },
          {
            cart: 1,
            businessId: 1,
            acceptedBy: 1,
            tableName: 1,
            name: 1,
            phone: 1,
            isDeleted: 1,
            kotInvoiceNumber: 1,
          },
        ).session(session);

        const tableSession = (await UserSession.findOne({
          tableName: kotDocs[0].tableName,
          businessId: kotDocs[0].businessId,
        })) as UserSessionSchemaType;

        const billAlreadySplit = checkOriginBillIsSplit(tableSession);
        if (billAlreadySplit) {
          return respond(
            c,
            "Bill already split you cannot delete the KOT",
            true,
            400,
            {},
          );
        }

        if (password) {
          const passwordManager = await PasswordManager.findOne({
            businessId: kotDocs[0].businessId,
            name: "DELETE_KOT",
            isActive: true,
            password: password,
          });

          if (!passwordManager) {
            return respond(
              c,
              "Please enter the correct delete kot password.",
              true,
              400,
              {},
            );
          }
        }

        const deletedOrders = kotDocs.filter((d) => d.isDeleted);
        if (deletedOrders.length) {
          const ids = deletedOrders.map((d) => d._id.toString()).join(", ");
          return respond(
            c,
            `KOT order${
              deletedOrders.length > 1 ? "s" : ""
            } (${ids}) already deleted`,
            true,
            400,
          );
        }

        const lookup = new Map<string, { kotDoc: any; cartItem: any }>();
        for (const kd of kotDocs) {
          for (const ci of kd.cart) {
            const id = ci._id.toString();
            if (itemIds.includes(id)) {
              lookup.set(id, { kotDoc: kd, cartItem: ci });
            }
          }
        }

        for (const { itemId, quantity } of kotItems) {
          const entry = lookup.get(itemId);
          if (!entry) {
            return respond(c, `KOT item ${itemId} not found`, true, 404);
          }
          if (entry.cartItem.isDeleted) {
            return respond(c, `KOT item ${itemId} already deleted`, true, 400);
          }
          if (quantity > entry.cartItem.quantity) {
            return respond(c, "Quantity exceeds available amount", true, 400);
          }
        }

        for (const { itemId, quantity } of kotItems) {
          const { kotDoc, cartItem: matched } = lookup.get(itemId)!;
          const kotId = kotDoc._id;

          if (matched.quantity > quantity) {
            await KotOrder.updateOne(
              { _id: kotId, "cart._id": itemId },
              { $inc: { "cart.$.quantity": -quantity } },
              { session },
            );
          }

          const original = matched.toObject();
          delete original._id;
          const baseDeleted = {
            ...original,
            quantity: 1,
            isDeleted: true,
            deletedBy: user.name,
            reasonOfDeletion,
          };

          let deletedItems: (typeof baseDeleted)[];

          if (quantity === matched.quantity) {
            // full-stack delete: mark existing cart item
            await KotOrder.updateOne(
              { _id: kotId, "cart._id": itemId },
              {
                $set: {
                  "cart.$.isDeleted": true,
                  "cart.$.deletedBy": user.name,
                  "cart.$.reasonOfDeletion": reasonOfDeletion,
                },
              },
              { session },
            );

            // for billing, treat it as one item of `quantity`
            deletedItems = [{ ...baseDeleted, quantity }];
          } else {
            // partial delete: push `quantity` one-unit deleted copies
            deletedItems = Array.from({ length: quantity }, () => ({
              ...baseDeleted,
            }));

            await KotOrder.updateOne(
              { _id: kotId },
              { $push: { cart: { $each: deletedItems } } },
              { session },
            );
          }

          const deletedTotal = calculateCartBill(deletedItems);
          await Table.updateOne(
            { businessId: kotDoc.businessId, name: kotDoc.tableName },
            { $inc: { currentTableAmount: -deletedTotal } },
            { session },
          );

          const pos = await BusinessPosConfig.findOne(
            {
              businessId: kotDoc.businessId,
              isDeleted: false,
              active: true,
            },
            undefined,
            { session },
          );
          const captain = await User.findById(kotDoc.acceptedBy).session(
            session,
          );

          deleteKOTPrintEvent({
            tableName: kotDoc.tableName,
            businessId: kotDoc.businessId,
            customerName: kotDoc.name,
            customerPhone: kotDoc.phone,
            cart: deletedItems.map((it) => ({ ...it, quantity: it.quantity })),
            deletedBy: user.name,
            acceptedBy: captain?.name || user.name,
            kotId: nanoid(10),
            date: Date.now(),
            posRestName: pos?.restName,
            kotInvoiceNumber: kotDoc.kotInvoiceNumber,
          });
        }

        return respond(
          c,
          "KOT item(s) marked as deleted successfully",
          false,
          200,
        );
      });
    },
  )

  .put(
    "/",
    ubacMiddleware("order_accept"),
    zValidator("json", kotOrderAcceptSchema),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { orderId, orderAction, performBy, reasonOfRejection } =
          await c.req.json();

        const orderAlreadyAccepted = await KotOrder.findOne({
          _id: orderId,
          $or: [{ accepted: true }, { settled: true }],
        });
        if (orderAlreadyAccepted) {
          return c.json(
            {
              message: "Order already accepted",
              err: true,
              data: {},
            },
            400,
          );
        }
        const kot = await KotOrder.findOne({
          _id: orderId,
          accepted: false,
          rejected: false,
          edited: false,
        });

        if (!kot) {
          return respond(c, "Order not found", true, 404, {});
        }
        // find posconfig for a place order
        const pos = await BusinessPosConfig.findOne({
          businessId: kot.businessId,
          isDeleted: false,
          active: true,
        });
        if (!pos) {
          return respond(c, "POS not found", true, 404, {});
        }

        if (orderAction === "ACCEPT") {
          const tableSession = (await UserSession.findOne({
            tableName: kot.tableName,
            businessId: kot.businessId,
          })) as UserSessionSchemaType;
          const billAlreadySplit = checkOriginBillIsSplit(tableSession);
          if (billAlreadySplit) {
            return respond(
              c,
              "Bill already split you cannot acept the order",
              true,
              400,
              {},
            );
          }
          const orderAlreadyExist = await PaymentAlert.findOne({
            businessId: kot.businessId,
            tableName: kot.tableName,
            alertType: "OFFLINE",
            isAccepted: false,
          });

          if (orderAlreadyExist)
            return respond(
              c,
              "A request for this service is already in progress. Please wait for the staff to take action",
              true,
              400,
              {},
            );

          kot.accepted = true;
          kot.acceptedBy = performBy;
          await kot.save();

          const totalBill = calculateCartBill(kot.cart);

          await Table.findOneAndUpdate(
            {
              businessId: kot.businessId,
              name: kot.tableName,
            },
            {
              $inc: {
                totalItemCount: kot.cart.length,
                currentTableAmount: totalBill,
              },
              $set: {
                status: "ACTIVE",
                date: Date.now(),
              },
            },
            {
              session,
              new: true, // Return the updated document
            },
          );

          const userInfo = await User.findById(kot.userId);
          const captainInfo = await User.findById(performBy);

          sendKOTPrintEvent({
            tableName: tableSession?.tableName as string,
            businessId: tableSession?.businessId as string,
            customerName: userInfo?.name as string,
            customerPhone: userInfo?.phone as string,
            cart: kot.cart,
            acceptedBy: captainInfo?.name as string,
            kotId: kot._id.toString(),
            date: Date.now(),
            posRestName: pos?.restName,
            kotInvoiceNumber: kot.kotInvoiceNumber,
          });

          return respond(c, "Data fetched successfully", false, 200, {
            success: true,
            name: kot.name,
            phone: kot.phone,
          });
        }

        if (orderAction === "REJECT") {
          kot.rejected = true;
          kot.rejectedBy = performBy;
          kot.reasonOfRejection = reasonOfRejection;
          await kot.save();
          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: {
                success: true,
              },
            },
            200,
          );
        }

        if (orderAction === "EDIT") {
          kot.edited = true;
          kot.editedBy = performBy;
          kot.rejected = true;

          await kot.save();

          await UserSession.findOneAndUpdate(
            {
              tableName: kot.tableName,
              businessId: kot.businessId,
            },
            {
              $set: {
                customerName: kot.name,
              },
            },
            {
              session,
            },
          );

          await Table.findOneAndUpdate(
            {
              businessId: kot.businessId,
              name: kot.tableName,
            },
            {
              $set: {
                edited: true,
                editedBy: performBy,
              },
            },
            {
              session,
            },
          );

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: {
                success: true,
                cart: kot.cart,
              },
            },
            200,
          );
        }
      });
    },
  )
  .get(
    "/kot_order/:tableId",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { tableId } = c.req.param();
      const { businessId } = c.req.query();

      const userTableSession = await UserSession.findOne({
        businessId: businessId,

        transferTableTo: { $exists: true },
        transferType: "TABLE",
      });

      const sessionTable = await Table.findOne({
        businessId: businessId,
        _id: userTableSession?.transferTableTo?.toString(),
      });

      const tableName = await Table.findOne({
        _id: tableId,
      });

      if (!tableName) {
        return c.json(
          {
            message: "Table not found",
            err: true,
            data: null,
          },
          404,
        );
      }

      const kot = await KotOrder.find({
        tableName: tableName.name,
        businessId: tableName.businessId,
        settled: false,
        accepted: true,
      });

      return c.json(
        {
          message: "Kot fetched successfully",
          err: false,
          data: kot,
        },
        200,
      );
    },
  )
  .get(
    "/order/:businessId",
    zValidator(
      "query",
      z.object({
        edited: z.string().min(1).max(500).optional(),
        rejected: z.string().min(1).max(500).optional(),
      }),
    ),
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const { edited, rejected } = c.req.query();

      if (edited === "true") {
        const kot = await KotOrder.find({
          businessId: businessId,
          edited: true,
          accepted: false,
          rejected: false,
          settled: false,
        }).populate({
          path: "editedBy",
          select: "name phone",
        });

        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: kot,
          },
          200,
        );
      }

      if (rejected === "true") {
        const kot = await KotOrder.find({
          businessId: businessId,
          rejected: true,
          accepted: false,
          edited: false,
          settled: false,
        }).populate({
          path: "rejectedBy",
          select: "name phone",
        });

        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: kot,
          },
          200,
        );
      }

      return c.json(
        {
          message: "query not found",
          err: false,
          data: {},
        },
        400,
      );
    },
  );

export default kotRouter;
