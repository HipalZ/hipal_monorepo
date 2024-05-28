import express, { Request, Response } from 'express';
import { Settings } from '@hi/db-models';

const router = express.Router();

router.put(
  '/v1/settings/:id',
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    const existingSettings = await Settings.findByIdAndUpdate(id, update);

    res.status(200).send(existingSettings);
  }
);

export { router as updateSettingsRouter };
