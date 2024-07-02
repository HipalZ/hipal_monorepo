import { ClientRoles, requireAuthorization } from '@hi/common';
import { Dues, LoyaltyCoinsInfo, Order, Payment, PaymentAlert, PaymentMode, Reviews, ReviewsCustomer, TempBill } from '@hi/db-models';
import { paramsSchema, PaymentType } from '@hi/db-models/src/validators';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import express, { Request, Response } from 'express';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';
import { validateRequest } from 'zod-express-middleware';

dayjs.extend(utc);
dayjs.extend(dayOfYear);
dayjs.extend(tz);

const router = express.Router();

// create fields array
const fields = [
  'paymentDate',
  'time',
  'tableName',
  'customerPhone',
  'customerName',
  'waiterName',
  'sgst',
  'subTotal',
  'total',
  'discount',
  'mode',
  'tips',
  'items',
];

// create reviews fields array

const reviewsFields = ['reviewRating', 'description', 'improvementAreas', 'date', 'reviewerName', 'reviewerPhone'];

router.get(
  '/v1/payments',
  validateRequest({
    query: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId } = req.query;

    const existingPayment = await Payment.find({ businessId }).populate('order_id');

    res.status(200).send({
      err: false,
      data: existingPayment,
      message: 'fetched successfully',
    });
  },
);

router.get(
  '/v1/payments/:id/orders',
  validateRequest({
    query: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId } = req.query;

    const existingOrders = await Order.find({ businessId });

    res.status(200).send({
      err: false,
      data: existingOrders,
      message: 'existing orders',
    });
  },
);

router.get(
  '/v1/payments/:id/paymentAlerts',
  validateRequest({
    query: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId, alertType } = req.query;

    const existingPaymentAlerts = await PaymentAlert.find({ businessId, alertType, isAccepted: false }).sort({ _id: -1 }).populate('order_id');

    return res.status(200).send({
      err: false,
      data: existingPaymentAlerts,
      message: 'existing payment alerts',
    });
  },
);

router.get(
  '/v1/payments/:id/offlineAlerts',
  validateRequest({
    query: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId, alertType } = req.query;

    const existingPaymentAlerts = await PaymentAlert.find({ businessId, alertType: ['OFFLINE', 'WAITER'], isAccepted: false })
      .sort({ _id: -1 })
      .populate('order_id');

    return res.status(200).send({
      err: false,
      data: existingPaymentAlerts,
      message: 'existing payment alerts',
    });
  },
);

router.get(
  '/v1/payments/:id/paymentAlertHistory',
  validateRequest({
    query: paramsSchema,
  }),

  async (req: Request, res: Response) => {
    const { businessId, from, to } = req.query;
    let fromDate = Number(from);
    let toDate = Number(to);
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!from && !to) {
      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        isAccepted: true,
        isRejected: false,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate('order_id');

      return res.status(200).send({
        err: false,
        data: existingPaymentAlerts,
        message: 'existing payment alerts',
      });
    }

    if (from && to) {
      if (fromDate > toDate) {
        return res.status(400).send({ err: true, data: {}, message: 'invalid date format' });
      }
      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        isAccepted: true,
        isRejected: false,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate('order_id');

      return res.status(200).send({
        err: false,
        data: existingPaymentAlerts,
        message: 'existing payment alerts',
      });
    }
    return res.status(400).send({ err: true, data: {}, message: 'invalid date format' });
  },
);

router.get(
  '/v1/payments/:id/salesDashboard',
  validateRequest({
    query: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { businessId, from, to, pageNumber = 1 } = req.query;
    const fromDate = Number(from);
    const toDate = Number(to);

    const loyaltyCoinInfo = await LoyaltyCoinsInfo.findOne({ businessId }).select('coinzIssued coinzRedeemed');
    if (!from && !to) {
      const existingPayments = await Payment.find({
        businessId,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      }).select('total claimedCoins paymentMode');
      const totalSale = existingPayments.reduce((acc, payment) => acc + payment.total, 0);
      const totalCoins = existingPayments.reduce((acc, payment: PaymentType) => acc + (payment?.claimedCoins ?? 0), 0);

      const totalOnlineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment?.paymentMode === 'online' ? payment.total : 0),
        0,
      );

      const totalOfflineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment?.paymentMode === 'offline' ? payment.total : 0),
        0,
      );

      return res.status(200).send({
        err: false,
        data: {
          totalSale,
          totalDiscount: totalCoins,
          totalOnlineSale,
          totalOfflineSale,
          coinzIssued: loyaltyCoinInfo?.coinzIssued,
          coinzRedeemed: totalCoins,
        },
        message: 'existing payment',
      });
    }
    if (from && to) {
      if (fromDate > toDate) {
        return res.status(400).send({ err: true, data: {}, message: 'invalid date format' });
      }
      const existingPayments = await Payment.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      }).select('total claimedCoins paymentMode');
      const totalSale = existingPayments.reduce((acc, payment) => acc + payment.total, 0);
      const totalCoins = existingPayments.reduce((acc, payment: PaymentType) => acc + (payment?.claimedCoins ?? 0), 0);

      const totalOnlineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment?.paymentMode === 'online' ? payment.total : 0),
        0,
      );

      const totalOfflineSale = existingPayments.reduce(
        (acc, payment: PaymentType) => acc + (payment?.paymentMode === 'offline' ? payment.total : 0),
        0,
      );

      return res.status(200).send({
        err: false,
        data: {
          totalSale,
          totalDiscount: totalCoins,
          totalOnlineSale,
          totalOfflineSale,
          coinzIssued: loyaltyCoinInfo?.coinzIssued,
          coinzRedeemed: totalCoins,
        },
        message: 'existing payment',
      });
    }
    return res.status(400).send({ err: true, data: {}, message: 'invalid date format' });
  },
);

const d = {
  $gte: dayjs().utc().set('hour', 0).set('minute', 0).set('second', 0).toDate(),
  $lte: dayjs().utc().endOf('day').toDate(),
};
router.get(
  '/v1/payments/:id/bills',
  validateRequest({
    query: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { businessId, from, to } = req.query;
    const fromDate = Number(from);
    const toDate = Number(to);
    let PAGE_SIZE = 1000;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    const d = {
      $gte: dayjs(from as string)
        .utc()
        .add(1, 'day')
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .toDate(),
      $lte: dayjs(to as string)
        .utc()
        .add(1, 'day')
        .endOf('day')
        .toDate(),
    };
    console.log({ d });

    if (fromDate > toDate) {
      return res.status(400).send({ err: true, data: {}, message: 'invalid date format' });
    }
    const existingPayments = await Payment.find({
      businessId,
      createdAt: {
        $gte: d.$gte,
        $lte: d.$lte,
      },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate('order_id');

    console.log(existingPayments.length);
    const totalSale = existingPayments.reduce((acc, payment) => acc + payment.total, 0);

    return res.status(200).send({
      err: false,
      data: {
        totalSale,
        existingPayments,
      },
      message: 'existing payment',
    });
  },
);

router.get('/v1/payments/Sales&Discount', async (req: Request, res: Response) => {
  let { date, businessId } = req.query;
  businessId = String(businessId);

  const getPaymentsModes = await PaymentMode.find({ businessId });
  const calculateSale = (array: any) => {
    let summary: any = {
      totalSale: 0,
      modes: {},
    };

    array.forEach((payment: any) => {
      if (payment.mode) {
        if (!summary.modes[payment.mode]) {
          summary.modes[payment.mode] = 0;
        }
        summary.modes[payment.mode] += payment.total;
      }
    });

    // Convert modes object to desired format

    for (const [mode, total] of Object.entries(summary.modes) as any) {
      // Retrieve commission percentage for the mode
      const commissionPercent = modes[mode] || 0;

      // Calculate commission amount
      const totalCommissionSale = (commissionPercent / 100) * total;

      // Adjust totalSale by subtracting commission
      const adjustedTotalSale = total - totalCommissionSale;
      summary.totalSale += adjustedTotalSale;
    }

    return summary?.totalSale;
  };
  let modes: any = {};
  getPaymentsModes.forEach((element: any) => {
    if (element?.mode) {
      if (!modes[element.mode]) {
        modes[element.mode] = element?.commission;
      }
    }
  });

  // Get Indian formatted date for a given date or for now
  const getIndianFormattedDate = (dateOffset = 0, referenceDate?: string) => {
    let dateToAdjust = referenceDate ? moment(referenceDate) : moment();
    return dateToAdjust.utcOffset('+05:30').subtract(dateOffset, 'days').format('YYYY-MM-DD');
  };

  // Construct query based on businessId and date
  const constructQuery = (businessId: string, targetDate: string) => {
    return {
      businessId,
      date: { $regex: `^${targetDate}` },
    };
  };

  // Calculate sales and discount metrics
  let DiscountIssued = 0;
  const calculateMetrics = (payments: any[]) => {
    let totalSale = 0;
    let totalDiscount = 0;

    payments.forEach((payment) => {
      if (payment?.discount > 0) {
        DiscountIssued += 1;
      }
      totalSale += parseInt(payment?.total || '0');
      totalDiscount += parseInt(payment?.discount || '0');
    });

    return { totalSale, totalDiscount };
  };

  const targetDate = date ? String(date).split('-').reverse().join('-') : getIndianFormattedDate();
  const previousDate = getIndianFormattedDate(1, targetDate);

  const [currentPayments, previousPayments] = await Promise.all([
    Payment.find(constructQuery(businessId, targetDate)),
    Payment.find(constructQuery(businessId, previousDate)),
  ]);

  const { totalDiscount } = calculateMetrics(currentPayments);

  let pre = calculateSale(previousPayments);
  let curr = calculateSale(currentPayments);

  res.status(200).send({
    totalSale: curr,
    totalDiscount,
    preTotalSale: pre,
    percentageChange: pre !== 0 ? ((curr - pre) / pre) * 100 : curr > 0 ? 100 : 0, // Assuming 100% increase if preTotalSale is 0 and totalSale is greater than 0.
    DiscountIssued,
    message: 'Sales and Discount metrics',
    data: {},
  });
});

router.get(
  '/v1/payments/:id',
  requireAuthorization([ClientRoles.HIPAL_CUSTOMER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingPayment = await Payment.findById(id);

    res.status(200).send({
      err: false,
      data: existingPayment,
      message: 'existing payment',
    });
  },
);

router.get(
  '/v1/payments/Sale/Api',
  requireAuthorization([ClientRoles.HIPAL_CUSTOMER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId, from, to } = req.query;
    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');

    const getPaymentsModes = await PaymentMode.find({
      businessId,
      mode: { $ne: 'split payment' },
    });
    const calculateSale = (array: any) => {
      let summary: any = {
        totalSale: 0,
        modes: {},
      };
      let totalDiscount = 0;
      let serviceCharge = 0;
      let normalTaxes = 0;
      let tips = 0;
      array.forEach((payment: any) => {
        totalDiscount += payment?.discount || 0;
        serviceCharge += payment?.serviceCharge || 0;
        normalTaxes += payment?.cgst + payment?.sgst || 0;
        tips += payment?.tips || 0;

        if (payment.mode) {
          if (payment.mode === 'multiple' && payment.modeBreakDown) {
            for (const [mode, amount] of Object.entries(payment.modeBreakDown)) {
              if (!summary.modes[mode]) {
                summary.modes[mode] = 0;
              }
              summary.modes[mode] += amount;
            }
          } else {
            if (!summary.modes[payment.mode]) {
              summary.modes[payment.mode] = 0;
            }

            // Check if the mode is "complimentary" and update accordingly
            if (payment.mode === 'complimentary') {
              summary.modes[payment.mode] += payment.subTotal;
            } else {
              summary.modes[payment.mode] += payment.total;
            }
          }
        }
      });

      // Convert modes object to desired format
      const modesArray = [];
      for (let [mode, total] of Object.entries(summary.modes) as any) {
        const commissionPercent = modes[mode] || 0;

        // Calculate commission amount
        const totalCommissionSale = (commissionPercent / 100) * total;

        // Adjust totalSale by subtracting commission
        const adjustedTotalSale = total - totalCommissionSale;
        if (mode == 'complimentary') {
          summary.totalSale += 0;
        } else {
          summary.totalSale += adjustedTotalSale;
        }

        modesArray.push({
          mode: mode,
          totalSale: adjustedTotalSale,
          commissionPercent: commissionPercent,
          totalCommissionSale: totalCommissionSale,
        });
      }

      let modesSet = new Set(modesArray.map((item) => item.mode));
      getPaymentsModes.forEach((item) => {
        if (!modesSet.has(item.mode)) {
          modesArray.push({
            mode: item.mode,
            totalSale: 0,
            commissionPercent: 0,
            totalCommissionSale: 0,
          });
        }
      });
      modesArray.push({
        mode: 'discount',
        totalSale: totalDiscount,
        commissionPercent: 0,
        totalCommissionSale: 0,
      });
      modesArray.push({
        mode: 'serviceCharge',
        totalSale: Number(serviceCharge?.toFixed(2)),
        commissionPercent: 0,
        totalCommissionSale: 0,
      });
      modesArray.push({
        mode: 'normalTaxes',
        totalSale: Number(normalTaxes?.toFixed(2)),
        commissionPercent: 0,
        totalCommissionSale: 0,
      });
      modesArray.push({
        mode: 'tips',
        totalSale: tips,
        commissionPercent: 0,
        totalCommissionSale: 0,
      });
      summary.modes = modesArray;
      return summary;
    };
    let modes: any = {};
    getPaymentsModes.forEach((element) => {
      if (element?.mode) {
        if (!modes[element.mode]) {
          modes[element.mode] = element?.commission;
        }
      }
    });

    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      let existingPayments = await Payment.find({
        businessId,

        date: { $regex: `^${dayAndDate}` },
      });
      if (existingPayments?.length == 0) {
        existingPayments = await Payment.find({
          businessId,
          date: { $regex: `^${preDate}` },
        });
      }

      let result = calculateSale(existingPayments);

      return res.status(200).send({
        err: false,
        data: result,
        message: 'existing payment',
      });
    }

    if (from && to) {
      if (from == to) {
        const existingPayments = await Payment.find({
          businessId,

          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        });

        let result = calculateSale(existingPayments);

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

      const filteredPayments = await Payment.find({
        businessId,
        date: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });

      let result = calculateSale(filteredPayments);

      return res.status(200).send({
        err: false,
        data: result,
        message: 'existing payment',
      });
    }
    res.status(400).send({ err: true, data: {}, message: 'Invalid request parameters' });
  },
);

router.get(
  '/v1/payments/Sale/Bill',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId, from, to, mode } = req.query;

    const currentDate = momentTimeZone.tz('Asia/Kolkata');

    const previousDate = currentDate.subtract(1, 'days');

    const preDate = previousDate.format('YYYY-MM-DD');
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
    const filters = {
      mode,
    } as any;

    const query = {} as any;

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });

    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      let existingPayments = await Payment.find({
        businessId,
        ...query,
        date: { $regex: `^${dayAndDate}` },
      })
        .skip(skip)
        .limit(PAGE_SIZE)
        .sort({ id: -1 });
      if (existingPayments?.length == 0) {
        let existingPayments = await Payment.find({
          businessId,
          ...query,
          date: { $regex: `^${preDate}` },
        })
          .skip(skip)
          .limit(PAGE_SIZE)
          .sort({ id: -1 });
        return res.status(200).send({
          err: false,
          data: existingPayments,
          message: 'existing payment',
        });
      }

      return res.status(200).send({
        err: false,
        data: existingPayments,
        message: 'existing payment',
      });
    }

    if (from && to) {
      if (from == to) {
        const existingPayments = await Payment.find({
          businessId,
          ...query,
          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        })
          .skip(skip)
          .limit(PAGE_SIZE);

        return res.status(200).send({
          err: false,
          data: existingPayments,
          message: 'payments data',
        });
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(to).split('-').reverse().join('-'));

      toDate.setUTCHours(23, 59, 59, 999);

      if (fromDate > toDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }

      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];

      const filteredPayments = await Payment.find({
        businessId,
        ...query,
        date: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      })
        .skip(skip)
        .limit(PAGE_SIZE);

      return res.status(200).send({
        err: false,
        data: filteredPayments,
        message: 'existing payment',
      });
    }

    res.status(400).send({ err: true, data: {}, message: 'Invalid request parameters' });
  },
);

