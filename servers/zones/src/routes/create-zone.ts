import { ClientRoles, requireAuthorization } from '@hi/common';
import { Table, Zone } from '@hi/db-models';
import { TableSchema, ZoneSchema } from '@hi/db-models/src/validators';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

router.post(
  '/v1/zones',
  validateRequest({
    body: ZoneSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request<{}, {}, z.infer<typeof ZoneSchema>>, res: Response) => {
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

    res.status(201).send({
      status: true,
      data: zone,
      err: false,
      message: 'Zone created successfully',
    });
  },
);

router.post(
  '/v1/zones/:zoneId/tables',
  validateRequest({
    body: TableSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request<{ zoneId: string }, {}, z.infer<typeof TableSchema>>, res: Response) => {
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
      zone?.tables?.push(table.id);
      await zone.save();
    }

    res.status(201).send({
      status: true,
      data: table,
      message: 'Table created successfully',
    });
  },
);

const BulkTablesSchema = z.object({
  tables: z.array(TableSchema),
});

router.post(
  '/v1/zones/:zoneId/bulkTables',
  //TODO apply params schema
  validateRequest({
    body: BulkTablesSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request<{ zoneId: string }, {}, z.infer<typeof BulkTablesSchema>>, res: Response) => {
    let { tables } = req.body;
    const { zoneId } = req.params;
    //TODO
    // z.string().refine((v) => isValidObjectId(v))
    // check whether zoneId exists or not
    for (let i = 0; i < tables?.length; i++) {
      let staff: any = tables[i]?.staff;

      let name: any = tables[i]?.name;
      const existingTableName = await Table.findOne({ name, zoneId });
      if (existingTableName) return res.status(400).send({ status: false, message: 'TableName must be unique ...!' });
      const zone = await Zone.findById(zoneId);
      // mandatory not comes under if statement
      if (zone) {
        const table = new Table({ ...tables[i], zoneId });
        await table.save();

        zone?.tables?.push(table.id);
        await zone.save();
      }
    }
    const zone = await Zone.findById(zoneId);

    return res.status(200).send({
      status: true,
      data: zone,
      message: 'Tables created successfully',
      err: false,
    });
  },
);

export { router as createZoneRouter };
