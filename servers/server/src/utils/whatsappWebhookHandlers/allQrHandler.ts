import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import { checkInQrHandler } from "./checkInQr";
import { couponQrHandler } from "./couponQr";
import { roomQrHandler } from "./roomQr";
import { tableQrHandler } from "./tableQr";

const qrHandlers: Record<
  string,
  (
    value: string,
    userPhone: string,
    userId: string,
    userName: string,
    whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  ) => Promise<unknown>
> = {
  TABLE_QR: (value, userPhone, userId, userName, whatsAppBusinessConfigData) =>
    tableQrHandler(value, userPhone, userId, whatsAppBusinessConfigData),

  ROOM_QR: (value, userPhone, userId, userName, whatsAppBusinessConfigData) =>
    roomQrHandler(
      value,
      userPhone,
      userId,
      userName,
      whatsAppBusinessConfigData,
    ),

  CHECK_IN_QR: (
    value,
    userPhone,
    userId,
    userName,
    whatsAppBusinessConfigData,
  ) => checkInQrHandler(value, userPhone, userId, whatsAppBusinessConfigData),

  COUPON_QR: (value, userPhone, userId, userName, whatsAppBusinessConfigData) =>
    couponQrHandler(value, userPhone, userId, whatsAppBusinessConfigData),
};

export { qrHandlers };
