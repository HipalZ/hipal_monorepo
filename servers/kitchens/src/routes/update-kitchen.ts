import express, { Request, Response } from 'express';

import axios from 'axios';

import moment from 'moment';

import momentTimeZone from 'moment-timezone';

import { Alert, Kitchen, Kot, Kotpassword, Payment, Table, Tempmodel, Userbill, Waiterkot } from '@hi/db-models';
import { KOTAttrs, KOTType, KitchenAttrs } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '@hi/common';
const currentTime = new Date();
const options = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};
const formatter = new Intl.DateTimeFormat('en-US', options);
const time = formatter.format(currentTime);

const optionsTimeAndSeconds = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit' as const,
  minute: '2-digit' as const,
  second: '2-digit' as const,
};
const formatterTimesAndSeconds = new Intl.DateTimeFormat('en-US', optionsTimeAndSeconds);
const timeWithSeconds = formatterTimesAndSeconds.format(currentTime);

const optionsDate = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric' as const,
  month: '2-digit' as const,
  day: '2-digit' as const,
};
const formatterDate = new Intl.DateTimeFormat('en-US', optionsDate);
const currentDateAndTime = formatterDate.format(currentTime);
const updatedKOTAttrsSchema = KOTAttrs.partial();
const updatedKitchenSchema = KitchenAttrs.partial();
const router = express.Router();

router.put(
  '/v1/kitchens/kots',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: updatedKOTAttrsSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedKOTAttrsSchema>>, res: Response) => {
    const { kots } = req.body as { kots: string[] };
    const created = [];

    for (let i = 0; i < kots.length; i++) {
      const newKOT = kots[i];
      const kot = {
        status: 'PAID',
      };
      await Kot.findByIdAndUpdate(newKOT, kot);
      created.push(kot);
    }

    res.status(200).send({
      err: false,
      message: 'Updated Successfully!',
      data: {}
    });
  },
);

router.put('/v1/kitchens/updateAlert/alert',
  validateRequest({
    body: updatedKitchenSchema,
  }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedKitchenSchema>>, res: Response) => {
    await runInTransaction(async (session: ClientSession) => {
      const { alertId, businessId, clearAll } = req.query;
      let alertExit = await Alert.findById(alertId, { session });
      if (clearAll) {
        let allAlert = await Alert.find(
          {
            businessId,
            isAlertOn: true,
          },
          { session },
        );
        for (let i = 0; i < allAlert.length; i++) {
          let single = allAlert?.[i];
          if (single?.status == 'Cooked') {
            await Kot.findByIdAndUpdate(alertExit?.kotId, { dishStatus: 'delivered' }, { session });
          }
        }
        let update = await Alert.updateMany(
          {
            businessId,
          },
          { isAlertOn: false },
          { session },
        );
        res.send({
          err:false,
          message: 'All Alert Cleared',
          data:update
        });
      }

      if (!alertExit?.tableId) {
        const alert = await Alert.findByIdAndUpdate(
          alertId,
          {
            isAlertOn: false,
          },
          { session },
        );
        if (alertExit?.status == 'Cooked') {
          await Kot.findByIdAndUpdate(alertExit?.kotId, { dishStatus: 'delivered' }, { session });
        }

        res.send({
          status: true,
          message: 'Alert Cleared',
          data: alert?._id
        });
      }

      if (alertExit?.status == 'Cooked') {
        await Kot.findByIdAndUpdate(alertExit?.kotId, { dishStatus: 'delivered' }, { session });
        const query = {
          businessId,
          tableId: alertExit?.tableId,
          zoneId: alertExit?.zoneId,
          status: 'UNPAID',
        };

        const existingKOTs = await Kot.find(query, { session });

        let delivered = 0;

        for (const existingKOT of existingKOTs) {
          if (existingKOT?.dishStatus === 'delivered') {
            delivered++;
          }
        }

        const config = {
          deliverdDish: delivered,
        };

        await Table.findByIdAndUpdate(alertExit?.tableId, config, {
          session,
        });
      }

      const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
          isAlertOn: false,
        },
        { session },
      );
      if (alert?.staffId != '5') {
        const config = {
          status: alert?.staffId,
        };
        await Table.findByIdAndUpdate(alert?.tableId, config, { session });
      }
      res.status(200).send({
        err: false,
        message: 'Alert Cleared',
        data: alert
      });
    });
})
router.put(
  '/v1/kitchens/:id',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: updatedKitchenSchema,
  }),
  async (req: Request<{ id: string }, {}, z.infer<typeof updatedKitchenSchema>>, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    await Kitchen.findByIdAndUpdate(id, update);

    const kitchen = await Kitchen.findById(id);

    res.status(200).send({
      err: false,
      message: 'Kitchen updated successfully',
      data: kitchen
    });
  },
);

router.put(
  '/v1/kitchens/:kitchenId/kots',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: updatedKOTAttrsSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedKOTAttrsSchema>>, res: Response) => {
    //TODO :REMOVE UNWANTED ROLE
    const currentTime = Date.now();
    const momentTime = moment(currentTime);
    const indianTime = momentTime.clone().utcOffset('+05:30').format('HH:mm');

    const { kots } = req.body as { kots: KOTType[] };

    let created: any = [];
    //TODO : USE UPDATEMANY INSTEAD OF LOOP
    kots.forEach(async (newKOT: KOTType) => {
      const single = await Kot.findById(newKOT);
      if (single?.priority == true) {
        await Kot.findByIdAndUpdate(newKOT, { priority: false });
      }
      if (single?.dishStatus == 'cooking') {
        const kot = {
          cookedAt: Date.now(),
          dishStatus: 'cooked',
        };
        const singleId = await Kot.findByIdAndUpdate(newKOT, kot);
        if (single?.isDeleted == false) {
          const obj = {
            businessId: singleId?.businessId,
            tableName: singleId?.tableName,
            zoneId: singleId?.zoneId,
            tableId: singleId?.tableId,
            staffId: singleId?.staffId,
            status: 'Cooked',
            time: indianTime,
            message: `${singleId?.dish.name} is cooked `,
            kotId: singleId?.id || singleId?._id,
          };

          const saveAlert = new Alert(obj);
          await saveAlert.save();
        }
        created.push(kot);
      }
    });
    res.status(200).send({ err: false, message: 'Kots successfully updated', data: created });
  },
);

