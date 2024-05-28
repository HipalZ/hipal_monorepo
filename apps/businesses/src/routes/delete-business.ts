import express, { Request, Response } from 'express';
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from '@hipal/common';
import { natsWrapper } from '../nats-wrapper';
import { Role } from '../models/role';
import { Business } from "../models/business";

const router = express.Router();

router.delete(
  '/v1/businesses/:businessId',
  currentUser,
  requireAuthorization([ClientRoles.HIPAL_ADMIN]),
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const existingBusiness = await Business.findByIdAndDelete(businessId);
    res.status(200).send({});
  }
);

router.delete(
  '/v1/businesses/:businessId/role/:id',
  currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingRole = await Role.findByIdAndDelete(id);

    if (!existingRole) {
      throw new NotFoundError();
    }

    res.status(200).send({});
  }
);

export { router as deleteBusinessesRouter };
