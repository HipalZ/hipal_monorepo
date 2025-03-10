import { Business, HotelRoom, HotelZone, UrlModel } from "@hi/db-models";
import {
  bulkHotelRoom,
  hotelRoom,
  updateHotelRoom,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { respond } from "../../utils/response";

const roomRouter = new Hono()

  .get(
    "/fetch_room",
    zValidator(
      "query",
      z.object({
        roomId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { roomId } = c.req.query();

      const room = await HotelRoom.findById(roomId).lean();

      return room
        ? respond(c, "Room details", false, 200, room)
        : respond(c, "Room not found", true, 404, {});
    },
  )

  .get(
    "/fetch_rooms",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const rooms = await HotelRoom.find({
        businessId,
        availability: true,
      }).lean();

      return respond(c, "All rooms", false, 200, rooms);
    },
  )

  .post("/", zValidator("json", hotelRoom), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      // Check if room already exists
      const roomExists = await HotelRoom.exists({
        businessId: requestData.businessId,
        name: requestData.name,
      });

      if (roomExists) {
        return respond(c, "Room already exists", true, 409, {});
      }

      const business = await Business.findById(requestData.businessId)
        .select("customLink")
        .lean();

      if (!business) {
        return respond(c, "Business not found", true, 404, {});
      }

      const [room] = await HotelRoom.create([requestData], { session });

      if (!room) {
        throw new Error("Error creating room");
      }

      const longUrl = `http://localhost:3000/${business.customLink}/explore?roomName=${requestData.name}`;

      const urlAlreadyExists = await UrlModel.exists({
        longUrl,
        businessId: requestData.businessId,
      });

      if (!urlAlreadyExists) {
        const uniqueOrderId = nanoid(5);

        const shortUrl = await UrlModel.create({
          longUrl,
          businessId: requestData.businessId,
          shortUrl: `http://localhost:4500/surl/${uniqueOrderId}`,
          urlCode: uniqueOrderId,
        });

        if (!shortUrl) {
          throw new Error("Error creating short url");
        }

        room.downLoadLink = shortUrl.shortUrl;
        await room.save({ session });
      }

      // Add room to its assigned zone
      const updatedZone = await HotelZone.findByIdAndUpdate(
        requestData.zoneId,
        { $addToSet: { roomIds: room._id } },
        { session, new: true },
      );

      if (!updatedZone) {
        throw new Error("Error updating zone");
      }

      return respond(c, "Room created", false, 201, { _id: room._id });
    });
  })

  .put("/", zValidator("json", updateHotelRoom), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { roomId, zoneId } = requestData;

      const nameAlreadyExists = await HotelRoom.exists({
        businessId: requestData.businessId,
        name: requestData.name,
        _id: { $ne: roomId },
      });

      if (nameAlreadyExists) {
        return respond(c, "Room name already exists", true, 409, {});
      }

      // Check if the room is booked before updating
      const room = await HotelRoom.findOne({ _id: roomId });

      if (!room) {
        return respond(c, "Room not found", true, 404, {});
      }

      if (room.availability && room.roomStatus !== "AVAILABLE") {
        return respond(c, "Room is already booked", true, 400, {});
      }

      const updatedRoom = await HotelRoom.findByIdAndUpdate(
        roomId,
        requestData,
        { new: true, session },
      );

      if (!updatedRoom) {
        throw new Error("Error updating room");
      }

      // If zoneId is provided, update the zone
      if (zoneId) {
        const updatedZone = await HotelZone.findByIdAndUpdate(
          zoneId,
          { $addToSet: { roomIds: updatedRoom._id } },
          { new: true, session },
        );

        if (!updatedZone) {
          throw new Error("Error updating zone");
        }
      }

      return respond(c, "Room updated", false, 200, { _id: updatedRoom._id });
    });
  })
  .post("/bulk", zValidator("json", bulkHotelRoom), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      // Regex to extract name pattern
      const rangePattern = /^(.*?)(\d+)-(\d+)$/;
      const match = requestData.name.match(rangePattern);

      if (!match) {
        return respond(c, "Invalid room name", true, 400, {});
      }

      const [, prefix, start, end] = match;

      const roomNames = [];

      for (let i = Number(start); i <= Number(end); i++) {
        roomNames.push(`${prefix}${i}`);
      }

      const existingRooms = await HotelRoom.find({
        businessId: requestData.businessId,
        availability: true,
        name: { $in: roomNames },
      })
        .select("name")
        .lean();

      const existingRoomNames = new Set(existingRooms.map((room) => room.name));

      const newRooms = roomNames
        .filter((name) => !existingRoomNames.has(name))
        .map((name) => ({
          ...requestData,
          name,
        }));

      if (newRooms.length === 0) {
        return respond(c, "All rooms already exist", true, 409, {});
      }

      const createdRooms = await HotelRoom.insertMany(newRooms, { session });

      if (!createdRooms || createdRooms.length === 0) {
        throw new Error("Error creating new rooms");
      }

      for (const room of createdRooms) {
        const business = await Business.findById(requestData.businessId)
          .select("customLink")
          .lean();

        if (!business) {
          return respond(c, "Business not found", true, 404, {});
        }
        const longUrl = `http://localhost:3000/${business.customLink}/explore?roomName=${room.name}`;

        const urlAlreadyExists = await UrlModel.exists({
          longUrl,
          businessId: requestData.businessId,
        });

        if (!urlAlreadyExists) {
          const uniqueOrderId = nanoid(5);

          const shortUrl = await UrlModel.create({
            longUrl,
            businessId: requestData.businessId,
            shortUrl: `http://localhost:4500/surl/${uniqueOrderId}`,
            urlCode: uniqueOrderId,
          });

          if (!shortUrl) {
            throw new Error("Error creating short url");
          }

          room.downLoadLink = shortUrl.shortUrl;
          await room.save({ session });
        }
      }

      // Add only newly created rooms to their assigned zone
      const updateZone = await HotelZone.findByIdAndUpdate(
        requestData.zoneId,
        { $addToSet: { roomIds: { $each: createdRooms.map((r) => r._id) } } },
        { session, new: true },
      );

      if (!updateZone) {
        throw new Error("Error updating zone");
      }

      return respond(c, "Rooms created", false, 201, {
        success: true,
      });
    });
  });

export default roomRouter;
