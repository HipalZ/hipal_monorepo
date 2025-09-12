import { Hono } from "hono";
import checkInQrRouter from "./checkInQr";
import checkInQrUserRouter from "./checkInUser";

const qrRouter = new Hono()
  .route("/check_in_qrs", checkInQrRouter)
  .route("/check_in_users", checkInQrUserRouter);

export default qrRouter;
