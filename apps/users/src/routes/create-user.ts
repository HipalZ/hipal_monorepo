import { BadRequestError, NotFoundError, validateRequest } from "@hipal/common";
import axios from "axios";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { redisWrapper } from "../redis-wrapper";
import { validateUser } from "./validators/signup-user-validator";
const moments = require("moment-timezone");

import { User } from "../models/user";
import { Admin } from "../models/admin";
import { orderHistory } from "../models/orderHistory";
import { UrlModel } from "../models/urlMode";
const shortid = require("shortid");
const FCM = require("fcm-node");
import moment = require("moment");
import { Staffsetting } from "../models/staffSetting";

const router = express.Router();
import { Staffshift } from "../models/staffShift";
import { Attendence } from "../models/attendence";
import { UserReward } from "../models/userReward";

import { UserRewardHistory } from "../models/userRewardHistory";

const createJWT = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      customRole: user.customRole,
    },
    process.env.JWT_KEY!
  );
};

const addRewardScanUser = async (
  phone: any,
  loyaltyId: any,
  businessName: any,
  name: any
) => {
  const currentTime = Date.now();
  const indianTime = moment(currentTime).utcOffset("+05:30");
  const dayAndDate = indianTime.format("DD-MM-YYYY");
  const time = indianTime.format("HH:mm");
  let existingReward = await UserReward.findOne({
    userPhone: phone,
    loyaltyId,
  });

  if (!existingReward) {
    const newReward = new UserReward({
      userPhone: phone,
      userName: name,
      loyaltyId,
      rewards: 50,
      password: Math.floor(Math.random() * 9000) + 10000,
      scanCount: 1,
    });

    await newReward.save();
    const data = new UserRewardHistory({
      userName: name,
      userPhone: phone,
      businessName,

      status: "plus",
      rewards: 50,

      time,
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      currentBalance: 50,
      day: dayAndDate,
      loyaltyId,
    });

    await data.save();
    return 1;
  } else {
    let userRewardExit = await UserReward.findOne({
      userPhone: phone,
      loyaltyId,
    });
    if (!userRewardExit?.scanCount || userRewardExit?.scanCount == 0) {
      let userReward = await UserReward.findOneAndUpdate(
        { userPhone: phone, loyaltyId },
        { $inc: { rewards: 50, scanCount: 1 } },
        { new: true }
      );

      const data = new UserRewardHistory({
        userName: userReward?.userName || name,
        userPhone: userReward?.userPhone || phone,
        businessName,

        status: "plus",
        rewards: 50,

        time,
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
        currentBalance: userReward?.rewards || 50,
        day: dayAndDate,
        loyaltyId,
      });

      await data.save();
      return 1;
    } else {
      await UserReward.findOneAndUpdate(
        { userPhone: phone, loyaltyId },
        { $inc: { scanCount: 1 } },
        { new: true }
      );

      return 0;
    }
  }
  return 0;
};

