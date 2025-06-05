import { Hono } from "hono";
import checkInQrRouter from "./checkIn";
import checkInQrUserRouter from "./checkInUser";

const qrRouter = new Hono()
  .route("/check_in", checkInQrRouter)
  .route("/check_in_user", checkInQrUserRouter);

export default qrRouter;
