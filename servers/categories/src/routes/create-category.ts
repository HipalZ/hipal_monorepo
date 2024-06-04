import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";

import { Category, Dish } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
import { CategoryType, DishType } from "@hi/db-models/src/validators";

const router = express.Router();

router.post("/v1/categories", async (req: Request, res: Response) => {
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

  try {
    await runInTransaction(async (session: ClientSession) => {
      const category = await Category.create(
        [
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
        ],
        {
          session: session,
        }
      );

      if (!category) {
        throw new Error("Category creation failed");
      }
      console.log("dish", dishes);
      // @ts-ignore
      const categoryId = category._id;
      const g = await Dish.find();
      console.log("Category created", g);
    });

    return res.status(201).send("Category created");
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

export { router as createCategoryRouter };
