import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";

import { Category } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
import { CategoryType } from "@hi/db-models/src/validators";
const router = express.Router();

router.put("/v1/categories/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const update = { ...req.body };
  let updatedCategory: CategoryType | null = null;

  try {
    await runInTransaction(async (session: ClientSession) => {
      const category = await Category.findByIdAndUpdate<CategoryType>(
        id,
        { $set: update },
        { new: true, session: session }
      );

      updatedCategory = category;
    });

    if (!updatedCategory) {
      return res.status(404).send({
        message: "Category not found",
      });
    }

    return res.status(200).send(updatedCategory);
  } catch (error) {
    // handle error
  }
});

export { router as updateCategoriesRouter };
