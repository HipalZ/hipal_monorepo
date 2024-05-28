import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { Kitchen } from "../models/kitchen";
import { orderHistory } from "../models/orderHistory";
import axios from "axios";
import { KOT } from "../models/kot";
import { Alert } from "../models/alert";
import moment from "moment";
import { WaiterKot } from "../models/waiterKots";
import { PaidKot } from "../models/paidModel";
import { KotPassword } from "../models/kotPassword";
import { UserBill } from "../models/userBill";
import { TempModel } from "../models/tempModel";

interface Portion {
  name: string;
  price: number;
  discount: number;
  default: boolean;
}

interface Extra {
  name: string;
  price: number;
  qty: number;
}

interface Dish {
  dishId: string;
  name: string;
  price: number;
  qty: number;
  comments: string;
  extras: Extra[];
  portions: Portion[];
}

interface KOTAttrs {
  businessId: string;
  kitchenId: string;
  zoneId: string;
  tableId: string;
  staffId: string;
  startedAt: number;
  cookedAt: number;
  status: string;
  dish: Dish;
  customerName: string;
  customerPhone: string;
  dishStatus: string;
  kotTime: string;
  tableName: string;
  date: string;
  dishType: string;
  category: string;
  kotDate: string;
  priority: boolean;
  isDeleted: boolean;
  reasonForDelete: string;
  staffName: string;
  inventory: boolean;
  orderId: string;
  avgTime: number;
  taxes: [Object];
  swiggyBillObj?: any;
  match: boolean;
  isGst: boolean;
}

const currentTime = new Date();
const options = {
  timeZone: "Asia/Kolkata",
  hour: "2-digit" as const,
  minute: "2-digit" as const,
};
const formatter = new Intl.DateTimeFormat("en-US", options);
const time = formatter.format(currentTime);

const optionsTimeAndSeconds = {
  timeZone: "Asia/Kolkata",
  hour: "2-digit" as const,
  minute: "2-digit" as const,
  second: "2-digit" as const,
};
const formatterTimesAndSeconds = new Intl.DateTimeFormat(
  "en-US",
  optionsTimeAndSeconds
);
const timeWithSeconds = formatterTimesAndSeconds.format(currentTime);

const optionsDate = {
  timeZone: "Asia/Kolkata",
  year: "numeric" as const,
  month: "2-digit" as const,
  day: "2-digit" as const,
};
const formatterDate = new Intl.DateTimeFormat("en-US", optionsDate);
const currentDateAndTime = formatterDate.format(currentTime);

const router = express.Router();
router.put(
  "/v1/kitchens/kots",
  currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { kots } = req.body;
    console.log("kots", kots);
    const created = [];

    for (let i = 0; i < kots.length; i++) {
      const newKOT = kots[i];
      const kot = {
        status: "PAID",
      };
      await KOT.findByIdAndUpdate(newKOT, kot);
      created.push(kot);
    }

    res.status(201).send(created);
  }
);

router.put(
  "/v1/kitchens/updateAlert/alert",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      const { alertId, businessId, clearAll } = req.query;
      let alertExit = await Alert.findById(alertId);
      if (clearAll) {
        let allAlert = await Alert.find({
          businessId,
          isAlertOn: true,
        });
        for (let i = 0; i < allAlert.length; i++) {
          let single = allAlert?.[i];
          if (single?.status == "Cooked") {
            await KOT.findByIdAndUpdate(
              alertExit?.kotId,
              { dishStatus: "delivered" },
              { new: true }
            );
          }
        }
        let update = await Alert.updateMany(
          {
            businessId,
          },
          { isAlertOn: false }
        );
        return res.send(update);
      }

      if (!alertExit?.tableId) {
        const alert = await Alert.findByIdAndUpdate(
          alertId,
          {
            isAlertOn: false,
          },
          { new: true }
        );
        if (alertExit?.status == "Cooked") {
          await KOT.findByIdAndUpdate(
            alertExit?.kotId,
            { dishStatus: "delivered" },
            { new: true }
          );
        }

        return res.send("success");
      }

      if (alertExit?.status == "Cooked") {
        await KOT.findByIdAndUpdate(
          alertExit?.kotId,
          { dishStatus: "delivered" },
          { new: true }
        );
        const query = {
          businessId,
          tableId: alertExit?.tableId,
          zoneId: alertExit?.zoneId,
          status: "UNPAID",
        };

        const existingKOTs = await KOT.find(query);

        let delivered = 0;

        for (const existingKOT of existingKOTs) {
          if (existingKOT?.dishStatus === "delivered") {
            delivered++;
          }
        }

        const config = {
          method: "put",
          url: `${process.env.URL}/v1/zones/updateDish/${alertExit?.tableId}`,
          data: {
            deliverdDish: delivered,
          },
        };

        try {
          await axios(config);
        } catch (err: any) {
          return res.status(500).send({
            status: false,
            message: err,
          });
        }
      }

      const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
          isAlertOn: false,
        },
        { new: true }
      );
      if (alert?.staffId != "5") {
        const config = {
          method: "put",
          url: `${process.env.URL}/v1/zones/${alert?.zoneId}/tables/${alert?.tableId}`,
          data: {
            status: alert?.staffId,
          },
        };

        try {
          await axios(config);
        } catch (err: any) {
          return res
            .status(400)
            .send({ status: false, message: "need assitance not updated !!" });
        }
      }

      if (!alert) {
        throw new NotFoundError();
      }

      res.status(200).send(alert);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/updateOrderHistory",
  currentUser,

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

router.put(
  "/v1/kitchens/:id",
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    await Kitchen.findByIdAndUpdate(id, update);

    const kitchen = await Kitchen.findById(id);

    if (!kitchen) {
      throw new NotFoundError();
    }

    res.status(200).send(kitchen);
  }
);

