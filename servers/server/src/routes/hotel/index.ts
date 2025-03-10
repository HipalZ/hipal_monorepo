import { Hono } from "hono";
import restaurantRouter from "./restaurant";
import roomRouter from "./rooms";
import staffRouter from "./staff";
import zoneRouter from "./zones";

const hotelRouter = new Hono()
  .route("/zones", zoneRouter)
  .route("/rooms", roomRouter)
  .route("/staff", staffRouter)
  .route("/restaurant", restaurantRouter);

export default hotelRouter;
