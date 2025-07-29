import axios from "axios";
const wsUrl = "https://ws.test.hipalz.com";
interface KOTPayload {
  tableName: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  cart: unknown[];
  kotId: string;
  posRestName?: string;
  acceptedBy: string;
  date: number;
  kotInvoiceNumber?: number;
}

interface DeleteKOTPayload {
  tableName: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  cart: unknown[];
  kotId: string;
  posRestName?: string;
  acceptedBy: string;
  deletedBy: string;
  date: number;
  kotInvoiceNumber?: number;
}

interface BillPayload {
  tableName: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  items: unknown[];
  posRestName?: string;
  generatedBy: string;
  date: number;
  serviceCharge: number;
  discount: number;
  tax: number;
  total: number;
  billRequestId: string;
  subTotal: number;
  tips: number;
  claimedCoins: number;
  couponDiscount: number;
  gst: string;
  fssai: string;
  address: string;
  billInvoiceNumber: number;
}

export const sendKOTPrintEvent = ({
  tableName,
  businessId,
  customerName,
  customerPhone,
  cart,
  acceptedBy,
  kotId,
  date,
  posRestName,
  kotInvoiceNumber,
}: KOTPayload): void => {
  axios
    .post(
      wsUrl,
      {
        event: `${businessId}_kot_print`,
        payload: {
          tableName,
          businessId,
          customerName,
          customerPhone,
          cart,
          acceptedBy,
          kotId,
          date,
          businessName: posRestName,
          kotInvoiceNumber,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .catch((error) => {
      console.error("KOT print event failed:", error);
    });
};

export const sendReKOTPrintEvent = ({
  tableName,
  businessId,
  customerName,
  customerPhone,
  cart,
  acceptedBy,
  kotId,
  date,
  posRestName,
  kotInvoiceNumber,
}: KOTPayload): void => {
  axios
    .post(
      wsUrl,
      {
        event: `${businessId}_re_kot_print`,
        payload: {
          tableName,
          businessId,
          customerName,
          customerPhone,
          cart,
          acceptedBy,
          kotId,
          date,
          businessName: posRestName,
          kotInvoiceNumber,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .catch((error) => {
      console.error("KOT print event failed:", error);
    });
};

export const deleteKOTPrintEvent = ({
  tableName,
  businessId,
  customerName,
  customerPhone,
  cart,
  deletedBy,
  acceptedBy,
  kotId,
  date,
  posRestName,
  kotInvoiceNumber,
}: DeleteKOTPayload): void => {
  axios
    .post(
      wsUrl,
      {
        event: `${businessId}_delete_kot_print`,
        payload: {
          tableName,
          businessId,
          customerName,
          customerPhone,
          cart,
          deletedBy,
          kotId,
          date,
          businessName: posRestName,
          acceptedBy,
          kotInvoiceNumber,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .catch((error) => {
      console.error("KOT print event failed:", error);
    });
};

export const sendBillPrintEvent = ({
  tableName,
  businessId,
  customerName,
  customerPhone,
  items,
  posRestName,
  generatedBy,
  date,
  serviceCharge,
  discount,
  tax,
  total,
  billRequestId,
  subTotal,
  tips,
  claimedCoins,
  couponDiscount,
  gst,
  fssai,
  address,
  billInvoiceNumber,
}: BillPayload): void => {
  axios
    .post(
      wsUrl,
      {
        event: `${businessId}_bill_print`,
        payload: {
          tableName,
          businessId,
          customerName,
          customerPhone,
          items,
          posRestName,
          generatedBy,
          date,
          serviceCharge,
          discount,
          tax,
          total,
          billRequestId,
          subTotal,
          tips,
          claimedCoins,
          couponDiscount,
          gst,
          fssai,
          address,
          billInvoiceNumber,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .catch((error) => {
      console.error("Bill print event failed:", error);
    });
};
