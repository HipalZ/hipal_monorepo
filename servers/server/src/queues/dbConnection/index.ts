import mongoose, { type ConnectOptions } from "mongoose";
// import { BASE_URL } from '../base_url';

const MONGO_URI =
  "mongodb+srv://hipalz:ZYfCIKE6ke5FxJqx@cluster0.5qdkual.mongodb.net";
const MONGO_DB = "hipalz-test";

const options: ConnectOptions = {
  dbName: MONGO_DB,
};

mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, options);

    conn.connection.on("connected", () => {
      console.log(`Mongoose connected to ${MONGO_DB} DB`);
    });

    conn.connection.on("error", (err: unknown) => {
      if (err instanceof Error) console.error(err.message);
    });
    conn.connection.on("reconnected", () => {
      console.log("mongodb reconnected");
    });

    conn.connection.on("disconnected", () => {
      console.error("Mongoose connection is disconnected.");
    });

    return conn;
  } catch (e) {
    console.error(e);
  }
};

export default connectDB;
export { connectDB };
export type ConnectMongo = typeof connectDB;
