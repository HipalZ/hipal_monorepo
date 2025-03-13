import { Business } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const restaurantRouter = new Hono()
  .get(
    "/fetch_restaurants",

    async (c) => {
      const restaurants = await Business.find({
        businessType: "MENU",
      })
        .select("_id name logo logoUrl")
        .lean();

      return respond(c, "All restaurants", false, 200, restaurants);
    },
  )

  .get(
    "/fetch_hotel_restaurants",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const restaurants = await Business.find({
        businessType: "MENU",
        hotelIds: businessId,
      })
        .select("_id name customLink logo")
        .lean();

      return respond(c, "All restaurants ", false, 200, restaurants);
    },
  )

  .post(
    "/link_restaurants",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        restaurantIds: z.array(z.string()).min(1).max(50),
      }),
    ),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId, restaurantIds } = await c.req.json();
        const business = await Business.findOne({ _id: businessId });

        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }

        const updateHotel = await Business.findByIdAndUpdate(
          businessId,
          { $push: { restaurantIds: { $each: restaurantIds } } },
          { session },
        );

        if (!updateHotel) {
          throw new Error("Business not found");
        }

        const updateRestaurant = await Business.updateMany(
          { _id: { $in: restaurantIds } },
          { $push: { hotelIds: businessId } },
          { session },
        );

        if (!updateRestaurant) {
          throw new Error("Restaurants not found");
        }

        return respond(c, "Restaurants linked", false, 200, business);
      });
    },
  );

export default restaurantRouter;
