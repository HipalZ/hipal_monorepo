import {
  BusinessPosConfig,
  KotOrder,
  PetPoojaPinTemp,
  Table,
  UserAnalytic,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { convertToPetpoojaCart } from "../../utils/helper";
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
) => {
  const saveKot = await KotOrder.create({
    tableName: tableName,
    businessId: businessId,
    phone: customerPhone,
    cart: internalCart,
    date: Date.now(),
    userId: userId,
    name: customerName,
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

      const tableName = await Table.findById(tableId).select("name");

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
          select: "name phone",
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

          const tenDigitCode = generateTenDigitCode();
          const tempTable = await PetPoojaPinTemp.findOne({
            tableName: kot.tableName,
            businessId: kot.businessId,
          });

          if (!tempTable) {
            const registerUser = await axios.post(
              "http://api.petpooja.com/V1/captainorders/save_menu_qr_customer_information",
              {
                app_key: pos?.posId.accessKey,
                app_secret: pos?.posId.secretKey,
                access_token: pos?.posId.authToken,
                restID: pos?.posId.restId,
                phone: tenDigitCode,
                name: kot.name,
              },
            );
          }

          const petPoojaPinTemp = new PetPoojaPinTemp({
            businessId: kot.businessId,
            hiCode: tempTable?.hiCode,
            pin: tenDigitCode,
            tableName: kot.tableName,
            customerName: kot.name,
            phoneNumbers: [kot.phone],
          });
          await petPoojaPinTemp.save();
          const petpoojaCart = convertToPetpoojaCart(
            kot.cart,
            pos?.posId.restId,
            kot.name,
            tenDigitCode,
            kot.tableName,
          );

          const saveKot = await axios.post(
            "https://api.petpooja.com/V1/captainorders/save_kot_qr_order",
            petpoojaCart,
          );

          await Table.findOneAndUpdate(
            {
              businessId: kot.businessId,
              name: kot.tableName,
            },
            {
              $inc: {
                totalItemCount: kot.cart.length,
              },
              $set: {
                status: "ACTIVE",
                currentTableAmount: 100,
                date: Date.now(),
              },
              $addToSet: {
                userIds: kot.userId,
              },
            },
            {
              new: true, // Return the updated document
              upsert: true, // Create the document if it doesn't exist
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
              },
            },
            200,
          );
        }
      });
    },
  );

export default kotRouter;
