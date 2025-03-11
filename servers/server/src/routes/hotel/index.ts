import { Hono } from "hono";
import hotelALertRouter from "./alert";
import hotelAmenitiesRouter from "./amenities";
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
  .route("/book", roomBookRouter)
  .route("/amenities", hotelAmenitiesRouter)
  .route("/alert", hotelALertRouter);

export default hotelRouter;
