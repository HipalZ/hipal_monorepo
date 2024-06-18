import { Category, Dish } from '@hi/db-models';
import express, { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { categorySchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '@hi/common';

const router = express.Router();

//TODO: remove v1 from the route
router.post(
  '/v1/categories',
  validateRequest({
    body: categorySchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async <T,K>(req: Request<T,K, z.infer<typeof categorySchema>>, res: Response) => {
    const {
      businessId,
      name,
      visibility,
      timerOn,
      timerStart,
      timerEnd,
      availableDays,
      hierarchy,
      parentCategory,
      parentCategoryId,
      coverImage,
      links,
      dishes,
      availability,
      charges,
    } = req.body;
    await runInTransaction(async (session: ClientSession) => {
      const category = await Category.create(
        [
          {
            businessId,
            name,
            visibility,
            timerOn,
            timerStart,
            timerEnd,
            availableDays,
            hierarchy,
            parentCategory,
            parentCategoryId,
            coverImage,
            links,
            dishes,
            availability,
            charges,
            version: 0,
          },
        ],
        {
          session: session,
        },
      );

      if (!category) {
        throw new Error('Category creation failed');
      }
      // throw new Error("Category creation failed");
      // @ts-ignore
      const categoryId = category[0]._id;
      await Dish.updateMany({ _id: { $in: dishes } }, { $push: { categories: categoryId } }, { session });
    });
    //{error: ,message: data }
    return res.status(201).send({
      message: 'Category created successfully',
      status: true,
      data:{}
    });
  },
);

export { router as createCategoryRouter };
