import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { Settings } from "../models/settings";

const router = express.Router();

router.get(
  "/v1/settings",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingSettings = await Settings.find({
      businessId,
    });

    if (!existingSettings) {
      throw new NotFoundError();
    }

    res.status(200).send(existingSettings);
  }
);

router.get(
  "/v1/settings/:id",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingSettings = await Settings.findById(id);

    if (!existingSettings) {
      throw new NotFoundError();
    }

    res.status(200).send(existingSettings);
  }
);

router.get(
  "/v1/settings/business/setting",

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingSettings = await Settings.find({
      businessId,
    });

    if (!existingSettings) {
      throw new NotFoundError();
    }

    res.status(200).send(existingSettings);
  }
);

router.get(
  "/v1/settings/Check/Business",

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingSettings = await Settings.find({
      businessId,
    });

    res.status(200).send(existingSettings);
  }
);

export { router as readSettingsRouter };
