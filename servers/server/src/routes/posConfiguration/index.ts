import { Hono } from "hono";
import cardPosConfigRouter from "./card";
import dishPosConfigRouter from "./dish";

const posConfigurationRouter = new Hono()
  .route("/dish", dishPosConfigRouter)
  .route("/card", cardPosConfigRouter);

export default posConfigurationRouter;
