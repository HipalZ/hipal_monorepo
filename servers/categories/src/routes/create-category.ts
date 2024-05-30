import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";

import { Category, Dish } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
import { CategoryType, DishType } from "@hi/db-models/src/validators";

const router = express.Router();

router.post(
  "/v1/categories",

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

    return runInTransaction(async (session: ClientSession) => {
      const category = await Category.create<CategoryType>(
        {
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
          version: 0,
        },
        {
          session: session,
        }
      );
      await Dish.updateMany(
        { _id: { $in: dishes.map((dish: DishType) => dish._id) } },
        { $push: { categories: category._id } },
        { session }
      );

      return res.status(201).send(category);
    });
  }
);

export { router as createCategoryRouter };
