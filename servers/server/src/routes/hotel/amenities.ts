import { HotelAmenities } from "@hi/db-models";
import { hotelAmenities } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { respond } from "../../utils/response";

const hotelAmenitiesRouter = new Hono()
  .get(
    "/fetch_hotel_amenities",

    async (c) => {
      const amenities = await HotelAmenities.find().lean();

      return respond(c, "All amenities", false, 200, amenities);
    },
  )

  .post("/add_amenities", zValidator("json", hotelAmenities), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { name, image } = await c.req.json();

      const amenities = await HotelAmenities.create({
        name,
        image,
      });

      return respond(c, "Amenities added successfully", false, 200, {
        _id: amenities._id,
      });
    });
  });

export default hotelAmenitiesRouter;
