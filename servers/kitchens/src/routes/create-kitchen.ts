import express, { Request, Response } from 'express';
import { validateRequest } from 'zod-express-middleware';
import { Kitchen, Kot, Kotpassword, Printer, Table, Tempmodel, Waiterkot } from '@hi/db-models';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';

import axios from 'axios';
import moment = require('moment');

import { razorpayWrapper } from '../razorpay-wrapper';

const { validateWebhookSignature } = require('../utils/razorpay-utils');

import { KOTAttrs, KOTType, KitchenAttrs } from '@hi/db-models/src/validators';
import { createHmac } from 'crypto';
import { z } from 'zod';

const router = express.Router();

const currentTime = new Date();
const options = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};
const formatter = new Intl.DateTimeFormat('en-US', options);
const time = formatter.format(currentTime);

const optionsDate = {
  timeZone: 'Asia/Kolkata',
  year: 'numeric' as const,
  month: '2-digit' as const,
  day: '2-digit' as const,
};
const formatterDate = new Intl.DateTimeFormat('en-US', optionsDate);
const currentDateAndTime = formatterDate.format(currentTime);

const optionsTimeAndSeconds = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit' as const,
  minute: '2-digit' as const,
  second: '2-digit' as const,
  hour12: false, // Use 24-hour time
};
const formatterTimesAndSeconds = new Intl.DateTimeFormat('en-US', optionsTimeAndSeconds);
const kotTime = formatterTimesAndSeconds.format(currentTime);

