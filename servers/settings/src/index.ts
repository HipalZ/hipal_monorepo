import '@hi/utils/src/env';

import { connectDB } from '@hi/utils';
import dotenv from 'dotenv';
import { app } from './app';
dotenv.config();

const start = async () => {
  await connectDB();

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

start();
