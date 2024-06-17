import express, { Request, Response } from 'express';

import { Settings } from '@hi/db-models';
const router = express.Router();

router.get('/v1/settings', async (req: Request, res: Response) => {
  const { businessId } = req.query;
  const existingSettings = await Settings.find({
    businessId,
  }).populate('explore.popular');
  return res.status(200).send(existingSettings);
});

router.get('/v1/settings/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingSettings = await Settings.findById(id);

  res.status(200).send(existingSettings);
});

router.get('/v1/settings/:id/testing', async (req: Request, res: Response) => {
  res.status(200).send({
    message: 'Testing',
  });
});

router.get(
  '/v1/settings/business/setting',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingSettings = await Settings.find({
      businessId,
    });

    res.status(200).send(existingSettings);
  },
);

router.get(
  '/v1/settings/Check/Business',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingSettings = await Settings.find({
      businessId,
    });

    res.status(200).send(existingSettings);
  },
);

export { router as readSettingsRouter };