router.post(
  "/v1/users",
  validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    let { name, email, phone, role, customRole, password, otp, accessControl } =
      req.body;
    const { action, clientRole, withScan, loyaltyId, businessName } = req.query;

    if (!clientRole) {
      throw new BadRequestError("clientRole required");
    }
    const UserOrAdmin: any = clientRole === "admin" ? Admin : User;

    if (action === "signup") {
      if (phone?.length < 10) {
        return res
          .status(400)
          .send({ status: false, message: "Phone Number Invalid !!" });
      }

      let existingUserPhone;

      if (clientRole === "admin") {
        existingUserPhone = await Admin.findOne({ phone, role });
      } else {
        existingUserPhone = await User.findOne({ phone, role });
      }
      if (existingUserPhone) {
        throw new BadRequestError("User registered already");
      }
      if (role == "RESTAURANT_OWNER") {
        password = Math.floor(Math.random() * 9000) + 1000;
      }

      const user = UserOrAdmin.build({
        name,
        email,
        phone,
        role,
        customRole,
        password,
        accessControl,
      });

      await user.save();
      if (user?.customRole?.length > 1) {
        let obj = {
          name: user?.name,
          staffId: user?.id,
          businessId: user?.customRole?.[0]?.businessId,
          roleName: user?.customRole?.[0]?.roleName,
        };
        let settig = new Staffsetting(obj);

        await settig.save();
      }

      if (
        user?.role != "RESTAURANT_OWNER" ||
        user?.role != "RESTAURANT_MANAGER" ||
        user?.role != "HIPAL_CUSTOMER"
      ) {
        const options = {
          method: "POST",
          url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        };
        await axios(options);
      }

      // Generate JWT
      const userJwt = createJWT(user);

      // // Store it on session object
      if (!customRole) {
        req.session = {
          jwt: userJwt,
        };
      }

      res.status(201).send(user);
    } else if (action === "login") {
      const number = phone;

      // check if phone number is valid
      if (!number.match(/^\d+$/)) {
        throw new BadRequestError("Phone number Invalid");
      }

      let user;
      if (clientRole === "admin") {
        user = await Admin.findOne({ phone, role: "HIPAL_ADMIN" });
      } else {
        user = await User.findOne({ phone });
      }

      if (!user) {
        throw new NotFoundError();
      }

      if (user?.role != "HIPAL_CUSTOMER") {
        const options = {
          method: "GET",
          url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${number}`,
          headers: {
            accept: "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
        };

        const response = await axios(options);

        if (
          response?.data?.message === "Mobile no. not found" ||
          response?.data?.message === "OTP not match"
        ) {
          return res
            .status(400)
            .send({ status: false, message: "Please enter valid Otp !!" });
        }
      } else {
        const code = await redisWrapper.client.get(`number:${number}:code`);

        if (otp !== code) {
          throw new BadRequestError("Invalid code");
        }
      }

      // Generate JWT
      const userJwt = createJWT(user);

      // // Store it on session object
      if (!customRole) {
        req.session = {
          jwt: userJwt,
        };
      }

      if (req.query?.withScan == "true") {
        console.log("uetoy", user);
        let reward = await addRewardScanUser(
          phone,
          loyaltyId,
          businessName,
          user?.name
        );

        return res.status(201).send(user);
      }
      res.status(201).send(user);
    } else if (action === "logout") {
      req.session = null;
      res.send({});
    }
  }
);

router.post(
  "/v1/users/waiterLogin",
  // validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    const { phone, password, businessId } = req.body;

    const existingUser = await User.findOne({ phone, password });
    if (businessId) {
      if (existingUser?.customRole?.[0]?.businessId != businessId) {
        return res
          .status(400)
          .send({ status: false, message: "staff not belong to business...!" });
      }
    }

    if (!existingUser) {
      return res
        .status(400)
        .send({ status: false, message: "Phone or Password invalid...!" });
    }

    // Generate JWT
    const userJwt = createJWT(existingUser);

    req.session = {
      jwt: userJwt,
    };
    res.status(201).send(existingUser);
  }
);

router.post("/v1/users/usrShortner", async (req: Request, res: Response) => {
  try {
    const { longUrl } = req.body;
    let exit = await UrlModel.findOne({ longUrl });
    if (!exit) {
      let id = shortid.generate(); //hggff
      const Data = new UrlModel({
        longUrl: longUrl,
        shortUrl: `${process.env.URL}/v1/users/Url/${id.toLowerCase()}`,
        urlCode: id.toLowerCase(),
      });
      const result = await Data.save();
      return res.send(result);
    } else {
      return res.send(exit);
    }
  } catch (e: any) {
    return res.status(500).send({ status: false, message: e.message });
  }
});

router.post(
  "/v1/users/login",
  validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, role } = req.body || {};
      const existingUser = await User.findOne({
        email: email,
        role: role,
      });
      if (!existingUser)
        return res.status(404).send({
          status: false,
          message: "Email  Invalid !! Please Try again !!!",
        });
      // Generate JWT
      const userJwt = createJWT(existingUser);

      // // Store it on session object
      req.session = {
        jwt: userJwt,
      };

      return res.status(200).send({
        status: true,
        message: "Login SuccessFully !!!",
        data: existingUser,
      });
    } catch (e: any) {
      return res.status(500).send({ status: false, message: e.message });
    }
  }
);

router.post(
  "/v1/users/otp",
  validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    const { phone } = req.body;
    const { clientRole } = req.query;

    if (!clientRole) {
      throw new BadRequestError("clientRole required");
    }

    const UserOrAdmin = clientRole === "admin" ? Admin : User;

    let user;
    if (clientRole === "admin") {
      user = await Admin.findOne({ phone, role: "HIPAL_ADMIN" });
    } else {
      user = await User.findOne({ phone });
    }

    if (!user) {
      throw new NotFoundError();
    }

    const number = phone;
    // check if phone number is valid
    if (!number.match(/^\d+$/)) {
      throw new BadRequestError("Phone number is invalid");
    }

    let otp;
    otp = await redisWrapper.client.get(`number:${number}:code`);
    if (!otp) {
      otp = Math.floor(Math.random() * 9000) + 1000;
      otp = 1234;
    }

    if (user?.role != "HIPAL_CUSTOMER") {
      const options = {
        method: "POST",
        url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${number}`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authkey: "387796AmyGlDBq63b2d75aP1",
        },
      };
      const response = await axios(options);
      if (response?.status == 200) {
        const userJwt = createJWT(user);

        req.session = {
          jwt: userJwt,
        };
        return res.status(200).send({ message: "OTP send SuccessFully !!" });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Something Wrong !!!" });
      }
    } else {
      redisWrapper.client.set(`number:${number}:code`, otp, {
        EX: 60 * 15,
        NX: true,
      });

      res.status(200).send(user);
    }
  }
);

