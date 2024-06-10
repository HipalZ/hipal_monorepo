import { Business } from '@hi/db-models';
import { BusinessSchema } from '@hi/db-models/src/validators';
import express, { Request, Response } from 'express';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.delete(
  '/v1/businesses/:businessId',
  validateRequest({
    body: BusinessSchema,
  }),
  async (req: Request<{ businessId: string }>, res: Response) => {
    const { businessId } = req.params;
    const deletedBusiness = await Business.findByIdAndDelete(businessId);

    if (!deletedBusiness) {
      return res.status(404).send({
        message: 'Business not found',
        status: false,
      });
    }
    res.status(200).send(
      {
        message: 'Business deleted successfully',
        status: true,
      }
    );
  },
);

export { router as deleteBusinessesRouter };
