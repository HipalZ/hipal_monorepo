import { connectDB } from '@hi/utils';
import dotenv from 'dotenv';
import { app } from './app';

dotenv.config();
const start = async () => {
  await connectDB();

  await connectDB();
  app.listen(3006, () => {
    console.log('Listening on port 3006!!');
  });
};

start();
