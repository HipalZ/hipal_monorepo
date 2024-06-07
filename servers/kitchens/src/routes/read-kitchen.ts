import express, { Request, Response } from 'express';

import moment from 'moment';
import momentTimeZone from 'moment-timezone';

import { Alert, Category, Dish, Kitchen, Kot, Kotpassword, Table, Tempmodel, Userbill, Waiterkot, Zone } from '@hi/db-models';
import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
const router = express.Router();

router.get(
  '/v1/kitchens',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingKitchens = await Kitchen.find({
      businessId,
    });

    res.status(200).send(existingKitchens);
  },
);

router.get(
  '/v1/kitchens/:id/test',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    res.status(200).send('working');
  },
);

router.get(
  '/v1/kitchens/:id/removeKotByBusiness',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId, remove, waiterKot, removeOrders } = req.query;
    if (waiterKot) {
      const orders = await Waiterkot.find();
      return res.send(orders);
    }

    if (removeOrders) {
      const orders = await Waiterkot.deleteMany();
      return res.send(orders);
    }

    if (remove) {
      const deleted = await Kot.deleteMany({ businessId });
      return res.send(deleted);
    }
    const existingKot = await Kot.find({
      businessId,
    });

    res.status(200).send(existingKot);
  },
);

router.get(
  '/v1/kitchens/Get/UserBill/:id',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingUserBill = await Userbill.findById(id);

    res.status(200).send(existingUserBill);
  },
);

router.get(
  '/v1/kitchens/get/AllAlertByWaiter',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { businessId, isAlertOn, zoneId, staffId } = req.query;

      // const swiggyAlerts = await Alert.find({
      //   businessId: businessId,
      //   isAlertOn: true,
      //   tableName: { $in: ["swiggy", "zomato"] },
      // });

      let existingAlerts = await Alert.find({
        zoneId: zoneId,
        businessId,
        isAlertOn,
      }).sort({ _id: -1 });
      existingAlerts = [...existingAlerts];

      if (isAlertOn == 'false') {
        let PAGE_SIZE = 10;
        let pageNumber: any = req?.query?.pageNumber || 1;

        const skip: number = (pageNumber - 1) * PAGE_SIZE;

        let history = await Alert.find({
          isAlertOn: 'false',
          businessId,
          zoneId,
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE);

        return res.status(200).send(history);
      }

      // existingAlerts = existingAlerts.filter((ele) =>
      //   tablesArray.includes(ele?.tableId)
      // );

      res.status(200).send(existingAlerts);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/callWaiter',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId, waiterId } = req.query || {};

    const array = ['645e17f44451584e375a8a60'];

    if (array.includes(waiterId as string)) {
      res.status(200).send('waiter calling.......!');
    } else {
      return res.status(400).send('something wrong');
    }
  },
);

router.get(
  '/v1/kitchens/:id',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingKitchen = await Kitchen.findById(id);

    res.status(200).send(existingKitchen);
  },
);

