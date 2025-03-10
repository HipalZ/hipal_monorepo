import { Hono } from "hono";
import roomBookRouter from "./book";
import restaurantRouter from "./restaurant";
import roomRouter from "./rooms";
import serviceRouter from "./service";
import staffRouter from "./staff";
import zoneRouter from "./zones";

const hotelRouter = new Hono()
  .route("/zones", zoneRouter)
  .route("/rooms", roomRouter)
  .route("/staff", staffRouter)
  .route("/restaurant", restaurantRouter)
  .route("/service", serviceRouter)
  .route("/book", roomBookRouter);

export default hotelRouter;
