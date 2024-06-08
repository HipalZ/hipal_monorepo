import express, { Request, Response } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { Category, Dish, Extra } from '@hi/db-models';
import { ExtraAttrs, ExtraType, dishSchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
import { z } from 'zod';
const router = express.Router();

router.post(
  '/v1/dishes',
  validateRequest({
    body: dishSchema,
  }),
  async <T,K>(req: Request<T,K, z.infer<typeof dishSchema>>, res: Response) => {
    const {
      businessId,
      name,
      price,
      swiggy,
      discount,
      avgTime,
      dishType,
      categories,
      portions,
      extras,
      kitchenId,
      filters,
      images,
      description,
      tags,
      links,
      visibility,
      delayTime,
      availability,
    } = req.body;

    try {
      await runInTransaction(async (session: ClientSession) => {
        const dish = await Dish.create(
          [
            {
              businessId,
              name,
              price,
              swiggy,
              discount,
              avgTime,
              dishType,
              categories,
              portions,
              extras,
              kitchenId,
              filters,
              images,
              description,
              tags,
              links,
              visibility,
              delayTime,
              availability,
            },
          ],
          { session: session },
        );
        // @ts-ignore
        await Category.updateMany(
          // @ts-ignore
          { _id: { $in: categories } },
          // @ts-ignore
          { $push: { dishes: dish[0]._id } },
          { session: session },
        );
      });

      res.status(201).send('Dish created successfully');
    } catch (e) {
      // handle error
    }
  },
);

router.post(
  '/v1/dishes/extra',
  validateRequest({
    body: ExtraAttrs,
  }),
  async <T,K>(req: Request<T,K, z.infer<typeof ExtraAttrs>>, res: Response) => {
    const {
      businessId,
      name,
      numOptions,
      numSelections,
      compulsory,
      maxQuantity,
      addOnType,

      items,
    } = req.body;

    const extra = await Extra.create<ExtraType>({
      businessId,
      name,
      numOptions,
      numSelections,
      compulsory,
      maxQuantity,
      addOnType,

      items,
    });

    res.status(201).send(extra);
  },
);

// router.post(
//   "/v1/dishes/charges",
//   // validateDish,
//   // currentUser,
//   // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
//   // validateRequest,
//   async (req: Request, res: Response) => {
//     const { businessId, chargeName, chargeType, value, typeOfValue } = req.body;
//     const existingCharge = await Charges.findOne({ chargeName, businessId });
//     if (existingCharge) {
//       return res.status(400).send("already exist");
//     }

//     const charge = Charges.build({
//       businessId,
//       chargeName,
//       chargeType,
//       value,
//       typeOfValue,
//     });

//     await charge.save();

//     res.status(201).send(charge);
//   }
// );

export { router as createDishRouter };
