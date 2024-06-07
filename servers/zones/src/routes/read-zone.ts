import { Table, Zone } from '@hi/db-models';
import express, { Request, Response } from 'express';
import { auth } from '../middleware/auth';
const router = express.Router();

router.get(
  '/v1/zones',

  async (req: Request, res: Response) => {
    const { businessId, swiggy, zoneId, zomato } = req.query;

    const existingZones = await Zone.find({
      businessId,
    });

    res.status(200).send(existingZones);
  },
);

router.get(
  '/v1/zones/withTables',

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
  },
);

router.get(
  '/v1/zones/:id/testing',

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

    res.status(200).send(ans);
  },
);

router.get(
  '/v1/zones/getAllZoneByWaiter',
  auth,

  async (req: Request, res: Response) => {
    try {
      const { businessId, waiterId } = req.query;
      const filteredZones = await Zone.find({
        businessId,
        staff: waiterId,
      }).select('zoneName staff id zoneType Occupied tables');

      return res.status(200).send({ status: true, data: filteredZones });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/zones/:id',

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingZone = await Zone.findById(id);

    res.status(200).send(existingZone);
  },
);

router.get('/v1/zones/:id/SingleZone', async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingZone = await Zone.findById(id);

  res.status(200).send(existingZone);
});

router.get(
  '/v1/zones/:zoneId/tables',

  async (req: Request, res: Response) => {
    try {
      const { zoneId } = req.params;
      const { businessId, staffId } = req.query;
      let existingTables;
      if (zoneId === 'all') {
        existingTables = await Table.find({ businessId });
      } else {
        existingTables = await Table.find({ zoneId, businessId });
      }

      res.status(200).send(existingTables);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get('/v1/zones/:zoneId/tables/ByWaiter', async (req: Request, res: Response) => {
  try {
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

    res.status(200).send(existingTables);
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.get('/v1/zones/:zoneId/get/Tables', async (req: Request, res: Response) => {
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
      return res.status(200).send(tables);
    }
  }

  res.status(200).send(existingTables);
});

router.get(
  '/v1/zones/:zoneId/tables/:id',

  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;

    const existingZone = await Zone.findById(zoneId);

    const existingTable = await Table.findById(id);

    res.status(200).send(existingTable);
  },
);

router.get(
  '/v1/zones/:zoneId/tables/:id/SingleTable',

  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;

    const existingTable = await Table.findById(id);

    res.status(200).send(existingTable);
  },
);

router.get(
  '/v1/zones/WithTables/Zones',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingZones = await Zone.find({
      businessId,
    });
    const existingTables = await Table.find({
      businessId,
    });
    if (existingZones?.length == 0 && existingTables?.length == 0) {
      return res.status(400).send('Tables and Zones not Found');
    }
    const ans = existingZones.map((zone: any) => ({
      zoneName: zone.zoneName,
      tables: existingTables.filter((table: any) => table.zoneId === zone.id),
    }));

    res.status(200).send(ans);
  },
);

router.get(
  '/v1/zones/WaiterCalling/kitchen',

  async (req: Request, res: Response) => {
    const { businessId, staffId } = req.query;

    const existingTables = await Table.find({
      businessId,
    });
    let tables = existingTables.filter((table: any) => table?.staff.includes(staffId));
    const singleTable = tables?.[0] || {};

    res.status(200).send(singleTable);
  },
);

router.get(
  '/v1/zones/:zoneId/tablesByZones',

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
        },
      );
      let zoneObj: any = {};
      zoneObj['zoneName'] = zone?.zoneName;
      zoneObj['id'] = zone?.id;
      zoneObj['tables'] = existingTables;

      res.status(200).send(zoneObj);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

export { router as readZonesRouter };
