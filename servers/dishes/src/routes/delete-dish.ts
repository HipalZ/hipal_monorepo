import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";
import { Category, Dish, Extra } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";

const router = express.Router();

router.delete(
  "/v1/dishes/:id",
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let dishNotFound = false;

    try {
      await runInTransaction(async (session: ClientSession) => {
        const dish = await Dish.findByIdAndDelete(id, {
          session: session,
        });

        if (!dish) {
          dishNotFound = true;
          return;
        }

        await Category.updateMany(
          { dishes: dish._id },
          { $pull: { dishes: dish._id } },
          { session: session }
        );
      });

      if (dishNotFound) {
        return res.status(404).send({
          message: "Dish not found",
        });
      }

      return res.status(204).send();
    } catch (error) {
      // handle error
    }
  }
);

export { router as deleteDishesRouter };
