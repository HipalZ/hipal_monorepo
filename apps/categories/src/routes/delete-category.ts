import express, { Request, Response } from 'express';
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from '@hipal/common';
import { CategoryDeletedPublisher } from '../events/publishers/category-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Category } from '../models/category';

const router = express.Router();

router.delete(
  '/v1/categories/:id',
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingCategory = await Category.findByIdAndDelete(id);

    if (!existingCategory) {
      throw new NotFoundError();
    }

    await new CategoryDeletedPublisher(natsWrapper.client).publish({
      id: existingCategory.id,
    });

    res.status(200).send({});
  }
);

export { router as deleteCategoriesRouter };
