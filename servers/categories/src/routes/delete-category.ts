import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";
import { Category } from "@hi/db-models";

const router = express.Router();

router.delete(
  "/v1/categories/:id",

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingCategory = await Category.findByIdAndDelete(id);

    res.status(200).send({});
  }
);

export { router as deleteCategoriesRouter };
