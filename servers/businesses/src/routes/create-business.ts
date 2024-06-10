import { Business, LoyaltySettings, Role } from '@hi/db-models';
import { BusinessSchema, loyaltySchema, RoleSchema } from '@hi/db-models/src/validators';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.post(
  '/v1/businesses',
  validateRequest({
    body: BusinessSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof BusinessSchema>>, res: Response) => {
    const {
      likes,
      wallpaper,
      businessName,
      registeredName,
      businessType,
      gstRegistered,
      multipleOutlets,
      customLink,
      logo,
      address,
      gstNumber,
      fssaiLicenseNumber,
      open,
      close,
      isHasSetting,
      isHasDishData,
      hikitchen,
      hitable,
      hipeople,
      hibiz,
      kotPrinter,
      serviceCharge,
      serviceChargeRemovalPass,
      serviceChargePercentage,
      serviceControl,
      ownerPhone,
      takeAwayName,
      loyalty,
      isHasGst,
      gstPercentage,
      isPaymentIntegrated,
      withPopCorn,
    } = req.body;

    let currentObject: any = req?.currentUser;

    const business = await Business.create({
      likes,
      wallpaper,
      businessName,
      registeredName,
      businessType,
      gstRegistered,
      multipleOutlets,
      customLink,
      logo,
      address,
      staff: [req.currentUser?.id as string],
      gstNumber,
      fssaiLicenseNumber,
      status: false,
      tier: 'ON THE HOUSE',
      open,
      close,
      isHasSetting,
      isHasDishData,
      hikitchen,
      hitable,
      hipeople,
      hibiz,
      kotPrinter,
      serviceCharge,
      serviceChargePercentage,
      serviceChargeRemovalPass,
      serviceControl,
      ownerPhone: currentObject?.phone,
      takeAwayName,
      loyalty,
      isHasGst,
      gstPercentage,
      isPaymentIntegrated,
      withPopCorn,
    });
    await business.save();

    res.status(201).send(business);
  },
);

router.post(
  '/v1/businesses/:id/loyalty',
  validateRequest({
    body: loyaltySchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof loyaltySchema>>, res: Response) => {
    try {
      const { businessId, password } = req.body;

      let ExitSetting = await LoyaltySettings.findOne({
        businessId,
      });

      if (ExitSetting) {
        return res.status(400).send({
          message:'Loyalty already exists',
          status: false,
        });
      }
      let newPass = Math.floor(Math.random() * 9000) + 10000;
      let data = new LoyaltySettings({
        ...req.body,
        password: password || newPass,
      });
      const saveLoyaltySetup = await data.save();
      return res.status(201).send(saveLoyaltySetup);
    } catch (err: any) {
      console.log('err', err);
    }
  },
);

router.post(
  '/v1/businesses/:id/roles',
  validateRequest({
    body: RoleSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof RoleSchema>>, res: Response) => {
    const { name, description, permissions } = req.body;
    const { id } = req.params as { id: string };

    const role = await Role.create({
      name,
      businessId: id,
      description,
      permissions,
    });

    res.status(201).send(role);
  },
);

export { router as createUserRouter };