router.put(
  '/v1/kitchens/update/kots/dish',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: updatedKOTAttrsSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedKOTAttrsSchema>>, res: Response) => {
    const { kots } = req.body as { kots: string[] };
    return runInTransaction(async (session: ClientSession) => {
      const created = [];

      for (let i = 0; i < kots.length; i++) {
        const newKOT = kots[i];
        const kot = {
          dishStatus: 'delivered',
        };
        let single = await Kot.findByIdAndUpdate(newKOT, kot, { session });

        if (single?.dishStatus === 'delivered') {
          const config = {
            deliverdDish: 1,
          };
          await Table.findByIdAndUpdate(single?.tableId, config, { session });
        }

        created.push(kot);
      }

      res.status(200).send({
        err: false,
        message: 'Updated Successfully',
        data: created
      });
    });
  },
);

router.put(
  '/v1/kitchens/updateAll/kots/dishStatus',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: updatedKOTAttrsSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof updatedKOTAttrsSchema>>, res: Response) => {
    const { tableId } = req.query || {};
    await Kot.updateMany({ tableId }, { $set: { dishStatus: 'delivered' } });
    res.status(200).send({ status: true, message: 'Updated Successfully......!', data: {} });
  },
);

//TODO: datta apply the validation request for this kitchen
router.put('/v1/kitchens/:id/settle-bill',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let {
      kots,
      subTotal,
      Total,
      SGST,
      CGST,
      discount,
      mode,
      customerName,
      duesPersonId,
      customerPhone,
      claimedAmount,
      discountDescription,
      serviceCharge,
      modeBreakDown,
      waiterName,
      tips,
      zoneType,
      dayAndDate,
      indianTime,
      hiCode,
    } = req.body;
    const payDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD');
    if (!mode || (!Total && Total == null)) {
      return res.status(400).send({message:'Please enter the required fields.', data:{}, err:true});
    }

    if (mode === 'dues' && !duesPersonId) {
      return res.status(400).send({
        status: false,
        message: "When mode is dues, a dues person must be selected.",
        data:{}
      });
    }

    await runInTransaction(async (session: ClientSession) => {
      const created: any = [];
      for (const kotId of kots) {
        const updatedKOT = await Kot.findByIdAndUpdate(
          kotId,
          {
            status: 'PAID',
            cookedAt: Date.now(),
          },
          { session },
        );

        if (updatedKOT?.isDeleted === false) {
          created.push(updatedKOT);
        }
      }

      const singleKot = created?.[1] || created?.[0];

      const items = created.map((kot: any) => {
        const newobj: any = {
          name: kot.dish?.name,
          quantity: kot.dish?.qty || kot.dish?.quantity,
          amount: kot.dish?.price,
          category: kot.category,
          portions: kot.dish?.portions,
          extras: kot.dish?.extras,
          comments: 'spicy',
        };

        let price = 0;
        if (newobj.portions) {
          price = parseInt(newobj.portions.price) * (newobj.quantity || newobj.qty);
        } else {
          price = newobj.amount || 0;
        }

        let extrasPrice = 0;
        if (newobj.extras?.length > 0) {
          for (const extra of newobj.extras) {
            extrasPrice += parseInt(extra.price || 0) * (extra.quantity || extra.qty);
          }
        }

        newobj.amount = price + extrasPrice || 0;

        return newobj;
      });
      const cName = customerName || singleKot?.customerName;
      const cPhone = customerPhone || singleKot?.customerPhone;
      if (mode === 'complimentary') {
        discount = subTotal;
        SGST = 0;
        CGST = 0;
        Total = 0;
      }

      await Payment.create(
        [
          {
            businessId: singleKot?.businessId,
            items,
            subTotal: Number(subTotal),
            sgst: Number(SGST.toFixed(2)),
            cgst: Number(CGST.toFixed(2)),
            date: payDate,
            total: Number(Total),
            paymentMode: mode || 'online',
            paymentDate: dayAndDate,
            mode: mode || 'online',
            customerName: cName,
            customerPhone: cPhone,
            discount: Number(discount),
            zoneId: singleKot?.zoneId,
            tableId: singleKot?.tableId,
            time: indianTime,
            tableName: singleKot?.tableName,
            duesPersonId,
            discountDescription,
            claimedAmount,
            serviceCharge,
            modeBreakDown,
            waiterName,
            tips,
            zoneType,
          },
        ],
        { session },
      );

      await Waiterkot.deleteMany({ tableId: singleKot?.tableId }, { session });
      await Tempmodel.deleteOne(
        {
          tableId: singleKot?.tableId,
        },
        { session },
      );
      await Tempmodel.findOneAndUpdate({ tableId: singleKot.tableId }, { $set: { hiCode } }, { upsert: true, session });
      const updateConfig = {
        status: 'Empty',
        activeUser: 0,
        time: indianTime,
        totalDishQuantity: 0,
        deliveredDish: 0,
        role: null,
        hiCode: '',
        mergedBy: '',
        reservedBy: '',
      };
      await Table.findByIdAndUpdate(singleKot?.tableId, updateConfig, {
        session,
      });
    });

    res.status(200).send({
      status: true,
      message: 'Bill settled successfully',
      err: false,
      data: {}
    });
});

