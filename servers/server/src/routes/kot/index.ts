import {
  BusinessPosConfig,
  KotOrder,
  PosBill,
  Table,
  UserAnalytic,
  UserSession,
} from "@hi/db-models";
import { kotOrderAcceptSchema } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { ubacMiddleware } from "../../../middleware/checkPermissions";
import { calculateCartBill, convertToPetpoojaCart } from "../../utils/helper";
import { posApiPaths } from "../../utils/posConfig/petPooja";

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
          return c.json(
            {
              message: "Kot not found",
              err: true,
              data: {},
            },
            404,
          );
        }
        // find posconfig for a place order
        const pos = await BusinessPosConfig.findOne({
          businessId: kot.businessId,
        });
        if (!pos) {
          return c.json(
            {
              message: "POS not found",
              err: true,
              data: {
                success: false,
              },
            },
            404,
          );
        }

        if (orderAction === "ACCEPT") {
          const tableSession = await UserSession.findOne({
            tableName: kot.tableName,
            businessId: kot.businessId,
          });

          // check if bill already generated for table
          if (tableSession?.billRequestId) {
            return c.json(
              {
                message: `Bill already generated for table ${tableSession.tableName} by ${tableSession?.billGeneratedBy} you can't add more items`,
                err: true,
                data: {
                  success: false,
                },
              },
              400,
            );
          }
          kot.accepted = true;
          kot.acceptedBy = performBy;
          await kot.save();

          const totalBill = calculateCartBill(kot.cart);

          const petpoojaCart = convertToPetpoojaCart(
            kot.cart,
            pos.restId,
            kot.name,
            tableSession?.pin,
            kot.tableName,
            pos.accessKey,
            pos.secretKey,

            pos.authToken,
          );

          const saveKot = await axios.post(posApiPaths.saveKot, petpoojaCart);

          if (saveKot.data.status === "0") {
            throw new Error("Error in saving kot");
          }

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

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: {
                success: true,
                name: kot.name,
                phone: kot.phone,
              },
            },
            200,
          );
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
  )

  .get(
    "/get_pos_bill/:billRequestId",

    zValidator(
      "param",
      z.object({
        billRequestId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { billRequestId } = c.req.param();

      const posBill = await PosBill.findOne({
        billRequestId: billRequestId,
      });

      return c.json(
        {
          message: "Data fetched successfully",
          err: false,
          data: posBill?.items || [],
        },
        200,
      );
    },
  );

export default kotRouter;
