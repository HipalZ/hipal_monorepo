import { Hono } from "hono";
import categoryRouter from "./categoryReport";
import itemRouter from "./item";

const reportRouter = new Hono()
  .route("/item", itemRouter)
  .route("/category", categoryRouter);

export default reportRouter;
