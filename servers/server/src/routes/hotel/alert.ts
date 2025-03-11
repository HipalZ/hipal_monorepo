import { HotelAlert } from "@hi/db-models";
import {
  type AcceptHotelAlertType,
  acceptHotelAlert,
  hotelAlert,
} from "@hi/db-models/src/validators";
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
      const alerts = await HotelAlert.find({
        businessId,
        alertProgress: { $in: ["CREATED", "ACCEPTED"] },
      })
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
          path: "roomId",
          select: "name",
        });

      return respond(c, "Alerts fetched successfully", false, 200, alerts);
    },
  )

  .get(
    "/fetch_alert_history",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.query();
      const alerts = await HotelAlert.find({
        businessId,
        alertProgress: { $in: ["DELIVERED"] },
      })
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
  })

  .post("/accept_alert", zValidator("json", acceptHotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { alertId, userId, action } = requestData as AcceptHotelAlertType;

      const alert = await HotelAlert.findById(alertId);

      if (!alert) {
        return respond(c, "Alert not found", true, 404, {});
      }

      const validTransitions: Record<string, string> = {
        ACCEPTED: "CREATED",
        DELIVERED: "ACCEPTED",
        REJECTED: "CREATED",
      };

      const updateFields: Record<string, object> = {
        ACCEPTED: {
          alertProgress: "ACCEPTED",
          acceptedAt: Date.now(),
          acceptedBy: userId,
        },
        DELIVERED: {
          alertProgress: "DELIVERED",
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
        REJECTED: {
          alertProgress: "REJECTED",
          rejectedAt: Date.now(),
          rejectedBy: userId,
        },
      };

      if (!validTransitions[action]) {
        return respond(c, "Invalid action", true, 400, {});
      }

      if (alert.alertProgress !== validTransitions[action]) {
        return respond(
          c,
          `Cannot mark alert as ${action} because it is in ${alert.alertProgress} state.`,
          true,
          400,
          {},
        );
      }

      const updatedAlert = await HotelAlert.findByIdAndUpdate(
        alertId,
        updateFields[action],
        { session, new: true },
      );

      if (!updatedAlert) {
        throw new Error("Failed to update alert");
      }

      return respond(c, `Alert ${action} successfully`, false, 200, {
        _id: updatedAlert._id,
      });
    });
  });

export default hotelAlertRouter;
