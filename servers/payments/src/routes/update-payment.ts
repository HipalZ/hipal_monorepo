import express, { Request, Response } from 'express';

import moment from 'moment';

import { ClientRoles, requireAuthorization } from '@hi/common';
import { Dues, Order, Payment, PaymentAlert } from '@hi/db-models';
import { paramsSchema, PaymentSchema } from '@hi/db-models/src/validators';

import type { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';
const router = express.Router();

const updatedPaymentSchema = PaymentSchema.partial();
const updatedDuesSchema = PaymentSchema.partial();

router.put(
  '/v1/payments/:pid/order/:alertId',
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    params: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { alertId } = req.params;
    const { comment } = req.body;
    const alert = await PaymentAlert.findById(alertId).select('_id alertType isAccepted order_id businessId');

    if (!alert) {
      return res.status(404).send({ message: 'Alert not found', err: true, data: {} });
    }
    if (comment) {
      const updateAlert = await PaymentAlert.findByIdAndUpdate(alertId, { comment }).populate('order_id');
      return res.status(200).send({ message: 'Order accepted successfully', err: false, data: updateAlert });
    }
    if (alert.alertType === 'OFFLINE') {
      const pinCode = Math.floor(1000 + Math.random() * 9000);

      if (alert && !alert.isAccepted) {
        const order = await Order.findById(alert.order_id);

        await Payment.create({
          businessId: alert.businessId,
          order_id: order?._id,
          total: order?.total,
          mode: 'OFFLINE',
          status: 'SUCCESS',
          customerName: order?.name,
          customerPhone: order?.phone,
          billValue: order?.billValue,
          tips: order?.tips,
          tableName: order?.tableName,
        });
      }
      const updateAlert = await PaymentAlert.findByIdAndUpdate(alertId, { isAccepted: true, completionCode: pinCode, comment }).populate('order_id');

      return res.status(200).send({ message: 'Order accepted successfully', err: false, data: updateAlert });
    }
  },
);

router.put(
  '/v1/payments/:id',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
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
