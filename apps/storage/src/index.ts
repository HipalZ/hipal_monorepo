import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  if (!process.env.MINIO_ROOT_USER) {
    throw new Error('MINIO_ROOT_USER must be defined');
  }

  if (!process.env.MINIO_ROOT_PASSWORD) {
    throw new Error('MINIO_ROOT_PASSWORD must be defined');
  }

  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID,
    process.env.NATS_CLIENT_ID,
    process.env.NATS_URL
  );

  natsWrapper.client.on('close', () => {
    console.log('NATS connection closed!');
    throw new Error('NATS CONNECTION CLOSED');
  });
  process.on('SIGINT', () => natsWrapper.client.close());
  process.on('SIGTERM', () => natsWrapper.client.close());

  if (process.env.NODE_ENV === 'production') {
    // implement any production recommendations
  } else {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!");
  });
};

start();
