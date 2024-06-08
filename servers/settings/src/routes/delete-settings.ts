import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';
import { Settings } from '@hi/db-models';

const router = express.Router();

// Define a zod schema for the ID parameter
const paramsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

router.delete(
  '/v1/settings/:id',
  validateRequest({
    params: paramsSchema,
  }),
  async (req: Request<z.infer<typeof paramsSchema>>, res: Response) => {
    try {
      const { id } = req.params;
      const existingSettings = await Settings.findByIdAndDelete(id);

      if (!existingSettings) {
        return res.status(404).send({ status: false, message: 'Settings not found' });
      }

      res.status(200).send({ status: true, message: 'Settings deleted successfully' });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as deleteSettingsRouter };
