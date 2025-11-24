import { Hono } from "hono";
import addonRouter from "./addons";
import adminRouter from "./admin";
import staffAttendenceRouter from "./attendence";
import bucketRouter from "./bucket";
import businessRouter from "./businesses";
import cartRouter from "./cart";
import categoryRouter from "./categories";
import chatbotAnalyticsRouter from "./chatbotAnalyticsRouter";
import couponAnalytics from "./coupon-analytics";
import couponzRouter from "./couponz";
import dishesRouter from "./dishes";
import downloadRouter from "./download";
import duesRouter from "./dues";
import eventRouter from "./event";
import groupRouter from "./groups";
import hipalzRouter from "./hipalz";
import hotelRouter from "./hotel";
import iconRouter from "./icon";
import jewelleryRouter from "./jewellery";
import kdsRouter from "./kds";
import kitchenRouter from "./kitchen";
import kotRouter from "./kot";
import loyaltyRouter from "./loyalty";
import menuBannerRouter from "./menu-banner";
import menuRouter from "./menu/menu";
import npcRouter from "./npc";
import passwordManagerRouter from "./passwordManager";
import paymentsRouter from "./payments";
import permissionRouter from "./permission";
import posRouter from "./pos";
import posConfigurationRouter from "./posConfiguration";
import printSectionRouter from "./printSection";
import qrRouter from "./qrs";
import reportRouter from "./report";
import googleReview from "./reviews";
import scriptRouter from "./script";
import settingsRouter from "./settings";
import splitBillRouter from "./splitBill";
import subsCriberRouter from "./subscribers";
import syncPosMenuConfigRouter from "./suncPosMenuConfig";
import surlRouter from "./surl";
import tableRouter from "./table";
import tagRouter from "./tags";
import taxRouter from "./tax";
import upiModeRouter from "./upimode";
import usersRouter from "./users";
import whatsappRouter from "./whatsapp";
import whatsAppChatbotRouter from "./whatsappChatbot";
import whatsAppFlowRouter from "./whatsappflow";
import zonesAndTablesRouter from "./zonesAndTables";
import googleSheetsRouter from "./googleSheets";
import pathFinderRouter from "./pathFinder";
import tokenRouter from "./token";

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
  .route("/bucket", bucketRouter)
  .route("/event", eventRouter)
  .route("/pos_configuration", posConfigurationRouter)
  .route("/loyalty", loyaltyRouter)
  .route("/qrs", qrRouter)
  .route("/kitchen", kitchenRouter)
  .route("/password_manager", passwordManagerRouter)
  .route("/print_section", printSectionRouter)
  .route("/report", reportRouter)
  .route("/split_bill", splitBillRouter)
  .route("/jewellery", jewelleryRouter)
  .route("/attendence", staffAttendenceRouter)
  .route("/sync_pos_menu_config", syncPosMenuConfigRouter)
  .route("/kds", kdsRouter)
  .route("/wa_chatbot", whatsAppChatbotRouter)
  .route("/google_sheets", googleSheetsRouter)
  .route("/wa_chatbot_analytics", chatbotAnalyticsRouter)
  .route("/token", tokenRouter)
  .route("/path_finder", pathFinderRouter);

export type AppType = typeof routes;