router.get(
  '/v1/payments/Sale/Dues',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId } = req.query;

    const existingPayments = await Payment.find({
      businessId,
      mode: 'dues',
      settle: false,
    });
    let totalDues = 0;
    existingPayments.forEach((element) => {
      totalDues += element?.total || 0;
    });
    const userTotals: any = {};

    // Iterate through the input data
    existingPayments.forEach((item: any) => {
      const customerId = item.duesPersonId;
      const subTotal = item.total;

      // Check if the user's total already exists in the userTotals object
      if (userTotals[customerId]) {
        userTotals[customerId].totaldues += subTotal;
      } else {
        // If the user's total doesn't exist, create it
        userTotals[customerId] = {
          name: item.customerName,
          totaldues: subTotal,
          duesPersonId: customerId,
        };
      }
    });

    // Convert the userTotals object into an array
    const result = Object.values(userTotals);
    let newObje = { totalDues, items: result } || {};

    return res.status(200).send({
      err: false,
      data: newObje,
      message: 'existing payment',
    });
  },
);

router.get(
  '/v1/payments/Get/Modes',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId, remove, id } = req.query;
    if (remove) {
      const existingModes = await PaymentMode.deleteOne({
        _id: id,
        businessId,
      });
      return res.send(existingModes);
    }
    const existingModes = await PaymentMode.find({
      businessId,
    });
    if (!existingModes) {
      return res.status(404).send({
        err: true,
        data: {},
        message: 'Modes Not Found',
      });
    }

    return res.status(200).send({
      err: false,
      data: existingModes,
      message: 'existing payment',
    });
  },
);

router.get(
  '/v1/payments/Get/Dues',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId } = req.query;

    const existingDues = await Dues.find({
      businessId,
    });
    if (!existingDues) {
      return res.status(404).send({
        err: true,
        data: {},
        message: 'Dues Not Found',
      });
    }

    return res.status(200).send({
      err: false,
      data: existingDues,
      message: 'existing payment',
    });
  },
);

router.get(
  '/v1/payments/Get/DuesByUser',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { duesPersonId, businessId, from, to } = req.query;
    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');
    const duesUser = await Payment.findOne({
      duesPersonId,
      businessId,
    }).select('customerName');
    let totalDues = 0;
    const calculateTotalDues = (array: any) => {
      array.forEach((element: any) => {
        if (element?.settle == false) {
          totalDues += element?.total;
        }
      });
      return totalDues;
    };
    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      const existingPayments = await Payment.find({
        duesPersonId,
        businessId,
        date: { $regex: `^${dayAndDate}` },
      });
      if (existingPayments?.length == 0) {
        const existingPayments = await Payment.find({
          duesPersonId,
          businessId,
          date: { $regex: `^${preDate}` },
        });
        totalDues = calculateTotalDues(existingPayments);
        let newObje =
          {
            totalDues,
            items: existingPayments,
            userName: duesUser?.customerName,
          } || {};

        return res.send({
          err: false,
          data: newObje,
          message: 'existing payment',
        });
      }

      totalDues = calculateTotalDues(existingPayments);
      let newObje =
        {
          totalDues,
          items: existingPayments,
          userName: duesUser?.customerName,
        } || {};

      return res.send({
        err: false,
        data: newObje,
        message: 'existing payment',
      });
    }

    if (from && to) {
      if (from == to) {
        // Adjust timezone as necessary
        const existingPayments = await Payment.find({
          duesPersonId,
          businessId,
          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        });
        totalDues = calculateTotalDues(existingPayments);
        let newObje =
          {
            totalDues,
            items: existingPayments,
            userName: duesUser?.customerName,
          } || {};

        return res.send({
          err: false,
          data: newObje,
          message: 'existing payment',
        });
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(to).split('-').reverse().join('-'));

      toDate.setUTCHours(23, 59, 59, 999);
      if (fromDate > toDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }
      const filteredPayments = await Payment.find({
        businessId,
        duesPersonId,

        date: {
          $gte: fromDate.toISOString(),
          $lte: toDate.toISOString(),
        },
      });

      totalDues = calculateTotalDues(filteredPayments);
      let newObje =
        {
          totalDues,
          userName: duesUser?.customerName,
          items: filteredPayments,
        } || {};

      return res.send({
        err: false,
        data: newObje,
        message: 'existing payment',
      });
    }
  },
);

// router.get("/v1/payments/Get/Alert", async (req: Request, res: Response) => {
//   try {
//     let { businessId, loyalty, value } = req.query;
//     if (loyalty) {
//       const existingAlert = await BusinessAlert.findOne({
//         value: value,
//         uniqueName: "loyaltyAlert",
//       });

//       return res.send(existingAlert);
//     }

//     const existingAlerts = await BusinessAlert.find({
//       businessId,
//     });

//     return res.status(200).send(existingAlerts);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Server error" });
//   }
// });

// router.get(
//   "/v1/payments/Get/BusinessAlert",
//   async (req: Request, res: Response) => {
//     try {
//       let { businessId } = req.query;

//       const existingAlerts = await PaymentAlert.find({
//         businessId,
//       });

//       return res.status(200).send(existingAlerts);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send({ message: "Server error" });
//     }
//   }
// );

router.get('/v1/payments/:id/byUsers', requireAuthorization([ClientRoles.HIPAL_CUSTOMER]), async (req: Request, res: Response) => {
  let { customerPhone } = req.query;

  const existingPayments = await Payment.find({
    customerPhone,
  });

  return res.status(200).send({
    err: true,
    data: existingPayments,
    message: 'existing payment',
  });
});
const necessaryFields = {
  items: 0,
  businessId: 0,
  address: 0,
  tableName: 0,
  gstin: 0,
  zoneId: 0,
  tableId: 0,
  time: 0,
  otherCharges: 0,
  zoneType: 0,
  logo: 0,
};
router.get(
  '/v1/payments/:id/saleDashboard',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId, from, to } = req.query;
    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');

    const getPaymentsModes = await PaymentMode.find({
      businessId,
      mode: { $nin: ['split payment', 'complimentary'] },
    });

    let modes: any = {};
    getPaymentsModes.forEach((element: any) => {
      if (element?.mode) {
        if (!modes[element.mode]) {
          modes[element.mode] = element?.commission;
        }
      }
    });

    let payments;
    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      payments = await Payment.find(
        {
          businessId,
          date: { $regex: `^${dayAndDate}` },
        },
        necessaryFields,
      );

      if (payments?.length == 0) {
        payments = await Payment.find(
          {
            businessId,
            date: { $regex: `^${preDate}` },
          },
          necessaryFields,
        );
      }
    } else if (from && to) {
      let fromDate = new Date(String(from).split('-').reverse().join('-'));
      fromDate.setUTCHours(0, 0, 0, 0);
      let toDate = new Date(String(to).split('-').reverse().join('-'));
      toDate.setUTCHours(23, 59, 59, 999);
      if (fromDate > toDate) {
        return res.status(404).send('From date cannot be greater than to date.');
      }
      // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];
      payments = await Payment.find(
        {
          businessId,
          date: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
        },
        necessaryFields,
      );
    } else {
      return res.status(404).send({
        err: true,
        data: {},
        message: 'Invalid request parameters',
      });
    }

    let result = calculateSale(payments, getPaymentsModes, modes);

    return res.status(200).send({
      err: true,
      data: result,
      message: 'sales data',
    });
  },
);

function calculateSale(payments: any[], paymentModes: any[], modes: any) {
  let summary: any = {
    totalSale: 0,
    modes: {},
  };
  let totalDiscount = 0;
  let serviceCharge = 0;
  let normalTaxes = 0;
  let tips = 0;
  let waiterChips: any = {};
  let duesObject: any = {};

  payments.forEach((payment: any) => {
    totalDiscount += payment?.discount || 0;
    serviceCharge += payment?.serviceCharge || 0;
    normalTaxes += payment?.cgst + payment?.sgst || 0;
    tips += payment?.tips || 0;
    calculateWaiterChips(waiterChips, payment);
    calculateDues(duesObject, payment);
    calculateModes(summary, payment);
  });

  // Convert modes object to desired format
  const modesArray = convertModesToArray(summary, modes);
  addMissingModes(modesArray, paymentModes);
  summary.modes = modesArray;
  const complimentaryMode = summary?.modes?.find((mode: any) => mode.mode === 'complimentary');
  let filterModes = summary?.modes.filter((mode: any) => mode.mode != 'complimentary');

  let charges = [];
  let dis = [];

  charges.push({
    mode: 'serviceCharge',
    totalSale: Number(serviceCharge?.toFixed(2)),
    commissionPercent: 0,
    totalCommissionSale: 0,
  });
  charges.push({
    mode: 'Taxes',
    totalSale: Number(normalTaxes?.toFixed(2)),
    commissionPercent: 0,
    totalCommissionSale: 0,
  });
  dis.push({
    mode: 'Discount & Complimentary',
    totalSale: totalDiscount,
    commissionPercent: 0,
    totalCommissionSale: 0,
  });

  return {
    grossSale: summary?.totalSale,
    totalSale: filterModes,
    charges: charges,
    discounts: dis,
    tips: Object.values(waiterChips),
    dues: Object.values(duesObject),
  };
}

function calculateWaiterChips(waiterChips: any, payment: any) {
  if (!waiterChips[payment?.waiterName]) {
    waiterChips[payment?.waiterName] = {
      waiterName: payment?.waiterName,
      tips: payment?.tips,
    };
  } else {
    waiterChips[payment?.waiterName] = {
      waiterName: payment?.waiterName,
      tips: (waiterChips[payment?.waiterName]?.tips || 0) + (payment?.tips || 0),
    };
  }
}

function calculateDues(duesObject: any, payment: any) {
  if (payment?.settle === false && !duesObject[payment?.duesPersonId] && payment?.duesPersonId?.length > 1) {
    duesObject[payment?.duesPersonId] = {
      customerName: payment?.customerName,
      dues: payment?.total,
    };
  } else if (payment?.settle === false && payment?.duesPersonId?.length > 1) {
    duesObject[payment?.duesPersonId] = {
      customerName: payment?.customerName,
      dues: (duesObject[payment?.duesPersonId]?.dues || 0) + (payment?.total || 0),
    };
  }
}

function calculateModes(summary: any, payment: any) {
  if (payment.mode) {
    if (payment.mode === 'multiple' && payment.modeBreakDown) {
      for (const [mode, amount] of Object.entries(payment.modeBreakDown)) {
        if (!summary.modes[mode]) {
          summary.modes[mode] = 0;
        }
        summary.modes[mode] += amount;
      }
    } else {
      if (!summary.modes[payment.mode]) {
        summary.modes[payment.mode] = 0;
      }

      if (payment.mode === 'complimentary') {
        summary.modes[payment.mode] += payment.subTotal;
      } else {
        summary.modes[payment.mode] += payment.total;
      }
    }
  }
}

function convertModesToArray(summary: any, modes: any) {
  const modesArray = [];
  for (let [mode, total] of Object.entries(summary.modes) as any) {
    const commissionPercent = modes[mode] || 0;

    // Calculate commission amount
    const totalCommissionSale = (commissionPercent / 100) * total;

    // Adjust totalSale by subtracting commission
    const adjustedTotalSale = total - totalCommissionSale;
    if (mode == 'complimentary') {
      summary.totalSale += 0;
    } else {
      summary.totalSale += adjustedTotalSale;
    }

    modesArray.push({
      mode: mode,
      totalSale: adjustedTotalSale,
      commissionPercent: commissionPercent,
      totalCommissionSale: totalCommissionSale,
    });
  }
  return modesArray;
}

function addMissingModes(modesArray: any[], paymentModes: any[]) {
  let modesSet = new Set(modesArray.map((item) => item.mode));
  paymentModes.forEach((item) => {
    if (!modesSet.has(item.mode)) {
      modesArray.push({
        mode: item.mode,
        totalSale: 0,
        commissionPercent: 0,
        totalCommissionSale: 0,
      });
    }
  });
}

