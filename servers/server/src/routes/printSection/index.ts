import {
  BusinessPosConfig,
  DeleteKotPrint,
  KotOrder,
  KotPrint,
  KotPrintCount,
  ReBillPrint,
  ReKotPrint,
  User,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { sendKOTPrintEvent } from "../../utils/kot";
import { endOfToday, startOfToday } from "../payments";

const printSectionRouter = new Hono()

  .get(
    "/kot_print_queue",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(50),
      }),
    ),

    async (c) => {
      const { businessId } = await c.req.query();
      const fromDate = startOfToday.getTime();
      const toDate = endOfToday.getTime();
      const kotOrders = await KotOrder.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
        kotPrintStatus: {
          $in: ["IN_PROGRESS", "FAILED"],
        },
      });

      return c.json({
        message: "kot print",
        data: kotOrders,
        err: false,
      });
    },
  )

  .get(
    "/kot_print_queue_history",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(50),
      }),
    ),

    async (c) => {
      const { businessId } = await c.req.query();
      const fromDate = startOfToday.getTime();
      const toDate = endOfToday.getTime();
      const kotOrders = await KotOrder.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
        kotPrintStatus: {
          $in: ["COMPLETED"],
        },
      });

      return c.json({
        message: "kot print",
        data: kotOrders,
        err: false,
      });
    },
  )
  .post(
    "/add_kotId",

    async (c) => {
      const { kotId, kitchenId } = await c.req.json();

      const saveKotId = new KotPrint({
        kotId,
        kitchenId,
      });
      await saveKotId.save();
      return c.json({
        message: "kotId saved",
        data: {},
        err: false,
      });
    },
  )

  .post(
    "/fetch_kotId",

    async (c) => {
      const { kotId, kitchenId } = await c.req.json();

      const fetchKotId = await KotPrint.findOne({ kotId, kitchenId });
      return c.json({
        message: "fetch kotId",
        data: fetchKotId,
        err: false,
      });
    },
  )

  .post(
    "/add_re_print_kotId",

    async (c) => {
      const { kotId, kitchenId } = await c.req.json();

      await ReKotPrint.findOneAndUpdate(
        { kotId, kitchenId },
        { $inc: { kotPrintCount: 1 } },
        { upsert: true, new: true },
      );
      return c.json({
        message: "re kotId saved",
        data: {},
        err: false,
      });
    },
  )

  .post("/fetch_re_kotId", async (c) => {
    const { kotId, kitchenId } = await c.req.json();
    const fetchReKotId = await ReKotPrint.findOne({
      kotId,
      kitchenId,
    });
    return c.json({
      message: "fetch re kotId",
      data: fetchReKotId,
      err: false,
    });
  })

  .post(
    "/add_delete_itemId",

    async (c) => {
      const { itemId } = await c.req.json();

      const saveDeleteItemId = new DeleteKotPrint({
        itemId,
      });

      await saveDeleteItemId.save();
      return c.json({
        message: "delete itemId saved",
        data: {},
        err: false,
      });
    },
  )

  .post("/fetch_delete_itemId", async (c) => {
    const { itemId } = await c.req.json();
    const fetchDeleteItemId = await DeleteKotPrint.findOne({
      itemId,
    });
    return c.json({
      message: "fetch delete itemId",
      data: fetchDeleteItemId,
      err: false,
    });
  })

  .post(
    "/add_re_billId",

    async (c) => {
      const { billId } = await c.req.json();
      await ReBillPrint.findOneAndUpdate(
        { billId },
        { $inc: { billPrintCount: 1 } },
        { upsert: true, new: true },
      );

      return c.json({
        message: "re billId saved",
        data: {},
        err: false,
      });
    },
  )

  .post("/fetch_re_billId", async (c) => {
    const { billId } = await c.req.json();
    const fetchReBillId = await ReBillPrint.findOne({
      billId,
    });
    return c.json({
      message: "fetch re billId",
      data: fetchReBillId,
      err: false,
    });
  })

  .post("/failed_kot_print", async (c) => {
    const { kotId, status, kitchenId } = await c.req.json();

    await KotPrintCount.findOneAndUpdate(
      { kotId },
      { $inc: { kotIdCount: 1 } },
      { upsert: true, new: true },
    );

    if (status) {
      await KotOrder.findOneAndUpdate(
        { _id: kotId },
        { kotPrintStatus: "COMPLETED", kotPrintRetryCount: 1 },
        { new: true },
      );
      return c.json({
        message: "kot print",
        data: {},
        err: false,
      });
    }

    const kotCountData = await KotPrintCount.findOne({ kotId });

    if (!kotCountData) {
      return c.json({
        message: "kot print",
        data: {},
        err: false,
      });
    }
    if (kotCountData.kotIdCount < 2) {
      if (!status) {
        const kotData = await KotOrder.findById(kotId);

        if (!kotData) {
          return c.json({
            message: "kot print",
            data: {},
            err: false,
          });
        }

        const userData = await User.findById(kotData.userId);

        const pos = await BusinessPosConfig.findOne({
          businessId: kotData.businessId,
          isDeleted: false,
          active: true,
        });

        await KotOrder.findOneAndUpdate(
          { _id: kotId },
          {
            kotPrintStatus: "FAILED",
            kotPrintRetryCount: kotCountData.kotIdCount + 1,
          },
          { new: true, upsert: true },
        );
        sendKOTPrintEvent({
          tableName: kotData?.tableName as string,
          businessId: kotData.businessId,
          customerName: (userData?.name as string) || "guest",
          customerPhone: (userData?.phone as string) || "1111111111",
          cart: kotData.cart,
          acceptedBy: (userData?.name as string) || "guest",
          kotId: kotData._id.toString(),
          date: kotData.date || Date.now(),
          posRestName: pos?.restName,
          kotInvoiceNumber: kotData?.kotInvoiceNumber,
        });

        return c.json({
          message: "kot print",
          data: {},
          err: false,
        });
      }
    }

    return c.json({
      message: "kot print",
      data: {},
      err: false,
    });
  });

export default printSectionRouter;
