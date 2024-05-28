import mongoose from "mongoose";

interface Item {
  name: string;
  quantity: number;
  amount: number;
  portions: any;
  extras: any;
  comments: string;
}

interface SwiggyBillObj {
  totalItems: number;
  subTotal: number;
  packingCharges: number;
  RxPayableGST: number;
  swiggyPayableGST: number;
  discount: number;
  totalPrice: number;
}

interface PaymentAttrs {
  businessId: string;
  businessName: string;
  address: string;
  gstin: string;
  date: string;
  items: Item[];
  subTotal: number;
  sgst: number;
  cgst: number;
  total: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  discount: number;
  mode?: string;
  status?: string;
  merchantId?: string;
  reqData?: string;
  postURL?: string;
  paymentMode?: string;
  respMsg?: string;
  bankRefId?: string;
  pgRefId?: string;
  tranStatus?: string;
  respCode?: string;
  zoneId: string;
  tableId: string;
  paymentDate: string;
  time: string;
  tableName: string;
  modeCommission: number;
  duesPersonId: string;
  settle: boolean;
  logo: string;
  discountDescription: string;
  claimedAmount: number;
  serviceCharge: number;
  modeBreakDown: Object;
  otherCharges: Object;
  waiterName: string;
  tips: number;
  zoneType: string;
  isEdit: boolean;
  editedBy: string;
  orderId: string;
  swiggyBillObj: SwiggyBillObj;
  payment_date: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Object;
  razorpayEventId?: string;
  serviceChargeRemovedBy: string;
  serviceChargeAddedBy: string;
  coinsGivenBy: string;
  discountGivenBy: string;
  discountRemovedBy: string;
  tipsGivenBy: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

interface PaymentDoc extends mongoose.Document {
  businessId: string;
  businessName: string;
  address: string;
  gstin: string;
  date: string;
  items: Item[];
  subTotal: number;
  sgst: number;
  cgst: number;
  total: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  discount: number;
  mode?: string;
  status?: string;
  merchantId?: string;
  reqData?: string;
  postURL?: string;
  paymentMode?: string;
  respMsg?: string;
  bankRefId?: string;
  pgRefId?: string;
  tranStatus?: string;
  respCode?: string;
  zoneId: string;
  tableId: string;
  paymentDate: string;
  time: string;
  tableName: string;
  modeCommission: number;
  duesPersonId: string;
  settle: boolean;
  logo: string;
  discountDescription: string;
  claimedAmount: number;
  serviceCharge: number;
  modeBreakDown: Object;
  otherCharges: Object;
  waiterName: string;
  tips: number;
  zoneType: string;
  isEdit: boolean;
  editedBy: string;
  orderId: string;
  swiggyBillObj: SwiggyBillObj;
  payment_date: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpayAcquirerData: Object;
  razorpayEventId?: string;
  serviceChargeRemovedBy: string;
  serviceChargeAddedBy: string;
  coinsGivenBy: string;
  discountGivenBy: string;
  discountRemovedBy: string;
  tipsGivenBy: string;
}

const paymentSchema = new mongoose.Schema(
  {
    businessId: {
      required: false,
      type: String,
      index: true,
    },
    businessName: {
      required: false,
      type: String,
    },
    address: {
      required: false,
      type: String,
    },
    gstin: {
      required: false,
      type: String,
    },
    date: {
      required: false,
      type: String,
    },
    items: {
      required: false,
      type: [Object],
    },
    subTotal: {
      required: false,
      type: Number,
    },
    sgst: {
      required: false,
      type: Number,
    },
    cgst: {
      required: false,
      type: Number,
    },
    total: {
      required: false,
      type: Number,
    },
    customerId: {
      required: false,
      type: String,
    },
    customerName: {
      required: false,
      type: String,
    },
    customerPhone: {
      required: false,
      type: String,
    },
    discount: {
      required: false,
      type: Number,
    },
    mode: {
      required: false,
      type: String,
    },
    status: {
      required: false,
      type: String,
    },
    merchantId: {
      required: false,
      type: String,
    },
    reqData: {
      required: false,
      type: String,
    },
    postURL: {
      required: false,
      type: String,
    },
    paymentMode: {
      required: false,
      type: String,
    },
    respMsg: {
      required: false,
      type: String,
    },
    bankRefId: {
      required: false,
      type: String,
    },
    pgRefId: {
      required: false,
      type: String,
    },
    tranStatus: {
      required: false,
      type: String,
    },
    respCode: {
      required: false,
      type: String,
    },
    zoneId: {
      required: false,
      type: String,
    },
    tableId: {
      required: false,
      type: String,
    },
    paymentDate: String,
    time: String,
    tableName: String,
    modeCommission: {
      type: Number,
      default: 0,
    },
    modeBreakDown: {
      type: Object,
      default: null,
    },
    duesPersonId: String,
    settle: {
      type: Boolean,
      default: false,
    },
    logo: {
      type: String,
    },
    discountDescription: String,
    claimedAmount: Number,
    serviceCharge: {
      type: Number,
    },
    otherCharges: {
      type: Object,
      default: null,
    },
    waiterName: {
      type: String,
    },
    tips: {
      type: Number,
      default: 0,
    },
    zoneType: String,
    isEdit: {
      type: Boolean,
      default: false,
    },
    editedBy: {
      type: String,
    },
    orderId: String,
    swiggyBillObj: {
      type: Object,
      default: null,
    },
    payment_date: {
      type: Number,
      default: Date.now(),
    },
    razorpayPaymentId: {
      type: String,
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayAcquirerData: {
      type: Object,
    },
    razorpayEventId: {
      type: String,
    },
    serviceChargeRemovedBy: {
      type: String,
    },
    serviceChargeAddedBy: {
      type: String,
    },
    coinsGivenBy: {
      type: String,
    },
    discountGivenBy: {
      type: String,
    },
    discountRemovedBy: {
      type: String,
    },
    tipsGivenBy: {
      type: String,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel, {}>(
  "Review",
  paymentSchema
);

export { Payment };
