import { ClientRoles, requireAuthorization } from '@hi/common';
import { Settings } from '@hi/db-models';
import { paramsSchema } from '@hi/db-models/src/validators';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.delete(
  '/v1/settings/:id',
  validateRequest({
    params: paramsSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request<z.infer<typeof paramsSchema>>, res: Response) => {
    const { id } = req.params;
    const existingSettings = await Settings.findByIdAndDelete(id);

    if (!existingSettings) {
      return res.status(404).send({ status: false, message: 'Settings not found' });
    }

    res.status(200).send({ status: true, message: 'Settings deleted successfully' });
    return res.status(500).send({ status: false, message: 'Error in deleting settings' });
  },
);

export { router as deleteSettingsRouter };
