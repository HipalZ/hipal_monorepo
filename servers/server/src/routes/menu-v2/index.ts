/**
 * Menu V2 Router
 *
 * Main router for Menu V2 offline-first bulk operations.
 */

import { Hono } from "hono";
import bulkRouter from "./bulk";

const menuV2Router = new Hono().route("/bulk", bulkRouter);

export default menuV2Router;