router.get(
  '/v1/payments/:id/saleReport',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId, from, to, excel } = req.query;

    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');
    let splitArray: any = [];

    const objectFunction = (payment: any) => {
      let obj: any = {};

      obj['date'] = payment?.date;
      obj['customerName'] = payment?.customerName;
      obj['customerPhone'] = payment?.customerPhone;
      obj['time'] = payment?.time;
      obj['orderId'] = payment?.orderId || payment?.id?.slice(-5);
      obj['tableNumber'] = payment?.tableName;
      obj['orderType'] = payment?.zoneType;
      obj['paymentType'] = payment?.mode;
      obj['closedBy'] = payment?.waiterName;

      let tempObj: any = {};

      payment?.items.forEach((item: any) => {
        if (item?.category) {
          if (!tempObj[item?.category]) {
            tempObj[item?.category] = item.amount;
          } else {
            tempObj[item?.category] += item.amount;
          }
        }
      });
      obj['categories'] = { ...tempObj };

      // for (let category in tempObj) {
      //   obj[category] = tempObj[category];
      // }
      obj['subTotal'] = payment?.subTotal;
      obj['discount'] = payment?.discount || 0;
      obj['discountReason'] = payment?.discountDescription;

      obj['cgst'] = payment?.cgst || 0;
      obj['sgst'] = payment?.sgst || 0;
      obj['serviceCharge'] = payment?.serviceCharge || 0;
      obj['packingCharges'] = payment?.swiggyBillObj?.packingCharges || 0;
      obj['RxPayableGST'] = payment?.swiggyBillObj?.RxPayableGST || 0;
      obj['swiggyPayableGST'] = payment?.swiggyBillObj?.swiggyPayableGST || 0;
      obj['total'] = payment?.total;
      obj['tips'] = payment?.tips || 0;
      if (payment?.mode == 'multiple') {
        let h: any = {};
        for (let category in tempObj) {
          h[category] = 0;
        }

        let tempSplitObj: any = {};

        tempSplitObj = {
          ...obj,
          categories: { ...h },
          paymentType: 'split',
          subTotal: 0,
          discount: 0,
          discountReason: 0,
          cgst: 0,
          sgst: 0,
          serviceCharge: 0,
          total: 0,
          tips: 0,
        };
        splitArray.push(tempSplitObj);
        for (let mode in payment?.modeBreakDown) {
          let sTotal = Math.round((obj?.subTotal * payment?.modeBreakDown[mode]) / obj?.total);

          let cgst = Math.round((obj?.cgst * payment?.modeBreakDown[mode]) / obj?.total);
          let sgst = Math.round((obj?.sgst * payment?.modeBreakDown[mode]) / obj?.total);
          let serviceCharge = Math.round((obj?.serviceCharge * payment?.modeBreakDown[mode]) / obj?.total);
          let discount = Math.round((obj?.discount * payment?.modeBreakDown[mode]) / obj?.total);
          let tips = Math.round((obj?.tips * payment?.modeBreakDown[mode]) / obj?.total);
          let total = Math.round((obj?.total * payment?.modeBreakDown[mode]) / obj?.total);

          let c: any = {};

          for (let category in tempObj) {
            let value = Math.round((tempObj[category] * payment?.modeBreakDown[mode]) / obj?.total);

            c[category] = value;
          }

          tempSplitObj = {
            ...obj,
            paymentType: mode,

            subTotal: sTotal,
            discount: discount,
            discountReason: '',
            cgst: cgst,
            sgst: sgst,
            serviceCharge: serviceCharge,
            total: total,
            tips: tips,
          };
          tempSplitObj['categories'] = { ...c };

          splitArray.push(tempSplitObj);
        }
      }

      return obj;
    };

    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      let existingPayments = await Payment.find({
        businessId,

        date: { $regex: `^${dayAndDate}` },
      });
      if (existingPayments?.length == 0) {
        existingPayments = await Payment.find({
          businessId,
          date: { $regex: `^${preDate}` },
        });
      }
      let ans: any = [];

      for (let i = 0; i < existingPayments?.length; i++) {
        let payment = existingPayments[i];
        const out = objectFunction(payment);

        ans.push(out);
      }
      if (excel) {
        let sumOfDis = 0;
        ans.forEach((element: any) => {
          sumOfDis += element?.discountAmount || 0;
        });

        let obj: any = {};
        obj['from'] = dayAndDate;
        obj['to'] = dayAndDate;
        ans.unshift(obj);
      }
      ans = ans.filter((pay: any) => pay.paymentType != 'multiple');

      return res.status(200).send({
        err: false,
        data: [...ans, ...splitArray],
        message: 'report generated',
      });
    }

    if (from && to) {
      if (from == to) {
        const existingPayments = await Payment.find({
          businessId,

          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        });

        let ans: any = [];

        for (let i = 0; i < existingPayments?.length; i++) {
          let payment = existingPayments[i];
          const out = objectFunction(payment);

          ans.push(out);
        }
        if (excel) {
          let sumOfDis = 0;
          ans.forEach((element: any) => {
            sumOfDis += element?.discountAmount || 0;
          });

          let obj: any = {};
          obj['from'] = from;
          obj['to'] = from;
          ans.unshift(obj);
        }
        ans = ans.filter((pay: any) => pay.paymentType != 'multiple');

        return res.send({
          err: false,
          data: [...ans, ...splitArray],
          message: 'report generated',
        });
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(to).split('-').reverse().join('-'));

      toDate.setUTCHours(23, 59, 59, 999);

      if (fromDate > toDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }

      // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];

      const filteredPayments = await Payment.find({
        businessId,
        date: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });
      let ans: any = [];

      for (let i = 0; i < filteredPayments?.length; i++) {
        let payment = filteredPayments[i];
        const out = objectFunction(payment);

        ans.push(out);
      }
      if (excel) {
        let sumOfDis = 0;
        ans.forEach((element: any) => {
          sumOfDis += element?.discountAmount || 0;
        });

        let obj: any = {};
        obj['from'] = from;
        obj['to'] = to;
        ans.unshift(obj);
      }
      ans = ans.filter((pay: any) => pay.paymentType != 'multiple');

      return res.send({
        err: false,
        data: [...ans, ...splitArray],
        message: 'report generated',
      });
    }
  },
);

router.get(
  '/v1/payments/:id/discountReport',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { businessId, from, to, excel } = req.query;
    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');

    const objectFunction = (payment: any) => {
      let obj: any = {};

      obj['date'] = payment?.date;
      obj['discountPercentage'] = Math.floor((payment?.discount / payment?.subTotal) * 100);
      obj['givenBy'] = payment?.waiterName;
      obj['reason'] = payment?.discountDescription;
      obj['discountAmount'] = payment?.discount || 0;
      obj['billValue'] = payment?.total;
      obj['time'] = payment?.time;
      obj['orderId'] = payment?.orderId || payment?.id?.slice(-5);

      obj['tableNumber'] = payment?.tableName;

      return obj;
    };

    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      let existingPayments = await Payment.find({
        businessId,
        discount: { $gt: 0 },

        date: { $regex: `^${dayAndDate}` },
      });
      if (existingPayments?.length == 0) {
        existingPayments = await Payment.find({
          businessId,
          discount: { $gt: 0 },

          date: { $regex: `^${preDate}` },
        });
      }
      let ans: any = [];

      for (let i = 0; i < existingPayments?.length; i++) {
        let payment = existingPayments[i];
        const out = objectFunction(payment);

        ans.push(out);
      }
      if (excel) {
        let sumOfDis = 0;
        ans.forEach((element: any) => {
          sumOfDis += element?.discountAmount || 0;
        });

        let obj: any = {};
        obj['from'] = dayAndDate;
        obj['to'] = dayAndDate;

        obj['discountValue'] = sumOfDis;

        ans.unshift(obj);
      }

      return res.send({
        err: false,
        data: ans,
        message: 'discountReport generated',
      });
    }

    if (from && to) {
      if (from == to) {
        const existingPayments = await Payment.find({
          businessId,
          discount: { $gt: 0 },

          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        });

        let ans: any = [];

        for (let i = 0; i < existingPayments?.length; i++) {
          let payment = existingPayments[i];
          const out = objectFunction(payment);

          ans.push(out);
        }
        if (excel) {
          let sumOfDis = 0;
          ans.forEach((element: any) => {
            sumOfDis += element?.discountAmount || 0;
          });

          let obj: any = {};
          obj['from'] = from;
          obj['to'] = from;

          obj['discountValue'] = sumOfDis;
          ans.unshift(obj);
        }

        return res.status(200).send({
          err: false,
          data: ans,
          message: 'discountReport generated',
        });
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(to).split('-').reverse().join('-'));

      toDate.setUTCHours(23, 59, 59, 999);

      if (fromDate > toDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }

      // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
      const formattedFromDate = fromDate.toISOString().split('T')[0];
      const formattedToDate = toDate.toISOString().split('T')[0];

      const filteredPayments = await Payment.find({
        businessId,
        discount: { $gt: 0 },

        date: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      });
      let ans: any = [];

      for (let i = 0; i < filteredPayments?.length; i++) {
        let payment = filteredPayments[i];
        const out = objectFunction(payment);

        ans.push(out);
      }
      if (excel) {
        let sumOfDis = 0;
        ans.forEach((element: any) => {
          sumOfDis += element?.discountAmount || 0;
        });

        let obj: any = {};
        obj['from'] = from;
        obj['to'] = to;
        obj['discountValue'] = sumOfDis;
        ans.unshift(obj);
      }

      return res.send({
        err: false,
        data: ans,
        message: 'discountReport generated',
      });
    }
  },
);

// router.get(
//   '/v1/payments/:id/duesReport',
//   requireAuthorization([
//     ClientRoles.RESTAURANT_OWNER,
//     ClientRoles.RESTAURANT_MANAGER,
//     ClientRoles.RESTAURANT_STAFF
//   ]),
//   async (req: Request, res: Response) => {
//       let { businessId, from, to, excel } = req.query;

//       const currentDate = momentTimeZone.tz('Asia/Kolkata');
//       const previousDate = currentDate.subtract(1, 'days');
//       const preDate = previousDate.format('YYYY-MM-DD');

//       const objectFunction = (payment: any) => {
//         let obj: any = {};
//         obj['date'] = payment?.date;
//         obj['time'] = payment?.time;
//         obj['orderId'] = payment?.orderId || payment?.id?.slice(-5);
//         obj['subTotal'] = payment?.subTotal || 0;
//         obj['discount'] = payment?.discount || 0;
//         obj['cgst'] = payment?.cgst || 0;
//         obj['sgst'] = payment?.sgst || 0;
//         obj['serviceCharge'] = payment?.serviceCharge || 0;
//         obj['duesAmount'] = payment?.total || 0;
//         obj['remarks'] = payment?.customerName;
//         obj['paid'] = payment?.settle || 'no';
//         if (payment?.settle) {
//           obj['paidDate'] = payment?.date || '-';
//           obj['paidBy'] = payment?.customerName || '-';
//         } else {
//           obj['pending'] = payment?.total || '-';
//           obj['paidBy'] = '-';
//           obj['paidDate'] = '-';
//         }

//         return obj;
//       };

//       if (!from && !to) {
//         const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
//         let existingPayments = await Payment.find({
//           businessId,

//           duesPersonId: { $exists: true, $ne: '' },
//           date: { $regex: `^${dayAndDate}` },
//         });
//         if (existingPayments?.length == 0) {
//           existingPayments = await Payment.find({
//             businessId,

//             duesPersonId: { $exists: true, $ne: '' },
//             date: { $regex: `^${preDate}` },
//           });
//         }
//         let ans: any = [];
//         let paidAmount = 0;
//         let pending = 0;
//         for (let i = 0; i < existingPayments?.length; i++) {
//           let payment = existingPayments[i];
//           if (payment?.settle) {
//             paidAmount += payment?.total || 0;
//           }
//           if (!payment?.settle) {
//             pending += payment?.total || 0;
//           }
//           const out = objectFunction(payment);

//           ans.push(out);
//         }
//         if (excel) {
//           let obj: any = {};
//           obj['from'] = dayAndDate;
//           obj['to'] = dayAndDate;

//           obj['duesPaid'] = paidAmount;
//           obj['duesPending'] = pending;

//           ans.unshift(obj);
//         }

//         return res.send({
//           err:false,
//           data:ans,
//           message:'duesReport generated'
//         });
//       }

//       if (from && to) {
//         if (from == to) {
//           const existingPayments = await Payment.find({
//             businessId,

//             duesPersonId: { $exists: true, $ne: '' },

//             date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
//           });

//           let ans: any = [];
//           let paidAmount = 0;
//           let pending = 0;
//           for (let i = 0; i < existingPayments?.length; i++) {
//             let payment = existingPayments[i];
//             if (payment?.settle) {
//               paidAmount += payment?.total || 0;
//             }
//             if (!payment?.settle) {
//               pending += payment?.total || 0;
//             }
//             const out = objectFunction(payment);

//             ans.push(out);
//           }
//           if (excel) {
//             let obj: any = {};
//             obj['from'] = from;
//             obj['to'] = from;

//             obj['duesPaid'] = paidAmount;
//             obj['duesPending'] = pending;

//             ans.unshift(obj);
//           }

//           return res.send({
//             err:false,
//             data:ans,
//             message:'duesReport generated'
//           });
//         }
//         let fromDate = new Date(String(from).split('-').reverse().join('-'));

//         fromDate.setUTCHours(0, 0, 0, 0);

//         let toDate = new Date(String(to).split('-').reverse().join('-'));

//         toDate.setUTCHours(23, 59, 59, 999);

//         if (fromDate > toDate) {
//           return res.status(400).send({
//             err:true,
//             data:{},
//             message:'From date cannot be greater than to date.'
//           });
//         }

//         // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
//         const formattedFromDate = fromDate.toISOString().split('T')[0];
//         const formattedToDate = toDate.toISOString().split('T')[0];

//         const filteredPayments = await Payment.find({
//           businessId,

//           duesPersonId: { $exists: true, $ne: '' },
//           date: {
//             $gte: formattedFromDate,
//             $lte: formattedToDate,
//           },
//         });
//         let ans: any = [];
//         let paidAmount = 0;
//         let pending = 0;
//         for (let i = 0; i < filteredPayments?.length; i++) {
//           let payment = filteredPayments[i];
//           if (payment?.settle) {
//             paidAmount += payment?.total || 0;
//           }
//           if (!payment?.settle) {
//             pending += payment?.total || 0;
//           }
//           const out = objectFunction(payment);

//           ans.push(out);
//         }
//         if (excel) {
//           let obj: any = {};
//           obj['from'] = from;
//           obj['to'] = to;

//           obj['duesPaid'] = paidAmount;
//           obj['duesPending'] = pending;