router.delete(
  "/v1/kitchens/deleteOrderHistory",
  currentUser,

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

router.put(
  "/v1/kitchens/:kitchenId/kots",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.HIPAL_CUSTOMER,
  ]),
  //TODO :REMOVE UNWANTED ROLE
  async (req: Request, res: Response) => {
    try {
      const currentTime = Date.now();
      const momentTime = moment(currentTime);
      const indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");

      const { kots } = req.body;

      let created: any = [];
      //TODO : USE UPDATEMANY INSTEAD OF LOOP
      kots.forEach(async (newKOT: KOTAttrs) => {
        const single = await KOT.findById(newKOT);
        if (single?.priority == true) {
          await KOT.findByIdAndUpdate(newKOT, { priority: false });
        }
        if (single?.dishStatus == "cooking") {
          const kot = {
            cookedAt: Date.now(),
            dishStatus: "cooked",
          };
          const singleId = await KOT.findByIdAndUpdate(newKOT, kot);
          if (single?.isDeleted == false) {
            const obj = {
              businessId: singleId?.businessId,
              tableName: singleId?.tableName,
              zoneId: singleId?.zoneId,
              tableId: singleId?.tableId,
              staffId: singleId?.staffId,
              status: "Cooked",
              time: indianTime,
              message: `${singleId?.dish.name} is cooked `,
              kotId: singleId?.id || singleId?._id,
            };

            const saveAlert = new Alert(obj);
            console.log("save", saveAlert);
            await saveAlert.save();
          }
          created.push(kot);
        }
      });

      res.status(201).send({ created });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/update/kots/dish",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { kots } = req.body;
      const created = [];

      for (let i = 0; i < kots.length; i++) {
        const newKOT = kots[i];
        const kot = {
          dishStatus: "delivered",
        };
        let single = await KOT.findByIdAndUpdate(newKOT, kot, { new: true });

        if (single?.dishStatus === "delivered") {
          const config = {
            method: "put",
            url: `${process.env.URL}/v1/zones/updateDish/Single/${single?.tableId}`,
            data: { deliverdDish: 1 },
          };
          await axios(config);
        }

        created.push(kot);
      }

      res.status(201).send(created);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/updateAll/kots/dishStatus",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { tableId } = req.query || {};
    const updatedKOTs = await KOT.updateMany(
      { tableId },
      { $set: { dishStatus: "delivered" } }
    );
    res
      .status(201)
      .send({ status: true, message: "Updated Successfully......!" });
  }
);

