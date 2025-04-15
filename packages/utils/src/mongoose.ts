import mongoose, { type ClientSession } from "mongoose";

type TransactionCallback<T = void> = (session: ClientSession) => Promise<T>;

export const runInTransaction = async <T = void>(callback: TransactionCallback<T>): Promise<T> => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();
  try {
    const res = await callback(session);
    await session.commitTransaction();
    return res;
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw error;
  } finally {
    session.endSession();
  }
};
