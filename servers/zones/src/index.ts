import '@hi/utils/src/env';

import { connectDB } from '@hi/utils';
import dotenv from 'dotenv';
import { app } from './app';
dotenv.config();

const start = async () => {
  await connectDB();

  await connectDB();
  app.listen(3008, () => {
    console.log('Listening on port 3008!!');
  });
};

start();
