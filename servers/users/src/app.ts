import { errorHandler } from '@hi/common';
import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import 'express-async-errors'; // Do not remove, it deals with async errors in express routes

// Routes
import { createUserRouter } from './routes/create-user';
import { readUserRouter } from './routes/read-user';
import { updateUserRouter } from './routes/update-user';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true); // * traffic received from ingress
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['https://biz.test.hipalz.com', 'https://table.test.hipalz.com', 'https://kitchen.test.hipalz.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 200,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Cookie', 'h-idem-id', 'x-refresh-with', 'X-refresh-with'],
  }),
);
// app.use(
//   cookieSession({
//     signed: false,
//     secure: false,
//     sameSite: 'none',
//   }),
// );

// Register routes
app.use(createUserRouter);
app.use(readUserRouter);
app.use(updateUserRouter);

app.all('*', () => {
  throw new Error('Route not found');
});

app.use(errorHandler);

export { app };
