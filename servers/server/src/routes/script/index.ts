import {
  Business,
  BusinessPosConfig,
  Category,
  Dish,
  HotelService,
  HotelServiceCategory,
  HotelStaffRole,
  Menu,
  OutLetInfo,
  Pos,
  Zone,
} from "@hi/db-models";
import { Hono } from "hono";
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

  .get("/add_zone_and_menu", async (c) => {
    const business = await Business.find();
    for (const businessData of business) {
      const zone = await Zone.findOne({
        businessId: businessData._id,
      });

      if (!zone) {
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
          menuType: 1,
          days: [1, 2, 3, 4, 5, 6, 7],
          startTime: 0,
          endTime: 86400000,
          isActive: true,
          isDeleted: false,
        });

        await menu.save();
        await OutLetInfo.findOneAndUpdate(
          { businessId: businessData._id },
          {
            $set: {
              menuId: menu._id,
            },
          },
          { new: true },
        );

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
  });

export default scriptRouter;
