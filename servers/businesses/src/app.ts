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
    origin: ['*'],
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // preflightContinue: true,
    // optionsSuccessStatus: 200,
    // credentials: true,
    // allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with'],
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
