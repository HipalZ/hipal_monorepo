import express, { Request, Response } from 'express';

import { ClientRoles, requireAuthorization } from '@hi/common';
import {
  Dues,
  LoyaltyCoinsInfo,
  LoyaltySettings,
  Order,
  Payment,
  PaymentAlert,
  PaymentMode,
  Reviews,
  ReviewsCustomer,
  TempBill,
  UserReward,
  UserRewardHistory,
} from '@hi/db-models';
import {
  CustomerSchema,
  DuesSchema,
  orderSchema,
  PaymentAlertSchema,
  PaymentModeSchema,
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
  ReviewsSchema,
  validatePaymentSchema,
} from '@hi/db-models/src/validators';
import axios from 'axios';
import { createHmac } from 'crypto';

import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
import { nanoid } from 'nanoid';
const { validateWebhookSignature } = require('../utils/razorpay-utils');

import { TempBillSchema } from '@hi/db-models/src/validators/bill';
import { razorpayWrapper } from '../razorpay-wrapper';

const router = express.Router();

// router.post(
//   '/v1/payments',
//   validateRequest({
//     body: PaymentSchema,
//   }),
//   requireAuthorization([ClientRoles.HIPAL_CUSTOMER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_STAFF]),
//   async <T, K>(req: Request<T, K, z.infer<typeof PaymentSchema>>, res: Response) => {
//     try {
//       const {
//         businessId,
//         businessName,
//         address,
//         gstin,
//         items,
//         subTotal,
//         sgst,
//         cgst,
//         total,
//         customerId,
//         customerName,
//         customerPhone,
//         discount,
//         zoneId,
//         tableId,
//         paymentMode,
//         mode,
//         paymentDate,
//         time,
//         tableName,
//         modeCommission,
//         duesPersonId,
//         settle,
//         logo,
//         discountDescription,
//         claimedAmount,
//         serviceCharge,
//         modeBreakDown,
//         otherCharges,
//         waiterName,
//         tips,
//         zoneType,
//         isEdit,
//         editedBy,
//         orderId,
//         swiggyBillObj,
//         payment_date,
//         razorpayPaymentId,
//         razorpayOrderId,
//         razorpayAcquirerData,
//         serviceChargeRemovedBy,
//         serviceChargeAddedBy,
//         coinsGivenBy,
//         discountGivenBy,
//         discountRemovedBy,
//         tipsGivenBy,
//       } = req.body;

//       new Date().toISOString().replace('T', ' ').slice(0, 19);

//       const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD');

//       const payment = await Payment.create({
//         businessId,
//         businessName,
//         address,
//         gstin,
//         items,
//         date: dayAndDate,
//         subTotal,
//         sgst,
//         cgst,
//         total,
//         customerId,
//         customerName,
//         customerPhone,
//         discount,
//         zoneId,
//         tableId,
//         paymentMode,
//         mode,
//         paymentDate,
//         time,
//         tableName,
//         modeCommission,
//         duesPersonId,
//         settle,
//         logo,
//         discountDescription,
//         claimedAmount,
//         serviceCharge,
//         modeBreakDown,
//         otherCharges,
//         waiterName,
//         tips,
//         zoneType,
//         isEdit,
//         editedBy,
//         orderId,
//         swiggyBillObj,
//         payment_date,
//         razorpayPaymentId,
//         razorpayOrderId,
//         razorpayAcquirerData,
//         serviceChargeRemovedBy,
//         serviceChargeAddedBy,
//         coinsGivenBy,
//         discountGivenBy,
//         discountRemovedBy,
//         tipsGivenBy,
//       });

//       res.status(201).send({
//         err: false,
//         message: '',
//         data: payment,
//       });
//     } catch (err: any) {
//       console.log('error', err);
//       return res.status(500).send({ status: false, mes: err, data: {}, err: true });
//     }
//   },
// );

