import express, { Request, Response } from 'express';
import { Category, Dish } from '@hi/db-models';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
import { validateRequest } from 'zod-express-middleware';
import { categorySchema } from '@hi/db-models/src/validators';
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '@hi/common';

const router = express.Router();

router.delete(
  '/v1/categories/:id',
  validateRequest({
    body: categorySchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER,ClientRoles.RESTAURANT_STAFF]),
  async <T,K>(req: Request<{ id: string }, {}, z.infer<typeof categorySchema>>, res: Response) => {
    const { id } = req.params;
    let categoryNotFound = false;

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
        err:false,
        message: 'Category deleted successfully',
        data:{}
      });
  },
);

export { router as deleteCategoriesRouter };
