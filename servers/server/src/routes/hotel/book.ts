import { HotelRoomBooking } from "@hi/db-models";
import { hotelRoomBooking } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const roomBookRouter = new Hono()
  .get(
    "/fetch_booked_rooms",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();

      const bookings = await HotelRoomBooking.find({
        businessId,
      }).lean();

      return respond(c, "All bookings", false, 200, bookings);
    },
  )

  .post("/book_room", zValidator("json", hotelRoomBooking), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const {
        businessId,
        checkIn,
        checkOut,
        roomIds,
        userId,
        adults,
        children,
        status,
      } = await c.req.json();

      const overlappingBookings = await HotelRoomBooking.exists({
        roomIds: { $in: roomIds },
        $or: [
          {
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
          },
        ],
      });

      if (overlappingBookings) {
        return respond(
          c,
          "rooms are already booked for the selected dates",
          true,
          409,
          {},
        );
      }

      const booking = new HotelRoomBooking({
        businessId,
        checkIn,
        checkOut,
        roomIds,
        userId,
        adults,
        children,
        date: Date.now(),
        status,
      });

      await booking.save({ session });

      if (!booking) {
        throw new Error("Room booking failed");
      }

      return respond(c, "Room booked successfully", false, 200, {
        _id: booking._id,
      });
    });
  });

export default roomBookRouter;
