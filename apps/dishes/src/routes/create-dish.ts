import express, { Request, Response } from "express";
import {
  currentUser,
  requireAuthorization,
  validateRequest,
  ClientRoles,
} from "@hipal/common";
import { DishCreatedPublisher } from "../events/publishers/dish-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import { validateDish } from "./validators/new-dish-validator";

import { Dish } from "../models/dish";
import axios from "axios";
import { Menu } from "../models/menu";
import { Extra } from "../models/extra";
import { Charges } from "../models/charges";

const router = express.Router();

router.post(
  "/v1/dishes",
  validateDish,
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  validateRequest,
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

    const dish = Dish.build({
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
    });

    await dish.save();

    await new DishCreatedPublisher(natsWrapper.client).publish({
      id: dish.id,
      name: dish.name,
      // !FIX: event definition contains price as string
      price: dish.price.toString(),
      description: dish.description,
      photo: dish.images[0],
      businessId: dish.businessId,
      categories: dish.categories,
      dishType: dish.dishType,
    });
    res.status(201).send(dish);
  }
);

router.post(
  "/v1/dishes/menu",
  // validateDish,
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  // validateRequest,
  async (req: Request, res: Response) => {
    const { businessId, name, dishes } = req.body;
    const exitingMenu = await Menu.findOne({ name });
    if (exitingMenu) {
      return res.status(400).send("already created...!");
    }
    const menu = Menu.build({
      businessId,
      name,
      dishes,
    });

    await menu.save();

    res.status(201).send(menu);
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

router.post(
  "/v1/dishes/charges",
  // validateDish,
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  // validateRequest,
  async (req: Request, res: Response) => {
    const { businessId, chargeName, chargeType, value, typeOfValue } = req.body;
    const existingCharge = await Charges.findOne({ chargeName, businessId });
    if (existingCharge) {
      return res.status(400).send("already exist");
    }

    const charge = Charges.build({
      businessId,
      chargeName,
      chargeType,
      value,
      typeOfValue,
    });

    await charge.save();

    res.status(201).send(charge);
  }
);

export { router as createDishRouter };
