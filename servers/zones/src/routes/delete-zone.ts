import { ClientRoles, requireAuthorization } from '@hi/common';
import { Table, Zone } from '@hi/db-models';
import express, { Request, Response } from 'express';

const router = express.Router();

router.delete(
  '/v1/zones/:id',
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_STAFF
  ]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const zone = await Zone.findById(id);
    if (zone?.Occupied != 0) {
      return res.status(400).send("You cann't delete active zone ,zone must be empty");
    }

    await Zone.findByIdAndDelete(id);
    res.status(200).send({
      data:{},
      err:false,
      status:true,
      message: 'Zone deleted successfully',
    });
  },
);

router.delete(
  '/v1/zones/:zoneId/tables/:id',
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_STAFF
  ]),
  async (req: Request, res: Response) => {
    const { id, zoneId } = req.params;
    const existingZone = await Zone.findById(zoneId);
    const existingTable = await Table.findById(id);
    if (existingTable?.status == 'Active') {
      return res.status(400).send({
        data:{},
        err:true,
        status:false,
        message: 'Table is active, please deactivate it first',
      });
    }

    if (existingZone) {
      existingZone?.tables.splice(existingZone?.tables.indexOf(id), 1);
      await existingZone.save();
    }

    res.status(200).send({
      data:{},
      err:false,
      status:true,
      message: 'Table deleted successfully',
    });
  },
);

export { router as deleteZonesRouter };
