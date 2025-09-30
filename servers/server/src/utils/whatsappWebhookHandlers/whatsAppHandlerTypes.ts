export type QrType = "TABLE_QR" | "CHECK_IN_QR" | "COUPON_QR" | "ROOM_QR";
export type QrParseResult = {
  qrType: QrType;
  value: string;
  match: string;
} | null;
