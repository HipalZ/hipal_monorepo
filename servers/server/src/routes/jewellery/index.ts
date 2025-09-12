import { Hono } from "hono";
import cardRouter from "./cards";
import cataloguesRouter from "./catalogues";
import menuRouter from "./menus";
import paymentsRouter from "./payments";
import qrRouter from "./qrs";
import serviceRouter from "./services";
import tableRouter from "./tables";
import userRouter from "./users";
import zoneRouter from "./zones";

const jewelleryRouter = new Hono()
  .route("/users", userRouter)
  .route("/cards", cardRouter)
  .route("/tables", tableRouter)
  .route("/zones", zoneRouter)
  .route("/qrs", qrRouter)
  .route("/menus", menuRouter)
  .route("/services", serviceRouter)
  .route("/catalogues", cataloguesRouter)
  .route("/payments", paymentsRouter);

export default jewelleryRouter;
