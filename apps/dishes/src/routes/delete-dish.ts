import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { DishDeletedPublisher } from "../events/publishers/dish-deleted-publisher";
import { natsWrapper } from "../nats-wrapper";
import { Dish } from "../models/dish";
import { Charges } from "../models/charges";

const router = express.Router();

router.delete(
  "/v1/dishes/:id",
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingDish = await Dish.findByIdAndDelete(id);

    if (!existingDish) {
      throw new NotFoundError();
    }

    await new DishDeletedPublisher(natsWrapper.client).publish({
      id,
    });

    res.status(200).send({});
  }
);

router.delete(
  "/v1/dishes/:id/getCharges/:chargeId",
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

  async (req: Request, res: Response) => {
    const { chargeId } = req.params;
    let updateExtra = await Charges.findByIdAndDelete(chargeId);

    res.status(200).send(updateExtra);
  }
);

export { router as deleteDishesRouter };
