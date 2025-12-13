import {
  MergeAndSplitBillInvoiceCounter,
  SplitBillTableSession,
  UserSession,
} from "@hi/db-models";
import {
  splitBillItemSchema,
  splitBillPortionAndPercentageSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  checkOfflinePaymentRequest,
  checkVariantIsPaid,
} from "../../services/splitBill";
import type { CartItem } from "../../utils/bill";
import { respond } from "../../utils/response";
import {
  saveItemWiseSplitBillSessionVariant,
  saveSplitBillSessionVariant,
  splitBillWithPortionAndPercentage,
  splitItemQuantityWithPortionAndPercentage,
} from "../../utils/splitBill";
//
const splitBillRouter = new Hono()

  .post(
    "/portion_and_percentage",
    // ubacMiddleware("split_bill"),
    zValidator("json", splitBillPortionAndPercentageSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, tableName, variantCount, variants } = requestData;
        const fetchOriginalTableSession = await UserSession.findOne({
          businessId,
          tableName,
        }).session(session);

        if (!fetchOriginalTableSession) {
          return respond(c, "Table session not found", true, 400, {});
        }

        const checkAlreadySplit = fetchOriginalTableSession.isSplit;
        if (checkAlreadySplit) {
          return respond(
            c,
            "Already split you cannot a split bill",
            true,
            400,
            {},
          );
        }

        const checkOfflinePaymentReq = await checkOfflinePaymentRequest(
          businessId,
          tableName,
        );

        if (checkOfflinePaymentReq) {
          return respond(
            c,
            "You cannot create a split bill with an offline payment request please reject or accept the request first",
            true,
            400,
            {},
          );
        }

        const originalCartItems = fetchOriginalTableSession.items as CartItem[];

        if (!originalCartItems.length) {
          return respond(
            c,
            "Cart is empty you cannot create a split bill",
            true,
            400,
            {},
          );
        }

        for (let i = 0; i < variants.length; i++) {
          const portionPercentage = variants[i].percentage;
          // split items quantity with percentage
          const updatedItems = splitItemQuantityWithPortionAndPercentage(
            originalCartItems,
            portionPercentage,
          );

          const updateBill = splitBillWithPortionAndPercentage(
            fetchOriginalTableSession,
            portionPercentage,
            i + 1,
          );

          const updatedObject = {
            ...updateBill,
            items: updatedItems,
          };
          // save split bill session variant
          const saveSplitTableSession = await saveSplitBillSessionVariant(
            //@ts-ignore
            updatedObject,
            session,
          );

          if (!saveSplitTableSession) {
            throw new Error("Split bill session not created");
          }
        }

        const updateOriginTableSession = await UserSession.findByIdAndUpdate(
          fetchOriginalTableSession._id,
          {
            $set: {
              isSplit: true,
              variantsCounts: variantCount,
              splitType: "PORTION",
            },
          },
          { session, new: true },
        );

        if (!updateOriginTableSession) {
          throw new Error("Origin table session not updated");
        }

        return respond(c, "success", true, 200, {});
      });
    },
  )

  .post(
    "/item",
    // ubacMiddleware("split_bill"),
    zValidator("json", splitBillItemSchema),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, tableName, variantCount, variants } = requestData;
        const totalVariantItems = variants.reduce(
          (acc: number, variant: { cart: CartItem[] }) =>
            acc + variant.cart.length,
          0,
        );

        if (variantCount > totalVariantItems) {
          return respond(
            c,
            "Variant count cannot be greater than total items in variants",
            true,
            400,
            {},
          );
        }

        const fetchOriginalTableSession = await UserSession.findOne({
          businessId,
          tableName,
        }).session(session);

        if (!fetchOriginalTableSession) {
          return respond(c, "Table session not found", true, 400, {});
        }

        const checkAlreadySplit = fetchOriginalTableSession.isSplit;
        if (checkAlreadySplit) {
          return respond(
            c,
            "Already split you cannot a split bill",
            true,
            400,
            {},
          );
        }

        const checkOfflinePaymentReq = await checkOfflinePaymentRequest(
          businessId,
          tableName,
        );

        if (checkOfflinePaymentReq) {
          return respond(
            c,
            "You cannot create a split bill with an offline payment request please reject or accept the request first",
            true,
            400,
            {},
          );
        }

        const originalCartItems = fetchOriginalTableSession.items as CartItem[];

        if (!originalCartItems.length) {
          return respond(
            c,
            "Cart is empty you cannot create a split bill",
            true,
            400,
            {},
          );
        }

        const originItemsLength = originalCartItems.length;

        if (originItemsLength !== totalVariantItems) {
          return respond(
            c,
            "Items length in variants must match the original cart items length",
            true,
            400,
            {},
          );
        }

        for (let i = 0; i < variants.length; i++) {
          const items = variants[i].cart;

          const saveTableSession = await saveItemWiseSplitBillSessionVariant(
            items,
            fetchOriginalTableSession,
            i + 1,
            session,
          );

          if (!saveTableSession) {
            throw new Error("Split bill session not created");
          }
        }

        const updateOriginTableSession = await UserSession.findByIdAndUpdate(
          fetchOriginalTableSession._id,
          {
            $set: {
              isSplit: true,
              variantsCounts: variantCount,
              splitType: "ITEM",
            },
          },
          { session, new: true },
        );

        if (!updateOriginTableSession) {
          throw new Error("Origin table session not updated");
        }

        return respond(c, "success", true, 200, {});
      });
    },
  )

  .post(
    "/club_bill",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(100),
        tableName: z.string().min(1).max(100),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, tableName } = requestData;

        const fetchOriginalTableSession = await UserSession.findOne({
          businessId,
          tableName,
        }).session(session);

        if (!fetchOriginalTableSession) {
          return respond(c, "Table session not found", true, 400, {});
        }

        const checkOfflinePaymentReq = await checkOfflinePaymentRequest(
          businessId,
          tableName,
        );

        if (checkOfflinePaymentReq) {
          return respond(
            c,
            "you can not merge with an offline payment request",
            true,
            400,
            {},
          );
        }

        const variantIsPaid = await checkVariantIsPaid(
          fetchOriginalTableSession._id,
        );
        if (variantIsPaid) {
          return respond(c, "You cannot club paid variant", true, 400, {});
        }

        const tableSession = await UserSession.findOneAndUpdate(
          {
            businessId,
            tableName,
          },
          {
            $set: {
              isSplit: false,
              variantsCounts: 0,
              isSplitAndMerge: true,
            },
          },
        );

        const splitBills = await SplitBillTableSession.find({
          originTableSessionId: tableSession?._id,
        });

        for (const splitBill of splitBills) {
          if (splitBill?.billInvoice > 0) {
            await MergeAndSplitBillInvoiceCounter.findOneAndUpdate(
              {
                businessId,
                billInvoice: splitBill.billInvoice,
              },
              {},
              { upsert: true },
            );
          }
        }

        await SplitBillTableSession.deleteMany(
          {
            originTableSessionId: tableSession?._id,
          },
          { session },
        );

        return respond(c, "success", true, 200, {});
      });
    },
  );

export default splitBillRouter;
