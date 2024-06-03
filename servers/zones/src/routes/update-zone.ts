import express, { Request, Response } from "express";
import { Kot, Table, Waiterkot, Zone } from "@hi/db-models";
import moment from "moment";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";

const router = express.Router();

const currentTime = new Date();
const options = {
  timeZone: "Asia/Kolkata",
  hour: "2-digit" as const,
  minute: "2-digit" as const,
};
const formatter = new Intl.DateTimeFormat("en-US", options);
const time = formatter.format(currentTime);

router.put(
  "/v1/zones/:id",

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    const existingZone = await Zone.findByIdAndUpdate(id, update);

    res.status(200).send(existingZone);
  }
);

router.get(
  "/v1/zones/:id/UpdateZoneOccupiedStatus",

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
  }
);

router.put(
  "/v1/zones/:zoneId/updateOccupied/:tableId",

  async (req: Request, res: Response) => {
    try {
      const { zoneId, tableId } = req.params;
      const { settle } = req.query;

      const update = { ...req.body };
      const tableData = await Table.findById(tableId);
      if (settle) {
        await Zone.findByIdAndUpdate(
          zoneId,
          { $inc: { Occupied: -1 } },
          { new: true }
        );
      } else {
        if (tableData?.status != "Active") {
          await Zone.findByIdAndUpdate(
            zoneId,
            { $inc: { Occupied: 1 } },
            { new: true }
          );
        }
      }
      await Table.findByIdAndUpdate(tableId, update, {
        new: true,
      });

      res.status(200).send({ status: true });
    } catch (err: any) {
      return res.status(500).send({ message: err.message });
    }
  }
);

router.put(
  "/v1/zones/:zoneId/tables/:tableId/settle",

  async (req: Request, res: Response) => {
    try {
      const { tableId } = req.params;

      const update = { ...req.body };
      const tableData = await Table.findByIdAndUpdate(tableId, update);

      res.status(200).send(tableData);
    } catch (err: any) {
      return res.status(500).send({ message: err.message });
    }
  }
);

