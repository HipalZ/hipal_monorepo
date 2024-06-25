import cookieSession from 'cookie-session';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import morgan from 'morgan';
import { createSettingsRouter } from './routes/create-settings';
import { deleteSettingsRouter } from './routes/delete-settings';
import { readSettingsRouter } from './routes/read-settings';
import { updateSettingsRouter } from './routes/update-settings';

const app = express();
app.use(morgan('dev'));
app.disable('x-powered-by');
app.set('trust proxy', true); // * traffic received from ingress
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['*'],
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // preflightContinue: true,
    // optionsSuccessStatus: 200,
    // credentials: true,
    // allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with'],
  }),
);

const excludedPaths = ['/v1/settings']; // Add more paths as needed

// Conditional middleware to exclude authTokenValidator on certain routes
const conditionalAuthTokenValidator = (req: Request, res: Response, next: NextFunction) => {
  if (!excludedPaths.includes(req.path)) {
    return authTokenValidator(req, res, next);
  }
  next();
};

app.use(conditionalAuthTokenValidator);

// Register routes
app.use(createSettingsRouter);
app.use(readSettingsRouter);
app.use(updateSettingsRouter);
app.use(deleteSettingsRouter);

app.all('*', () => {
  throw new Error('Route not found');
});
app.use(errorHandler);
export { app };
