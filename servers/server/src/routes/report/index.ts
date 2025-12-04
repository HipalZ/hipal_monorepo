import { Hono } from "hono";
import addOnRouter from "./addOnReport";
import categoryRouter from "./category";
import discountRouter from "./discount";
import itemRouter from "./item";
import serviceChargeRouter from "./serviceCharge";
import unifiedReportRouter from "./combineReport";

const reportRouter = new Hono()
  .route("/item", itemRouter)
  .route("/category", categoryRouter)
  .route("/discount", discountRouter)
  .route("/add_on", addOnRouter)
  .route("/service_charge", serviceChargeRouter)
  .route("/combine", unifiedReportRouter);

export default reportRouter;
