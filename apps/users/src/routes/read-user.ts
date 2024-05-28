import express, { Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  currentUser,
  requireAuthorization,
  ClientRoles,
} from "@hipal/common";
import { User } from "../models/user";
import { Admin } from "../models/admin";
import { userTransactionHistory } from "../models/userHistory";
import { UrlModel } from "../models/urlMode";
import axios from "axios";

const router = express.Router();
import { Staffshift } from "../models/staffShift";
import moment from "moment";
import { Staffsetting } from "../models/staffSetting";
import { Attendence } from "../models/attendence";
import { UserCount } from "../models/userCount";
import { UserReward } from "../models/userReward";
import { UserRewardHistory } from "../models/userRewardHistory";
import apicache from "apicache";
let cache = apicache.middleware;

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

router.get(
  "/v1/users/getlatesthistoryorder/:userId",
  currentUser,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      let PAGE_SIZE = 10;
      let pageNumber: any = req?.query?.pageNumber || 1;

      const skip: number = (pageNumber - 1) * PAGE_SIZE;

      const history = await userTransactionHistory
        .find({ userId: userId })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE);

      // send the orders to the client
      res.send({ status: true, data: history });
    } catch (error: any) {
      return res.status(500).send({ status: false, message: error.message });
    }
  }
);
router.get(
  "/v1/users/Url/:urlCode",
  cache("1 day"),

  async (req: Request, res: Response) => {
    try {
      const { urlCode } = req.params;
      let result = await UrlModel.findOne({ urlCode: urlCode });
      if (!result)
        return res
          .status(404)
          .send({ status: false, message: "Given urlcode not found !!" });

      return res.status(302).redirect(result.longUrl);
    } catch (error: any) {
      return res.status(500).send({ status: false, message: error.message });
    }
  }
);

router.get(
  "/v1/users/getsingletransaction/:tranactionId",
  async (req: Request, res: Response) => {
    try {
      const { tranactionId } = req.params;
      const transaction = await userTransactionHistory.findById(tranactionId);
      if (!transaction)
        return res
          .status(404)
          .send({ status: false, message: "Transaction Not Found !!!" });

      // send the orders to the client
      res.send({ status: true, data: transaction });
    } catch (error: any) {
      return res.status(500).send({ status: false, message: error.message });
    }
  }
);

router.get(
  "/v1/users",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { clientRole } = req.query;
    if (clientRole === "user") {
      const userId = req.currentUser?.id;
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        throw new NotFoundError();
      }

      res.status(200).send({
        currentUser: existingUser,
      });
    } else if (clientRole === "admin") {
      const userId = req.currentUser?.id;

      const admin = await Admin.findById(userId);

      if (!admin) {
        throw new NotFoundError();
      }

      res.status(200).send({
        currentUser: admin,
      });
    }
  }
);

router.get(
  "/v1/users/get/All/Users",

  async (req: Request, res: Response) => {
    const { remove } = req.query || {};

    const existingUser = await User.find();
    if (remove) {
      let success = await User.deleteMany({
        phone: { $in: ["9588413799", "9000006420"] },
      });
      return res.send(success);
    }

    if (!existingUser) {
      throw new NotFoundError();
    }

    return res.send(existingUser);
  }
);

router.get("/v1/users/resend/OTP", async (req: Request, res: Response) => {
  const { mobile } = req.query;

  const options = {
    method: "GET",
    url: `https://control.msg91.com/api/v5/otp/retry?authkey=387796AmyGlDBq63b2d75aP1&retrytype=text&mobile=${mobile}`,
  };

  const response = await axios(options);
  console.log("dddd", response);
  if (response) {
    return res.send(response.data);
  } else {
    return res.send(response);
  }
});

router.get(
  "/v1/users/:businessId",
  // currentUser,
  // requireAuth,
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const existingUser = await User.find({
      "customRole.businessId": businessId,
    });

    if (!existingUser) {
      throw new NotFoundError();
    }

    res.status(200).send(existingUser);
  }
);

