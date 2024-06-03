import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";
import { Category, Dish } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";

const router = express.Router();

router.delete(
  "/v1/categories/:id",
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let categoryNotFound = false;

    try {
      await runInTransaction(async (session: ClientSession) => {
        const category = await Category.findByIdAndDelete(id, {
          session: session,
        });

        if (!category) {
          categoryNotFound = true;
          return;
        }

        // await Dish.updateMany(
        //   { _id: { $in: category.dishes.map((dish) => dish._id) } },
        //   { $pull: { categories: id } }
        // );
      });

      if (categoryNotFound) {
        return res.status(404).send({
          message: "Category not found",
        });
      }

      return res.status(204).send("ss");
    } catch (error) {
      // handle error
    }
  }
);

export { router as deleteCategoriesRouter };
