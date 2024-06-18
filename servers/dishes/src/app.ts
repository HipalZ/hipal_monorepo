import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes
import morgan from 'morgan';
import { idempotent } from './middleware/idempotent';

// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import { createDishRouter } from './routes/create-dish';
import { deleteDishesRouter } from './routes/delete-dish';
import { readDishesRouter } from './routes/read-dish';
import { updateDishesRouter } from './routes/update-dish';

const app = express();
app.use(morgan('dev'));
app.disable('x-powered-by');
app.set('trust proxy', true); // * traffic received from ingress
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
      'http://localhost:3002',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3009',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3011',
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with'],
  }),
);
app.use(
  cookieSession({
    signed: false,
    secure: true,
    sameSite: 'none',
  }),
);

app.use(idempotent);
app.use(errorHandler);
app.use(authTokenValidator);

// Register routes
app.use(createDishRouter);
app.use(readDishesRouter);
app.use(updateDishesRouter);
app.use(deleteDishesRouter);

app.all('*', () => {
  return 'Route not found';
});

// workers node
// master node

export { app };
