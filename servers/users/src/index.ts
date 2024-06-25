import '@hi/utils/src/env';

import { connectDB } from '@hi/utils';
import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const start = async () => {
  await connectDB();

  app.listen(+(process.env.PORT ?? 4500), '0.0.0.0', () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

start();
