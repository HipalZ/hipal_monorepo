import { ClientRoles, requireAuthorization } from '@hi/common';
import { Dues, LoyaltyCoinsInfo, LoyaltySettings, Order, Payment, PaymentAlert, Reviews, UserReward, UserRewardHistory } from '@hi/db-models';
import { paramsSchema, PaymentSchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import express, { Request, Response } from 'express';
import moment from 'moment';
import { ClientSession } from 'mongoose';
import type { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();
const updatedPaymentSchema = PaymentSchema.partial();
const updatedDuesSchema = PaymentSchema.partial();

const calculateReward = async (exist: number, reward: number, limit: number, session: ClientSession) => {
  let total = exist + reward;

  const sum = Math.floor(Math.min(total, limit)) || 0;

  const finalReward = Math.abs(sum - exist) || 0;
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
  if (coinsToBeAdded < 0) {
    return 0;
  }

  return Math.floor(coinsToBeAdded);
};

router.put(
  '/v1/payments/:pid/order/:alertId',
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    params: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { alertId } = req.params;
    const { comment, waiterName } = req.body;

    await runInTransaction(async (session: ClientSession) => {
      const alert = await PaymentAlert.findOne({ _id: alertId, isAccepted: false }, null, { session }).select(
        '_id alertType isAccepted order_id businessId',
      );
      if (!alert) {
        res.status(404).send({ message: 'Alert not found', err: true, data: {} });
        return;
      }

      if (alert.alertType === 'ONLINE' || alert.alertType === 'WAITER') {
        const updateAlert = await PaymentAlert.findByIdAndUpdate(alertId, { isAccepted: true, comment, waiterName }, { new: true, session }).populate(
          'order_id',
        );
        res.status(200).send({ message: 'Order accepted successfully', err: false, data: updateAlert });
        return;
      }

      if (alert.alertType === 'OFFLINE') {
        if (alert && !alert.isAccepted) {
          const order = await Order.findById(alert.order_id, null, { session });

          await Payment.create(
            [
              {
                businessId: alert.businessId,
                order_id: order?._id,
                total: order?.total,
                mode: 'offline',
                status: 'SUCCESS',
                paymentMode: 'offline',
                customerName: order?.name,
                claimedCoins: order?.claimedCoins,
                customerPhone: order?.phone,
                billValue: order?.billValue,
                tips: order?.tips,
                tableName: order?.tableName,
                waiterName,
              },
            ],
            { session },
          );

          if (order?.claimedCoins && order?.claimedCoins > 0) {
            const existingLoyalty = await LoyaltySettings.findOne({ businessId: alert.businessId }).select('loyaltyId');
            await removeCoins(
              Number(order?.claimedCoins),
              order.tableName || '',
              order?.phone || '',
              Number(order?.total),
              existingLoyalty?.loyaltyId as string,
              Number(order?.billValue),
              session,
            );
          }

          if (order) {
            const cashBack = await calculatedCashbackCoins(order.businessId.toString(), Number(order.billValue), Number(order.claimedCoins));
            const existingLoyalty = await LoyaltySettings.findOne({ businessId: alert.businessId }).select('loyaltyId');
            await addCoins(
              cashBack,
              order?.phone || '',
              order.tableName || '',
              order.businessId.toString(),
              Number(order.total),
              existingLoyalty?.loyaltyId as string,
              Number(order.billValue),
              session,
            );

            await LoyaltyCoinsInfo.findOneAndUpdate(
              { businessId: order.businessId.toString() },

              {
                $inc: {
                  coinzIssued: cashBack,
                  coinzRedeemed: Number(order.claimedCoins),
                },
              },
              { upsert: true, session },
            );
          }
        }

        const pinCode = Math.floor(1000 + Math.random() * 9000);
        const updateAlert = await PaymentAlert.findByIdAndUpdate(
          alertId,
          { isAccepted: true, completionCode: pinCode, comment, waiterName },
          { new: true, session },
        ).populate('order_id');

        res.status(200).send({ message: 'Order accepted successfully', err: false, data: updateAlert });
        return;
      }
      res.status(400).send({ message: 'Invalid alert type', err: true, data: {} });
      return;
    });
  },
);

router.put(
  '/v1/payments/:pid/rejectOrder/:alertId',
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    params: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { alertId } = req.params;
    const { waiterName } = req.body;
    const alert = await PaymentAlert.findById(alertId);
    const updateOrder = await Order.findByIdAndDelete(alert?.order_id?.toString());
    const updateReview = await Reviews.findOneAndDelete({ order_id: alert?.order_id?.toString() });

    const updateAlert = await PaymentAlert.findByIdAndUpdate(alertId, { isRejected: true, isAccepted: true, waiterName }, { new: true }).populate(
      'order_id',
    );

    res.status(200).send({ message: 'Order rejected successfully', err: false, data: updateAlert });
  },
);

router.put(
  '/v1/payments/:id',
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: updatedPaymentSchema,
  }),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };

    const existingPayment = await Payment.findByIdAndUpdate(id, update);

    res.status(200).send({
      message: 'Payment updated successfully',
      data: existingPayment,
      err: false,
    });
  },
);

router.put(
  '/v1/payments/Settle/Dues',
  validateRequest({
    body: updatedPaymentSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedPaymentSchema>>, res: Response) => {
    const { paymentIds, mode } = req.body;
    let currentTime = Date.now();
    let momentTime = moment(currentTime);

    let Time = momentTime.clone().utcOffset('+05:30');
    var indianTime = momentTime.clone().utcOffset('+05:30').format('HH:mm');

    let dayAndDate = Time.format('DD-MM-YYYY');

    for (let i = 0; paymentIds && i < paymentIds.length; i++) {
      let id = paymentIds[i];
      await Payment.findByIdAndUpdate(
        id,
        { settle: true, mode, paymentDate: dayAndDate, time: indianTime },
        {
          new: true,
        },
      );
    }

    return res.status(200).send({
      err: false,
      data: {},
      message: 'Dues settled successfully',
    });
  },
);

router.put(
  '/v1/payments/:id/deleteDues/:duesId',
  validateRequest({
    body: updatedDuesSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request<{ duesId: string }, {}, z.infer<typeof updatedDuesSchema>>, res: Response) => {
    let { duesId } = req.params as { duesId: string };

    const existingDues = await Dues.findByIdAndDelete(duesId);
    if (!existingDues) {
      return res.status(404).send('Dues Not Found..');
    }

    res.status(200).send({
      message: 'Dues removed successfully',
      data: existingDues,
      err: false,
    });
    return res.status(500).send({ err: true, data: {}, message: 'Server error' });
  },
);

export { router as updatePaymentsRouter };
