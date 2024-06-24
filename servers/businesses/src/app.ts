import cookieSession from 'cookie-session';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes
import morgan from 'morgan';
// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import { createUserRouter } from './routes/create-business';
import { deleteBusinessesRouter } from './routes/delete-business';
import { readBusinessRouter } from './routes/read-business';
import { updateBusinessRouter } from './routes/update-business';

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
      'https://dev.admin.hipal.life',
      'https://dev.biz.hipal.life',
      'https://api.hipal.life',
      'https://storage.hipal.life',
      'https://dev.hipal.life',
      'https://hipal.life',
      'https://www.hipal.life',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3001',

      'http://localhost:3005',
      'http://localhost:3001',
      'http://localhost:3009',
      'http://localhost:3011',
      'http://localhost:3006',
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
// List of paths to exclude
const excludedPaths = [
  '/v1/businesses',
  '/v1/businesses/:id/loyalty',
  '/v1/businesses/get/allbusiness',
  '/v1/businesses/:id',
  '/v1/businesses/get/Single/:id',
]; // Add more paths as needed

// Convert paths with dynamic segments into regular expressions
const excludedPathRegexes = excludedPaths.map((path) => new RegExp('^' + path.replace(/:[^\s/]+/g, '([^\\s/]+)') + '$'));

// Conditional middleware to exclude authTokenValidator on certain routes or if the method is GET
const conditionalAuthTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  // Check if the request path matches any of the excluded path patterns or if the request method is GET
  const isExcludedPath = excludedPathRegexes.some((regex) => regex.test(req.path));

  if (isExcludedPath && req.method === 'GET') {
    return next();
  }

  // Call the authTokenValidator for other requests
  authTokenValidator(req, res, next);
};

app.use(conditionalAuthTokenValidator);

// Register routes
app.use(createUserRouter);
app.use(readBusinessRouter);
app.use(updateBusinessRouter);
app.use(deleteBusinessesRouter);

app.all('*', () => {
  return 'not found';
});

app.use(errorHandler);

export { app };