router.put(
  "/v1/kitchens/updateKot/and/updatePayment",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const {
        kots,
        subTotal,
        Total,
        SGST,
        CGST,
        discount,
        mode,
        gstin,
        customerName,
        duesPersonId,
        customerPhone,
        claimedAmount,
        discountDescription,
        serviceCharge,
        modeBreakDown,
        otherCharges,
        waiterName,
        tips,
        zoneType,
        dayAndDate,
        indianTime,
        razorpayPaymentId,
        razorpayOrderId,
        razorpayAcquirerData,
        razorpayEventId,
        hiCode,
      } = req.body;

      if (!mode) {
        return res.status(400).send("mode Is Required !!");
      }

      if (mode === "dues" && !duesPersonId) {
        return res.status(400).send("DuesPersonId Is Required !!");
      }

      const created: any = [];
      for (const kotId of kots) {
        const updatedKOT = await KOT.findByIdAndUpdate(
          kotId,
          { status: "PAID", cookedAt: Date.now() },
          { new: true }
        );
        if (updatedKOT?.isDeleted === false) {
          created.push(updatedKOT);
        }
      }

      const singleData = created?.[1] || created?.[0];

      const items = created.map((kot: any) => {
        const newobj: any = {
          name: kot.dish?.name,
          quantity: kot.dish?.qty || kot.dish?.quantity,
          amount: kot.dish?.price,
          category: kot.category,
          portions: kot.dish?.portions,
          extras: kot.dish?.extras,
          comments: "spicy",
        };

        let price = 0;
        if (newobj.portions) {
          price =
            parseInt(newobj.portions.price) * (newobj.quantity || newobj.qty);
        } else {
          price = newobj.amount || 0;
        }

        let extrasPrice = 0;
        if (newobj.extras?.length > 0) {
          for (const extra of newobj.extras) {
            extrasPrice +=
              parseInt(extra.price || 0) * (extra.quantity || extra.qty);
          }
        }

        newobj.amount = price + extrasPrice || 0;

        return newobj;
      });

      const cName =
        customerName == "undefined" || "" || !customerName
          ? singleData?.customerName
          : customerName;
      const cPhone =
        customerPhone == "undefined" || "" || !customerPhone
          ? singleData?.customerPhone
          : customerPhone;

      let discountAmount = parseInt(discount);
      let sgstAmount = Number(SGST?.toFixed(2));
      let cgstAmount = Number(CGST?.toFixed(2));
      let totalAmount = parseInt(Total);

      if (mode === "complimentary") {
        discountAmount = subTotal;
        sgstAmount = 0;
        cgstAmount = 0;
        totalAmount = 0;
      }

      const paymentConfig = {
        method: "POST",
        url: `${process.env.URL}/v1/payments`,
        data: {
          businessId: singleData?.businessId,
          businessName: "NA",
          address: "NA",
          logo: "",
          gstin: gstin || "NA",
          items,
          subTotal: parseInt(subTotal),
          sgst: sgstAmount,
          cgst: cgstAmount,
          total: totalAmount,
          paymentMode: mode || "online",
          paymentDate: dayAndDate,
          mode: mode || "online",
          customerName: cName,
          customerPhone: cPhone,
          discount: discountAmount,
          zoneId: singleData?.zoneId,
          tableId: singleData?.tableId,
          time: indianTime,
          tableName: singleData?.tableName,
          duesPersonId,
          discountDescription,
          claimedAmount,
          serviceCharge,
          modeBreakDown,
          otherCharges,
          waiterName,
          tips,
          zoneType,
          razorpayPaymentId,
          razorpayOrderId,
          razorpayAcquirerData,
          razorpayEventId,
        },
      };

      let data;
      try {
        const response = await axios(paymentConfig);
        data = response.data;
      } catch (err: any) {
        return res.send({
          status: false,
          message: err,
        });
      }

      await Promise.all([
        PaidKot.deleteMany({ hiCode: hiCode }),
        PaidKot.deleteMany({ tableId: singleData?.tableId }),
        PaidKot.deleteMany({ discountTableId: singleData?.tableId }),
        PaidKot.deleteMany({ tipsTableId: singleData?.tableId }),
        PaidKot.deleteMany({ claimedTableId: singleData?.tableId }),
      ]);

      await PaidKot.create({ hiCode: hiCode });

      // const alertObj = {
      //   businessId: singleData?.businessId,
      //   tableName: singleData?.tableName,
      //   zoneId: singleData?.zoneId,
      //   tableId: singleData?.tableId,
      //   staffId: singleData?.staffId,
      //   status: "Paid",
      //   time: indianTime,
      //   message: `Paid ${Total}`,
      // };
      // await Alert.create(alertObj);

      const updateConfig = {
        method: "put",
        url: `${process.env.URL}/v1/zones/${singleData?.zoneId}/updateOccupied/${singleData?.tableId}?settle=true`,
        data: {
          status: "Empty",
          activeUser: 0,
          time: indianTime,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: "",
          mergedBy: "",
          reservedBy: "",
        },
      };
      try {
        await axios(updateConfig);
      } catch (err: any) {
        return res.status(400).send({
          status: false,
          message: err.message,
        });
      }

      return res.status(200).send({
        status: true,
        message: "Payment Done Successfully.....!",
      });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/settle-bill",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      let {
        kots,
        subTotal,
        Total,
        SGST,
        CGST,
        discount,
        mode,
        customerName,
        duesPersonId,
        customerPhone,
        claimedAmount,
        discountDescription,
        serviceCharge,
        modeBreakDown,
        waiterName,
        tips,
        zoneType,
        dayAndDate,
        indianTime,
        hiCode,
      } = req.body;

      if (!mode || (!Total && Total == null)) {
        return res.status(400).send("please enter the required fields");
      }

      if (mode === "dues" && !duesPersonId) {
        return res
          .status(400)
          .send("When mode is 'dues', a dues person must be selected.");
      }

      const created: any = [];
      for (const kotId of kots) {
        const updatedKOT = await KOT.findByIdAndUpdate(kotId, {
          status: "PAID",
          cookedAt: Date.now(),
        });

        if (updatedKOT?.isDeleted === false) {
          created.push(updatedKOT);
        }
      }

      const singleKot = created?.[1] || created?.[0];

      const items = created.map((kot: any) => {
        const newobj: any = {
          name: kot.dish?.name,
          quantity: kot.dish?.qty || kot.dish?.quantity,
          amount: kot.dish?.price,
          category: kot.category,
          portions: kot.dish?.portions,
          extras: kot.dish?.extras,
          comments: "spicy",
        };

        let price = 0;
        if (newobj.portions) {
          price =
            parseInt(newobj.portions.price) * (newobj.quantity || newobj.qty);
        } else {
          price = newobj.amount || 0;
        }

        let extrasPrice = 0;
        if (newobj.extras?.length > 0) {
          for (const extra of newobj.extras) {
            extrasPrice +=
              parseInt(extra.price || 0) * (extra.quantity || extra.qty);
          }
        }

        newobj.amount = price + extrasPrice || 0;

        return newobj;
      });
      const cName = customerName || singleKot?.customerName;
      const cPhone = customerPhone || singleKot?.customerPhone;
      if (mode === "complimentary") {
        discount = subTotal;
        SGST = 0;
        CGST = 0;
        Total = 0;
      }

      const paymentConfig = {
        method: "POST",
        url: `${process.env.URL}/v1/payments`,
        data: {
          businessId: singleKot?.businessId,
          items,
          subTotal: Number(subTotal),
          sgst: Number(SGST.toFixed(2)),
          cgst: Number(CGST.toFixed(2)),
          total: Number(Total),
          paymentMode: mode || "online",
          paymentDate: dayAndDate,
          mode: mode || "online",
          customerName: cName,
          customerPhone: cPhone,
          discount: Number(discount),
          zoneId: singleKot?.zoneId,
          tableId: singleKot?.tableId,
          time: indianTime,
          tableName: singleKot?.tableName,
          duesPersonId,
          discountDescription,
          claimedAmount,
          serviceCharge,
          modeBreakDown,
          waiterName,
          tips,
          zoneType,
        },
      };

      try {
        await axios(paymentConfig);
      } catch (err: any) {
        console.error(err);
        return res
          .status(400)
          .send(
            "Failed to process the payment. Please check your payment details and try again."
          );
      }
      try {
        await WaiterKot.deleteMany({ tableId: singleKot?.tableId });
      } catch (err: any) {
        console.error(err);
        return res
          .status(400)
          .send(
            "Failed to delete the KOTs associated with the table. Please try again."
          );
      }
      try {
        await TempModel.deleteOne({
          tableId: singleKot?.tableId,
        });
      } catch (err: any) {
        console.error(err);
      }

      // await TempModel.deleteOne({ hiCode });
      try {
        await TempModel.findOneAndUpdate(
          { tableId: singleKot.tableId },
          { $set: { hiCode } },
          { upsert: true, new: true }
        );
      } catch (err: any) {
        console.error(err);
      }

      const updateConfig = {
        method: "put",
        url: `${process.env.URL}/v1/zones/:zoneId/tables/${singleKot?.tableId}/settle`,
        data: {
          status: "Empty",
          activeUser: 0,
          time: indianTime,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: "",
          mergedBy: "",
          reservedBy: "",
        },
      };
      try {
        await axios(updateConfig);
      } catch (err: any) {
        console.error(err);
        return res
          .status(400)
          .send(
            "Failed to update the table. Please check your update details and try again."
          );
      }

      return res.status(200).send("settled!");
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/waiterKot/update/:kotId",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      var currentTime = Date.now();
      var momentTime = moment(currentTime);
      var indianTime = momentTime
        .clone()
        .utcOffset("+05:30")
        .format("HH:mm:ss");
      //TODO: check if this is required
      var indianTime2 = momentTime.clone().utcOffset("+05:30").format("HH:mm");

      const { kotId } = req.params;
      const { waiterName } = req.body;

      const created = [];
      let getWaiterKot = await WaiterKot.findById(kotId);
      //TODO: USE TIMESTAMP INSTEAD OF UTC OFFSET
      if (getWaiterKot) {
        const startedAt = Date.now();
        for (let i = 0; i < (getWaiterKot.items?.length ?? 0); i++) {
          const newKOT = getWaiterKot?.items?.[i] as unknown as object;

          const kot = KOT.build({
            ...(newKOT as KOTAttrs),
            startedAt,
            cookedAt: -1,
            status: "UNPAID",
            kotTime: indianTime,
            date: moment().format("Do MMM YY"),
            kotDate: new Date().toISOString().replace("T", " ").slice(0, 19),
          });
          await kot.save();
          //TODO REMOVE CREATED ARRAY
          created.push(kot);
        }
        let query = {
          businessId: getWaiterKot?.businessId,
          tableId: getWaiterKot?.tableId,
          zoneId: getWaiterKot?.zoneId,
          status: "UNPAID",
        };
        // TODO: use SELECT METHOD
        const existingKOTs = await KOT.find(query);

        const totalDish = existingKOTs?.length;
        let deliverd = 0;
        for (let i = 0; i < existingKOTs.length; i++) {
          let obj = existingKOTs[i];
          if (obj?.dishStatus == "delivered") {
            deliverd += 1;
          }
        }
        // TODO: ADD ZONE-SRV INSTEAD OF PROCESS.ENV.URL
        const config = {
          method: "put",
          url: `${process.env.URL}/v1/zones/${getWaiterKot?.zoneId}/updateOccupied/${getWaiterKot?.tableId}`,
          data: {
            totalDishQuantity: totalDish,
            deliverdDish: deliverd,
            status: "Active",
            time: indianTime2,
          },
        };

        try {
          await axios(config);
        } catch (err: any) {
          return res.status(500).send({
            status: false,
            message: err.message,
          });
        }
        await WaiterKot.findByIdAndUpdate(kotId, {
          isAccept: true,
          acceptedBy: waiterName,
        });
        //TODO : REMOVE UNWANTED RESPONSE PAYLOAD
        return res.status(201).send({
          status: true,
          message: "Order Accepted...!",
          data: created,
          cart: getWaiterKot?.cart,
        });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Not Accepted..." });
      }
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

