import express, { Request, Response } from 'express';
import { Category, Dish } from '@hi/db-models';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
import { validateRequest } from 'zod-express-middleware';
import { categorySchema } from '@hi/db-models/src/validators';
import { z } from 'zod';

const router = express.Router();

router.delete(
  '/v1/categories/:id',
  validateRequest({
    body: categorySchema,
  }),
  async <T,K>(req: Request<T,K, z.infer<typeof categorySchema>>, res: Response) => {
    const { id } = req.params as { id: string};
    let categoryNotFound = false;

    try {
      await runInTransaction(async (session: ClientSession) => {
        const category = await Category.findByIdAndDelete(id, {
          session: session,
        });

        if (!category) {
          categoryNotFound = true;
          return;
        }

        await Dish.updateMany({ _id: { $in: category.dishes } }, { $pull: { categories: id } }, { session: session });
      });

      if (categoryNotFound) {
        return res.status(404).send({
          message: 'Category not found',
        });
      }

      return res.status(200).send({
        message: 'Category deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: 'An error occurred while deleting the category',
      });
    }
  },
);

export { router as deleteCategoriesRouter };
