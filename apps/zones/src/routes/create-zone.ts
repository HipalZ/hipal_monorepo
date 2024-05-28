import express, { Request, Response } from "express";
import {
  currentUser,
  requireAuthorization,
  validateRequest,
  ClientRoles,
  NotAuthorizedError,
  NotFoundError,
} from "@hipal/common";
import { validateZone } from "./validators/new-zone-validator";
import { validateTable } from "./validators/new-table-validator";

import { Zone } from "../models/zone";
import { Table } from "../models/table";
import { Swiggy } from "../models/swiggy";

const router = express.Router();

router.post(
  "/v1/zones",
  validateZone,
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      businessId,
      zoneName,
      zoneType,
      startTime,
      endTime,
      staff,
      tables,
      Occupied,
      charges,
    } = req.body;

    const zone = Zone.build({
      businessId,
      zoneName,
      zoneType,
      startTime,
      endTime,
      staff,
      tables,
      Occupied,
      charges,
    });
    await zone.save();

    res.status(201).send(zone);
  }
);

router.post(
  "/v1/zones/:zoneId/tables",
  validateTable,
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const {
        businessId,
        name,
        capacity,
        staff,
        status,
        activeUser,
        time,
        totalDishQuantity,
        deliverdDish,
        role,
        hiCode,
        hierarchy,
        parentTableId,
        parentZoneId,
        mergeTables,
        isMerge,
      } = req.body;
      const { zoneId } = req.params;
      const existingTableName = await Table.findOne({ name, zoneId });
      if (existingTableName)
        return res
          .status(400)
          .send({ status: false, message: "TableName must be unique ...!" });
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        throw new NotFoundError();
      }

      for (let i = 0; i < staff?.length; i++) {
        if (!zone.staff.includes(staff[i])) {
          throw new NotAuthorizedError();
        }
      }

      const table = Table.build({
        businessId,
        zoneId,
        name,
        capacity,
        staff,
        status,
        activeUser,
        time,
        totalDishQuantity,
        deliverdDish,
        role,
        hiCode,
        hierarchy,
        parentTableId,
        parentZoneId,
        mergeTables,
        isMerge,
      });
      await table.save();

      zone.tables.push(table.id);
      await zone.save();

      res.status(201).send(table);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.post("/v1/zones/:zoneId/swiggy", async (req: Request, res: Response) => {
  try {
    const {
      zoneName,
      action,
      charge,
      commission,
      commissionName,
      chargeName,
      businessId,
      password,
    } = req.body;

    if (!zoneName) {
      return res.status(400).send("zoneName and charge is required");
    }

    let zone = await Swiggy.findOne({ zoneName, businessId });

    if (!zone) {
      let addCharges = [charge];
      let commissions = [commission];
      let pass = Math.floor(Math.random() * 9000) + 1000;
      let body = req.body;
      body["addCharges"] = addCharges;
      body["commisions"] = commissions;
      const newZone = new Swiggy({ ...req.body, password: password || pass });
      await newZone.save();
      return res.send(newZone);
    } else {
      if (action === "add") {
        const updatedZone = await Swiggy.findOneAndUpdate(
          { zoneName, businessId },
          { $addToSet: { addCharges: charge, commisions: commission } },
          { new: true }
        );

        return res.send(updatedZone);
      } else if (action === "update") {
        await Swiggy.findOneAndUpdate(
          { zoneName, businessId },
          {
            $pull: {
              addCharges: {
                chargeName: chargeName,
                commissionName: commissionName,
              },
            },
          },
          { new: true }
        );
        const updatedZone = await Swiggy.findOneAndUpdate(
          { zoneName, businessId },
          { $addToSet: { addCharges: charge, commisions: commission } },
          { new: true }
        );
        return res.send(updatedZone);
      } else if (action === "remove") {
        if (!chargeName) {
          return res.status(400).send("chargeName is required");
        }

        const updatedZone = await Swiggy.findOneAndUpdate(
          { zoneName, businessId },
          {
            $pull: {
              addCharges: {
                chargeName: chargeName,
                commissionName: commissionName,
              },
            },
          },
          { new: true }
        );

        return res.send(updatedZone);
      } else {
        return res.status(400).send("enter valid action");
      }
    }
  } catch (error) {
    console.log("err", error);
    return res.status(500).send(error);
  }
});

router.post(
  "/v1/zones/:zoneId/bulkTables",
  //validateTable,
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  // validateRequest,
  async (req: Request, res: Response) => {
    try {
      let { tables } = req.body;
      const { zoneId } = req.params;

      for (let i = 0; i < tables?.length; i++) {
        let staff: any = tables[i]?.staff;

        let name: any = tables[i]?.name;
        const existingTableName = await Table.findOne({ name, zoneId });
        if (existingTableName)
          return res
            .status(400)
            .send({ status: false, message: "TableName must be unique ...!" });
        const zone = await Zone.findById(zoneId);

        if (!zone) {
          throw new NotFoundError();
        }

        for (let i = 0; i < staff?.length; i++) {
          if (!zone.staff.includes(staff[i])) {
            throw new NotAuthorizedError();
          }
        }

        const table = new Table({ ...tables[i], zoneId });
        await table.save();

        zone.tables.push(table.id);
        await zone.save();
      }
      const zone = await Zone.findById(zoneId);

      return res.send(zone);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as createZoneRouter };
