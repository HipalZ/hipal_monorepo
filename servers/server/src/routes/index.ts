import { Hono } from "hono";
import addonRouter from "./addons";
import businessRouter from "./businesses";
import categoryRouter from "./categories";
import dishesRouter from "./dishes";
import groupRouter from "./group";
import paymentsRouter from "./payments";
import settingsRouter from "./settings";
import subsCriberRouter from "./subscribers";
import usersRouter from "./users";
//
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
  .route("/groups", groupRouter);

export type AppType = typeof routes;
