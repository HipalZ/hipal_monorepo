import express from "express";
import cors from "cors";
import "express-async-errors"; // Do not remove, it deals with async errors in express routes
import { json, urlencoded } from "body-parser";
import { idempotent } from "./middlewares/idempotent";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@hipal/common";

// Routes
import { createKitchenRouter } from "./routes/create-kitchen";
import { readKitchenRouter } from "./routes/read-kitchen";
import { updateKitchenRouter } from "./routes/update-kitchen";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true); // * traffic received from ingres
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://admin.hipal.life",
      "https://biz.hipal.life",
      "https://dev.biz.hipal.life",
      "https://api.hipal.life",
      "https://storage.hipal.life",
      "https://dev.hipal.life",
      "https://hipal.life",
      "https://www.hipal.life",
      "http://localhost:3000",
      "https://hipal-hitable.vercel.app",
      "https://dev-hitable.vercel.app",
      "https://hitable.hipal.life",
      "https://pro.hipal.life",
      "https://hikitchen.hipal.life",
      "https://dev.pro.hipal.life",
      "https://dev.hitable.hipal.life",
      "https://dev.hikitchen.hipal.life",
      "https://dev.hibiz.hipal.life",
      "https://hibiz.hipal.life",
      "https://dev-kitchen.vercel.app",
      "https://hitable-dev-mode.vercel.app",
      "https://dev-pro.vercel.app",
      "https://hibiz-dev.vercel.app",
      "https://hipal-s91n.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "Cookie",
      "h-idem-id",
    ],
  })
);

app.use(
  cookieSession({
    signed: false,
    secure: true,
    sameSite: "none",
  })
);


// app.use(idempotent);
// Register routes
app.use(createKitchenRouter);
app.use(readKitchenRouter);
app.use(updateKitchenRouter);

app.all("*", () => {
  return "Not Found";
});

app.use(errorHandler);

export { app };
