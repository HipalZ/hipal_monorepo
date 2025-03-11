import { HotelAlert } from "@hi/db-models";
import { hotelAlert } from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const hotelAlertRouter = new Hono()
  .get(
    "/fetch_room_alerts",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const alerts = await HotelAlert.find({ businessId })
        .populate({
          path: "serviceIds",
          select: "name",
        })

        .populate({
          path: "createdBy",
          select: "name phone",
        })
        .populate({
          path: "acceptedBy",
          select: "name phone",
        })
        .populate({
          path: "deliveredBy",
          select: "name phone",
        })
        .populate({
          path: "roomId",
          select: "name",
        });

      return respond(c, "Alerts fetched successfully", false, 200, alerts);
    },
  )

  .post("/create_alert", zValidator("json", hotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      const alert = new HotelAlert({
        ...requestData,
        createdAt: Date.now(),
        createdBy: requestData.userId,
      });

      await alert.save({ session });

      if (!alert) {
        throw new Error("Failed to create alert");
      }

      return respond(c, "Alert created successfully", false, 201, {
        _id: alert._id,
      });
    });
  });

export default hotelAlertRouter;
