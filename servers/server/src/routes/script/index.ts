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
  Zone,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { z } from "zod";
import { cache } from "../../utils/cacheHelper";
import { petpoojaPosConfig } from "../../utils/posConfig/petPooja";
import { razorpayWrapper } from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";

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
          name: "Laundry",
          image: "https://assets.hipalz.com/laundry_service.png",
          businessId,
        },
        {
          name: "Room Cleaning",
          image: "https://assets.hipalz.com/clean_room.png",
          businessId,
        },
        {
          name: "Order Food",
          image: "https://assets.hipalz.com/order_food.png",
          businessId,
        },
        {
          name: "Bathroom",
          image: "https://assets.hipalz.com/bathroom_service.png",
          businessId,
        },
        {
          name: "Other",
          image: "https://assets.hipalz.com/other_service.png",
          businessId,
        },
        {
          name: "Electrician",
          image: "https://assets.hipalz.com/other_service.png",
          businessId,
        },
        {
          name: "Carpenter",
          image: "https://assets.hipalz.com/other_service.png",
          businessId,
        },
        {
          name: "Plumber",
          image: "https://assets.hipalz.com/other_service.png",
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
          name: "Wash & Fold",
          image: "https://assets.hipalz.com/wash_fold.png",
          businessId,
          categoryId: categoryMap["Laundry"],
        },
        {
          name: "Wash & Iron",
          image: "https://assets.hipalz.com/wash_iron.png",
          businessId,
          categoryId: categoryMap["Laundry"],
        },
        {
          name: "Dry Cleaning",
          image: "https://assets.hipalz.com/dry_cleaning.png",
          businessId,
          categoryId: categoryMap["Laundry"],
        },
        {
          name: "Ironing",
          image: "https://assets.hipalz.com/ironing.png",
          businessId,
          categoryId: categoryMap["Laundry"],
        },
        {
          name: "Steam Ironing",
          image: "https://assets.hipalz.com/steam_ironing.png",
          businessId,
          categoryId: categoryMap["Laundry"],
        },

        {
          name: "Full Room Cleaning",
          image: "https://assets.hipalz.com/full_clean.png",
          businessId,
          categoryId: categoryMap["Room Cleaning"],
        },
        {
          name: "Dusting & Vacuuming",
          image: "https://assets.hipalz.com/dust_vacuum.png",
          businessId,
          categoryId: categoryMap["Room Cleaning"],
        },

        {
          name: "Food",
          image: "https://assets.hipalz.com/dinner_order.png",
          businessId,
          categoryId: categoryMap["Order Food"],
        },

        {
          name: "Clean Bathroom",
          image: "https://assets.hipalz.com/plumbing_fix.png",
          businessId,
          categoryId: categoryMap["Bathroom"],
        },
        {
          name: "Shower Repair",
          image: "https://assets.hipalz.com/shower_repair.png",
          businessId,
          categoryId: categoryMap["Bathroom"],
        },

        {
          name: "Tv Remote not working",
          image: "https://assets.hipalz.com/electrical_work.png",
          businessId,
          categoryId: categoryMap["Electrician"],
        },
        {
          name: "Light Fixture Repair",
          image: "https://assets.hipalz.com/light_repair.png",
          businessId,
          categoryId: categoryMap["Electrician"],
        },
        {
          name: "Setup box not working",
          image: "https://assets.hipalz.com/light_repair.png",
          businessId,
          categoryId: categoryMap["Electrician"],
        },
        {
          name: "Fan Repair",
          image: "https://assets.hipalz.com/fan_repair.png",
          businessId,
          categoryId: categoryMap["Electrician"],
        },
        {
          name: "Ac not working",
          image: "https://assets.hipalz.com/fan_repair.png",
          businessId,
          categoryId: categoryMap["Electrician"],
        },

        {
          name: "wifi not working",
          image: "https://assets.hipalz.com/fan_repair.png",
          businessId,
          categoryId: categoryMap["Electrician"],
        },

        {
          name: "Door Repair",
          image: "https://assets.hipalz.com/door_repair.png",
          businessId,
          categoryId: categoryMap["Carpenter"],
        },
        {
          name: "Window Repair",
          image: "https://assets.hipalz.com/window_repair.png",
          businessId,
          categoryId: categoryMap["Carpenter"],
        },

        {
          name: "Leakage Fixing",
          image: "https://assets.hipalz.com/leakage_fix.png",
          businessId,
          categoryId: categoryMap["Plumber"],
        },
        {
          name: "Pipe Repair",
          image: "https://assets.hipalz.com/pipe_repair.png",
          businessId,
          categoryId: categoryMap["Plumber"],
        },

        {
          name: "water supply not working",
          image: "https://assets.hipalz.com/pipe_repair.png",
          businessId,
          categoryId: categoryMap["Plumber"],
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
        role: "HELP_DESK",
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

  .get("/add_zone_and_menu/all", async (c) => {
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
            name: tableName || nanoid(5),
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

  .get("/add_zone_and_menu_for_pos/all", async (c) => {
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
  );

export default scriptRouter;