router.get(
  "/v1/users/getOwner/list",

  async (req: Request, res: Response) => {
    const existingUser = await User.find({
      role: "RESTAURANT_OWNER",
    });

    if (!existingUser) {
      throw new NotFoundError();
    }

    res.status(200).send(existingUser);
  }
);

router.get("/v1/users/shift/ByToday", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query;
    var currentTime = Date.now();
    var momentTime = moment(currentTime);
    const existingUser = await User.find({
      "customRole.businessId": businessId,
      "customRole.roleName": { $nin: ["manager", "Manager"] },
    });
    var indianTime = momentTime.clone().utcOffset("+05:30");
    let date = indianTime.format("DD-MMMM-YYYY");

    var dayAndDate = indianTime.format("DD-MM-YYYY");
    let result = await Staffshift.find({ date: dayAndDate, businessId });
    let staffIdArray: any = [];
    let count = 0;

    result.forEach((element: any) => {
      staffIdArray.push(element?.staffId);
      if (
        element?.status == "Present" ||
        element?.status == "Late" ||
        (element?.dayIn && element?.dayOut)
      ) {
        count++;
      }
    });
    let filter = existingUser.filter(
      (ele: any) => !staffIdArray.includes(ele?.id)
    );

    if (filter?.length > 0) {
      for (let i = 0; i < filter?.length; i++) {
        let staffObj = {
          name: filter?.[i]?.name,
          staffId: filter?.[i]?.id,
          date: dayAndDate,
          status: "Absent",
          businessId,
        };
        let saveData = new Staffshift(staffObj);
        await saveData.save();
      }
    }

    const newResult = await Staffshift.find({ date: dayAndDate, businessId });

    let obj: any = {
      date: date,
      totalUser: existingUser?.length,
      present: count,
    };
    newResult.push(obj);

    return res.status(200).send(newResult);
  } catch (error: any) {
    return res.status(500).send({ status: false, message: error.message });
  }
});

router.get("/v1/users/Allstaff/all", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query;

    const result = await Staffsetting.find({
      businessId,
      // roleName: { $nin: ["manager", "Manager"] },
    });

    return res.status(200).send(result);
  } catch (error: any) {
    console.log("err", error);
  }
});

router.get("/v1/users/staff/Records", async (req: Request, res: Response) => {
  try {
    const { staffId, businessId, claims, month } = req.query;

    // Common filter for both queries
    const commonFilter: any = {
      staffId,
      businessId,
    };

    // Check if month is provided and format it
    if (month) {
      const monthNumber = new Date(`${month} 1, `).getMonth() + 1;
      const formattedDate = monthNumber.toString().padStart(2, "0");
      commonFilter["$expr"] = {
        $eq: [{ $month: { $toDate: "$date" } }, parseInt(formattedDate)],
      };
    }

    let result;
    if (claims) {
      result = await Staffshift.find(commonFilter);
    } else {
      result = await Attendence.find(commonFilter);
    }
    console.log("resu", result);
    let totalDays = 0;
    let leave = 0;
    let totalHr = 0;
    let rating = 0;
    let arr = ["Holiday", "Leave", "Absent"];
    result.forEach((element: any) => {
      rating += element?.rating || 0;
      if (element?.dayIn && element?.dayOut) {
        totalDays += 1;
      }
      if (element?.totalWorkHr) {
        const [hours, minutes] = element?.totalWorkHr?.match(/\d+/g);

        // Convert hours and minutes to numbers
        const totalHours = parseInt(hours, 10);
        const totalMinutes = parseInt(minutes, 10);

        // Calculate the total time in hours
        const totalTimeInHours = totalHours + totalMinutes / 60 || 0;
        totalHr += totalTimeInHours;
      }
      if (arr?.includes(element?.status)) {
        leave++;
      }
    });
    let avgHr = Math.floor(totalHr / totalDays);
    let avRating = Math.floor(rating / totalDays);
    let obj: any = { rating, totalDays, totalHr, leave, avRating, avgHr };
    result.forEach((element: any) => {
      const dateStr = element?.date;

      // Split the date string into day, month, and year
      const [day, month, year] = dateStr.split("-");

      // Convert the month number to a month name (January, February, etc.)
      const monthName = new Date(`${year}-${month}-${day}`).toLocaleString(
        "default",
        { month: "long" }
      );

      // Create the formatted date string
      const formattedDate = `${day}-${monthName}-${year}`;
      element.date = formattedDate; // Corrected line
    });
    result.push(obj);

    return res.status(200).send(result);
  } catch (error: any) {
    console.log("err", error);
  }
});

