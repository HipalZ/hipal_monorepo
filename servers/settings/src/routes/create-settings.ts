import express, { Request, Response } from 'express';

import { Settings } from '@hi/db-models';

const router = express.Router();

router.post('/v1/settings', async (req: Request, res: Response) => {
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
});

export { router as createSettingsRouter };