router.post(
  '/v1/kitchens/kickOut/kots',
  validateRequest({
    body: KOTAttrs,
  }),
  async <T,K>(req: Request<T,K, z.infer<typeof KOTAttrs>>, res: Response) => {
    try {
      const { zoneId, tableId } = req.body || {};

      const update = await Kot.updateMany(
        {
          zoneId,
          tableId,
          status: 'UNPAID',
        },
        {
          $set: {
            status: 'PAID',
            cookedAt: Date.now(),
          },
        },
      );

      if (!update) {
        return res.send({ status: false, message: 'Not Found Order' });
      }
      await Waiterkot.deleteMany({
        zoneId: zoneId,
        tableId: tableId,
        isAccept: false,
      });

      res.status(200).send(update);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.post(
  '/v1/kitchens',
  validateRequest({
    body: KitchenAttrs,
  }),
  async <T,K>(req: Request<T,K, z.infer<typeof KitchenAttrs>>, res: Response) => {
    const { businessId, kitchenName, description, staff } = req.body;

    const kitchen = await Kitchen.create({
      businessId,
      kitchenName,
      description,
      staff,
    });

    res.status(201).send(kitchen);
  },
);

// router.post(
//   "/v1/kitchens/User/WaiterCalling",

//   async (req: Request, res: Response) => {
//     try {
//       var currentTime = Date.now();
//       var momentTime = moment(currentTime);
//       var indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");
//       let { businessId, tableName, zoneId, tableId } = req.body;
//       const { paid, kitchen, kitchenName, staffId } = req.query;
//       return runInTransaction(async (session: ClientSession) => {
//         let message;
//       let newStatus;
//       if (paid) {
//         message = "User wants to settle";
//         newStatus = "Settle";
//       } else if (kitchen) {
//         const existingTables = await Table.find({
//           businessId,
//         });
//         let tables = existingTables.filter((table: any) =>
//           table?.staff.includes(staffId)
//         );
//         const table = tables?.[0] || {};

//         (zoneId = table?.zoneId),
//           (tableId = table?.id),
//           (message = "kitchen needs you");
//         tableName = kitchenName;
//         newStatus = "Kitchen";
//       } else {
//         (newStatus = "Need assistance"), (message = "Needs your assistance");
//       }

//       let table =await Table.findById(tableId);
//       let status = "5";
//       if (
//         table?.status != "Need assistance"

//       ) {
//         status = table?.status;
//       } else {
//         let alert = await Alert.find({
//           isAlertOn: true,
//           tableId,
//           zoneId,
//           businessId,
//         }).sort({ _id: -1 });
//         console.log(alert);
//         status = alert?.[0].staffId || "5";
//       }

//       let obj = {
//         businessId,
//         tableName,
//         zoneId,
//         tableId,
//         message: message,
//         status: newStatus,
//         staffId: status,
//         time: indianTime,
//       };
//       let alert = new Alert(obj);
//       let saveAlert = await alert.save();

//       if (!kitchen) {
//         const config = {
//           method: "put",
//           url: `${process.env.URL}/v1/zones/${zoneId}/tables/${tableId}`,
//           data: {
//             status: "Need assistance",
//           },
//         };

//         try {
//           await axios(config);
//         } catch (err: any) {
//           return res
//             .status(400)
//             .send({ status: false, message: "need assitance not updated !!" });
//         }
//       }

//       if (!saveAlert) {
//         return res
//           .status(400)
//           .send({ status: false, message: "Alert not saved" });
//       } else {
//         return res
//           .status(201)
//           .send({ status: true, message: "Alert saved", data: saveAlert });
//       }
//       });
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

router.post(
  '/v1/kitchens/:kitchenId/kots',

  async (req: Request, res: Response) => {
    try {
      var currentTime = Date.now();
      var momentTime = moment(currentTime);
      var indianTime = momentTime.clone().utcOffset('+05:30').format('HH:mm:ss');

      const { kots }: { kots: KOTType[] } = req.body;

      const created = [];
      const startedAt = Date.now();
      for (let i = 0; i < kots.length; i++) {
        const newKOT = kots[i];
        const kot = await Kot.create({
          ...newKOT,
          startedAt,
          cookedAt: -1,
          status: 'UNPAID',
          kotTime: indianTime,
          date: moment().format('Do MMM YY'),
        });

        created.push(kot);
      }
      res.status(201).send(created);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

const cartToKots = (
  cart: any,
  businessId: string,
  tableId: string,
  zoneId: string,
  tableName: string,
  customerName: string,
  customerPhone: string,
) => {
  const kotArray: any = [];
  for (const dish of Object.values(cart) as any) {
    for (const variant of dish?.variants) {
      const extras = variant?.extra ? Object.values(variant.extra) : [];
      const portions = variant?.portion ? variant?.portion : {};

      const kotObject = {
        businessId: businessId,
        kitchenId: dish?.dishData?.kitchenId,
        zoneId: zoneId,
        tableId: tableId,
        staffId: '5',
        dish: {
          dishId: dish?.dishData._id,
          name: dish?.dishData?.name,
          price: dish?.dishData?.price,
          qty: 1,
          comments: 'spicy',
          extras,
          portions,
        },
        dishType: dish?.dishData?.dishType,
        category: dish?.parentCategoryName || dish?.dishData?.categories?.[0]?.name,
        customerName: customerName,
        customerPhone: customerPhone,
        instructions: variant?.instruction,
        dishStatus: 'cooking',
        tableName: tableName,
        avgTime: dish?.dishData?.avgTime,
        taxes: dish?.dishData?.taxes,
      };

      kotArray.push(kotObject);
    }
  }

  return kotArray;
};

const getParentData = async (zoneId: string, tableId: string, session: any) => {
  try {
    const parentTable = await Table.findById(tableId, null, { session });
    return parentTable;
  } catch (error) {
    console.log(error);
  }
};

// new One for waiter
router.post('/v1/kitchens/:id/user/kots', async (req: Request, res: Response) => {
  try {
    let { businessId, zoneId, tableId, tableName, cart, customerName, customerPhone, hiCode } = req.body || {};

    if (!businessId || !zoneId || !tableId) {
      res.status(404).send({
        status: false,
        message: 'businessId ,TableId,zoneId are required...!',
      });
      return;
    }
    await runInTransaction(async (session: ClientSession) => {
      let tableInfo;

      try {
        tableInfo = await Table.findById(tableId, null, { session });
        if (tableInfo?.isMerge && tableInfo?.hierarchy == 'CHILD') {
          const parentTable = await getParentData(tableInfo?.parentZoneId, tableInfo?.parentTableId, session);
          zoneId = parentTable?.zoneId;
          tableId = parentTable?.id;
          tableInfo = parentTable;
        }
      } catch (err: any) {
        console.log(err);
        res.status(400).send({
          status: false,
          message: 'something went wrong please try again!',
        });
        return;
      }

      if (hiCode) {
        const isTableSettled = await Tempmodel.findOne({ hiCode }, null, {
          session,
        });

        if (isTableSettled || (hiCode != tableInfo?.hiCode && tableInfo?.hiCode == '')) {
          res.status(403).send({ message: 'Table are Already Setteled....!' });
          return;
        }
      }

      if (!tableInfo?.role) {
        let updateTable: any;

        const update = {
          role: {
            role: 'Admin',
            customerName,
            customerPhone,
          },
          hiCode: Math.floor(Math.random() * 9000) + 1000,
        };

        try {
          updateTable = await Table.findByIdAndUpdate(tableId, update, {
            new: true,
            session,
            rawResult: true,
          });
        } catch (err: any) {
          console.log(err.message);
          res.status(400).send('something went wrong please try again!');
          return;
        }
        const currentTime = new Date();
        const options = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit' as const,
          minute: '2-digit' as const,
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const time = formatter.format(currentTime);

        const kotArray = cartToKots(cart, businessId, tableId, zoneId, tableName, customerName, customerPhone);

        const obj = {
          businessId,
          tableName,
          staffId: '5',
          items: kotArray,
          time: time,
          date: currentDateAndTime,
          tableId,
          zoneId,
          cart: cart,
        };

        await Waiterkot.create([obj], { session: session });
        //TODO: message be specific
        res.status(201).send({
          status: true,
          message: 'Created Successfully',
          role: updateTable?.value?.role,
          hiCode: updateTable?.value?.hiCode,
        });
        return;
      } else {
        if (customerPhone != tableInfo?.role?.customerPhone) {
          if (!hiCode) {
            let name = tableInfo?.role?.customerName;
            if (name) {
              name = name.charAt(0).toUpperCase() + name.slice(1) || 'Friend';
            }
            res.status(400).send({
              status: false,
              message: `Enter Valid Hicode !!! ${name} is already on this table`,
            });
          }

          if (tableInfo?.hiCode !== hiCode) {
            res.status(400).send({ status: false, message: 'Enter Valid Hicode !!!' });
            return;
          }
        }
        const currentTime = new Date();
        const options = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit' as const,
          minute: '2-digit' as const,
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const time = formatter.format(currentTime);
        const kotArray = cartToKots(cart, businessId, tableId, zoneId, tableName, customerName, customerPhone);
        const obj = {
          businessId,
          tableName,
          staffId: '5',
          items: kotArray,
          time: time,
          date: currentDateAndTime,
          tableId,
          zoneId,
          cart: cart,
        };

        await Waiterkot.create([obj], { session });

        if (customerPhone == tableInfo?.role?.customerPhone) {
          res.status(201).send({
            status: true,
            role: tableInfo?.role,
            hiCode: tableInfo?.hiCode,
          });
        }
        res.status(201).send({
          status: true,
          message: 'Create Successfully',
        });
        return;
      }
    });
  } catch (err: any) {
    res.status(500).send({ status: false, message: err.message });
  }
});

// new One for pos  side
router.post('/v1/kitchens/:id/waiter/kots', async (req: Request, res: Response) => {
  try {
    const { businessId, zoneId, tableId, timeWithSeconds, tableName, cart, waiterName, waiterPhone } = req.body || {};
    if (!businessId || !zoneId || !tableId) {
      return res.status(400).send('businessId ,TableId,zoneId ar required...!');
    }
    let responseMessage = '';
    await runInTransaction(async (session: ClientSession) => {
      const kotDate = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const startedAt = Date.now();

      let kotArray = cartToKots(cart, businessId, tableId, zoneId, tableName, waiterName, waiterPhone);
      const kots = kotArray.map((newKOT: KOTType) => {
        return {
          ...(newKOT as KOTType),
          startedAt,
          cookedAt: -1,
          status: 'UNPAID',
          kotTime: timeWithSeconds,
          kotDate: kotDate,
        };
      });

      await Kot.insertMany(kots, { session });

      const query = {
        tableId,
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

      const update = {
        totalDishQuantity: totalDish,
        deliverdDish: delivered,
        status: 'Active',
        time: timeWithSeconds?.slice(0, 5),
      };

      try {
        await Table.findByIdAndUpdate(tableId, update, { session });
        responseMessage = 'KOT created successfully';
      } catch (err: any) {
        responseMessage = err.message;
        throw err;
      }
    });
    if (responseMessage == 'KOT created successfully') {
      return res.status(201).send({ status: true, data: 'KOT created successfully' });
    } else {
      return res.status(400).send(responseMessage);
    }
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.post('/v1/kitchens/Add/Printer', async (req: Request, res: Response) => {
  try {
    const { businessId, printers, billPrinter } = req.body;

    const existingPrinter = await Printer.findOne({ businessId });

    if (existingPrinter) {
      const updatedPrinter = await Printer.findOneAndUpdate(
        { businessId },
        { printers, billPrinter },
        {
          new: true,
        },
      );

      return res.send(updatedPrinter);
    } else {
      const newPrinter = new Printer(req.body);
      const savedPrinter = await newPrinter.save();

      return res.send(savedPrinter);
    }
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
});

router.get('/v1/kitchens/Add/Printer', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query;

    const existingPrinter = await Printer.findOne({ businessId });
    return res.send(existingPrinter);
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
});

router.post('/v1/kitchens/kotPassword', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.body;
    const exitingKotPass = await Kotpassword.findOne({ businessId });
    if (exitingKotPass) {
      return res.status(400).send('Already Password set');
    }
    let newPass = Math.floor(Math.random() * 9000) + 10000;
    const savedata = new Kotpassword({ businessId, password: newPass });
    const saveKotPassword = await savedata.save();
    return res.status(201).send(saveKotPassword);
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
});

router.post(
  '/v1/kitchens/:kitchenId/swiggy',
  // validateKOT,
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  // validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { businessId, zoneId, tableName, cart, waiterName, waiterPhone, orderId, deletedKotId } = req.body || {};
      if (deletedKotId) {
        await Kot.findByIdAndUpdate(deletedKotId, { isDeleted: true }, { new: true });
      }

      let object = cart as { cart: any };
      const currentTime = Date.now();
      const momentTime = moment(currentTime);
      const indianTime = momentTime.clone().utcOffset('+05:30').format('HH:mm:ss');
      let kotArray: any[] = [];
      let DishArray = Object.values(object);

      for (const dish of DishArray) {
        for (const variant of dish?.variants) {
          if (variant?.portion || (variant?.extra && Object.values(variant?.extra).length > 0)) {
            let extras = variant?.extra ? Object.values(variant.extra) : [];
            let portions = variant?.portion ? variant?.portion : {};

            let kotObject = {
              businessId,
              kitchenId: dish?.dishData?.kitchenId,
              zoneId,
              staffId: '5',
              dish: {
                dishId: dish?.dishId,
                name: dish?.dishData?.name,
                price: Number(dish.dishData?.price),
                qty: 1,
                comments: 'spicy',
                extras,
                portions,
              },
              dishType: dish?.dishData?.dishType,
              category: dish?.dishData?.categories?.[0]?.name,
              customerName: waiterName,
              customerPhone: waiterPhone,
              instructions: variant?.instruction,
              dishStatus: 'cooking',
              tableName,
              orderId,
            };

            kotArray.push(kotObject);
          } else {
            let kotObject = {
              businessId,
              kitchenId: dish?.dishData?.kitchenId,
              zoneId,
              staffId: '5',
              dish: {
                dishId: dish.dishId,
                name: dish.dishData?.name,
                price: Number(dish.dishData?.price),
                qty: 1,
                comments: 'spicy',
                extras: [],
                portions: {},
              },
              dishType: dish?.dishData?.dishType,
              category: dish?.dishData?.categories?.[0]?.name,
              customerName: waiterName,
              customerPhone: waiterPhone,
              dishStatus: 'cooking',
              instructions: variant?.instruction,
              tableName,
              orderId,
            };
            kotArray.push(kotObject);
          }
        }
      }

      const created = [];

      const startedAt = Date.now();
      for (const newKOT of kotArray) {
        const kot = await Kot.create({
          ...(newKOT as KOTType),
          startedAt,
          cookedAt: -1,
          status: 'UNPAID',
          kotTime: indianTime,
          date: moment().format('Do MMM YY'),
          kotDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
        });

        created.push(kot);
      }

      return res.status(201).send(created);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.post('/v1/kitchens/:kitchenId/openItem', async (req: Request, res: Response) => {
  try {
    const { zoneId, tableId, dishType, kitchenId, businessId } = req.body || {};
    if (!zoneId || !tableId || !dishType || !kitchenId || !businessId) {
      return res.status(400).send({
        status: false,
        message: 'zoneId, tableId, dishType, kitchenId, businessId is required',
      });
    }
    if (!req.body.dish.price || typeof req.body.dish.price == 'string') {
      return res.status(400).send({
        status: false,
        message: 'Price is required',
      });
    }

    let kot;
    let error;
    await runInTransaction(async (session: ClientSession) => {
      try {
        kot = await Kot.create(
          {
            ...req.body,
            startedAt: Date.now(),
            cookedAt: -1,
            status: 'UNPAID',
            kotTime: kotTime,
            kotDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
          },
          { session },
        );

        const query = {
          businessId,
          tableId,
          zoneId,
          status: 'UNPAID',
        };

        const existingKOTs = await Kot.find(query, { session }).select('dishStatus');

        const totalDish = existingKOTs?.length;
        let delivered = 0;

        for (const existingKOT of existingKOTs) {
          if (existingKOT?.dishStatus === 'delivered') {
            delivered++;
          }
        }

        const update = {
          totalDishQuantity: totalDish,
          deliverdDish: delivered,
          status: 'Active',
          time: time,
        };

        await Table.findByIdAndUpdate(tableId, update, { session });
      } catch (err: any) {
        error = err;
      }
    });

    if (error) {
      return res.status(500).send({
        status: false,
        message: 'Internal Server Error',
      });
    }

    return res.status(201).send(kot);
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.post(
  '/v1/kitchens/:kitchenId/swiggyKots',
  // validateKOT,
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  // validateRequest,
  async (req: Request, res: Response) => {
    try {
      var currentTime = Date.now();
      var momentTime = moment(currentTime);
      var indianTime = momentTime.clone().utcOffset('+05:30').format('HH:mm:ss');

      const body = req.body;
      let kots = body?.kots;

      const created = [];
      const startedAt = Date.now();
      for (let i = 0; i < kots.length; i++) {
        const newKOT = kots[i];
        const kot = await Kot.create({
          ...newKOT,
          startedAt,
          cookedAt: -1,
          status: 'UNPAID',
          kotTime: indianTime,
          date: moment().format('Do MMM YY'),
        });

        created.push(kot);
      }
      res.status(201).send(created);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

const getUpdatedCart = (kots: any, isDeleted: any) => {
  let cart: any = {};

  for (let i = 0; i < kots.length; i++) {
    let kot = kots[i];
    console.log('kot', kot);
    if (kot?.match != false) {
      const dishData = {
        businessId: kot.businessId,
        name: kot.dish.name,
        price: kot.dish.price,
        kitchenId: kot.kitchenId,
        delete: isDeleted,
      };
      const variants: any = [];
      const extraVariants: any = {};
      if (kot.dish.extras && kot.dish.extras.length > 0) {
        kot.dish.extras.forEach((extra: any, index: any) => {
          extraVariants[`${extra?.name}${index}`] = {
            name: extra.name,
            price: extra.price,
            quantity: extra.quantity,
          };
        });
      }

      // Function to check if an object has any keys
      const hasKeys = (obj: any) => obj && Object.keys(obj).length > 0;

      // Update portion logic
      let portion = hasKeys(kot.dish.portions) ? kot.dish.portions : null;

      variants.push({
        extra: extraVariants,
        portion: portion,
      });

      cart[Math.floor(Math.random() * 9000) + 1000] = {
        dishData,
        dishId: kot.dish.dishId,
        variants,
        quantity: kot.dish.qty || kot.dish.quantity,
      };
    }
  }
  return cart;
};

router.post('/v1/kitchens/:kitchenId/kotPrint', async (req: Request, res: Response) => {
  try {
    const { kotObject } = req.body || {};
    const config = {
      method: 'post',
      url: `https://ws.hipal.life`,
      data: kotObject,
    };

    try {
      await axios(config);
    } catch (err: any) {
      return res.status(500).send({
        status: false,
        message: err.message,
      });
    }

    res.status(200).send({
      status: true,
      message: 'KOT Successful Print',
    });
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.post(
  '/v1/kitchens/:id/transferKot',

  async (req: Request, res: Response) => {
    try {
      const { toZoneId, toTableId, kotObjectArray, transferBy } = req.body || {};
      console.log('kotObjectArray', kotObjectArray);

      await runInTransaction(async (session: ClientSession) => {
        let fromTableId = kotObjectArray?.[0]?.tableId;
        let fromZoneId = kotObjectArray?.[0]?.zoneId;

        if (!toZoneId || !toTableId || kotObjectArray?.length == 0) {
          throw new Error('toZoneId , toTableId , kotObjectArray are required...!');
        }

        const transferKotIds: string[] = [];
        const kotObjects = kotObjectArray.map((kotObject: any) => {
          let kotId = kotObject?.id || kotObject?._id;
          delete kotObject.__v;
          delete kotObject._id;
          transferKotIds.push(kotId);

          return {
            ...kotObject,
            tableId: toTableId,
            zoneId: toZoneId,
            transferBy: transferBy,
          };
        });
        await Kot.insertMany(kotObjects, { session });

        await Kot.deleteMany({ _id: { $in: transferKotIds } }, { session });

        let kots = await Kot.find(
          {
            tableId: toTableId,
            zoneId: toZoneId,
            status: 'UNPAID',
          },
          null,
          { session },
        ).select('dishStatus');
        let deliverdDish = 0;
        kots.forEach((kot: any) => {
          if (kot.dishStatus == 'delivered') {
            deliverdDish++;
          }
        });
        let existingKOT = await Kot.find(
          {
            tableId: fromTableId,
            zoneId: fromZoneId,
            status: 'UNPAID',
          },
          null,
          { session },
        ).select('dishStatus');
        const config = {
          status: 'Active',
          totalDishQuantity: kots?.length,
          deliverdDish: deliverdDish,
        };
        await Table.findByIdAndUpdate(toTableId, config, { session });
        const con = {
          status: existingKOT?.length > 0 ? 'Active' : 'Empty',
          totalDishQuantity: existingKOT.length,
        };
        await Table.findByIdAndUpdate(fromTableId, con, { session });

        res.status(200).send({
          status: true,
          message: 'KOT Transferred Successfully',
        });
      });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.post('/v1/kitchens/:id/mergeKot', async (req: Request, res: Response) => {
  try {
    const { tables } = req.body || {};
    let error;
    let message;
    await runInTransaction(async (session: ClientSession) => {
      try {
        let parentTable = tables?.filter((table: any) => table?.hierarchy == 'PARENT');
        let tableId = parentTable?.[0]?.tableId;

        for (let index = 0; index < tables.length; index++) {
          const table = tables[index];
          if (table?.hierarchy == 'CHILD') {
            let kots = await Kot.find(
              {
                tableId: table.tableId,
                zoneId: table.parentZoneId,
                status: 'UNPAID',
                isDeleted: false,
              },
              { session },
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
              await Kot.create(kot, { session });

              await Kot.findByIdAndDelete(kotId, { session });
            }
          }
        }
        let kots = await Kot.find(
          {
            tableId: tables?.[1].parentTableId,
            zoneId: tables?.[1].parentZoneId,
            status: 'UNPAID',
            isDeleted: false,
          },
          { session },
        ).count();
        const config = {
          totalDishQuantity: kots,
        };

        await Table.findByIdAndUpdate(tableId, config, { session });
        message = 'success';
      } catch (err: any) {
        error = err;
      }
    });

    if (error) {
      console.log(error);
      return res.status(500).send({
        status: false,
        message: 'something went wrong please try again!',
      });
    }

    return res.status(200).send(message);
  } catch (err: any) {
    console.log(err);
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.post(
  '/v1/kitchens/:id/deleteKotAlert',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    let body = req.body || {};
    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';
    try {
      let response = await axios.post(
        `https://graph.facebook.com/v17.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `${body?.phone}`,
          type: 'template',
          template: {
            name: 'deleteitem',
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  // businessName
                  {
                    type: 'text',
                    text: `${body?.businessName}`,
                  },

                  {
                    type: 'text',
                    text: `${body?.tableName}`,
                  },
                  //discountPercentage
                  {
                    type: 'text',
                    text: `${body?.date}`,
                  },
                  //discountReason
                  {
                    type: 'text',
                    text: `${body?.itemName}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.reasonForDelete}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.orderBy}`,
                  },

                  //waiterName
                  {
                    type: 'text',
                    text: `${body?.waiterName}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.itemPrice}`,
                  },
                ],
              },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.status(200).send('response');
    } catch (error) {
      console.error('Error while processing the dues:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.post(
  '/v1/kitchens/createOrder',

  // requireAuthorization([
  //   ClientRoles.HIPAL_CUSTOMER,
  //   ClientRoles.RESTAURANT_OWNER,
  // ]),

  async (req: Request, res: Response) => {
    const { total, currency, name, phone, businessId } = req.body || {};

    try {
      const response = await razorpayWrapper.client.orders.create({
        amount: total * 100,
        currency: currency,
        receipt: 'receipt#1',
        notes: {
          name: name,
          phone: phone,
          businessId: businessId,
        },
      });

      res.status(200).send(response.id);
    } catch (error: any) {
      console.log('erro', error.error);
      res.status(400).send(error);
    }
  },
);

router.post(
  '/v1/kitchens/validPayment',

  // requireAuthorization([
  //   ClientRoles.HIPAL_CUSTOMER,
  //   ClientRoles.RESTAURANT_OWNER,
  // ]),

  async (req: Request, res: Response) => {
    const { response } = req.body || {};
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
    try {
      const signature = createHmac('sha256', process.env.RAZORPAY_SECRET as string)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (signature === razorpay_signature) {
        res.status(200).send({ status: true });
      } else {
        res.status(200).send({ status: false });
      }
    } catch (error) {
      console.log('error', error);
      res.status(400).send({
        status: false,
        message: 'Invalid Signature',
      });
    }

    try {
    } catch (error) {
      console.log('error', error);
      res.status(400).send({
        status: false,
        message: 'Invalid Signature',
      });
    }
  },
);

// router.post(
//   "/v1/kitchens/razorpay-webhook",
//   async (req: Request, res: Response) => {
//     const { event, payload } = req.body;
//     try {
//       return runInTransaction(async (session: ClientSession) => {
//         const razorpaySignature = req.headers["x-razorpay-signature"];
//         const razorpayEventId = req.headers["x-razorpay-event-id"];

//         const isSignatureValid = validateWebhookSignature(
//           JSON.stringify(req.body),
//           razorpaySignature,
//           process.env.RAZORPAY_WEBHOOK_SECRET as string
//         );

//         if (isSignatureValid) {
//           if (event === "payment.captured") {
//             //create alert for payment captured
//             const saveAlert = new Alert({
//               businessId: payload.payment.entity.notes.businessId,
//               tableName: payload.payment.entity.notes.tableName,
//               tableId: payload.payment.entity.notes.tableId,
//               zoneId: payload.payment.entity.notes.zoneId,
//               staffId: payload.payment.entity.notes.staffId,
//               status: "PAID_BY_ONLINE",
//               time: payload.payment.entity.created_at,
//               message: `Paid ${payload.payment.entity.notes.total}`,
//               razorpayPaymentId: payload.payment.entity.id,
//               razorpayOrderId: payload.payment.entity.order_id,
//               razorpayAcquirerData: payload.payment.entity.acquirer_data,
//               mode: payload.payment.entity.method,
//               razorpayEventId: razorpayEventId,
//             });
//             await saveAlert.save();
//             const tableId = payload.payment.entity.notes.tableId;

//             const created: any = [];
//             // update all the KOTs to PAID
//             const kots = await Kot.find(
//               {
//                 tableId,
//                 status: "UNPAID",
//               },
//               { session }
//             );
//             for (const kotId of kots) {
//               const updatedKOT = await Kot.findByIdAndUpdate(
//                 kotId,
//                 { status: "PAID", cookedAt: Date.now() },
//                 { session }
//               );
//               if (updatedKOT?.isDeleted === false) {
//                 created.push(updatedKOT);
//               }
//             }

//             /**
//              * Represents an array of transformed kitchen items.
//              * Each item contains information about the dish, quantity, amount, category, portions, extras, and comments.
//              */
//             const items = created.map((kot: any) => {
//               const newobj: any = {
//                 name: kot.dish?.name,
//                 quantity: kot.dish?.qty || kot.dish?.quantity,
//                 amount: kot.dish?.price,
//                 category: kot.category,
//                 portions: kot.dish?.portions,
//                 extras: kot.dish?.extras,
//                 comments: "spicy",
//               };

//               let price = 0;
//               if (newobj.portions) {
//                 price =
//                   parseInt(newobj.portions.price) *
//                   (newobj.quantity || newobj.qty);
//               } else {
//                 price = newobj.amount || 0;
//               }

//               let extrasPrice = 0;
//               if (newobj.extras?.length > 0) {
//                 for (const extra of newobj.extras) {
//                   extrasPrice +=
//                     parseInt(extra.price || 0) * (extra.quantity || extra.qty);
//                 }
//               }

//               newobj.amount = price + extrasPrice || 0;

//               return newobj;
//             });
//             // delete hicode,claimedAmount, tips, discount from PaidKot (temp model)
//             await Tempmodel.deleteMany(
//               {
//                 $or: [
//                   { hiCode: payload.payment.entity.notes.hiCode },
//                   { tableId: tableId },
//                   { claimedTableId: tableId },
//                   { tipsTableId: tableId },
//                   { discountTableId: tableId },
//                 ],
//               },
//               { session }
//             );
//             // save current tableId hiCode for validate place order from userSide
//             await Tempmodel.create(
//               {
//                 hiCode: payload.payment.entity.notes.hiCode,
//               },
//               { session }
//             );

//             // save payment Object in payment collection
//             const paymentConfig = await Payment.create(
//               {
//                 businessId: payload.payment.entity.notes.businessId,
//                 items: items,
//                 subTotal: Number(payload.payment.entity.notes.subTotal),
//                 sgst: Number(payload.payment.entity.notes.cgst)?.toFixed(2),
//                 cgst: Number(payload.payment.entity.notes.cgst)?.toFixed(2),
//                 total: payload.payment.entity.notes.total,
//                 paymentMode: payload.payment.entity.method,
//                 paymentDate: payload.payment.entity.notes.dayAndDate,
//                 mode: payload.payment.entity.method,
//                 customerName: payload.payment.entity.notes.name,
//                 customerPhone: payload.payment.entity.notes.phone,
//                 discount: payload.payment.entity.notes.discount,
//                 zoneId: payload.payment.entity.notes.zoneId,
//                 tableId: payload.payment.entity.notes.tableId,
//                 time: payload.payment.entity.notes.indianTime,
//                 tableName: payload.payment.entity.notes.tableName,
//                 claimedAmount: payload.payment.entity.notes.claimedAmount,
//                 serviceCharge: payload.payment.entity.notes.serviceCharge,
//                 tips: payload.payment.entity.notes.tips,
//                 zoneType: "Dine In",
//                 razorpayPaymentId: payload.payment.entity.id,
//                 razorpayOrderId: payload.payment.entity.order_id,
//                 razorpayAcquirerData: payload.payment.entity.acquirer_data,
//                 razorpayEventId: razorpayEventId,
//               },
//               { session }
//             );

//             const updateConfig = {
//               status: "Empty",
//               activeUser: 0,
//               time: "",
//               totalDishQuantity: 0,
//               deliverdDish: 0,
//               role: null,
//               hiCode: "",
//               mergedBy: "",
//               reservedBy: "",
//             };
//             await Table.findByIdAndUpdate(
//               payload.payment.entity.notes.tableId,
//               updateConfig,
//               { session }
//             );

//             return res.status(200).send({ status: true, data: "payment " });
//           }
//           if (event === "payment.failed") {
//             // create alert for payment failed
//             const saveAlert = new Alert(
//               {
//                 businessId: payload.payment.entity.notes.businessId,
//                 tableName: payload.payment.entity.notes.tableName,
//                 tableId: payload.payment.entity.notes.tableId,
//                 zoneId: payload.payment.entity.notes.zoneId,
//                 staffId: payload.payment.entity.notes.staffId,
//                 status: "FAIL",
//                 time: payload.payment.entity.created_at,
//                 message: `FAIL ${payload.payment.entity.notes.total}`,
//                 razorpayPaymentId: payload.payment.entity.id || "",
//                 razorpayOrderId: payload.payment.entity.order_id || "",
//                 razorpayAcquirerData:
//                   payload.payment.entity.acquirer_data || "",
//                 mode: payload.payment.entity.method,
//                 razorpayEventId: razorpayEventId || "",
//               },
//               { session }
//             );
//             await saveAlert.save();

//             return res.status(200).send({ status: false, data: payload });
//           }
//         } else {
//           console.log("Invalid signature");
//           return res.status(200).send("Invalid signature");
//         }
//       });
//     } catch (error) {
//       console.log("error", error);
//       res.status(500).send(error);
//     }
//   }
// );

export { router as createKitchenRouter };
