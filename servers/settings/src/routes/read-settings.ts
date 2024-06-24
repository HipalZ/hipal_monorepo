import express, { Request, Response } from 'express';

import { Settings } from '@hi/db-models';
import { paramsSchema } from '@hi/db-models/src/validators';
import { validateRequest } from 'zod-express-middleware';
const router = express.Router();

// no authorization required bcuz in menu it is public
router.get(
  '/v1/settings',
  validateRequest({
    query: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingSettings = await Settings.find({
      businessId,
    }).populate('explore.popular');
    return res.status(200).send({
      status: true,
      message: 'Settings fetched successfully',
      data: existingSettings,
    });
  },
);

router.get(
  '/v1/settings/:id',
  validateRequest({
    params: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingSettings = await Settings.findById(id);

    res.status(200).send({
      status: true,
      err: false,
      message: 'Settings fetched successfully',
      data: existingSettings,
    });
  },
);

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

    res.status(200).send({
      data: existingSettings,
      status: true,
      message: 'Settings fetched successfully',
      err: false,
    });
  },
);

router.get('/v1/settings/Check/Business', async (req: Request, res: Response) => {
  const { businessId } = req.query;
  const existingSettings = await Settings.find({
    businessId,
  });
  res.status(200).send({
    data: existingSettings,
    status: true,
    message: 'Settings fetched successfully',
    err: false,
  });
});

export { router as readSettingsRouter };