//new accept order
router.put(
  "/v1/kitchens/:id/acceptOrder/:kotId",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { kotId } = req.params;
      const { waiterName, kotPrinter } = req.body;
      const currentTime = new Date();

      const optionsTimeAndSeconds = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit" as const,
        minute: "2-digit" as const,
        second: "2-digit" as const,
        hour12: false, // Use 24-hour time
      };
      const formatterTimesAndSeconds = new Intl.DateTimeFormat(
        "en-US",
        optionsTimeAndSeconds
      );
      const kotTime = formatterTimesAndSeconds.format(currentTime);

      let getWaiterKot = await WaiterKot.findById(kotId);

      if (getWaiterKot?.isAccept) {
        return res.status(400).send("Order already accepted");
      }

      if (getWaiterKot) {
        try {
          const startedAt = Date.now();
          const kotsToInsert = [];
          const kotDate = new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);
          for (let i = 0; i < (getWaiterKot.items?.length ?? 0); i++) {
            const newKOT = getWaiterKot?.items?.[i] as unknown as object;

            const kot = KOT.build({
              ...(newKOT as KOTAttrs),
              startedAt,
              cookedAt: -1,
              status: "UNPAID",
              kotTime: kotTime,
              kotDate: kotDate,
            });
            kotsToInsert.push(kot);
          }

          await KOT.insertMany(kotsToInsert);
        } catch (err: any) {
          console.log("err", err);
          return res.status(400).send("something went wrong please try again");
        }
        let query = {
          tableId: getWaiterKot?.tableId,
          status: "UNPAID",
        };
        const existingKOTs = await KOT.find(query).select("dishStatus");

        const totalDish = existingKOTs?.length;
        let deliverd = 0;
        for (let i = 0; i < existingKOTs.length; i++) {
          let obj = existingKOTs[i];
          if (obj?.dishStatus == "delivered") {
            deliverd += 1;
          }
        }

        const config = {
          method: "put",
          url: `${process.env.URL}/v1/zones/:zoneId/tables/${getWaiterKot.tableId}/settle`,
          data: {
            totalDishQuantity: totalDish,
            deliverdDish: deliverd,
            status: "Active",
            time: time,
          },
        };

        try {
          await axios(config);
        } catch (err: any) {
          return res.status(400).send("something went wrong please try again");
        }
        await WaiterKot.findByIdAndUpdate(kotId, {
          isAccept: true,
          acceptedBy: waiterName,
        });
        try {
          if (getWaiterKot && kotPrinter) {
            const ws_config = {
              method: "POST",
              url: "https://ws.hipal.life",
              data: {
                businessId: getWaiterKot?.businessId,
                payload: {
                  tableName: getWaiterKot?.tableName,
                  cart: getWaiterKot?.cart,
                  waiterName: waiterName,
                },
              },
            };
            const res = axios(ws_config);
          }
        } catch (err) {
          console.log(err);
        }

        return res.status(201).send({
          status: true,
          message: "Order Accepted...!",
        });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Not Accepted..." });
      }
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/reject/Order/:orderId",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { waiterName } = req.body;
      let update = { isReject: true, rejectedBy: waiterName };

      const alert = await WaiterKot.findByIdAndUpdate(orderId, update);

      if (!alert) {
        return res.send({ status: false, message: "Not Found Order" });
      }

      res.status(200).send(alert);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/Edit/Order/:orderId",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { waiterName } = req.body;

      let update = { isEdit: true, editedBy: waiterName };

      await WaiterKot.findByIdAndUpdate(orderId, update);

      const alert = await WaiterKot.findById(orderId);

      if (!alert) {
        return res.send({ status: false, message: "Not Found Order" });
      }

      res.status(200).send(alert);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/update/transferTable",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),

  async (req: Request, res: Response) => {
    try {
      const {
        businessId,
        fromTableId,
        fromZoneId,
        fromTableName,
        toTableId,
        toZoneId,
        toTableName,
        switchedBy,
      } = req.body;

      ///v1/zones/:zoneId/tables/:id/SingleTable
      let checkTable;
      const tableConfig = {
        method: "get",
        url: `${process.env.URL}/v1/zones/${toZoneId}/tables/${toTableId}/SingleTable`,
      };

      try {
        checkTable = await axios(tableConfig);
        if (checkTable?.data?.status != "Empty") {
          return res.status(400).send("Table must be Empty");
        }
      } catch (err: any) {
        console.log("err", err);
      }

      await KOT.updateMany(
        {
          businessId,
          tableId: fromTableId,
          zoneId: fromZoneId,
          status: "UNPAID",
        },
        {
          businessId,
          tableId: toTableId,
          zoneId: toZoneId,
          status: "UNPAID",
          tableName: toTableName,
          switchedBy,
        }
      );

      const config = {
        method: "put",
        url: `${process.env.URL}/v1/zones/${fromZoneId}/tables/${fromTableId}`,
        data: {
          status: "Empty",
          activeUser: 0,
          time: time,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: "",
          mergedBy: "",
          reservedBy: "",
        },
      };

      try {
        await axios(config);
      } catch (err: any) {
        return res.status(400).send({
          status: false,
          message: err.message,
        });
      }

      const query = {
        businessId,
        tableId: toTableId,
        zoneId: toZoneId,
        status: "UNPAID",
      };

      const existingKOTs = await KOT.find(query).select("dishStatus");

      const totalDish = existingKOTs?.length;
      let delivered = 0;

      for (const existingKOT of existingKOTs) {
        if (existingKOT?.dishStatus === "delivered") {
          delivered++;
        }
      }

      const con = {
        method: "put",
        url: `${process.env.URL}/v1/zones/updateDish/${toTableId}`,
        data: {
          totalDishQuantity: totalDish,
          deliverdDish: delivered,
          status: "Active",
          time: time,
        },
      };

      try {
        await axios(con);
      } catch (err: any) {
        return res.status(400).send({
          status: false,
          message: err.message,
        });
      }

      await Alert.updateMany(
        {
          tableId: fromTableId,
          zoneId: fromZoneId,
          businessId: businessId,
          isAlertOn: true,
        },
        {
          tableId: toTableId,
          zoneId: toZoneId,
          businessId: businessId,
          isAlertOn: true,
          tableName: toTableName,
        }
      );

      await WaiterKot.updateMany(
        {
          zoneId: fromZoneId,
          tableId: fromTableId,
          isAccept: false,
          businessId,
        },
        {
          zoneId: toZoneId,
          tableId: toTableId,
          isAccept: false,
          businessId,
        }
      );

      res.send("switched SuccessFully");
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.put(
  "/v1/kitchens/:id/updateSingleKot",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),

  async (req: Request, res: Response) => {
    const { id } = req.params;
    let {
      isDeleted,
      deleteKotIds,
      password,
      businessId,
      inventory,
      reasonForDelete,
      staffName,
      priority,
    } = req.body;
    if (priority == true && isDeleted == true) {
      return res.status(400).send("You cann't priorities delete Kot");
    }
    if (isDeleted) {
      let kotPass = await KotPassword.findOne({ businessId });
      if (!kotPass) {
        return res.status(400).send("Before deletetion set kot password");
      }
      if (password != kotPass?.password) {
        return res.status(400).send("Wrong password");
      }
      let deletedKot = await KOT.updateMany(
        { _id: { $in: deleteKotIds }, status: "UNPAID" },
        {
          $set: {
            isDeleted,
            inventory,
            reasonForDelete,
            staffName,
            priority: false,
          },
        }
      );

      return res.send(deletedKot);
    }

    const existingKot = await KOT.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );

    if (!existingKot) {
      throw new NotFoundError();
    }

    res.status(200).send(existingKot);
  }
);

