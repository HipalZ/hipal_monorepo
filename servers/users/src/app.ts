import cookieSession from 'cookie-session';
import cors from 'cors';
import express, { NextFunction } from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes

// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import { Request, Response } from 'express';
import morgan from 'morgan';
import { createUserRouter } from './routes/create-user';
import { readUserRouter } from './routes/read-user';
import { updateUserRouter } from './routes/update-user';

const app = express();
app.disable('x-powered-by');
app.use(morgan('dev'));
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
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3009',
      'http://localhost:3011',
      'http://localhost:3002',
      'http://localhost:3005',
      'http://localhost:3001',
      'https://api.test.hipalz.com',
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

// Define a list of routes to exclude from authTokenValidator
const excludedPaths = [
  '/v1/users/waiterLogin',
  '/v1/users/chef/Login',
  '/v1/users/Owner/Login',
  '/v1/businesses/get/allbusiness',
  '/v1/users/:id/signIn',
  '/v1/users/:id/stafflogin',
  '/v1/users/:id/signUp',
  '/v1/users/:businessId/getUserReward',
]; // Add more paths as needed

// Conditional middleware to exclude authTokenValidator on certain routes
const conditionalAuthTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!excludedPaths.includes(req.path)) {
    return authTokenValidator(req, res, next);
  }
  next();
};

// app.use(conditionalAuthTokenValidator);
// Register routes
app.use(createUserRouter);
app.use(readUserRouter);
app.use(updateUserRouter);

app.all('*', () => {
  throw new Error('Route not found');
});
app.use(errorHandler);
export { app };
