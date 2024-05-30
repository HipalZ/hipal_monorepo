import express, { Request, Response } from "express";
// import { validateDish } from "./validators/new-dish-validator";

import { Category, Dish, Extra } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
import { DishType } from "@hi/db-models/src/validators";
const router = express.Router();

router.post(
  "/v1/dishes",
  // validateDish,

  async (req: Request, res: Response) => {
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

    return runInTransaction(async (session) => {
      const dish = await Dish.create<DishType>(
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
        {
          session: session,
        }
      );
      await Category.updateMany(
        { _id: { $in: categories } },
        { $push: { dishes: dish._id } },
        { session: session }
      );

      res.status(201).send(dish);
    });
  }
);

router.post(
  "/v1/dishes/extra",
  // validateDish,
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  // validateRequest,
  async (req: Request, res: Response) => {
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

    const extra = Extra.build({
      businessId,
      name,
      numOptions,
      numSelections,
      compulsory,
      maxQuantity,
      addOnType,

      items,
    });

    await extra.save();

    res.status(201).send(extra);
  }
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
