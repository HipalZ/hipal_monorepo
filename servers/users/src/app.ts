import 'express-async-errors'; // Do not remove, it deals with async errors in express routes

import { Request, Response } from 'express';
// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import express, { NextFunction } from 'express';

import cors from 'cors';
import morgan from 'morgan';
import { createUserRouter } from './routes/create-user';
import { readUserRouter } from './routes/read-user';
import { updateUserRouter } from './routes/update-user';

const app = express();
// app.disable('x-powered-by');
app.use(morgan('dev'));
app.set('trust proxy', true); // * traffic received from ingress
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    preflightContinue: true,
    origin: '*',
    allowedHeaders: ['Authorization', 'x-refresh-with'],
  }),
);
// app.use(
//   cookieSession({
//     signed: false,
//     secure: true,
//     sameSite: 'none',
//   }),
// );

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
