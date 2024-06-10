import { Business, LoyaltySettings, Tempmodel } from '@hi/db-models';
import { runInTransaction } from '@hi/utils';
import express, { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { validateRequest } from 'zod-express-middleware';
import { BusinessSchema, loyaltySchema } from '@hi/db-models/src/validators';
import { z } from 'zod';
const router = express.Router();

const updateLoyaltySchema = loyaltySchema.partial();
const updateBusinessSchema = BusinessSchema.partial().extend({
  password: z.string(),
  tableId: z.string(),
  reapply: z.boolean(),
  serviceChargeRemovedBy: z.string(),
  serviceChargeAddedBy: z.string(),
});
router.put(
  '/v1/businesses/:id',
  validateRequest({ 
    body: updateBusinessSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updateBusinessSchema>>, res: Response) => {
    const { id } = req.params as { id: string };
    const update = req.body
    const existingBusiness = await Business.findByIdAndUpdate(id, update, {
      new: true,
    });

    res.status(200).send(existingBusiness);
  },
);

router.put('/v1/businesses/:id/updateLoyalty', 
  validateRequest({
    body: updateLoyaltySchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updateLoyaltySchema>>, res: Response) => {
  const { id } = req.params as { id: string };
  const { setReward, setClaimAmount, password, origin, cardPattern, cardColor, fontColor, logo, expiryDate, rewardLimit, signUpBonus } = req.body;
  const existingLoyalty = await LoyaltySettings.findOneAndUpdate(
    { businessId: id },
    {
      setReward,
      setClaimAmount,
      password,
      origin,
      cardPattern,
      cardColor,
      fontColor,
      logo,
      expiryDate,
      rewardLimit,
      signUpBonus,
    },
    {
      new: true,
    },
  );
  res.status(200).send(existingLoyalty);
});

router.put('/v1/businesses/update/Business', 
  validateRequest({
    body: updateBusinessSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updateBusinessSchema>>, res: Response) => {
  const { isHasDishData, isHasSetting, id } = req.query;
  let existingBusiness;
  if (isHasDishData) {
    existingBusiness = await Business.findByIdAndUpdate(
      id,
      { isHasDishData: true },
      {
        new: true,
      },
    );
  }
  if (isHasSetting) {
    existingBusiness = await Business.findByIdAndUpdate(
      id,
      { isHasSetting: true },
      {
        new: true,
      },
    );
  }
  res.status(200).send(existingBusiness);
});

router.put(
  '/v1/businesses/:id/removalServiceCharge',
  validateRequest({
    body: updateBusinessSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updateBusinessSchema>>, res: Response) => {
    const { id } = req.params as { id: string };
    let { password, tableId, reapply, serviceChargeRemovedBy, serviceChargeAddedBy } = req.body;
    try {
      await runInTransaction(async (session: ClientSession) => {
        if (reapply) {
          serviceChargeRemovedBy = '';
        }
        if (!reapply) {
          serviceChargeAddedBy = '';
        }
        const business = await Business.findById({ _id: id, password }, { session });
        if (!business) {
          throw new Error('Business not found');
        }

        const serviceChargeisExist = await Tempmodel.findOne(
          {
            tableId,
            serviceChargeApply: true,
          },
          { session },
        );

        if (serviceChargeisExist && reapply) {
          throw new Error('Service Charge is already applied');
        }

        await Tempmodel.findOneAndUpdate(
          { tableId: tableId },
          {
            $set: {
              serviceChargeApply: reapply ? true : false,
              serviceChargeRemovedBy,
              serviceChargeAddedBy,
            },
          },
          { session },
        );
      });

      res.status(200).send({
        message: `Service charge ${reapply ? 'Added' : 'removed'} successfully`,
        status: true,
      });
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  },
);

export { router as updateBusinessRouter };
