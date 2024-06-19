import express, { Request, Response } from 'express';

import { Category, Dish, Extra } from '@hi/db-models';
import { paramsSchema } from '@hi/db-models/src/validators';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.get(
  '/v1/dishes',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId, active, queryDish } = req.query;
    const query = { businessId, queryDish };
    let existingDishes: any;
    if (queryDish) {
      existingDishes = await Dish.find(query).select('businessId name id availability visibility dishType kitchenId').populate('categories extras');
      return res.status(200).send(existingDishes);
    }
    existingDishes = await Dish.find({
      businessId,
    }).populate(['categories', 'extras', 'filters.dishes']);
    let Active = 0;
    let visible = 0;
    let available = 0;
    if (active) {
      existingDishes.forEach((element: any) => {
        if (element?.visibility && element?.availability) {
          Active += 1;
        }
        if (element?.visibility) {
          visible += 1;
        }
        if (element?.availability) available += 1;
      });

      return res.status(200).send({ active: Active, visible, available });
    }

    res.status(200).send(existingDishes);
  },
);

router.get('/v1/dishes/:id/test', async (req: Request, res: Response) => {
  res.status(200).send('Hello');
});

router.get(
  '/v1/dishes/:id',
  validateRequest({
    params: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingDish = await Dish.findById(id).populate(['categories', 'extras', 'filters.dishes']);
    res.status(200).send(existingDish);
  },
);

router.get(
  '/v1/dishes/:businessId/categories',

  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const existingCategories = await Category.find({
      businessId,
    });

    res.status(200).send(existingCategories);
  },
);

router.get(
  '/v1/dishes/All/Dishes',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingDishes = await Dish.find({
      businessId,
    }).select('name price dishType portions.name portions.price extras images description id kitchenId  availability visibility');

    res.status(200).send(existingDishes);
  },
);

router.get(
  '/v1/dishes/:id/takeawayDishes',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingDishes = await Dish.find({
      businessId,
    }).select('name price dishType portions.name portions.price extras images description id kitchenId delivery availability visibility');

    res.status(200).send(existingDishes);
  },
);

router.get(
  '/v1/dishes/:id/deliveryDishes',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingDishes = await Dish.find({
      businessId,
    }).select('name price dishType portions.name portions.price extras images description id kitchenId take_away availability visibility');

    res.status(200).send(existingDishes);
  },
);

router.get(
  '/v1/dishes/CheckDishes/Business',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingDishes = await Dish.find({
      businessId,
    });
    res.status(200).send(existingDishes);
  },
);

router.get(
  '/v1/dishes/:id/getExtra',

  async (req: Request, res: Response) => {
    const { id, businessId, queryExtra } = req.query;
    let existingExtra;
    const query = { businessId, queryExtra };
    if (queryExtra) {
      existingExtra = await Extra.find(query).select('businessId name id items availability visibility');
      return res.status(200).send(existingExtra);
    }

    existingExtra = await Extra.find({ businessId });

    res.status(200).send(existingExtra);
  },
);

router.get(
  '/v1/dishes/:id/getExtra/:extraId',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { extraId } = req.params;

    const existingExtra = await Extra.findById(extraId);

    res.status(200).send(existingExtra);
  },
);

router.get(
  '/v1/dishes/:id/analytics',
  validateRequest({
    query: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    let existingDishes = await Dish.find({
      businessId,
    }).select('name');

    res.status(200).send(existingDishes);
  },
);
export { router as readDishesRouter };
