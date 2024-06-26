import { ClientRoles, requireAuthorization } from '@hi/common';
import { Category, Dish } from '@hi/db-models';
import { categorySchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import express, { Request, Response } from 'express';
import { ClientSession } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';
//testing
const router = express.Router();

//TODO: remove v1 from the route
router.post(
  '/v1/categories',
  validateRequest({
    body: categorySchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async <T, K>(req: Request<T, K, z.infer<typeof categorySchema>>, res: Response) => {
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
      data: {},
    });
  },
);

router.post(
  '/v1/categories/:id/categories',

  async (req: Request, res: Response) => {
    let categories = req.body.categories;

    for (let i = 0; i < categories.length; i++) {
      await Category.create({
        businessId: categories[i].businessId,
        name: categories[i].name,
        visibility: categories[i].visibility,
        timerOn: categories[i].timerOn,
        timerStart: categories[i].timerStart,
        timerEnd: categories[i].timerEnd,
        availableDays: categories[i].availableDays,
        hierarchy: categories[i].hierarchy,
        parentCategory: categories[i].parentCategory,
        parentCategoryId: categories[i].parentCategoryId,
        coverImage: categories[i].coverImage,
        links: categories[i].links,
        dishes: categories[i].dishes,
        availability: categories[i].availability,
        charges: categories[i].charges,
        version: 0,
        _id: categories[i]._id,
      });
    }

    return res.status(201).send({
      message: 'Category created successfully',
      status: true,
      data: {},
    });
  },
);

export { router as createCategoryRouter };