router.get(
  '/v1/kitchens/Deletes/Kots',

  async (req: Request, res: Response) => {
    try {
      const { remove } = req.query || {};
      if (remove) {
        let deleted = await Kot.deleteMany();
        return res.send(deleted);
      }
      const allOrderHistory = await Kot.find();
      return allOrderHistory.length > 0
        ? res.status(200).send({ status: true, data: allOrderHistory })
        : res.status(404).send({ status: false, message: 'orderNotFound ....!' });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/cleanTempModels',

  async (req: Request, res: Response) => {
    try {
      const { remove, tipsTableId } = req.query || {};
      if (remove) {
        const deleted = await Tempmodel.deleteMany();
        return res.send(deleted);
      }
      if (tipsTableId) {
        const deleted = await Tempmodel.findOneAndDelete({ tipsTableId });
        return res.send(deleted);
      }
      const data = await Tempmodel.find();
      return res.send(data);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/kots',

  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { businessId, tableId, kitchenId, zoneId, startedAt } = req.query;

    const filters = {
      businessId,
      tableId,
      kitchenId,
      zoneId,
      startedAt,
    } as any;

    const query = {
      // status: "UNPAID",
    } as any;

    Object.keys(filters).forEach((key) => {
      if (filters[key] && key !== 'startedAt') {
        query[key] = filters[key];
      } else if (key === 'startedAt' && filters[key]) {
        query.$or = [
          { cookedAt: { $gt: filters.startedAt } },
          {
            $and: [{ startedAt: { $gt: filters.startedAt } }, { cookedAt: { $eq: -1 } }],
          },
        ];
      }
    });

    const existingKOTs = await Kot.find(query);

    res.status(200).send(existingKOTs);
  },
);

async function fetchTableData(tableId: string) {
  let tableData;

  try {
    tableData = await Table.findById(tableId);

    if (tableData?.isMerge && tableData?.hierarchy == 'CHILD') {
      tableId = tableData?.parentTableId;
    }
    return tableId as string;
  } catch (err: any) {
    console.log(err);
    return err;
  }
}

// router.get(
//   "/v1/kitchens/:id/temp-bill",
//   async (req: Request, res: Response) => {
//     try {
//       let {
//         tableId,
//         hasServiceCharge,
//         serviceChargePercentage,
//         gstPercentage,
//         userSide,
//       } = req.query as {
//         tableId: string;
//         hasServiceCharge: string;
//         serviceChargePercentage: string;
//         gstPercentage: string;
//         userSide: string;
//       };

//       return runInTransaction(async (session: ClientSession) => {
//         if (userSide) {
//           try {
//             tableId = await fetchTableData(tableId, session);
//           } catch (err: any) {
//             console.log(err);
//           }
//         }

//         // check if service charge is applied
//         const serviceChargeApply = await Tempmodel.findOne(
//           {
//             tableId,
//             serviceChargeApply: false,
//           },
//           { session }
//         );

//         let kots: any[] = [];

//         const query = {
//           status: "UNPAID",
//           tableId,
//         } as any;

//         const existingKOTs: any = await Kot.find(
//           query,
//           {
//             businessId: 0,
//             zoneId: 0,
//             staffId: 0,
//             startedAt: 0,
//             cookedAt: 0,
//             "dish.comments": 0,
//             category: 0,
//             status: 0,
//             dishStatus: 0,
//             dishType: 0,
//             priority: 0,
//             inventory: 0,
//             taxes: 0,
//             swiggyBillObj: 0,

//             match: 0,
//           },
//           { session }
//         );

//         let subTotal: any = 0;
//         let NOGSTTOTL = 0;
//         const merged: any = [];
//         for (let i = 0; i < existingKOTs.length; i++) {
//           let total;
//           const obj: any = existingKOTs[i];
//           kots.push(obj?.id || obj?._id);

//           if (obj?.isDeleted == false) {
//             if (obj?.isGst == false) {
//               NOGSTTOTL += obj?.dish?.price * obj?.dish?.qty;
//             }

//             let newPrice =
//               obj?.dish?.price * obj?.dish?.qty || obj?.dish?.quantity;
//             let extraPrice = 0;
//             let portionPrice = 0;
//             if (obj?.dish?.extras?.length > 0) {
//               obj?.dish?.extras.forEach((extra: any) => {
//                 extraPrice +=
//                   parseInt(extra?.price || 0) *
//                   parseInt(extra?.qty || extra?.quantity);
//               });
//             }

//             if (obj?.dish?.portions) {
//               portionPrice = parseInt(obj?.dish?.portions?.price);
//               total = portionPrice + extraPrice;
//             } else {
//               total = newPrice + extraPrice;
//             }

//             obj.dish.price = total;
//             subTotal += total;
//           }
//         }

//         existingKOTs.forEach((item: any) => {
//           if (item?.isDeleted == false) {
//             // Find if the dish already exists in the merged array with the same extras and portions
//             const existing = merged.find(
//               (mItem: any) =>
//                 mItem.dish.dishId === item.dish.dishId &&
//                 JSON.stringify(mItem.dish?.extras) ===
//                   JSON.stringify(item.dish?.extras) &&
//                 JSON.stringify(mItem.dish?.portions) ===
//                   JSON.stringify(item.dish?.portions)
//             );

//             if (existing) {
//               // Merge quantities and update the price
//               existing.dish.qty += item.dish.qty;
//               existing.dish.price += item.dish.price;
//             } else {
//               // Clone the item and add it to the merged array
//               merged.push(JSON.parse(JSON.stringify(item)));
//             }
//           }
//         });
//         let copySubtotal = subTotal;
//         let discount: Number = 0;
//         const tableInfo = await Tempmodel.findOne({ tableId }, { session });
//         if (tableInfo) {
//           if (tableInfo?.discountMode == "percent") {
//             let dis = Math.floor(
//               ((tableInfo.discountPercentage > 100
//                 ? 100
//                 : tableInfo.discountPercentage) *
//                 subTotal) /
//                 100
//             );
//             if (dis > subTotal) {
//               subTotal = dis;
//             }

//             subTotal -= dis;
//             discount = dis;
//           } else {
//             let dis = tableInfo.discountAmount;
//             if (dis > subTotal) {
//               subTotal = dis;
//             }
//             subTotal -= dis;
//             discount = dis;
//           }
//         }

//         let claimedAmount: Number = 0;
//         if (tableInfo) {
//           let coins =
//             tableInfo.claimedAmount > subTotal
//               ? subTotal
//               : tableInfo.claimedAmount;
//           if (coins > subTotal) {
//             subTotal = coins;
//           }
//           subTotal -= coins;
//           claimedAmount = coins;
//         }
//         if (discount > copySubtotal || discount == copySubtotal) {
//           claimedAmount = 0;
//         }
//         let totalTips = 0;

//         if (tableInfo) {
//           let tip = tableInfo.tipsAmount;
//           totalTips = tip;
//           if (totalTips < 0) {
//             totalTips = 0;
//           }
//         }
//         let serviceCharge = 0;
//         if (hasServiceCharge == "true" && !serviceChargeApply) {
//           let percentage = Number(serviceChargePercentage);
//           serviceCharge = (subTotal * percentage) / 100 || 0;
//         }
//         if (discount > copySubtotal || discount == copySubtotal) {
//           serviceCharge = 0;
//         }
//         if (subTotal < 0) {
//           subTotal = 0;
//         }
//         if (serviceCharge < 0) {
//           serviceCharge = 0;
//         }
//         let flag = false;
//         subTotal += serviceCharge - NOGSTTOTL;
//         if (subTotal < 0) {
//           flag = true;
//         }
//         let Total: number = 0;
//         let gst = Number(gstPercentage);
//         if (isNaN(gst)) {
//           gst = 0.05;
//         }
//         let newSubTotal = 0;
//         if (flag) {
//           newSubTotal = serviceCharge;
//         } else {
//           newSubTotal = subTotal;
//         }
//         let GST = newSubTotal * Number(gst);

//         let SGST = GST / 2;
//         let CGST = SGST;
//         if (SGST < 0 || SGST == 0) {
//           SGST = 0;
//           CGST = 0;
//         }
//         subTotal += SGST + CGST + totalTips;
//         Total = Math.round(subTotal + NOGSTTOTL);

//         let obj: any = {
//           subTotal: copySubtotal,
//           discount,
//           SGST: Number(SGST?.toFixed(2)),
//           CGST: Number(CGST?.toFixed(2)),
//           Total,
//           kots,
//           customerName: tableInfo?.customerName,
//           customerPhone: tableInfo?.customerPhone,
//           claimedAmount,
//           duesPersonId: tableInfo?.duesPersonId,
//           discountDescription: tableInfo?.discountDescription,
//         };

//         if (
//           hasServiceCharge == "true" &&
//           !serviceChargeApply &&
//           serviceCharge > 0
//         ) {
//           obj["serviceCharge"] = Number(serviceCharge?.toFixed(2));
//         }

//         if (totalTips > 0) {
//           obj["tips"] = totalTips;
//         }

//         if (tableInfo) {
//           obj["discountGivenBy"] = tableInfo?.discountGivenBy;
//           obj["discountRemovedBy"] = tableInfo?.discountRemovedBy;
//           obj["serviceChargeRemovedBy"] = tableInfo?.serviceChargeRemovedBy;
//           obj["serviceChargeAddedBy"] = tableInfo?.serviceChargeAddedBy;
//           obj["coinsGivenBy"] = tableInfo?.coinsGivenBy;
//           obj["tipsGivenBy"] = tableInfo?.tipsGivenBy;
//         }

//         existingKOTs.push(obj);

//         merged.push(obj);
//         if (merged?.length == 1) {
//           return res.status(200).send([]);
//         }
//         return res.status(200).send(merged);
//       });
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

router.get('/v1/kitchens/:id/temp-bill', async (req: Request, res: Response) => {
  try {
    let { tableId, hasServiceCharge, serviceChargePercentage, gstPercentage, userSide } = req.query as {
      tableId: string;
      hasServiceCharge: string;
      serviceChargePercentage: string;
      gstPercentage: string;
      userSide: string;
    };

    await runInTransaction(async (session: ClientSession) => {
      if (userSide) {
        try {
          tableId = await fetchTableData(tableId);
        } catch (err: any) {
          console.log(err);
        }
      }

      // check if service charge is applied
      const serviceChargeApply = await Tempmodel.findOne({
        tableId,
        serviceChargeApply: false,
      });

      let kots: any[] = [];

      const query = {
        status: 'UNPAID',
        tableId,
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
        kots.push(obj?.id || obj?._id);

        if (obj?.isDeleted == false) {
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

          if (obj?.dish?.portions && obj?.dish?.portions?.price) {
            portionPrice = parseInt(obj?.dish?.portions?.price);
            total = portionPrice + extraPrice;
          } else {
            total = newPrice + extraPrice;
          }

          obj.dish.price = total;
          subTotal += total;
        }
      }

      existingKOTs.forEach((item: any) => {
        if (item?.isDeleted == false) {
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
      if (hasServiceCharge == 'true' && !serviceChargeApply) {
        let percentage = Number(serviceChargePercentage);
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
      let gst = Number(gstPercentage);
      if (isNaN(gst)) {
        gst = 0.05;
      }
      let newSubTotal = 0;
      if (flag) {
        newSubTotal = serviceCharge;
      } else {
        newSubTotal = subTotal;
      }
      let GST = newSubTotal * Number(gst);

      let SGST = GST / 2;
      let CGST = SGST;
      if (SGST < 0 || SGST == 0) {
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
        customerName: tableInfo?.customerName,
        customerPhone: tableInfo?.customerPhone,
        claimedAmount,
        duesPersonId: tableInfo?.duesPersonId,
        discountDescription: tableInfo?.discountDescription,
      };

      if (hasServiceCharge == 'true' && !serviceChargeApply && serviceCharge > 0) {
        obj['serviceCharge'] = Number(serviceCharge?.toFixed(2));
      }

      if (totalTips > 0) {
        obj['tips'] = totalTips;
      }

      if (tableInfo) {
        obj['discountGivenBy'] = tableInfo?.discountGivenBy;
        obj['discountRemovedBy'] = tableInfo?.discountRemovedBy;
        obj['serviceChargeRemovedBy'] = tableInfo?.serviceChargeRemovedBy;
        obj['serviceChargeAddedBy'] = tableInfo?.serviceChargeAddedBy;
        obj['coinsGivenBy'] = tableInfo?.coinsGivenBy;
        obj['tipsGivenBy'] = tableInfo?.tipsGivenBy;
      }

      existingKOTs.push(obj);

      merged.push(obj);
      if (merged?.length == 1) {
        res.status(200).send([]);
      } else {
        res.status(200).send(merged);
      }
    });
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.get('/v1/kitchens/kots/allKot', async (req: Request, res: Response) => {
  try {
    let { businessId, tableId, zoneId, userSide } = req.query;

    await runInTransaction(async (session: ClientSession) => {
      if (userSide) {
        let tableInfo;

        try {
          tableInfo = await Table.findById(tableId, null, { session });

          if (tableInfo?.isMerge && tableInfo?.hierarchy == 'CHILD') {
            (tableId = tableInfo?.parentTableId), (zoneId = tableInfo?.parentZoneId);
          }
        } catch (err: any) {
          console.log(err);
          res.status(400).send('Table not found');
          return;
        }
      }

      const query = {
        status: 'UNPAID',
        businessId,
        tableId,
        zoneId,
      } as any;

      const existingKOTs = await Kot.find(
        query,
        {
          staffId: 0,
          startedAt: 0,
          cookedAt: 0,
          'dish.comments': 0,
          category: 0,

          avgTime: 0,
          taxes: 0,
          swiggyBillObj: 0,
          isGst: 0,
          inventory: 0,
        },

        { session },
      );

      const sortedOrders = existingKOTs.sort((a: any, b: any) => a.kotTime - b.kotTime);

      const groupedOrders = sortedOrders.reduce((acc: any, order: any) => {
        if (acc.length === 0 || acc[acc.length - 1][0].kotTime !== order.kotTime) {
          acc.push([order]);
        } else {
          acc[acc.length - 1].push(order);
        }
        return acc;
      }, []);

      res.status(200).send(groupedOrders);
    });
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.get(
  '/v1/kitchens/getAllKotByWaiter/all',

  async (req: Request, res: Response) => {
    try {
      const { businessId, zoneId, staffId } = req.query;

      const filters = {
        businessId,
      } as any;

      const query = {
        status: 'UNPAID',
        zoneId: zoneId,
      } as any;

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          query[key] = filters[key];
        }
      });

      let existingKOTs = await Kot.find(query, {
        staffId: 0,
        startedAt: 0,
        cookedAt: 0,
        'dish.comments': 0,
        category: 0,
        kotDate: 0,
        avgTime: 0,
        taxes: 0,
        swiggyBillObj: 0,
        isGst: 0,
        businessId: 0,
        zoneId: 0,
        tableId: 0,
        status: 0,
        reasonForDelete: 0,
        kitchenId: 0,
        customerPhone: 0,
        inventory: 0,
      });

      const sortedOrders = existingKOTs.sort((a: any, b: any) => a.kotTime - b.kotTime);

      const groupedOrders = sortedOrders.reduce((acc: any, order: any) => {
        if (acc.length === 0 || acc[acc.length - 1][0].kotTime !== order.kotTime) {
          acc.push([order]);
        } else {
          acc[acc.length - 1].push(order);
        }
        return acc;
      }, []);

      res.status(200).send(groupedOrders);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get('/v1/kitchens/all/WaiterOrder', async (req: Request, res: Response) => {
  try {
    const { businessId, zoneId, staffId } = req.query;
    await runInTransaction(async (session: ClientSession) => {
      let existingTables = await Table.find({ businessId });

      let zone = await Zone.findById(zoneId);

      let tables = [...existingTables];

      existingTables = existingTables.filter((ele: any) => ele?.staff.includes(staffId));

      if (existingTables?.length == 0) {
        if (zone?.staff?.includes(staffId as string)) {
          res.status(200).send(tables);
          return;
        }
      }

      let tablesArray: any = [];
      existingTables.forEach((ele: any) => tablesArray.push(ele.id));

      let existingKitchens = await Waiterkot.find({
        businessId,
        zoneId,
        isAccept: false,
        isReject: false,
      });

      existingKitchens = existingKitchens.filter((ele: any) => tablesArray.includes(ele?.tableId));

      res.status(200).send(existingKitchens);
    });
  } catch (err: any) {
    return res.status(500).send({ status: false, message: err.message });
  }
});

router.get(
  '/v1/kitchens/All/ByChef',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId, chefId } = req.query;
    const existingKitchens = await Kitchen.find({
      businessId,
    });

    let filterByChefId = existingKitchens.filter((kitchen: any) => kitchen.staff.includes(chefId));

    if (filterByChefId?.length == 0) {
      return res.status(404).send('Not found');
    }

    res.status(200).send(filterByChefId);
  },
);

router.get('/v1/kitchens/Allkots/ByKitchens', async (req: Request, res: Response) => {
  const { kitchenId, items } = req.query;

  if (items) {
    let kots = await Kot.find({
      kitchenId,
      status: 'UNPAID',
      dishStatus: 'cooking',
    }).select('status dish dishStatus dishType priority isDeleted kotTime businessId customerName customerPhone tableName category id');
    const sortedOrders = kots.sort((a: any, b: any) => a.kotTime - b.kotTime);
    const groupedDishes = sortedOrders.reduce((acc: any, obj: any) => {
      const dishName = obj.dish.name;
      if (!acc[dishName]) {
        acc[dishName] = {
          dishName: dishName,
          items: [obj],
        };
      } else {
        acc[dishName].items.push(obj);
      }
      return acc;
    }, {});

    const resultArray = Object.values(groupedDishes);

    return res.send(resultArray);
  }

  let kots = await Kot.find({ kitchenId, status: 'UNPAID' }).select(
    'status dish dishStatus dishType priority isDeleted kotTime businessId customerName customerPhone tableName category id',
  );
  let cookingDishes = 0;
  for (let i = 0; i < kots.length; i++) {
    if (kots[i]?.dishStatus == 'cooking') {
      cookingDishes += 1;
    }
  }

  const sortedOrders = kots.sort((a: any, b: any) => a.kotTime - b.kotTime);

  const groupedOrders = sortedOrders.reduce((acc: any, order: any) => {
    if (acc.length === 0 || acc[acc.length - 1][0].kotTime !== order.kotTime) {
      acc.push([order]);
    } else {
      acc[acc.length - 1].push(order);
    }
    return acc;
  }, []);

  let newArray = [];
  for (let i = 0; i < groupedOrders.length; i++) {
    let subArray = groupedOrders[i];
    let obj: any = {};
    subArray.sort((a: any, b: any) => a.category?.localeCompare(b.category));

    const result = subArray.reduce((acc: any, curr: any) => {
      const categoryIndex = acc.findIndex((item: any) => item.category === curr.category);
      if (categoryIndex === -1) {
        acc.push({ category: curr.category, kots: [curr] });
      } else {
        acc[categoryIndex].kots.push(curr);
      }
      return acc;
    }, []);

    let cooked = 0;
    let deletedDishes = 0;
    for (let j = 0; j < subArray.length; j++) {
      if (subArray[j]?.dishStatus != 'cooking') {
        cooked += 1;
      }
      if (subArray[j]?.isDeleted == true) {
        deletedDishes += 1;
      }
      obj.businessId = subArray[j]?.businessId;
      obj.kitchenId = subArray[j]?.kitchenId;
      obj.time = subArray[j]?.kotTime;
      obj.customerName = subArray[j]?.customerName;
      obj.customerPhone = subArray[j]?.customerPhone;
      obj.tableName = subArray[j]?.tableName;
      obj.kots = result;
    }
    obj.totalKots = subArray?.length;
    obj.cooked = cooked;
    obj.uuid = subArray?.[0]?.id;
    obj.deletedDishes = deletedDishes;
    newArray.push(obj);
  }
  if (newArray.length == 0) {
    return res.status(400).send('Kots not found');
  }
  newArray.sort((a: any, b: any) => {
    let aHasPriority = a.kots.some((category: any) => category.kots.some((kot: any) => kot.priority === true));
    let bHasPriority = b.kots.some((category: any) => category.kots.some((kot: any) => kot.priority === true));

    if (aHasPriority && !bHasPriority) {
      return -1;
    } else if (!aHasPriority && bHasPriority) {
      return 1;
    } else {
      let aHasCooked = a.kots.some((category: any) => category.kots.some((kot: any) => kot.dishStatus === 'cooked'));
      let bHasCooked = b.kots.some((category: any) => category.kots.some((kot: any) => kot.dishStatus === 'cooked'));

      if (aHasCooked && bHasCooked) {
        return 0; // retain old position
      } else {
        return 0; // retain old position if none or both of them have cooked status
      }
    }
  });
  let newObject: any = {};
  newObject.allKots = groupedOrders.length;
  newObject.cookingDishes = cookingDishes;
  newArray.push(newObject);

  return res.send(newArray);
});

router.get(
  '/v1/kitchens/All/Kot&Dishes',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    let { businessId, date } = req.query;

    if (!date) {
      let currentTime = Date.now();
      let momentTime = moment(currentTime);

      let indianTime = momentTime.clone().utcOffset('+05:30');
      date = indianTime.format('DD-MM-YYYY');
    }

    let kots = await Kot.find({ businessId, status: 'PAID' });

    const formatDate = (inputDate: any) => {
      const parts = inputDate.split('-');
      const day = parts[0];
      const monthNames = [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[parseInt(parts[1])];
      const year = parts[2].slice(2, 4); // Take last two digits of year

      let ordinal = 'th';
      if (day === '01' || day === '21' || day === '31') ordinal = 'st';
      else if (day === '02' || day === '22') ordinal = 'nd';
      else if (day === '03' || day === '23') ordinal = 'rd';

      return `${parseInt(day)}${ordinal} ${month} ${year}`;
    };

    const providedDate = date;
    const formattedDate = formatDate(providedDate);
    const filteredData = kots.filter((item: any) => item.date === formattedDate);
    let dishes = filteredData?.length || 0;

    const sortedOrders = filteredData.sort((a: any, b: any) => a.kotTime - b.kotTime);

    const groupedOrders = sortedOrders.reduce((acc: any, order: any) => {
      if (acc.length === 0 || acc[acc.length - 1][0].kotTime !== order.kotTime) {
        acc.push([order]);
      } else {
        acc[acc.length - 1].push(order);
      }
      return acc;
    }, []);

    let kotLength = groupedOrders?.length || 0;

    res.send({ kots: kotLength, dishes });
  },
);

router.get('/v1/kitchens/:id/Category&Dishes', async (req: Request, res: Response) => {
  const { businessId, from, to } = req.query;
  const currentDate = momentTimeZone.tz('Asia/Kolkata');
  const previousDate = currentDate.subtract(1, 'days');
  const preDate = previousDate.format('YYYY-MM-DD');
  const CommonDishes = (kots: any) => {
    let categoryCount: any = {};
    let dishCount: any = {};

    kots.forEach((item: any) => {
      let category = item.category;
      let dish = item.dish.name;

      categoryCount[category] = (categoryCount[category] || 0) + 1;
      dishCount[dish] = (dishCount[dish] || 0) + 1;
    });

    let mostCommonCategory = Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b));
    let mostCommonDish = Object.keys(dishCount).reduce((a, b) => (dishCount[a] > dishCount[b] ? a : b));

    return { category: mostCommonCategory, dish: mostCommonDish };
  };
  if (!from && !to) {
    const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
    let kots = await Kot.find({
      businessId,

      kotDate: { $regex: `^${dayAndDate}` },
    });
    if (kots?.length == 0) {
      kots = await Kot.find({
        businessId,
        kotDate: { $regex: `^${preDate}` },
      });
    }
    if (kots?.length == 0) {
      return res.send([]);
    }
    const result = CommonDishes(kots);

    return res.send(result);
  }
  if (from && to) {
    if (from == to) {
      const kots = await Kot.find({
        businessId,

        kotDate: {
          $regex: `^${String(from).split('-').reverse().join('-')}`,
        },
      });
      if (kots?.length == 0) {
        return res.send([]);
      }

      let result = CommonDishes(kots);

      return res.status(200).send(result);
    }
    let fromDate = new Date(String(from).split('-').reverse().join('-'));

    fromDate.setUTCHours(0, 0, 0, 0);

    let toDate = new Date(String(to).split('-').reverse().join('-'));

    toDate.setUTCHours(23, 59, 59, 999);

    if (fromDate > toDate) {
      return res.status(400).send('From date cannot be greater than to date.');
    }

    // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
    const formattedFromDate = fromDate.toISOString().split('T')[0];
    const formattedToDate = toDate.toISOString().split('T')[0];

    const kots = await Kot.find({
      businessId,
      kotDate: {
        $gte: formattedFromDate,
        $lte: formattedToDate,
      },
    });
    if (kots?.length == 0) {
      return res.send([]);
    }

    const result = CommonDishes(kots);

    return res.send(result);
  }
});

const CategoryAnalytics = (analytics: any, categories: any) => {
  // Create mappings for quick access
  const analyticsMap = analytics.reduce((acc: any, curr: any) => {
    acc[curr.name] = curr;
    return acc;
  }, {});

  const parentCategories = categories
    .filter((cat: any) => cat.hierarchy === 'PARENT')
    .reduce((acc: any, curr: any) => {
      acc[curr.id] = {
        parentCategoryName: curr.name,
        ...analyticsMap[curr.name],
        childs: [],
      };
      return acc;
    }, {});

  categories
    .filter((cat: any) => cat.hierarchy === 'CHILD')
    .forEach((child: any) => {
      const parent = parentCategories[child.parentCategoryId];
      if (parent) {
        parent.childs.push({
          childCategoryName: child.name,
          ...analyticsMap[child.name],
        });
      }
    });

  // Convert the dictionary to an array for the final output
  const optimizedStructure = Object.values(parentCategories);
  return optimizedStructure;
};

const preAnalyticsCategory = (kots: any, category: any) => {
  let total_items = kots.length;

  let category_counts: any = {};
  kots.forEach((item: any) => {
    let category_name = item.category;

    if (category_name in category_counts) {
      category_counts[category_name]++;
    } else {
      category_counts[category_name] = 1;
    }
  });

  // Calculate percentage for each category
  let category_percentages: any = {};
  for (let category in category_counts) {
    category_percentages[category] = (category_counts[category] / total_items) * 100;
  }

  // Build the ans array
  let ans = [];
  for (let category in category_percentages) {
    let obj: any = {};
    (obj['name'] = category), (obj['percentage'] = Math.round(category_percentages[category] * 100) / 100); // Round to two decimal places
    obj['orders'] = category_counts[category] || 0;
    ans.push(obj);
  }
  for (let cate in category) {
    let found = ans.some((item) => item.name === cate);
    if (!found) {
      ans.push({
        name: cate,
        percentage: 0,
        orders: 0,
      });
    }
  }
  ans?.sort((a, b) => b?.percentage - a?.percentage);
  return ans;
};
router.get('/v1/kitchens/:id/Category', async (req: Request, res: Response) => {
  const { businessId, from, to } = req.query;

  let categories;
  try {
    await runInTransaction(async (session: ClientSession) => {
      categories = await Category.find(
        {
          businessId,
        },
        null,
        { session },
      ).select('name hierarchy  parentCategory  parentCategoryId ');

      let category: any = {};
      categories.forEach((element: any) => {
        if (!category[element?.name]) {
          category[element?.name] = element?.name;
        }
      });
      if (!from && !to) {
        const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
        const previousDate = momentTimeZone.tz('Asia/Kolkata').subtract(1, 'days').format('YYYY-MM-DD');

        let kots = await Kot.find(
          {
            businessId,
            kotDate: { $regex: `^${dayAndDate}` },
          },
          null,
          { session },
        ).select('category');
        let preKots = await Kot.find(
          {
            businessId,
            kotDate: { $regex: `^${previousDate}` },
          },
          null,
          { session },
        ).select('category');

        let ans = preAnalyticsCategory(kots, category);

        let result = preAnalyticsCategory(preKots, category);

        const data = {
          currentDay: ans,

          previousDate: result,
        };

        // Convert previousDate into a dictionary for faster lookup
        const prevDateDict: any = {};
        data.previousDate.forEach((item) => {
          prevDateDict[item.name] = item.percentage;
        });

        // Loop over currentDay and compute the difference
        data.currentDay.forEach((item) => {
          if (prevDateDict.hasOwnProperty(item.name)) {
            // Difference in percentage
            let difference = item.percentage - prevDateDict[item.name];

            // Assign it to previousPercentage field
            item.previousPercentage = difference;
          } else {
            // If the item wasn't there in the previousDate data, then its previous percentage is 0
            item.previousPercentage = -item.percentage;
          }
        });
        let optimizedStructure = CategoryAnalytics(data.currentDay, categories);

        res.send(optimizedStructure);
      }
      if (from && to) {
        if (from == to) {
          const kots = await Kot.find(
            {
              businessId,

              kotDate: {
                $regex: `^${String(from).split('-').reverse().join('-')}`,
              },
            },
            null,
            { session },
          ).select('category');

          let ans = preAnalyticsCategory(kots, category);
          let optimizedStructure = CategoryAnalytics(ans, categories);

          res.send(optimizedStructure);
        }

        let fromDate = new Date(String(from).split('-').reverse().join('-'));

        fromDate.setUTCHours(0, 0, 0, 0);

        let toDate = new Date(String(to).split('-').reverse().join('-'));

        toDate.setUTCHours(23, 59, 59, 999);

        if (fromDate > toDate) {
          res.status(400).send('From date cannot be greater than to date.');
          return;
        }

        // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
        const formattedFromDate = fromDate.toISOString().split('T')[0];
        const formattedToDate = toDate.toISOString().split('T')[0];

        const kots = await Kot.find(
          {
            businessId,
            kotDate: {
              $gte: formattedFromDate,
              $lte: formattedToDate,
            },
          },
          null,
          { session },
        ).select('category');
        let ans = preAnalyticsCategory(kots, category);
        let optimizedStructure = CategoryAnalytics(ans, categories);

        res.send(optimizedStructure);
      }
    });
  } catch (err: any) {
    console.log('err', err);
  }
});

const dishesAnalytics = (analytics: any, kot: any) => {
  const analyticsMap = analytics.reduce((map: any, item: any) => {
    map[item.name] = item;
    return map;
  }, {});

  // Aggregate kot items by category
  const categoryMap = kot.reduce((acc: any, item: any) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = {
        categoryName: category,
        percentage: 0, // To be calculated
        orders: 0, // This will now count unique dishes
        dishes: [],
      };
    }

    // Check if the dish has already been added to avoid duplicates
    const dishAlreadyAdded = acc[category].dishes.some((dish: any) => dish.name === item.dish.name);
    if (!dishAlreadyAdded) {
      // Add dish to category, including analytics data
      const dishAnalytics = analyticsMap[item.dish.name] || {
        percentage: 0,
        orders: 0,
      };
      acc[category].dishes.push({
        name: item.dish.name,
        percentage: dishAnalytics.percentage,
        orders: dishAnalytics.orders,
      });

      // Increment dish count for unique dishes
      acc[category].orders += 1;
    }

    return acc;
  }, {});

  // Total count of unique dishes across all categories
  const totalDishes: any = Object.values(categoryMap).reduce((total, category: any) => total + category.orders, 0);

  // Calculate percentage based on the comparison of category orders
  Object.keys(categoryMap).forEach((category) => {
    const categoryOrders = categoryMap[category].orders;
    categoryMap[category].percentage = ((categoryOrders / totalDishes) * 100).toFixed(2);
  });

  let ans = Object.values(categoryMap);
  return ans;
};

const preAnalytics = (kots: any, dish: any) => {
  let total_items = kots.length;

  // Count number of items per category
  let dish_counts: any = {};
  kots.forEach((item: any) => {
    let dish_name = item.dish.name;
    if (dish_name in dish_counts) {
      dish_counts[dish_name]++;
    } else {
      dish_counts[dish_name] = 1;
    }
  });

  // Calculate percentage for each category
  let dish_percentages: any = {};
  for (let dish in dish_counts) {
    dish_percentages[dish] = (dish_counts[dish] / total_items) * 100;
  }

  // Build the ans array
  let ans = [];
  for (let dish in dish_percentages) {
    let obj: any = {};
    (obj['name'] = dish), (obj['percentage'] = Math.round(dish_percentages[dish] * 100) / 100); // Round to two decimal places
    obj['orders'] = dish_counts[dish] || 0;
    ans.push(obj);
  }
  for (let di in dish) {
    let found = ans.some((item) => item.name === di);
    if (!found) {
      ans.push({
        name: di,
        percentage: 0,
        orders: 0,
      });
    }
  }
  ans?.sort((a, b) => b?.percentage - a?.percentage);

  return ans;
};
router.get('/v1/kitchens/:id/Dishes', async (req: Request, res: Response) => {
  const { businessId, from, to } = req.query;

  let dishes;
  try {
    await runInTransaction(async (session: ClientSession) => {
      dishes = await Dish.find(
        {
          businessId,
        },
        null,
        { session },
      ).select('name');

      let dish: any = {};
      dishes.forEach((element: any) => {
        if (!dish[element?.name]) {
          dish[element?.name] = element?.name;
        }
      });
      if (!from && !to) {
        const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
        const previousDate = momentTimeZone.tz('Asia/Kolkata').subtract(1, 'days').format('YYYY-MM-DD');

        let kots = await Kot.find(
          {
            businessId,
            kotDate: { $regex: `^${dayAndDate}` },
          },
          null,
          { session },
        ).select('dish  category');

        let preKots = await Kot.find(
          {
            businessId,
            kotDate: { $regex: `^${previousDate}` },
          },
          null,
          { session },
        ).select('dish  category');

        let ans = preAnalytics(kots, dish);

        let result = preAnalytics(preKots, dish);

        const data = {
          currentDay: ans,
          previousDate: result,
        };

        // Convert previousDate into a dictionary for faster lookup
        const prevDateDict: any = {};
        data.previousDate.forEach((item) => {
          prevDateDict[item.name] = item.percentage;
        });

        // Loop over currentDay and compute the difference
        data.currentDay.forEach((item) => {
          if (prevDateDict.hasOwnProperty(item.name)) {
            // Difference in percentage
            let difference = item.percentage - prevDateDict[item.name];

            // Assign it to previousPercentage field
            item.previousPercentage = difference;
          } else {
            // If the item wasn't there in the previousDate data, then its previous percentage is 0
            item.previousPercentage = -item.percentage;
          }
        });

        let optimizedStructure = dishesAnalytics(data.currentDay, kots);

        res.send(optimizedStructure);
      }
      if (from && to) {
        if (from == to) {
          const kots = await Kot.find(
            {
              businessId,

              kotDate: {
                $regex: `^${String(from).split('-').reverse().join('-')}`,
              },
            },
            null,
            { session },
          ).select('dish category');

          let ans = preAnalytics(kots, dish);
          let optimizedStructure = dishesAnalytics(ans, kots);

          res.send(optimizedStructure);
        }

        let fromDate = new Date(String(from).split('-').reverse().join('-'));

        fromDate.setUTCHours(0, 0, 0, 0);

        let toDate = new Date(String(to).split('-').reverse().join('-'));

        toDate.setUTCHours(23, 59, 59, 999);

        if (fromDate > toDate) {
          res.status(400).send('From date cannot be greater than to date.');
          return;
        }

        // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
        const formattedFromDate = fromDate.toISOString().split('T')[0];
        const formattedToDate = toDate.toISOString().split('T')[0];

        const kots = await Kot.find(
          {
            businessId,
            kotDate: {
              $gte: formattedFromDate,
              $lte: formattedToDate,
            },
          },
          null,
          { session },
        ).select('dish category');
        let ans = preAnalytics(kots, dish);
        let optimizedStructure = dishesAnalytics(ans, kots);

        res.send(optimizedStructure);
      }
    });
  } catch (err: any) {
    console.log('err', err);
  }
});

router.get('/v1/kitchens/:id/history', async (req: Request, res: Response) => {
  const { businessId, kitchenId } = req.query;
  const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
  let kots = await Kot.find({
    businessId,
    kitchenId,
    kotDate: { $regex: `^${dayAndDate}` },
    status: 'PAID',
  });
  let groupByKotTime: any = {};

  kots.forEach((item) => {
    if (!groupByKotTime[item.kotTime]) {
      groupByKotTime[item.kotTime] = {
        kotTime: item.kotTime,
        tableName: item.tableName,
        customerName: item.customerName,
        kots: [],
      };
    }
    groupByKotTime[item.kotTime].kots.push(item);
  });

  const result = Object.values(groupByKotTime);

  res.status(200).send(result);
});

router.get(
  '/v1/kitchens/:id/getSingleKot',

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingKot = await Kot.findById(id);

    res.status(200).send(existingKot);
  },
);

router.get('/v1/kitchens/:id/kotPassword', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.query;
    const exitingKotPass = await Kotpassword.find({ businessId });

    return res.status(201).send(exitingKotPass);
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
});

router.get(
  '/v1/kitchens/:id/ActiveUser',

  async (req: Request, res: Response) => {
    try {
      const { tableId, zoneId, businessId } = req.query || {};

      const activeUsers = await Kot.find({
        tableId,
        zoneId,
        businessId,
        status: 'UNPAID',
      });
      let obj: Record<string, any> = {};
      let arr: any[] = [];

      activeUsers.forEach((element: any) => {
        if (!obj[element?.customerPhone]) {
          obj[element?.customerPhone] = true;

          arr.push({
            customerPhone: element.customerPhone,
            customerName: element.customerName,
          });
        }
      });

      return res.send(arr);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/orderBySwiggy',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { businessId, zoneId } = req.query;

      const filters = {
        businessId,
      } as any;

      const query = {
        status: 'UNPAID',
        zoneId: zoneId,
        isDeleted: false,
      } as any;

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          query[key] = filters[key];
        }
      });

      let existingKOTs = await Kot.find(query);

      let groupByKotTime: any = {};

      existingKOTs.forEach((item: any) => {
        if (!groupByKotTime[item.orderId]) {
          groupByKotTime[item.orderId] = {
            kotTime: item?.kotTime,
            orderId: item?.orderId,
            dishStatus: item?.dishStatus,
            kots: [],
          };
        }
        groupByKotTime[item.orderId].kots.push(item);
      });

      const result = Object.values(groupByKotTime);
      for (let i = 0; i < result?.length; i++) {
        let cookedDishes = 0;
        let totalDishes = 0;
        let flag = false; // Move the flag definition here
        let kot: any = result?.[i];

        kot?.kots?.forEach((element: any) => {
          if (element?.dishStatus != 'cooking') {
            cookedDishes += 1;
          }
          if (element?.match == true) {
            flag = true;
            kot['isMatch'] = true;
          } else {
            kot['isMatch'] = false;
          }
        });
        totalDishes = kot?.kots?.length;
        kot['totalDishes'] = totalDishes;
        kot['cookedDishes'] = cookedDishes;
      }

      res.status(200).send(result);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

// router.get(
//   "/v1/kitchens/:id/swiggyBill",
//   // currentUser,
//   // requireAuthorization([
//   //   ClientRoles.RESTAURANT_OWNER,
//   //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
//   //   ClientRoles.RESTAURANT_MANAGER,
//   // ]),
//   async (req: Request, res: Response) => {
//     try {
//       const currentTime = Date.now();
//       const momentTime = moment(currentTime);
//       const indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");

//       let {
//         businessId,
//         zoneId,
//         orderId,
//         discount,
//         mode,
//         userBill,
//         commission,
//         customerName,
//         duesPersonId,
//         customerPhone,
//         claimedAmount,
//         discountDescription,
//       } = req.query;
//       if (mode != "dues") {
//         duesPersonId = "";
//       }

//       const filters = {
//         businessId,
//         orderId,
//       } as any;
//       const config = {
//         method: "get",
//         url: `${process.env.URL}/v1/businesses/get/Single/${businessId}`,
//       };
//       let businessData;
//       let kots: any[] = [];

//       try {
//         let response = await axios(config);
//         businessData = response.data;
//       } catch (err: any) {
//         return res.status(400).send({
//           status: false,
//           message: "businessId enter invalid ",
//         });
//       }

//       const query = {
//         status: "UNPAID",
//         isDeleted: false,
//       } as any;

//       Object.keys(filters).forEach((key) => {
//         if (filters[key]) {
//           query[key] = filters[key];
//         }
//       });

//       const existingKOTs = await Kot.find(query).lean();

//       const forDeleteKots = await Kot.find({
//         businessId,
//         status: "UNPAID",
//         orderId,
//       });

//       forDeleteKots.forEach((ele: any) => kots.push(ele._id));

//       let flag = false;
//       for (let i = 0; i < existingKOTs.length; i++) {
//         let total;
//         const obj: any = existingKOTs[i];
//         if (obj?.swiggyBillObj) {
//           flag = true;
//         }
//         let newPrice = obj?.dish?.price * obj?.dish?.qty || obj?.dish?.quantity;
//         let extraPrice = 0;
//         let portionPrice = 0;
//         if (obj?.dish?.extras?.length > 0) {
//           obj?.dish?.extras.forEach((extra: any) => {
//             extraPrice +=
//               parseInt(extra?.price || 0) *
//               parseInt(extra?.qty || extra?.quantity);
//           });
//         }

//         if (obj?.dish?.portions) {
//           portionPrice = parseInt(obj?.dish?.portions?.price);
//           total = portionPrice + extraPrice;
//         } else {
//           total = newPrice + extraPrice;
//         }

//         obj.dish.price = total;
//       }

//       let subTotal: any = 0;

//       existingKOTs.forEach((ele: any) => (subTotal += ele.dish.price));

//       let copySubtotal = subTotal;
//       if (typeof discount === "string") {
//         let dis = parseFloat(discount);
//         if (dis > subTotal) {
//           subTotal = dis;
//         }

//         subTotal -= dis;
//       }
//       if (typeof claimedAmount === "string") {
//         let claimed = parseFloat(claimedAmount);
//         if (claimed > subTotal) {
//           claimedAmount = subTotal;
//         }

//         subTotal -= claimed;
//       }

//       if (subTotal < 0) {
//         subTotal = 0;
//       }

//       let Total: number = 0;

//       Total = Math.round(subTotal);
//       if (flag) {
//         let billObject = existingKOTs[0]?.swiggyBillObj;
//         Total = billObject?.totalPrice || 0;
//         if (billObject?.discount && billObject?.discount > 0) {
//           Total = Total - billObject?.discount || 0;
//         }
//         let obj: any = {
//           subTotal: billObject?.subTotal,
//           discount: Math.abs(billObject?.discount || 0),
//           packingCharges: billObject?.packingCharges,
//           RxPayableGST: billObject?.RxPayableGST,
//           swiggyPayableGST: billObject?.swiggyPayableGST,

//           Total,
//           kots,
//           mode,
//           commission,
//           customerName,
//           customerPhone,
//           claimedAmount,
//           duesPersonId,
//           discountDescription,
//         };
//         existingKOTs.push(businessData);
//         existingKOTs.push(obj);
//       } else {
//         let obj: any = {
//           subTotal: copySubtotal,
//           discount,
//           Total,
//           kots,
//           mode,
//           commission,
//           customerName,
//           customerPhone,
//           claimedAmount,
//           duesPersonId,
//           discountDescription,
//         };
//         existingKOTs.push(businessData);
//         existingKOTs.push(obj);
//       }

//       if (existingKOTs?.length == 2) {
//         return res.status(200).send([]);
//       }

//       if (userBill) {
//         let obj = {
//           businessId,
//           orderId,
//           tableId: orderId,
//           time: indianTime,
//           date: moment().format("Do MMM YY"),
//           bill: existingKOTs,
//         };

//         let saveData = new Userbill(obj);
//         let bill = await saveData.save();
//         if (bill) {
//           return res.send({ billId: bill?._id });
//         } else {
//           return res.send({ message: "bill not generate!!!" });
//         }
//       }

//       return res.status(200).send(existingKOTs);
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

router.get(
  '/v1/kitchens/:id/kitchenHistory',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;
      const { id } = req.params;
      if (!businessId || !id) {
        return res.status(400).send('businessId and kitchenid required!!');
      }

      const existingKOTs = await Kot.find({
        businessId,
        KitchenId: id,
        dishStatus: 'cooked',
      });

      return res.status(200).send(existingKOTs);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/passwordManager/:businessId',

  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      const kotPassword = await Kotpassword.findOne({ businessId });

      const obj: any = {};
      obj['deleteKotPassword'] = kotPassword?.password;

      return res.send(obj);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/runningTablesCost',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingKOTs = await Kot.find({
      businessId: businessId,
      status: 'UNPAID',
      startedAt: { $gte: 1702530875454 },
      isDeleted: false,
    });
    let grandTotal = 0;
    for (let i = 0; i < existingKOTs.length; i++) {
      let total;
      const obj: any = existingKOTs[i];
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

      grandTotal += total;

      obj.dish.price = total;
    }

    let tableCostObj: any = {};
    tableCostObj['totalCost'] = grandTotal;

    res.status(200).send(tableCostObj);
  },
);

router.get(
  '/v1/kitchens/:id/removeKotByBusinessId',

  async (req: Request, res: Response) => {
    const { businessId, remove } = req.query;
    const existingKOTs = await Kot.find({
      businessId: businessId,
      status: 'UNPAID',
      startedAt: { $gte: 1702530875454 },
      isDeleted: false,
    });
    if (remove) {
      const kots = await Kot.deleteMany({ businessId, status: 'UNPAID' });

      return res.send(kots);
    }

    res.status(200).send(existingKOTs);
  },
);

router.get(
  '/v1/kitchens/:id/deleteKotByBusinessId',

  async (req: Request, res: Response) => {
    try {
      const { businessId, remove, removeWaiterOrder } = req.query;
      if (remove) {
        const kots = await Kot.deleteMany({ status: 'PAID' });
        return res.send(kots);
      }
      if (removeWaiterOrder) {
        const kots = await Waiterkot.deleteMany({ isAccept: true });
        return res.send(kots);
      }
      const kots = await Kot.find({ status: 'PAID' });

      return res.send(kots);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/orders',

  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),

  async (req: Request, res: Response) => {
    try {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD');
      let query = { ...req.query, date: dayAndDate };
      const ordersHistory = await Waiterkot.find(query, {
        cart: 0,
        businessId: 0,
        zoneId: 0,
        staffId: 0,
        tableId: 0,

        'items.businessId': 0,
        'items.zoneId': 0,
        'items.tableId': 0,
        'items.staffId': 0,
        'items.customerPhone': 0,
        'items.avgTime': 0,
        'items.taxes': 0,
        'items.category': 0,
        'items.dishType': 0,
        'items.kitchenId': 0,
        'items.dishStatus': 0,
        'items.tableName': 0,
      });
      return res.send(ordersHistory);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/orderKots',

  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    try {
      const { businessId, orderId } = req.query;

      const filters = {
        businessId,
      } as any;

      const query = {
        status: 'UNPAID',
        orderId,
        isDeleted: false,
        businessId,
      } as any;

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          query[key] = filters[key];
        }
      });

      let existingKOTs = await Kot.find(query);
      let flag = false;
      existingKOTs.forEach((ele: any) => {
        if (ele?.match == false) {
          flag = true;
        }
      });

      let groupByKotTime: any = {};

      existingKOTs.forEach((item: any) => {
        if (!groupByKotTime[item.orderId]) {
          groupByKotTime[item.orderId] = {
            kotTime: item?.kotTime,
            orderId: item?.orderId,
            dishStatus: item?.dishStatus,

            kots: [],
          };
        }
        groupByKotTime[item.orderId].kots.push(item);
      });

      const result = Object.values(groupByKotTime);

      for (let i = 0; i < result?.length; i++) {
        let cookedDishes = 0;
        let totalDishes = 0;
        let kot: any = result?.[i];
        kot?.kots?.forEach((element: any) => {
          if (element?.dishStatus != 'cooking') {
            cookedDishes += 1;
          }
        });
        totalDishes = kot?.kots?.length;
        kot['totalDishes'] = totalDishes;
        kot['cookedDishes'] = cookedDishes;
        if (flag) {
          kot['isMatch'] = false;
        } else {
          kot['isMatch'] = true;
        }
      }

      res.status(200).send(result);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  },
);

router.get(
  '/v1/kitchens/:id/kot/:kotId',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { kotId } = req.params;
    const existingKot = await Kot.findById(kotId);
    res.status(200).send(existingKot);
  },
);

router.get(
  '/v1/kitchens/:id/paidkot',

  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const paikot = await Tempmodel.deleteMany();

    res.status(200).send(paikot);
  },
);

router.get(
  '/v1/kitchens/:id/removeData',

  async (req: Request, res: Response) => {
    const { businessId, kot, waiterKots, bill } = req.query;
    if (kot) {
      const kots = await Kot.deleteMany({ status: 'PAID' });
      return res.send(kots);
    }
    if (waiterKots) {
      const kots = await Waiterkot.deleteMany({ isAccept: true });
      return res.send(kots);
    }
    if (bill) {
      const kots = await Userbill.deleteMany({ businessId });
      return res.send(kots);
    }

    res.status(200).send('data removed');
  },
);

export { router as readKitchenRouter };