router.put(
  "/v1/kitchens/:id/serviceCharge",
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      let { tableId, reapply, serviceChargeRemovedBy, serviceChargeAddedBy } =
        req.body || {};

      if (reapply) {
        serviceChargeRemovedBy = "";
      }
      if (!reapply) {
        serviceChargeAddedBy = "";
      }

      const serviceChargeisExist = await TempModel.findOne({
        tableId,
        serviceChargeApply: true,
      });

      if (serviceChargeisExist && reapply) {
        return res.status(400).send("Service Charge is already applied");
      }

      const updateServiceCharge = await TempModel.findOneAndUpdate(
        { tableId: tableId },
        {
          $set: {
            serviceChargeApply: reapply ? true : false,
            serviceChargeRemovedBy,
            serviceChargeAddedBy,
          },
        },
        { upsert: true }
      );
      return res.send(updateServiceCharge);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:kitchenId/settle",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const currentTime = Date.now();
      const momentTime = moment(currentTime);

      const Time = momentTime.clone().utcOffset("+05:30");

      const dayAndDate = Time.format("DD-MM-YYYY");
      const indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");

      let {
        kots,
        subTotal,
        Total,
        SGST,
        CGST,
        discount,
        mode,
        gstin,
        customerName,
        duesPersonId,
        customerPhone,
        claimedAmount,
        discountDescription,
        serviceCharge,
        modeBreakDown,
        otherCharges,
        zoneType,
        orderId,
      } = req.body;
      if (!mode) {
        return res.status(400).send("mode Is Required !!");
      }

      if (mode == "dues" && !duesPersonId) {
        return res.status(400).send("DuesPersonId Is Required !!");
      }

      const created: any = [];
      for (let i = 0; i < kots.length; i++) {
        const newKOT = kots[i];
        const kot = {
          status: "PAID",
          cookedAt: Date.now(),
        };
        let singlekot = await KOT.findByIdAndUpdate(newKOT, kot, { new: true });

        created.push(singlekot);
      }

      let singleData = created?.[1] || created?.[0];

      const config1 = {
        method: "get",
        url: `${process.env.URL}/v1/businesses/get/Single/${singleData?.businessId}`,
      };
      let businessData;

      try {
        let response = await axios(config1);
        businessData = response.data;
      } catch (err: any) {
        return res.status(400).send({
          status: false,
          message: err.message,
        });
      }
      let items = [];

      for (let i = 0; i < created.length; i++) {
        let newobj: any = {};
        (newobj.name = created[i].dish?.name),
          (newobj.quantity = created[i].dish?.qty || created[i].dish?.quantity);
        newobj.amount = created[i].dish?.price;
        newobj.portions = created[i].dish?.portions;
        (newobj.extras = created[i].dish?.extras), (newobj.comments = "spicy");
        (newobj.category = created[i].category), items.push(newobj);
      }
      for (const item of items) {
        // Calculate the total price of portions
        let price;
        if (item?.portions) {
          price =
            parseInt(item?.portions?.price) *
            parseInt(item?.quantity || item?.qty);
        } else {
          price = parseInt(item?.amount);
        }
        let extrasPrice = 0;
        if (item?.extras?.length > 0) {
          for (const extra of item.extras) {
            extrasPrice +=
              parseInt(extra.price || 0) * extra?.quantity || extra?.qty;
          }
        }

        item.amount = price + extrasPrice;
      }
      const cName =
        customerName == "undefined" || "" || !customerName
          ? singleData?.customerName
          : customerName;
      const cPhone =
        customerPhone == "undefined" || "" || !customerPhone
          ? singleData?.customerPhone
          : customerPhone;

      if (mode == "complimentary") {
        discount = 0;
        Total = 0;
      }

      const paymentConfig = {
        method: "POST",
        url: `${process.env.URL}/v1/payments`,
        data: {
          businessId: singleData?.businessId,
          businessName: businessData?.businessName,
          address: businessData?.address,
          logo: businessData?.logo,
          gstin: gstin || "NA",
          items: items,
          subTotal: parseInt(subTotal),
          sgst: Number(SGST?.toFixed(2)),
          cgst: Number(CGST?.toFixed(2)),
          total: parseInt(Total),
          paymentMode: mode || "online",
          paymentDate: dayAndDate,
          mode: mode || "online",
          customerId: Math.floor(
            Math.random() * (999999 - 100000 + 1) + 100000
          ),
          customerName: cName,
          customerPhone: cPhone,
          discount: parseInt(discount),
          zoneId: singleData?.zoneId,
          tableId: singleData?.tableId,
          time: indianTime,
          tableName: singleData?.tableName,
          duesPersonId: duesPersonId,
          discountDescription,
          claimedAmount,
          serviceCharge,
          modeBreakDown,
          otherCharges,
          zoneType: "Take Away",
          swiggyBillObj: singleData?.swiggyBillObj,
          orderId,
        },
      };
      let data;
      try {
        let response = await axios(paymentConfig);
        data = response.data;
      } catch (err: any) {
        return res.send({
          status: false,
          message: err,
        });
      }
      await Alert.updateMany(
        {
          zoneId: singleData.zoneId,
          businessId: singleData.businessId,
        },
        { isAlertOn: false }
      );
      let obj = [
        {
          businessId: singleData?.businessId,
          tableName: singleData?.tableName,
          zoneId: singleData?.zoneId,
          staffId: singleData?.staffId,
          status: "Paid",
          time: indianTime,
          message: `Paid ${Total}`,
        },
      ];
      for (let i = 0; i < obj.length; i++) {
        let saveAlert = new Alert(obj[i]);
        await saveAlert.save();
      }

      return res.status(200).send({
        status: true,
        message: "Payment Done Successfully.....!",
        data: data,
      });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/orderBySwiggy",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { businessId, orderId } = req.query;
      const { password } = req.body;

      let deleteKotPass = await KotPassword.findOne({ password: password });
      console.log("deleteKotPass", deleteKotPass);

      if (password != deleteKotPass?.password) {
        return res.status(400).send("Wrong password");
      }
      let result = await KOT.updateMany(
        { businessId, orderId, isDeleted: false },
        { isDeleted: true }
      );

      res.status(200).send(result);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/kot/:kotId",

  async (req: Request, res: Response) => {
    const { id, kotId } = req.params;
    let update = { ...req.body };

    let updateKot = await KOT.findByIdAndUpdate(kotId, update, { new: true });
    return res.send(updateKot);
  }
);