// router.put(
//   "/v1/kitchens/waiterKot/update/:kotId",

//   async (req: Request, res: Response) => {
//     try {
//       var currentTime = Date.now();
//       var momentTime = moment(currentTime);
//       var indianTime = momentTime
//         .clone()
//         .utcOffset("+05:30")
//         .format("HH:mm:ss");
//       //TODO: check if this is required
//       var indianTime2 = momentTime.clone().utcOffset("+05:30").format("HH:mm");

//       const { kotId } = req.params;
//       const { waiterName } = req.body;

//       const created = [];
//       let getWaiterKot = await Waiterkot.findById(kotId);
//       //TODO: USE TIMESTAMP INSTEAD OF UTC OFFSET
//       if (getWaiterKot) {
//         const startedAt = Date.now();
//         for (let i = 0; i < (getWaiterKot.items?.length ?? 0); i++) {
//           const newKOT = getWaiterKot?.items?.[i] as unknown as object;

//           const kot = await Kot.create({
//             ...(newKOT as KOTType),
//             startedAt,
//             cookedAt: -1,
//             status: "UNPAID",
//             kotTime: indianTime,
//             date: moment().format("Do MMM YY"),
//             kotDate: new Date().toISOString().replace("T", " ").slice(0, 19),
//           });

//           //TODO REMOVE CREATED ARRAY
//           created.push(kot);
//         }
//         let query = {
//           businessId: getWaiterKot?.businessId,
//           tableId: getWaiterKot?.tableId,
//           zoneId: getWaiterKot?.zoneId,
//           status: "UNPAID",
//         };
//         // TODO: use SELECT METHOD
//         const existingKOTs = await Kot.find(query);

//         const totalDish = existingKOTs?.length;
//         let deliverd = 0;
//         for (let i = 0; i < existingKOTs.length; i++) {
//           let obj = existingKOTs[i];
//           if (obj?.dishStatus == "delivered") {
//             deliverd += 1;
//           }
//         }
//         // TODO: ADD ZONE-SRV INSTEAD OF PROCESS.ENV.URL
//         const config = {
//           method: "put",
//           url: `${process.env.URL}/v1/zones/${getWaiterKot?.zoneId}/updateOccupied/${getWaiterKot?.tableId}`,
//           data: {
//             totalDishQuantity: totalDish,
//             deliverdDish: deliverd,
//             status: "Active",
//             time: indianTime2,
//           },
//         };

//         try {
//           await axios(config);
//         } catch (err: any) {
//           return res.status(500).send({
//             status: false,
//             message: err.message,
//           });
//         }
//         await Waiterkot.findByIdAndUpdate(kotId, {
//           isAccept: true,
//           acceptedBy: waiterName,
//         });
//         //TODO : REMOVE UNWANTED RESPONSE PAYLOAD
//         return res.status(200).send({
//           status: true,
//           message: "Order Accepted...!",
//           data: created,
//           cart: getWaiterKot?.cart,
//         });
//       } else {
//         return res
//           .status(400)
//           .send({ status: false, message: "Not Accepted..." });
//       }
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

//new accept order

// TODO solve type error datta 
//TODO datta add the appropriate zod schema
router.put('/v1/kitchens/:id/acceptOrder/:kotId',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { kotId } = req.params;
    const { waiterName, kotPrinter } = req.body;
    if (!kotId) {
      return res.status(400).send({
        err:true,
        message: 'Please enter the required fields.',
        data:{}
      });
    }

    await runInTransaction(async (session: ClientSession) => {
      const currentTime = new Date();

      const optionsTimeAndSeconds = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        second: '2-digit' as const,
        hour12: false, // Use 24-hour time
      };
      const formatterTimesAndSeconds = new Intl.DateTimeFormat('en-US', optionsTimeAndSeconds);
      const kotTime = formatterTimesAndSeconds.format(currentTime);

      let getWaiterKot = await Waiterkot.findById(kotId, null, { session });

      if (getWaiterKot?.isAccept) {
        throw new Error('Order already accepted');
      }

      if (getWaiterKot) {
        const startedAt = Date.now();
        const kotsToInsert = [];
        const kotDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
        for (let i = 0; i < (getWaiterKot.items?.length ?? 0); i++) {
          const newKOT = getWaiterKot?.items?.[i] as unknown as object;

          const kot = {
            ...(newKOT as KOTType),
            startedAt,
            cookedAt: -1,
            status: 'UNPAID',
            kotTime: kotTime,
            kotDate: kotDate,
          };
          kotsToInsert.push(kot);
        }

        await Kot.insertMany(kotsToInsert, { session });

        let query = {
          tableId: getWaiterKot?.tableId,
          status: 'UNPAID',
        };
        const existingKOTs = await Kot.find(query, null, { session }).select('dishStatus');

        const totalDish = existingKOTs?.length;
        let delivered = 0;
        for (let i = 0; i < existingKOTs.length; i++) {
          let obj = existingKOTs[i];
          if (obj?.dishStatus == 'delivered') {
            delivered += 1;
          }
        }

        const config = {
          totalDishQuantity: totalDish,
          deliveredDish: delivered,
          status: 'Active',
          time: time,
        };

        await Table.findByIdAndUpdate(getWaiterKot.tableId, config, {
          session,
        });

        await Waiterkot.findByIdAndUpdate(
          kotId,
          {
            isAccept: true,
            acceptedBy: waiterName,
          },
          { session },
        );

        if (getWaiterKot && kotPrinter) {
          const ws_config = {
            method: 'POST',
            url: 'https://ws.hipal.life',
            data: {
              businessId: getWaiterKot?.businessId,
              payload: {
                tableName: getWaiterKot?.tableName,
                cart: getWaiterKot?.cart,
                waiterName: waiterName,
              },
            },
          };
          await axios(ws_config);
        }
      } else {
        throw new Error('Order not found');
      }
    });

    return res.status(200).send({
      status: true,
      message: 'Order Accepted...!',
      data: {}
    });
});

