import express, { Request, Response } from 'express';
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from '@hipal/common';
import { Settings } from '../models/settings';

const router = express.Router();

router.delete(
  '/v1/settings/:id',
  currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingSettings = await Settings.findByIdAndDelete(id);

    if (!existingSettings) {
      throw new NotFoundError();
    }

    res.status(200).send({});
  }
);

export { router as deleteSettingsRouter };
