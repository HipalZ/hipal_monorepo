import { BookingModel, Business } from "@hi/db-models";

/* getSlotBookings */
export const getSlotBookings = (businessId: string, date: Date, slot: string) =>
  BookingModel.find({
    businessId,
    bookingDate: date,
    slot,
    status: { $nin: ['cancelled', 'expired'] },
  });

/* calculateRemainingCapacity */
export const calculateRemainingCapacity = async (
  businessId: string,
  date: Date,
  slot: string,
) => {
  const biz = await Business.findById(businessId);
  if (!biz) throw new Error('Business missing');
  const used = (
    await getSlotBookings(businessId, date, slot)
  ).reduce((sum, b) => sum + b.numberOfGuests, 0);
  return biz.capacity - used;
};
