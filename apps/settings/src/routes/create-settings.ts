import express, { Request, Response } from "express";
import axios from "axios";
import {
  currentUser,
  requireAuthorization,
  validateRequest,
  ClientRoles,
} from "@hipal/common";
import { validateSettings } from "./validators/new-settings-validator";

import { Settings } from "../models/settings";

const router = express.Router();

router.post(
  "/v1/settings",
  currentUser,
  requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  validateSettings,
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { businessId, themes, explore, navigation, categoryOrder } =
        req.body;

      const settings = Settings.build({
        businessId,
        themes,
        explore,
        navigation,
        categoryOrder,
      });

      await settings.save();

      return res.status(201).send(settings);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as createSettingsRouter };
