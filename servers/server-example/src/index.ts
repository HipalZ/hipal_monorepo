import { connectDB } from '@hi/utils';
import { redisClient } from '@hipal/server-instances';
import { RedisStore } from '@hono-rate-limiter/redis';
import { prometheus } from '@hono/prometheus';
import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timeout } from 'hono/timeout';
import { razorpayWrapper } from '../razorpay_wrapper';
import { routes } from './routes';
import { customTimeoutException } from './utils';
import './utils/env';

const app = new Hono({
  strict: true,
});

// Your MongoDB connection string

// export const connectToDatabase = async () => {
//   try {
//     await client.connect();
//     console.log('Connected to MongoDB');
//     return client.db(Bun.env.MONGO_DB); // Replace with your database name
//   } catch (error) {
//     console.error('Could not connect to MongoDB', error);
//     process.exit(1);
//   }
// };

if (!Bun.env.RAZORPAY_KEY_ID) {
  throw new Error('RAZORPAY_KEY_ID must be defined');
}

if (!Bun.env.RAZORPAY_SECRET) {
  throw new Error('RAZORPAY_SECRET must be defined');
}

razorpayWrapper.create(Bun.env.RAZORPAY_KEY_ID, Bun.env.RAZORPAY_SECRET);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => '<unique_key>',
  store: new RedisStore({ client: redisClient }),
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

const { printMetrics, registerMetrics } = prometheus();

app.use('*', registerMetrics);
app.get('/metrics', printMetrics);
app.use(timeout(+Bun.env.TIMEOUT, customTimeoutException));
app.use(secureHeaders());
app.use(prettyJSON());
app.use(cors());
app.use(csrf());
app.use(logger());
app.use('/assets/*', serveStatic({ path: './assets' }));
app.get('/ui', swaggerUI({ url: '/doc' }));
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));
const start = async () => {
  await connectDB();
};

start();
app.route('/', routes);

app.get('/', async (c) => {
  return c.text('Hello Hono!');
});

export default {
  port: Bun.env.PORT,
  fetch: app.fetch,
};

export { routes } from './routes';
