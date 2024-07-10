// books.ts
import { Dish, UniquelyYours, User } from '@hi/db-models';
import type { DishType } from '@hi/db-models/src/validators';
import { paramsSchema, TokenValidator, uniquelyYoursSchema } from '@hi/db-models/src/validators';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '../../../middleware/authorization';
import { authTokenValidator } from '../../../middleware/tokenValidator';
import { respond } from '../../utils/response';

const dishesRouter = new Hono()
  .get(
    '/',

    zValidator('query', paramsSchema),
    async (c) => {
      const { businessId, UniquelyYours } = c.req.query();
      if (UniquelyYours) {
        const existingDishes = await Dish.find({ businessId, 'categories.0': { $exists: true } }).select(' _id businessId name dishType images');
        return respond(c, 'Dishes fetched successfully', false, 200, existingDishes);
      }

      const existingDishes = await Dish.find({
        businessId,
      }).populate(['categories', 'extras', 'filters.dishes']);

      return respond(c, 'Dishes fetched successfully', false, 200, existingDishes);
    },
  )
  .post(
    '/uniquelyYours',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator(
      'json',
      z.object({
        dishArray: z.array(uniquelyYoursSchema),
      }),
    ),

    zValidator('header', TokenValidator),
    async (c) => {
      const { dishArray } = await c.req.json();
      const businessId = dishArray[0]?.businessId;
      const removeOldDishes = await UniquelyYours.updateMany({ businessId }, { isDeleted: true });
      if (!removeOldDishes) return respond(c, 'Error in updating dishes', true, 400, {});
      const createUniquelyYours = await UniquelyYours.insertMany(dishArray);
      if (!createUniquelyYours) return respond(c, 'Error in updating dishes', true, 400, {});

      return respond(c, 'Dishes updated successfully', false, 201, createUniquelyYours);
    },
  )
  .get(
    '/uniquelyDishes/:businessId',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator('param', z.object({ businessId: z.string() })),

    zValidator('header', TokenValidator),
    async (c) => {
      const { businessId } = c.req.param();

      const dishes = await UniquelyYours.find({ businessId, isDeleted: false });

      return respond(c, 'Dishes fetched successfully', false, 200, dishes);
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
