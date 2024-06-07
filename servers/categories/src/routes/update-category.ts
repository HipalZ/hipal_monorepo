import express, { Request, Response } from 'express';

import { Category, Dish } from '@hi/db-models';
import { CategoryType } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
const router = express.Router();

router.put('/v1/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const update = { ...req.body };
  let updatedCategory: CategoryType | null = null;

  try {
    await runInTransaction(async (session: ClientSession) => {
      // Find the current category to check existing dishes
      const currentCategory = await Category.findById<CategoryType>(id).session(session);
      if (!currentCategory) {
        throw new Error('Category not found');
      }

      const updatedDishes = update.dishes || [];
      const currentDishes = currentCategory.dishes || [];

      // Update the category
      const category = await Category.findByIdAndUpdate<CategoryType>(id, { $set: update }, { new: true, session: session });

      if (!category) {
        throw new Error('Failed to update category');
      }

      // Handle new dishes added to the category
      const newDishes = updatedDishes.filter((dish: string) => !currentDishes.includes(dish.toString()));
      await Dish.updateMany({ _id: { $in: newDishes } }, { $addToSet: { categories: id } }, { session: session });

      // Handle existing dishes removed from the category
      const removedDishes = currentDishes.filter((dish) => !updatedDishes.includes(dish.toString()));
      await Dish.updateMany({ _id: { $in: removedDishes } }, { $pull: { categories: id } }, { session: session });

      updatedCategory = category;
    });

    if (!updatedCategory) {
      return res.status(404).send({
        message: 'Category not found',
      });
    }

    return res.status(200).send('updated successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: 'An error occurred while updating the category',
    });
  }
});

export { router as updateCategoriesRouter };
