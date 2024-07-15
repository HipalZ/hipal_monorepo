// books.ts
import { Category, Dish, User } from '@hi/db-models';


import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '../../utils/response';

const categoriesRouter = new Hono().get(
  '/',

  zValidator('query', z.object({ businessId: z.string() })),
  async (c) => {
    const { businessId } = c.req.query();

    const existingCategories = await Category.find({ businessId }).populate({
      path: 'dishes', // Populate dishes
      populate: {
        path: 'extras', // Within each dish, populate extras
      },
    });

    return respond(c, 'Categories fetched successfully', false, 200, existingCategories);
  },
).get(
  '/:id',

  zValidator('param', z.object({ id: z.string() })),
  async (c) => {
    const { id } = c.req.param();

    const existingCategory = await Category.findById(id).populate({
      path: 'dishes', // Populate dishes
      populate: {
        path: 'extras', // Within each dish, populate extras
      },
    });

    if (!existingCategory) return respond(c, 'Category not found', true, 404, {});

    return respond(c, 'Categories fetched successfully', false, 200, existingCategory);
  },
);

export default categoriesRouter;
