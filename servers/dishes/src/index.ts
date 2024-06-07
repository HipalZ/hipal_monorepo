import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app } from './app';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Event consumers

const start = async () => {
  // if (!process.env.JWT_KEY) {
  //   throw new Error('JWT_KEY must be defined');
  // }

  // if (!process.env.MONGO_URI) {
  //   throw new Error('MONGO_URI must be defined');
  // }

  // if (!process.env.NATS_CLIENT_ID) {
  //   throw new Error('NATS_CLIENT_ID must be defined');
  // }

  // if (!process.env.NATS_URL) {
  //   throw new Error('NATS_URL must be defined');
  // }

  // if (!process.env.NATS_CLUSTER_ID) {
  //   throw new Error('NATS_CLUSTER_ID must be defined');
  // }

  // if (!process.env.REDIS_HOST) {
  //   throw new Error('REDIS_HOST must be defined');
  // }

  // await natsWrapper.connect(
  //   process.env.NATS_CLUSTER_ID,
  //   process.env.NATS_CLIENT_ID,
  //   process.env.NATS_URL
  // );

  await mongoose.connect(process.env.MONGO_URL as string);
  console.log('connected to mongodb');

  // if (process.env.NODE_ENV === 'production') {
  //   // implement any production recommendations
  // } else {
  //   process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // }

  app.listen(3003, () => {
    console.log('Listening on port 3003!!');
  });
};

start();
