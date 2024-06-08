import '@hi/utils/src/env';

import { connectDB } from '@hi/utils';
import { app } from './app';

const start = async () => {
  await connectDB();

  app.listen(3007, () => {
    console.log('Listening on port 3007!!');
  });
};

start();