router.post(
  "/v1/users/staff/FilterByDate",
  async (req: Request, res: Response) => {
    try {
      const { businessId, from, to } = req.body;
      let fromDate = parseInt(from?.split("-")?.join(""));
      let toDate = parseInt(to?.split("-")?.join(""));
      console.log(
        "from",
        fromDate,
        "to",
        toDate,
        typeof fromDate,
        typeof toDate
      );
      if (from > to) {
        return res.status(400).send("Date format is wrong...!");
      }
      let arr = ["Holiday", "Leave", "Absent"];

      let result = await Attendence.find({ businessId }).lean();
      console.log("resu", result);
      let newArray: any = [];
      result.forEach((element) => {
        let date = parseInt(element?.date?.split("-")?.join(""));
        let obj = { ...element, date };
        newArray.push(obj);
      });
      let filterData = newArray.filter(
        (ele: any) => ele?.date >= fromDate && ele?.date <= toDate
      );
      const filteredArray = result.filter((item) =>
        filterData.filter((items: any) => items?._id == item?.id)
      );
      let Obj: any = {};
      for (let obj of filteredArray) {
        if (!Obj[obj.staffId]) {
          Obj[obj.staffId] = {
            staffId: obj.staffId,
            name: obj?.name,
            roleName: obj?.roleName,
            Shifts: [obj],
          };
        } else {
          Obj[obj.staffId].Shifts.push(obj);
        }
      }
      let newResult = Object.values(Obj);
      newResult.forEach((element: any) => {
        let rating = 0;
        let totalHr = 0;
        let leave = 0;
        let totaldays = element?.Shifts?.length;

        element?.Shifts?.forEach((shift: any) => {
          rating += shift?.rating || 0;
          if (shift?.totalWorkHr) {
            const [hours, minutes] = shift.totalWorkHr.match(/\d+/g) || [0, 0];

            // Convert hours and minutes to numbers
            const totalHours = parseInt(hours, 10);
            const totalMinutes = parseInt(minutes, 10);

            // Calculate the total time in hours
            const totalTimeInHours = totalHours + totalMinutes / 60 || 0;
            totalHr += totalTimeInHours;
          }

          if (arr?.includes(shift?.status)) {
            leave++;
          }
        });
        let avgHr = Math.floor(totalHr / totaldays);
        let avRating = Math.floor(rating / totaldays);
        element.rating = rating;
        element.totalHr = Math.floor(totalHr);
        element.leaves = leave;
        element.totalDays = totaldays;
        element.avgHr = avgHr;
        element.avRating = avRating;
      });

      res.status(200).send(newResult);
    } catch (error: any) {
      console.log("errer", error);
    }
  }
);

router.get("/v1/users/staff/ByDate", async (req: Request, res: Response) => {
  try {
    const { businessId, date } = req.query;

    const query = {
      businessId,
    } as any;
    if (date) {
      query["date"] = {
        $regex: `^${date}`,
      };
    }
    let result;
    if (date) {
      result = await Staffshift.find(query);
    } else {
      result = await Attendence.find(query);
    }

    // Now you can use the dateObject in your MongoDB query

    res.status(200).send(result);
  } catch (error: any) {
    console.log("err", error);
  }
});

router.get("/v1/users/staff/Single", async (req: Request, res: Response) => {
  try {
    const { staffId, password, remove } = req.query;
    let user;
    if (password) {
      user = await User.findByIdAndUpdate(
        staffId,
        { password: password },
        { new: true }
      );
    }
    if (remove) {
      user = await User.findByIdAndDelete(staffId);
      return res.send("Deleted");
    }

    user = await User.findById(staffId);
    if (!user) {
      return res.status(400).send("Not Found");
    }

    res.status(200).send(user);
  } catch (error: any) {
    console.log("err", error);
  }
});

