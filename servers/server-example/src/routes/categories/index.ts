// books.ts
import { Category, Dish, User } from '@hi/db-models';
import type { DishType } from '@hi/db-models/src/validators';
import { paramsSchema } from '@hi/db-models/src/validators';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const categoriesRouter = new Hono().get(
  '/',

  zValidator('query', paramsSchema),
  async (c) => {
    const { businessId } = c.req.query();

    const existingCategories = await Category.find({ businessId }).populate({
      path: 'dishes', // Populate dishes
      populate: {
        path: 'extras', // Within each dish, populate extras
      },
    });

    return c.json({
      data: existingCategories,
      status: 200,
      error: false,
    });
  },
);

export default categoriesRouter;
