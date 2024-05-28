import express, { Request, Response } from "express";

const router = express.Router();
import { User } from "../models/user";
import { orderHistory } from "../models/orderHistory";
import axios from "axios";
import { Staffshift } from "../models/staffShift";
import moment from "moment";
import { Staffsetting } from "../models/staffSetting";

router.put("/v1/users", (req: Request, res: Response) => {
  const { action } = req.query;

  if (action === "logout") {
    req.session = null;
    res.send({});
  }
});

router.put(
  "/v1/users/:userId/updateUser",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params || {};
      const data = req.body || {};
      const userObject = await User.findById(userId);
      // return res.send(userObject);

      if (!userObject)
        return res
          .status(400)
          .send({ status: false, message: "User Not Found Given Id !!! " });

      const updateUserObject = await User.findByIdAndUpdate(userId, data, {
        new: true,
      });
      return res.status(200).send({ status: true, data: updateUserObject });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/users/:id/updateOrderHistory",

  async (req: Request, res: Response) => {
    try {
      const { id } = req.params || {};

      const kot = {
        status: "PAID",
        cookedAt: 1,
      };
      const updateOrderHistory = await orderHistory.findByIdAndUpdate(id, kot, {
        new: true,
      });
      if (!updateOrderHistory) {
        return res
          .status(404)
          .send({ status: false, message: "Order not found...!" });
      }

      res.status(201).send(updateOrderHistory);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.delete(
  "/v1/users/deleteOrderHistory",

  async (req: Request, res: Response) => {
    try {
      const { userId, businessId, tableId } = req.body || {};

      const orderObjects = await orderHistory.find({
        userId,
        businessId,
        tableId,
      });
      let paid = true; // assume all orders are paid initially
      for (let i = 0; i < orderObjects.length; i++) {
        let obj = orderObjects[i];
        if (obj.status !== "PAID") {
          // if any order is not paid
          paid = false; // set paid to false and break the loop
          break;
        }
      }
      if (paid) {
        const config = {
          method: "delete",
          url: `https://hipal-mini-backend.vercel.app/api/v1/deleteCart`,
          data: { userId, businessId, tableId },
        };

        try {
          await axios(config);
        } catch (err: any) {
          return res.status(400).send({
            status: false,
            message: "Please Enter Valid userId,businessId,tableId ",
          });
        }
      }

      res
        .status(201)
        .send({ status: true, message: "Cart Deleted SuccessFully...!" });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put("/v1/users/UpdateShift/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { dayIn, dayOut, status, rating } = req.body;

    const staffShift = await Staffshift.findById(id);

    if (!staffShift) {
      return res.status(404).send("Shift Not found..!");
    }

    var currentTime = Date.now();
    var momentTime = moment(currentTime);
    var indianTime = momentTime.clone().utcOffset("+05:30");

    var dayAndDate = indianTime.format("DD-MM-YYYY");
    let currentDay = indianTime.format("dddd");

    // Calculate total work hours if either dayIn or dayOut is provided
    if (dayIn || dayOut) {
      let staffSetting = await Staffsetting.findOne({
        staffId: staffShift?.staffId,
      });
      if (dayIn && dayOut && !staffSetting) {
        status = "";
      }

      const checkIn = dayIn || staffShift.dayIn;
      const checkOut = dayOut || staffShift.dayOut;
      const openTime = moment(staffSetting?.dayIn, "HH:mm");
      let currentTimed = moment(dayIn, "HH:mm");
      const isTimeInRange =
        currentTimed.isSame(openTime, "minute") ||
        (currentTimed.isAfter(openTime) &&
          currentTimed.isBefore(openTime.clone().add(15, "minutes")));
      if (staffSetting?.dayIn != "0") {
        if ((staffSetting?.holidays as string[])?.includes(currentDay)) {
          status = "Holiday";
        } else if (isTimeInRange) {
          status = "Present";
        } else if (!isTimeInRange) {
          status = "Late";
        }
      }

      // Format timestamps to HH:mm (24-hour format) if they are not already in that format
      const formattedTimestamp1 = moment(checkIn, "hh:mm A").format("HH:mm");
      const formattedTimestamp2 = moment(checkOut, "hh:mm A").format("HH:mm");

      // Calculate the time difference using moment.js
      const timeDifference = moment(formattedTimestamp2, "HH:mm").diff(
        moment(formattedTimestamp1, "HH:mm")
      );

      // Get the duration in hours and minutes
      const duration = moment.duration(timeDifference);
      const hours = duration.hours();
      const minutes = duration.minutes();

      staffShift.totalWorkHr = `${hours} H ${minutes} M`;
    }

    // Update other shift properties
    staffShift.dayIn = dayIn || staffShift.dayIn;
    staffShift.dayOut = dayOut || staffShift.dayOut;
    staffShift.status = status;
    staffShift.rating = rating || staffShift.rating;

    const updateShift = await staffShift.save();

    res.status(200).send(updateShift);
  } catch (err: any) {
    console.log("err", err);
  }
});

router.put(
  "/v1/users/UpdateStaffSetting/:id",
  async (req: Request, res: Response) => {
    try {
      const { id, deleteStaff } = req.params;
      const { password } = req.body;
      const update = { ...req.body };

      let UpdateStaffSetting = await Staffsetting.findByIdAndUpdate(
        id,
        update,
        { new: true }
      );
      if (password) {
        await User.findByIdAndUpdate(
          UpdateStaffSetting?.staffId,
          { password: password },
          { new: true }
        );
      }
      if (deleteStaff) {
        await User.findByIdAndDelete(UpdateStaffSetting?.staffId);
      }

      res.status(200).send(UpdateStaffSetting);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

export { router as updateUserRouter };
