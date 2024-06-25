import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes

import morgan from 'morgan';
// Routes
import { authTokenValidator, errorHandler } from '@hi/common';
import { createZoneRouter } from './routes/create-zone';
import { deleteZonesRouter } from './routes/delete-zone';
import { readZonesRouter } from './routes/read-zone';
import { updateZonesRouter } from './routes/update-zone';
//
const app = express();
app.use(morgan('dev'));
app.disable('x-powered-by');
app.set('trust proxy', true);
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
app.use(authTokenValidator);

// Register routes
app.use(createZoneRouter);
app.use(readZonesRouter);
app.use(updateZonesRouter);
app.use(deleteZonesRouter);

app.all('*', () => {
  throw new Error('Route not found');
});

app.use(errorHandler);

export { app };
