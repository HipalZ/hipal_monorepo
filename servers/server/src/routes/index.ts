import { Hono } from "hono";
import addonRouter from "./addons";
import adminRouter from "./admin";
import businessRouter from "./businesses";
import cartRouter from "./cart";
import categoryRouter from "./categories";
import couponAnalytics from "./coupon-analytics";
import couponzRouter from "./couponz";
import dishesRouter from "./dishes";
import groupRouter from "./groups";
import hipalzRouter from "./hipalz";
import iconRouter from "./icon";
import menuBannerRouter from "./menu-banner";
import paymentsRouter from "./payments";
import posRouter from "./pos";
import googleReview from "./reviews";
import settingsRouter from "./settings";
import subsCriberRouter from "./subscribers";
import surlRouter from "./surl";
import tagRouter from "./tags";
import usersRouter from "./users";
import whatsappRouter from "./whatsapp";
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
  .route("/icon", iconRouter);

export type AppType = typeof routes;