router.post(
  '/v1/payments/Create/Mode',
  requireAuthorization([ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: PaymentModeSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof PaymentModeSchema>>, res: Response) => {
    let { mode, businessId, commission } = req.body || {};

    let payment = await PaymentMode.findOne({ businessId, mode });
    if (payment) {
      return res.status(400).send({
        err: true,
        message: 'Mode Already exists...',
        data: {},
      });
    }

    payment = new PaymentMode({
      businessId,
      mode: mode,
      commission: commission,
    });

    const saveMode = await payment.save();
    return res.status(201).send({
      err: false,
      message: 'mode created successfully',
      data: saveMode,
    });
  },
);

router.post(
  '/v1/payments/Create/Dues',
  requireAuthorization([ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: DuesSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof DuesSchema>>, res: Response) => {
    let { duesPersonNames, businessId } = req.body || {};

    if (!duesPersonNames) {
      return res.status(400).send({
        err: true,
        message: 'Name is required',
        data: {},
      });
    }
    let dues = await Dues.findOne({
      businessId: businessId,
      duesPersonNames,
    });
    if (dues) {
      return res.status(400).send({
        err: true,
        message: 'Name Already exists...',
        data: {},
      });
    } else {
      dues = new Dues({ businessId, duesPersonNames: duesPersonNames });
    }

    const saveDues = await dues.save();
    return res.status(201).send({
      err: true,
      message: 'Dues created successfully',
      data: saveDues,
    });
  },
);

router.post(
  '/v1/payments/discountAlert',
  // currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),

  async (req: Request, res: Response) => {
    let body = req.body || {};

    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';
    // const day = momentTimeZone.tz("Asia/Kolkata").format("YYYY-MM-DD");

    await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `${body?.phone}`,
        type: 'template',
        template: {
          name: 'discount',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                // businessName
                {
                  type: 'text',
                  text: `${body?.businessName}`,
                },

                //tableName
                {
                  type: 'text',
                  text: `${body?.tableName}`,
                },
                //data&time
                {
                  type: 'date_time',
                  date_time: {
                    fallback_value: `${'day'}`,
                    day_of_week: 3,
                    day_of_month: 22,
                    year: 2023,
                    month: 11,
                    hour: 17,
                    minute: 59,
                  },
                },
                //billNumber
                {
                  type: 'text',
                  text: '10548',
                },
                //discountPercentage
                {
                  type: 'text',
                  text: `${body?.discountPercentage}`,
                },
                //discountReason
                {
                  type: 'text',
                  text: `${body?.discountReason}`,
                },
                //discountAmount
                {
                  type: 'currency',
                  currency: {
                    fallback_value: `${body?.discount * 1000}`,
                    code: 'INR',
                    amount_1000: body?.discount * 1000,
                  },
                },

                //waiterName
                {
                  type: 'text',
                  text: `${body?.waiterName}`,
                },
                //numbers of bills
                {
                  type: 'text',
                  text: '1',
                },

                // discount amount
                {
                  type: 'currency',
                  currency: {
                    fallback_value: `${body?.discount * 1000}`,
                    code: 'INR',
                    amount_1000: body?.discount * 1000,
                  },
                },
              ],
            },
          ],
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.status(200).send({
      err: false,
      message: 'discountAlert sent successfully',
      data: {},
    });
  },
);

router.post(
  '/v1/payments/saleAlert',
  // currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let body = req.body || {};
    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';

    let response = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `${body?.phone}`,
        type: 'template',
        template: {
          name: 'salealert',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                // businessName
                {
                  type: 'text',
                  text: `${body?.businessName}`,
                },
                {
                  type: 'text',
                  text: `${body?.date}`,
                },
                {
                  type: 'text',
                  text: `${body?.totalSale}`,
                },
                {
                  type: 'text',
                  text: `${body?.serviceCharge}`,
                },
                {
                  type: 'text',
                  text: `${body?.taxes}`,
                },

                {
                  type: 'text',
                  text: `${body?.dues}`,
                },

                {
                  type: 'text',
                  text: `${body?.dineInTotal}`,
                },
                {
                  type: 'text',
                  text: `${body?.takeAwayTotal}`,
                },
                {
                  type: 'text',
                  text: `${body?.deliveryTotal}`,
                },
                {
                  type: 'text',
                  text: `${body?.pos}`,
                },
                {
                  type: 'text',
                  text: `${body?.upi}`,
                },
                {
                  type: 'text',
                  text: `${body?.cash}`,
                },
                {
                  type: 'text',
                  text: `${body?.online}`,
                },
                {
                  type: 'text',
                  text: `${body?.card}`,
                },
                {
                  type: 'text',
                  text: `${body?.zomato}`,
                },
                {
                  type: 'text',
                  text: `${body?.swiggy}`,
                },
                //discountPercentage
                {
                  type: 'text',
                  text: `${body?.percentage}`,
                },
                {
                  type: 'text',
                  text: `${body?.upOrDown}`,
                },
              ],
            },
          ],
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.status(200).send({
      err: false,
      message: 'saleAlert sent successfully',
      data: response,
    });
  },
);

