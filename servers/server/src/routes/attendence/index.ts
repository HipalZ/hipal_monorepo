import { Hono } from "hono";
import attendenceRouter from "./staff";

const staffAttendenceRouter = new Hono().route("/staff", attendenceRouter);

export default staffAttendenceRouter;
