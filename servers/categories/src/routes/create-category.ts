import express, { Request, Response } from "express";

import { natsWrapper } from "../nats-wrapper";

import { Category, Dish } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
import { CategoryType, categorySchema } from "@hi/db-models/src/validators";
// import { validateRequest } from "../middleware/request";
import { validateRequest, RequestValidation } from "zod-express-middleware";
import { z } from "zod";
const router = express.Router();

//TODO: remove v1 from the route
router.post(
  "/v1/categories",
  validateRequest({
    params: z.object({
      urlParameter: z.string(),
    }),
    body: categorySchema,
    query: z.object({
      queryKey: z.string().length(64),
    }),
  }),
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

    await runInTransaction(async (session: ClientSession) => {
      const category = await Category.create(
        [
          {
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
            version: 0,
          },
        ],
        {
          session: session,
        }
      );

      if (!category) {
        throw new Error("Category creation failed");
      }
      // throw new Error("Category creation failed");
      // @ts-ignore
      const categoryId = category[0]._id;
      let dish = await Dish.updateMany(
        { _id: { $in: dishes } },
        { $push: { categories: categoryId } },
        { session }
      );
    });
    //{error: ,message: data }
    return res.status(200).send("Category created");
  }
);

export { router as createCategoryRouter };
