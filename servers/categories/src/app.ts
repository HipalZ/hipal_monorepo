import express from "express";
import cors from "cors";
import "express-async-errors"; // Do not remove, it deals with async errors in express routes
import { json, urlencoded } from "body-parser";
import cookieSession from "cookie-session";

import { idempotent } from "./middleware/idempotent";

// Routes
import { createCategoryRouter } from "./routes/create-category";
import { readCategoriesRouter } from "./routes/read-category";
import { updateCategoriesRouter } from "./routes/update-category";
import { deleteCategoriesRouter } from "./routes/delete-category";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", true); // * traffic received from ingress
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://admin.hipal.life",
      "https://biz.hipal.life",
      "https://api.hipal.life",
      "https://dev.admin.hipal.life",
      "https://dev.biz.hipal.life",
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

app.use(idempotent);

// Register routes
app.use(createCategoryRouter);
app.use(readCategoriesRouter);
app.use(updateCategoriesRouter);
app.use(deleteCategoriesRouter);

export { app };
