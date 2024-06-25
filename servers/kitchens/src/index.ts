import '@hi/utils/src/env';

import { connectDB } from '@hi/utils';
import dotenv from 'dotenv';
import { app } from './app';
import { razorpayWrapper } from './razorpay-wrapper';
dotenv.config();

const start = async () => {
  await connectDB();
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error('RAZORPAY_KEY_ID must be defined');
  }

  if (!process.env.RAZORPAY_SECRET) {
    throw new Error('RAZORPAY_SECRET must be defined');
  }

  razorpayWrapper.create(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_SECRET);

  app.listen(+(process.env.PORT ?? 4500), '0.0.0.0', () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

start();
