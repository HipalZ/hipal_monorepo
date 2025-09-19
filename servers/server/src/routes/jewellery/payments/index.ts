import { Hono } from "hono";
import alertRouter from "./alert";
import billRouter from "./bill";
import dashboardRouter from "./dashboard";
import discountRouter from "./discount";
import duesRouter from "./dues";
import npcRouter from "./npc";
import orderRouter from "./order";
import upiModeRouter from "./upiMode";
import webhookRouter from "./webhook";

const paymentsRouter = new Hono()
  .route("/dash_boards", dashboardRouter)
  .route("/bills", billRouter)
  .route("/dues", duesRouter)
  .route("/npcs", npcRouter)
  .route("/upi_modes", upiModeRouter)
  .route("/alerts", alertRouter)
  .route("/orders", orderRouter)
  .route("/discounts", discountRouter)
  .route("/webhooks", webhookRouter);

export default paymentsRouter;
