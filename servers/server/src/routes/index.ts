import { Hono } from 'hono';
import businessRouter from './businesses';
import categoryRouter from './categories';
import dishesRouter from './dishes';
import exampleRouter from './example';
import paymentsRouter from './payments';
import settingsRouter from './settings';
import usersRouter from './users';

const api_version = Bun.env.API_VERSION;
const app = new Hono();
// ** import routes here & chain them **

export const routes = app
  .route('/example', exampleRouter)
  .route('/businesses', businessRouter)
  .route('/dishes', dishesRouter)
  .route('/categories', categoryRouter)
  .route('/users', usersRouter)
  .route('/payments', paymentsRouter)
  .route('/settings', settingsRouter);

export type AppType = typeof routes;