router.get("/v1/users/add/Analytics", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query;
    let currentTime = Date.now();
    let momentTime = moment(currentTime);
    let indianTime = momentTime.clone().utcOffset("+05:30");

    let dayAndDate = indianTime.format("DD-MM-YYYY");
    let data = new UserCount({ businessId, date: dayAndDate });

    let user = await data.save();

    res.status(200).send(user);
  } catch (error: any) {
    console.log("err", error);
  }
});

router.get("/v1/users/Count/UserCount", async (req: Request, res: Response) => {
  try {
    const { businessId, from, to, date } = req.query;

    if (date) {
      const dates = String(date);

      let userCount = await UserCount.find({
        businessId,
        date: date,
      });
      let prevDate = moment(dates, "DD-MM-YYYY")
        .subtract(1, "days")
        .format("DD-MM-YYYY");
      let preUserCounts = await UserCount.find({
        businessId,
        date: prevDate,
      });
      let currentUserCount = userCount?.length || 0;
      let preUserCount = preUserCounts?.length || 0;

      let percentageChange =
        preUserCount !== 0
          ? ((currentUserCount - preUserCount) / preUserCount) * 100
          : 0;

      return res.send({
        count: currentUserCount,
        percentage: percentageChange,
      });
    }

    let currentTime = Date.now();
    let momentTime = moment(currentTime);
    let indianTime = momentTime.clone().utcOffset("+05:30");

    let dayAndDate = indianTime.format("DD-MM-YYYY");
    if (!from && !to) {
      let userCount = await UserCount.find({
        businessId,
        date: dayAndDate,
      });

      return res.send({ count: userCount?.length });
    }
    if (from && to) {
      let fromDate = new Date(String(from).split("-").reverse().join("-"));
      let toDate = new Date(
        String(to).split("-").reverse().join("-") + " 23:59:59"
      );
      if (fromDate > toDate) {
        return res
          .status(400)
          .send("From date cannot be greater than to date.");
      }
      const count = await UserCount.find({
        businessId,
        date: {
          $gte: from.toString(),
          $lte: to.toString(),
        },
      });

      return res.send({ count: count?.length });
    }
  } catch (error: any) {
    console.log("err", error);
  }
});

router.get(
  "/v1/users/:businessId/getUserReward",
  async (req: Request, res: Response) => {
    try {
      const { userPhone, loyaltyId } = req.query;

      if (!loyaltyId) {
        return res.status(400).send("loyaltyId Required");
      }
      const userExist = await User.findOne({
        phone: userPhone,
        role: "HIPAL_CUSTOMER",
      });
      if (!userExist) {
        return res.status(404).send("Not found");
      }

      const userRewards = await UserReward.findOne({ userPhone, loyaltyId });
      if (!userRewards) {
        const data = new UserReward({
          userPhone,
          loyaltyId,
          userName: userExist?.name,
          rewards: 0,
          password: Math.floor(Math.random() * 9000) + 10000,
          count: 0,
        });

        let user = await data.save();
        return res.send(user);
      }

      return res.send(userRewards);
    } catch (error: any) {
      console.log("err", error);
    }
  }
);

