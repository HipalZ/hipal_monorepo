import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";

import { Category } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";

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

    const category = await Category.create({
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

    res.status(201).send(category);
  }
);

export { router as createCategoryRouter };
