import express, { Request, Response } from 'express';

import moment from 'moment';

import { Dues, Payment } from '@hi/db-models';
import { PaymentSchema } from '@hi/db-models/src/validators';
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';
const router = express.Router();

const updatedPaymentSchema = PaymentSchema.partial().extend({
  paymentIds: z.array(z.string()),
})

const updatedDuesSchema = PaymentSchema.partial()

router.put(
  '/v1/payments/:id',
  validateRequest({
    body: updatedPaymentSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedPaymentSchema>>, res: Response) => {
    const { id } = req.params as { id: string };
    const { remove } = req.query;
    const update = { ...req.body };
    if (remove) {
      const existingPayment = await Payment.findByIdAndDelete(id);

      res.status(200).send(existingPayment);
    }

    const existingPayment = await Payment.findByIdAndUpdate(id, update);

    res.status(200).send(existingPayment);
  },
);

router.put('/v1/payments/Settle/Dues', 
  validateRequest({
    body: updatedPaymentSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedPaymentSchema>>, res: Response) => {
  const { paymentIds, mode } = req.body ;
  let currentTime = Date.now();
  let momentTime = moment(currentTime);

  let Time = momentTime.clone().utcOffset('+05:30');
  var indianTime = momentTime.clone().utcOffset('+05:30').format('HH:mm');

  let dayAndDate = Time.format('DD-MM-YYYY');

  for (let i = 0; i < paymentIds?.length; i++) {
    let id = paymentIds[i];
    await Payment.findByIdAndUpdate(
      id,
      { settle: true, mode, paymentDate: dayAndDate, time: indianTime },
      {
        new: true,
      },
    );
  }

  res.status(200).send('Settle SuccessFully');
});

router.put('/v1/payments/:id/deleteDues/:duesId', 
  validateRequest({
    body: updatedDuesSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedDuesSchema>>, res: Response) => {
  try {
    let { duesId } = req.params as { duesId: string };

    const existingDues = await Dues.findByIdAndDelete(duesId);
    if (!existingDues) {
      return res.status(404).send('Dues Not Found..');
    }

    return res.status(200).send(existingDues);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

export { router as updatePaymentsRouter };