router.put(
  "/v1/kitchens/:id/tempModel",

  async (req: Request, res: Response) => {
    const { tableId, remove } = req.query;
    if (tableId) {
      const tables = await TempModel.deleteOne({ tableId });
      return res.send(tables);
    }
    if (remove) {
      await TempModel.deleteMany();
      return res.send("Deleted");
    }
    let tables = await TempModel.find();

    return res.send(tables);
  }
);

router.put(
  "/v1/kitchens/:id/applyDiscount",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      let {
        tableId,
        discountAmount,
        discountDescription,
        discountPercentage,
        discountMode,
        discountGivenBy,
        discountRemovedBy,
      } = req.body || {};

      if (discountAmount == 0) {
        discountGivenBy = "";
        discountPercentage = 0;
      }

      if (!tableId) {
        return res.status(400).send("Table Id is required");
      }
      const updateDiscount = await TempModel.findOneAndUpdate(
        { tableId: tableId },
        {
          $set: {
            discountAmount,
            discountDescription,
            discountPercentage,
            discountMode,
            discountGivenBy,
            discountRemovedBy,
          },
        },
        { upsert: true, new: true }
      );
      return res.send(updateDiscount);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/applyCoins",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { tableId, claimedAmount, coinsGivenBy } = req.body || {};
      if (!claimedAmount || claimedAmount < 0) {
        return res
          .status(400)
          .send("Claimed Amount is required and should be greater than 0");
      }
      if (!tableId) {
        return res.status(400).send("Table Id is required");
      }
      const updateClaimedAmount = await TempModel.findOneAndUpdate(
        { tableId: tableId },
        { $set: { claimedAmount, coinsGivenBy } },
        { upsert: true, new: true }
      );
      return res.send(updateClaimedAmount);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/applyTips",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { tableId, tipsAmount, tipsGivenBy } = req.body || {};
      if (!tipsAmount || tipsAmount < 0) {
        return res
          .status(400)
          .send("Tips Amount is required and should be greater than 0");
      }
      if (!tableId) {
        return res.status(400).send("Table Id is required");
      }
      const updateTipsAmount = await TempModel.findOneAndUpdate(
        { tableId: tableId },
        { $set: { tipsAmount, tipsGivenBy } },
        { upsert: true, new: true }
      );
      return res.send(updateTipsAmount);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/e-bill",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    const {
      businessId,
      tableId,
      zoneId,
      customerName,
      customerPhone,
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      hasServiceCharge,
      serviceChargePercentage,
    } = req.body;
    const serviceChargeApply = await TempModel.findOne({
      tableId,
      serviceChargeApply: false,
    });

    let kots: any[] = [];

    const query = {
      status: "UNPAID",
      isDeleted: false,
      businessId,
      tableId,
      zoneId,
    } as any;

    const existingKOTs: any = await KOT.find(query, {
      businessId: 0,
      zoneId: 0,
      staffId: 0,
      startedAt: 0,
      cookedAt: 0,
      "dish.comments": 0,
      category: 0,
      status: 0,
      dishStatus: 0,
      dishType: 0,
      priority: 0,
      inventory: 0,
      taxes: 0,
      swiggyBillObj: 0,

      match: 0,
    });
    let subTotal: any = 0;
    let NOGSTTOTL = 0;
    const merged: any = [];
    for (let i = 0; i < existingKOTs.length; i++) {
      let total;
      const obj: any = existingKOTs[i];

      if (obj?.isGst == false) {
        NOGSTTOTL += obj?.dish?.price * obj?.dish?.qty;
      }

      let newPrice = obj?.dish?.price * obj?.dish?.qty || obj?.dish?.quantity;
      let extraPrice = 0;
      let portionPrice = 0;
      if (obj?.dish?.extras?.length > 0) {
        obj?.dish?.extras.forEach((extra: any) => {
          extraPrice +=
            parseInt(extra?.price || 0) *
            parseInt(extra?.qty || extra?.quantity);
        });
      }

      if (obj?.dish?.portions) {
        portionPrice = parseInt(obj?.dish?.portions?.price);
        total = portionPrice + extraPrice;
      } else {
        total = newPrice + extraPrice;
      }

      obj.dish.price = total;
      subTotal += total;
    }

    existingKOTs.forEach((item: any) => {
      // Find if the dish already exists in the merged array with the same extras and portions
      const existing = merged.find(
        (mItem: any) =>
          mItem.dish.dishId === item.dish.dishId &&
          JSON.stringify(mItem.dish?.extras) ===
            JSON.stringify(item.dish?.extras) &&
          JSON.stringify(mItem.dish?.portions) ===
            JSON.stringify(item.dish?.portions)
      );

      if (existing) {
        console.log("existing", existing);
        // Merge quantities and update the price
        existing.dish.qty += item.dish.qty;
        existing.dish.price += item.dish.price;
      } else {
        // Clone the item and add it to the merged array
        merged.push(JSON.parse(JSON.stringify(item)));
      }
    });

    let copySubtotal = subTotal;
    let discount: Number = 0;
    const tableInfo = await TempModel.findOne({ tableId });
    if (tableInfo) {
      if (tableInfo?.discountMode == "percent") {
        let dis = Math.floor(
          ((tableInfo.discountPercentage > 100
            ? 100
            : tableInfo.discountPercentage) *
            subTotal) /
            100
        );
        if (dis > subTotal) {
          subTotal = dis;
        }

        subTotal -= dis;
        discount = dis;
      } else {
        let dis = tableInfo.discountAmount;
        if (dis > subTotal) {
          subTotal = dis;
        }
        subTotal -= dis;
        discount = dis;
      }
    }
    let claimedAmount: Number = 0;

    if (tableInfo) {
      let coins =
        tableInfo.claimedAmount > subTotal ? subTotal : tableInfo.claimedAmount;
      if (coins > subTotal) {
        subTotal = coins;
      }
      subTotal -= coins;
      claimedAmount = coins;
    }
    if (discount > copySubtotal || discount == copySubtotal) {
      claimedAmount = 0;
    }
    let totalTips = 0;

    if (tableInfo) {
      let tip = tableInfo.tipsAmount;
      totalTips = tip;
      if (totalTips < 0) {
        totalTips = 0;
      }
    }

    let serviceCharge = 0;
    if (hasServiceCharge && !serviceChargeApply) {
      let percentage = serviceChargePercentage;
      serviceCharge = (subTotal * percentage) / 100 || 0;
    }
    if (discount > copySubtotal || discount == copySubtotal) {
      serviceCharge = 0;
    }
    if (subTotal < 0) {
      subTotal = 0;
    }
    if (serviceCharge < 0) {
      serviceCharge = 0;
    }
    let flag = false;
    subTotal += serviceCharge - NOGSTTOTL;
    if (subTotal < 0) {
      flag = true;
    }
    let copy = subTotal;
    let Total: number = 0;
    let newSubTotal = 0;
    if (flag) {
      newSubTotal = serviceCharge;
    } else {
      newSubTotal = subTotal;
    }
    let GST = newSubTotal * 0.05;

    let SGST = GST / 2;
    let CGST = SGST;
    if (SGST < 0) {
      SGST = 0;
      CGST = 0;
    }
    subTotal += SGST + CGST + totalTips;
    Total = Math.round(subTotal + NOGSTTOTL);

    let obj: any = {
      subTotal: copySubtotal,
      discount,
      SGST: Number(SGST?.toFixed(2)),
      CGST: Number(CGST?.toFixed(2)),
      Total,
      kots,

      customerName,
      customerPhone,
      claimedAmount,
    };

    if (hasServiceCharge && !serviceChargeApply && serviceCharge > 0) {
      obj["serviceCharge"] = Number(serviceCharge?.toFixed(2));
    }

    if (totalTips > 0) {
      obj["tips"] = totalTips;
    }
    existingKOTs.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    existingKOTs.push(obj);

    merged.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    merged.push(obj);
    if (merged?.length == 2) {
      return res.status(200).send([]);
    }

    let billObj = {
      tableId,
      businessId,
      zoneId,
      time: time,
      date: currentDateAndTime,
      bill: existingKOTs,
    };

    let saveData = new UserBill(billObj);
    let bill = await saveData.save();

    return res.send({ billId: bill?._id });
  }
);