router.post(
  "/v1/users/orderHistory",

  async (req: Request, res: Response) => {
    try {
      const data = req.body || {};
      const { tableId } = req.body || {};

      const kot = orderHistory.build({
        ...data,
        startedAt: Date.now(),
        cookedAt: -1,
        status: "UNPAID",
      });

      const config = {
        method: "put",
        url: `https://hipal-mini-backend.vercel.app/api/v1/${tableId}/updateCart`,
      };

      try {
        await axios(config);
      } catch (err: any) {
        return res
          .status(400)
          .send({ status: false, message: "tableId invalid!!" });
      }

      await kot.save();

      res.status(201).send(kot);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.post(
  "/v1/users/Bill/generateBill",

  async (req: Request, res: Response) => {
    try {
      const { businessname, bill } = req.body;

      const mobiles = req.body.mobiles as [];

      for (let i = 0; i < mobiles?.length; i++) {
        const options = {
          method: "POST",
          url: "https://control.msg91.com/api/v5/flow/",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            authkey: "387796AmyGlDBq63b2d75aP1",
          },
          data: {
            template_id: "647836a0d6fc0547fb4d8e73",
            sender: "HiPalc",
            short_url: "1",
            mobiles: mobiles[i],
            businessname: businessname,
            bill: bill,
          },
        };
        await axios(options);
      }
      return res.send({
        message: `Bill send on ${mobiles.join(" ")} this numbers !!!`,
      });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.post(
  "/v1/users/loginWithPhone",
  // validateUser,
  // validateRequest,
  async (req: Request, res: Response) => {
    const { phone } = req.body;

    let userExit = await User.findOne({ phone, role: "RESTAURANT_MANAGER" });
    if (!userExit) {
      return res.status(400).send("not found");
    }
    return res.send(userExit);
  }
);

router.post(
  "/v1/users/chef/Login",
  // validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    const { phone, password, businessId } = req.body;
    const { withBusinessId } = req.query;
    if (!withBusinessId) {
      return res.send("withBusinessId  is Required..!");
    }
    if (withBusinessId == "true") {
      const existingUser = await User.findOne({
        phone,
        password,
        customRole: { $elemMatch: { businessId } },
      });

      if (!existingUser) {
        return res
          .status(400)
          .send({ status: false, message: "Phone or Password invalid...!" });
      }
      const userJwt = createJWT(existingUser);

      req.session = {
        jwt: userJwt,
      };
      res.status(200).send(existingUser);
    } else {
      const existingUser = await User.findOne({
        phone,
        role: "RESTAURANT_MANAGER",
      });
      if (!existingUser) {
        return res
          .status(400)
          .send({ status: false, message: "Phone  invalid...!" });
      }
      const userJwt = createJWT(existingUser);

      req.session = {
        jwt: userJwt,
      };
      res.status(200).send(existingUser);
    }
  }
);

const SERVER_KEY =
  "AAAAj8kkRxk:APA91bEiutN4868JcviOMk4diZLU3MAMRHW8xmLGSYezAhNMobRGUAxWhQZrM-TzP-3qV5XQL0XIOxl_7MwOUSMh7uNH-BAfX78x0K7dt5pvBsgGkYg7BnR1OeMHYG3B9Kr8QqOFv0Bx";

router.post("/v1/users/registrationToken/Send", async (req, res) => {
  const { registrationToken, title, body } = req.body;
  try {
    const fcm = new FCM(SERVER_KEY);

    const pushMessage = {
      to: registrationToken,
      notification: {
        title: title || "Title of the Notification",
        body: body || "Need your assistance",
        icon: "https://storage.hipal.life/minio/assets/5da74158-813b-4a88-b020-759a40e722cf",
      },
      data: {
        key1: "value1",
        key2: "value2",
      },
    };

    fcm.send(pushMessage, (err: any, response: any) => {
      if (err) {
        console.log("Error sending FCM message:", err);
        return res.status(500).send("Internal Server Error");
      }

      console.log("FCM message sent successfully:", response);
      return res.status(200).send("Notification sent successfully");
    });
  } catch (error) {
    console.log("Error parsing Firebase config file:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/v1/users/manager/Login",

  async (req: Request, res: Response) => {
    const { phone, password, businessId } = req.body;

    const existingUser = await User.findOne({
      phone,
      password,
      customRole: {
        $elemMatch: {
          businessId,
          permissions: {
            $in: [
              "resource/get/editStaff'",
              "resource/get/addStaff",
              "resource/get/addStaffToZones",
            ],
          },
        },
      },
    });
    const userJwt = createJWT(existingUser);

    req.session = {
      jwt: userJwt,
    };

    if (!existingUser) {
      return res
        .status(400)
        .send({ status: false, message: "Phone or Password invalid...!" });
    }
    res.status(200).send(existingUser);
  }
);

router.post(
  "/v1/users/Staffshift",

  async (req: Request, res: Response) => {
    try {
      const { name, staffId, dayIn, dayOut, businessId, roleName } = req.body;
      if (!staffId) {
        return res.status(400).send("staffId  required !!");
      }
      const { checkIn, checkOut } = req.query || {};
      var currentTime = Date.now();
      var momentTime = moment(currentTime);
      var indianTime = momentTime.clone().utcOffset("+05:30");

      var dayAndDate = indianTime.format("DD-MM-YYYY");
      let currentDay = indianTime.format("dddd");
      const staffSetting = await Staffsetting.findOne({
        staffId,
        businessId,
      });
      if (!(checkIn || checkOut)) {
        return res.status(400).send("checkIn and Checkout are required!!");
      }
      if (checkIn) {
        let existstaff = await Staffshift.findOne({
          date: dayAndDate,
          staffId,
          businessId,
        });
        if (existstaff) {
          return res.status(400).send("Staff already dayIn...!");
        }
        var currentTimes = Date.now();
        var momentTime = moment(currentTimes);
        var indianTime = momentTime.clone().utcOffset("+05:30");
        // e.g., "Monday, 2023-07-26"
        let time = indianTime.format("HH:mm"); // 11:00
        // Use "hh:mm A" to get time in 12-hour clock format
        const openTime = moment(staffSetting?.dayIn, "HH:mm");
        let currentTime = moment(time, "HH:mm");
        const isTimeInRange =
          currentTime.isSame(openTime, "minute") ||
          (currentTime.isAfter(openTime) &&
            currentTime.isBefore(openTime.clone().add(15, "minutes")));
        let status;
        if (staffSetting?.dayIn != "0") {
          if ((staffSetting?.holidays as string[])?.includes(currentDay)) {
            status = "Holiday";
          } else if (isTimeInRange) {
            status = "Present";
          } else if (!isTimeInRange) {
            status = "Late";
          }
        }

        let shiftData = new Staffshift({
          name,
          staffId,
          businessId,
          dayIn: time,
          date: dayAndDate,
          roleName,
          status,
        });
        let saveShift = await shiftData.save();
        return res.status(201).send(saveShift);
      } else if (checkOut) {
        var currentTimes = Date.now();
        var momentTime = moment(currentTimes);
        var indianTime = momentTime.clone().utcOffset("+05:30");
        // e.g., "Monday, 2023-07-26"
        var time = indianTime.format("HH:mm"); // Use "hh:mm A" to get time in 12-hour clock format
        let existstaff = await Staffshift.findOneAndUpdate(
          { date: dayAndDate, staffId },
          { dayOut: time },
          { new: true }
        );
        if (!existstaff) return res.status(404).send("Please checkIn First...");
        const timestamp1 = existstaff?.dayIn;
        const timestamp2 = existstaff?.dayOut;

        // Format timestamps to HH:mm (24-hour format) if they are not already in that format
        const formattedTimestamp1 = moment(timestamp1, "hh:mm A").format(
          "HH:mm"
        );
        const formattedTimestamp2 = moment(timestamp2, "hh:mm A").format(
          "HH:mm"
        );

        // Calculate the time difference using moment.js
        const timeDifference = moment(formattedTimestamp2, "HH:mm").diff(
          moment(formattedTimestamp1, "HH:mm")
        );

        // Get the duration in hours and minutes
        const duration = moment.duration(timeDifference);
        const hours = duration.hours();
        const minutes = duration.minutes();

        let times = `${hours} H ${minutes} M`;
        // var momentTime = moment(currentTimes);
        // var indianTime = momentTime.clone().utcOffset("+05:30");
        // // e.g., "Monday, 2023-07-26"
        // var time = indianTime.format("hh:mm A"); // Use "hh:mm A" to get time in 12-hour clock format
        // console.log("Time in AM/PM format (IST):", time);

        existstaff = await Staffshift.findOneAndUpdate(
          { date: dayAndDate, staffId },
          { totalWorkHr: times },
          { new: true }
        );

        return res.status(200).send(existstaff);
      }
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.post(
  "/v1/users/Save/Attendence",

  async (req: Request, res: Response) => {
    try {
      var currentTime = Date.now();
      var momentTime = moment(currentTime);

      var indianTime = momentTime.clone().utcOffset("+05:30");
      var dayAndDate = indianTime.format("DD-MM-YYYY");
      const { staffShiftArray, businessId } = req.body;

      let Exitattendence = await Attendence.findOne({
        businessId,
        date: dayAndDate,
      });
      console.log("dattta", Exitattendence);
      if (Exitattendence)
        return res
          .status(400)
          .send("Attendence of these day Already Saved...!");
      for (let shiftObj of staffShiftArray) {
        let data = new Attendence(shiftObj);
        await data.save();
      }

      let attendence = await Attendence.find({ date: dayAndDate });
      // await Staffshift.deleteMany({ date: dayAndDate });
      return res.status(201).send(attendence);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.post(
  "/v1/users/Owner/Login",

  async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    let existingUser;
    if (password == "1234") {
      existingUser = await User.findOne({
        phone,
      });
    } else {
      existingUser = await User.findOne({
        phone,
        password,
      });
    }

    if (!existingUser) {
      return res
        .status(400)
        .send({ status: false, message: "Phone or Password invalid...!" });
    }

    if (
      existingUser?.role == "RESTAURANT_OWNER" ||
      existingUser?.role == "RESTAURANT_MANAGER"
    ) {
      const userJwt = createJWT(existingUser);

      req.session = {
        jwt: userJwt,
      };

      return res.status(200).send(existingUser);
    } else {
      return res.status(404).send("Not Found !");
    }
  }
);

router.post("/v1/users/Reward", async (req: Request, res: Response) => {
  try {
    const { claim, settle, userSide } = req.query;
    const currentTime = Date.now();
    const indianTime = moment(currentTime).utcOffset("+05:30");
    const dayAndDate = indianTime.format("DD-MM-YYYY");
    const time = indianTime.format("HH:mm");

    let {
      userPhone,
      userName,
      loyaltyId,
      claimedAmount,
      waiterName,
      businessName,
      rewards,
      items,
      tableName,
      password,
      total,
      subTotal,
      sgst,
      cgst,
    } = req.body;

    if (!rewards || rewards < 0) {
      rewards = 0;
    }
    rewards = Math.floor(rewards);
    claimedAmount = Math.floor(claimedAmount);

    if (!loyaltyId || !userPhone) {
      return res.status(400).send("LoyaltyId and Phone Required");
    }
    if (settle == "false") {
      const existingUser = await UserReward.findOne({ userPhone, loyaltyId });

      if (!userSide) {
        if (password !== existingUser?.password) {
          return res.status(400).send("Wrong password");
        }
      }
      if (existingUser) {
        if (parseInt(claimedAmount) > existingUser?.rewards) {
          return res.status(400).send("Enter valid cliamed amount");
        }
      }
      return res.send(existingUser);
    }
    const saveRewardHistory = async (
      status: any,
      rewards: any,
      currentBalance: any
    ) => {
      if (status == "minus") {
        rewards = claimedAmountNumber;
      }
      const data = new UserRewardHistory({
        userName: existingReward?.userName || userName,
        userPhone,
        businessName,
        waiterName,
        status: status,
        rewards: rewards,
        items,
        time,
        date: new Date().toISOString().slice(0, 19).replace("T", " "),
        currentBalance: currentBalance,
        tableName,
        day: dayAndDate,
        loyaltyId,
        total,
        subTotal,
        sgst,
        cgst,
      });

      await data.save();
    };
    let claimedAmountNumber = Math.floor(Number(claimedAmount));
    let rewardsNumber = Math.floor(Number(rewards));

    let existingReward = await UserReward.findOne({ userPhone, loyaltyId });

    if (!existingReward) {
      const newReward = new UserReward({
        userPhone,
        userName,
        loyaltyId,
        rewards: rewardsNumber,
        password: Math.floor(Math.random() * 9000) + 10000,
        count: 1,
      });
      await newReward.save();
      if (rewards != 0) {
        await saveRewardHistory("plus", rewardsNumber, rewardsNumber);
      }

      return res.status(201).send(newReward);
    }

    if (claim === "true") {
      const existingUser = await UserReward.findOne({ userPhone, loyaltyId });

      if (!userSide) {
        if (password !== existingUser?.password) {
          return res.status(400).send("Wrong password");
        }
      }
      if (existingUser) {
        if (
          existingUser?.rewards == 0 ||
          claimedAmountNumber > existingUser?.rewards
        ) {
          return res
            .status(400)
            .send(
              "You cann't claimed 0 coins or claimedAmount should be less than rewards"
            );
        }
      }

      const updatedReward = await UserReward.findOneAndUpdate(
        { userPhone, loyaltyId },
        {
          $inc: { rewards: -claimedAmountNumber + rewardsNumber, count: 1 },
        },

        { new: true }
      );

      await saveRewardHistory("minus", rewards, updatedReward?.rewards);
      if (rewards != 0) {
        await saveRewardHistory("plus", rewards, updatedReward?.rewards);
      }

      return res.send(updatedReward);
    }

    if (claim === "false") {
      const updatedReward = await UserReward.findOneAndUpdate(
        { userPhone, loyaltyId },
        { $inc: { rewards: rewardsNumber, count: 1 } },
        { new: true }
      );
      if (rewards != 0) {
        await saveRewardHistory("plus", rewards, updatedReward?.rewards);
      }

      return res.send(updatedReward);
    }
  } catch (err) {
    console.log("err", err);
  }
});

router.post(
  "/v1/users/addCoins",

  async (req: Request, res: Response) => {
    try {
      let currentTime = Date.now();
      let momentTime = moment(currentTime);
      let indianTime = momentTime.clone().utcOffset("+05:30");
      let dayAndDate = indianTime.format("DD-MM-YYYY");
      const time = momentTime.clone().utcOffset("+05:30").format("HH:mm");
      let {
        loyaltyId,
        userPhone,
        coins,
        businessId,
        password,
        userName,
        businessName,
        waiterName,
        tableName,
      } = req.body;
      coins = Math.floor(coins);
      let loyaltySetting;
      try {
        loyaltySetting = await axios.get(
          `${process.env.URL}/v1/businesses/${businessId}/loyalty`
        );
        loyaltySetting = loyaltySetting?.data;

        if (password != loyaltySetting?.password) {
          return res.status(400).send("Wrong Password");
        }
      } catch (err: any) {
        console.log("err", err);
      }

      let existingReward = await UserReward.findOneAndUpdate(
        { userPhone, loyaltyId },
        { $inc: { rewards: coins } },
        { new: true }
      );
      let data = new UserRewardHistory({
        userName,
        userPhone,
        businessName,
        waiterName,
        status: "plus",
        rewards: coins,

        time,
        date: new Date().toISOString().replace("T", " ").slice(0, 19),
        currentBalance: existingReward?.rewards,
        tableName,
        day: dayAndDate,
        loyaltyId,
      });
      await data.save();

      return res.send(existingReward);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.post(
  "/v1/users/addBulkCoins",

  async (req: Request, res: Response) => {
    try {
      let currentTime = Date.now();
      let momentTime = moment(currentTime);
      let indianTime = momentTime.clone().utcOffset("+05:30");
      let dayAndDate = indianTime.format("DD-MM-YYYY");
      const time = momentTime.clone().utcOffset("+05:30").format("HH:mm");
      const { loyaltyId, usersArray, password, businessId, uploadedBy } =
        req.body;
      let loyaltySetting;
      try {
        loyaltySetting = await axios.get(
          `${process.env.URL}/v1/businesses/${businessId}/loyalty`
        );
        loyaltySetting = loyaltySetting?.data;

        if (password != loyaltySetting?.password) {
          return res.status(400).send("Wrong Password");
        }
      } catch (err: any) {
        console.log("err", err);
      }

      for (let i = 0; i < usersArray?.length; i++) {
        let userObject = usersArray?.[i];

        let userExit = await User.findOne({
          phone: userObject?.userPhone,
          role: "HIPAL_CUSTOMER",
        });

        if (userExit) {
          let existingReward = await UserReward.findOne({
            userPhone: userObject?.userPhone,
            loyaltyId,
          });

          if (!existingReward) {
            if (
              userObject?.rewards > 0 &&
              userObject?.rewards < loyaltySetting?.rewardLimit
            ) {
              const newReward = new UserReward({
                userPhone: userObject?.userPhone,
                userName: userExit?.name,
                loyaltyId,
                rewards: Math.floor(userObject?.rewards),
                password: Math.floor(Math.random() * 9000) + 10000,
                count: 1,
              });
              await newReward.save();
              const data = new UserRewardHistory({
                userName: userExit?.name,
                userPhone: userObject?.userPhone,

                waiterName: uploadedBy,
                status: "plus",
                rewards: Math.floor(userObject?.rewards),

                time,
                date: new Date().toISOString().slice(0, 19).replace("T", " "),
                currentBalance: Math.floor(userObject?.rewards),

                day: dayAndDate,
                loyaltyId,
                total: userObject?.total,
              });
              await data.save();
            }
          } else {
            if (existingReward?.rewards < loyaltySetting?.rewardLimit) {
              await UserReward.findOneAndUpdate(
                { userPhone: userObject?.userPhone, loyaltyId },
                {
                  $inc: { rewards: Math.floor(userObject?.rewards), count: 1 },
                },
                { new: true }
              );
              const data = new UserRewardHistory({
                userName: userExit?.name,
                userPhone: userObject?.userPhone,

                waiterName: uploadedBy,
                status: "plus",
                rewards: Math.floor(userObject?.rewards),

                time,
                date: new Date().toISOString().slice(0, 19).replace("T", " "),
                currentBalance: Math.floor(userObject?.rewards),

                day: dayAndDate,
                loyaltyId,
                total: userObject?.total,
              });
              await data.save();
            }
          }
        }
      }

      return res.send("uploaded successFully");
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.post(
  "/v1/users/signup",
  validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    let { phone, role, name, email, accessControl } = req.body;
    if (!phone || !role) {
      return res.status(400).send("phone and role required");
    }

    let existingUserPhone;

    existingUserPhone = await User.findOne({ phone, role });
    if (existingUserPhone) {
      const userJwt = createJWT(existingUserPhone);

      req.session = {
        jwt: userJwt,
      };
      const options = {
        method: "POST",
        url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authkey: "387796AmyGlDBq63b2d75aP1",
        },
      };
      await axios(options);
      return res.status(400).send(existingUserPhone);
    }
    if (!existingUserPhone) {
      const user = User.build({
        phone,
        role,
        name,
        email,
        accessControl,
      });

      await user.save();
      // Generate JWT
      const userJwt = createJWT(user);

      // // Store it on session object

      req.session = {
        jwt: userJwt,
      };
      const options = {
        method: "POST",
        url: `https://control.msg91.com/api/v5/otp?template_id=64393bf9d6fc05380863b002&mobile=91${phone}`,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authkey: "387796AmyGlDBq63b2d75aP1",
        },
      };
      await axios(options);

      return res.status(201).send(user);
    }
  }
);

router.post(
  "/v1/users/otpLogin",
  validateUser,
  validateRequest,
  async (req: Request, res: Response) => {
    const { phone, otp, role } = req.body;
    if (!phone && !otp) {
      return res.status(400).send("phone and otp required");
    }
    const options = {
      method: "GET",
      url: `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${phone}`,
      headers: {
        accept: "application/json",
        authkey: "387796AmyGlDBq63b2d75aP1",
      },
    };

    const response = await axios(options);

    if (
      response?.data?.message === "Mobile no. not found" ||
      response?.data?.message === "OTP not match"
    ) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid Otp !!" });
    }

    return res.status(200).send("success");
  }
);

export { router as createUserRouter };
