import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";
import { Category, Dish, Charges, Extra, Menu } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";

const router = express.Router();

router.delete(
  "/v1/dishes/:id",

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingDish = await Dish.findByIdAndDelete(id);

    res.status(200).send(existingDish);
  }
);

router.delete(
  "/v1/dishes/:id/getCharges/:chargeId",

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

  async (req: Request, res: Response) => {
    const { chargeId } = req.params;
    let updateExtra = await Charges.findByIdAndDelete(chargeId);

    res.status(200).send(updateExtra);
  }
);

export { router as deleteDishesRouter };