//           ans.unshift(obj);
//         }

//         return res.send({
//           err:false,
//           data:ans,
//           message:'duesReport generated'
//         });
//       }
//   },
// );

// router.get(
//   '/v1/payments/:id/complimentaryReport',
//   requireAuthorization([
//     ClientRoles.RESTAURANT_OWNER,
//     ClientRoles.RESTAURANT_MANAGER,
//     ClientRoles.RESTAURANT_STAFF
//   ]),
//   async (req: Request, res: Response) => {
//       let { businessId, from, to, excel } = req.query;

//       const currentDate = momentTimeZone.tz('Asia/Kolkata');
//       const previousDate = currentDate.subtract(1, 'days');
//       const preDate = previousDate.format('YYYY-MM-DD');

//       const objectFunction = (payment: any) => {
//         let obj: any = {};

//         obj['date'] = payment?.date;
//         obj['complimentaryName'] = payment?.customerName;
//         obj['complimentaryRemark'] = '-';
//         obj['grossAmount'] = payment?.subTotal;

//         obj['time'] = payment?.time || 0;
//         obj['orderId'] = payment?.orderId || payment?.id?.slice(-5);

//         obj['orderType'] = payment?.zoneType || '';
//         obj['tableNumber'] = payment?.tableName || '';

//         return obj;
//       };

//       if (!from && !to) {
//         const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
//         let existingPayments = await Payment.find({
//           businessId,
//           mode: 'complimentary',

//           date: { $regex: `^${dayAndDate}` },
//         });
//         if (existingPayments?.length == 0) {
//           existingPayments = await Payment.find({
//             businessId,
//             mode: 'complimentary',
//             date: { $regex: `^${preDate}` },
//           });
//         }
//         let ans: any = [];
//         let complimentary = 0;
//         for (let i = 0; i < existingPayments?.length; i++) {
//           let payment = existingPayments[i];
//           complimentary += payment?.subTotal || 0;
//           const out = objectFunction(payment);

//           ans.push(out);
//         }
//         if (excel) {
//           let obj: any = {};
//           obj['from'] = dayAndDate;
//           obj['to'] = dayAndDate;

//           obj['complimentaryValue'] = complimentary;

//           ans.unshift(obj);
//         }

//         return res.send({
//           err:false,
//           data:ans,
//           message:'complimentaryReport generated'

//         });
//       }

//       if (from && to) {
//         if (from == to) {
//           const existingPayments = await Payment.find({
//             businessId,
//             mode: 'complimentary',

//             date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
//           });

//           let ans: any = [];
//           let complimentary = 0;
//           for (let i = 0; i < existingPayments?.length; i++) {
//             let payment = existingPayments[i];
//             complimentary += payment?.subTotal || 0;

//             const out = objectFunction(payment);

//             ans.push(out);
//           }
//           if (excel) {
//             let obj: any = {};
//             obj['from'] = from;
//             obj['to'] = from;

//             obj['complimentaryValue'] = complimentary;

//             ans.unshift(obj);
//           }

//           return res.send({
//             err:false,
//             data:ans,
//             message:'complimentaryReport generated'

//           });
//         }
//         let fromDate = new Date(String(from).split('-').reverse().join('-'));

//         fromDate.setUTCHours(0, 0, 0, 0);

//         let toDate = new Date(String(to).split('-').reverse().join('-'));

//         toDate.setUTCHours(23, 59, 59, 999);

//         if (fromDate > toDate) {
//           return res.status(400).send({
//             err:true,
//             data:{},
//             message:'From date cannot be greater than to date.'
//           });
//         }

//         // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
//         const formattedFromDate = fromDate.toISOString().split('T')[0];
//         const formattedToDate = toDate.toISOString().split('T')[0];

//         const filteredPayments = await Payment.find({
//           businessId,
//           mode: 'complimentary',
//           date: {
//             $gte: formattedFromDate,
//             $lte: formattedToDate,
//           },
//         });
//         let ans: any = [];
//         let complimentary = 0;

//         for (let i = 0; i < filteredPayments?.length; i++) {
//           let payment = filteredPayments[i];
//           complimentary += payment?.subTotal || 0;

//           const out = objectFunction(payment);

//           ans.push(out);
//         }
//         if (excel) {
//           let obj: any = {};
//           obj['from'] = from;
//           obj['to'] = to;

//           obj['complimentaryValue'] = complimentary;

//           ans.unshift(obj);
//         }

//         return res.send({
//           err:false,
//           data:ans,
//           message:'complimentaryReport generated'
//         });
//       }
//   },
// );

// router.get('/v1/payments/:id/tips',
//   requireAuthorization([
//     ClientRoles.RESTAURANT_OWNER,
//     ClientRoles.RESTAURANT_MANAGER,
//     ClientRoles.RESTAURANT_STAFF
//   ]),
//   async (req: Request, res: Response) => {
//     let { businessId } = req.query;

//     // Adjust timezone as necessary
//     let existingTips = await Payment.find({
//       businessId,
//       tips: { $gt: 0 },
//     }).select('waiterName tips ');
//     const waiterChips: any = {};
//     for (let i = 0; i < existingTips?.length; i++) {
//       const payment = existingTips[i];
//       if (!waiterChips[payment?.waiterName || '']) {
//         waiterChips[payment?.waiterName || ''] = payment?.tips;
//       } else {
//         waiterChips[payment?.waiterName || ''] += payment?.tips;
//       }
//     }
//     let ans: any = [];
//     for (let waiter in waiterChips) {
//       ans.push({
//         waiterName: waiter,
//         tips: waiterChips[waiter],
//       });
//     }

//     return res.send({
//       err:false,
//       data:ans,
//       message:'tips generated'
//     });
// });

// router.get('/v1/payments/:id/tipsByWaiterName',
//   requireAuthorization([
//     ClientRoles.RESTAURANT_OWNER,
//     ClientRoles.RESTAURANT_MANAGER,
//     ClientRoles.RESTAURANT_STAFF
//   ]),
//   async (req: Request, res: Response) => {
//     let { businessId, waiterName, from, to } = req.query;
//     const currentDate = momentTimeZone.tz('Asia/Kolkata');
//     const previousDate = currentDate.subtract(1, 'days');
//     const preDate = previousDate.format('YYYY-MM-DD');
//     let PAGE_SIZE = 20;
//     let pageNumber: any = req?.query?.pageNumber || 1;
//     const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
//     let totalTips = 0;

//     const calculateTotalTips = (payments: any) => {
//       for (let i = 0; i < payments?.length; i++) {
//         let payment = payments[i];
//         totalTips += payment?.tips || 0;
//       }
//       return totalTips;
//     };
//     if (!from && !to) {
//       const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
//       let existingPayments = await Payment.find({
//         businessId,
//         waiterName,
//         tips: { $gt: 0 },
//         date: { $regex: `^${dayAndDate}` },
//       })
//         .skip(skip)
//         .limit(PAGE_SIZE);
//       if (existingPayments?.length == 0) {
//         existingPayments = await Payment.find({
//           businessId,
//           waiterName,
//           tips: { $gt: 0 },
//           date: { $regex: `^${preDate}` },
//         })
//           .skip(skip)
//           .limit(PAGE_SIZE);
//       }
//       const totalTips = calculateTotalTips(existingPayments);

//       return res.send({
//         waiterName,
//         tips: totalTips,
//         data: existingPayments,
//       });
//     }

//     if (from && to) {
//       if (from == to) {
//         const existingPayments = await Payment.find({
//           businessId,
//           waiterName,
//           tips: { $gt: 0 },

//           date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
//         })
//           .skip(skip)
//           .limit(PAGE_SIZE);

//         const totalTips = calculateTotalTips(existingPayments);

//         return res.send({
//           waiterName,
//           tips: totalTips,
//           data: existingPayments,
//         });
//       }
//       let fromDate = new Date(String(from).split('-').reverse().join('-'));

//       fromDate.setUTCHours(0, 0, 0, 0);

//       let toDate = new Date(String(to).split('-').reverse().join('-'));

//       toDate.setUTCHours(23, 59, 59, 999);

//       if (fromDate > toDate) {
//         return res.status(400).send({
//           err:true,
//           data:{},
//           message:'From date cannot be greater than to date.'
//         });
//       }

//       // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
//       const formattedFromDate = fromDate.toISOString().split('T')[0];
//       const formattedToDate = toDate.toISOString().split('T')[0];

//       const filteredPayments = await Payment.find({
//         businessId,
//         waiterName,
//         tips: { $gt: 0 },
//         date: {
//           $gte: formattedFromDate,
//           $lte: formattedToDate,
//         },
//       })
//         .skip(skip)
//         .limit(PAGE_SIZE);

//       const totalTips = calculateTotalTips(filteredPayments);

//       return res.status(200).send({
//         err:false,
//         message:"tips generated",
//         waiterName,
//         tips: totalTips,
//         data: filteredPayments,
//       });
//     }
// });

// router.get('/v1/payments/:id/discount',
//   requireAuthorization([
//     ClientRoles.RESTAURANT_OWNER,
//     ClientRoles.RESTAURANT_MANAGER,
//     ClientRoles.RESTAURANT_STAFF
//   ]),
//   async (req: Request, res: Response) => {
//     let { businessId, from, to } = req.query;
//     const currentDate = momentTimeZone.tz('Asia/Kolkata');
//     const previousDate = currentDate.subtract(1, 'days');
//     const preDate = previousDate.format('YYYY-MM-DD');
//     let PAGE_SIZE = 20;
//     let pageNumber: any = req?.query?.pageNumber || 1;
//     const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

//     let totalDiscount = 0;
//     const calculateDiscount = (payments: any) => {
//       for (let i = 0; i < payments?.length; i++) {
//         let payment = payments[i];
//         totalDiscount += payment?.discount || 0;
//       }

//       return totalDiscount;
//     };

//     if (!from && !to) {
//       const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
//       let existingPayments = await Payment.find({
//         businessId,

//         discount: { $gt: 0 },
//         date: { $regex: `^${dayAndDate}` },
//       })
//         .skip(skip)
//         .limit(PAGE_SIZE);
//       if (existingPayments?.length == 0) {
//         existingPayments = await Payment.find({
//           businessId,
//           discount: { $gt: 0 },
//           date: { $regex: `^${preDate}` },
//         })
//           .skip(skip)
//           .limit(PAGE_SIZE);
//       }

//       const totalDiscount = calculateDiscount(existingPayments);

//       return res.status(200).send({
//         err:false,
//         message:'discount generated',
//         totalDiscount,
//         data: existingPayments,
//       });
//     }

//     if (from && to) {
//       if (from == to) {
//         const existingPayments = await Payment.find({
//           businessId,

//           discount: { $gt: 0 },

//           date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
//         })
//           .skip(skip)
//           .limit(PAGE_SIZE);
//         const totalDiscount = calculateDiscount(existingPayments);

//         return res.status(200).send({
//           err:false,
//           message:'discount generated',
//           totalDiscount,
//           data: existingPayments,
//         });
//       }
//       let fromDate = new Date(String(from).split('-').reverse().join('-'));

//       fromDate.setUTCHours(0, 0, 0, 0);

//       let toDate = new Date(String(to).split('-').reverse().join('-'));

//       toDate.setUTCHours(23, 59, 59, 999);

//       if (fromDate > toDate) {
//         return res.status(400).send({
//           err:true,
//           data:{},
//           message:'From date cannot be greater than to date.'
//         });
//       }

//       // Format the dates to match the format used in your database (e.g., 'YYYY-MM-DD')
//       const formattedFromDate = fromDate.toISOString().split('T')[0];
//       const formattedToDate = toDate.toISOString().split('T')[0];

//       const filteredPayments = await Payment.find({
//         businessId,
//         discount: { $gt: 0 },
//         date: {
//           $gte: formattedFromDate,
//           $lte: formattedToDate,
//         },
//       })
//         .skip(skip)
//         .limit(PAGE_SIZE);
//       const totalDiscount = calculateDiscount(filteredPayments);

//       return res.status(200).send({
//         err:false,
//         message:'discount generated',
//         totalDiscount,
//         data: filteredPayments,
//       });
//     }
// });

// const startOfToday = new Date();
// startOfToday.setHours(0, 0, 0, 0);
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

// get single review
router.get(
  '/v1/payments/:id/reviews/:reviewsId',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { reviewsId } = req.params;

    const review = await Reviews.findById(reviewsId);
    if (!review) {
      return res.status(404).send({ err: true, data: {}, message: 'Review not found' });
    }

    return res.send({
      err: false,
      data: review,
      message: 'review generated',
    });
  },
);

// get all reviews
router.get(
  '/v1/payments/:id/reviews',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let businessId = req.query.businessId as string;
    let { from, to } = req.query;
    let fromDate = Number(from);
    let toDate = Number(to);
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!businessId) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId is required' });
    }

    if (!from && !to) {
      const reviews = await Reviews.find({
        businessId,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      })
        .select(reviewsFields.join(' '))
        .skip(skip)
        .limit(PAGE_SIZE);

      return res.send({
        err: false,
        data: reviews,
        message: 'reviews generated',
      });
    }

    if (from && to) {
      if (fromDate > toDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }
      const reviews = await Reviews.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
        .select(reviewsFields.join(' '))
        .skip(skip)
        .limit(PAGE_SIZE);

      return res.send({
        err: false,
        data: reviews,
        message: 'reviews generated',
      });
    }

    return res.status(400).send({
      err: true,
      data: {},
      message: 'Invalid query parameters',
    });
  },
);

// get single customer
router.get(
  '/v1/payments/:id/customer/:customerId',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { customerId } = req.params;

    const customer = await ReviewsCustomer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ err: true, data: {}, message: 'customer not found' });
    }

    return res.send({
      err: false,
      data: customer,
      message: 'customer generated',
    });
  },
);

// Retrieves a list of customers based on the provided filters.
const filterCustomers = async (from: number, to: number, businessId: string, skip: number, PAGE_SIZE: number) => {
  const customer = await ReviewsCustomer.find({
    businessId: businessId,
    date: {
      $gte: from,
      $lte: to,
    },
  })
    .select('name phone businessId date')
    .skip(skip)
    .limit(PAGE_SIZE);

  return customer;
};

