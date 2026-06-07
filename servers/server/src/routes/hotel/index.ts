import { Hono } from "hono";
import hotelALertRouter from "./alert";
import hotelAlarmRouter from "./alarm";
import hotelAmenitiesRouter from "./amenities";
import roomBookRouter from "./book";
import roomTypeRouter from "./hotelRoomType";
import hotelServiceTemplateMappingRouter from "./hotelServiceTemplateMapping";
import reportRouter from "./report";
import restaurantRouter from "./restaurant";
import roomRouter from "./rooms";
import serviceRouter from "./service";
import staffRouter from "./staff";
import hotelStaffLevelRouter from "./staffLevel";
import whatsappRouter from "./whatsapp";
import zoneRouter from "./zones";

const hotelRouter = new Hono()
  .route("/zones", zoneRouter)
  .route("/alarm", hotelAlarmRouter)
  .route("/rooms", roomRouter)
  .route("/staff", staffRouter)
  .route("/staff_level", hotelStaffLevelRouter)
  .route("/restaurant", restaurantRouter)
  .route("/service", serviceRouter)
  .route("/book", roomBookRouter)
  .route("/amenities", hotelAmenitiesRouter)
  .route("/alert", hotelALertRouter)
  .route("/room_type", roomTypeRouter)
  .route("/report", reportRouter)
  .route("/hotel_service_template_mapping", hotelServiceTemplateMappingRouter)
  .route("/whats_app", whatsappRouter);

export default hotelRouter;
