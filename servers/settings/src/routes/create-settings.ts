import express, { Request, Response } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { Settings } from '@hi/db-models';
import { z } from 'zod';
import { settingsSchema } from '@hi/db-models/src/validators';

const router = express.Router();

router.post(
  '/v1/settings',
  validateRequest({
    body: settingsSchema,
  }),
  async (req: Request<{}, {}, z.infer<typeof settingsSchema>>, res: Response) => {
    try {
      const { businessId, themes, explore, navigation, categoryOrder } = req.body;

      const settings = await Settings.create({
        businessId,
        themes,
        explore,
        navigation,
        categoryOrder,
      });

      return res.status(201).send(settings);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as createSettingsRouter };
