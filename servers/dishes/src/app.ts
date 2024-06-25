import cookieSession from 'cookie-session';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
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
    origin: ['https://biz.test.hipalz.com', 'https://table.test.hipalz.com', 'https://kitchen.test.hipalz.com/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
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

const excludedPaths = ['/v1/dishes']; // Add more paths as needed

// Conditional middleware to exclude authTokenValidator on certain routes
const conditionalAuthTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!excludedPaths.includes(req.path)) {
    return authTokenValidator(req, res, next);
  }
  next();
};

app.use(conditionalAuthTokenValidator);

// Register routes
app.use(createDishRouter);
app.use(readDishesRouter);
app.use(updateDishesRouter);
app.use(deleteDishesRouter);

app.all('*', () => {
  throw new Error('Route not found');
});

app.use(errorHandler);

export { app };
