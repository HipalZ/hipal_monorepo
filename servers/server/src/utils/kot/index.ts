import axios from "axios";
import { nanoid } from "nanoid";
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

const cart = [
  {
    id: "684a95f07d23444458a813fc_no_portion_no_extras",
    dish: {
      posDishId: "153514050",

      isDeleted: false,
      name: "Icecream With Chocolate Syrup",
      portions: [],
      pos: true,
      price: 29,
      rank: 1,
      tags: [],
      updatedAt: "2025-08-04T05:49:35.658Z",
      visibility: true,
      active: true,
      kitchenId: "6849282eaed1b8c905c17346",
      tax: 5,
      gst: 5,
      vat: 0,
    },
    portion: null,
    extras: [],
    quantity: 1,
    isDeleted: false,
    discount: 0,
  },
];

interface OpenItemPayload {
  itemName: string;
  itemPrice: number;
  itemQuantity: number;
  kitchenId: string;
  gst?: number;
}

export const convertToHipalzCart = ({
  itemName,
  itemPrice,
  itemQuantity,
  kitchenId,
  gst = 5,
}: OpenItemPayload) => {
  const cart = [
    {
      id: nanoid(24),
      dish: {
        posDishId: nanoid(10),
        isDeleted: false,
        name: itemName,
        portions: [],
        pos: true,
        price: itemPrice,
        rank: 1,
        tags: [],
        kitchenId,
        visibility: true,
        active: true,
        gst: gst,
      },
      portion: null,
      extras: [],
      quantity: itemQuantity,
      isDeleted: false,
      discount: 0,
      isOpenItem: true,
    },
  ];

  return cart;
};
