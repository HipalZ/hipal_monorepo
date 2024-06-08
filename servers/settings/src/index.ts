import { connectDB } from '@hi/utils';
import { app } from './app';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {

  await connectDB()
  app.listen(3006, () => {
    console.log('Listening on port 3006!!');
  });
};

start();
