import { Hono } from "hono";
import templateRouter from "./template";

const hotelWhatsappRouter = new Hono().route("/templates", templateRouter);

export default hotelWhatsappRouter;
