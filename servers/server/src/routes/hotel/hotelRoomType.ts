import { HotelRoom, HotelRoomType } from "@hi/db-models";
import {
  type HotelType,
  hotelType,
  updateHotelType,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { pushToken } from "../../services/token";
import { respond } from "../../utils/response";

const hotelRoomTypeRouter = new Hono()
  .get(
    "/fetch_room_type",

    zValidator(
      "query",
      z.object({
        roomTypeId: z.string().optional(),
      }),
    ),

    async (c) => {
      const { roomTypeId } = c.req.query();

      const roomType = await HotelRoomType.findById(roomTypeId).lean();

      if (!roomType) {
        return respond(c, "Room type not found", true, 404);
      }

      return respond(c, "Room type fetched successfully", false, 200, roomType);
    },
  )

  .get(
    "/fetch_room_types",
    zValidator(
      "query",
      z.object({
        businessId: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();

      pushToken(c);

      const roomTypes = await HotelRoomType.find({
        businessId,
        availability: true,
      }).lean();

      return respond(
        c,
        "Room types fetched successfully",
        false,
        200,
        roomTypes,
      );
    },
  )

  .post("/add_room_type", zValidator("json", hotelType), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = (await c.req.json()) as HotelType;
      const { roomType, businessId } = requestData;

      const roomTypeExists = await HotelRoomType.exists({
        roomType,
        businessId,
      });

      if (roomTypeExists) {
        return respond(c, "Room type already exists", true, 409);
      }
      const newRoomType = await HotelRoomType.create(
        [
          {
            ...requestData,
          },
        ],
        { session },
      );
      return respond(c, "Room type created successfully", false, 201, {
        _id: newRoomType[0]._id,
      });
    });
  })

  .put("/update_room_type", zValidator("json", updateHotelType), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { roomTypeId } = requestData;

      const roomType = await HotelRoomType.findById(roomTypeId);

      if (!roomType) {
        return respond(c, "Room type not found", true, 404);
      }

      const updatedRoomType = await HotelRoomType.findByIdAndUpdate(
        roomTypeId,
        {
          ...requestData,
        },
        { new: true, session },
      );

      if (!updatedRoomType) {
        throw new Error("Room type not found");
      }

      // Check if any room in this zone is booked
      const bookedRoomExists = await HotelRoom.exists({
        _id: { $in: requestData.roomIds },
        availability: true,
        roomStatus: { $ne: "AVAILABLE" },
      });

      if (bookedRoomExists) {
        return respond(
          c,
          "Cannot update roomType, some rooms are booked",
          true,
          400,
          {},
        );
      }

      const roomIds = requestData.roomIds || [];

      if (roomIds.length > 0) {
        const updateRoom = await HotelRoom.updateMany(
          { _id: { $in: roomIds } },
          { $set: { roomTypeId } },
          { session },
        );

        if (!updateRoom) {
          throw new Error("Failed to update room type");
        }
      }

      return respond(c, "Room type updated successfully", false, 200);
    });
  });

export default hotelRoomTypeRouter;