router.get(
  "/v1/zones/:zoneId/updateOccupied/:tableId",

  async (req: Request, res: Response) => {
    try {
      const { zoneId, tableId } = req.params;
      const tableExit = await Table.findById(tableId);
      console.log(tableExit);
      if ((tableExit?.activeUser ?? 0) < (tableExit?.capacity ?? 0)) {
        console.log("yes");
        const table = await Table.findByIdAndUpdate(tableId, {
          $inc: { activeUser: 1 },
        });
        if (table) {
          return res.status(200).send({ status: true, data: table });
        }
        // Code to execute if the condition is true
      } else {
        return res.status(200).send({ status: true, message: "Capacity full" });
      }
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/zones/updateDish/:tableId",

  async (req: Request, res: Response) => {
    try {
      const { tableId } = req.params || {};
      const { totalDishQuantity, deliverdDish, status, time } = req.body || {};
      const table = await Table.findByIdAndUpdate(tableId, {
        totalDishQuantity: totalDishQuantity,

        deliverdDish: deliverdDish,
        status: status,
        time: time,
      });
      if (table) {
        return res.status(200).send({ status: true, data: table });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Table Not found...!" });
      }
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/zones/updateDish/Single/:tableId",

  async (req: Request, res: Response) => {
    try {
      const { tableId } = req.params || {};
      const { totalDishQuantity, deliverdDish, status } = req.body || {};
      const table = await Table.findByIdAndUpdate(tableId, {
        $inc: { deliverdDish: deliverdDish },
      });
      if (table) {
        return res.status(200).send({ status: true, data: table });
      } else {
        return res
          .status(400)
          .send({ status: false, message: "Table Not found....!" });
      }
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/zones/updateTime/:tableId",
  async (req: Request, res: Response) => {
    const { time } = req.body || {};
    const { tableId } = req.params;
    const table = await Table.findByIdAndUpdate(
      tableId,
      {
        time: time,
      },
      { new: true }
    );

    res.status(200).send(table);
  }
);

router.put(
  "/v1/zones/updateTableReserve/table",

  async (req: Request, res: Response) => {
    const { tableId, update } = req.query;
    const { reservedBy } = req.body;
    var currentTime = Date.now();
    var momentTime = moment(currentTime);
    var indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");
    const tableExit = await Table.findById(tableId);
    if (update) {
      const table = await Table.findByIdAndUpdate(
        tableId,
        {
          status: "Empty",
          activeUser: 0,
          time: indianTime,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: "",
          mergedBy: "",
          reservedBy: "",
        },
        { new: true }
      );
      if (!table) {
        return res.send({ status: false, message: "Table not found Given Id" });
      }

      return res.status(200).send(table);
    }
    if (tableExit?.status != "Empty") {
      return res
        .status(400)
        .send({ status: false, message: "Table Already in Active " });
    }

    const table = await Table.findByIdAndUpdate(
      tableId,
      {
        status: "Reserved",
        reservedBy: reservedBy,
      },
      { new: true }
    );
    if (!table) {
      return res.send({ status: false, message: "Table not found Given Id" });
    }

    res.status(200).send(table);
  }
);

router.put(
  "/v1/zones/:zoneId/tables/:id",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const update = { ...req.body };
      const existingTable = await Table.findByIdAndUpdate(id, update, {
        new: true,
      });

      res.status(200).send(existingTable);
    } catch (err: any) {
      return res.status(500).send({ status: true, message: err.message });
    }
  }
);
router.put(
  "/v1/zones/:zoneId/tables/:id/KickOutTable",
  async (req: Request, res: Response) => {
    const currentTime = Date.now();
    const momentTime = moment(currentTime);
    const indianTime = momentTime
      .clone()
      .utcOffset("+05:30")
      .format("HH:mm:ss");
    const { id, zoneId } = req.params;

    try {
      await runInTransaction(async (session: ClientSession) => {
        const data = {
          zoneId,
          tableId: id,
        };

        try {
          const update = await Kot.updateMany(
            {
              zoneId,
              tableId: id,
              status: "UNPAID",
            },
            {
              $set: {
                status: "PAID",
                cookedAt: Date.now(),
              },
            },
            { session }
          );

          if (!update) {
            throw new Error("Not Found Order");
          }

          await Waiterkot.deleteMany(
            {
              zoneId: zoneId,
              tableId: id,
              isAccept: false,
            },
            { session }
          );
        } catch (err: any) {
          throw new Error(err.message);
        }

        const update = {
          status: "Empty",
          activeUser: 0,
          time: indianTime,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: "",
          mergedBy: "",
          reservedBy: "",
        };

        await Table.findByIdAndUpdate(id, update, { session });
      });

      const existingTable = await Table.findById(id);
      return res.status(200).send(existingTable);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/zones/UpdateByOne/tables/:id",

  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const existingTable = await Table.findByIdAndUpdate(
        id,
        {
          $inc: { deliverdDish: 1 },
        },
        {
          new: true,
        }
      );

      res.status(200).send(existingTable);
    } catch (err: any) {
      return res.status(500).send({ status: true, message: err.message });
    }
  }
);
router.put(
  "/v1/zones/:zoneId/mergeTables",
  async (req: Request, res: Response) => {
    const { businessId, tables, mergedBy } = req.body;
    if (!businessId || tables?.length == 1) {
      return res.status(400).send("Cannot merge a single table");
    }

    try {
      await runInTransaction(async (session: ClientSession) => {
        let tableObj: any = {};
        tables.forEach((table: any) => {
          if (!tableObj[table?.name]) {
            tableObj[table?.name] = {
              name: table?.name,
              id: table?.tableId,
            };
          }
        });
        let tableNames = Object.values(tableObj);

        let findParentTable = tables?.filter(
          (table: any) => table?.hierarchy == "PARENT"
        );

        const parentTable = await Table.findById(
          findParentTable?.[0]?.tableId,
          {
            session: session,
          }
        );
        if (parentTable?.isMerge) {
          throw new Error("Table already merged");
        }

        for (let i = 0; i < tables?.length; i++) {
          let table = tables[i];
          if (table?.hierarchy === "PARENT") {
            await Table.findByIdAndUpdate(
              table?.tableId,
              {
                isMerge: true,
                hierarchy: "PARENT",
                mergeTables: tableNames,
                mergedBy,
              },
              { new: true, session }
            );
          } else {
            await Table.findByIdAndUpdate(
              table?.tableId,
              {
                isMerge: true,
                ...table,
                status: "Active",
                activeUser: parentTable?.activeUser,
                totalDishQuantity: parentTable?.totalDishQuantity,
                deliverdDish: parentTable?.deliverdDish,
                mergeTables: tableNames,
              },
              { new: true, session }
            );
          }
        }

        for (let index = 0; index < tables.length; index++) {
          const table = tables[index];
          if (table?.hierarchy == "CHILD") {
            let kots = await Kot.find(
              {
                tableId: table.tableId,
                zoneId: table.parentZoneId,
                status: "UNPAID",
                isDeleted: false,
              },
              { session: session }
            ).lean();
            let newArray = JSON.parse(JSON.stringify(kots));
            for (let i = 0; i < newArray.length; i++) {
              let newKOT: any = newArray[i];
              let kotId = newKOT._id || newKOT.id;
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
            tableId: tables?.[1].parentTableId,
            zoneId: tables?.[1].parentZoneId,
            status: "UNPAID",
            isDeleted: false,
          },
          {
            session: session,
          }
        ).count();

        await Table.findByIdAndUpdate(
          findParentTable?.[0]?.tableId,
          {
            totalDishQuantity: kots,
          },
          {
            session: session,
          }
        );
      });

      res.status(200).send("Merge success");
    } catch (err: any) {
      res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/zones/:zoneId/settleMergeTables",
  async (req: Request, res: Response) => {
    const { mergeTables } = req.body;
    // if (!businessId || tables?.length == 1) {
    //   return res.status(400).send("cann't merge single table");
    // }

    for (let i = 0; i < mergeTables?.length; i++) {
      let table = mergeTables[i];

      await Table.findByIdAndUpdate(
        table?.id,
        {
          status: "Empty",
          activeUser: 0,
          time: time,
          totalDishQuantity: 0,
          deliverdDish: 0,
          role: null,
          hiCode: "",
          isMerge: false,
          hierarchy: "",

          mergeTables: [],
          parentTableId: "",
          parentZoneId: "",
          mergedBy: "",
          reservedBy: "",
        },
        { new: true }
      );
    }

    res.status(200).send("settle success");
  }
);

export { router as updateZonesRouter };
