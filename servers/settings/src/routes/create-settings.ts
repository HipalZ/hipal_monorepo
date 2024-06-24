import express, { Request, Response } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { Settings } from '@hi/db-models';
import { z } from 'zod';
import { settingsSchema } from '@hi/db-models/src/validators';
import { ClientRoles, requireAuthorization } from '@hi/common';

const router = express.Router();

router.post(
  '/v1/settings',
  validateRequest({
    body: settingsSchema,
  }),
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_STAFF
  ]),
  async (req: Request<{}, {}, z.infer<typeof settingsSchema>>, res: Response) => {
      const { businessId, themes, explore, navigation, categoryOrder } = req.body;

      const settings = await Settings.create({
        businessId,
        themes,
        explore,
        navigation,
        categoryOrder,
      });

      res.status(201).send({
        status: true,
        message: 'Settings created successfully',
        data:settings,
        err:false
      });
      return res.status(500).send({ err:true, data:{},status: false, message: 'error in creating settings' });
  }
);

export { router as createSettingsRouter };
