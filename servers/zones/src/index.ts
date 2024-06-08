import dotenv from 'dotenv';
import { app } from './app';
import { connectDB } from '@hi/utils';
dotenv.config();

const start = async () => {

  await connectDB()
  app.listen(3008, () => {
    console.log('Listening on port 3008!!');
  });
};

start();
