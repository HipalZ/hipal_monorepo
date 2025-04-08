import { Business } from '@hi/db-models';
import type { ClientSession } from 'mongoose';

export const updateBusinessCapacity = async (
  businessId: string,
  newCapacity: number,
  session?: ClientSession
) => {
  // Check if the business exists
  const business = await Business.findById(businessId).session(session || null);
  if (!business) {
    throw new Error(`Business with ID ${businessId} does not exist.`);
  }

  // Update the capacity field
  business.capacity = newCapacity;

  // Save the updated document (with an active session if provided)
  const updatedBusiness = await business.save({ session });
  return updatedBusiness;
};
