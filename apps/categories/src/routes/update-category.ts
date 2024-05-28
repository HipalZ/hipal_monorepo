import express, { Request, Response } from 'express';
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from '@hipal/common';
import { CategoryEditedPublisher } from '../events/publishers/category-edited-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Category } from '../models/category';
import { validateCategoryEdit } from './validators/edit-category-validator';

const router = express.Router();

router.put(
  '/v1/categories/:id',
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  validateCategoryEdit,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    await Category.findByIdAndUpdate(id, update);

    const category = await Category.findById(id);

    if (!category) {
      throw new NotFoundError();
    }

    await new CategoryEditedPublisher(natsWrapper.client).publish({
      id: category.id,
      name: category.name,
      photo: category.coverImage,
      businessId: category.businessId,
      dishes: category.dishes,
    });

    res.status(200).send(category);
  }
);

export { router as updateCategoriesRouter };
