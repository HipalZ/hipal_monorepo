import { ClientRoles, requireAuthorization } from '@hi/common';
import { Table, Zone } from '@hi/db-models';
import express, { Request, Response } from 'express';
const router = express.Router();

router.get(
  '/v1/zones',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { businessId, swiggy, zoneId, zomato } = req.query;

    const existingZones = await Zone.find({
      businessId,
    });

    res.status(200).send({
      data: existingZones,
      err: false,
      status: true,
      message: 'Zones fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/withTables',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
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

    res.status(200).send({
      data: ans,
      err: false,
      status: true,
      message: 'Zones fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:id/testing',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    // const { businessId } = req.query;
    // const existingZones = await Zone.find({
    //   businessId,
    // });
    // const existingTables = await Table.find({
    //   businessId,
    // });
    // const ans = existingZones.map((zone: any) => ({
    //   zoneName: zone.zoneName,
    //   tables: existingTables.filter((table: any) => table.zoneId === zone.id),
    // }));
    const ans = 'testing';

    res.status(200).send({
      data: {},
      err: false,
      status: true,
      message: ans,
    });
  },
);

router.get(
  '/v1/zones/getAllZoneByWaiter',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { businessId, waiterId } = req.query;
    const filteredZones = await Zone.find({
      businessId,
      staff: waiterId,
    }).select('zoneName staff id zoneType Occupied tables');

    return res.status(200).send({ err: false, status: true, data: filteredZones });
  },
);

router.get(
  '/v1/zones/:id',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingZone = await Zone.findById(id);

    res.status(200).send({
      data: existingZone,
      err: false,
      status: true,
      message: 'Zone fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:id/SingleZone',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingZone = await Zone.findById(id);

    res.status(200).send({
      data: existingZone,
      err: false,
      status: true,
      message: 'Zone fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:zoneId/tables',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const { businessId } = req.query;
    let existingTables;
    if (zoneId === 'all') {
      existingTables = await Table.find({ businessId });
    } else {
      existingTables = await Table.find({ zoneId, businessId });
    }

    res.status(200).send({
      data: existingTables,
      err: false,
      status: true,
      message: 'Tables fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:zoneId/tables/ByWaiter',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const { businessId, staffId } = req.query;
    let existingTables;
    if (zoneId === 'all') {
      existingTables = await Table.find({ businessId });
    } else {
      existingTables = await Table.find(
        {
          zoneId,
          businessId,
          staff: staffId,
        },
        { businessId: 0, staff: 0 },
      );
    }

    res.status(200).send({
      data: existingTables,
      err: false,
      status: true,
      message: 'Tables fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:zoneId/get/Tables',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { zoneId } = req.params;
    const { businessId, staffId } = req.query;
    let existingTables;
    if (zoneId === 'all') {
      existingTables = await Table.find({ businessId });
    } else {
      existingTables = await Table.find({ businessId });
    }
    let zone = await Zone.findById(zoneId);
    // console.log("tablein zones",existingTables)

    let tables = [...existingTables];

    existingTables = existingTables.filter((ele: any) => ele?.staff.includes(staffId));

    if (existingTables?.length == 0) {
      if (zone?.staff?.includes(staffId as string)) {
        return res.status(200).send({
          data: tables,
          err: false,
          status: true,
          message: 'Tables fetched successfully',
        });
      }
    }

    res.status(200).send({
      data: existingTables,
      err: false,
      status: true,
      message: 'Tables fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:zoneId/tables/:id',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;

    const existingZone = await Zone.findById(zoneId);

    const existingTable = await Table.findById(id);

    res.status(200).send({
      data: existingTable,
      err: false,
      status: true,
      message: 'Table fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:zoneId/tables/:id/SingleTable',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;

    const existingTable = await Table.findById(id);

    res.status(200).send({
      data: existingTable,
      err: false,
      status: true,
      message: 'Table fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/WithTables/Zones',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingZones = await Zone.find({
      businessId,
    });
    const existingTables = await Table.find({
      businessId,
    });
    if (existingZones?.length == 0 && existingTables?.length == 0) {
      return res.status(400).send({
        data: {},
        err: true,
        status: false,
        message: 'Tables and Zones not Found',
      });
    }
    const ans = existingZones.map((zone: any) => ({
      zoneName: zone.zoneName,
      tables: existingTables.filter((table: any) => table.zoneId === zone.id),
    }));

    res.status(200).send({
      data: ans,
      err: false,
      status: true,
      message: 'Zones fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/WaiterCalling/kitchen',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
    const { businessId, staffId } = req.query;

    const existingTables = await Table.find({
      businessId,
    });
    let tables = existingTables.filter((table: any) => table?.staff.includes(staffId));
    const singleTable = tables?.[0] || {};

    res.status(200).send({
      data: singleTable,
      err: false,
      status: true,
      message: 'Table fetched successfully',
    });
  },
);

router.get(
  '/v1/zones/:zoneId/tablesByZones',
  requireAuthorization([
    ClientRoles.RESTAURANT_FLOOR_MANAGER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_STAFF,
  ]),

  async (req: Request, res: Response) => {
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
      },
    );
    let zoneObj: any = {};
    zoneObj['zoneName'] = zone?.zoneName;
    zoneObj['id'] = zone?.id;
    zoneObj['tables'] = existingTables;

    res.status(200).send({
      data: zoneObj,
      err: false,
      status: true,
      message: 'Tables fetched successfully',
    });
  },
);

export { router as readZonesRouter };
