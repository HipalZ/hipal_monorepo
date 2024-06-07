import { Table, Zone } from '@hi/db-models';
import express, { Request, Response } from 'express';
const router = express.Router();

router.post(
  '/v1/zones',

  async (req: Request, res: Response) => {
    const { businessId, zoneName, zoneType, startTime, endTime, staff, tables, Occupied, charges } = req.body;

    const zone = await Zone.create({
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

    res.status(201).send(zone);
  },
);

router.post(
  '/v1/zones/:zoneId/tables',

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
      if (existingTableName) return res.status(400).send({ status: false, message: 'TableName must be unique ...!' });
      const zone = await Zone.findById(zoneId);

      for (let i = 0; i < staff?.length; i++) {
        // if (!zone.staff.includes(staff[i])) {
        //   throw new NotAuthorizedError();
        // }
      }

      const table = await Table.create({
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

      if (zone) {
        zone.tables.push(table.id);
        await zone.save();
      }

      res.status(201).send(table);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.post(
  '/v1/zones/:zoneId/bulkTables',

  async (req: Request, res: Response) => {
    try {
      let { tables } = req.body;
      const { zoneId } = req.params;

      for (let i = 0; i < tables?.length; i++) {
        let staff: any = tables[i]?.staff;

        let name: any = tables[i]?.name;
        const existingTableName = await Table.findOne({ name, zoneId });
        if (existingTableName) return res.status(400).send({ status: false, message: 'TableName must be unique ...!' });
        const zone = await Zone.findById(zoneId);

        if (zone) {
          for (let i = 0; i < staff?.length; i++) {
            // if (!zone.staff.includes(staff[i])) {
            //   throw new NotAuthorizedError();
            // }
          }

          const table = new Table({ ...tables[i], zoneId });
          await table.save();

          zone.tables.push(table.id);
          await zone.save();
        }
      }
      const zone = await Zone.findById(zoneId);

      return res.send(zone);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

export { router as createZoneRouter };
