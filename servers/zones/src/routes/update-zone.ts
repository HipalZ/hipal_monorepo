import { Kot, Table, Waiterkot, Zone } from '@hi/db-models';
import { TableSchema, ZoneSchema } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import express, { Request, Response } from 'express';
import moment from 'moment';
import { ClientSession } from 'mongoose';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = express.Router();

const currentTime = new Date();
const options = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};
const formatter = new Intl.DateTimeFormat('en-US', options);
const time = formatter.format(currentTime);
const idParamsSchema = z.object({
  zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

const zoneTableParamsSchema = z.object({
  zoneId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  tableId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

const updateOccupiedQuerySchema = z.object({
  settle: z.boolean().optional(),
});

const updateZoneSchema = ZoneSchema.partial();
const updateTableSchema = TableSchema.partial();

router.put(
  '/v1/zones/:id',
  validateRequest({
    params: idParamsSchema,
    body: updateZoneSchema,
  }),
  async (req: Request<z.infer<typeof idParamsSchema>, {}, z.infer<typeof updateZoneSchema>>, res: Response) => {
    try {
      const { id } = req.params;
      const update = req.body;
      const existingZone = await Zone.findByIdAndUpdate(id, update, { new: true });

      if (!existingZone) {
        return res.status(404).send({ status: false, message: 'Zone not found' });
      }

      res.status(200).send({ status: true, message: 'Zone updated successfully', data: existingZone });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.put(
  '/v1/zones/:zoneId/updateOccupied/:tableId',
  validateRequest({
    params: zoneTableParamsSchema,
    query: updateOccupiedQuerySchema,
    body: updateTableSchema,
  }),
  async (req: Request<z.infer<typeof zoneTableParamsSchema>, {}, z.infer<typeof updateTableSchema>, z.infer<typeof updateOccupiedQuerySchema>>, res: Response) => {
    try {
      const { zoneId, tableId } = req.params;
      const { settle } = req.query;

      const update = req.body;
      const tableData = await Table.findById(tableId);

      if (!tableData) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }

      if (settle) {
        await Zone.findByIdAndUpdate(zoneId, { $inc: { Occupied: -1 } }, { new: true });
      } else if (tableData.status !== 'Active') {
        await Zone.findByIdAndUpdate(zoneId, { $inc: { Occupied: 1 } }, { new: true });
      }

      const updatedTable = await Table.findByIdAndUpdate(tableId, update, { new: true });

      if (!updatedTable) {
        return res.status(404).send({ status: false, message: 'Failed to update table' });
      }

      res.status(200).send({ status: true, message: 'Table and zone updated successfully', data: updatedTable });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);
router.put(
  '/v1/zones/:zoneId/tables/:tableId/settle',
  validateRequest({
    params: zoneTableParamsSchema,
    body: updateTableSchema,
  }),
  async (req: Request<z.infer<typeof zoneTableParamsSchema>, {}, z.infer<typeof updateTableSchema>>, res: Response) => {
    try {
      const { tableId } = req.params;
      const update = req.body;

      const tableData = await Table.findByIdAndUpdate(tableId, update, { new: true });

      if (!tableData) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }

      res.status(200).send({ status: true, message: 'Table settled successfully', data: tableData });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);


router.get(
  '/v1/zones/:id/UpdateZoneOccupiedStatus',

  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      let existingZone;
      const existing = await Zone.findById(id);
      if (existing) {
        if (existing?.Occupied > 0) {
          existingZone = await Zone.findByIdAndUpdate(id, {
            $inc: { Occupied: -1 },
          });
        }
      }

      res.status(200).send(existingZone);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/zones/:zoneId/updateOccupied/:tableId',

  async (req: Request, res: Response) => {
    try {
      const { zoneId, tableId } = req.params;
      const tableExit = await Table.findById(tableId);
      console.log(tableExit);
      if ((tableExit?.activeUser ?? 0) < (tableExit?.capacity ?? 0)) {
        const table = await Table.findByIdAndUpdate(tableId, {
          $inc: { activeUser: 1 },
        });
        if (table) {
          return res.status(200).send({ status: true, data: table });
        }
        // Code to execute if the condition is true
      } else {
        return res.status(200).send({ status: true, message: 'Capacity full' });
      }
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

const tableIdParamsSchema = z.object({
  tableId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

const updateDishSchema = TableSchema.pick({
  totalDishQuantity: true,
  deliverdDish: true,
  status: true,
  time: true,
}).partial();

const updateSingleDishSchema = TableSchema.pick({
  deliverdDish: true,
}).partial();

const updateTimeSchema = TableSchema.pick({
  time: true,
}).partial();

router.put(
  '/v1/zones/updateDish/:tableId',
  validateRequest({
    params: tableIdParamsSchema,
    body: updateDishSchema,
  }),
  async (req: Request<z.infer<typeof tableIdParamsSchema>, {}, z.infer<typeof updateDishSchema>>, res: Response) => {
    try {
      const { tableId } = req.params;
      const { totalDishQuantity, deliverdDish, status, time } = req.body;

      const table = await Table.findByIdAndUpdate(tableId, {
        totalDishQuantity,
        deliverdDish,
        status,
        time,
      }, { new: true });

      if (!table) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }

      return res.status(200).send({ status: true, message: 'Table updated successfully', data: table });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.put(
  '/v1/zones/updateDish/Single/:tableId',
  validateRequest({
    params: tableIdParamsSchema,
    body: updateSingleDishSchema,
  }),
  async (req: Request<z.infer<typeof tableIdParamsSchema>, {}, z.infer<typeof updateSingleDishSchema>>, res: Response) => {
    try {
      const { tableId } = req.params;
      const { deliverdDish } = req.body;

      const table = await Table.findByIdAndUpdate(tableId, {
        $inc: { deliverdDish },
      }, { new: true });

      if (!table) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }

      return res.status(200).send({ status: true, message: 'Table updated successfully', data: table });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.put(
  '/v1/zones/updateTime/:tableId',
  validateRequest({
    params: tableIdParamsSchema,
    body: updateTimeSchema,
  }),
  async (req: Request<z.infer<typeof tableIdParamsSchema>, {}, z.infer<typeof updateTimeSchema>>, res: Response) => {
    try {
      const { tableId } = req.params;
      const { time } = req.body;

      const table = await Table.findByIdAndUpdate(tableId, {
        time,
      }, { new: true });

      if (!table) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }

      return res.status(200).send({ status: true, message: 'Time updated successfully', data: table });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

const tableReserveQuerySchema = z.object({
  update: z.boolean().optional(),
  tableId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
});

const tableReserveBodySchema = z.object({
  reservedBy: z.string().optional(),
});

const getCurrentIndianTime = () => {
  const now = new Date();
  const indianTimeOffset = 5.5 * 60 * 60 * 1000; // +05:30 offset in milliseconds
  const indianTime = new Date(now.getTime() + indianTimeOffset);
  const hours = indianTime.getUTCHours().toString().padStart(2, '0');
  const minutes = indianTime.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};


router.put(
  '/v1/zones/updateTableReserve/table',
  validateRequest({
    query: tableReserveQuerySchema,
    body: tableReserveBodySchema,
  }),
  async (req: Request<{}, {}, z.infer<typeof tableReserveBodySchema>, z.infer<typeof tableReserveQuerySchema>>, res: Response) => {
    try {
      const { tableId, update } = req.query;
      const { reservedBy } = req.body;
      const indianTime = getCurrentIndianTime();

      const tableExit = await Table.findById(tableId);
      if (!tableExit) {
        return res.status(404).send({ status: false, message: 'Table not found Given Id' });
      }

      if (update) {
        const table = await Table.findByIdAndUpdate(
          tableId,
          {
            status: 'Empty',
            activeUser: 0,
            time: indianTime,
            totalDishQuantity: 0,
            deliverdDish: 0,
            role: null,
            hiCode: '',
            mergedBy: '',
            reservedBy: '',
          },
          { new: true },
        );
        if (!table) {
          return res.status(404).send({ status: false, message: 'Table not found Given Id' });
        }

        return res.status(200).send({ status: true, message: 'Table updated successfully', data: table });
      }

      if (tableExit.status !== 'Empty') {
        return res.status(400).send({ status: false, message: 'Table Already in Active' });
      }

      const table = await Table.findByIdAndUpdate(
        tableId,
        {
          status: 'Reserved',
          reservedBy: reservedBy,
        },
        { new: true },
      );
      if (!table) {
        return res.status(404).send({ status: false, message: 'Table not found Given Id' });
      }

      res.status(200).send({ status: true, message: 'Table reserved successfully', data: table });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.put(
  '/v1/zones/:zoneId/tables/:id/KickOutTable',
  validateRequest({
    params: idParamsSchema,
  }),
  async (req: Request<z.infer<typeof idParamsSchema>>, res: Response) => {
    const { id, zoneId } = req.params;
    const indianTime = getCurrentIndianTime();

    try {
      await runInTransaction(async (session: ClientSession) => {
        const update = await Kot.updateMany(
          {
            zoneId,
            tableId: id,
            status: 'UNPAID',
          },
          {
            $set: {
              status: 'PAID',
              cookedAt: Date.now(),
            },
          },
          { session },
        );

        if (!update) {
          throw new Error('Not Found Order');
        }

        await Waiterkot.deleteMany(
          {
            zoneId: zoneId,
            tableId: id,
            isAccept: false,
          },
          { session },
        );

        const tableUpdate = {
          status: 'Empty',
          activeUser: 0,
          time: indianTime,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: '',
          mergedBy: '',
          reservedBy: '',
        };

        await Table.findByIdAndUpdate(id, tableUpdate, { session });
      });

      const existingTable = await Table.findById(id);
      return res.status(200).send({ status: true, message: 'Table kicked out successfully', data: existingTable });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);
router.put(
  '/v1/zones/:zoneId/tables/:id/KickOutTable',
  validateRequest({
    params: idParamsSchema,
  }),
  async (req: Request<z.infer<typeof idParamsSchema>>, res: Response) => {
    const { id, zoneId } = req.params;
    const indianTime = getCurrentIndianTime();

    try {
      await runInTransaction(async (session: ClientSession) => {
        const update = await Kot.updateMany(
          {
            zoneId,
            tableId: id,
            status: 'UNPAID',
          },
          {
            $set: {
              status: 'PAID',
              cookedAt: Date.now(),
            },
          },
          { session },
        );

        if (!update) {
          throw new Error('Not Found Order');
        }

        await Waiterkot.deleteMany(
          {
            zoneId: zoneId,
            tableId: id,
            isAccept: false,
          },
          { session },
        );

        const tableUpdate = {
          status: 'Empty',
          activeUser: 0,
          time: indianTime,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: '',
          mergedBy: '',
          reservedBy: '',
        };

        await Table.findByIdAndUpdate(id, tableUpdate, { session });
      });

      const existingTable = await Table.findById(id);
      if (!existingTable) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }
      
      return res.status(200).send({ status: true, message: 'Table kicked out successfully', data: existingTable });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

const mergeTablesSchema = z.object({
  businessId: z.string(),
  tables: z.array(z.object({
    name: z.string(),
    tableId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
    hierarchy: z.enum(['PARENT', 'CHILD']),
    parentZoneId: z.string().optional(),
    parentTableId: z.string().optional(),
  })),
  mergedBy: z.string(),
});

const settleMergeTablesSchema = z.object({
  mergeTables: z.array(z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  })),
});

router.put(
  '/v1/zones/UpdateByOne/tables/:id',
  validateRequest({
    params: idParamsSchema,
  }),
  async (req: Request<z.infer<typeof idParamsSchema>>, res: Response) => {
    try {
      const { id } = req.params;

      const existingTable = await Table.findByIdAndUpdate(
        id,
        {
          $inc: { deliverdDish: 1 },
        },
        {
          new: true,
        },
      );

      if (!existingTable) {
        return res.status(404).send({ status: false, message: 'Table not found' });
      }

      res.status(200).send({ status: true, message: 'Table updated successfully', data: existingTable });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);
router.put(
  '/v1/zones/:zoneId/mergeTables',
  validateRequest({
    body: mergeTablesSchema,
  }),
  async (req: Request<{}, {}, z.infer<typeof mergeTablesSchema>>, res: Response) => {
    const { businessId, tables, mergedBy } = req.body;

    if (!businessId || tables.length <= 1) {
      return res.status(400).send({ status: false, message: 'Cannot merge a single table' });
    }

    try {
      await runInTransaction(async (session: ClientSession) => {
        let tableObj: any = {};
        tables.forEach((table) => {
          if (!tableObj[table.name]) {
            tableObj[table.name] = {
              name: table.name,
              id: table.tableId,
            };
          }
        });
        let tableNames = Object.values(tableObj);

        let findParentTable = tables.filter((table) => table.hierarchy == 'PARENT');

        const parentTable = await Table.findById(findParentTable[0].tableId, null, {
          session: session,
        });
        if (parentTable?.isMerge) {
          throw new Error('Table already merged');
        }

        for (const table of tables) {
          if (table.hierarchy === 'PARENT') {
            await Table.findByIdAndUpdate(
              table.tableId,
              {
                isMerge: true,
                hierarchy: 'PARENT',
                mergeTables: tableNames,
                mergedBy,
              },
              { new: true, session },
            );
          } else {
            await Table.findByIdAndUpdate(
              table.tableId,
              {
                isMerge: true,
                ...table,
                status: 'Active',
                activeUser: parentTable?.activeUser,
                totalDishQuantity: parentTable?.totalDishQuantity,
                deliverdDish: parentTable?.deliverdDish,
                mergeTables: tableNames,
              },
              { new: true, session },
            );
          }
        }

        for (const table of tables) {
          if (table.hierarchy === 'CHILD') {
            const kots = await Kot.find(
              {
                tableId: table.tableId,
                zoneId: table.parentZoneId,
                status: 'UNPAID',
                isDeleted: false,
              },
              null,
              { session: session },
            ).lean();
            const newArray = JSON.parse(JSON.stringify(kots));
            for (const newKOT of newArray) {
              const kotId = newKOT._id || newKOT.id;
              delete newKOT.__v;
              delete newKOT._id;
              delete newKOT.id;
        
              const kot = {
                ...newKOT,
                tableId: table.parentTableId,
                zoneId: table.parentZoneId,
              };
              await Kot.create(kot, { session: session });
        
              await Kot.findByIdAndDelete(kotId, { session: session });
            }
          }
        }
        let kots = await Kot.find(
          {
            tableId: tables[1].parentTableId,
            zoneId: tables[1].parentZoneId,
            status: 'UNPAID',
            isDeleted: false,
          },
          null,
          {
            session: session,
          },
        );

        await Table.findByIdAndUpdate(
          findParentTable[0].tableId,
          {
            totalDishQuantity: kots.length,
          },
          {
            session: session,
          },
        );
      });

      res.status(200).send({ status: true, message: 'Merge success' });
    } catch (err: any) {
      res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.put(
  '/v1/zones/:zoneId/settleMergeTables',
  validateRequest({
    body: settleMergeTablesSchema,
  }),
  async (req: Request<{}, {}, z.infer<typeof settleMergeTablesSchema>>, res: Response) => {
    const { mergeTables } = req.body;

    try {
      for (const table of mergeTables) {
        await Table.findByIdAndUpdate(
          table.id,
          {
            status: 'Empty',
            activeUser: 0,
            time: getCurrentIndianTime(),
            totalDishQuantity: 0,
            deliverdDish: 0,
            role: null,
            hiCode: '',
            isMerge: false,
            hierarchy: '',
            mergeTables: [],
            parentTableId: '',
            parentZoneId: '',
            mergedBy: '',
            reservedBy: '',
          },
          { new: true },
        );
      }

      res.status(200).send({ status: true, message: 'Settle success' });
    } catch (err: any) {
      res.status(500).send({ status: false, message: err.message });
    }
  },
);

export { router as updateZonesRouter };