router.put(
  '/v1/kitchens/reject/Order/:orderId',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { waiterName } = req.body;
    let update = { isReject: true, rejectedBy: waiterName };

    const alert = await Waiterkot.findByIdAndUpdate(orderId, update);

    if (!alert) {
      return res.send({ status: false, message: 'Not Found Order' });
    }

    res.status(200).send({
      err: false,
      message: 'Order Rejected',
      data: alert,
    });
  },
);

router.put(
  '/v1/kitchens/Edit/Order/:orderId',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { waiterName } = req.body;

    let update = { isEdit: true, editedBy: waiterName };

    await Waiterkot.findByIdAndUpdate(orderId, update);

    const alert = await Waiterkot.findById(orderId);

    if (!alert) {
      return res.send({ status: false, message: 'Not Found Order' });
    }

    res.status(200).send({
      err: false,
      message: 'Order Edited',
      data: alert,
    });
  },
);

router.put('/v1/kitchens/update/transferTable',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { businessId, fromTableId, fromZoneId, fromTableName, toTableId, toZoneId, toTableName, switchedBy } = req.body;

    await runInTransaction(async (session: ClientSession) => {
      let checkTable;

      checkTable = await Table.findById(toTableId, null, { session });
      if (checkTable?.status != 'Empty') {
        throw new Error('Table must be Empty');
      }

      await Kot.updateMany(
        {
          businessId,
          tableId: fromTableId,
          zoneId: fromZoneId,
          status: 'UNPAID',
        },
        {
          businessId,
          tableId: toTableId,
          zoneId: toZoneId,
          status: 'UNPAID',
          tableName: toTableName,
          switchedBy,
        },
        { session },
      );

      const config = {
        status: 'Empty',
        activeUser: 0,
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        totalDishQuantity: 0,
        deliverdDish: 0,
        role: null,
        hiCode: '',
        mergedBy: '',
        reservedBy: '',
      };

      await Table.findByIdAndUpdate(fromTableId, config, { session });

      const query = {
        businessId,
        tableId: toTableId,
        zoneId: toZoneId,
        status: 'UNPAID',
      };

      const existingKOTs = await Kot.find(query, null, { session }).select('dishStatus');

      const totalDish = existingKOTs?.length;
      let delivered = 0;

      for (const existingKOT of existingKOTs) {
        if (existingKOT?.dishStatus === 'delivered') {
          delivered++;
        }
      }

      const con = {
        totalDishQuantity: totalDish,
        deliverdDish: delivered,
        status: 'Active',
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      await Table.findByIdAndUpdate(toTableId, con, { session });

      await Alert.updateMany(
        {
          tableId: fromTableId,
          zoneId: fromZoneId,
          businessId: businessId,
          isAlertOn: true,
        },
        {
          tableId: toTableId,
          zoneId: toZoneId,
          businessId: businessId,
          isAlertOn: true,
          tableName: toTableName,
        },
        { session },
      );

      await Waiterkot.updateMany(
        {
          zoneId: fromZoneId,
          tableId: fromTableId,
          isAccept: false,
          businessId,
        },
        {
          zoneId: toZoneId,
          tableId: toTableId,
          isAccept: false,
          businessId,
        },
        { session },
      );
    });

    res.status(200).send({
      status: true,
      message: 'Table switched successfully',
      data: {}
    });
});

router.put(
  '/v1/kitchens/:id/updateSingleKot',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    let { isDeleted, deleteKotIds, password, businessId, inventory, reasonForDelete, staffName, priority } = req.body;
    if (priority == true && isDeleted == true) {
      return res.status(400).send("You cann't priorities delete Kot");
    }
    if (isDeleted) {
      let kotPass = await Kotpassword.findOne({ businessId });
      if (!kotPass) {
        return res.status(400).send('Before deletetion set kot password');
      }
      if (password != kotPass?.password) {
        return res.status(400).send('Wrong password');
      }
      let deletedKot = await Kot.updateMany(
        { _id: { $in: deleteKotIds }, status: 'UNPAID' },
        {
          $set: {
            isDeleted,
            inventory,
            reasonForDelete,
            staffName,
            priority: false,
          },
        },
      );

      return res.send({
        err: false,
        message: 'KOT deleted',
        data: deletedKot
      });
    }

    const existingKot = await Kot.findByIdAndUpdate(id, { priority }, { new: true });

    res.status(200).send({
      err: false,
      message: 'found kot',
      data: existingKot
    });
  },
);

router.put(
  '/v1/kitchens/:id/serviceCharge',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    let { tableId, reapply, serviceChargeRemovedBy, serviceChargeAddedBy } = req.body || {};

    if (reapply) {
      serviceChargeRemovedBy = '';
    }
    if (!reapply) {
      serviceChargeAddedBy = '';
    }

    const serviceChargeisExist = await Tempmodel.findOne({
      tableId,
      serviceChargeApply: true,
    });

    if (serviceChargeisExist && reapply) {
      return res.status(400).send({
        err:true,
        message:'Service Charge is already applied',
        data:{}
      });
    }

    const updateServiceCharge = await Tempmodel.findOneAndUpdate(
      { tableId: tableId },
      {
        $set: {
          serviceChargeApply: reapply ? true : false,
          serviceChargeRemovedBy,
          serviceChargeAddedBy,
        },
      },
      { upsert: true },
    );
    return res.send({
      err: false,
      message: 'Service Charge Updated',
      data: updateServiceCharge
    });
  },
);

