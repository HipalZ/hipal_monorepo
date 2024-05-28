import express, { Request, Response } from "express";
import {
  currentUser,
  requireAuthorization,
  validateRequest,
  ClientRoles,
} from "@hipal/common";
import { CategoryCreatedPublisher } from "../events/publishers/category-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import { validateCategory } from "./validators/new-category-validator";

import { Category } from "../models/category";

const router = express.Router();

router.post(
  "/v1/categories",
  validateCategory, 
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  validateRequest,
  async (req: Request, res: Response) => {
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

    const category = Category.build({
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
    });
    await category.save();

    await new CategoryCreatedPublisher(natsWrapper.client).publish({
      id: category.id,
      name: category.name,
      photo: category.coverImage,
      businessId: category.businessId,
      dishes: category.dishes,
    });

    res.status(201).send(category);
  }
);

export { router as createCategoryRouter };
