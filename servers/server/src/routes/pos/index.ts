import {
  MenuBanner,
  OutLetInfo,
  PetPoojaPinTemp,
  Pos,
  Table,
  UniquelyYours,
  UrlModel,
  Zone,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { convertToPetpoojaCart } from "../../utils/helper";

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message: string;
}
const posRouter = new Hono()
  .get("/all_pos", async (c) => {
    const allPos = await Pos.find({}).select("name _id");

    return c.json(
      {
        message: "Data fetched successfully",
        err: false,
        data: allPos,
      },
      200,
    );
  })
  .get(
    "/get_bill",

    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        pin: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      const { businessId, tableName, pin } = c.req.query();

      const pos = await Pos.findOne({ businessId: businessId });

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

      const fetchBill = await axios.post(
        "http://api.petpooja.com/V1/captainorders/request_bill",
        {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          pin: pin,
          table_no: tableName,
        },
      );
      if (fetchBill.data.success === "1") {
        const request_id = fetchBill.data.request_id;

        if (!request_id) {
          const bill_request_id = fetchBill.data.bill_request_id;

          const getBill = await axios.post(
            "http://api.petpooja.com/V1/captainorders/get_bill//",
            {
              app_key: pos.accessKey,
              app_secret: pos.secretKey,
              access_token: pos.authToken,
              restID: pos.restId,
              bill_request_id: bill_request_id,
            },
          );

          if (getBill.data.success === "1") {
            const billObj = {
              billing_user_name: getBill.data.order_data.billing_user_name,
              service_charge: getBill.data.order_data.service_charge,
              discount: getBill.data.order_data.discount,
              tax: getBill.data.order_data.tax,
              total: getBill.data.order_data.total,
              customer_phone: getBill.data.order_data.customer_phone,
              customer_name: getBill.data.order_data.customer_name,
              tableName: getBill.data.order_data.table_no,

              subTotal: getBill.data.order_data.core_price,
            };
            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: billObj,
              },
              200,
            );
          }
        }

        const fetchBillDetails = await axios.post(
          "http://api.petpooja.com/V1/captainorders/check_bill/",
          {
            app_key: pos.accessKey,
            app_secret: pos.secretKey,
            access_token: pos.authToken,
            restID: pos.restId,
            request_id: request_id,
          },
        );

        if (fetchBillDetails.data.success === "1") {
          const bill_request_id = fetchBillDetails.data.bill_request_id;

          const getBill = await axios.post(
            "http://api.petpooja.com/V1/captainorders/get_bill//",
            {
              app_key: pos.accessKey,
              app_secret: pos.secretKey,
              access_token: pos.authToken,
              restID: pos.restId,
              bill_request_id: bill_request_id,
            },
          );

          if (getBill.data.success === "1") {
            const billObj = {
              billing_user_name: getBill.data.order_data.billing_user_name,
              service_charge: getBill.data.order_data.service_charge,
              discount: getBill.data.order_data.discount,
              tax: getBill.data.order_data.tax,
              total: getBill.data.order_data.total,
              customer_phone: getBill.data.order_data.customer_phone,
              customer_name: getBill.data.order_data.customer_name,
              tableName: getBill.data.order_data.table_no,

              subTotal: getBill.data.order_data.core_price,
            };
            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: billObj,
              },
              200,
            );
          }
        }
      }
    },
  )
  .get(
    "/get_kot_history",

    zValidator(
      "query",
      z.object({
        businessId: z.string().min(3).max(200),
        tableName: z.string().min(1).max(200),
        pin: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      const { businessId, tableName, pin } = c.req.query();

      const pos = await Pos.findOne({ businessId: businessId });

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

      const fetchBill = await axios.post(
        "http://api.petpooja.com/V1/captainorders/request_bill",
        {
          app_key: pos.accessKey,
          app_secret: pos.secretKey,
          access_token: pos.authToken,
          restID: pos.restId,
          pin: pin,
          table_no: tableName,
        },
      );
      if (fetchBill.data.success === "1") {
        const request_id = fetchBill.data.request_id;

        if (!request_id) {
          const bill_request_id = fetchBill.data.bill_request_id;

          const getBill = await axios.post(
            "http://api.petpooja.com/V1/captainorders/get_bill//",
            {
              app_key: pos.accessKey,
              app_secret: pos.secretKey,
              access_token: pos.authToken,
              restID: pos.restId,
              bill_request_id: bill_request_id,
            },
          );

          if (getBill.data.success === "1") {
            const dishes = getBill.data.items_data.map((dish) => {
              const regex = /\(([^)]+)\)/;
              const match = dish.name.match(regex);
              let extractedPortion = "";

              if (match && match[1]) {
                extractedPortion = match[1];
                console.log("Extracted Portion:", extractedPortion);
              } else {
                console.log("No match found");
              }

              return {
                name: dish.name,
                quantity: dish.quantity,
                price: dish.total,
                extras: dish.extras
                  ? dish.extras.map((extra) => extra.name)
                  : [],
                portion: extractedPortion,
              };
            });

            const history = dishes.map((dish) => ({
              name: dish.name,
              quantity: dish.quantity,
              price: dish.price,
              extras: dish.extras,
              portion: dish.portion,
            }));

            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: history,
              },
              200,
            );
          }
        }

        const fetchBillDetails = await axios.post(
          "http://api.petpooja.com/V1/captainorders/check_bill/",
          {
            app_key: pos.accessKey,
            app_secret: pos.secretKey,
            access_token: pos.authToken,
            restID: pos.restId,
            request_id: request_id,
          },
        );

        if (fetchBillDetails.data.success === "1") {
          const bill_request_id = fetchBillDetails.data.bill_request_id;

          const getBill = await axios.post(
            "http://api.petpooja.com/V1/captainorders/get_bill//",
            {
              app_key: pos.accessKey,
              app_secret: pos.secretKey,
              access_token: pos.authToken,
              restID: pos.restId,
              bill_request_id: bill_request_id,
            },
          );

          if (getBill.data.success === "1") {
            const dishes = getBill.data.items_data.map((dish) => {
              const regex = /\(([^)]+)\)/;
              const match = dish.name.match(regex);
              let extractedPortion = "";

              if (match && match[1]) {
                extractedPortion = match[1];
                console.log("Extracted Portion:", extractedPortion);
              } else {
                console.log("No match found");
              }

              return {
                name: dish.name,
                quantity: dish.quantity,
                price: dish.total,
                extras: dish.extras
                  ? dish.extras.map((extra) => extra.name)
                  : [],
                portion: extractedPortion,
              };
            });

            const history = dishes.map((dish) => ({
              name: dish.name,
              quantity: dish.quantity,
              price: dish.price,
              extras: dish.extras,
              portion: dish.portion,
            }));

            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: history,
              },
              200,
            );
          }
        }
      }
    },
  )
  .post(
    "/setup_pos_config",

    zValidator(
      "json",
      z.object({
        posId: z.string().min(3).max(200),
        businessId: z.string().min(3).max(200),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { posId, businessId } = await c.req.json();

        const pos = await Pos.findById(posId);

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

        const fetchAreaAndTable = await axios.post(
          "https://onlineapipp.petpooja.com/thirdparty_fetch_dinein_menu",
          {
            "app-key": pos.accessKey,
            "app-secret": pos.secretKey,
            "access-token": pos.authToken,
            restID: pos.restId,
            tableNo: "",
          },
        );

        if (fetchAreaAndTable.data.success === "1") {
          const areas = fetchAreaAndTable.data.areas;
          const tables = fetchAreaAndTable.data.tables;

          for (const area of areas) {
            const zoneId = area.restaurantareaid;
            const zoneName = area.displayname;
            const active = area.active;
            const rank = area.rank;

            await Zone.findOneAndUpdate(
              {
                zoneId,
              },
              {
                name: zoneName,
                businessId: businessId,
                zoneId,
                active,
                rank,
              },
              {
                upsert: true,
                new: true,
                session,
              },
            );
          }

          for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const zoneId = table.restaurantareaid;
            const tableName = table.table_no;
            const active = table.active;
            const rank = table.rank;
            const tableId = table.id;

            await Table.findOneAndUpdate(
              {
                tableId,
              },
              {
                name: tableName,
                businessId: businessId,
                zoneId,
                active,
                rank,
                tableId,
              },
              {
                upsert: true,
                new: true,
                session,
              },
            );

            const shortUrls = await UrlModel.find({
              businessId: businessId,
            });

            const shortUrl = shortUrls[i];
            if (shortUrl) {
              const shortUrlLongUrl = new URL(shortUrl.longUrl);

              shortUrlLongUrl.searchParams.set("tableName", tableName);

              const updatedLongUrl = shortUrlLongUrl.toString();

              await UrlModel.findOneAndUpdate(
                {
                  businessId: businessId,
                  longUrl: shortUrl.longUrl,
                },
                {
                  longUrl: updatedLongUrl,
                },
                {
                  session,
                },
              );
            } else {
              console.error(`Invalid shortUrl or longUrl at index ${i}`);
            }
          }

          await OutLetInfo.findOneAndUpdate(
            {
              businessId,
            },
            {
              isPosEnabled: true,
              restId: pos.restId,
            },
            {
              new: true,
              upsert: true,
              session,
            },
          );

          await UniquelyYours.findOneAndUpdate(
            {
              businessId,
            },
            {
              isDeleted: true,
            },
            {
              new: true,
              session,
            },
          );

          await MenuBanner.findOneAndUpdate(
            {
              businessId,
            },
            {
              isPublished: false,
            },
            {
              new: true,
              session,
            },
          );

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

        return c.json(
          {
            message: "Error fetching data",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      });
    },
  )

  .post(
    "/save_kot",

    zValidator(
      "json",
      z.object({
        tableName: z.string().min(1).max(200),
        internalCart: z.array(z.object({})),
        businessId: z.string().min(1).max(200),
        pin: z.string().min(1).max(200),
        customerName: z.string().min(1).max(200),
      }),
    ),

    async (c) => {
      const { internalCart, tableName, businessId, pin, customerName } =
        await c.req.json();

      const hiCode = await PetPoojaPinTemp.findOne({
        tableName: tableName,
        businessId: businessId,
      });

      if (hiCode) {
        if (hiCode.pin !== pin) {
          return c.json(
            {
              message: "this table is already occupied by another user",
              err: true,
              data: {
                success: false,
              },
            },
            404,
          );
        }
      }

      const pos = await Pos.findOne({ businessId: businessId });

      if (!hiCode) {
        const registerUser = await axios.post(
          "http://api.petpooja.com/V1/captainorders/save_menu_qr_customer_information",
          {
            app_key: pos?.accessKey,
            app_secret: pos?.secretKey,
            access_token: pos?.authToken,
            restID: pos?.restId,
            phone: pin,
            name: customerName,
          },
        );

        if (registerUser.data.success === "1") {
          const hiCode = Math.floor(1000 + Math.random() * 9000).toString();

          const petPoojaPinTemp = new PetPoojaPinTemp({
            businessId: businessId,
            hiCode: hiCode,
            pin: pin,
            tableName: tableName,
          });
          await petPoojaPinTemp.save();
          const petpoojaCart = convertToPetpoojaCart(
            internalCart,
            pos?.restId,
            customerName,
            pin,
            tableName,
          );
          const saveKot = await axios.post(
            "https://api.petpooja.com/V1/captainorders/save_kot_qr_order",
            petpoojaCart,
          );

          if (saveKot.data.success === "1") {
            return c.json(
              {
                message: "Data fetched successfully",
                err: false,
                data: {
                  success: true,
                  hiCode: hiCode,
                  pin: pin,
                },
              },
              200,
            );
          }
        } else {
          return c.json(
            {
              message: "Error in registering user",
              err: true,
              data: {
                success: false,
              },
            },
            400,
          );
        }

        return c.json(
          {
            message: "Error fetching data",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      }

      const petpoojaCart = convertToPetpoojaCart(
        internalCart,
        pos?.restId,
        customerName,
        pin,
        tableName,
      );
      const saveKot = await axios.post(
        "https://api.petpooja.com/V1/captainorders/save_kot_qr_order",
        petpoojaCart,
      );

      if (saveKot.data.success === "1") {
        return c.json(
          {
            message: "Data fetched successfully",
            err: false,
            data: {
              success: true,
              hiCode: hiCode.hiCode,
              pin: hiCode?.pin,
            },
          },
          200,
        );
      }

      return c.json(
        {
          message: "Error fetching data",
          err: true,
          data: {
            success: false,
          },
        },
        400,
      );
    },
  )
  .post(
    "/validate_hicode",

    zValidator(
      "json",
      z.object({
        hiCode: z.string().min(4).max(200),
      }),
    ),

    async (c) => {
      const { hiCode } = await c.req.json();

      const hiCodeData = await PetPoojaPinTemp.findOne({
        hiCode: hiCode,
      });

      if (!hiCodeData) {
        return c.json(
          {
            message: "Invalid HiCode",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      }

      return c.json(
        {
          message: "HiCode validated successfully",
          err: false,
          data: {
            success: true,
            hiCode: hiCodeData.hiCode,
            pin: hiCodeData.pin,
          },
        },
        200,
      );
    },
  )

  .post(
    "/save_pos_credentials",

    zValidator(
      "json",
      z.object({
        secretKey: z.string().min(3).max(200),
        accessKey: z.string().min(3).max(200),
        authToken: z.string().min(3).max(200),
        restId: z.string().min(3).max(200),
        name: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const { secretKey, accessKey, authToken, restId, name } =
        await c.req.json();

      const pos = await Pos.findOneAndUpdate(
        {
          name,
        },
        {
          secretKey,
          accessKey,
          authToken,
          restId,
          name,
        },
        {
          upsert: true,
          new: true,
        },
      );

      if (!pos) {
        return c.json(
          {
            message: "Error saving POS credentials",
            err: true,
            data: {
              success: false,
            },
          },
          400,
        );
      }

      return c.json(
        {
          message: "POS credentials saved successfully",
          err: false,
          data: {
            success: true,
          },
        },
        201,
      );
    },
  );

export default posRouter;
