import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";
import { Category, Dish, Extra } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";

const router = express.Router();

router.delete(
  "/v1/dishes/:id",

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    return runInTransaction(async (session) => {
      const dish = await Dish.findByIdAndDelete(req.params.id, {
        session: session,
      });

      if (!dish) {
        return res.status(404).send({
          message: "Dish not found",
        });
      }

      await Category.updateMany(
        { dishes: dish._id },
        { $pull: { dishes: dish._id } },
        { session: session }
      );

      return res.status(204).send(dish);
    });
  }
);

export { router as deleteDishesRouter };
