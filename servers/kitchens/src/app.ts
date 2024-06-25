import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes
import morgan from 'morgan';
// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import { idempotent } from './middlewares/idempotent';
import { createKitchenRouter } from './routes/create-kitchen';
import { readKitchenRouter } from './routes/read-kitchen';
import { updateKitchenRouter } from './routes/update-kitchen';
const app = express();
app.use(morgan('dev'));
app.disable('x-powered-by');
app.set('trust proxy', true); // * traffic received from ingres
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with'],
  }),
);
//
app.use(idempotent);

app.use(authTokenValidator);
// Register routes
app.use(createKitchenRouter);
app.use(readKitchenRouter);
app.use(updateKitchenRouter);

app.all('*', () => {
  throw new Error('Route not found');
});

app.use(errorHandler);

export { app };
