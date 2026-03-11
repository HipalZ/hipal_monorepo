import { Hono } from "hono";
import addOnRouter from "./addOnReport";
import categoryRouter from "./category";
import discountRouter from "./discount";
import itemRouter from "./item";
import itemBySectionRouter from "./itemBySection";
import itemVariantRouter from "./itemVariant";
import serviceChargeRouter from "./serviceCharge";
import unifiedReportRouter from "./combineReport";
import deletedItemRouter from "./deletedItem";
import parentCategoryRouter from "./parentCategory";
import consolidateRouter from "./consolidate";

const reportRouter = new Hono()
  .route("/item", itemRouter)
  .route("/item_by_section", itemBySectionRouter)
  .route("/item_variant", itemVariantRouter)
  .route("/category", categoryRouter)
  .route("/parent_category", parentCategoryRouter)
  .route("/discount", discountRouter)
  .route("/add_on", addOnRouter)
  .route("/service_charge", serviceChargeRouter)
  .route("/combine", unifiedReportRouter)
  .route("/consolidate", consolidateRouter)
  .route("/deleted_items", deletedItemRouter);

export default reportRouter;
