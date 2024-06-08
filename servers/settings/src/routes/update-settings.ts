import express, { Request, Response } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { Settings } from '@hi/db-models';
import { settingsSchema } from '@hi/db-models/src/validators';
import { z } from 'zod';

const router = express.Router();

// Define zod schema for the ID parameter
const idParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

// Use the existing settingsSchema and make it partial for updates
const updateSettingsSchema = settingsSchema.partial();

router.put(
  '/v1/settings/:id',
  validateRequest({
    params: idParamsSchema,
    body: updateSettingsSchema,
  }),
  async (req: Request<z.infer<typeof idParamsSchema>, {}, z.infer<typeof updateSettingsSchema>>, res: Response) => {
    try {
      const { id } = req.params;
      const update = { ...req.body };
      const existingSettings = await Settings.findByIdAndUpdate(id, update, { new: true });

      if (!existingSettings) {
        return res.status(404).send({ status: false, message: 'Settings not found' });
      }

      res.status(200).send(existingSettings);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as updateSettingsRouter };