// router.put(
//   "/v1/kitchens/:kitchenId/settle",

//   async (req: Request, res: Response) => {
//     try {
//       const currentTime = Date.now();
//       const momentTime = moment(currentTime);

//       const Time = momentTime.clone().utcOffset("+05:30");

//       const dayAndDate = Time.format("DD-MM-YYYY");
//       const indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");

//       let {
//         kots,
//         subTotal,
//         Total,
//         SGST,
//         CGST,
//         discount,
//         mode,
//         gstin,
//         customerName,
//         duesPersonId,
//         customerPhone,
//         claimedAmount,
//         discountDescription,
//         serviceCharge,
//         modeBreakDown,
//         otherCharges,
//         zoneType,
//         orderId,
//       } = req.body;
//       if (!mode) {
//         return res.status(400).send("mode Is Required !!");
//       }

//       if (mode == "dues" && !duesPersonId) {
//         return res.status(400).send("DuesPersonId Is Required !!");
//       }

//       return runInTransaction(async (session: ClientSession) => {
//         const created: any = [];
//         for (let i = 0; i < kots.length; i++) {
//           const newKOT = kots[i];
//           const kot = {
//             status: "PAID",
//             cookedAt: Date.now(),
//           };
//           let singlekot = await Kot.findByIdAndUpdate(newKOT, kot, { session });

//           created.push(singlekot);
//         }

//         let singleData = created?.[1] || created?.[0];

//         let businessData;

//         try {
//           let response = await Business.findById(singleData?.businessId).select(
//             "businessName logo id serviceCharge serviceChargePercentage gstNumber fssaiLicenseNumber "
//           );
//           businessData = response;
//         } catch (err: any) {
//           return res.status(400).send({
//             status: false,
//             message: err.message,
//           });
//         }
//         let items = [];

//         for (let i = 0; i < created.length; i++) {
//           let newobj: any = {};
//           (newobj.name = created[i].dish?.name),
//             (newobj.quantity =
//               created[i].dish?.qty || created[i].dish?.quantity);
//           newobj.amount = created[i].dish?.price;
//           newobj.portions = created[i].dish?.portions;
//           (newobj.extras = created[i].dish?.extras),
//             (newobj.comments = "spicy");
//           (newobj.category = created[i].category), items.push(newobj);
//         }
//         for (const item of items) {
//           // Calculate the total price of portions
//           let price;
//           if (item?.portions) {
//             price =
//               parseInt(item?.portions?.price) *
//               parseInt(item?.quantity || item?.qty);
//           } else {
//             price = parseInt(item?.amount);
//           }
//           let extrasPrice = 0;
//           if (item?.extras?.length > 0) {
//             for (const extra of item.extras) {
//               extrasPrice +=
//                 parseInt(extra.price || 0) * extra?.quantity || extra?.qty;
//             }
//           }

//           item.amount = price + extrasPrice;
//         }
//         const cName =
//           customerName == "undefined" || "" || !customerName
//             ? singleData?.customerName
//             : customerName;
//         const cPhone =
//           customerPhone == "undefined" || "" || !customerPhone
//             ? singleData?.customerPhone
//             : customerPhone;

//         if (mode == "complimentary") {
//           discount = 0;
//           Total = 0;
//         }

//         const data = await Payment.create(
//           {
//             businessId: singleData?.businessId,
//             businessName: businessData?.businessName,
//             address: businessData?.address,
//             logo: businessData?.logo,
//             gstin: gstin || "NA",
//             items: items,
//             subTotal: parseInt(subTotal),
//             sgst: Number(SGST?.toFixed(2)),
//             cgst: Number(CGST?.toFixed(2)),
//             total: parseInt(Total),
//             paymentMode: mode || "online",
//             paymentDate: dayAndDate,
//             mode: mode || "online",
//             customerId: Math.floor(
//               Math.random() * (999999 - 100000 + 1) + 100000
//             ),
//             customerName: cName,
//             customerPhone: cPhone,
//             discount: parseInt(discount),
//             zoneId: singleData?.zoneId,
//             tableId: singleData?.tableId,
//             time: indianTime,
//             tableName: singleData?.tableName,
//             duesPersonId: duesPersonId,
//             discountDescription,
//             claimedAmount,
//             serviceCharge,
//             modeBreakDown,
//             otherCharges,
//             zoneType: "Take Away",
//             swiggyBillObj: singleData?.swiggyBillObj,
//             orderId,
//           },
//           { session }
//         );

//         await Alert.updateMany(
//           {
//             zoneId: singleData.zoneId,
//             businessId: singleData.businessId,
//           },
//           { isAlertOn: false },
//           { session }
//         );
//         let obj = [
//           {
//             businessId: singleData?.businessId,
//             tableName: singleData?.tableName,
//             zoneId: singleData?.zoneId,
//             staffId: singleData?.staffId,
//             status: "Paid",
//             time: indianTime,
//             message: `Paid ${Total}`,
//           },
//         ];
//         for (let i = 0; i < obj.length; i++) {
//           let saveAlert = new Alert(obj[i], { session });
//           await saveAlert.save();
//         }

//         return res.status(200).send({
//           status: true,
//           message: "Payment Done Successfully.....!",
//           data: data,
//         });
//       });
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

router.put(
  '/v1/kitchens/:id/orderBySwiggy',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId, orderId } = req.query;
    const { password } = req.body;

    let deleteKotPass = await Kotpassword.findOne({ password: password });
    console.log('deleteKotPass', deleteKotPass);

    if (password != deleteKotPass?.password) {
      return res.status(400).send({
        status: true,
        message: 'Password is incorrect',
        data: {}
      });
    }
    let result = await Kot.updateMany({ businessId, orderId, isDeleted: false }, { isDeleted: true });

    res.status(200).send({
      err: false,
      message: 'Order Deleted',
      data: result
    });
  },
);

