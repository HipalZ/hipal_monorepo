// books.ts
import { LoyaltyCoinsInfo, LoyaltySettings, Order, Payment, PaymentAlert, UserReward, UserRewardHistory } from '@hi/db-models';
import type { PaymentType } from '@hi/db-models/src/validators';
import {
  orderSchema,
  paramsSchema,
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
  validatePaymentSchema,
} from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
import { createHmac } from 'crypto';
import { Hono } from 'hono';
import type { ClientSession } from 'mongoose';
import { nanoid } from 'nanoid';
import { razorpayWrapper } from '../../../razorpay_wrapper';
const { validateWebhookSignature } = require('../../utils');
//dates
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

//calculateDiscount
const calculateDiscount = (total_bill: number, appliedCoins: number, paid_Money: number) => {
  const subTotal = (total_bill * 100) / 105;
  const discount = (paid_Money - 1.05 * subTotal) / 1.05;
  const finalDiscount = Math.floor(Math.abs(discount));

  return finalDiscount;
};

//calculate reward

const calculateReward = async (exist: number, reward: number, limit: number, session: ClientSession) => {
  console.log('exist', exist, 'reward', reward, 'limit', limit);
  const total = exist + reward;

  const sum = Math.min(total, limit);

  const finalReward = sum - exist;
  return { finalReward, curentBalance: sum };
};

//

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
  if (existingUser && existingUser.rewards >= claimedCoins) {
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
  const existingUser = await UserReward.findOne({ userPhone, loyaltyId }, null, { session }).select('rewards');

  const existingLoyalty = await LoyaltySettings.findOne({ businessId: businessId }, null, { session }).select('rewardLimit');
  if (existingUser && existingLoyalty) {
    const coinsCalculated = await calculateReward(existingUser.rewards, coins, existingLoyalty?.rewardLimit as number, session);

    const updatedReward = await UserReward.findOneAndUpdate(
      { userPhone, loyaltyId },
      {
        $inc: { rewards: coinsCalculated.finalReward, count: 1 },
      },
      { new: true, session },
    ).select('userName userPhone rewards');
    if (coinsCalculated.finalReward > 0) {
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
    }

    return coinsCalculated.finalReward || 0;
  }
  return 0;
};

