import express, { Request, Response } from "express";
// import { validateDish } from "./validators/new-dish-validator";

import { Category, Dish, Extra } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
const router = express.Router();

export const createPayment = (
  data: Record<string, any>,
  session: ClientSession
) => {
  console.log("payment data", data);

  // await Payment.create(data, { session: session });
  return data;
};

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
      dineIn,
      take_away,
      delivery,
      taxes,
    } = req.body;
    const { menuType } = req.query;
    if (menuType) {
      if (menuType == "take-away") {
        req.body["take_away"] = take_away;
      }
      if (menuType == "delivery") {
        req.body["delivery"] = delivery;
      }
    }

    return runInTransaction(async (session) => {
      const dish = Dish.create(
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
          dineIn,
          take_away,
          delivery,
          taxes,
        },
        {
          session: session,
        }
      );

      // api  call X
      // api call X

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
