import express, { Request, Response } from 'express';
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
  validateRequest,
} from '@hipal/common';
import { Settings } from '../models/settings';

import { validateSettings } from './validators/new-settings-validator';

const router = express.Router();

router.put(
  '/v1/settings/:id',
  currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  validateSettings,
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    const existingSettings = await Settings.findByIdAndUpdate(id, update);

    if (!existingSettings) {
      throw new NotFoundError();
    }

    res.status(200).send(existingSettings);
  }
);

export { router as updateSettingsRouter };
