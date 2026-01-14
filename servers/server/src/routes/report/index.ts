import { Hono } from "hono";
import addOnRouter from "./addOnReport";
import categoryRouter from "./category";
import discountRouter from "./discount";
import itemRouter from "./item";
import itemVariantRouter from "./itemVariant";
import serviceChargeRouter from "./serviceCharge";
import unifiedReportRouter from "./combineReport";
import deletedItemRouter from "./deletedItem";

const reportRouter = new Hono()
  .route("/item", itemRouter)
  .route("/item_variant", itemVariantRouter)
  .route("/category", categoryRouter)
  .route("/discount", discountRouter)
  .route("/add_on", addOnRouter)
  .route("/service_charge", serviceChargeRouter)
  .route("/combine", unifiedReportRouter)
  .route("/deleted_items", deletedItemRouter);

export default reportRouter;