// get all customers
router.get(
  '/v1/payments/:id/customers',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let businessId = req.query.businessId as string;
    let { from, to, findUser } = req.query;
    let fromDate = Number(from);
    let toDate = Number(to);
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!businessId) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId is required' });
    }

    if (findUser) {
      const customers = await ReviewsCustomer.findOne({
        businessId,
        phone: findUser,
      });

      if (!customers) {
        return res.status(404).send({ err: true, data: {}, message: 'Customer not found' });
      }

      return res.send({
        err: false,
        data: customers,
        message: 'customer generated',
      });
    }

    if (!from && !to) {
      const customers = await ReviewsCustomer.find({
        businessId,
        date: {
          $gte: startOfToday.getTime(),
          $lte: endOfToday.getTime(),
        },
      })
        .select('name phone businessId date')
        .skip(skip)
        .limit(PAGE_SIZE);

      return res.send({
        err: false,
        data: customers,
        message: 'customers generated',
      });
    }

    if (from && to) {
      if (fromDate > toDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }
      const customers = await filterCustomers(fromDate, toDate, businessId, skip, PAGE_SIZE);

      return res.send({
        err: false,
        data: customers,
        message: 'customers generated',
      });
    }

    return res.status(400).send({
      err: true,
      data: {},
      message: 'Invalid query parameters',
    });
  },
);

