import { Hono } from "hono";
import checkInQrRouter from "./checkIn";

const qrRouter = new Hono().route("/check_in", checkInQrRouter);

export default qrRouter;
