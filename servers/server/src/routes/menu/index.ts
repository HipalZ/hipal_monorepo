import { Hono } from "hono";
import menuRouter from "./menu";

const menuRouters = new Hono().route("/", menuRouter);

export default menuRouters;
