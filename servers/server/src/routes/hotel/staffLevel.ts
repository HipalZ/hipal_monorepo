import { HotelStaffLevel } from "@hi/db-models";
import {
  hotelStaffLevel,
  updateHotelStaffLevel,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const hotelStaffLevelRouter = new Hono()
  .get(
    "/fetch_levels",

    zValidator(
      "query",
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const levels = await HotelStaffLevel.find({
        businessId,
      }).populate({
        path: "staffIds",
        select: "name phone",
      });
      return respond(
        c,
        "Staff levels retrieved successfully",
        false,
        200,
        levels,
      );
    },
  )

  .get(
    "/fetch_level",

    zValidator(
      "query",
      z.object({
        levelId: z.string().min(24).max(24),
      }),
    ),

    async (c) => {
      const { levelId } = c.req.query();
      const level = await HotelStaffLevel.findById(levelId).populate({
        path: "staffIds",
        select: "name phone",
      });

      if (!level) {
        return respond(c, "Staff level does not exist", true, 404);
      }

      return respond(
        c,
        "Staff level retrieved successfully",
        false,
        200,
        level,
      );
    },
  )

  .post("/add_level", zValidator("json", hotelStaffLevel), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { level, nextLevelTime, staffIds, businessId } = await c.req.json();

      const isLevelAlreadyExist = await HotelStaffLevel.exists({
        level,
        businessId,
      });

      if (isLevelAlreadyExist) {
        return respond(c, "Staff level already exists", true, 409);
      }

      const createStaffLevel = new HotelStaffLevel({
        level,
        nextLevelTime,
        staffIds,
        businessId,
      });

      await createStaffLevel.save({ session });

      return respond(c, "Staff level added successfully", false, 200, {
        _id: createStaffLevel._id,
      });
    });
  })
  .put(
    "/update_level",
    zValidator("json", updateHotelStaffLevel),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { level, nextLevelTime, staffIds, levelId, businessId } =
          await c.req.json();

        const isDuplicate = await HotelStaffLevel.exists({
          _id: { $ne: levelId }, // exclude the current document
          businessId: businessId, // same business
          level: level, // same level
        });

        if (isDuplicate) {
          return respond(c, "Staff level already exists", true, 409);
        }

        const updateLevel = await HotelStaffLevel.findByIdAndUpdate(
          levelId,
          {
            level,
            nextLevelTime,
            staffIds,
          },
          { new: true, session },
        );

        if (!updateLevel) {
          return respond(c, "Staff level does not exist", true, 404);
        }

        return respond(c, "Staff level updated successfully", false, 200, {
          _id: updateLevel._id,
        });
      });
    },
  )
  .post(
    "/remove_staff",
    zValidator(
      "json",
      z.object({
        staffId: z.string().min(24).max(24),
        levelId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { staffId, levelId } = await c.req.json();
        const level = await HotelStaffLevel.findById(levelId);

        if (!level) {
          return respond(c, "Staff level does not exist", true, 404);
        }

        await HotelStaffLevel.findByIdAndUpdate(
          levelId,
          { $pull: { staffIds: staffId } },
          { session },
        );

        return respond(c, "Staff removed from level successfully", false, 200);
      });
    },
  );

export default hotelStaffLevelRouter;
