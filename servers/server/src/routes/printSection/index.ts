import {
  DeleteKotPrint,
  KotPrint,
  ReBillPrint,
  ReKotPrint,
} from "@hi/db-models";
import { Hono } from "hono";

const printSectionRouter = new Hono()
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
  });

export default printSectionRouter;
