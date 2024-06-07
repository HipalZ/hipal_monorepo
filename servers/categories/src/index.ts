import "@hi/utils/src/env"

import { app } from './app';
import { connectDB } from '@hi/utils';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const start = async () => {
  
  await connectDB()
 
  app.listen(3002, () => {
    console.log('Listening on port 3002!!');
  });
};

start();