const calculatedCashbackCoins = async (businessId: string, billValue: number, claimedCoins: number) => {
  const LoyaltySetting = await LoyaltySettings.findOne({ businessId }).select('rewardLimit setReward');
  if (!LoyaltySetting || typeof LoyaltySetting.setReward !== 'number') {
    console.error('LoyaltySetting not found or setReward is not a number');
    return 0; // Or handle this case as appropriate for your application
  }

  const subTotal = billValue - claimedCoins;

  const coinsToBeAdded = (LoyaltySetting.setReward / 100) * subTotal;
  if (coinsToBeAdded < 0) {
    return 0;
  }

  return Math.floor(coinsToBeAdded);
};
const dishesRouter = new Hono()
  .post('/createOrder', zValidator('json', orderSchema), async (c) => {
    const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
    const { total, billValue, tableName, tips, currency, name, phone, claimedCoins, businessId } = requestData;
    await runInTransaction(async (session: ClientSession) => {
      const existingOrder = await Order.findOne({ phone, role: 'HIPAL_CUSTOMER' }).sort({ date: -1 });
      const currentDate = Date.now(); // Current timestamp in milliseconds
      const providedDate = new Date(existingOrder?.date || 0).getTime();
      const differenceInMinutes = Math.abs(currentDate - providedDate) / (1000 * 60);
      if (existingOrder && differenceInMinutes < 2) {
        c.json({
          err: true,
          data: {},
          message: 'You have already placed an order. Please wait for 2 minutes before placing another order',
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

      c.json({ err: false, message: 'Order created successfully', data: response.id });
      return;
    });
  })
  .post('/createOfflineOrder', zValidator('json', orderSchema), async (c) => {
    const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
    const { total, billValue, tableName, tips, currency, name, phone, claimedCoins, businessId } = requestData;
    const uniqueOrderId = nanoid(15);

    const orderAlreadyExist = await PaymentAlert.findOne({ tableName, alertType: 'OFFLINE', isAccepted: false });
    console.log('orderAlreadyExist', orderAlreadyExist);

    if (orderAlreadyExist) {
      return c.json({ err: true, message: 'Order already exists for this table please wait for waiter action!', data: {} });
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
    let posDiscount = 0;
    if (Number(claimedCoins) > 0) {
      posDiscount = calculateDiscount(Number(billValue), Number(claimedCoins), Number(total));
    }
    await PaymentAlert.create({
      businessId: businessId,
      alertType: 'OFFLINE',
      order_id: saveOrder?._id,
      status: 'SUCCESS',
      tableName: tableName,
      coinsApplied: claimedCoins && claimedCoins > 0 ? true : false,
      message: `Paid ${total}`,
      date: Date.now(),
      posDiscount: posDiscount,

      // comment : payload.payment.entity.notes.comment
    });

    return c.json({ err: false, message: 'Order created successfully', data: { order_id: saveOrder._id } });
  })
  .post('/validPayment', zValidator('json', validatePaymentSchema), async (c) => {
    const requestData = await c.req.json();
    const { response } = requestData;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

    const signature = createHmac('sha256', Bun.env.RAZORPAY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (signature === razorpay_signature) {
      return c.json({ err: false, message: 'Payment is valid', data: razorpay_order_id });
    }
    return c.json({ err: true, message: 'Payment is not valid' });
  })
  .post('/razorpay-webhook', zValidator('json', validatePaymentSchema), async (c) => {
    await runInTransaction(async (session: ClientSession) => {
      const headers = RazorpayWebhookHeadersSchema.safeParse(c.req.header());
      const headersResult = RazorpayWebhookHeadersSchema.safeParse(headers);
      if (!headersResult.success) {
        throw new Error('Invalid headers');
      }

      const { 'x-razorpay-signature': razorpaySignature, 'x-razorpay-event-id': razorpayEventId } = headersResult.data;

      const body = await c.req.json();

      const isSignatureValid = validateWebhookSignature(JSON.stringify(body), razorpaySignature, Bun.env.RAZORPAY_WEBHOOK_SECRET as string);
      if (!isSignatureValid) {
        console.log('Invalid signature');
        throw new Error('Invalid signature');
      }

      const bodyResult = RazorpayWebhookBodySchema.safeParse(body);
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
                isAccepted: false,
                date: Date.now(),

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
        let posDiscount = 0;
        if (claimCoins > 0) {
          posDiscount = calculateDiscount(Number(payload.payment.entity.notes.billValue), claimCoins, Number(payload.payment.entity.notes.total));
        }
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
              isAccepted: false,
              posDiscount: posDiscount,
            },
          ],
          { session },
        );
        if (payload.payment.entity.notes.loyaltyId) {
          if (claimCoins > 0) {
            const updateUser = await removeCoins(
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

          const cashBackCoins = await addCoins(
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
      }
    });

    return c.json({ err: false, message: 'Webhook processed successfully', data: {} });
  })
  .post('/offlinePayment', zValidator('json', validatePaymentSchema), async (c) => {})
  .get(
    '/:id/orders',

    zValidator('query', paramsSchema),
    async (c) => {
      const { businessId } = c.req.query();
      const existingOrders = await Order.find({ businessId });

      return c.json({
        data: existingOrders,
        status: 200,
        err: false,
      });
    },
  )
  .get('/:id/orders/:orderId', zValidator('query', paramsSchema), async (c) => {
    const { businessId, alertType } = c.req.query();

    const existingPaymentAlerts = await PaymentAlert.find({ businessId, alertType, isAccepted: false }).sort({ _id: -1 }).populate('order_id');

    return c.json({
      data: existingPaymentAlerts,
      status: 200,
      err: false,
    });
  })
  .get('/:id/offlineAlerts', zValidator('query', paramsSchema), async (c) => {
    const { businessId, orderId } = c.req.query();

    const existingPaymentAlerts = await PaymentAlert.find({ businessId, alertType: ['OFFLINE', 'WAITER'], isAccepted: false })
      .sort({ _id: -1 })
      .populate('order_id');

    return c.json({
      data: existingPaymentAlerts,
      status: 200,
      err: false,
    });
  })
  .get('/:id/paymentAlertHistory', zValidator('query', paramsSchema), async (c) => {
    const { businessId, from, to } = c.req.query();
    const fromDate = Number(from);
    const toDate = Number(to);
    const PAGE_SIZE = 20;
    const pageNumber = c.req.query('pageNumber') as string;
    const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
    if (fromDate > toDate) {
      return c.json({
        err: true,
        data: {},
        message: 'from date should be less than to date',
      });
    }
    if (!from && !to) {
      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        isAccepted: true,
        isRejected: false,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate('order_id');

      return c.json({
        data: existingPaymentAlerts,
        status: 200,
        err: false,
      });
    }

    if (from && to) {
      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        isAccepted: true,
        isRejected: false,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate('order_id');

      return c.json({
        data: existingPaymentAlerts,
        status: 200,
        err: false,
      });
    }
    return c.json({
      err: true,
      data: {},
      message: 'Invalid date range',
    });
  })
  .get('/:id/salesDashboard', zValidator('query', paramsSchema), async (c) => {
    const { businessId, from, to } = c.req.query();
    const fromDate = Number(from);
    const toDate = Number(to);
    if (fromDate > toDate) {
      return c.json({
        err: true,
        data: {},
        message: 'from date should be less than to date',
      });
    }

    const loyaltyCoinInfo = await LoyaltyCoinsInfo.findOne({ businessId }).select('coinzIssued coinzRedeemed');
    if (!from && !to) {
      const existingPayments = await Payment.find({
        businessId,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      }).select('total claimedCoins paymentMode');
      const totalSale = existingPayments.reduce((acc, payment: PaymentType) => acc + (payment.total ?? 0), 0);
      const totalCoins = existingPayments.reduce((acc, payment: PaymentType) => acc + (payment?.claimedCoins ?? 0), 0);

      const totalOnlineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment.paymentMode === 'online' ? payment.total ?? 0 : 0),
        0,
      );

      const totalOfflineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment.paymentMode === 'offline' ? payment.total ?? 0 : 0),
        0,
      );

      return c.json({
        err: false,
        data: {
          totalSale,
          totalDiscount: totalCoins,
          totalOnlineSale,
          totalOfflineSale,
          coinzIssued: loyaltyCoinInfo?.coinzIssued,
          coinzRedeemed: totalCoins,
        },
        message: 'existing payment',
      });
    }
    if (from && to) {
      const existingPayments = await Payment.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      }).select('total claimedCoins paymentMode');
      const totalSale = existingPayments.reduce((acc, payment: PaymentType) => acc + (payment.total ?? 0), 0);
      const totalCoins = existingPayments.reduce((acc, payment: PaymentType) => acc + (payment?.claimedCoins ?? 0), 0);

      const totalOnlineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment.paymentMode === 'online' ? payment.total ?? 0 : 0),
        0,
      );

      const totalOfflineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment.paymentMode === 'offline' ? payment.total ?? 0 : 0),
        0,
      );

      return c.json({
        err: false,
        data: {
          totalSale,
          totalDiscount: totalCoins,
          totalOnlineSale,
          totalOfflineSale,
          coinzIssued: loyaltyCoinInfo?.coinzIssued,
          coinzRedeemed: totalCoins,
        },
        message: 'existing payment',
      });
    }
    return c.json({
      err: true,
      data: {},
      message: 'Invalid date range',
    });
  })
  .get('/:id/bills', zValidator('query', paramsSchema), async (c) => {
    const { businessId, from, to } = c.req.query();
    const fromDate = Number(from);
    const toDate = Number(to);
    const PAGE_SIZE = 20;
    const pageNumber = c.req.query('pageNumber') as string;
    const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;

    if (!from && !to) {
      const existingPayments = await Payment.find({
        businessId,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate('order_id');
      const totalSale = existingPayments.reduce((acc, payment) => acc + (payment.total ?? 0), 0);

      return c.json({
        err: false,
        data: {
          totalSale,
          existingPayments,
        },
        message: 'existing payment',
      });
    }
    if (from && to) {
      const existingPayments = await Payment.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate('order_id');
      const totalSale = existingPayments.reduce((acc, payment) => acc + (payment.total ?? 0), 0);

      return c.json({
        err: false,
        data: {
          totalSale,
          existingPayments,
        },
        message: 'existing payment',
      });
    }
    return c.json({
      err: true,
      data: {},
      message: 'Invalid date range',
    });
  });

export default dishesRouter;
