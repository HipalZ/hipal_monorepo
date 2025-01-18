import {
  BusinessPosConfig,
  KotOrder,
  PetPoojaPinTemp,
  PosBill,
  Table,
  UserAnalytic,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { calculateCartBill, convertToPetpoojaCart } from "../../utils/helper";
const generateTenDigitCode = (): string => {
  const min = 1000000000; // Minimum 10-digit number
  const max = 9999999999; // Maximum 10-digit number
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString();
};

const saveKotOrder = async (
  tableName: string,
  businessId: string,
  customerName: string,
  customerPhone: string,
  internalCart: unknown[],
  userId: string,
  tableId: string,
) => {
  const saveKot = await KotOrder.create({
    tableName: tableName,
    businessId: businessId,
    phone: customerPhone,
    cart: internalCart,
    date: Date.now(),
    userId: userId,
    name: customerName,
    tableId: tableId,
  });

  if (!saveKot) {
    return false;
  }

  return true;
};

const kotRouter = new Hono()
  .get(
    "/table_kot/:tableId",
    zValidator(
      "param",
      z.object({
        tableId: z.string().min(1).max(500),
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
        userIds: z.array(z.string()).min(1).max(500),
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
    zValidator(
      "json",
      z.object({
        orderId: z.string().min(1).max(500),
        orderAction: z.enum(["ACCEPT", "REJECT", "EDIT"]),
        performBy: z.string().min(1).max(500),
        reasonOfRejection: z.string().min(1).max(500).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { orderId, orderAction, performBy, reasonOfRejection } =
          await c.req.json();

        const orderAlreadyAccepted = await KotOrder.findOne({
          _id: orderId,
          accepted: true,
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
        }).populate("posId");
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
          kot.accepted = true;
          kot.acceptedBy = performBy;
          await kot.save();

          const tempTable = await PetPoojaPinTemp.findOne({
            tableName: kot.tableName,
            businessId: kot.businessId,
          });
          const totalBill = calculateCartBill(kot.cart);

          const petpoojaCart = convertToPetpoojaCart(
            kot.cart,
            pos?.posId.restId,
            kot.name,
            tempTable?.pin,
            kot.tableName,
            pos.posId.accessKey,
            pos.posId.secretKey,

            pos.posId.authToken,
          );

          const saveKot = await axios.post(
            "https://api.petpooja.com/V1/captainorders/save_kot_qr_order",
            petpoojaCart,
          );

          const t = await Table.findOneAndUpdate(
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
              new: true, // Return the updated document
            },
          );

          return c.json(
            {
              message: "Data fetched successfully",
              err: false,
              data: {
                success: true,
                hiCode: 0,
                name: kot.name,
                phone: kot.phone,
              },
            },
            200,
          );
        }

        if (orderAction === "REJECT") {
          if (!reasonOfRejection) {
            return c.json(
              {
                message: "Rejected reason is required",
                err: true,
                data: null,
              },
              400,
            );
          }
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
          await kot.save();
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