router.get(
  "/v1/users/:businessId/getUserRewardHistory",
  async (req: Request, res: Response) => {
    try {
      const { userPhone, loyaltyId, from, to } = req.query;
      var fields = "";
      var arr = [];
      if (req.query.fieldMasks) {
        console.log("fieldMasks", req.query.fieldMasks);
        const fieldMasks = req?.query?.fieldMasks as string;
        let validJson = fieldMasks.replace(/'/g, '"');
        arr = JSON.parse(validJson);
        fields = arr.join(" ");
      }
      let PAGE_SIZE = 20;
      let pageNumber: any = req?.query?.pageNumber || 1;
      const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
      const userRewards = await UserReward.findOne({
        userPhone,
        loyaltyId,
      });
      const totalReward = userRewards?.rewards;
      const userName = userRewards?.userName;

      if (!from && !to) {
        const userRewards = await UserRewardHistory.find({
          userPhone,
          loyaltyId,
        })
          .select(arr?.length > 0 ? fields : "")
          .sort({ id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);

        let newObje =
          {
            totalReward,
            userName,
            userPhone,
            items: userRewards,
          } || {};

        return res.send(newObje);
      }
      if (from && to) {
        if (from == to) {
          const userRewards = await UserRewardHistory.find({
            userPhone,
            loyaltyId,
          })
            .select(arr?.length > 0 ? fields : "")
            .sort({ id: -1 })
            .skip(skip)
            .limit(PAGE_SIZE);
          let newObje =
            {
              totalReward,
              userName,
              userPhone,
              items: userRewards,
            } || {};

          return res.send(newObje);
        }
        let fromDate = new Date(String(from).split("-").reverse().join("-"));
        let toDate = new Date(
          String(to).split("-").reverse().join("-") + " 23:59:59"
        );
        if (fromDate > toDate) {
          return res
            .status(400)
            .send("From date cannot be greater than to date");
        }
        const filteredRewards = await UserRewardHistory.find({
          userPhone,
          loyaltyId,
          date: {
            $gte: fromDate.toISOString(),
            $lte: toDate.toISOString(),
          },
        })
          .select(arr?.length > 0 ? fields : "")
          .sort({ id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);
        let newObje =
          {
            totalReward,
            userName,
            userPhone,
            items: filteredRewards,
          } || {};
        return res.send(newObje);
      }
    } catch (error: any) {
      console.log("err", error);
    }
  }
);

router.get(
  "/v1/users/:businessId/RewardHistory",
  async (req: Request, res: Response) => {
    try {
      const { from, to, loyaltyId, findUser } = req.query;
      var fields = "";
      var arr = [];
      if (req.query.fieldMasks) {
        const fieldMasks = req?.query?.fieldMasks as string;
        let validJson = fieldMasks.replace(/'/g, '"');
        arr = JSON.parse(validJson);
        fields = arr.join(" ");
      }
      let PAGE_SIZE = 20;
      let pageNumber: any = req?.query?.pageNumber || 1;
      const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
      if (findUser) {
        const userReward = await UserRewardHistory.findOne({
          loyaltyId,
          userPhone: findUser,
        });
        if (!userReward) {
          return res.status(404).send("Not Found");
        }

        return res.send(userReward);
      }

      if (!from && !to) {
        const userRewards = await UserRewardHistory.find({ loyaltyId })
          .sort({
            _id: -1,
          })
          .skip(skip)
          .limit(PAGE_SIZE)
          .select(arr?.length > 0 ? fields : "");

        return res.send(userRewards);
      }
      if (from && to) {
        if (from == to) {
          const userRewards = await UserRewardHistory.find({ loyaltyId })
            .sort({
              _id: -1,
            })
            .skip(skip)
            .limit(PAGE_SIZE)
            .select(arr?.length > 0 ? fields : "");

          return res.send(userRewards);
        }
        let fromDate = new Date(String(from).split("-").reverse().join("-"));
        let toDate = new Date(
          String(to).split("-").reverse().join("-") + " 23:59:59"
        );
        if (fromDate > toDate) {
          return res
            .status(400)
            .send("From date cannot be greater than to date .");
        }
        const filteredPayments = await UserRewardHistory.find({
          loyaltyId,
          date: {
            $gte: fromDate.toISOString(),
            $lte: toDate.toISOString(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .select(arr?.length > 0 ? fields : "");

        return res.send(filteredPayments);
      }
    } catch (error: any) {
      console.log("err", error);
    }
  }
);

router.get(
  "/v1/users/:businessId/getAllLoyaltyUsers",
  async (req: Request, res: Response) => {
    try {
      const { loyaltyId } = req.query;
      let PAGE_SIZE = 20;
      let pageNumber: any = req?.query?.pageNumber || 1;
      const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

      const allUsers = await UserReward.find({
        loyaltyId,
        rewards: { $ne: 0 },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .select("userPhone userName rewards id loyaltyId");

      return res.send(allUsers);
    } catch (error: any) {
      console.log("err", error);
    }
  }
);

router.get(
  "/v1/users/:businessId/loyaltyDashboard",
  async (req: Request, res: Response) => {
    try {
      const { loyaltyId, from, to } = req.query;

      // Get all reward history at once and process in memory
      const rewardHistory = await UserRewardHistory.find({ loyaltyId });

      let coinsIssued = 0;
      let coinsUsed = 0;
      let repeatUsed = 0;

      rewardHistory.forEach((element) => {
        switch (element?.status) {
          case "minus":
            coinsUsed += element?.rewards;
            break;
          case "plus":
            repeatUsed += element?.rewards;
            coinsIssued += element?.rewards;
            break;
        }
      });

      // Calculate usage percentage
      const usagePercentage = Number(
        ((coinsUsed / coinsIssued) * 100).toFixed(2)
      );

      let allUsers = await UserReward.find({ loyaltyId }).count();
      let newCustomer = allUsers;
      let coinsGivenOut = coinsIssued;
      let coinsGivenUsed = coinsUsed;

      if (from && to) {
        let fromDate = new Date(String(from).split("-").reverse().join("-"));
        let toDate = new Date(
          String(to).split("-").reverse().join("-") + " 23:59:59"
        );
        if (fromDate > toDate) {
          return res
            .status(400)
            .send("From date cannot be greater than to date.");
        }
        const filteredRewards = await UserRewardHistory.find({
          loyaltyId,
          date: {
            $gte: fromDate.toISOString(),
            $lte: toDate.toISOString(),
          },
        });

        newCustomer = filteredRewards?.length;
        filteredRewards.forEach((element) => {
          switch (element?.status) {
            case "minus":
              coinsGivenUsed += element?.rewards;
              break;
            case "plus":
              coinsGivenOut += element?.rewards;
              break;
          }
        });
        if (filteredRewards?.length == 0) {
          coinsGivenOut = 0;
          coinsGivenUsed = 0;
        }
      }
      return res.send({
        allUsers,
        coinsIssued,
        coinsUsed,
        repeatUsed,
        usagePercentage,
        coinsGivenOut,
        coinsGivenUsed,
        newCustomer,
      });
    } catch (error: any) {
      console.error("Error:", error);
      return res
        .status(500)
        .send({ error: "An error occurred while processing your request." });
    }
  }
);

const filterBasedOnDate = async (
  from: number,
  to: number,
  businessId: string
) => {
  const paymentStats = await UserRewardHistory.aggregate([
    {
      $match: {
        businessId: businessId,

        reward_date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTicketValue =
    paymentStats.length > 0
      ? Math.round(paymentStats[0].total / paymentStats[0].count)
      : 0;

  const obj = {
    avgTicketValue,
    visitPerDay: paymentStats.length > 0 ? paymentStats[0].count : 0,
  };

  return obj;
};

// Retrieves payments based on the specified date range and business ID.
router.get(
  "/v1/users/:id/userDashboard",
  currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      let { from, to } = req.query;
      let fromDate = Number(from);
      let toDate = Number(to);

      const businessId = req.query.businessId as string;
      if (!businessId) {
        return res.status(400).send({ message: "businessId is required" });
      }
      if (!from && !to) {
        const obj = await filterBasedOnDate(
          startOfToday.getTime(),
          endOfToday.getTime(),
          businessId
        );

        return res.send(obj);
      }
      if (from && to) {
        if (fromDate > toDate) {
          return res
            .status(400)
            .send("From date cannot be greater than to date.");
        }
        const obj = await filterBasedOnDate(fromDate, toDate, businessId);

        return res.send(obj);
      }

      return res.status(400).send("Invalid query parameters");
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  }
);

export { router as readUserRouter };