router.post(
  '/v1/payments/serviceChargeAlert',
  // currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let body = req.body || {};

    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';

    let response = await axios.post(
      `https://graph.facebook.com/v17.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `${body?.phone}`,
        type: 'template',
        template: {
          name: 'chargealert',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                // businessName
                {
                  type: 'text',
                  text: `${body?.businessName}`,
                },
                {
                  type: 'text',
                  text: `${body?.tableName}`,
                },
                {
                  type: 'text',
                  text: `${body?.date}`,
                },
                {
                  type: 'text',
                  text: `${body?.billNumber}`,
                },
                {
                  type: 'text',
                  text: `${body?.serviceCharge}`,
                },
                {
                  type: 'text',
                  text: `${body?.reason}`,
                },

                {
                  type: 'text',
                  text: `${body?.customerName}`,
                },

                {
                  type: 'text',
                  text: `${body?.waiterName}`,
                },
              ],
            },
          ],
        },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.status(200).send({
      err: false,
      message: 'serviceChargeAlert sent successfully',
      data: response,
    });
  },
);

// create review
router.post(
  '/v1/payments/reviews',
  // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),
  validateRequest({
    body: ReviewsSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof ReviewsSchema>>, res: Response) => {
    const { businessId, reviewerPhone, reviewRating, order_id } = req.body || {};

    if (!businessId || !reviewerPhone || !reviewRating || !order_id) {
      return res.status(400).send({
        err: true,
        data: {},
        message: 'businessId, reviewerPhone, reviewRating, order_id is required',
      });
    }

    const review = await Reviews.findOne({ order_id: order_id });

    if (review) {
      return res.status(400).send({
        err: true,
        message: 'Review already added',
        data: {},
      });
    }

    const addReview = await Reviews.create(req.body);

    if (!addReview) {
      return res.status(400).send({
        err: true,
        message: 'Review not added',
        data: {},
      });
    }

    return res.status(201).send({ err: false, message: '', data: addReview._id, id: addReview._id });
  },
);

//create customer
router.post(
  '/v1/payments/customer',
  requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),
  validateRequest({
    body: CustomerSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof CustomerSchema>>, res: Response) => {
    const { businessId, phone, name } = req.body || {};

    if (!businessId || !phone) {
      return res.status(400).send({
        err: true,
        data: {},
        message: 'businessId, phone is required',
      });
    }

    let customer = await ReviewsCustomer.findOne({ businessId, phone });

    if (customer) {
      customer = await ReviewsCustomer.findOneAndUpdate(
        { businessId, phone },
        {
          $inc: { count: 1 },
          date: Date.now(),
        },
        { new: true },
      );
    } else {
      customer = new ReviewsCustomer({
        businessId,
        phone,
        name,
        date: Date.now(),
        count: 1,
      });
      await customer.save();
    }

    if (customer) {
      if (customer.count === 1) {
        return res.status(201).send({ err: false, message: 'Review added successfully', data: customer._id, id: customer._id });
      } else {
        return res.status(200).send({ err: true, message: 'You have already submitted', data: customer._id, id: customer.id });
      }
    }

    return res.status(400).send({
      err: true,
      data: {},
      message: 'Customer not added',
    });
  },
);

router.post(
  '/v1/payments/createOrder',
  // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),
  validateRequest({
    body: orderSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof orderSchema>>, res: Response) => {
    const { total, billValue, tableName, tips, currency, name, phone, claimedCoins, businessId } = req.body || {};
    await runInTransaction(async (session: ClientSession) => {
      const existingOrder = await Order.findOne({ phone, role: 'HIPAL_CUSTOMER' }).sort({ date: -1 });
      const currentDate = Date.now(); // Current timestamp in milliseconds
      const providedDate = new Date(existingOrder?.date || 0).getTime();
      const differenceInMinutes = Math.abs(currentDate - providedDate) / (1000 * 60);
      if (existingOrder && differenceInMinutes < 2) {
        res.status(400).send({
          err: true,
          message: 'Order already exists for this user. Please try again after 2 minutes.',
          data: existingOrder,
        });
        return;
      }
      const uniqueOrderId = nanoid(15);
      const response = await razorpayWrapper.client.orders.create({
        amount: total * 100,
        currency: currency,
        receipt: uniqueOrderId,
      });
      const saveOrder = await Order.create(
        [
          {
            total,
            currency,
            billValue,
            businessId,
            receipt: uniqueOrderId,
            name,
            phone,
            claimedCoins: claimedCoins || 0,
            tableName,
            order_id: response.id,
            tips: tips,
          },
        ],
        { session },
      );

      res.status(200).send({ err: false, message: 'Order created successfully', data: response.id });
    });
  },
);

router.post(
  '/v1/payments/createOfflineOrder',
  // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),
  validateRequest({
    body: orderSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof orderSchema>>, res: Response) => {
    const { total, billValue, tips, currency, name, phone, tableName, claimedCoins, businessId } = req.body || {};

    const uniqueOrderId = nanoid(15);

    const orderAlreadyExist = await PaymentAlert.findOne({ tableName, alertType: 'OFFLINE', isAccepted: false });
    console.log('orderAlreadyExist', orderAlreadyExist);

    if (orderAlreadyExist) {
      return res.status(400).send({ err: true, message: 'Order already exists for this table please wait for waiter action!', data: {} });
    }

    const saveOrder = await Order.create({
      total,
      currency,
      receipt: uniqueOrderId,
      name,
      phone,
      claimedCoins: claimedCoins || 0,
      tableName,
      tips,
      billValue,
      businessId,
      order_id: uniqueOrderId,
    });
    await PaymentAlert.create({
      businessId: businessId,
      alertType: 'OFFLINE',
      order_id: saveOrder?._id,
      status: 'SUCCESS',
      tableName: tableName,
      coinsApplied: claimedCoins && claimedCoins > 0 ? true : false,
      message: `Paid ${total}`,
      // comment : payload.payment.entity.notes.comment
    });

    res.status(200).send({ err: false, message: 'Order created successfully', data: { order_id: saveOrder._id } });
  },
);

router.post(
  '/v1/payments/validPayment',
  // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),

  validateRequest({
    body: validatePaymentSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof validatePaymentSchema>>, res: Response) => {
    const { response } = req.body || {};
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

    const signature = createHmac('sha256', process.env.RAZORPAY_SECRET as string)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (signature === razorpay_signature) {
      return res.status(200).send({ err: false, message: 'Payment is valid', data: razorpay_order_id });
    } else {
      return res.status(400).send({ err: true, message: 'Payment is not valid' });
    }
  },
);

const calculateReward = async (exist: number, reward: number, limit: number, session: ClientSession) => {
  let total = exist + reward;

  const sum = Math.min(total, limit);

  const finalReward = sum - exist;
  return { finalReward, curentBalance: sum };
};

const addRewardHistory = async (
  status: string,
  tableName: string,
  loyaltyId: string,
  total: number,
  userName: string,
  userPhone: string,
  addCoins: number,
  currentBalance: number,
  billValue: number,
  session: ClientSession,
) => {
  const data = await UserRewardHistory.create(
    [
      {
        userName: userName,
        userPhone,
        rewards: addCoins,
        status: status,
        claimedCoins: 0,
        currentBalance: currentBalance,
        tableName,
        loyaltyId,
        total,
        subTotal: billValue,
      },
    ],
    { session },
  );

  return data;
};

const removeRewardHistory = async (
  status: string,
  tableName: string,
  loyaltyId: string,
  total: number,
  userName: string,
  userPhone: string,
  addCoins: number,
  currentBalance: number,
  billValue: number,
  session: ClientSession,
) => {
  const data = await UserRewardHistory.create(
    [
      {
        userName: userName,
        userPhone,
        rewards: addCoins,
        status: status,
        claimedCoins: addCoins,
        currentBalance: currentBalance,
        tableName,
        loyaltyId,
        total,
        subTotal: billValue,
      },
    ],
    { session },
  );

  return data;
};

const removeCoins = async (
  claimedCoins: number,
  tableName: string,
  userPhone: string,
  total: number,
  loyaltyId: string,
  billValue: number,
  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userPhone, loyaltyId });
  if (existingUser && existingUser.rewards > claimedCoins) {
    const updatedReward = await UserReward.findOneAndUpdate(
      { userPhone, loyaltyId },
      {
        $inc: { rewards: -claimedCoins, count: 1 },
      },
      { new: true, session },
    );

    await removeRewardHistory(
      'minus',
      tableName,
      loyaltyId,
      total,
      existingUser.userName,
      userPhone,
      claimedCoins,
      updatedReward?.rewards || 0,
      billValue,
      session,
    );

    return updatedReward;
  }
  return null;
};

const addCoins = async (
  coins: number,
  userPhone: string,
  tableName: string,
  businessId: string,
  total: number,
  loyaltyId: string,
  billValue: number,
  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userPhone, loyaltyId }).select('rewards');
  const existingLoyalty = await LoyaltySettings.findOne({ businessId: businessId }).select('rewardLimit');
  if (existingUser && existingLoyalty) {
    const coinsCalculated = await calculateReward(existingUser.rewards, coins, existingLoyalty?.rewardLimit as number, session);
    const updatedReward = await UserReward.findOneAndUpdate(
      { userPhone, loyaltyId },
      {
        $inc: { rewards: coinsCalculated.finalReward, count: 1 },
      },
      { new: true, session },
    ).select('userName userPhone rewards');
    await addRewardHistory(
      'plus',
      tableName,
      loyaltyId,
      total,
      updatedReward?.userName || '',
      userPhone,
      coinsCalculated.finalReward,
      updatedReward?.rewards || 0,
      billValue,
      session,
    );

    return null;
  }
  return null;
};

const calculatedCashbackCoins = async (businessId: string, billValue: number, claimedCoins: number) => {
  const LoyaltySetting = await LoyaltySettings.findOne({ businessId }).select('rewardLimit setReward');
  if (!LoyaltySetting || typeof LoyaltySetting.setReward !== 'number') {
    console.error('LoyaltySetting not found or setReward is not a number');
    return 0; // Or handle this case as appropriate for your application
  }

  const subTotal = billValue - claimedCoins;

  const coinsToBeAdded = (LoyaltySetting.setReward / 100) * subTotal;
  console.log('coinsToBeAdded', coinsToBeAdded);

  return Math.floor(coinsToBeAdded);
};

router.post('/v1/payments/razorpay-webhook', async (req: Request, res: Response) => {
  await runInTransaction(async (session: ClientSession) => {
    const headersResult = RazorpayWebhookHeadersSchema.safeParse(req.headers);
    if (!headersResult.success) {
      throw new Error('Invalid headers');
    }

    const { 'x-razorpay-signature': razorpaySignature, 'x-razorpay-event-id': razorpayEventId } = headersResult.data;

    const isSignatureValid = validateWebhookSignature(JSON.stringify(req.body), razorpaySignature, process.env.RAZORPAY_WEBHOOK_SECRET as string);
    if (!isSignatureValid) {
      console.log('Invalid signature');
      throw new Error('Invalid signature');
    }

    const bodyResult = RazorpayWebhookBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      throw new Error('Invalid body');
    }
    const { event, payload } = bodyResult.data;

    const getOrder = await Order.findOne({ order_id: payload.payment.entity.order_id }, null, { session });
    if (event === 'payment.failed') {
      const claimCoins = Number(payload.payment.entity.notes.claimedCoins) || 0;
      const alertExist = await PaymentAlert.findOne({ order_id: getOrder?._id });
      if (!alertExist) {
        await PaymentAlert.updateMany({ tableName: getOrder?.tableName }, { isAccepted: true }, { session });
        await PaymentAlert.create(
          [
            {
              errorReason: payload.payment.entity.error_reason,
              errorDescription: payload.payment.entity.error_description,
              businessId: payload.payment.entity.notes.businessId,
              alertType: 'ONLINE',
              order_id: getOrder?._id,
              status: 'FAIL',
              tableName: payload.payment.entity.notes.tableName,
              coinsApplied: claimCoins > 0 ? true : false,
              isAccepted: true,

              message: `Fail ${payload.payment.entity.notes.total}`,
              // comment : payload.payment.entity.notes.comment
            },
          ],
          { session },
        );
      }
    }
    if (event === 'payment.captured') {
      console.log('payment captured', payload.payment.entity.notes);
      const createPayment = await Payment.create(
        [
          {
            businessId: payload.payment.entity.notes.businessId,
            total: payload.payment.entity.notes.total,
            billValue: payload.payment.entity.notes.billValue,
            mode: payload.payment.entity.method,
            customerName: getOrder?.name,
            order_id: getOrder?._id,
            customerPhone: getOrder?.phone,
            paymentMode: 'online',
            tableName: payload.payment.entity.notes.tableName,
            claimedCoins: payload.payment.entity.notes.claimedCoins || 0,
            tips: payload.payment.entity.notes.tips || 0,
            razorpayPaymentId: payload.payment.entity.id,
            razorpayOrderId: payload.payment.entity.order_id,
            razorpayAcquirerData: payload.payment.entity.acquirer_data,
            razorpayEventId: razorpayEventId,
          },
        ],
        { session },
      );

      const claimCoins = Number(payload.payment.entity.notes.claimedCoins);
      await PaymentAlert.updateMany({ tableName: getOrder?.tableName }, { isAccepted: true }, { session });
      await PaymentAlert.create(
        [
          {
            businessId: payload.payment.entity.notes.businessId,
            alertType: 'ONLINE',
            payment_id: createPayment[0]._id,
            coinsApplied: claimCoins > 0 ? true : false,
            status: 'SUCCESS',
            order_id: getOrder?._id,
            message: `Paid ${payload.payment.entity.notes.total}`,
            tableName: payload.payment.entity.notes.tableName,
            isAccepted: true,
          },
        ],
        { session },
      );
      if (claimCoins > 0) {
        await removeCoins(
          Number(payload.payment.entity.notes.claimedCoins),
          payload.payment.entity.notes.tableName || '',
          getOrder?.phone || '',
          Number(payload.payment.entity.notes.total),
          payload.payment.entity.notes.loyaltyId || '',
          Number(payload.payment.entity.notes.billValue),
          session,
        );
      }

      const cashBack = await calculatedCashbackCoins(
        payload.payment.entity.notes.businessId,
        Number(payload.payment.entity.notes.billValue),
        Number(payload.payment.entity.notes.claimedCoins),
      );

      await addCoins(
        cashBack,
        getOrder?.phone || '',
        payload.payment.entity.notes.tableName || '',
        payload.payment.entity.notes.businessId || '',
        Number(payload.payment.entity.notes.total),
        payload.payment.entity.notes.loyaltyId || '',
        Number(payload.payment.entity.notes.billValue),
        session,
      );

      await LoyaltyCoinsInfo.findOneAndUpdate(
        { businessId: payload.payment.entity.notes.businessId },

        {
          $inc: {
            coinzIssued: cashBack,
            coinzRedeemed: claimCoins,
          },
        },
        { upsert: true, session },
      );
    }
  });

  return res.status(200).send({ err: false, message: 'Webhook processed successfully', data: {} });
});

router.post('/v1/payments/verifyOrder', async (req: Request, res: Response) => {
  const { completionCode } = req.body;

  const order = await PaymentAlert.findOne({ completionCode: completionCode });
  if (!order) {
    return res.status(404).send({ message: 'Order not found', err: true, data: {} });
  }
  return res.status(200).send({ message: 'Order verified successfully', err: false, data: order });
});

router.post(
  '/v1/payments/createWaiterAlert',
  validateRequest({
    body: PaymentAlertSchema,
  }),
  async (req: Request, res: Response) => {
    const { businessId, tableName, message, name, phone } = req.body;

    const alert = await PaymentAlert.create({
      businessId: businessId,
      alertType: 'WAITER',
      name: name,
      status: 'SUCCESS',
      tableName: tableName,
      message: message,
    });
    return res.status(200).send({ message: 'Order verified successfully', err: false, data: alert });
  },
);

router.post(
  '/v1/payments/bill',
  validateRequest({
    body: TempBillSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId, tableName, billValue, total, tips, claimedCoins } = req.body;
    const billExist = await TempBill.findOne({ businessId: businessId, tableName: tableName });

    if (billExist) {
      return res.status(400).send({
        err: true,
        message: 'Bill Already exists...',
        data: billExist,
      });
    }
    const createBill = await TempBill.create({
      businessId: businessId,
      billValue: billValue,
      total: total,
      tips: tips,
      claimedCoins: claimedCoins,

      tableName: tableName,
    });
    return res.status(200).send({ message: 'Order verified successfully', err: false, data: createBill });
  },
);

export { router as createPaymentRouter };