router.put(
  '/v1/kitchens/:id/kot/:kotId',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { kotId } = req.params;
    let update = { ...req.body };

    let updateKot = await Kot.findByIdAndUpdate(kotId, update, { new: true });
    return res.status(200).send({
      err: false,
      message: 'KOT Updated',
      data: updateKot
    });
  },
);

router.put(
  '/v1/kitchens/:id/tempModel',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { tableId, remove } = req.query;
    if (tableId) {
      const tables = await Tempmodel.deleteOne({ tableId });
      return res.send(tables);
    }
    if (remove) {
      await Tempmodel.deleteMany();
      // TODO: check the message and status
      return res.status(200).send({
        err:false,  
        status: true,
        message: 'Deleted Successfully',
        data:{}
      });
    }
    let tables = await Tempmodel.find();

    return res.status(200).send({
      err: false,
      message: 'TempModel Updated',
      data: tables
    });
  },
);

router.put(
  '/v1/kitchens/:id/applyDiscount',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { tableId, discountAmount, discountDescription, discountPercentage, discountMode, discountGivenBy, discountRemovedBy } = req.body || {};

    if (discountAmount == 0) {
      discountGivenBy = '';
      discountPercentage = 0;
    }

    if (!tableId) {
      return res.status(400).send({
        err:true,
        message: 'Table Id is required',
        data:{}
      });
    }
    const updateDiscount = await Tempmodel.findOneAndUpdate(
      { tableId: tableId },
      {
        $set: {
          discountAmount,
          discountDescription,
          discountPercentage,
          discountMode,
          discountGivenBy,
          discountRemovedBy,
        },
      },
      { upsert: true, new: true },
    );
    return res.status(200).send({
      err: false,
      message: 'Discount Updated',
      data: updateDiscount
    });
  },
);

router.put(
  '/v1/kitchens/:id/applyCoins',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { tableId, claimedAmount, coinsGivenBy } = req.body || {};
    if (!claimedAmount || claimedAmount < 0) {
      return res.status(400).send({
        err:true,
        message: 'Claimed Amount is required and should be greater than 0',
        data:{}
      });
    }
    if (!tableId) {
      return res.status(400).send({
        err:true,
        message: 'Table Id is required',
        data:{}
      });
    }
    const updateClaimedAmount = await Tempmodel.findOneAndUpdate(
      { tableId: tableId },
      { $set: { claimedAmount, coinsGivenBy } },
      { upsert: true, new: true },
    );
    return res.status(200).send({
      err: false,
      message: 'Claimed Amount Updated',
      data: updateClaimedAmount
    });
  },
);

router.put(
  '/v1/kitchens/:id/applyTips',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { tableId, tipsAmount, tipsGivenBy } = req.body || {};
    if (!tipsAmount || tipsAmount < 0) {
      return res.status(400).send({
        err:true,
        message: 'Tips Amount is required and should be greater than 0',
        data:{}
      });
    }
    if (!tableId) {
      return res.status(400).send({
        err:true,
        message: 'Table Id is required',
        data:{}
      });
    }
    const updateTipsAmount = await Tempmodel.findOneAndUpdate(
      { tableId: tableId },
      { $set: { tipsAmount, tipsGivenBy } },
      { upsert: true, new: true },
    );
    return res.status(200).send({
      err: false,
      message: 'Tips Amount Updated',
      data: updateTipsAmount
    });
  },
);

