import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { Zone } from "../models/zone";
import { Table } from "../models/table";

const router = express.Router();

router.delete(
  "/v1/zones/:id",
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const zone = await Zone.findById(id);
    if (zone?.Occupied != 0) {
      return res
        .status(400)
        .send("You cann't delete active zone ,zone must be empty");
    }

    const existingZone = await Zone.findByIdAndDelete(id);

    if (!existingZone) {
      throw new NotFoundError();
    }

    res.status(200).send({});
  }
);

router.delete(
  "/v1/zones/:zoneId/tables/:id",
  currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;
    const existingZone = await Zone.findById(zoneId);
    const existingTable = await Table.findById(id);
    if (existingTable?.status == "Active") {
      return res
        .status(400)
        .send("You cann't delete active table ,table must be empty !");
    }

    if (!existingZone) {
      throw new NotFoundError();
    }

    const deleteExistingTable = await Table.findByIdAndDelete(id);

    if (!deleteExistingTable) {
      throw new NotFoundError();
    }

    existingZone.tables.splice(existingZone.tables.indexOf(id), 1);
    await existingZone.save();

    res.status(200).send({});
  }
);

export { router as deleteZonesRouter };
