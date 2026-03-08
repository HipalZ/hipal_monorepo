import {
  AddOn,
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
  HotelStaffLevel,
  HotelStaffRole,
  LoyaltySettings,
  Menu,
  OutLetInfo,
  Payment,
  PaymentAlert,
  Reviews,
  Subscriber,
  Table,
  UnsettleTable,
  UrlModel,
  User,
  UserAnalytic,
  UserReward,
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
// import { enqueueBillJob } from "../../queues/enqueue";
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
          image:
            "https://t-static.blr1.digitaloceanspaces.com/ade35fc5-6c64-46e6-b3c9-5067d92d171f.png",
        },
        {
          name: "Tv Remote not working",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/761b3244-a33b-4e9d-ae95-176b387917b5.png",
        },
        {
          name: "Set up box not working",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/0a7c0ed5-476f-41df-93e9-d9a56c874524.png",
        },
        {
          name: "operating issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/6925e0e0-3086-4314-b9ad-789f142a80a9.jpeg",
        },
        {
          name: "Battery issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/d4fc3128-1769-412c-b344-1c3fa8125af4.jpeg",
        },
        {
          name: "switch on issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/2761b5de-fae8-42d8-8f25-8f12cfad7c37.jpeg",
        },
        {
          name: "tv connect to wifi issue",
          businessId,
          categoryId: categoryMap["TV"],
          avgCompletionTime: 8,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/84f14a31-ba5c-4b83-9477-fa8c8bbe2744.jpeg",
        },
        {
          name: "Ac not working",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 10,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/c42238ba-f305-441a-bc92-5998b73f95f4.png",
        },
        {
          name: "switch on issue",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/2761b5de-fae8-42d8-8f25-8f12cfad7c37.jpeg",
        },
        {
          name: "filter cleaning issue",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 10,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/75d206bd-052a-4400-b463-da0929341809.jpeg",
        },
        {
          name: "Ac Remote setting changes",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 7,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 6,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/0c602864-22b7-4b0c-82e8-66bbe39efb36.png",
        },
        {
          name: "AC gas leakage",
          businessId,
          categoryId: categoryMap["AC"],
          avgCompletionTime: 30,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 28,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/08c7819f-8ae6-46ee-b2a1-2c62e454de3d.jpeg",
        },
        {
          name: "Water not coming",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 5,
          avgDeliveryTime: 10,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/3ee2396a-aa8b-46c9-9c68-0af8ee5dfed9.jpeg",
        },
        {
          name: "health Faucet checking",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/898612a9-e231-49e6-ada1-3cf9ea4b3873.jpeg",
        },
        {
          name: "w.c Tank checking",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/1568803e-9dc7-49f2-80c1-d7bebfb81803.jpeg",
        },
        {
          name: "sink chowk",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/f7d69ec6-9d20-4ae1-86bd-2d6f4a35d216.jpeg",
        },
        {
          name: "nani trap Jam",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/67c18e9c-e5aa-4a5c-9f44-8c72409ce293.png",
        },
        {
          name: "Head shower not working",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/487fe49f-b3f7-4a2c-b262-57059f0ad757.png",
        },
        {
          name: "Towel rack came out",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/4ef851af-1bfe-4b34-94dc-10bac637aeb7.jpeg",
        },
        {
          name: "Health faucet stand came out",
          businessId,
          categoryId: categoryMap["PLUMBING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/543ea042-bb56-4a56-bfa8-e9877a12d454.png",
        },
        {
          name: "Wifi not working",
          businessId,
          categoryId: categoryMap["WIFI"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/df0e1a24-d146-4387-a2c4-8f9f6f8b786b.png",
        },
        {
          name: "PRI Line issues - inform vendor",
          businessId,
          categoryId: categoryMap["WIFI"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/e8318d15-05fc-4f12-b629-86b4beeed690.png",
        },
        {
          name: "Door not closing",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/2d5308ae-2dc1-4d3b-9690-7e1b08035feb.jpeg",
        },
        {
          name: "Door lock issue",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/81f48fde-1ca4-4ba2-83c8-a247a936f507.jpeg",
        },
        {
          name: "lock software issue- vendor scope",
          businessId,
          categoryId: categoryMap["CARPENTER"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/4f783149-a697-4197-bcc9-5ce577337bae.png",
        },
        {
          name: "paint touch up",
          businessId,
          categoryId: categoryMap["PAINT"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/2fd2ca97-4067-418e-a875-2c879407b760.jpeg",
        },
        {
          name: "Lift not working",
          businessId,
          categoryId: categoryMap["LIFT"],
          avgCompletionTime: 15,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 7,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/a26da697-236d-42d9-b50e-2e480eae1de1.jpeg",
        },
        {
          name: "Dental Kit",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/48191062-48f7-4b87-b26f-b6b8be89ce4c.png",
        },
        {
          name: "Comb",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/a6d31e7e-9876-43b3-bbb2-18ef5a600cbe.png",
        },
        {
          name: "Soap",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/9de82142-c5f7-40db-8127-1676880ef777.png",
        },
        {
          name: "Shaving Kit",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/92f01255-44b2-4d6f-869d-82196ebdc716.png",
        },
        {
          name: "Shower Cap",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/fae2029c-5a93-49a5-aff4-df710730ba52.png",
        },
        {
          name: "TCM(Tea, Coffee Maker)",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/61f43711-42b4-458c-82b5-1e454fe9963e.png",
        },
        {
          name: "Body Lotion",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/a2f4ac5c-8eeb-46a0-afc2-84d5f0facc05.png",
        },
        {
          name: "Toilet Roll",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/615b8d9a-22d8-41f2-8c78-2dbe11d9b436.jpeg",
        },
        {
          name: "Water Bottles",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/008c5343-6637-4896-bfda-2e254a882f55.jpeg",
        },
        {
          name: "Match Box",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/9158bdfd-2dfb-47f6-ad3c-e0662fb6d6e0.png",
        },
        {
          name: "Shower Gel",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/8debdb90-bb3b-4562-b32f-d097d9c463fd.png",
        },
        {
          name: "Pencil",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/685e3dd9-4062-41d7-9f5c-d165469a6d9f.png",
        },
        {
          name: "Note Pad",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/feff4fad-aa62-4ad1-ba2e-b51f1b287011.png",
        },
        {
          name: "Laundry Bag",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/96d5c324-24b7-4cf1-be02-267c3e8f2654.png",
        },
        {
          name: "Slippers",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/a96221ec-e7c9-46b8-bd36-8676276bdf61.png",
        },
        {
          name: "Nail Cutter",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/1108495b-21c3-4b4d-b2ae-26caba4738e2.png",
        },
        {
          name: "Bucket & Mug",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/90aae845-95f5-444c-a569-c96e340347e8.png",
        },
        {
          name: "Iron Box & Board",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/35ded989-27f1-4f48-837d-ada4685737f9.png",
        },
        {
          name: "Hair Oil",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/aa5561f3-192a-4ebe-85fb-96eb267aa9ad.png",
        },
        {
          name: "All Out",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/cbd01c50-82f2-4ba7-98bd-169fa336bc5a.jpeg",
        },
        {
          name: "Tissues",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/757f0068-94a6-4596-b264-586f09fd7099.png",
        },
        {
          name: "Extra Bed",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 30,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 28,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/658ee3c3-21a3-4426-ab38-d0cc24751829.png",
        },
        {
          name: "Extra Pillow",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/9b219764-c335-481f-a935-b8db79af6327.png",
        },
        {
          name: "Extra Bedsheet Or Duvet",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/3d819319-9cae-4b83-a6cc-03c612b7b6f4.png",
        },
        {
          name: "Room Cleaning",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/e01ac2b0-64b4-4d8b-a0d6-03a4cad9e64f.png",
        },
        {
          name: "Laundry Delivery",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 10,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 9,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/29ad8b1a-a8fe-437a-806e-d69f67a95513.png",
        },
        {
          name: "Sanitary Pads",
          businessId,
          categoryId: categoryMap["HOUSE_KEEPING"],
          avgCompletionTime: 5,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 4,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/ec7c639b-485b-4429-9cbb-012034e84a37.png",
        },
        {
          name: "Food Delivery",
          businessId,
          categoryId: categoryMap["FOOD"],
          avgCompletionTime: 35,
          avgAcceptanceTime: 2,
          avgDeliveryTime: 30,
          image:
            "https://t-static.blr1.digitaloceanspaces.com/e4501ab4-7d9c-440d-b55a-1414b044ba92.jpeg",
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
                } catch (error) {}
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
    "/bulk/upload_customers",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(10, "Invalid business ID"),
        users: z.array(
          z.object({
            name: z.string().min(1).max(50),
            phone: z.string().min(10).max(10),
            dob: z.number().optional(),
          }),
        ),
      }),
    ),

    async (c) => {
      //@ts-ignore

      const requestData = await c.req.json();
      const { users, businessId } = requestData;

      const business = await Business.findById(businessId);
      if (!business) {
        return respond(c, "Invalid businessId — business not found", true, 404);
      }

      for (const user of users) {
        const { phone, name, dob } = user;
        let existingUser = await User.findOne({ phone });
        if (!existingUser) {
          existingUser = new User({
            phone,
            dob,
            name,
            businessId,
          });
          await existingUser.save();
        }
        const existingAnalytic = await UserAnalytic.findOne({
          userId: existingUser._id,
          businessId,
        });

        if (!existingAnalytic) {
          const userAnalytics = new UserAnalytic({
            businessId,
            userId: existingUser._id,
            visitCount: 0,
            totalSpend: 0,
            avgSpend: 0,
            dateOfJoining: Date.now(),
          });
          await userAnalytics.save();
        }
      }

      return respond(c, "Customers uploaded successfully", false, 200, {});
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
  )

  .post(
    "/request_bill",
    zValidator(
      "json",
      z.object({
        isDefined: z.boolean().default(false),
      }),
    ),

    async (c) => {
      const payload = {
        app_key: "6jh08fc457wp2qkv1dntbrma3yeouxig",
        app_secret: "26669606e665e4a014ca1d426ff2d643551ed21a",
        access_token: "9aeec28f3aab55dd23033194beb39972d7ff6890",
        restID: "vb0rgpfn59",
        pin: "5989193999",
        tableNo: "A6",
      };

      const response = await axios.post(
        "http://api.petpooja.com/V1/captainorders/request_bill",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return respond(c, "Check bill success", false, 200, {});
    },
  )

  .post(
    "/settle_unsetled_bills",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      const unsettleTables = await UnsettleTable.find({
        sync: false,
      });

      for (const table of unsettleTables) {
        const payload = {
          app_key: petpoojaPosConfig.accessKey,
          app_secret: petpoojaPosConfig.secretKey,
          access_token: petpoojaPosConfig.authToken,
          restID: table.restId,
          request_id: table.requestId,
        };

        const response = await axios.post(
          "http://api.petpooja.com/V1/captainorders/check_bill",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (
          response.data.success === "1" &&
          response.data.bill_request_id !== 0
        ) {
          const settlePayload = {
            app_key: petpoojaPosConfig.accessKey,
            app_secret: petpoojaPosConfig.secretKey,
            access_token: petpoojaPosConfig.authToken,
            restID: table.restId,
            bill_request_id: response.data.bill_request_id,
            amount_paid: table.total,
            pin: table.pin,
          };

          const settleRes = await axios.post(
            "http://api.petpooja.com/V1/captainorders/success_payment",
            settlePayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (settleRes.data.success === "1") {
            await UnsettleTable.findByIdAndUpdate(
              table._id,
              {
                $set: {
                  sync: true,
                },
              },
              { new: true },
            );
          }
        }
      }

      return respond(c, "settle unseltled bills success", false, 200, {});
    },
  )

  .post(
    "/all_pos_dishes_off",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      const allPos = await BusinessPosConfig.find({});

      for (const pos of allPos) {
        await Dish.updateMany(
          {
            businessId: pos.businessId,
          },
          {
            $set: {
              isDeleted: true,
            },
          },
        );

        await AddOn.updateMany(
          {
            businessId: pos.businessId,
          },
          {
            $set: {
              isDeleted: true,
            },
          },
        );

        await Category.updateMany(
          {
            businessId: pos.businessId,
          },
          {
            $set: {
              isDeleted: true,
            },
          },
        );
      }

      return respond(
        c,
        "All pos dishes, addons and categories deleted",
        false,
        200,
        {},
      );
    },
  )

  .post(
    "/queue",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      const payload = await c.req.json();
      const header = c.req.header();

      return respond(
        c,
        "All pos dishes, addons and categories deleted",
        false,
        200,
        {},
      );
    },
  )

  .post(
    "/send_queue",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      // await enqueueBillJob("requestOnly", { payload: { orderId: "123" } });

      return respond(c, "queue sent", false, 200, {});
    },
  )

  .post(
    "/add_staff_levels",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(3).max(36).optional(),
      }),
    ),

    async (c) => {
      const allHotelBusiness = await Business.find({
        businessType: "HOTEL",
      });

      for (const business of allHotelBusiness) {
        const defaultHotelStaffLevels = [
          {
            businessId: business._id,
            level: 1,
            staffIds: [],
            nextLevelTime: 5,
          },
          {
            businessId: business._id,
            level: 2,
            staffIds: [],
            nextLevelTime: 5,
          },
          {
            businessId: business._id,
            level: 3,
            staffIds: [],
            nextLevelTime: 5,
          },
        ];
        await HotelStaffLevel.insertMany(defaultHotelStaffLevels);
      }

      return respond(c, "All hotel staff levels added", false, 200, {});
    },
  )

  .post(
    "/chnage_table_name",
    zValidator(
      "json",
      z.object({
        tableId: z.string().min(24).max(24),
        name: z.string().min(1).max(100),
      }),
    ),

    async (c) => {
      const { tableId, name } = await c.req.json();

      const table = await Table.findById(tableId);

      if (!table) {
        return respond(c, "Table not found", true, 404, {});
      }

      const isHasShortUrl = table.tableLink;

      if (!isHasShortUrl) {
        return respond(c, "Short url not found", true, 404, {});
      }

      if (table.status === "ACTIVE") {
        return respond(c, "Table is active", true, 404, {});
      }

      const shortUrlDoc = await UrlModel.findOne({
        shortUrl: table.tableLink,
      });

      if (!shortUrlDoc) {
        return respond(c, "Short url not found", true, 404, {});
      }

      const posConfig = await BusinessPosConfig.findOne({
        businessId: table.businessId,
      });

      if (!posConfig) {
        return respond(c, "Pos not found", true, 404, {});
      }

      if (posConfig.posName !== "HIPAL_Z") {
        return respond(c, "Pos is not hipal_z", true, 404, {});
      }

      const businessInfo = await Business.findById(table.businessId);

      const updateLongUrl = `https://hipal-test.hipalz.com/${businessInfo?.customLink}/explore?tableName=${name}`;

      await UrlModel.updateOne(
        {
          shortUrl: table.tableLink,
        },
        {
          $set: {
            longUrl: updateLongUrl,
          },
        },
        { new: true },
      );

      await Table.updateOne(
        {
          _id: tableId,
        },
        {
          $set: {
            name,
          },
        },
        { new: true },
      );

      return respond(c, "Table name updated successfully", false, 200, {});
    },
  )

  .post(
    "/update_category",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(24).max(24),
        filter: z.array(
          z.object({
            categoryId: z.string().min(24).max(24),
            updatedCatId: z.string().min(24).max(24),
          }),
        ),
      }),
    ),
    async (c) => {
      const { businessId, filter } = await c.req.json();

      // 🔥 build lookup map
      const categoryMap = Object.fromEntries(
        filter.map((f) => [f.categoryId, f.updatedCatId]),
      );

      const payments = await Payment.find({
        businessId,
        isDeleted: false,
      });

      let updatedBills = 0;
      let updatedItems = 0;

      for (const payment of payments) {
        let billUpdated = false;

        payment.billItems?.forEach((item) => {
          const catIds = item?.dish?.categoryIds;
          if (!Array.isArray(catIds)) return;

          item.dish.categoryIds = catIds.map((catId) => {
            if (categoryMap[catId]) {
              updatedItems++;
              billUpdated = true;
              return categoryMap[catId];
            }
            return catId;
          });
        });

        if (billUpdated) {
          await Payment.updateOne(
            { _id: payment._id },
            { $set: { billItems: payment.billItems } },
          );
          updatedBills++;
        }
      }

      return c.json({
        success: true,
        message: "Category IDs updated successfully",
        stats: {
          totalBillsScanned: payments.length,
          billsUpdated: updatedBills,
          categoryReplacements: updatedItems,
        },
      });
    },
  )
  .get("/get_all_users_data", async (c) => {
    try {
      const pageNumber = Number(c.req.query("pageNumber")) || 1;
      const limit = Number(c.req.query("limit")) || 50;
      const businessId = c.req.query("businessId");

      if (!businessId) {
        return c.json({ message: "businessId is required", err: true }, 400);
      }

      const skip = (pageNumber - 1) * limit;

      const loyaltyUsers = await UserReward.find({
        loyaltyId: businessId,
      })
        .skip(skip)
        .limit(limit);

      return c.json(
        {
          message: "Users data fetched successfully",
          err: false,
          page: pageNumber,
          limit: limit,
          data: loyaltyUsers,
        },
        200,
      );
    } catch (e) {
      console.log("e");
    }
  })
  .get("/get_user_rewards", async (c) => {
    try {
      const userId = c.req.query("userId");
      const businessId = c.req.query("businessId");

      // 1. Basic Validation: Check if query parameters are present
      if (!userId || !businessId) {
        return c.json(
          { message: "Both userId and businessId are required", err: true },
          400,
        );
      }

      // 2. Verify Existence: Check if this user is actually associated with this business
      const subscriber = await Subscriber.findOne({
        userId,
        businessId,
      }).lean();

      if (!subscriber) {
        return c.json(
          {
            message:
              "User or Business ID not found, or user is not subscribed to this business",
            err: true,
          },
          404,
        );
      }

      // 3. Fetch Reward: Using loyaltyId as the field name based on your schema
      const rewardEntry = await UserReward.findOne({
        userId: userId,
        loyaltyId: businessId,
      }).lean();

      // 4. Return Data: Default to 0 if the subscriber exists but no reward record is created yet
      return c.json(
        {
          message: "User reward data fetched successfully",
          err: false,
          data: {
            userId: userId,
            businessId: businessId,
            rewards: rewardEntry ? rewardEntry.rewards : 0,
          },
        },
        200,
      );
    } catch (e) {
      console.log(e);
    }
  });
export default scriptRouter;
