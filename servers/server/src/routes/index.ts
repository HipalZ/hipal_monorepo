import { Hono } from "hono";
import addonRouter from "./addons";
import adminRouter from "./admin";
import businessRouter from "./businesses";
import categoryRouter from "./categories";
import dishesRouter from "./dishes";
import groupRouter from "./groups";
import paymentsRouter from "./payments";
import settingsRouter from "./settings";
import subsCriberRouter from "./subscribers";
import tagRouter from "./tags";
import usersRouter from "./users";

///
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
  .route("/admin", adminRouter);

export type AppType = typeof routes;
