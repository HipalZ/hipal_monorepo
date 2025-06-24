import axios from "axios";
const wsUrl = "http://localhost:3002";
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