router.put(
  '/v1/kitchens/:id/e-bill',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const {
      businessId,
      tableId,
      zoneId,
      customerName,
      customerPhone,
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      hasServiceCharge,
      serviceChargePercentage,
    } = req.body;
    const serviceChargeApply = await Tempmodel.findOne({
      tableId,
      serviceChargeApply: false,
    });

    let kots: any[] = [];

    const query = {
      status: 'UNPAID',
      isDeleted: false,
      businessId,
      tableId,
      zoneId,
    } as any;

    const existingKOTs: any = await Kot.find(query, {
      businessId: 0,
      zoneId: 0,
      staffId: 0,
      startedAt: 0,
      cookedAt: 0,
      'dish.comments': 0,
      category: 0,
      status: 0,
      dishStatus: 0,
      dishType: 0,
      priority: 0,
      inventory: 0,
      taxes: 0,
      swiggyBillObj: 0,

      match: 0,
    });
    let subTotal: any = 0;
    let NOGSTTOTL = 0;
    const merged: any = [];
    for (let i = 0; i < existingKOTs.length; i++) {
      let total;
      const obj: any = existingKOTs[i];

      if (obj?.isGst == false) {
        NOGSTTOTL += obj?.dish?.price * obj?.dish?.qty;
      }

      let newPrice = obj?.dish?.price * obj?.dish?.qty || obj?.dish?.quantity;
      let extraPrice = 0;
      let portionPrice = 0;
      if (obj?.dish?.extras?.length > 0) {
        obj?.dish?.extras.forEach((extra: any) => {
          extraPrice += parseInt(extra?.price || 0) * parseInt(extra?.qty || extra?.quantity);
        });
      }

      if (obj?.dish?.portions) {
        portionPrice = parseInt(obj?.dish?.portions?.price);
        total = portionPrice + extraPrice;
      } else {
        total = newPrice + extraPrice;
      }

      obj.dish.price = total;
      subTotal += total;
    }

    existingKOTs.forEach((item: any) => {
      // Find if the dish already exists in the merged array with the same extras and portions
      const existing = merged.find(
        (mItem: any) =>
          mItem.dish.dishId === item.dish.dishId &&
          JSON.stringify(mItem.dish?.extras) === JSON.stringify(item.dish?.extras) &&
          JSON.stringify(mItem.dish?.portions) === JSON.stringify(item.dish?.portions),
      );

      if (existing) {
        // Merge quantities and update the price
        existing.dish.qty += item.dish.qty;
        existing.dish.price += item.dish.price;
      } else {
        // Clone the item and add it to the merged array
        merged.push(JSON.parse(JSON.stringify(item)));
      }
    });

    let copySubtotal = subTotal;
    let discount: Number = 0;
    const tableInfo = await Tempmodel.findOne({ tableId });
    if (tableInfo) {
      if (tableInfo?.discountMode == 'percent') {
        let dis = Math.floor(((tableInfo.discountPercentage > 100 ? 100 : tableInfo.discountPercentage) * subTotal) / 100);
        if (dis > subTotal) {
          subTotal = dis;
        }

        subTotal -= dis;
        discount = dis;
      } else {
        let dis = tableInfo.discountAmount;
        if (dis > subTotal) {
          subTotal = dis;
        }
        subTotal -= dis;
        discount = dis;
      }
    }
    let claimedAmount: Number = 0;

    if (tableInfo) {
      let coins = tableInfo.claimedAmount > subTotal ? subTotal : tableInfo.claimedAmount;
      if (coins > subTotal) {
        subTotal = coins;
      }
      subTotal -= coins;
      claimedAmount = coins;
    }
    if (discount > copySubtotal || discount == copySubtotal) {
      claimedAmount = 0;
    }
    let totalTips = 0;

    if (tableInfo) {
      let tip = tableInfo.tipsAmount;
      totalTips = tip;
      if (totalTips < 0) {
        totalTips = 0;
      }
    }

    let serviceCharge = 0;
    if (hasServiceCharge && !serviceChargeApply) {
      let percentage = serviceChargePercentage;
      serviceCharge = (subTotal * percentage) / 100 || 0;
    }
    if (discount > copySubtotal || discount == copySubtotal) {
      serviceCharge = 0;
    }
    if (subTotal < 0) {
      subTotal = 0;
    }
    if (serviceCharge < 0) {
      serviceCharge = 0;
    }
    let flag = false;
    subTotal += serviceCharge - NOGSTTOTL;
    if (subTotal < 0) {
      flag = true;
    }
    let Total: number = 0;
    let newSubTotal = 0;
    if (flag) {
      newSubTotal = serviceCharge;
    } else {
      newSubTotal = subTotal;
    }
    let GST = newSubTotal * 0.05;

    let SGST = GST / 2;
    let CGST = SGST;
    if (SGST < 0) {
      SGST = 0;
      CGST = 0;
    }
    subTotal += SGST + CGST + totalTips;
    Total = Math.round(subTotal + NOGSTTOTL);

    let obj: any = {
      subTotal: copySubtotal,
      discount,
      SGST: Number(SGST?.toFixed(2)),
      CGST: Number(CGST?.toFixed(2)),
      Total,
      kots,

      customerName,
      customerPhone,
      claimedAmount,
    };

    if (hasServiceCharge && !serviceChargeApply && serviceCharge > 0) {
      obj['serviceCharge'] = Number(serviceCharge?.toFixed(2));
    }

    if (totalTips > 0) {
      obj['tips'] = totalTips;
    }
    existingKOTs.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    existingKOTs.push(obj);

    merged.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    merged.push(obj);
    if (merged?.length == 2) {
      return res.status(200).send([]);
    }

    let billObj = {
      tableId,
      businessId,
      zoneId,
      time: time,
      date: currentDateAndTime,
      bill: existingKOTs,
    };

    let saveData = new Userbill(billObj);
    let bill = await saveData.save();

    return res.send({ err: false, message: 'e-bill', data: bill?._id, billId: bill?._id });
  },
);

