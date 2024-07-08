// books.ts
import { Dish, User } from '@hi/db-models';
import type { DishType } from '@hi/db-models/src/validators';
import { paramsSchema } from '@hi/db-models/src/validators';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const dishesRouter = new Hono()
  .get(
    '/',

    zValidator('query', paramsSchema),
    async (c) => {
      const { businessId } = c.req.query();

      const existingDishes = await Dish.find({
        businessId,
      }).populate(['categories', 'extras', 'filters.dishes']);

      return c.json({
        data: existingDishes,
        status: 200,
        err: false,
      });
    },
  )
  .get('/:id', zValidator('param', paramsSchema), async (c) => {
    const { id } = c.req.param();
    const existingDish = await Dish.findById(id).populate(['categories', 'extras', 'filters.dishes']);
    return c.json({
      data: existingDish,
      status: 200,
      err: false,
    });
  });

export default dishesRouter;
