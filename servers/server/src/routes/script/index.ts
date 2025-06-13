import {
  Business,
  BusinessPosConfig,
  BusinessSettings,
  Category,
  Dish,
  GroupAnalytic,
  GroupModel,
  HotelRoomType,
  HotelService,
  HotelServiceCategory,
  HotelStaffRole,
  LoyaltySettings,
  Menu,
  OutLetInfo,
  Payment,
  PaymentAlert,
  Reviews,
  Subscriber,
  Table,
  UrlModel,
  User,
  UserAnalytic,
  WhatsAppBusinessConfig,
  WhatsAppWABA,
  Zone,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { schedule } from "node-cron";
import { z } from "zod";
import { cache } from "../../utils/cacheHelper";
import { petpoojaPosConfig } from "../../utils/posConfig/petPooja";
import { razorpayWrapper } from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";
import { whatsAppConfig } from "../../utils/whatAppTemplate";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";

//

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

const getCurrentDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0"); // Ensure 2-digit day
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = today.getFullYear();
  return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
};
const scriptRouter = new Hono()

  .get("/add_service/:businessId", async (c) => {
    try {
      const businessId = c.req.param("businessId");

      // **1. Check if Business Exists**
      const business = await Business.findById(businessId).lean();
      if (!business) {
        return c.json(
          { message: "Business not found", err: true, data: {} },
          400,
        );
      }

      // **2. Define Service Categories**
      const categoryServices = [
        {
          name: "TV",
          image: "https://assets.hipalz.com/tv.png",
          businessId,
        },
        {
          name: "AC",
          image: "https://assets.hipalz.com/ac%20repair.png",
          businessId,
        },
        {
          name: "PLUMBING",
          image: "https://assets.hipalz.com/plumber.png",
          businessId,
        },
        {
          name: "WIFI",
          image: "https://assets.hipalz.com/wifi.png",
          businessId,
        },
        {
          name: "WATERBOTTLE",
          image: "https://assets.hipalz.com/waterbottle.jpg",
          businessId,
        },
        {
          name: "CARPENTER",
          image: "https://assets.hipalz.com/carpenter.png",
          businessId,
        },
        {
          name: "PAINT",
          image: "https://assets.hipalz.com/painter.png",
          businessId,
        },
        {
          name: "LIFT",
          image: "https://assets.hipalz.com/lift%20repair.png",
          businessId,
        },
        {
          name: "FOOD",
          image: "https://assets.hipalz.com/foodimage.png",
          businessId,
        },
        {
          name: "HOUSE_KEEPING",
          image: "https://assets.hipalz.com/house%20keeping.png",
          businessId,
        },
      ];

      // **3. Insert Categories and Get IDs**
      const insertedCategories =
        await HotelServiceCategory.insertMany(categoryServices);
      const categoryMap = Object.fromEntries(
        insertedCategories.map((cat) => [cat.name, cat._id]),
      );

      // **4. Define Sub-Services**
      const subServices = [
        {
          name: "WATER BOTTLE",
          businessId,
          categoryId: categoryMap["WATERBOTTLE"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Tv Remote not working",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Set up box not working",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
        },
        {
          name: "operating issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Battery issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
        },
        {
          name: "switch on issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "tv connect to wifi issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
        },

        {
          name: "Ac not working",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 10,
        },
        {
          name: "switch on issue",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
        },
        {
          name: "filter cleaning issue",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 10,
        },

        {
          name: "Ac Remote setting changes",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 7,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 6,
        },
        {
          name: "AC gas leakage",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 36000,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 36000,
        },
        {
          name: "Water not coming",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 10,
        },
        {
          name: "health Faucet checking",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "w.c Tank checking",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "sink chowk",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "nani trap Jam",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "Head shower not working",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "Towel rack came out",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "Health faucet stand came out",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "Wifi not working",
          businessId,
          categoryId: categoryMap["WIFI"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "infrom to vendor",
          businessId,
          categoryId: categoryMap["WIFI"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "PRI Line issues - inform vendor",
          businessId,
          categoryId: categoryMap["WIFI"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "Door not closing",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Door lock issue",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "lock software issue- vendor scope",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "main door not closing properly",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },

        {
          name: "paint touch up",
          businessId,
          categoryId: categoryMap["PAINT"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Lift not working",
          businessId,
          categoryId: categoryMap["LIFT"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Reset",
          businessId,
          categoryId: categoryMap["LIFT"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Major issue",
          businessId,
          categoryId: categoryMap["LIFT"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
        },
        {
          name: "Dental Kit",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Comb",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Soap",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Shaving Kit",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Shower Cap",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "TCM(Tea, Coffee Maker)",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Body Lotion",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Toilet Roll",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Water Bottles",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Match Box",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Shower Gel",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Pencil",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Note Pad",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Laundry Bag",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Slippers",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Nail Cutter",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Bucket & Mug",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Iron Box & Board",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Hair Oil",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "All Out",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Tissues",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Extra Bed",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 30,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 28,
        },
        {
          name: "Extra Pillow",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
        },
        {
          name: "Extra Bedsheet Or Duvet",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
        },
        {
          name: "Room Cleaning",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
        },
        {
          name: "Laundry Delivery",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
        },
        {
          name: "Sanitary Pads",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
        },
        {
          name: "Food Delivery",
          businessId,
          categoryId: categoryMap["FOOD"],
          avgCompletionTime: 35,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 30,
        },
      ];

      // **5. Insert Sub-Services**
      const insertedServices = await HotelService.insertMany(subServices);

      // **6. Organize Services by Category**
      const categoryServiceMap = {};
      insertedServices.forEach((service) => {
        if (!categoryServiceMap[service.categoryId]) {
          categoryServiceMap[service.categoryId] = [];
        }
        categoryServiceMap[service.categoryId].push(service._id);
      });

      // **7. Update Each Category with `serviceIds`**
      await Promise.all(
        Object.keys(categoryServiceMap).map((categoryId) =>
          HotelServiceCategory.findByIdAndUpdate(categoryId, {
            $set: { serviceIds: categoryServiceMap[categoryId] },
          }),
        ),
      );

      return c.json(
        {
          message:
            "Categories, sub-services, and serviceIds updated successfully",
          err: false,
          data: {},
        },
        201,
      );
    } catch (error) {
      console.error("Error adding services:", error);
      return c.json(
        { message: "Internal Server Error", err: true, data: {} },
        500,
      );
    }
  })

  .get("/add_hotel/role/hotel", async (c) => {
    const role = [
      {
        _id: "67cec233a57ca03d9353d468",
        role: "FRONT_OFFICE",
      },
      {
        _id: "67cec240a57ca03d9353d46c",
        role: "MANAGER",
      },
      {
        _id: "67cec247a57ca03d9353d46f",
        role: "CLEANER",
      },
      {
        _id: "67cec250a57ca03d9353d472",
        role: "LAUNDRY",
      },
      {
        _id: "67cec255a57ca03d9353d475",
        role: "KITCHEN",
      },
      {
        _id: "67cec25ba57ca03d9353d478",
        role: "ELECTRICIAN",
      },
      {
        _id: "67cec260a57ca03d9353d47b",
        role: "PLUMBER",
      },
      {
        _id: "67cec2e6a57ca03d9353d47e",
        role: "SECURITY",
      },
      {
        _id: "67cec2f0a57ca03d9353d481",
        role: "HOUSEKEEPING",
      },
    ];
    const roleData = await HotelStaffRole.insertMany(role);

    return c.json(
      {
        message: "Hotel Roles added successfully",
        err: false,
        data: roleData,
      },
      200,
    );
  })

  .get("/add_zone_and_menu", async (c) => {
    const business = await Business.find();
    for (const businessData of business) {
      const zone = await Zone.findOne({
        businessId: businessData._id,
      });

      const parentCat = await Category.exists({
        businessId: businessData._id,
        hierarchy: "PARENT",
      });

      const isHavePos = await BusinessPosConfig.findOne({
        businessId: businessData._id,
        isDeleted: false,
        active: true,
      });

      if (!zone && !isHavePos) {
        const urlS = await UrlModel.find({
          businessId: businessData._id,
        });

        const newZone = new Zone({
          name: "Default",
          businessId: businessData._id,
          isActive: true,
        });
        await newZone.save();

        const menu = new Menu({
          name: "Default",
          businessId: businessData._id,
          zoneIds: [newZone._id],
          menuType: parentCat ? 1 : 2,
          days: [1, 2, 3, 4, 5, 6, 7],
          startTime: 240,
          endTime: 240,
          isActive: true,
          isDeleted: false,
          categoryLayout: 2,
          cardLayout: 2,
          default: true,
          primaryColor: "#ec4899",
          secondaryColor: "#fce7f3",
        });

        await menu.save();

        await Dish.updateMany(
          { businessId: businessData._id },
          {
            $set: {
              menuId: menu._id,
            },
          },
        );

        await Category.updateMany(
          { businessId: businessData._id },
          {
            $set: {
              menuId: menu._id,
            },
          },
        );

        for (const url of urlS) {
          const longUrl = url.longUrl;
          const parsedUrl = new URL(longUrl);
          const tableName = parsedUrl.searchParams.get("tableName");

          const createTable = await Table.create({
            name: tableName,
            businessId: businessData._id,
            zoneId: newZone._id,
            internalZoneId: newZone._id,
            isActive: true,
            isDeleted: false,
            tableLink: url.shortUrl,
          });

          const updateZone = await Zone.findByIdAndUpdate(
            newZone._id,
            {
              $push: {
                tableIds: createTable._id,
              },
            },
            { new: true },
          );
        }
      }
    }

    return c.json(
      {
        message: "Zone and Menu added successfully",
        err: false,
        data: {},
      },
      200,
    );
  })

  .get("/add_zone_and_menu_for_pos", async (c) => {
    const business = await Business.find();
    for (const businessData of business) {
      const isHavePos = await BusinessPosConfig.findOne({
        businessId: businessData._id,
        isDeleted: false,
        active: true,
      });

      const parentCat = await Category.exists({
        businessId: businessData._id,
        hierarchy: "PARENT",
      });
      if (isHavePos) {
        const zone = await Zone.find({
          businessId: businessData._id,
        });

        const zoneIds = zone.map((zone) => zone._id.toString());
        const createMenu = await Menu.create({
          name: "Default",
          businessId: businessData._id,
          zoneIds: zoneIds,
          menuType: parentCat ? 1 : 2,
          days: [1, 2, 3, 4, 5, 6, 7],
          startTime: 240,
          endTime: 239,
          isActive: true,
          isDeleted: false,
          categoryLayout: 2,
          cardLayout: 2,
          primaryColor: "#ec4899",
          secondaryColor: "#fce7f3",
        });
      }
    }

    return c.json(
      {
        message: "Zone and Menu added successfully",
        err: false,
        data: {},
      },
      200,
    );
  })

  .post(
    "/loyalty_on_off",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        isActive: z.boolean(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, isActive } = requestData;
        const business = await Business.exists({
          _id: businessId,
        });
        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        const loyaltySetting = await LoyaltySettings.findOneAndUpdate(
          { businessId },
          {
            $set: {
              isActive: isActive,
            },
          },
          { session, new: true },
        );

        if (!loyaltySetting) {
          return respond(c, "Loyalty setting not found", true, 404, {});
        }
        return respond(
          c,
          "Loyalty setting updated successfully",
          false,
          200,
          {},
        );
      });
    },
  )

  .post(
    "/change_razorpay_credential",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        razorpayKeyId: z.string().optional(),
        razorpayKeySecret: z.string().optional(),
        razorpayMerchantId: z.string().optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId } = requestData;

        const businessSettings = await BusinessSettings.findOne({
          businessId,
        });

        if (!businessSettings) {
          return respond(c, "Business not found", true, 404, {});
        }

        if (
          requestData.razorpayKeyId &&
          requestData.razorpayKeySecret &&
          requestData.razorpayMerchantId
        ) {
          const deletes = cache.delete(businessId as string);

          await BusinessSettings.findByIdAndUpdate(businessSettings._id, {
            razorpayKeyId: requestData.razorpayKeyId,
            razorpayKeySecret: requestData.razorpayKeySecret,
            razorpayMerchantId: requestData.razorpayMerchantId,
          });

          try {
            await razorpayWrapper.create(requestData.razorpayMerchantId);
            console.log(
              "Razorpay instance created successfully",
              requestData.razorpayMerchantId,
            );
          } catch (err) {
            return respond(
              c,
              "Error in creating Razorpay instance",
              true,
              400,
              {},
            );
          }
        }
      });
    },
  )

  .post(
    "/razorpay_on_off",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        isActive: z.boolean(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, isActive } = requestData;

        const business = await Business.exists({
          _id: businessId,
        });

        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        if (isActive === false) {
          const deletes = cache.delete(businessId as string);
          const businessSettings = await BusinessSettings.findOneAndUpdate(
            { businessId },
            {
              $set: {
                isActive: isActive,
              },
            },
            { session, new: true },
          );

          if (!businessSettings) {
            return respond(c, "Business not found", true, 404, {});
          }

          return respond(
            c,
            "Business setting updated successfully",
            false,
            200,
            {},
          );
        }

        const businessSettings = await BusinessSettings.findOneAndUpdate(
          { businessId },
          {
            $set: {
              isActive: isActive,
            },
          },
          { session, new: true },
        );

        if (!businessSettings) {
          return respond(c, "Business not found", true, 404, {});
        }

        return respond(
          c,
          "Business setting updated successfully",
          false,
          200,
          {},
        );
      });
    },
  )
  .post(
    "/payment_deletion",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        from: z.number(),
        to: z.number(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, from, to } = requestData;

        const updatePayment = await Payment.updateMany(
          {
            businessId,
            date: {
              $gte: from,
              $lte: to,
            },
          },

          {
            $set: {
              isDeleted: true,
            },
          },
          { session },
        );

        if (!updatePayment) {
          return respond(c, "Payment not found", true, 404, {});
        }

        const updatePaymentAlert = await PaymentAlert.updateMany(
          {
            businessId,
            date: {
              $gte: from,
              $lte: to,
            },
          },
          {
            $set: {
              isRejected: true,
            },
          },
          { session },
        );
        if (!updatePaymentAlert) {
          return respond(c, "Payment alert not found", true, 404, {});
        }

        return respond(
          c,
          "Payment setting updated successfully",
          false,
          200,
          {},
        );
      });
    },
  )

  .post(
    "/pos_on_off",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        isActive: z.boolean(),
        restId: z.string(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, isActive, restId } = requestData;

        const business = await Business.findById(businessId).lean();
        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        if (isActive === false) {
          const updateBusinessPosConfig =
            await BusinessPosConfig.findOneAndUpdate(
              {
                businessId,
                active: true,
                isDeleted: false,
              },
              {
                $set: {
                  isDeleted: true,
                },
              },
              { session },
            );

          if (!updateBusinessPosConfig) {
            return respond(c, "Business not found", true, 404, {});
          }

          const updateOutlet = await OutLetInfo.findOneAndUpdate(
            {
              businessId,
            },
            {
              $set: {
                isPosEnabled: false,
              },
            },
            { session },
          );

          if (!updateOutlet) {
            return respond(c, "Outlet not found", true, 404, {});
          }

          return respond(c, "pos setting updated successfully", false, 200, {});
        }

        const updateBusinessPosConfig =
          await BusinessPosConfig.findOneAndUpdate(
            {
              businessId,
              active: true,
              isDeleted: false,
            },
            {
              $set: {
                isDeleted: false,
                accessKey: petpoojaPosConfig.accessKey,
                secretKey: petpoojaPosConfig.secretKey,
                authToken: petpoojaPosConfig.authToken,
                branchId: businessId,
                businessId,
                posName: "PETPOOJA",
                date: Date.now(),
                orderMode: "WITH_ORDER",
                orderVerificationType: "CAPTAIN",
                restName: business.name,
                restId: restId,
              },
            },
            { session, upsert: true, new: true },
          );
        if (!updateBusinessPosConfig) {
          return respond(c, "Business not found", true, 404, {});
        }
        const updateOutlet = await OutLetInfo.findOneAndUpdate(
          {
            businessId,
          },
          {
            $set: {
              isPosEnabled: true,
            },
          },
          { session },
        );
        if (!updateOutlet) {
          return respond(c, "Outlet not found", true, 404, {});
        }
        return respond(c, "pos setting updated successfully", false, 200, {});
      });
    },
  )

  .post(
    "/kot_order_flow",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        flow: z.enum(["USER", "CAPTAIN"]),
        active: z.boolean().optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, flow, active } = requestData;

        const updateBusinessPosConfig =
          await BusinessPosConfig.findOneAndUpdate(
            {
              businessId,
              active: true,
              isDeleted: false,
            },
            {
              $set: {
                orderVerificationType: flow,
                // isDeleted: !active,
              },
            },
            { session, new: true },
          );
        if (!updateBusinessPosConfig) {
          return respond(c, "Business not found", true, 404, {});
        }

        // if (active === false) {
        //   await Dish.updateMany(
        //     {
        //       businessId,
        //     },
        //     {
        //       $set: {
        //         pos: false,
        //       },
        //     },
        //   );
        //   await AddOn.updateMany(
        //     {
        //       businessId,
        //     },
        //     {
        //       $set: {
        //         pos: false,
        //       },
        //     },
        //   );

        //   await Category.updateMany(
        //     {
        //       businessId: businessId,
        //     },
        //     {
        //       $set: {
        //         pos: false,
        //       },
        //     },
        //   );
        // }

        return respond(c, "pos setting updated successfully", false, 200, {});
      });
    },
  )

  .post(
    "/whatsapp_config",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        menuRedirection: z.enum(["WA", "MENU"]),
        phoneId: z.string(),
        whatsAppPhone: z.number(),
        whatsAppAccountId: z.string(),
        businessName: z.string().min(3).max(100),
        couponShortUrl: z.string().min(3).max(100),
        couponDiscount: z.number(),
        direction: z.string(),
        socialLink: z.string(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();

        const updateWhatsappConfig =
          await WhatsAppBusinessConfig.findOneAndUpdate(
            {
              businessId: requestData.businessId,
            },
            {
              $set: {
                menuRedirection: requestData.menuRedirection,
                phoneId: requestData.phoneId,
                whatsAppPhone: requestData.whatsAppPhone,
                whatsAppAccountId: requestData.whatsAppAccountId,
                token: whatsAppConfig.token,
                version: whatsAppConfig.version,
                businessName: requestData.businessName,
                couponShortUrl: requestData.couponShortUrl,
                couponDiscount: requestData.couponDiscount,
                direction: requestData.direction,
                socialLink: requestData.socialLink,
              },
            },
            { session, new: true, upsert: true },
          );

        if (!updateWhatsappConfig) {
          throw new Error("Business not found");
        }

        const updateWaba = await WhatsAppWABA.findOneAndUpdate(
          {
            businessId: requestData.businessId,
          },
          {
            $set: {
              businessId: requestData.businessId,
              displayName: "wa",
              displayNumber: "9588413799",
              status: true,
              date: Date.now(),
            },
          },
          { session, new: true, upsert: true },
        );

        if (!updateWaba) {
          throw new Error("Business not found");
        }

        return respond(c, "pos setting updated successfully", false, 200, {});
      });
    },
  )

  .post(
    "/change_business_owner",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        phone: z.string(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, phone } = requestData;

        const business = await Business.findById(businessId).lean();
        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }
        const user = await User.findOne({
          phone: phone,
        }).lean();
        if (!user) {
          return respond(c, "User not found", true, 404, {});
        }

        const updateBusiness = await Business.findByIdAndUpdate(
          businessId,
          {
            $set: {
              staffIds: user._id,
            },
          },
          { session, new: true },
        );
        if (!updateBusiness) {
          return respond(c, "Business not found", true, 404, {});
        }

        return respond(c, "pos setting updated successfully", false, 200, {});
      });
    },
  )

  .post(
    "/create_bill_summary_template",
    zValidator(
      "json",
      z.object({
        active: z.boolean().default(false),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();

        const cronExpression = "30 19 * * *";

        // Schedule the task
        schedule(
          cronExpression,
          async () => {
            const whatsAppBusinessConfig = await WhatsAppBusinessConfig.find({
              sendBillSummaryTemplate: true,
            });

            for (const config of whatsAppBusinessConfig) {
              const businessId = config.businessId;
              const business = await Business.findById(businessId);
              const ownerData = await User.findById(business?.staffIds[0]);

              const fromDate = startOfToday.getTime();
              const toDate = endOfToday.getTime();

              const payments = await Payment.find({
                businessId,
                isDeleted: false,
                date: { $gte: fromDate, $lte: toDate },
              });

              const reviewsCount = await Reviews.countDocuments({
                businessId,
                isDeleted: false,
                date: { $gte: fromDate, $lte: toDate },
              });

              let totalServiceCharge = 0;
              let totalTax = 0;
              let totalForceSettle = 0;
              let totalDiscount = 0;
              let totalCoinGiven = 0;
              let totalCoinClaimed = 0;
              let totalCouponUsed = 0;
              let totalComplementary = 0;

              let overAllAmount = 0;
              let totalOnlineSale = 0;
              const offlineSales: Record<string, number> = {};

              for (const payment of payments) {
                const { total = 0, paymentMode, mode, splitModes } = payment;
                totalServiceCharge += payment.serviceCharge ?? 0;
                totalTax += payment.tax ?? 0;
                totalForceSettle +=
                  payment.settleType === "FORCE_SETTLE" ? total : 0;
                totalDiscount += payment.claimedCoins ?? 0;
                totalCoinGiven += payment.earnCoins ?? 0;
                totalCoinClaimed += payment.claimedCoins ?? 0;
                totalCouponUsed += payment.couponId ? 1 : 0;
                totalComplementary +=
                  payment.mode === "complementary" ? payment.billValue : 0;

                if (mode === "split" && Array.isArray(splitModes)) {
                  let splitTotal = 0;

                  for (const settle of splitModes) {
                    if (settle.name !== "complementary") {
                      splitTotal += settle.amount ?? 0;
                      offlineSales[settle.name] =
                        (offlineSales[settle.name] || 0) + (settle.amount ?? 0);
                    }
                  }

                  overAllAmount += splitTotal; // Only add non-complementary split values
                } else if (!["dues", "npc", "complementary"].includes(mode)) {
                  overAllAmount += total; // Add total if it's not dues, npc, or complementary
                }

                if (paymentMode === "online") {
                  totalOnlineSale += total;
                } else if (
                  !["dues", "npc", "complementary"].includes(paymentMode)
                ) {
                  offlineSales[mode] = (offlineSales[mode] || 0) + total;
                }
              }

              const totalOfflinesales = Object.values(offlineSales).reduce(
                (acc, value) => acc + value,
                0,
              );

              const billSummary = {
                businessId,
                totalSales: overAllAmount,
                totalOnlineSales: totalOnlineSale,

                totalServiceCharge,
                totalTax,
                totalForceSettle,
                totalDiscount,
                upiMachine: offlineSales["(upi)machine"] || 0,
                cash: offlineSales["cash"] || 0,
                card: offlineSales["(card)machine"] || 0,
                swiggyPay: offlineSales["swiggypay"] || 0,
                zomato: offlineSales["zomatopay"] || 0,
                magicPin: offlineSales["magicpin"] || 0,
                totalCoinGiven,
                totalCoinClaimed,
                totalCouponUsed,
                totalComplementary,
                reviewsCount,
              };

              const currentDate = getCurrentDate();

              if (config) {
                try {
                  const res = await axios.post(
                    `${whatsAppApiBaseUrl.BASE_URL}${config?.version}/${config?.phoneId}/messages`,
                    {
                      messaging_product: "whatsapp",
                      to: ownerData?.phone?.toString(),
                      type: "template",
                      template: {
                        name: "sales_report_template",
                        language: { code: "en" },
                        components: [
                          {
                            type: "body",
                            parameters: [
                              {
                                type: "text",
                                text: business?.name,
                              },
                              {
                                type: "text",
                                text: currentDate,
                              },
                              {
                                type: "text",
                                text: overAllAmount,
                              },

                              {
                                type: "text",
                                text: totalOnlineSale,
                              },
                              {
                                type: "text",
                                text: totalOfflinesales,
                              },
                              {
                                type: "text",
                                text: totalServiceCharge.toFixed(2),
                              },
                              {
                                type: "text",
                                text: totalTax.toFixed(2),
                              },
                              {
                                type: "text",
                                text: totalForceSettle,
                              },
                              {
                                type: "text",
                                text: totalDiscount.toFixed(2),
                              },
                              {
                                type: "text",
                                text: billSummary.upiMachine,
                              },
                              {
                                type: "text",
                                text: billSummary.cash,
                              },
                              {
                                type: "text",
                                text: billSummary.card,
                              },
                              {
                                type: "text",
                                text: billSummary.swiggyPay,
                              },
                              {
                                type: "text",
                                text: billSummary.zomato,
                              },
                              {
                                type: "text",
                                text: billSummary.magicPin,
                              },
                              {
                                type: "text",
                                text: billSummary.totalCoinGiven,
                              },
                              {
                                type: "text",
                                text: billSummary.totalCoinClaimed,
                              },
                              {
                                type: "text",
                                text: billSummary.totalCouponUsed,
                              },
                              {
                                type: "text",
                                text: billSummary.totalComplementary,
                              },
                              {
                                type: "text",
                                text: reviewsCount,
                              },
                            ],
                          },
                        ],
                      },
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${config.token}`,
                      },
                    },
                  );
                } catch (error) {
                  console.log("Error sending WhatsApp message:", error);
                }
              }
            }
          },
          {
            scheduled: true,
            timezone: "Asia/Kolkata", // Ensure the timezone is set to IST
          },
        );

        return respond(c, "Scheduler set to run at 1 AM IST", false, 200, {});
      });
    },
  )

  .post(
    "/upload_special_banner",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        specialBannerUrl: z.string().url(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();

        const { businessId, specialBannerUrl } = requestData;

        const business = await OutLetInfo.findOneAndUpdate(
          {
            businessId,
          },
          {
            $set: {
              specialBannerUrl,
            },
          },
          { session, new: true },
        );
        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        return respond(c, "uploaded", false, 200, {});
      });
    },
  )

  .post(
    "/upload_customers",
    zValidator(
      "json",
      z.object({
        users: z.array(
          z.object({
            name: z.string().min(2).max(50),
            phone: z.string().min(10).max(10),
            dob: z.number(),
          }),
        ),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { users } = requestData;

        for (const user of users) {
          const { phone, name, dob } = user;

          const userExist = await User.exists({
            phone: phone,
          });

          if (!userExist) {
            const createUser = new User({
              phone,
              dob,
              name,
            });

            await createUser.save();
          }
        }

        return respond(c, "Customers uploaded successfully", false, 200, {});
      });
    },
  )

  .post(
    "/enable_bill_summary_template",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        sendBillSummaryTemplate: z.boolean(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, sendBillSummaryTemplate } = requestData;

        const updateWhatsappConfig =
          await WhatsAppBusinessConfig.findOneAndUpdate(
            {
              businessId: businessId,
            },
            {
              $set: {
                sendBillSummaryTemplate: sendBillSummaryTemplate,
              },
            },
            { session, new: true },
          );

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/change_outlet_type",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        businessType: z.enum([
          "FOOD",
          "OTHER",
          "RESTAURANT",
          "HOTEL",
          "E-COMMERCE",
          "CLINIC",
          "FASHION_AND_JEWELRY",
          "MENU",
        ]),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, businessType } = requestData;

        const businessOutLet = await OutLetInfo.findOneAndUpdate(
          {
            businessId,
          },
          {
            $set: {
              outLetType: businessType,
            },
          },
          { session, new: true },
        );

        if (!businessOutLet) {
          return respond(c, "Business not found", true, 404, {});
        }
        const business = await Business.findByIdAndUpdate(
          businessId,
          {
            $set: {
              businessType: businessType,
            },
          },
          { session, new: true },
        );

        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/update_subscribers",
    zValidator(
      "json",
      z.object({
        update: z.boolean(),
        businessId: z.string().min(3).max(36),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { update, businessId } = requestData;

        const subscribers = await Subscriber.find({
          businessId: businessId,
        });

        for (const subscriber of subscribers) {
          const userId = subscriber.userId;
          const businessId = subscriber.businessId;

          const userAnalyticsExist = await UserAnalytic.exists({
            businessId,
            userId,
          });

          if (!userAnalyticsExist) {
            const userAnalytics = new UserAnalytic({
              businessId,
              userId,
              avgSpend: 0,
              totalSpend: 0,
              visitCount: 1,
              coinzIssued: 0,
              coinzUsed: 0,
              couponCount: 0,
              currentCoins: 0,
              dateOfJoining: Date.now(),
            });

            await userAnalytics.save();
          }
        }

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/whatsapp_coupon",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        urlCode: z.string().min(3).max(36),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { urlCode, businessId } = requestData;

        const updateUrlModel = await UrlModel.findOneAndUpdate(
          {
            businessId: businessId,
            urlCode: urlCode,
          },
          {
            $set: {
              shortUrlType: "COUPON",
            },
          },
          { session, new: true },
        );
        if (!updateUrlModel) {
          return respond(c, "Url not found", true, 404, {});
        }

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/enable_group_analytics",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        schedule("0 19 * * *", async () => {
          const res = await axios.put(
            "https://api.test.hipalz.com/groups/updateLateNightUsers/all",
            {
              businessId: requestData.businessId,
            },
          );
        });
        schedule("0 20 * * *", async () => {
          await axios.put(
            "https://api.test.hipalz.com/groups/updateDefaultGroups/all",
            {
              businessId: requestData.businessId,
            },
          );
        });

        // 3:00am IST (21:30 UTC previous day)
        schedule("0 21 * * *", async () => {
          await axios.put(
            "https://api.test.hipalz.com/groups/updateMorningUsersGroup/all",
            {
              businessId: requestData.businessId,
            },
          );
        });

        // 4:00am IST (22:30 UTC previous day)
        schedule("0 22 * * *", async () => {
          await axios.put(
            "https://api.test.hipalz.com/groups/updateAfterNoonUsers/all",
            {
              businessId: requestData.businessId,
            },
          );
        });

        // 5:00am IST (23:30 UTC previous day)
        schedule("0 23 * * *", async () => {
          await axios.put(
            "https://api.test.hipalz.com/groups/updateEveningUsers/all",
            {
              businessId: requestData.businessId,
            },
          );
        });

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/enable_dnamic_group_analytics",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        schedule("0 20 * * *", async () => {
          const res = await axios.post(
            "https://api.test.hipalz.com/groups/update_dnamic_group",
            {
              businessId: requestData.businessId,
            },
          );
        });

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/update_group_analytics",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const allDefaultGroups = await GroupModel.find({
          isDefault: true,
        });

        for (const group of allDefaultGroups) {
          const groupId = group._id;

          const groupAnalytics = await GroupAnalytic.findOneAndUpdate(
            {
              groupId: groupId,
            },
            {
              $set: {
                isDefault: true,
              },
            },
            {
              session,
              upsert: true,
              new: true,
            },
          );
        }

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/update_group_analytics_by_name_for_default",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const groupNames = [
          "Best users",
          "Average users",
          "Attention Required users",
          "Lost users",
          "best users",
          "average users",
          "attention required users",
          "lost users",
          "best Users",
          "average Users",
          "attention Required Users",
          "lost Users",
          "attention Required Users",
        ];
        await GroupModel.updateMany(
          {
            name: { $in: groupNames },
            groupType: "DYNAMIC",
          },
          {
            isDefault: true,
          },
        );

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/update_morning_group",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const morningGroupNames = [
          "morning customer",
          "morning Customers",
          "Morning Customer",
          "morning customer",
          "morning Customers",
          "Morning Customer",
          "morning customer",
          "morning Customers",
          "Morning Customer",
        ];
        await GroupModel.updateMany(
          {
            name: { $in: morningGroupNames },
            groupType: "DYNAMIC",
          },
          {
            morning: true,
          },
        );

        const afterNoonGroupNames = [
          "after noon customer",
          "after noon Customers",
          "After Noon Customer",
          "afterNoon customer",
          "afterNoon Customers",
          "AfterNoon Customer",
        ];

        await GroupModel.updateMany(
          {
            name: { $in: afterNoonGroupNames },
            groupType: "DYNAMIC",
          },
          {
            afternoon: true,
          },
        );

        const eveningGroupNames = [
          "evening customer",
          "evening Customers",
          "Evening Customer",
          "evening customer",
          "evening Customers",
          "Evening Customer",
        ];
        await GroupModel.updateMany(
          {
            name: { $in: eveningGroupNames },
            groupType: "DYNAMIC",
          },
          {
            evening: true,
          },
        );

        const nightGroupNames = [
          "late night customer",
          "late night Customers",
          "Late Night Customer",
          "lateNight customer",
          "lateNight Customers",
          "LateNight Customer",
          "night customer",
        ];

        await GroupModel.updateMany(
          {
            name: { $in: nightGroupNames },
            groupType: "DYNAMIC",
          },
          {
            night: true,
          },
        );

        return respond(c, "done", false, 200, {});
      });
    },
  )

  .post(
    "/ugroup_payment_by_userId",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const allPayments = await Payment.find({
          isDeleted: false,
        });
        // Aggregate payments by userId and businessId
        const result: Array<{
          userId: string;
          businessId: string;
          data: {
            total: number;
            coinzUsed: number;
            coinzIssued: number;
          };
        }> = [];

        const temp: Record<
          string,
          Record<
            string,
            {
              total: number;
              coinzUsed: number;
              coinzIssued: number;
            }
          >
        > = {};

        for (const payment of allPayments) {
          const userId = payment.userId?.toString?.() ?? "";
          const businessId = payment.businessId?.toString?.() ?? "";

          if (!userId || !businessId) continue;

          if (!temp[userId]) {
            temp[userId] = {};
          }
          if (!temp[userId][businessId]) {
            temp[userId][businessId] = {
              total: 0,
              coinzUsed: 0,
              coinzIssued: 0,
            };
          }

          temp[userId][businessId].total += payment.total ?? 0;

          if (payment.claimedCoins) {
            temp[userId][businessId].coinzUsed += payment.claimedCoins;
          }
          if (payment.earnCoins) {
            temp[userId][businessId].coinzIssued += payment.earnCoins;
          }
        }

        for (const userId in temp) {
          for (const businessId in temp[userId]) {
            result.push({
              userId,
              businessId,
              data: temp[userId][businessId],
            });
          }
        }

        for (const item of result) {
          const { userId, businessId, data } = item;

          const userAnalyticsExist = await UserAnalytic.findOne({
            userId,
            businessId,
          });

          const userAnalytics = await UserAnalytic.findOneAndUpdate(
            {
              userId,
              businessId,
            },
            {
              $set: {
                totalSpend: data.total,
                coinzUsed: data.coinzUsed,
                coinzIssued: data.coinzIssued,
                avgSpend: Math.round(
                  data.total / userAnalyticsExist?.visitCount || 30,
                ), // Assuming 30 days for average calculation
              },
            },
            { session, upsert: true, new: true },
          );
        }

        return respond(c, "done", false, 200, result);
      });
    },
  )

  .post(
    "/add_room_type",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        roomType: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, roomType } = requestData;

        const addRoomType = new HotelRoomType({
          businessId,
          roomType,
        });

        const saveData = await addRoomType.save({ session });

        return respond(c, "d", false, 200, {});
      });
    },
  )

  .post(
    "/update_outlet",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const result = await OutLetInfo.updateMany(
          {},
          {
            $set: {
              currencySymbol: "₹",
              currencyCode: "INR",
            },
          },
        );

        return respond(c, "d", false, 200, {});
      });
    },
  )

  .post(
    "/sharecart_on_off",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36),
        shareCart: z.boolean().default(false),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, shareCart } = requestData;
        const updateOutlet = await OutLetInfo.findOneAndUpdate(
          {
            businessId,
          },
          {
            $set: {
              shareCart,
            },
          },
          { session, new: true },
        );
        if (!updateOutlet) {
          return respond(c, "Outlet not found", true, 404, {});
        }

        return respond(c, "d", false, 200, {});
      });
    },
  );

export default scriptRouter;
