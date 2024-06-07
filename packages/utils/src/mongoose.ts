import mongoose, { ClientSession } from 'mongoose';

type TransactionCallback = (session: ClientSession) => Promise<void>;

export const runInTransaction = async (callback: TransactionCallback) => {
  const session: ClientSession = await mongoose.startSession();

  session.startTransaction();

  try {
    await callback(session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    throw error;
  } finally {
    session.endSession();
  }
};
