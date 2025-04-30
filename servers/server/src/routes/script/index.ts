import {
  Business,
  BusinessPosConfig,
  BusinessSettings,
  Category,
  Dish,
  HotelService,
  HotelServiceCategory,
  HotelStaffRole,
  LoyaltySettings,
  Menu,
  OutLetInfo,
  Payment,
  PaymentAlert,
  Pos,
  Table,
  UrlModel,
  User,
  WhatsAppBusinessConfig,
  Zone,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import { cache } from "../../utils/cacheHelper";
import { petpoojaPosConfig } from "../../utils/posConfig/petPooja";
import { razorpayWrapper } from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";
import { whatsAppConfig } from "../../utils/whatAppTemplate";

//
const scriptRouter = new Hono()
  .get("/pos_to_businessposconfig", async (c) => {
    const businesses = await Business.find();

    for (const business of businesses) {
      const businessId = business._id;
      const businessPosConfig = await BusinessPosConfig.findOne({ businessId });
      if (businessPosConfig) {
        const pos = await Pos.findOne({ _id: businessPosConfig.posId });
        if (pos) {
          await BusinessPosConfig.findOneAndUpdate(
            { businessId },
            {
              $set: {
                branchId: pos._id, /// ADD THIS LINE LATER
                accessKey: pos.accessKey,
                secretKey: pos.secretKey,
                restId: pos.restId,
                authToken: pos.authToken,
                posName: "PETPOOJA",
              },
            },
            { new: true },
          );
        }
      }
    }

    return c.json(
      {
        message: "Script executed successfully",
        err: false,
        data: {},
      },
      200,
    );
  })

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
          image: "https://assets.hipalz.com/Tv-removebg-preview.png",
          businessId,
        },
        {
          name: "AC",
          image: "https://assets.hipalz.com/AC_Service-removebg-preview.png",
          businessId,
        },
        {
          name: "PLUMBING",
          image: "https://assets.hipalz.com/Plumber-removebg-preview.png",
          businessId,
        },
        {
          name: "WIFI",
          image: "https://assets.hipalz.com/wifi%20router.png",
          businessId,
        },
        {
          name: "WATERBOTTLE",
          image: "https://assets.hipalz.com/waterbottle.jpg",
          businessId,
        },
        {
          name: "CARPENTER",
          image: "https://assets.hipalz.com/Carpenter-removebg-preview.png",
          businessId,
        },
        {
          name: "PAINT",
          image: "https://assets.hipalz.com/Painter-removebg-preview.png",
          businessId,
        },
        {
          name: "LIFT",
          image: "https://assets.hipalz.com/Lift-removebg-preview.png",
          businessId,
        },
        {
          name: "FOOD",
          image: "https://assets.hipalz.com/food.png",
          businessId,
        },
        {
          name: "HOUSE_KEEPING",
          image: "https://assets.hipalz.com/room%20cleaming.png",
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
          endTime: 240,
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
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const { businessId, flow } = requestData;

        const updateBusinessPosConfig =
          await BusinessPosConfig.findOneAndUpdate(
            {
              businessId,
            },
            {
              $set: {
                orderVerificationType: flow,
              },
            },
            { session, new: true },
          );
        if (!updateBusinessPosConfig) {
          return respond(c, "Business not found", true, 404, {});
        }

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
              },
            },
            { session, new: true },
          );

        if (!updateWhatsappConfig) {
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
  );

export default scriptRouter;
