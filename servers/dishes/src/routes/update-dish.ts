import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";
import { Category, Dish, Extra } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";

import { v4 as uuidv4 } from "uuid";
import { DishType } from "@hi/db-models/src/validators";

const router = express.Router();

router.put(
  "/v1/dishes/:id",

  async (req: Request, res: Response) => {
    return runInTransaction(async (session) => {
      const { id } = req.params;
      const update = { ...req.body } as DishType;
      const dish = await Dish.findByIdAndUpdate<DishType>(
        id,
        { $set: update },
        { new: true },
        { session: session }
      );
      if (!dish) {
        return res.status(404).send({
          message: "Dish not found",
        });
      }

      const categories = await Category.find({ dishes: dish._id });
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if (category.dishes.includes(dish._id.toString())) {
          category.dishes = category.dishes.filter(
            (dishId) => dishId.toString() !== dish._id.toString()
          );
          await category.save();
        }
      }
      return res.status(200).send(dish);
    });
  }
);

router.put(
  "/v1/dishes/:id/extra/:extraId",

  async (req: Request, res: Response) => {
    const { extraId } = req.params;
    const update = { ...req.body };
    let updateExtra = await Extra.findByIdAndUpdate(
      extraId,
      { $set: update },
      { new: true }
    );
    const dishes = await Dish.find({
      "extras.id": extraId,
    });

    const swiggyDishes = await Dish.find({
      "delivery.extras.id": extraId,
    });

    const copiedObject = {
      businessId: updateExtra?.businessId,
      name: updateExtra?.name,
      numOptions: updateExtra?.numOptions,
      numSelections: updateExtra?.numSelections,
      compulsory: updateExtra?.compulsory,
      maxQuantity: updateExtra?.maxQuantity,
      addOnType: updateExtra?.addOnType,
      items: updateExtra?.items,
      id: updateExtra?.id,
    };
    for (let i = 0; i < dishes?.length; i++) {
      const dishId = dishes[i]?.id;

      // Find the index of the object with the matching id in the extras array
      const extraIndex = dishes[i]?.extras.findIndex(
        (extra: any) => extra.id === extraId
      );

      if (extraIndex !== -1) {
        // If the object with the matching id is found, update it
        const update = {
          [`extras.${extraIndex}`]: copiedObject,
        };

        await Dish.findByIdAndUpdate(dishId, { $set: update }, { new: true });
      } else {
        console.log("Object not found in extras array");
      }
    }
    for (let i = 0; i < swiggyDishes?.length; i++) {
      const dishId = swiggyDishes[i]?.id;

      // Find the index of the object with the matching id in the extras array
      const extraIndex: any = swiggyDishes[i]?.delivery?.extras.findIndex(
        (extra: any) => extra.id === extraId
      );

      if (extraIndex !== -1) {
        // If the object with the matching id is found, update it
        const update: any = {
          [`delivery.extras.${extraIndex}`]: copiedObject,
        };

        await Dish.findByIdAndUpdate(dishId, { $set: update }, { new: true });
      } else {
        console.log("Object not found in extras array");
      }
    }

    res.status(200).send(updateExtra);
  }
);

router.put(
  "/v1/dishes/:id/getCharges/:chargeId",

  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  // validateExistingDish,
  // validateRequest,

  async (req: Request, res: Response) => {
    const { chargeId } = req.params;
    const update = { ...req.body };
    let updateExtra = await Charges.findByIdAndUpdate(
      chargeId,
      { $set: update },
      { new: true }
    );

    res.status(200).send(updateExtra);
  }
);

router.put(
  "/v1/dishes/:id/updateAll",

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const update = { ...req.body };
    const dishes = await Dish.find({ businessId });
    for (let i = 0; i < dishes?.length; i++) {
      let id = dishes[i]?.id || dishes[i]?._id;

      await Dish.findByIdAndUpdate(id, { $set: update }, { new: true });
    }

    res.status(200).send("updated successFully");
  }
);

router.put(
  "/v1/dishes/:id/extrasLogicUpdate",

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    let allDishes = await Dish.find({ businessId }).lean();
    const filteredDishesWithExtras = allDishes?.filter(
      (dish: any) => dish?.extras?.length > 0
    );
    filteredDishesWithExtras?.map(async (dish: any) => {
      const newExtra = dish.extras.map((extra: any) => {
        const updatedExtra = {
          ...extra,
          addOnType:
            extra.addOnType !== undefined || extra.addOnType === "single"
              ? extra.addOnType
              : "multiple",
          id: extra.id !== undefined ? extra.id : uuidv4(),
          maxQuantity: extra.maxQuantity !== undefined ? extra.maxQuantity : 1,
        };
        if (extra.items && extra.items.length > 0) {
          updatedExtra.items = extra.items.map((item: any) => {
            return {
              ...item,
              ExtraType: item.ExtraType !== undefined ? item.ExtraType : "veg",
              id: item.id !== undefined ? item.id : uuidv4(),
              maxQuantity:
                item.maxQuantity !== undefined ? item.maxQuantity : 1,
              visibility:
                item.visibility !== undefined ? item.visibility : true,
              availability:
                item.availability !== undefined ? item.availability : true,
            };
          });
        }
        return updatedExtra;
      });
      await Dish.findByIdAndUpdate(
        dish?.id || dish?._id,
        { $set: { extras: newExtra } },
        { new: true }
      );
      return { ...dish, extras: newExtra };
    });
    res.status(200).send(filteredDishesWithExtras);
  }
);

export { router as updateDishesRouter };
