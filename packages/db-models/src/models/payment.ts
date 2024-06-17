import mongoose, { Model } from 'mongoose';
import { PaymentItemType, PaymentSwiggyBillObjType, PaymentType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId as any;

const paymentItemSchema = new mongoose.Schema<PaymentItemType>(
  {
    name: {
      required: true,
      type: String,
    },
    quantity: {
      required: true,
      type: Number,
    },
    amount: {
      required: true,
      type: Number,
    },
    portions: {
      required: false,
      type: Object,
    },
    extras: {
      required: false,
      type: Object,
    },
    category: {
      required: false,
      type: String,
    },
    comments: {
      required: false,
      type: String,
    },
  },
  { timestamps: true },
);

const paymentSwiggyBillObjSchema = new mongoose.Schema<PaymentSwiggyBillObjType>(
  {
    totalItems: {
      required: true,
      type: Number,
    },
    subTotal: {
      required: true,
      type: Number,
    },
    packingCharges: {
      required: true,
      type: Number,
    },
    RxPayableGST: {
      required: true,
      type: Number,
    },
    swiggyPayableGST: {
      required: true,
      type: Number,
    },
    discount: {
      required: true,
      type: Number,
    },
    totalPrice: {
      required: true,
      type: Number,
    },
  },
  { timestamps: true },
);

const paymentSchema = new mongoose.Schema<PaymentType>(
  {
    businessId: {
      required: false,
      type: ObjectId,
      index: true,
      ref: 'Business',
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
      type: [paymentItemSchema],
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
      type: paymentSwiggyBillObjSchema,
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
  { timestamps: true },
);

const Payment: Model<PaymentType> = mongoose.model<PaymentType>('Review', paymentSchema);

export { Payment };
