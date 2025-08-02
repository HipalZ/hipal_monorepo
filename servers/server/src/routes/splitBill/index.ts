import { UserSession } from "@hi/db-models";
import { splitBillPortionAndPercentageSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  checkOfflinePaymentRequest,
  isOriginBillChanged,
} from "../../services/splitBill";
import { type CartItem } from "../../utils/bill";
import { respond } from "../../utils/response";
import {
  calculateBillWithPortionAndPercentage,
  calculateItemWithPortionAndPercentage,
  saveSplitBillSessionVariant,
} from "../../utils/splitBill";
//
const splitBillRouter = new Hono()

  .get(
    "/test",
    zValidator(
      "query",
      z.object({
        urlCode: z.string().min(1).max(500).optional(),
      }),
    ),
    async (c) => {
      return respond(c, "test", true, 200, {});
    },
  )
  .post(
    "/portion_and_percenatge",
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

        const checkOriginBillChanged = await isOriginBillChanged(
          fetchOriginalTableSession,
        );

        if (checkOriginBillChanged) {
          return respond(
            c,
            "Origin bill changed you cannot a split bill",
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
          const updatedItems = calculateItemWithPortionAndPercentage(
            originalCartItems,
            portionPercentage,
          );

          const updateBill = calculateBillWithPortionAndPercentage(
            fetchOriginalTableSession,
            portionPercentage,
            i + 1,
          );

          const updatedObject = {
            ...updateBill,
            items: updatedItems,
          };

          const saveTableSession = await saveSplitBillSessionVariant(
            updatedObject,
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
            },
          },
          { session, new: true },
        );

        if (!updateOriginTableSession) {
          throw new Error("Origin table session not updated");
        }

        // const fetchVariants = await SplitBillTableSession.find({
        //   businessId: businessId,
        //   tableName: tableName,
        //   originTableSessionId: fetchOriginalTableSession._id.toString(),
        // }).session(session);

        // const formattedBills = fetchVariants.map((variant) =>
        //   formatBillOutput(fetchOriginalTableSession, variant),
        // );

        return respond(c, "success", true, 200, {});
      });
    },
  );

export default splitBillRouter;
