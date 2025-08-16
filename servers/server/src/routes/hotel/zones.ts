import { HotelRoom, HotelZone } from "@hi/db-models";
import { hotelZones, updateHotelZones } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const zoneRouter = new Hono()

  .get(
    "/fetch_zones",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const zones = await HotelZone.find({
        businessId,
        availability: true,
      }).lean();

      return respond(c, "All zones", false, 200, zones);
    },
  )

  .get(
    "/fetch_zone",
    zValidator(
      "query",
      z.object({
        zoneId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { zoneId } = c.req.query();

      const zone = await HotelZone.findOne({
        _id: zoneId,
        availability: true,
      }).lean();

      return zone
        ? respond(c, "Zone details", false, 200, zone)
        : respond(c, "Zone not found", true, 404, {});
    },
  )

  .post("/", zValidator("json", hotelZones), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      // Check if zone already exists
      const zoneExists = await HotelZone.exists({
        businessId: requestData.businessId,
        name: requestData.name,
      });

      if (zoneExists) {
        return respond(c, "Zone already exists", true, 409, {});
      }

      // Create and save new zone
      const newZone = new HotelZone(requestData);
      await newZone.save({ session });

      if (!newZone) {
        throw new Error("Failed to create zone");
      }

      return respond(c, "Hotel zone created successfully", false, 201, {
        _id: newZone._id,
      });
    });
  })

  .put("/", zValidator("json", updateHotelZones), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { zoneId, roomIds, staffIds } = requestData;

      const zoneNameAlreadyExists = await HotelZone.exists({
        _id: { $ne: zoneId },
        name: requestData.name,
        businessId: requestData.businessId,
      });

      if (zoneNameAlreadyExists) {
        return respond(c, "Zone name already exists", true, 400, {});
      }

      // Check if any room in this zone is booked
      const bookedRoomExists = await HotelRoom.exists({
        _id: { $in: roomIds },
        availability: true,
        roomStatus: { $ne: "AVAILABLE" },
      });

      if (bookedRoomExists) {
        return respond(
          c,
          "Cannot update zone, some rooms are booked",
          true,
          400,
          {},
        );
      }

      // Update the hotel zone
      const updatedZone = await HotelZone.findByIdAndUpdate(
        zoneId,
        requestData,
        {
          session,
          new: true,
        },
      );

      if (!updatedZone) {
        throw new Error("Error updating zone");
      }

      // Bulk update rooms to associate with the updated zone
      const updateRooms = await HotelRoom.updateMany(
        { _id: { $in: roomIds } },
        { $set: { zoneId } },
        { session },
      );

      if (!updateRooms) {
        throw new Error("Error updating rooms");
      }

      // if (staffIds && Array.isArray(staffIds)) {
      //   const updateStaffsInRooms = await HotelRoom.updateMany(
      //     { _id: { $in: roomIds } },
      //     {
      //       $set: {
      //         staffIds: staffIds, // Replace with exact new list
      //       },
      //     },
      //     { session },
      //   );

      //   if (!updateStaffsInRooms) {
      //     throw new Error("Error updating staff assignments in rooms");
      //   }
      // }

      return respond(c, "Hotel zone updated successfully", false, 200, {
        _id: updatedZone._id,
      });
    });
  });

export default zoneRouter;
