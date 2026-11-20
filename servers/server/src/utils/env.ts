import { z } from "zod";
//
const envSchema = z.object({
  //   APP_DOMAIN: z.string(),
  //   APP_FRONTEND_DOMAIN: z.string(),
  BASE_URL: z.string(),

  // ** MONGO DB
  MONGO_URI: z.string(),
  MONGO_DB: z.string(),

  //   #JWT
  JWT_SECRET: z.string(),

  //#RAZORPAY_SECRET
  RAZORPAY_SECRET: z.string(),
  RAZORPAY_WEBHOOK_SECRET: z.string(),
  RAZORPAY_KEY_ID: z.string(),

  // ** PG DB
  //   PG_DB_HOST: z.string(),
  //   PG_DB_PORT: z.string(),
  //   PG_DB_USER: z.string(),
  //   PG_DB_PASS: z.string(),
  //   PG_DB_NAME: z.string(),

  // ** MQ
  //   MQ_URI: z.string(),
  //   ACTIVITY_LOG_QUEUE: z.string(),
  //   NOTIFICATION_QUEUE: z.string(),

  // ** REDIS
  REDIS_URL: z.string().optional(),

<<<<<<< HEAD
  // Firebase Admin credentials are supplied as a base64-encoded JSON value.
  FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: z.string().min(1).optional(),
=======
  // Firebase Admin credentials are supplied by the deployment environment.
  FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: z.string().min(1).optional(),

  // Google OAuth credentials are supplied by the deployment environment.
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().url().optional(),
>>>>>>> d819756de (fix:firebase secret)
  // REDIS_PASSWORD: z.string(),
  // REDIS_PORT: z.string(),

  // ** GENERAL
  PORT: z.string(),
  NODE_ENV: z.string(),
  APP_VERSION: z.string(),
  APP_NAME: z.string(),
  TIMEOUT: z.string(),

  // API_VERSION
  API_VERSION: z.string(),
  // * SESSION
  //   JWT_SECRET: z.string(),
  //   JWT_EXPIRES_IN: z.string(),

  //** AWS */
  //   AWS_ACCESS_KEY_ID: z.string(),
  //   AWS_SECRET_ACCESS_KEY: z.string(),
  //   AWS_REGION_NAME: z.string(),
  //   AWS_BUCKET_NAME: z.string(),
  //   AWS_ARN: z.string(),

  // ** GCP
  //   GOOGLE_MAPS_API_KEY: z.string(),
});

envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Omit<z.infer<typeof envSchema>, "NODE_ENV"> {
      NODE_ENV: "development" | "production" | "test";
    }
  }
}
