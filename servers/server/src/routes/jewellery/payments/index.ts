import { Hono } from "hono";
import alertRouter from "./alert";
import billRouter from "./bill";
import dashboardRouter from "./dashboard";
import duesRouter from "./dues";
import npcRouter from "./npc";
import upiModeRouter from "./upiMode";

const paymentsRouter = new Hono()
  .route("/dash_boards", dashboardRouter)
  .route("/bills", billRouter)
  .route("/dues", duesRouter)
  .route("/npcs", npcRouter)
  .route("/upi_modes", upiModeRouter)
  .route("/alerts", alertRouter);

export default paymentsRouter;
