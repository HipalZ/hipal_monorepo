import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { Zone } from "../models/zone";
import { Table } from "../models/table";
import { Swiggy } from "../models/swiggy";

const router = express.Router();

router.get(
  "/v1/zones",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId, swiggy, zoneId, zomato } = req.query;
    if (swiggy) {
      const existingZone =
        (await Swiggy.findOne({
          businessId,
          zoneName: "swiggy",
        })) || {};
      return res.status(200).send(existingZone);
    }
    if (zomato) {
      const existingZone =
        (await Swiggy.findOne({
          businessId,
          zoneName: "zomato",
        })) || {};
      return res.status(200).send(existingZone);
    }
    const existingZones = await Zone.find({
      businessId,
    });

    if (!existingZones) {
      throw new NotFoundError();
    }

    res.status(200).send(existingZones);
  }
);

router.get(
  "/v1/zones/withTables",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingZones = await Zone.find({
      businessId,
    });
    const existingTables = await Table.find({
      businessId,
    });
    const ans = existingZones.map((zone: any) => ({
      zoneName: zone.zoneName,
      tables: existingTables.filter((table: any) => table.zoneId === zone.id),
    }));

    res.status(200).send(ans);
  }
);

router.get(
  "/v1/zones/getAllZoneByWaiter",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { businessId, waiterId } = req.query;
      const filteredZones = await Zone.find({
        businessId,
        staff: waiterId,
      }).select("zoneName staff id zoneType Occupied tables");

      return res.status(200).send({ status: true, data: filteredZones });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/zones/:id",
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingZone = await Zone.findById(id);

    if (!existingZone) {
      throw new NotFoundError();
    }

    res.status(200).send(existingZone);
  }
);

router.get("/v1/zones/:id/SingleZone", async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingZone = await Zone.findById(id);

  if (!existingZone) {
    throw new NotFoundError();
  }

  res.status(200).send(existingZone);
});

router.get(
  "/v1/zones/:zoneId/tables",
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { zoneId } = req.params;
      const { businessId, staffId } = req.query;
      let existingTables;
      if (zoneId === "all") {
        existingTables = await Table.find({ businessId });
      } else {
        existingTables = await Table.find({ zoneId, businessId });
      }

      if (!existingTables) {
        throw new NotFoundError();
      }

      //  existingTables= existingTables.filter((ele:any)=> ele?.staff.includes(staffId))

      res.status(200).send(existingTables);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/zones/:zoneId/tables/ByWaiter",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { zoneId } = req.params;
      const { businessId, staffId } = req.query;
      let existingTables;
      if (zoneId === "all") {
        existingTables = await Table.find({ businessId });
      } else {
        existingTables = await Table.find(
          {
            zoneId,
            businessId,
            staff: staffId,
          },
          { businessId: 0, staff: 0 }
        );
      }

      if (!existingTables) {
        throw new NotFoundError();
      }

      res.status(200).send(existingTables);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/zones/:zoneId/get/Tables",
  async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const { businessId, staffId } = req.query;
    let existingTables;
    if (zoneId === "all") {
      existingTables = await Table.find({ businessId });
    } else {
      existingTables = await Table.find({ businessId });
    }
    let zone = await Zone.findById(zoneId);
    // console.log("tablein zones",existingTables)

    if (!existingTables) {
      throw new NotFoundError();
    } ///find all table in zone then sort table base on staffId

    let tables = [...existingTables];

    existingTables = existingTables.filter((ele: any) =>
      ele?.staff.includes(staffId)
    );

    if (existingTables?.length == 0) {
      if (zone?.staff?.includes(staffId as string)) {
        return res.status(200).send(tables);
      }
    }

    res.status(200).send(existingTables);
  }
);

router.get(
  "/v1/zones/:zoneId/tables/:id",
  currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;

    const existingZone = await Zone.findById(zoneId);

    if (!existingZone) {
      throw new NotFoundError();
    }

    const existingTable = await Table.findById(id);

    if (!existingTable) {
      throw new NotFoundError();
    }

    res.status(200).send(existingTable);
  }
);

router.get(
  "/v1/zones/:zoneId/tables/:id/SingleTable",

  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;

    const existingTable = await Table.findById(id);

    if (!existingTable) {
      throw new NotFoundError();
    }

    res.status(200).send(existingTable);
  }
);

router.get(
  "/v1/zones/WithTables/Zones",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingZones = await Zone.find({
      businessId,
    });
    const existingTables = await Table.find({
      businessId,
    });
    if (existingZones?.length == 0 && existingTables?.length == 0) {
      return res.status(400).send("Tables and Zones not Found");
    }
    const ans = existingZones.map((zone: any) => ({
      zoneName: zone.zoneName,
      tables: existingTables.filter((table: any) => table.zoneId === zone.id),
    }));

    res.status(200).send(ans);
  }
);

router.get(
  "/v1/zones/WaiterCalling/kitchen",

  async (req: Request, res: Response) => {
    const { businessId, staffId } = req.query;

    const existingTables = await Table.find({
      businessId,
    });
    let tables = existingTables.filter((table: any) =>
      table?.staff.includes(staffId)
    );
    const singleTable = tables?.[0] || {};

    res.status(200).send(singleTable);
  }
);

router.get(
  "/v1/zones/:zoneId/tablesByZones",
  currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
  ]),
  async (req: Request, res: Response) => {
    try {
      const { zoneId } = req.params;
      const { businessId } = req.query;
      const zone = await Zone.findById(zoneId);
      let existingTables = await Table.find(
        { zoneId, businessId },
        {
          capacity: 0,
          staff: 0,
          activeUser: 0,
          time: 0,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: 0,
          hiCode: 0,
          staffId: 0,
        }
      );
      let zoneObj: any = {};
      zoneObj["zoneName"] = zone?.zoneName;
      zoneObj["id"] = zone?.id;
      zoneObj["tables"] = existingTables;

      res.status(200).send(zoneObj);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

export { router as readZonesRouter };
