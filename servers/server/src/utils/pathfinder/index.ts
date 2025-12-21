import { Category } from "@hi/db-models";
import { calculateBillTotalsForBillItems } from "../bill";

const pad = (n) => n.toString().padStart(2, "0");

const formatDate = (d) => {
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const dateFormat = `${dd}-${mm}-${yyyy}`;
  return dateFormat;
};

const gategoryNameFromId = async (id: string) => {
  const gategoryData = await Category.findById(id);
  return gategoryData?.name ?? "Unknown";
};

export function startOfDayTimestamp(dateStr: string): number {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
}

// 23:59:59.999
export function endOfDayTimestamp(dateStr: string): number {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
}

const formatTime = (d) => {
  const date = new Date(d);
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${hh}-${mm}-${ss}`; // HHMMSS
};

const toMoney = (v, decimals = 2) =>
  (Number.isFinite(+v) ? +v : 0).toFixed(decimals);

// Transformer --------------------------------------------------------
const transformToIntegraFormat = async (payments) => {
  const LOCATION_CODE = "331670";
  const TERMINAL_ID = "01";
  const SHIFT_NO = "01";
  const OP_CUR = "INR";
  const EXCHANGE = 1;

  const Transactions = await Promise.all(
    payments.map(async (payment) => {
      const receiptNum = payment.billInvoice?.toString();
      const when =
        payment.createdAt?.$date || payment.createdAt || payment.date;
      const RCPT_DT = formatDate(when);
      const RCPT_TM = formatTime(when);

      const TRAN_STATUS = "SALES";
      const PAYMENT_STATUS = "SALES";
      const INV_AMT = +payment.total || 0;
      const TAX_AMT = +payment.tax || 0;
      const SERVICE_CHARGE_AMT = payment.serviceCharge || 0;
      const RET_AMT = 0;
      const DISCOUNT =
        payment.discount + payment.claimedCoins + payment.couponDiscount;
      const TIPS = payment.tips;

      const ItemDetail = await Promise.all(
        (payment.billItems || []).map(async (item) => {
          const { totalGst } = calculateBillTotalsForBillItems([item]);
          const itemTax = totalGst;
          const itemNet = 0;
          const itemCat = item?.dish?.categoryIds?.[0]
            ? await gategoryNameFromId(item.dish.categoryIds[0])
            : "Unknown";

          return {
            REC_TYPE: "G111",
            RCPT_NUM: receiptNum,
            RCPT_DT,
            ITEM_CODE: String(item.dish._id ?? ""),
            ITEM_NAME: String(item.dish.name),
            ITEM_QTY: toMoney(item.quantity ?? 0, 3),
            ITEM_PRICE: item.portion
              ? toMoney(item.portion.price, 2)
              : toMoney(item.dish.price, 2),

            ITEM_CAT: itemCat,
            ITEM_TAX: toMoney(itemTax, 6),
            ITEM_TAX_TYPE: "I",
            ITEM_NET_AMT: toMoney(itemNet, 2),
            OP_CUR,
            BC_EXCH: toMoney(EXCHANGE, 3),
            ITEM_STATUS: TRAN_STATUS,
            ITEM_DISCOUNT: toMoney(item.discount ?? 0, 2),
          };
        }),
      );

      const PaymentDetail = [
        {
          RCPT_NUM: receiptNum,
          RCPT_DT,
          PAYMENT_NAME: String(payment.mode?.toUpperCase() || "CASH"),
          CURRENCY_CODE: OP_CUR,
          EXCHANGE_RATE: toMoney(EXCHANGE, 3),
          TENDER_AMOUNT: toMoney(INV_AMT, 2),
          OP_CUR,
          BC_EXCH: toMoney(EXCHANGE, 3),
          PAYMENT_STATUS,
        },
      ];

      return {
        LOCATION_CODE,
        TERMINAL_ID,
        SHIFT_NO,
        RCPT_NUM: receiptNum,
        RCPT_DT,
        BUSINESS_DT: RCPT_DT,
        RCPT_TM,
        INV_AMT: toMoney(INV_AMT, 2),
        TAX_AMT: toMoney(TAX_AMT, 2),
        RET_AMT: toMoney(RET_AMT, 2),
        SERVICE_CHARGE_AMT: toMoney(SERVICE_CHARGE_AMT, 2),
        PACKAGING_AMT: "0.00",
        DELIVERY_AMT: "0.00",
        SALE_TYPE: "DINE-IN",
        TIPS_AMT: toMoney(TIPS, 2),

        TRAN_STATUS,
        OP_CUR,
        BC_EXCH: toMoney(EXCHANGE, 3),
        DISCOUNT: toMoney(DISCOUNT, 2),
        ItemDetail,
        PaymentDetail,
      };
    }),
  );

  return { Transactions };
};

export { transformToIntegraFormat };
