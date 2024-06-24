import { ClientRoles, requireAuthorization } from '@hi/common';
import { Category, Dish } from '@hi/db-models';
import { dishSchema, paramsSchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import express, { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.delete(
  '/v1/dishes/:id',
  validateRequest({
    params: paramsSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request<{ id: string }, {}, z.infer<typeof dishSchema>>, res: Response) => {
    const { id } = req.params;
    let dishNotFound = false;

    await runInTransaction(async (session: ClientSession) => {
      const dish = await Dish.findByIdAndDelete(id, {
        session: session,
      });
      //remove error handling
      if (!dish) {
        dishNotFound = true;
        return;
      }
      await Category.updateMany({ _id: { $in: dish.categories } }, { $pull: { dishes: id } }, { session: session });
    });

    if (dishNotFound) {
      return res.status(404).send({
        message: 'Dish not found',
      });
    }

    return res.status(200).send({
      err: false,
      message: 'Dish deleted successfully',
      data: {},
    });
  },
);

export { router as deleteDishesRouter };
