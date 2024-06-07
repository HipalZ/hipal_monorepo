import { NotFoundError, currentUser, errorHandler } from '@hipal/common';
import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes

const { getStorageRouter } = require('./routes/get-file');
const { uploadStorageRouter } = require('./routes/store-file');
const { updateStorageRouter } = require('./routes/update-file');
const { deleteStorageRouter } = require('./routes/delete-file');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true); // * traffic received from ingress
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      'https://admin.hipal.life',
      'https://biz.hipal.life',
      'https://api.hipal.life',
      'https://dev.admin.hipal.life',
      'https://dev.biz.hipal.life',
      'https://storage.hipal.life',
      'https://dev.hipal.life',
      'https://hipal.life',
      'https://www.hipal.life',
      'http://localhost:3000',
      'https://hipal-hitable.vercel.app',
      'https://dev-hitable.vercel.app',
      'https://hitable.hipal.life',
      'https://pro.hipal.life',
      'https://hikitchen.hipal.life',
      'https://dev.pro.hipal.life',
      'https://dev.hitable.hipal.life',
      'https://dev.hikitchen.hipal.life',
      'https://dev.hibiz.hipal.life',
      'https://hibiz.hipal.life',
      'https://dev-kitchen.vercel.app',
      'https://hitable-dev-mode.vercel.app',
      'https://dev-pro.vercel.app',
      'https://hibiz-dev.vercel.app',
      'https://hipal-s91n.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  }),
);
app.use(currentUser);

app.use(getStorageRouter);
app.use(uploadStorageRouter);
app.use(updateStorageRouter);
app.use(deleteStorageRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
