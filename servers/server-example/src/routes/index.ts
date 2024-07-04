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
  .route(`/${api_version}/example`, exampleRouter)
  .route(`/${api_version}/businesses`, businessRouter)
  .route(`/${api_version}/dishes`, dishesRouter)
  .route(`/${api_version}/categories`, categoryRouter)
  .route(`/${api_version}/users`, usersRouter)
  .route(`/${api_version}/payments`, paymentsRouter)
  .route(`/${api_version}/settings`, settingsRouter);

export type AppType = typeof routes;
