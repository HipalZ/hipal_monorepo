import mongoose, { ConnectOptions } from 'mongoose';

const db_name = process.env.MONGO_DB;
const db_uri = process.env.MONGO_URI || `mongodb://localhost:27017/${db_name}`;

const options: ConnectOptions = {
  dbName: db_name,
};

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db_uri, options);

    conn.connection.on('connected', () => {
      console.log(`Mongoose connected to ${db_name} DB`);
    });

    conn.connection.on('error', (err: unknown) => {
      if (err instanceof Error) console.error(err.message);
    });
    conn.connection.on('reconnected', () => {
      console.log('mongodb reconnected');
    });

    conn.connection.on('disconnected', () => {
      console.error('Mongoose connection is disconnected.');
    });

    return conn;                             
  } catch (e) {
    console.error(e);
  }
};

export default connectDB;
export { connectDB };
export type ConnectMongo = typeof connectDB;