// Filters customers and payments based on a date range and returns statistics.
const filterBasedOnDate = async (from: number, to: number, businessId: string) => {
  const totalCustomers = await ReviewsCustomer.find({ businessId }).count();
  const [customerStats] = await ReviewsCustomer.aggregate([
    {
      $match: {
        businessId: businessId,
        date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        repeatCustomers: {
          $sum: {
            $cond: [{ $gt: ['$count', 1] }, 1, 0],
          },
        },
        newCustomers: {
          $sum: {
            $cond: [
              {
                $or: [{ $eq: ['$count', 1] }, { $gte: ['$date', startOfToday] }, { $lte: ['$date', endOfToday] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const latestCustomers = await ReviewsCustomer.find({ businessId }).select('name phone businessId date').sort({ date: -1 }).limit(5);

  const paymentStats = await Payment.aggregate([
    {
      $match: {
        businessId: businessId,

        payment_date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTicketValue = paymentStats.length > 0 ? Math.round(paymentStats[0].total / paymentStats[0].count) : 0;

  const obj = {
    totalCustomers,
    avgTicketValue,
    visitPerDay: paymentStats.length > 0 ? paymentStats[0].count : 0,
    repeatCustomers: customerStats?.repeatCustomers || 0,
    newCustomers: customerStats?.newCustomers || 0,
    Customers: latestCustomers,
  };

  return obj;
};

// Retrieves payments based on the specified date range and business ID.
// router.get(
//   '/v1/payments/:id/userDashboard',
//   requireAuthorization([
//     ClientRoles.RESTAURANT_OWNER,
//     ClientRoles.RESTAURANT_MANAGER,
//     ClientRoles.RESTAURANT_STAFF
//   ]),
//   async (req: Request, res: Response) => {
//       let { from, to } = req.query;
//       let fromDate = Number(from);
//       let toDate = Number(to);

//       const businessId = req.query.businessId as string;
//       if (!businessId) {
//         return res.status(400).send({ err:true, data:{},message: 'businessId is required' });
//       }
//       if (!from && !to) {
//         const obj = await filterBasedOnDate(startOfToday.getTime(), endOfToday.getTime(), businessId);

//         return res.send(obj);
//       }
//       if (from && to) {
//         if (fromDate > toDate) {
//           return res.status(400).send({
//             err:true,
//             data:{},
//             message:'From date cannot be greater than to date.'

//           });
//         }
//         const obj = await filterBasedOnDate(fromDate, toDate, businessId);

//         return res.send({
//           err:false,
//           data:obj,
//           message:'userDashboard generated'

//         });
//       }

//       return res.status(400).send({
//         err:true,
//         data:{},
//         message:'Invalid query parameters'

//       });
//       return res.status(500).send({ err:true, data:{},message: error.message });
//   },
// );

// Retrieves a list of customers who visited the restaurant today.
router.get(
  '/v1/payments/:id/newCustomer',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
    if (!businessId) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId is required' });
    }
    const newCustomers = await ReviewsCustomer.find({
      businessId,
      date: {
        $gte: startOfToday.getTime(),
        $lte: endOfToday.getTime(),
      },
      count: 1,
    })
      .select('name phone businessId date')
      .skip(skip)
      .limit(PAGE_SIZE);

    return res.send({
      err: false,
      data: newCustomers,
      message: 'newCustomer generated',
    });
  },
);

// Retrieves payment statistics for a specific business and customer phone number
router.get(
  '/v1/payments/:id/billsByUser',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { businessId, phone } = req.query;

    if (!businessId || !phone) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId and phone is required' });
    }

    const paymentStats = await Payment.aggregate([
      {
        $match: {
          businessId,
          customerPhone: { $in: [phone, `91${phone}`] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgTicketValue = paymentStats.length > 0 ? Math.round(paymentStats[0].total / paymentStats[0].count) : 0;

    const reviewsCount = await Reviews.countDocuments({
      businessId,
      reviewerPhone: { $in: [phone, `91${phone}`] },
    });

    const latestBills = await Payment.find({
      businessId,
      customerPhone: { $in: [phone, `91${phone}`] },
    })
      .select(fields.join(' '))
      .sort({ payment_date: -1 })
      .limit(5);

    const latestReviews = await Reviews.find({
      businessId,
      reviewerPhone: { $in: [phone, `91${phone}`] },
    })
      .select(reviewsFields.join(' '))
      .sort({ date: -1 })
      .limit(5);

    const obj = {
      customerName: latestBills[0]?.customerName,
      phone,
      avgTicketValue,
      visitPerDay: paymentStats.length > 0 ? paymentStats[0].count : 0,
      reviews: reviewsCount,
      latestBills,
      latestReviews,
    };

    return res.send({
      err: false,
      data: obj,
      message: 'billsByUser generated',
    });
  },
);

// Retrieves the payment bills for a specific business and customer phone number.
router.get(
  '/v1/payments/:id/customerBills',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { businessId, phone, name } = req.query;
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!businessId || !phone) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId and phone is required' });
    }

    const bills = await Payment.find({
      businessId,
      customerPhone: { $in: [phone, `91${phone}`] },
    })
      .select(fields.join(' '))
      .skip(skip)
      .limit(PAGE_SIZE);

    return res.status(200).send({ data: {}, err: false, customerName: bills[0]?.customerName || name, bills });
  },
);

// Retrieves reviews from the database based on the provided criteria.
router.get(
  '/v1/payments/:id/customerReviews',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    const { businessId, phone, name } = req.query;
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!businessId || !phone) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId and phone is required' });
    }

    const reviews = await Reviews.find({
      businessId,
      reviewerPhone: { $in: [phone, `91${phone}`] },
    })
      .select(reviewsFields.join(' '))
      .skip(skip)
      .limit(PAGE_SIZE);

    return res.status(200).send({
      err: false,
      data: {
        customerName: reviews[0]?.reviewerName || name,
        reviews,
      },
      customerName: reviews[0]?.reviewerName || name,
      reviews,
    });
  },
);

//Filters reviews by date range and calculates various statistics.
const filterReviewsByDate = async (from: number, to: number, businessId: string) => {
  const reviewsState = await Reviews.aggregate([
    {
      $match: {
        businessId: businessId,
        date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        reviewRating: { $sum: '$reviewRating' },
        count: { $sum: 1 },
        positiveRatingCount: {
          $sum: {
            $cond: [{ $gt: ['$reviewRating', 2] }, 1, 0],
          },
        },
        negativeRatingCount: {
          $sum: {
            $cond: [{ $lt: ['$reviewRating', 2] }, 1, 0],
          },
        },
      },
    },
  ]);

  const avgRating = reviewsState.length > 0 ? Math.round(reviewsState[0].reviewRating / reviewsState[0].count) : 0;

  const obj = {
    reviewCount: reviewsState.length > 0 ? reviewsState[0].count : 0,
    avgRating,
    positiveRatingCount: reviewsState.length > 0 ? reviewsState[0].positiveRatingCount : 0,
    negativeRatingCount: reviewsState.length > 0 ? reviewsState[0].negativeRatingCount : 0,
  };

  return obj;
};

// Calculates the review statistics for a given time range and business ID.

const calculateReviewStatistics = async (from: number, to: number, businessId: string) => {
  const reviewsState = await Reviews.aggregate([
    {
      $match: {
        businessId: businessId,
        date: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: null,
        reviewRating: { $sum: '$reviewRating' },
        count: { $sum: 1 },
        positiveRatingCount: {
          $sum: {
            $cond: [{ $gt: ['$reviewRating', 2] }, 1, 0],
          },
        },
        negativeRatingCount: {
          $sum: {
            $cond: [{ $lt: ['$reviewRating', 2] }, 1, 0],
          },
        },
      },
    },
  ]);

  const totalReviewsCount = reviewsState.length > 0 ? reviewsState[0].count : 0;
  const positivePercentage = totalReviewsCount > 0 ? (reviewsState[0].positiveRatingCount / totalReviewsCount) * 100 : 0;
  const negativePercentage = totalReviewsCount > 0 ? (reviewsState[0].negativeRatingCount / totalReviewsCount) * 100 : 0;

  const obj = {
    totalReviewCount: reviewsState.length > 0 ? reviewsState[0].reviewRating : 0,
    count: reviewsState.length > 0 ? reviewsState[0].count : 0,
    positiveRatingCount: reviewsState.length > 0 ? reviewsState[0].positiveRatingCount : 0,
    negativeRatingCount: reviewsState.length > 0 ? reviewsState[0].negativeRatingCount : 0,
    positivePercentage,
    negativePercentage,
  };

  return obj;
};

// Calculates the start and end of a specific day based on the number of days ago and a base date.
function calculateStartAndEndOfDay(daysAgo: number, baseDate: Date) {
  const startOfDay = new Date(baseDate.getTime());
  startOfDay.setDate(startOfDay.getDate() - daysAgo);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(baseDate.getTime());
  endOfDay.setDate(endOfDay.getDate() - daysAgo);
  endOfDay.setHours(23, 59, 59, 999);

  return { start: startOfDay.getTime(), end: endOfDay.getTime() };
}

//Retrieves the reviews filtered by the current day.
router.get(
  '/v1/payments/:id/reviewsDashboard',
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_STAFF]),
  async (req: Request, res: Response) => {
    let { from, to } = req.query;
    let startDate = Number(from);
    let endDate = Number(to);

    const businessId = req.query.businessId as string;
    if (!businessId) {
      return res.status(400).send({ err: true, data: {}, message: 'businessId is required' });
    }

    const latestReviews = await Reviews.find({
      businessId,
    })
      .select(reviewsFields.join(' '))
      .sort({ date: -1 })
      .limit(5);

    if (!from && !to) {
      const currentDayReviews = await filterReviewsByDate(startOfToday.getTime(), endOfToday.getTime(), businessId);

      const dailyReviewAnalysis: any = {};
      const currentDate = new Date(); // Use today's date as the base date

      for (let i = 0; i <= 6; i++) {
        const { start, end } = calculateStartAndEndOfDay(i, currentDate);
        const dayKey = i === 0 ? 'today' : `before${i}day`;
        dailyReviewAnalysis[dayKey] = await calculateReviewStatistics(start, end, businessId);
      }

      return res.send({
        data: currentDayReviews,
        dailyReviewAnalysis: Object.values(dailyReviewAnalysis),
        latestReviews,
      });
    }
    if (from && to) {
      if (startDate > endDate) {
        return res.status(400).send({
          err: true,
          data: {},
          message: 'From date cannot be greater than to date.',
        });
      }
      const reviewStatistics = await filterReviewsByDate(startDate, endDate, businessId);

      const dailyReviewAnalysis: any = {};
      const baseDate = new Date(endDate); // Convert timestamp to Date object

      for (let i = 0; i <= 6; i++) {
        const { start, end } = calculateStartAndEndOfDay(i, baseDate);
        const dayKey = i === 0 ? 'today' : `before${i}day`;
        dailyReviewAnalysis[dayKey] = await calculateReviewStatistics(start, end, businessId);
      }

      return res.send({
        data: reviewStatistics,
        dailyReviewAnalysis: Object.values(dailyReviewAnalysis),
        latestReviews,
      });
    }

    return res.status(400).send({
      err: true,
      data: {},
      message: 'Invalid query parameters',
    });
  },
);
router.get(
  '/v1/payments/:pid/getBill',
  validateRequest({
    params: paramsSchema,
  }),
  async (req: Request, res: Response) => {
    const { businessId, tableName } = req.query;
    const billExist = await TempBill.findOne({ businessId: businessId, tableName: tableName });
    if (!billExist) {
      return res.status(404).send({ err: true, data: {}, message: 'Bill not found' });
    }

    return res.send({
      err: false,
      data: billExist,
      message: 'Bill generated',
    });
  },
);

router.get(
  '/v1/payments/:id/testing',

  async (req: Request, res: Response) => {
    const { businessId, tableName } = req.query;

    // const billExist = await TempBill.findOne({ businessId: businessId, tableName: tableName });
    // if (!billExist) {
    //   return res.status(404).send({ err: true, data: {}, message: 'Bill not found' });
    // }

    return res.send({
      err: false,
      data: {},
      message: 'Testing',
    });
  },
);
export { router as readPaymentsRouter };

const data = [
  {
    _id: {
      $oid: '667d98681ebb2de62f90ad7d',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 90,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: 'xrty-T-2',
    order_id: {
      $oid: '667d98621ebb2de62f90ad78',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrD2XQn2QTZ2t',
    razorpayOrderId: 'order_ORrCy1lf25ZQgr',
    claimedCoins: 10,
    razorpayAcquirerData: {
      rrn: '580747062095',
      upi_transaction_id: 'C80EF6DD05A4E5F03577D21793B4A7FA',
    },
    razorpayEventId: 'ORrD4HEkltnvN0',
    createdAt: {
      $date: '2024-06-27T16:50:48.013Z',
    },
    updatedAt: {
      $date: '2024-06-27T16:50:48.013Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667d9ce71ebb2de62f90ae5f',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 720,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 900,
    tableName: 'xrty-T-2',
    order_id: {
      $oid: '667d9ca71ebb2de62f90ae4d',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrXJdaZbB6rzv',
    razorpayOrderId: 'order_ORrWDEoRfa69LX',
    claimedCoins: 180,
    razorpayAcquirerData: {
      rrn: '642377045600',
      upi_transaction_id: 'FBBCCA798F646523E20B02F56D278D98',
    },
    razorpayEventId: 'ORrXL3kkaGT0hT',
    createdAt: {
      $date: '2024-06-27T17:09:59.521Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:09:59.521Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667d9ea11ebb2de62f90aece',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 1200,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1200,
    tableName: '12333',
    order_id: {
      $oid: '667d9e9b7000d8c407f33768',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrf6lMRgo6Eyn',
    razorpayOrderId: 'order_ORrf1bFQCCO6z7',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '825605346653',
      upi_transaction_id: '382687D93A52A802BA9A79EEB01470C0',
    },
    razorpayEventId: 'ORrf83z5jD65C8',
    createdAt: {
      $date: '2024-06-27T17:17:21.899Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:17:21.899Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667d9fa61ebb2de62f90af23',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 6000,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 6000,
    tableName: 'xrty-T-3',
    order_id: {
      $oid: '667d9f9e1ebb2de62f90af1b',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrjgpVNCYvsAB',
    razorpayOrderId: 'order_ORrjZTfhgZ6cqC',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '961784424545',
      upi_transaction_id: '0A75D6DE9B36B3773BAE79C545A33221',
    },
    razorpayEventId: 'ORrjiFZIXK3Jn6',
    createdAt: {
      $date: '2024-06-27T17:21:42.387Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:21:42.387Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667da1781ebb2de62f90af9d',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 800,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 900,
    tableName: 'xrty-T-3',
    order_id: {
      $oid: '667da16d1ebb2de62f90af98',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrrtyYY8gmd2D',
    razorpayOrderId: 'order_ORrriwj9GbWRnw',
    claimedCoins: 100,
    razorpayAcquirerData: {
      rrn: '863880827502',
      upi_transaction_id: 'B36A2BC7B630296C2D61994A6D23BD8E',
    },
    razorpayEventId: 'ORrrvXCrSdRdhy',
    createdAt: {
      $date: '2024-06-27T17:29:28.992Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:29:28.992Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667da1fb1ebb2de62f90afc2',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 752,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 752,
    tableName: '008',
    order_id: {
      $oid: '667da1f37000d8c407f3376b',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORruCIo4V6wXH9',
    razorpayOrderId: 'order_ORru61UPeF6JEx',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '312856177594',
      upi_transaction_id: '6641A5D5258D4958410B9A767AB34D6F',
    },
    razorpayEventId: 'ORruE4vlcn32Ah',
    createdAt: {
      $date: '2024-06-27T17:31:39.541Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:31:39.541Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667da21b1ebb2de62f90afd9',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 100,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: 'xrty-T-3',
    order_id: {
      $oid: '667da2091ebb2de62f90afd2',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrulAKG2vsfd9',
    razorpayOrderId: 'order_ORruTMe5ZBrcA4',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '138893585772',
      upi_transaction_id: '47B12061CF9CF7D55A26773884FC08E4',
    },
    razorpayEventId: 'ORrumbHCVrUHB8',
    createdAt: {
      $date: '2024-06-27T17:32:11.032Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:32:11.032Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667da2511ebb2de62f90aff6',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 666,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 666,
    tableName: 'xrty-T-3',
    order_id: {
      $oid: '667da23f1ebb2de62f90afef',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORrviEJldxVGAv',
    razorpayOrderId: 'order_ORrvR4WqrktZuA',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '915805342578',
      upi_transaction_id: 'C0058881B0C2FB84747BCA2344C55B83',
    },
    razorpayEventId: 'ORrvjbLv764Znx',
    createdAt: {
      $date: '2024-06-27T17:33:05.218Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:33:05.218Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667da4d61ebb2de62f90b044',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 100,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: 'xrty-T-3',
    order_id: {
      $oid: '667da3461ebb2de62f90b019',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORs74o5qh3X2tf',
    razorpayOrderId: 'order_ORs03pOOa2kTnj',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '902653750363',
      upi_transaction_id: 'F37111CFB9FE2E3C13925681D9831227',
    },
    razorpayEventId: 'ORs767w913Ov63',
    createdAt: {
      $date: '2024-06-27T17:43:50.516Z',
    },
    updatedAt: {
      $date: '2024-06-27T17:43:50.516Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667daa3b1ebb2de62f90b087',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 602,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 752,
    tableName: '17272',
    order_id: {
      $oid: '667daa3138afe75014654b83',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORsVNLGicKksNF',
    razorpayOrderId: 'order_ORsVGkiPUXg3BU',
    claimedCoins: 150,
    razorpayAcquirerData: {
      rrn: '231195038733',
      upi_transaction_id: 'D8A25398D9AEE4529A67B3D060F8CCB8',
    },
    razorpayEventId: 'ORsVOrqpuMrLyF',
    createdAt: {
      $date: '2024-06-27T18:06:51.156Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:06:51.156Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dab6b1ebb2de62f90b099',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 4800,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 5000,
    tableName: '2222',
    order_id: {
      $oid: '667dab6238afe75014654b86',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORsajfPdsglHdt',
    razorpayOrderId: 'order_ORsaditXFuKY0t',
    claimedCoins: 200,
    razorpayAcquirerData: {
      rrn: '802244655107',
      upi_transaction_id: '1ED9EB825FA44231C18AB530668D8B95',
    },
    razorpayEventId: 'ORsal78QOyqhUv',
    createdAt: {
      $date: '2024-06-27T18:11:55.229Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:11:55.229Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667daf1a1ebb2de62f90b0ab',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 7900,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 8000,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667daf0f38afe75014654b9d',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORsrKvkht8OPsV',
    razorpayOrderId: 'order_ORsrDtSuw0S5Kk',
    claimedCoins: 100,
    razorpayAcquirerData: {
      rrn: '755129959439',
      upi_transaction_id: 'D6EC55D51E03DD4614E6825E46CEC6D1',
    },
    razorpayEventId: 'ORsrMLOnqLzXvB',
    createdAt: {
      $date: '2024-06-27T18:27:38.366Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:27:38.366Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667daf9a1ebb2de62f90b0bd',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 8902,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 9000,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667daf8f38afe75014654ba0',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORstaeeVU3OUDV',
    razorpayOrderId: 'order_ORstSsmUjxinPg',
    claimedCoins: 98,
    razorpayAcquirerData: {
      rrn: '395809025657',
      upi_transaction_id: '8449F8A7A1E9F9FF67AD59D6A7A9608D',
    },
    razorpayEventId: 'ORstc9VwaaQglb',
    createdAt: {
      $date: '2024-06-27T18:29:46.484Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:29:46.484Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db0c71ebb2de62f90b0cf',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 9000,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 9000,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db0bd38afe75014654ba3',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORsysq0zVmPbB0',
    razorpayOrderId: 'order_ORsyn5D3f0OKA1',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '922727317090',
      upi_transaction_id: '02F9BD9CF75711BACC6BD7F30BEC03E6',
    },
    razorpayEventId: 'ORsyuGqBzMOBte',
    createdAt: {
      $date: '2024-06-27T18:34:47.054Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:34:47.054Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db1c31ebb2de62f90b0dd',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 5000,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 5000,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db1ba38afe75014654ba6',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORt3KljjZtcbYl',
    razorpayOrderId: 'order_ORt3FBl4NVt7fy',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '775917752178',
      upi_transaction_id: '26E138B97916FAD7BF21260B570A3E18',
    },
    razorpayEventId: 'ORt3MOoh3L4tR5',
    createdAt: {
      $date: '2024-06-27T18:38:59.979Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:38:59.979Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db2b41ebb2de62f90b0eb',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 55555,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 55555,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db2ad38afe75014654ba9',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORt7Zo7979iTNo',
    razorpayOrderId: 'order_ORt7VhSQURm5Fl',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '140494312972',
      upi_transaction_id: '7CF720DD43453728DE9082548B2D3B04',
    },
    razorpayEventId: 'ORt7bFAVCHHjEV',
    createdAt: {
      $date: '2024-06-27T18:43:00.757Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:43:00.757Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db30d1ebb2de62f90b0f9',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 5555,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 5555,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db2f438afe75014654bac',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORt98IvnjYby73',
    razorpayOrderId: 'order_ORt8lBjGfK3aKy',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '915938605355',
      upi_transaction_id: 'B78111151133682F0AE6A7C13D1C13E7',
    },
    razorpayEventId: 'ORt9APKKTcBwoc',
    createdAt: {
      $date: '2024-06-27T18:44:29.784Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:44:29.784Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db35a1ebb2de62f90b107',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 7878,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 7878,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db35038afe75014654baf',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtAUglZydtSTN',
    razorpayOrderId: 'order_ORtAOC7KbdP2rq',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '209266773151',
      upi_transaction_id: '7DB3924D634B0D95CF8EE4E1CB97A861',
    },
    razorpayEventId: 'ORtAW3eHYiGkrN',
    createdAt: {
      $date: '2024-06-27T18:45:46.291Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:45:46.291Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db4021ebb2de62f90b115',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 8888,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 8888,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db3ef38afe75014654bb2',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtDS1WlDnSAsZ',
    razorpayOrderId: 'order_ORtDC0IhtLoIho',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '149525709614',
      upi_transaction_id: 'C95FFAFC32A6BFBCB3DDADC3EE163054',
    },
    razorpayEventId: 'ORtDTOBohck2Ap',
    createdAt: {
      $date: '2024-06-27T18:48:34.253Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:48:34.253Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db4591ebb2de62f90b123',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 8959,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 8959,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db45138afe75014654bb5',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtEzZ5axd2ZJ2',
    razorpayOrderId: 'order_ORtEutnBi4xQtd',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '171474213792',
      upi_transaction_id: 'F595C6E765DEF786D55F3F1372A9BA92',
    },
    razorpayEventId: 'ORtF0xmmuyNlm2',
    createdAt: {
      $date: '2024-06-27T18:50:01.800Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:50:01.800Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db4d81ebb2de62f90b131',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 7858,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 7858,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db48d38afe75014654bb8',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtHDn9WkzyQzE',
    razorpayOrderId: 'order_ORtFyFXCcuSHlh',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '242992203305',
      upi_transaction_id: 'A96ABE7E5CA9C22D04D3D37491363CE6',
    },
    razorpayEventId: 'ORtHFKNGdENfMz',
    createdAt: {
      $date: '2024-06-27T18:52:08.567Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:52:08.567Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db6a51ebb2de62f90b13f',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 8509,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 8509,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db4fc38afe75014654bbb',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtPKSWPHD97Dm',
    razorpayOrderId: 'order_ORtHvBnsE6OAUK',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '790945464327',
      upi_transaction_id: 'BDAF5E43C81C7D453C6381B5A7EAACBA',
    },
    razorpayEventId: 'ORtPLqE3qv6NUv',
    createdAt: {
      $date: '2024-06-27T18:59:49.077Z',
    },
    updatedAt: {
      $date: '2024-06-27T18:59:49.077Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db7191ebb2de62f90b14d',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 7412,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 7412,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db70338afe75014654bbe',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtRO3uID3yQth',
    razorpayOrderId: 'order_ORtR3wPqdXDHIp',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '239202099586',
      upi_transaction_id: '0AC0CB4A0842CC4602FCD23523CE858A',
    },
    razorpayEventId: 'ORtRPU7OCw7j23',
    createdAt: {
      $date: '2024-06-27T19:01:45.903Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:01:45.903Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db7441ebb2de62f90b15b',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 4522,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 4522,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db73438afe75014654bc1',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtS8B5Ez2ZSf5',
    razorpayOrderId: 'order_ORtRvYPXL0scHF',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '655214981970',
      upi_transaction_id: '1DB3F9E63DCF6404696D580EAE469178',
    },
    razorpayEventId: 'ORtS9jymng4IFf',
    createdAt: {
      $date: '2024-06-27T19:02:28.383Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:02:28.383Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667db8871ebb2de62f90b16d',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 6143,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 6263,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667db84a38afe75014654bc7',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORtXpG9xgPFoPY',
    razorpayOrderId: 'order_ORtWp5HsOC9ALq',
    claimedCoins: 120,
    razorpayAcquirerData: {
      rrn: '688299021299',
      upi_transaction_id: '593A7E08EEAF5331C789205826061EB4',
    },
    razorpayEventId: 'ORtXqc6wv1zGh5',
    createdAt: {
      $date: '2024-06-27T19:07:51.518Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:07:51.518Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dbde81ebb2de62f90b1fb',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 80,
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: 'xrty-T-1',
    tips: 0,
    razorpayPaymentId: 'pay_ORtw3lNedj18su',
    razorpayOrderId: 'order_ORl4Fg4l2T0wxI',
    claimedCoins: 20,
    razorpayAcquirerData: {
      rrn: '819939604042',
      upi_transaction_id: 'D48C0288D3DA48312D60E5358AF7606E',
    },
    razorpayEventId: 'ORtw5s6Al0G3J7',
    createdAt: {
      $date: '2024-06-27T19:30:48.894Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:30:48.894Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dbed61ebb2de62f90b23b',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 100,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667dbeac1ebb2de62f90b22c',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORu0FUy6KuF2wF',
    razorpayOrderId: 'order_ORtzXBPEQV7UVG',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '841170328550',
      upi_transaction_id: 'FA24735B0F08C87B59B2FA260CCA60AA',
    },
    razorpayEventId: 'ORu0H59EpXouta',
    createdAt: {
      $date: '2024-06-27T19:34:46.432Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:34:46.432Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dbf811ebb2de62f90b266',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 780,
    mode: 'upi',
    paymentMode: 'online',
    billValue: 780,
    tableName: 'xrty-T-1',
    tips: 0,
    razorpayPaymentId: 'pay_ORu3GG6Jnf1cLh',
    razorpayOrderId: 'order_ORnCBQbwnVGkUJ',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '853032759548',
      upi_transaction_id: '908B8878C6E9DBED87030251FDEFB2F4',
    },
    razorpayEventId: 'ORu3HvDKrCWJbJ',
    createdAt: {
      $date: '2024-06-27T19:37:37.369Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:37:37.369Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dbfef1ebb2de62f90b282',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 100,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667dbfe61ebb2de62f90b27d',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORu5CqtCFDJQqw',
    razorpayOrderId: 'order_ORu54XuapqmaAw',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '495903984544',
      upi_transaction_id: 'F651016ECB6D08377CB88948ADBE5533',
    },
    razorpayEventId: 'ORu5EDNHmJfZA3',
    createdAt: {
      $date: '2024-06-27T19:39:27.685Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:39:27.685Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc0351ebb2de62f90b29f',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 258,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 258,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667dc02d1ebb2de62f90b29a',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORu6RO4QvqWQ5H',
    razorpayOrderId: 'order_ORu6KECdrWInjJ',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '676068306880',
      upi_transaction_id: 'B019BCBD63D2CA903DD67448590AF154',
    },
    razorpayEventId: 'ORu6SfqzwNWBck',
    createdAt: {
      $date: '2024-06-27T19:40:37.760Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:40:37.760Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc0951ebb2de62f90b2c1',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719412843704',
    },
    total: 568,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 568,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667dc08e1ebb2de62f90b2bb',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORu881d9D2E0CX',
    razorpayOrderId: 'order_ORu81M01hvmzlJ',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '762394705885',
      upi_transaction_id: '32FF2CE6D49BF3F80BE0ADBA9C34576A',
    },
    razorpayEventId: 'ORu89JF3hTKMba',
    createdAt: {
      $date: '2024-06-27T19:42:13.638Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:42:13.638Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc3fe3caf1231355ddbf4',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719517967448',
    },
    total: 1000,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1000,
    tableName: '2222',
    order_id: {
      $oid: '667dc3db3caf1231355ddbed',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORuNXMRXj2mEGH',
    razorpayOrderId: 'order_ORuMwrXN20PGRw',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '826499059460',
      upi_transaction_id: '2852008AE92D42B17C0A64F9CA5FE24C',
    },
    razorpayEventId: 'ORuNYgbSQTYqHD',
    createdAt: {
      $date: '2024-06-27T19:56:46.172Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:56:46.172Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc44e3caf1231355ddc17',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719517967448',
    },
    total: 544,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 544,
    tableName: '2222',
    order_id: {
      $oid: '667dc4473caf1231355ddc10',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORuOwnamn5AlFl',
    razorpayOrderId: 'order_ORuOqslLoak7rd',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '482758834937',
      upi_transaction_id: '88BCF6BFCA78082773F1E64FC8E03749',
    },
    razorpayEventId: 'ORuOyEMdEIQ1nA',
    createdAt: {
      $date: '2024-06-27T19:58:06.371Z',
    },
    updatedAt: {
      $date: '2024-06-27T19:58:06.371Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc4f23caf1231355ddc47',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719517967448',
    },
    total: 90000,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 90000,
    tableName: '2222',
    order_id: {
      $oid: '667dc4a23caf1231355ddc35',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORuRpw0Xp3BEIe',
    razorpayOrderId: 'order_ORuQSIqLC3aYaM',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '694788444152',
      upi_transaction_id: '1EB4B1024C8F2C4C1778E33F9C3F0F98',
    },
    razorpayEventId: 'ORuRrNUn9v3F7p',
    createdAt: {
      $date: '2024-06-27T20:00:50.486Z',
    },
    updatedAt: {
      $date: '2024-06-27T20:00:50.486Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc5f13caf1231355ddc83',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719517967448',
    },
    total: 70000,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 70000,
    tableName: '2222',
    order_id: {
      $oid: '667dc5873caf1231355ddc73',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORuWKhYA5fo7In',
    razorpayOrderId: 'order_ORuUUXYOTPvUif',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '839296475261',
      upi_transaction_id: 'F75E83DCD59F8E323F9162C4CAFDE760',
    },
    razorpayEventId: 'ORuWLwlRmMsK3B',
    createdAt: {
      $date: '2024-06-27T20:05:05.685Z',
    },
    updatedAt: {
      $date: '2024-06-27T20:05:05.685Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc7323caf1231355ddcc6',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719517967448',
    },
    total: 777,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 777,
    tableName: '2222',
    order_id: {
      $oid: '667dc72d3caf1231355ddcc1',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORubz27h2yGtgv',
    razorpayOrderId: 'order_ORubuFi2Lhv89s',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '286303985168',
      upi_transaction_id: '5C35DE07A41CD0437793305500886A63',
    },
    razorpayEventId: 'ORuc0RVTyxqAdr',
    createdAt: {
      $date: '2024-06-27T20:10:26.777Z',
    },
    updatedAt: {
      $date: '2024-06-27T20:10:26.777Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dc7c73caf1231355ddcf0',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719517967448',
    },
    total: 100,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 100,
    tableName: '2222',
    order_id: {
      $oid: '667dc7bf3caf1231355ddcec',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORuea9PwP8vrqK',
    razorpayOrderId: 'order_ORueU4tgVEQAvu',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '996726799695',
      upi_transaction_id: 'EBD5F5C85E297CC99D7730FA4D47A34E',
    },
    razorpayEventId: 'ORuecJTF0yIi7L',
    createdAt: {
      $date: '2024-06-27T20:12:55.064Z',
    },
    updatedAt: {
      $date: '2024-06-27T20:12:55.064Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd4031bce82fe37454060',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 2,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 2,
    tableName: 'xrty-T-1',
    order_id: {
      $oid: '667dd3e41bce82fe3745405b',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvXJS6zokyZMu',
    razorpayOrderId: 'order_ORvXBJNqgmiguV',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418008944336',
    },
    razorpayEventId: 'ORvXi4yjCWqRdz',
    createdAt: {
      $date: '2024-06-27T21:05:07.203Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:05:07.203Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd4651bce82fe37454077',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 3,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 3,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667dd4501bce82fe37454072',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvZCuoWXJwlwD',
    razorpayOrderId: 'order_ORvZ4lnCYBBvky',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418014820608',
      upi_transaction_id: 'ICId7e924bb793b488395ed2e6ccd726abc',
    },
    razorpayEventId: 'ORvZRN6V8T8onI',
    createdAt: {
      $date: '2024-06-27T21:06:45.406Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:06:45.406Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd4951bce82fe37454088',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 3,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 3,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667dd4731bce82fe37454084',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvZuRUMHVXhMj',
    razorpayOrderId: 'order_ORvZgjvDtDRa0E',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418080925069',
      upi_transaction_id: 'ICIaec39f8dc36c4cb7913a9f9ca7999df4',
    },
    razorpayEventId: 'ORvaIJMG3rgW6z',
    createdAt: {
      $date: '2024-06-27T21:07:33.716Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:07:33.716Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd5561bce82fe374540b7',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 16,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 20,
    tableName: 'xrddty-T-1',
    order_id: {
      $oid: '667dd5021bce82fe374540a0',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvdRHwEEOlnLi',
    razorpayOrderId: 'order_ORvcDfoLzgSBtz',
    claimedCoins: 4,
    razorpayAcquirerData: {
      rrn: '418077318392',
    },
    razorpayEventId: 'ORvdgWXbQx9hkU',
    createdAt: {
      $date: '2024-06-27T21:10:46.310Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:10:46.310Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd6451bce82fe37454111',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrttgfy-T-2',
    order_id: {
      $oid: '667dd6281bce82fe37454108',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvhbkeywnyUIk',
    razorpayOrderId: 'order_ORvhO7rfAOtD84',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418029030537',
      upi_transaction_id: 'ICI717ff411bce140ae93f813398743de20',
    },
    razorpayEventId: 'ORvhtOASNniplZ',
    createdAt: {
      $date: '2024-06-27T21:14:45.456Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:14:45.456Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd6b11bce82fe3745413a',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrddty-T-1',
    order_id: {
      $oid: '667dd6921bce82fe37454131',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvjVsEgTVbyT6',
    razorpayOrderId: 'order_ORvjFH0UdgwTX7',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418089285419',
      upi_transaction_id: 'YBL40f64a2d3dfa44f78acf140ed66492a9',
    },
    razorpayEventId: 'ORvjnpXyEygYzK',
    createdAt: {
      $date: '2024-06-27T21:16:33.890Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:16:33.890Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd84f1bce82fe374541bf',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667dd8201bce82fe374541af',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvqtZvEBVokl5',
    razorpayOrderId: 'order_ORvqGZHi0tg5h5',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418070718628',
      upi_transaction_id: 'SBI22c3eed820e94f4ea890db14d9a6d581',
    },
    razorpayEventId: 'ORvr5ivACdwDb5',
    createdAt: {
      $date: '2024-06-27T21:23:27.803Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:23:27.803Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd8cf1bce82fe37454211',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 2,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 2,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667dd8ae1bce82fe374541ff',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORvszb2Azrj61K',
    razorpayOrderId: 'order_ORvskpwVkib21I',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '454601336684',
      upi_transaction_id: 'ICI3efead63455246c7bf6a31316f005743',
    },
    razorpayEventId: 'ORvtLKoA6AjLHy',
    createdAt: {
      $date: '2024-06-27T21:25:35.706Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:25:35.706Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dd9e41bce82fe37454275',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 50,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 50,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667dd9ca1bce82fe37454264',
    },
    tips: 0,
    claimedCoins: 0,
    createdAt: {
      $date: '2024-06-27T21:30:12.188Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:30:12.188Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddb3c1bce82fe374542c5',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrttgfy-T-2',
    order_id: {
      $oid: '667ddaec1bce82fe374542c1',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORw3zpgtcT8JSw',
    razorpayOrderId: 'order_ORw2roWHanm7Lz',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '454600421358',
      upi_transaction_id: 'ICI3798320b79b04204a793d953c16ef53d',
    },
    razorpayEventId: 'ORw4GuJKhUzm9d',
    createdAt: {
      $date: '2024-06-27T21:35:56.637Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:35:56.637Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddbaf1bce82fe374542d7',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrddty-T-1',
    order_id: {
      $oid: '667ddb981bce82fe374542d3',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORw5ye5NkmdEaL',
    razorpayOrderId: 'order_ORw5t370KqUeIL',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418070736143',
      upi_transaction_id: 'SBIf2aa678041bf46d0a522cf2372528e1a',
    },
    razorpayEventId: 'ORw6IUF1Ou35Lc',
    createdAt: {
      $date: '2024-06-27T21:37:51.619Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:37:51.619Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddbf61bce82fe374542e9',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrddty-T-1',
    order_id: {
      $oid: '667ddbd11bce82fe374542e5',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORw78X89makyTO',
    razorpayOrderId: 'order_ORw6tVn3QVdjTg',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418010915205',
      upi_transaction_id: 'ICI6d4a3f03cafa496a8beb97189630ae73',
    },
    razorpayEventId: 'ORw7YMxB2kMeae',
    createdAt: {
      $date: '2024-06-27T21:39:02.988Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:39:02.988Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddc551bce82fe37454301',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667ddc401bce82fe374542f7',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORw8xEivaENtjc',
    razorpayOrderId: 'order_ORw8rL7fhOEq5e',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418070771858',
      upi_transaction_id: 'SBI7a02185baa624895822e6c22642d93df',
    },
    razorpayEventId: 'ORw9DZvryKWmdR',
    createdAt: {
      $date: '2024-06-27T21:40:37.391Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:40:37.391Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddc821bce82fe37454313',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 2,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 2,
    tableName: 'xrddty-T-1',
    order_id: {
      $oid: '667ddc6d1bce82fe3745430e',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORw9j48P0CXLQK',
    razorpayOrderId: 'order_ORw9eFVc5XKCcU',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418068730113',
      upi_transaction_id: 'ICI903804887c934f659a555d960f8e5b3b',
    },
    razorpayEventId: 'ORwA0PzQZp65G3',
    createdAt: {
      $date: '2024-06-27T21:41:22.167Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:41:22.167Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddcdb1bce82fe37454324',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667ddc9c1bce82fe37454320',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORwB9AKW2gIH5o',
    razorpayOrderId: 'order_ORwATfGIpvHHIb',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418094305322',
      upi_transaction_id: 'ACDGz1BnJWazLZMyWyL09xL',
    },
    razorpayEventId: 'ORwBZYViRhceKC',
    createdAt: {
      $date: '2024-06-27T21:42:51.139Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:42:51.139Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667dde761bce82fe3745434a',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 5,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'card',
    paymentMode: 'online',
    billValue: 5,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667ddd441bce82fe37454332',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORwISX76qFk5dZ',
    razorpayOrderId: 'order_ORwDRAk1ufT3BW',
    claimedCoins: 0,
    razorpayAcquirerData: {
      auth_code: '295006',
      rrn: '417921664918',
    },
    razorpayEventId: 'ORwIoaPZK8tGoA',
    createdAt: {
      $date: '2024-06-27T21:49:42.718Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:49:42.718Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667ddf3b1bce82fe37454364',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'Rishabh',
    customerPhone: '9177914130',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrffgty-T-3',
    order_id: {
      $oid: '667dde961bce82fe37454357',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORwLqqC1qkUiRh',
    razorpayOrderId: 'order_ORwJNnEsIdx8ZF',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418058055313',
      upi_transaction_id: 'AXIe961898f1b9a42d482c411c1a7ab342f',
    },
    razorpayEventId: 'ORwMHB3sTJncT6',
    createdAt: {
      $date: '2024-06-27T21:52:59.307Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:52:59.307Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667de0461bce82fe37454383',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrttgfy-T-2',
    order_id: {
      $oid: '667ddfcc1bce82fe37454376',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORwQkmKSiv5xI2',
    razorpayOrderId: 'order_ORwOqCzfu2Wr68',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '454642135686',
      upi_transaction_id: 'ICIf4790d4503224c94aeaaca68a5cae0e1',
    },
    razorpayEventId: 'ORwQylsDTEdb82',
    createdAt: {
      $date: '2024-06-27T21:57:26.239Z',
    },
    updatedAt: {
      $date: '2024-06-27T21:57:26.239Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667de2301bce82fe3745439e',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrddty-T-1',
    order_id: {
      $oid: '667de1bb1bce82fe37454391',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORwYTBoh8wgpFJ',
    razorpayOrderId: 'order_ORwXXz6VHFqWkt',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '454605125268',
    },
    razorpayEventId: 'ORwZcHgUcqqhRu',
    createdAt: {
      $date: '2024-06-27T22:05:36.983Z',
    },
    updatedAt: {
      $date: '2024-06-27T22:05:36.983Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667de3e31bce82fe374543c5',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719522262339',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'xrttgfy-T-2',
    order_id: {
      $oid: '667de3761bce82fe374543b4',
    },
    tips: 0,
    razorpayPaymentId: 'pay_ORwgzwVE988YdO',
    razorpayOrderId: 'order_ORwfLpilLyJDC4',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '454637723521',
      upi_transaction_id: 'ICI957253979b2040528b00bbfd01dec45b',
    },
    razorpayEventId: 'ORwhGHqZdM0rPN',
    createdAt: {
      $date: '2024-06-27T22:12:51.257Z',
    },
    updatedAt: {
      $date: '2024-06-27T22:12:51.257Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667e7a918abe22656ffb8582',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719556810735',
    },
    total: 2,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 2,
    tableName: '17',
    order_id: {
      $oid: '667e53521bce82fe3745441e',
    },
    tips: 0,
    claimedCoins: 0,
    createdAt: {
      $date: '2024-06-28T08:55:45.605Z',
    },
    updatedAt: {
      $date: '2024-06-28T08:55:45.605Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667fd185c9f091d99d1450b3',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719648362488',
    },
    total: 12,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 12,
    tableName: '1234',
    order_id: {
      $oid: '667fd1788abe22656ffb85e2',
    },
    tips: 0,
    claimedCoins: 0,
    createdAt: {
      $date: '2024-06-29T09:19:01.034Z',
    },
    updatedAt: {
      $date: '2024-06-29T09:19:01.034Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667fe45241373907e052f751',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719656893887',
    },
    total: 1,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: '5252',
    order_id: {
      $oid: '667fe42a41373907e052f74d',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSXwr6GYJq4ZkY',
    razorpayOrderId: 'order_OSXwAqFKAOrNhz',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '970256949946',
      upi_transaction_id: '4B68FB1F5B0142CD13B68B138113AEBB',
    },
    razorpayEventId: 'OSXwscNOBtXPSS',
    createdAt: {
      $date: '2024-06-29T10:39:14.812Z',
    },
    updatedAt: {
      $date: '2024-06-29T10:39:14.812Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667fe4c041373907e052f77b',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719656893887',
    },
    total: 10,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 10,
    tableName: '5252',
    order_id: {
      $oid: '667fe4b541373907e052f772',
    },
    tips: 0,
    claimedCoins: 0,
    waiterName: 'test-user',
    createdAt: {
      $date: '2024-06-29T10:41:04.295Z',
    },
    updatedAt: {
      $date: '2024-06-29T10:41:04.295Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667fe85ec268add05de85568',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719658433369',
    },
    total: 1,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: '9877',
    order_id: {
      $oid: '667fe852c268add05de85564',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSYF5dSo87B8gb',
    razorpayOrderId: 'order_OSYEu0XxMoHhn8',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '172724650542',
      upi_transaction_id: '1BB097DE509C0800EF8417398B030516',
    },
    razorpayEventId: 'OSYF6z53bhaVPe',
    createdAt: {
      $date: '2024-06-29T10:56:30.332Z',
    },
    updatedAt: {
      $date: '2024-06-29T10:56:30.332Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '667fee3a8abe22656ffb864a',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719556810735',
    },
    total: 7,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 7,
    tableName: '1234',
    order_id: {
      $oid: '667fed568abe22656ffb8638',
    },
    tips: 0,
    claimedCoins: 0,
    createdAt: {
      $date: '2024-06-29T11:21:30.172Z',
    },
    updatedAt: {
      $date: '2024-06-29T11:21:30.172Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '668004d3e1aaf4971d890417',
    },
    businessId: {
      $oid: '64b630b09f464445c1fbd169',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 1,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: '12454',
    order_id: {
      $oid: '668004c7e1aaf4971d890413',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaJKy4RjL6ERF',
    razorpayOrderId: 'order_OSaJ9SpIiQQChd',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '865102193125',
      upi_transaction_id: 'FA5EC7A97CDF5FC300DA3750BEBE558E',
    },
    razorpayEventId: 'OSaJMMrTAqUnNG',
    createdAt: {
      $date: '2024-06-29T12:57:55.341Z',
    },
    updatedAt: {
      $date: '2024-06-29T12:57:55.341Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '66800577e1aaf4971d890435',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 4,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 4,
    tableName: '12454',
    order_id: {
      $oid: '66800572e1aaf4971d890431',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaMEGPRIx3qu5',
    razorpayOrderId: 'order_OSaM9hBMmqf5W0',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '520435725838',
      upi_transaction_id: 'A112D89F83D87F8AD3A01F76FB49EA72',
    },
    razorpayEventId: 'OSaMFot4MgbKQD',
    createdAt: {
      $date: '2024-06-29T13:00:39.731Z',
    },
    updatedAt: {
      $date: '2024-06-29T13:00:39.731Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '668005bde1aaf4971d890455',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 14,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 14,
    tableName: '12454',
    order_id: {
      $oid: '668005b7e1aaf4971d890451',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaNSY0exQbN8y',
    razorpayOrderId: 'order_OSaNNnM2zEMRjp',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '259659394938',
      upi_transaction_id: 'C01A7CCDE47416AEE83960B2B8AA4E66',
    },
    razorpayEventId: 'OSaNTvWb9RfaUF',
    createdAt: {
      $date: '2024-06-29T13:01:49.475Z',
    },
    updatedAt: {
      $date: '2024-06-29T13:01:49.475Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '668005e0e1aaf4971d89046d',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 5,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 5,
    tableName: '12454',
    order_id: {
      $oid: '668005dce1aaf4971d890469',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaO4ovWMH62Zg',
    razorpayOrderId: 'order_OSaO1Shq9q6R91',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '787017431678',
      upi_transaction_id: 'F08B28698647321AF2072EDD0311A35A',
    },
    razorpayEventId: 'OSaO6Esb4305ML',
    createdAt: {
      $date: '2024-06-29T13:02:24.568Z',
    },
    updatedAt: {
      $date: '2024-06-29T13:02:24.568Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680060de1aaf4971d890483',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 7,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 7,
    tableName: '124545',
    order_id: {
      $oid: '66800608e1aaf4971d89047f',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaOrGXiMTHxp6',
    razorpayOrderId: 'order_OSaOnZPFMDNwZB',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '882008717147',
      upi_transaction_id: '02EB3CD244734E008C6CD0034EA87344',
    },
    razorpayEventId: 'OSaOsrHjjdMPuG',
    createdAt: {
      $date: '2024-06-29T13:03:09.107Z',
    },
    updatedAt: {
      $date: '2024-06-29T13:03:09.107Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680066de1aaf4971d8904a5',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 4,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 4,
    tableName: '124544',
    order_id: {
      $oid: '6680062ce1aaf4971d890492',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaQYqPCubPPmn',
    razorpayOrderId: 'order_OSaPQpfWY5kSQn',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '598537073604',
      upi_transaction_id: '584499A561739441489A729236A0C85F',
    },
    razorpayEventId: 'OSaQaQsLd5mYYv',
    createdAt: {
      $date: '2024-06-29T13:04:45.839Z',
    },
    updatedAt: {
      $date: '2024-06-29T13:04:45.839Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '66800760e1aaf4971d8904e3',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 5,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 5,
    tableName: '124544',
    order_id: {
      $oid: '6680075be1aaf4971d8904df',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaUqcMvnQxiCn',
    razorpayOrderId: 'order_OSaUmLQ3xfg9b0',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '211665731256',
      upi_transaction_id: '3568798C824B729317DCD65A2552F419',
    },
    razorpayEventId: 'OSaUrrqrPLtAgr',
    createdAt: {
      $date: '2024-06-29T13:08:48.989Z',
    },
    updatedAt: {
      $date: '2024-06-29T13:08:48.989Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '66805720ebdd4df83490dc9c',
    },
    businessId: {
      $oid: '64b630b09f464445c1fbd169',
    },
    date: {
      $numberLong: '1719668775229',
    },
    total: 2,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 2,
    tableName: '2929',
    order_id: {
      $oid: '66805715ebdd4df83490dc98',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSgIGxbVmhoN0Z',
    razorpayOrderId: 'order_OSgI6y4aDdINpa',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '689519557183',
      upi_transaction_id: 'E70A32970594F5D51A4FFDA1873AF5CA',
    },
    razorpayEventId: 'OSgIIJr0mCvNfx',
    createdAt: {
      $date: '2024-06-29T18:49:04.262Z',
    },
    updatedAt: {
      $date: '2024-06-29T18:49:04.262Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680da8d8abe22656ffb870d',
    },
    businessId: {
      $oid: '64b630b09f464445c1fbd169',
    },
    date: {
      $numberLong: '1719556810735',
    },
    total: 8,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 10,
    tableName: 'T-1',
    order_id: {
      $oid: '6680da5d8abe22656ffb8701',
    },
    tips: 0,
    claimedCoins: 2,
    waiterName: 'RajKumar',
    createdAt: {
      $date: '2024-06-30T04:09:49.297Z',
    },
    updatedAt: {
      $date: '2024-06-30T04:09:49.297Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680dc398abe22656ffb8766',
    },
    businessId: {
      $oid: '64b630b09f464445c1fbd169',
    },
    date: {
      $numberLong: '1719556810735',
    },
    total: 1,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 1,
    tableName: 'T-1',
    order_id: {
      $oid: '6680dbf18abe22656ffb875b',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSpxAf869YTcII',
    razorpayOrderId: 'order_OSpwr1jyJR4dZw',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '418288977501',
    },
    razorpayEventId: 'OSpy78SLu7Nyew',
    createdAt: {
      $date: '2024-06-30T04:16:57.308Z',
    },
    updatedAt: {
      $date: '2024-06-30T04:16:57.308Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680ea202fbf0c541e9a649e',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719723686425',
    },
    total: 752,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 752,
    tableName: '098651',
    order_id: {
      $oid: '6680ea1a2fbf0c541e9a649a',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSqypiwCa62uJ4',
    razorpayOrderId: 'order_OSqykVEtlqKkbm',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '309900904288',
      upi_transaction_id: '7BE7D70F5F3000D008C3A5F15BD0ADF0',
    },
    razorpayEventId: 'OSqyr0vkXXRZXy',
    createdAt: {
      $date: '2024-06-30T05:16:16.795Z',
    },
    updatedAt: {
      $date: '2024-06-30T05:16:16.795Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680ea2d2fbf0c541e9a64ae',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719723686425',
    },
    total: 585,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 585,
    tableName: '0988764',
    order_id: {
      $oid: '6680e4acab30feba9dc59d55',
    },
    tips: 0,
    claimedCoins: 0,
    waiterName: 'test-user',
    createdAt: {
      $date: '2024-06-30T05:16:29.532Z',
    },
    updatedAt: {
      $date: '2024-06-30T05:16:29.532Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680ea762fbf0c541e9a64ca',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719723686425',
    },
    total: 522,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 522,
    tableName: '0988',
    order_id: {
      $oid: '6680ea032fbf0c541e9a6495',
    },
    tips: 0,
    claimedCoins: 0,
    waiterName: 'test-user',
    createdAt: {
      $date: '2024-06-30T05:17:42.892Z',
    },
    updatedAt: {
      $date: '2024-06-30T05:17:42.892Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680eacb2fbf0c541e9a64ec',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719723686425',
    },
    total: 606,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 758,
    tableName: '098876',
    order_id: {
      $oid: '6680e389ab30feba9dc59d50',
    },
    tips: 0,
    claimedCoins: 152,
    waiterName: 'test-user',
    createdAt: {
      $date: '2024-06-30T05:19:07.670Z',
    },
    updatedAt: {
      $date: '2024-06-30T05:19:07.670Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680ead12fbf0c541e9a64ff',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719723686425',
    },
    total: 44,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 55,
    tableName: '0987655',
    order_id: {
      $oid: '6680e135ab30feba9dc59d4b',
    },
    tips: 0,
    claimedCoins: 11,
    waiterName: 'test-user',
    createdAt: {
      $date: '2024-06-30T05:19:13.509Z',
    },
    updatedAt: {
      $date: '2024-06-30T05:19:13.509Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '6680ec9d2fbf0c541e9a6572',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719723686425',
    },
    total: 475,
    customerName: 'babu',
    customerPhone: '9588413799',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 500,
    tableName: '9875651',
    order_id: {
      $oid: '6680ec822fbf0c541e9a656e',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSrA3TLBzIf3Fz',
    razorpayOrderId: 'order_OSr9aXIH6FsNNQ',
    claimedCoins: 25,
    razorpayAcquirerData: {
      rrn: '800951145824',
      upi_transaction_id: '777C0A331EBA71999F8550011DA20BAE',
    },
    razorpayEventId: 'OSrA4td3GVAC2u',
    createdAt: {
      $date: '2024-06-30T05:26:53.957Z',
    },
    updatedAt: {
      $date: '2024-06-30T05:26:53.957Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '66840e790b81d662ac23f0c7',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    total: 123,
    customerName: 'vamsi',
    customerPhone: '7702605494',
    mode: 'offline',
    paymentMode: 'offline',
    billValue: 123,
    tableName: 'vamsi2',
    order_id: {
      $oid: '66840e180b81d662ac23f0b3',
    },
    tips: 0,
    claimedCoins: 0,
    waiterName: 'test-user',
    createdAt: {
      $date: '2024-07-02T16:35:56.154Z',
    },
    updatedAt: {
      $date: '2024-07-02T14:28:09.552Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '66842262f98d5843d03df6d6',
    },
    businessId: {
      $oid: '665ee8043cd15d770f104f99',
    },
    date: {
      $numberLong: '1719665746987',
    },
    total: 66,
    customerName: 'sankalesh',
    customerPhone: '8668229890',
    mode: 'upi',
    paymentMode: 'online',
    billValue: 7,
    tableName: '124545',
    order_id: {
      $oid: '66800608e1aaf4971d89047f',
    },
    tips: 0,
    razorpayPaymentId: 'pay_OSaOrGXiMTHxp6',
    razorpayOrderId: 'order_OSaOnZPFMDNwZB',
    claimedCoins: 0,
    razorpayAcquirerData: {
      rrn: '882008717147',
      upi_transaction_id: '02EB3CD244734E008C6CD0034EA87344',
    },
    razorpayEventId: 'OSaOsrHjjdMPuG',
    __v: 0,
  },
];

// console.log(
//   data
//     .filter((d) => dayjs(d.createdAt?.$date).utc().format('YYYY-MM-DD') === dayjs('2024-07-02').format('YYYY-MM-DD'))
//     .filter((d) => d.businessId.$oid === '665ee8043cd15d770f104f99')
//     .map((d) => dayjs(d.createdAt?.$date).format('YYYY-MM-DD HH:mm:ss')),
// );
// console.log(data.map((d) => console.log(d.createdAt)));
