import { Category, Dish } from '@hi/db-models';
import { dishSchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import express, { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.delete(
  '/v1/dishes/:id',
  validateRequest({
    body: dishSchema,
  }),
  async <T,K>(req: Request<T,K, z.infer<typeof dishSchema>>, res: Response) => {
    const { id } = req.params as { id: string };
    let dishNotFound = false;

    try {
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
        message: 'Dish deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: 'An error occurred while deleting the dish',
      });
    }
  },
);

export { router as deleteDishesRouter };