router.put(
  "/v1/kitchens/:id/printBill",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    const {
      businessId,
      tableId,
      zoneId,
      customerName,
      customerPhone,
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      hasServiceCharge,
      serviceChargePercentage,
    } = req.body;
    const serviceChargeApply = await TempModel.findOne({
      tableId,
      serviceChargeApply: false,
    });

    let kots: any[] = [];

    const query = {
      status: "UNPAID",
      isDeleted: false,
      businessId,
      tableId,
      zoneId,
    } as any;

    const existingKOTs: any = await KOT.find(query, {
      businessId: 0,
      zoneId: 0,
      staffId: 0,
      startedAt: 0,
      cookedAt: 0,
      "dish.comments": 0,
      category: 0,
      status: 0,
      dishStatus: 0,
      dishType: 0,
      priority: 0,
      inventory: 0,
      taxes: 0,
      swiggyBillObj: 0,

      match: 0,
    });
    let subTotal: any = 0;
    let NOGSTTOTL = 0;
    const merged: any = [];
    for (let i = 0; i < existingKOTs.length; i++) {
      let total;
      const obj: any = existingKOTs[i];

      if (obj?.isGst == false) {
        NOGSTTOTL += obj?.dish?.price * obj?.dish?.qty;
      }

      let newPrice = obj?.dish?.price * obj?.dish?.qty || obj?.dish?.quantity;
      let extraPrice = 0;
      let portionPrice = 0;
      if (obj?.dish?.extras?.length > 0) {
        obj?.dish?.extras.forEach((extra: any) => {
          extraPrice +=
            parseInt(extra?.price || 0) *
            parseInt(extra?.qty || extra?.quantity);
        });
      }

      if (obj?.dish?.portions) {
        portionPrice = parseInt(obj?.dish?.portions?.price);
        total = portionPrice + extraPrice;
      } else {
        total = newPrice + extraPrice;
      }

      obj.dish.price = total;
      subTotal += total;
    }

    existingKOTs.forEach((item: any) => {
      // Find if the dish already exists in the merged array with the same extras and portions
      const existing = merged.find(
        (mItem: any) =>
          mItem.dish.dishId === item.dish.dishId &&
          JSON.stringify(mItem.dish?.extras) ===
            JSON.stringify(item.dish?.extras) &&
          JSON.stringify(mItem.dish?.portions) ===
            JSON.stringify(item.dish?.portions)
      );

      if (existing) {
        // Merge quantities and update the price
        existing.dish.qty += item.dish.qty;
        existing.dish.price += item.dish.price;
      } else {
        // Clone the item and add it to the merged array
        merged.push(JSON.parse(JSON.stringify(item)));
      }
    });

    let copySubtotal = subTotal;
    let discount: Number = 0;
    const tableInfo = await TempModel.findOne({ tableId });
    if (tableInfo) {
      if (tableInfo?.discountMode == "percent") {
        let dis = Math.floor(
          ((tableInfo.discountPercentage > 100
            ? 100
            : tableInfo.discountPercentage) *
            subTotal) /
            100
        );
        if (dis > subTotal) {
          subTotal = dis;
        }

        subTotal -= dis;
        discount = dis;
      } else {
        let dis = tableInfo.discountAmount;
        if (dis > subTotal) {
          subTotal = dis;
        }
        subTotal -= dis;
        discount = dis;
      }
    }
    let claimedAmount: Number = 0;

    if (tableInfo) {
      let coins =
        tableInfo.claimedAmount > subTotal ? subTotal : tableInfo.claimedAmount;
      if (coins > subTotal) {
        subTotal = coins;
      }
      subTotal -= coins;
      claimedAmount = coins;
    }
    if (discount > copySubtotal || discount == copySubtotal) {
      claimedAmount = 0;
    }
    let totalTips = 0;

    if (tableInfo) {
      let tip = tableInfo.tipsAmount;
      totalTips = tip;
      if (totalTips < 0) {
        totalTips = 0;
      }
    }

    let serviceCharge = 0;
    if (hasServiceCharge && !serviceChargeApply) {
      let percentage = serviceChargePercentage;
      serviceCharge = (subTotal * percentage) / 100 || 0;
    }
    if (discount > subTotal || discount == subTotal) {
      serviceCharge = 0;
    }
    if (subTotal < 0) {
      subTotal = 0;
    }
    if (serviceCharge < 0) {
      serviceCharge = 0;
    }
    let flag = false;
    subTotal += serviceCharge - NOGSTTOTL;
    if (subTotal < 0) {
      flag = true;
    }

    let copy = subTotal;
    let Total: number = 0;
    let newSubTotal = 0;
    if (flag) {
      newSubTotal = serviceCharge;
    } else {
      newSubTotal = subTotal;
    }
    let GST = newSubTotal * 0.05;

    let SGST = GST / 2;
    let CGST = SGST;
    if (SGST < 0) {
      SGST = 0;
      CGST = 0;
    }
    subTotal += SGST + CGST + totalTips;
    Total = Math.round(subTotal + NOGSTTOTL);

    let obj: any = {
      subTotal: copySubtotal,
      discount,
      SGST: Number(SGST?.toFixed(2)),
      CGST: Number(CGST?.toFixed(2)),
      Total,
      kots,

      customerName,
      customerPhone,
      claimedAmount,
    };

    if (hasServiceCharge && !serviceChargeApply && serviceCharge > 0) {
      obj["serviceCharge"] = Number(serviceCharge?.toFixed(2));
    }

    if (totalTips > 0) {
      obj["tips"] = totalTips;
    }
    existingKOTs.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    existingKOTs.push(obj);

    merged.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    merged.push(obj);
    if (merged?.length == 2) {
      return res.status(200).send([]);
    }

    const currentTime = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      hour: "2-digit" as const,
      minute: "2-digit" as const,
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const time = formatter.format(currentTime);
    let billObj = {
      tableId,
      businessId,
      zoneId,
      time: time,
      date: currentDateAndTime,
      bill: existingKOTs,
    };

    let saveData = new UserBill(billObj);
    let bill = await saveData.save();

    return res.send({ billId: bill?._id });
  }
);

router.put(
  "/v1/kitchens/:id/applyMode",
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { tableId, mode } = req.body || {};
      if (!mode || !tableId) {
        return res.status(400).send(" mode and tableId required");
      }

      const updateMode = await TempModel.findOneAndUpdate(
        { tableId: tableId },
        { $set: { mode } },
        { upsert: true, new: true }
      );
      return res.send(updateMode);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/kitchens/:id/applyDues",
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { tableId, duesPersonId, customerName, customerPhone } =
        req.body || {};
      if (!duesPersonId || !tableId || !customerName) {
        return res
          .status(400)
          .send(" tableId,duesPersonId and customerName required");
      }

      const updateDues = await TempModel.findOneAndUpdate(
        { tableId: tableId },
        { $set: { duesPersonId, customerName, customerPhone } },
        { upsert: true, new: true }
      );
      return res.send(updateDues);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as updateKitchenRouter };
