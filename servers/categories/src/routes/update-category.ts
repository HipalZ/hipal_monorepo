import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";

import { Category } from "@hi/db-models";

const router = express.Router();

router.put(
  "/v1/categories/:id",

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    await Category.findByIdAndUpdate(id, update);

    const category = await Category.findById(id);

    res.status(200).send(category);
  }
);

export { router as updateCategoriesRouter };
