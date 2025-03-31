import { Hono } from "hono";
import addonRouter from "./addons";
import adminRouter from "./admin";
import bucketRouter from "./bucket";
import businessRouter from "./businesses";
import cartRouter from "./cart";
import categoryRouter from "./categories";
import couponAnalytics from "./coupon-analytics";
import couponzRouter from "./couponz";
import dishesRouter from "./dishes";
import downloadRouter from "./download";
import duesRouter from "./dues";
import groupRouter from "./groups";
import hipalzRouter from "./hipalz";
import hotelRouter from "./hotel";
import iconRouter from "./icon";
import kotRouter from "./kot";
import menuBannerRouter from "./menu-banner";
import menuRouter from "./menu/menu";
import npcRouter from "./npc";
import paymentsRouter from "./payments";
import permissionRouter from "./permission";
import posRouter from "./pos";
import googleReview from "./reviews";
import scriptRouter from "./script";
import settingsRouter from "./settings";
import subsCriberRouter from "./subscribers";
import surlRouter from "./surl";
import tableRouter from "./table";
import tagRouter from "./tags";
import taxRouter from "./tax";
import upiModeRouter from "./upimode";
import usersRouter from "./users";
import whatsappRouter from "./whatsapp";
import whatsAppFlowRouter from "./whatsappflow";
import zonesAndTablesRouter from "./zonesAndTables";

////
const app = new Hono();
// ** import routes here & chain them **
/////////
export const routes = app

  .route("/businesses", businessRouter)
  .route("/dishes", dishesRouter)
  .route("/categories", categoryRouter)
  .route("/users", usersRouter)
  .route("/payments", paymentsRouter)
  .route("/settings", settingsRouter)
  .route("/addons", addonRouter)
  .route("/subscribers", subsCriberRouter)
  .route("/groups", groupRouter)
  .route("/tags", tagRouter)
  .route("/admin", adminRouter)
  .route("/couponz", couponzRouter)
  .route("/reviews", googleReview)
  .route("/coupon-analytics", couponAnalytics)
  .route("/hipalz", hipalzRouter)
  .route("/pos", posRouter)
  .route("/menu-banner", menuBannerRouter)
  .route("/whatsapp", whatsappRouter)
  .route("/cart", cartRouter)
  .route("/surl", surlRouter)
  .route("/zones_and_tables", zonesAndTablesRouter)
  .route("/icon", iconRouter)
  .route("/table", tableRouter)
  .route("/kot", kotRouter)
  .route("/upi_mode", upiModeRouter)
  .route("/dues", duesRouter)
  .route("/npc", npcRouter)
  .route("/permission", permissionRouter)
  .route("/tax", taxRouter)
  .route("/whatsapp_flow", whatsAppFlowRouter)
  .route("/script", scriptRouter)
  .route("/hotel", hotelRouter)
  .route("/download", downloadRouter)
  .route("/menu", menuRouter)
  .route("/bucket", bucketRouter);

export type AppType = typeof routes;
