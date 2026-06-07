import type { IUserData } from "@/components/store/useLogin";

export const hasGuestContactDetails = (userDetails?: Partial<IUserData> | null) => {
  const guestName = userDetails?.name?.trim() || "";
  const guestPhone = userDetails?.phone?.trim() || "";

  return Boolean(userDetails?._id && guestName.length > 1 && guestPhone.length >= 6);
};