router.put(
  '/v1/kitchens/:id/printBill',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const {
      businessId,
      tableId,
      zoneId,
      customerName,
      customerPhone,
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      hasServiceCharge,
      serviceChargePercentage,
    } = req.body;
    const serviceChargeApply = await Tempmodel.findOne({
      tableId,
      serviceChargeApply: false,
    });

    let kots: any[] = [];

    const query = {
      status: 'UNPAID',
      isDeleted: false,
      businessId,
      tableId,
      zoneId,
    } as any;

    const existingKOTs: any = await Kot.find(query, {
      businessId: 0,
      zoneId: 0,
      staffId: 0,
      startedAt: 0,
      cookedAt: 0,
      'dish.comments': 0,
      category: 0,
      status: 0,
      dishStatus: 0,
      dishType: 0,
      priority: 0,
      inventory: 0,
      taxes: 0,
      swiggyBillObj: 0,

      match: 0,
    });
    let subTotal: any = 0;
    let NOGSTTOTL = 0;
    const merged: any = [];
    for (let i = 0; i < existingKOTs.length; i++) {
      let total;
      const obj: any = existingKOTs[i];

      if (obj?.isGst == false) {
        NOGSTTOTL += obj?.dish?.price * obj?.dish?.qty;
      }

      let newPrice = obj?.dish?.price * obj?.dish?.qty || obj?.dish?.quantity;
      let extraPrice = 0;
      let portionPrice = 0;
      if (obj?.dish?.extras?.length > 0) {
        obj?.dish?.extras.forEach((extra: any) => {
          extraPrice += parseInt(extra?.price || 0) * parseInt(extra?.qty || extra?.quantity);
        });
      }

      if (obj?.dish?.portions) {
        portionPrice = parseInt(obj?.dish?.portions?.price);
        total = portionPrice + extraPrice;
      } else {
        total = newPrice + extraPrice;
      }

      obj.dish.price = total;
      subTotal += total;
    }

    existingKOTs.forEach((item: any) => {
      // Find if the dish already exists in the merged array with the same extras and portions
      const existing = merged.find(
        (mItem: any) =>
          mItem.dish.dishId === item.dish.dishId &&
          JSON.stringify(mItem.dish?.extras) === JSON.stringify(item.dish?.extras) &&
          JSON.stringify(mItem.dish?.portions) === JSON.stringify(item.dish?.portions),
      );

      if (existing) {
        // Merge quantities and update the price
        existing.dish.qty += item.dish.qty;
        existing.dish.price += item.dish.price;
      } else {
        // Clone the item and add it to the merged array
        merged.push(JSON.parse(JSON.stringify(item)));
      }
    });

    let copySubtotal = subTotal;
    let discount: Number = 0;
    const tableInfo = await Tempmodel.findOne({ tableId });
    if (tableInfo) {
      if (tableInfo?.discountMode == 'percent') {
        let dis = Math.floor(((tableInfo.discountPercentage > 100 ? 100 : tableInfo.discountPercentage) * subTotal) / 100);
        if (dis > subTotal) {
          subTotal = dis;
        }

        subTotal -= dis;
        discount = dis;
      } else {
        let dis = tableInfo.discountAmount;
        if (dis > subTotal) {
          subTotal = dis;
        }
        subTotal -= dis;
        discount = dis;
      }
    }
    let claimedAmount: Number = 0;

    if (tableInfo) {
      let coins = tableInfo.claimedAmount > subTotal ? subTotal : tableInfo.claimedAmount;
      if (coins > subTotal) {
        subTotal = coins;
      }
      subTotal -= coins;
      claimedAmount = coins;
    }
    if (discount > copySubtotal || discount == copySubtotal) {
      claimedAmount = 0;
    }
    let totalTips = 0;

    if (tableInfo) {
      let tip = tableInfo.tipsAmount;
      totalTips = tip;
      if (totalTips < 0) {
        totalTips = 0;
      }
    }

    let serviceCharge = 0;
    if (hasServiceCharge && !serviceChargeApply) {
      let percentage = serviceChargePercentage;
      serviceCharge = (subTotal * percentage) / 100 || 0;
    }
    if (discount > subTotal || discount == subTotal) {
      serviceCharge = 0;
    }
    if (subTotal < 0) {
      subTotal = 0;
    }
    if (serviceCharge < 0) {
      serviceCharge = 0;
    }
    let flag = false;
    subTotal += serviceCharge - NOGSTTOTL;
    if (subTotal < 0) {
      flag = true;
    }

    let Total: number = 0;
    let newSubTotal = 0;
    if (flag) {
      newSubTotal = serviceCharge;
    } else {
      newSubTotal = subTotal;
    }
    let GST = newSubTotal * 0.05;

    let SGST = GST / 2;
    let CGST = SGST;
    if (SGST < 0) {
      SGST = 0;
      CGST = 0;
    }
    subTotal += SGST + CGST + totalTips;
    Total = Math.round(subTotal + NOGSTTOTL);

    let obj: any = {
      subTotal: copySubtotal,
      discount,
      SGST: Number(SGST?.toFixed(2)),
      CGST: Number(CGST?.toFixed(2)),
      Total,
      kots,

      customerName,
      customerPhone,
      claimedAmount,
    };

    if (hasServiceCharge && !serviceChargeApply && serviceCharge > 0) {
      obj['serviceCharge'] = Number(serviceCharge?.toFixed(2));
    }

    if (totalTips > 0) {
      obj['tips'] = totalTips;
    }
    existingKOTs.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    existingKOTs.push(obj);

    merged.push({
      businessName,
      logo,
      gstNumber,
      fssaiLicenseNumber,
      serviceCharge: hasServiceCharge,
      serviceChargePercentage,
    });
    merged.push(obj);
    if (merged?.length == 2) {
      return res.status(200).send([]);
    }

    const currentTime = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit' as const,
      minute: '2-digit' as const,
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const time = formatter.format(currentTime);
    let billObj = {
      tableId,
      businessId,
      zoneId,
      time: time,
      date: currentDateAndTime,
      bill: existingKOTs,
    };

    let saveData = new Userbill(billObj);
    let bill = await saveData.save();

    return res.send({ err: false, message: 'printBill', data: bill?._id, billId: bill?._id });
  },
);

router.put(
  '/v1/kitchens/:id/applyMode',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { tableId, mode } = req.body || {};
    if (!mode || !tableId) {
      return res.status(400).send({
        err:true,
        message: 'Mode and tableId required',
        data:{}
      });
    }

    const updateMode = await Tempmodel.findOneAndUpdate({ tableId: tableId }, { $set: { mode } }, { upsert: true, new: true });
    return res.status(200).send({
      err: false,
      message: 'Mode Updated',
      data: updateMode
    });
  },
);

router.put(
  '/v1/kitchens/:id/applyDues',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { tableId, duesPersonId, customerName, customerPhone } = req.body || {};
    if (!duesPersonId || !tableId || !customerName) {
      return res.status(400).send({
        err:true,
        message: 'DuesPerson`s Id, table`s Id and customer name required',
        data:{}
      });
    }

    const updateDues = await Tempmodel.findOneAndUpdate(
      { tableId: tableId },
      { $set: { duesPersonId, customerName, customerPhone } },
      { upsert: true, new: true },
    );
    return res.send({
      err: false,
      message: 'Dues Updated',
      data: updateDues
    });
  },
);

export { router as updateKitchenRouter }
