import { Hono } from "hono";
import exampleRouter from "./example";
import businessRouter from "./business";

const app = new Hono();
// ** import routes here & chain them **

export const routes = app
	.route("/example", exampleRouter)
	.route("/business", businessRouter);

export type AppType = typeof routes;
