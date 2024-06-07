import express, { Request, Response } from 'express';

import { Dues, Payment, PaymentMode, Reviews, ReviewsCustomer } from '@hi/db-models';
import moment from 'moment';
import momentTimeZone from 'moment-timezone';

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

  async (req: Request, res: Response) => {
    const { id, date, remove } = req.query;
    const query = {
      businessId: id,
    } as any;
    if (date) {
      query['date'] = {
        $regex: `^${date}`,
      };
    }
    if (remove) {
      let deleted = await Payment.deleteMany(query);
      return res.send(deleted);
    }
    const existingPayment = await Payment.find(query);

    res.status(200).send(existingPayment);
  },
);

router.get(
  '/v1/payments/:id/test',

  async (req: Request, res: Response) => {
    res.status(200).send('payment test');
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
  });
});

router.get(
  '/v1/payments/:id',

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingPayment = await Payment.findById(id);

    res.status(200).send(existingPayment);
  },
);

router.get(
  '/v1/payments/Sale/Api',

  async (req: Request, res: Response) => {
    try {
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

        return res.status(200).send(result);
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

        return res.status(200).send(result);
      }

      res.status(400).send({ message: 'Invalid request parameters' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  },
);

router.get('/v1/payments/Sale/Bill', async (req: Request, res: Response) => {
  try {
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
        return res.status(200).send(existingPayments);
      }

      return res.status(200).send(existingPayments);
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

        return res.status(200).send(existingPayments);
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(to).split('-').reverse().join('-'));

      toDate.setUTCHours(23, 59, 59, 999);

      if (fromDate > toDate) {
        return res.status(400).send('From date cannot be greater than to date.');
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

      return res.status(200).send(filteredPayments);
    }

    res.status(400).send({ message: 'Invalid request parameters' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.get('/v1/payments/Sale/Dues', async (req: Request, res: Response) => {
  try {
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

    return res.status(200).send(newObje);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.get('/v1/payments/Get/Modes', async (req: Request, res: Response) => {
  try {
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
      return res.status(404).send('Modes Not Found..');
    }

    return res.status(200).send(existingModes);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.get('/v1/payments/Get/Dues', async (req: Request, res: Response) => {
  try {
    let { businessId } = req.query;

    const existimgDues = await Dues.find({
      businessId,
    });
    if (!existimgDues) {
      return res.status(404).send('Dues Not Found..');
    }

    return res.status(200).send(existimgDues);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.get('/v1/payments/Get/DuesByUser', async (req: Request, res: Response) => {
  try {
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

        return res.send(newObje);
      }

      totalDues = calculateTotalDues(existingPayments);
      let newObje =
        {
          totalDues,
          items: existingPayments,
          userName: duesUser?.customerName,
        } || {};

      return res.send(newObje);
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

        return res.send(newObje);
      }
      let fromDate = new Date(String(from).split('-').reverse().join('-'));

      fromDate.setUTCHours(0, 0, 0, 0);

      let toDate = new Date(String(to).split('-').reverse().join('-'));

      toDate.setUTCHours(23, 59, 59, 999);
      if (fromDate > toDate) {
        return res.status(400).send('From date cannot be greater than to date.');
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

      return res.send(newObje);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

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

router.get(
  '/v1/payments/:id/byUsers',
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      let { customerPhone } = req.query;

      const existingPayments = await Payment.find({
        customerPhone,
      });

      return res.status(200).send(existingPayments);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  },
);
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
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
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
        return res.status(404).send('Invalid request parameters');
      }

      let result = calculateSale(payments, getPaymentsModes, modes);

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
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

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
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

        return res.send([...ans, ...splitArray]);
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

          return res.send([...ans, ...splitArray]);
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

        return res.send([...ans, ...splitArray]);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  },
);

router.get(
  '/v1/payments/:id/discountReport',

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
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

        return res.send(ans);
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

          return res.send(ans);
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

        return res.send(ans);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  },
);

router.get(
  '/v1/payments/:id/duesReport',

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      let { businessId, from, to, excel } = req.query;

      const currentDate = momentTimeZone.tz('Asia/Kolkata');
      const previousDate = currentDate.subtract(1, 'days');
      const preDate = previousDate.format('YYYY-MM-DD');

      const objectFunction = (payment: any) => {
        let obj: any = {};
        obj['date'] = payment?.date;
        obj['time'] = payment?.time;
        obj['orderId'] = payment?.orderId || payment?.id?.slice(-5);
        obj['subTotal'] = payment?.subTotal || 0;
        obj['discount'] = payment?.discount || 0;
        obj['cgst'] = payment?.cgst || 0;
        obj['sgst'] = payment?.sgst || 0;
        obj['serviceCharge'] = payment?.serviceCharge || 0;
        obj['duesAmount'] = payment?.total || 0;
        obj['remarks'] = payment?.customerName;
        obj['paid'] = payment?.settle || 'no';
        if (payment?.settle) {
          obj['paidDate'] = payment?.date || '-';
          obj['paidBy'] = payment?.customerName || '-';
        } else {
          obj['pending'] = payment?.total || '-';
          obj['paidBy'] = '-';
          obj['paidDate'] = '-';
        }

        return obj;
      };

      if (!from && !to) {
        const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
        let existingPayments = await Payment.find({
          businessId,

          duesPersonId: { $exists: true, $ne: '' },
          date: { $regex: `^${dayAndDate}` },
        });
        if (existingPayments?.length == 0) {
          existingPayments = await Payment.find({
            businessId,

            duesPersonId: { $exists: true, $ne: '' },
            date: { $regex: `^${preDate}` },
          });
        }
        let ans: any = [];
        let paidAmount = 0;
        let pending = 0;
        for (let i = 0; i < existingPayments?.length; i++) {
          let payment = existingPayments[i];
          if (payment?.settle) {
            paidAmount += payment?.total || 0;
          }
          if (!payment?.settle) {
            pending += payment?.total || 0;
          }
          const out = objectFunction(payment);

          ans.push(out);
        }
        if (excel) {
          let obj: any = {};
          obj['from'] = dayAndDate;
          obj['to'] = dayAndDate;

          obj['duesPaid'] = paidAmount;
          obj['duesPending'] = pending;

          ans.unshift(obj);
        }

        return res.send(ans);
      }

      if (from && to) {
        if (from == to) {
          const existingPayments = await Payment.find({
            businessId,

            duesPersonId: { $exists: true, $ne: '' },

            date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
          });

          let ans: any = [];
          let paidAmount = 0;
          let pending = 0;
          for (let i = 0; i < existingPayments?.length; i++) {
            let payment = existingPayments[i];
            if (payment?.settle) {
              paidAmount += payment?.total || 0;
            }
            if (!payment?.settle) {
              pending += payment?.total || 0;
            }
            const out = objectFunction(payment);

            ans.push(out);
          }
          if (excel) {
            let obj: any = {};
            obj['from'] = from;
            obj['to'] = from;

            obj['duesPaid'] = paidAmount;
            obj['duesPending'] = pending;

            ans.unshift(obj);
          }

          return res.send(ans);
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

          duesPersonId: { $exists: true, $ne: '' },
          date: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
        });
        let ans: any = [];
        let paidAmount = 0;
        let pending = 0;
        for (let i = 0; i < filteredPayments?.length; i++) {
          let payment = filteredPayments[i];
          if (payment?.settle) {
            paidAmount += payment?.total || 0;
          }
          if (!payment?.settle) {
            pending += payment?.total || 0;
          }
          const out = objectFunction(payment);

          ans.push(out);
        }
        if (excel) {
          let obj: any = {};
          obj['from'] = from;
          obj['to'] = to;

          obj['duesPaid'] = paidAmount;
          obj['duesPending'] = pending;

          ans.unshift(obj);
        }

        return res.send(ans);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  },
);

router.get(
  '/v1/payments/:id/complimentaryReport',

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    try {
      let { businessId, from, to, excel } = req.query;

      const currentDate = momentTimeZone.tz('Asia/Kolkata');
      const previousDate = currentDate.subtract(1, 'days');
      const preDate = previousDate.format('YYYY-MM-DD');

      const objectFunction = (payment: any) => {
        let obj: any = {};

        obj['date'] = payment?.date;
        obj['complimentaryName'] = payment?.customerName;
        obj['complimentaryRemark'] = '-';
        obj['grossAmount'] = payment?.subTotal;

        obj['time'] = payment?.time || 0;
        obj['orderId'] = payment?.orderId || payment?.id?.slice(-5);

        obj['orderType'] = payment?.zoneType || '';
        obj['tableNumber'] = payment?.tableName || '';

        return obj;
      };

      if (!from && !to) {
        const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
        let existingPayments = await Payment.find({
          businessId,
          mode: 'complimentary',

          date: { $regex: `^${dayAndDate}` },
        });
        if (existingPayments?.length == 0) {
          existingPayments = await Payment.find({
            businessId,
            mode: 'complimentary',
            date: { $regex: `^${preDate}` },
          });
        }
        let ans: any = [];
        let complimentary = 0;
        for (let i = 0; i < existingPayments?.length; i++) {
          let payment = existingPayments[i];
          complimentary += payment?.subTotal || 0;
          const out = objectFunction(payment);

          ans.push(out);
        }
        if (excel) {
          let obj: any = {};
          obj['from'] = dayAndDate;
          obj['to'] = dayAndDate;

          obj['complimentaryValue'] = complimentary;

          ans.unshift(obj);
        }

        return res.send(ans);
      }

      if (from && to) {
        if (from == to) {
          const existingPayments = await Payment.find({
            businessId,
            mode: 'complimentary',

            date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
          });

          let ans: any = [];
          let complimentary = 0;
          for (let i = 0; i < existingPayments?.length; i++) {
            let payment = existingPayments[i];
            complimentary += payment?.subTotal || 0;

            const out = objectFunction(payment);

            ans.push(out);
          }
          if (excel) {
            let obj: any = {};
            obj['from'] = from;
            obj['to'] = from;

            obj['complimentaryValue'] = complimentary;

            ans.unshift(obj);
          }

          return res.send(ans);
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
          mode: 'complimentary',
          date: {
            $gte: formattedFromDate,
            $lte: formattedToDate,
          },
        });
        let ans: any = [];
        let complimentary = 0;

        for (let i = 0; i < filteredPayments?.length; i++) {
          let payment = filteredPayments[i];
          complimentary += payment?.subTotal || 0;

          const out = objectFunction(payment);

          ans.push(out);
        }
        if (excel) {
          let obj: any = {};
          obj['from'] = from;
          obj['to'] = to;

          obj['complimentaryValue'] = complimentary;

          ans.unshift(obj);
        }

        return res.send(ans);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  },
);

router.get('/v1/payments/:id/tips', async (req: Request, res: Response) => {
  try {
    let { businessId } = req.query;

    // Adjust timezone as necessary
    let existingTips = await Payment.find({
      businessId,
      tips: { $gt: 0 },
    }).select('waiterName tips ');
    const waiterChips: any = {};
    for (let i = 0; i < existingTips?.length; i++) {
      const payment = existingTips[i];
      if (!waiterChips[payment?.waiterName || '']) {
        waiterChips[payment?.waiterName || ''] = payment?.tips;
      } else {
        waiterChips[payment?.waiterName || ''] += payment?.tips;
      }
    }
    let ans: any = [];
    for (let waiter in waiterChips) {
      ans.push({
        waiterName: waiter,
        tips: waiterChips[waiter],
      });
    }

    return res.send(ans);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.get('/v1/payments/:id/tipsByWaiterName', async (req: Request, res: Response) => {
  try {
    let { businessId, waiterName, from, to } = req.query;
    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
    let totalTips = 0;

    const calculateTotalTips = (payments: any) => {
      for (let i = 0; i < payments?.length; i++) {
        let payment = payments[i];
        totalTips += payment?.tips || 0;
      }
      return totalTips;
    };
    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      let existingPayments = await Payment.find({
        businessId,
        waiterName,
        tips: { $gt: 0 },
        date: { $regex: `^${dayAndDate}` },
      })
        .skip(skip)
        .limit(PAGE_SIZE);
      if (existingPayments?.length == 0) {
        existingPayments = await Payment.find({
          businessId,
          waiterName,
          tips: { $gt: 0 },
          date: { $regex: `^${preDate}` },
        })
          .skip(skip)
          .limit(PAGE_SIZE);
      }
      const totalTips = calculateTotalTips(existingPayments);

      return res.send({
        waiterName,
        tips: totalTips,
        data: existingPayments,
      });
    }

    if (from && to) {
      if (from == to) {
        const existingPayments = await Payment.find({
          businessId,
          waiterName,
          tips: { $gt: 0 },

          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        })
          .skip(skip)
          .limit(PAGE_SIZE);

        const totalTips = calculateTotalTips(existingPayments);

        return res.send({
          waiterName,
          tips: totalTips,

          data: existingPayments,
        });
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
        waiterName,
        tips: { $gt: 0 },
        date: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      })
        .skip(skip)
        .limit(PAGE_SIZE);

      const totalTips = calculateTotalTips(filteredPayments);

      return res.send({
        waiterName,
        tips: totalTips,
        data: filteredPayments,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

router.get('/v1/payments/:id/discount', async (req: Request, res: Response) => {
  try {
    let { businessId, from, to } = req.query;
    const currentDate = momentTimeZone.tz('Asia/Kolkata');
    const previousDate = currentDate.subtract(1, 'days');
    const preDate = previousDate.format('YYYY-MM-DD');
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    let totalDiscount = 0;
    const calculateDiscount = (payments: any) => {
      for (let i = 0; i < payments?.length; i++) {
        let payment = payments[i];
        totalDiscount += payment?.discount || 0;
      }

      return totalDiscount;
    };

    if (!from && !to) {
      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD'); // Adjust timezone as necessary
      let existingPayments = await Payment.find({
        businessId,

        discount: { $gt: 0 },
        date: { $regex: `^${dayAndDate}` },
      })
        .skip(skip)
        .limit(PAGE_SIZE);
      if (existingPayments?.length == 0) {
        existingPayments = await Payment.find({
          businessId,
          discount: { $gt: 0 },
          date: { $regex: `^${preDate}` },
        })
          .skip(skip)
          .limit(PAGE_SIZE);
      }

      const totalDiscount = calculateDiscount(existingPayments);

      return res.send({
        totalDiscount,
        data: existingPayments,
      });
    }

    if (from && to) {
      if (from == to) {
        const existingPayments = await Payment.find({
          businessId,

          discount: { $gt: 0 },

          date: { $regex: `^${String(from).split('-').reverse().join('-')}` },
        })
          .skip(skip)
          .limit(PAGE_SIZE);
        const totalDiscount = calculateDiscount(existingPayments);

        return res.send({
          totalDiscount,
          data: existingPayments,
        });
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
        discount: { $gt: 0 },
        date: {
          $gte: formattedFromDate,
          $lte: formattedToDate,
        },
      })
        .skip(skip)
        .limit(PAGE_SIZE);
      const totalDiscount = calculateDiscount(filteredPayments);

      return res.send({
        totalDiscount,
        data: filteredPayments,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

// const startOfToday = new Date();
// startOfToday.setHours(0, 0, 0, 0);
const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 999);

// get single review
router.get('/v1/payments/:id/reviews/:reviewsId', async (req: Request, res: Response) => {
  try {
    let { reviewsId } = req.params;

    const review = await Reviews.findById(reviewsId);
    if (!review) {
      return res.status(404).send({ message: 'Review not found' });
    }

    return res.send(review);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

// get all reviews
router.get('/v1/payments/:id/reviews', async (req: Request, res: Response) => {
  try {
    let businessId = req.query.businessId as string;
    let { from, to } = req.query;
    let fromDate = Number(from);
    let toDate = Number(to);
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!businessId) {
      return res.status(400).send({ message: 'businessId is required' });
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

      return res.send(reviews);
    }

    if (from && to) {
      if (fromDate > toDate) {
        return res.status(400).send('From date cannot be greater than to date.');
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

      return res.send(reviews);
    }

    return res.status(400).send('Invalid query parameters');
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// get single customer
router.get('/v1/payments/:id/customer/:customerId', async (req: Request, res: Response) => {
  try {
    let { customerId } = req.params;

    const customer = await ReviewsCustomer.findById(customerId);
    if (!customer) {
      return res.status(404).send({ message: 'customer not found' });
    }

    return res.send(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

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
router.get('/v1/payments/:id/customers', async (req: Request, res: Response) => {
  try {
    let businessId = req.query.businessId as string;
    let { from, to, findUser } = req.query;
    let fromDate = Number(from);
    let toDate = Number(to);
    let PAGE_SIZE = 20;
    let pageNumber: any = req?.query?.pageNumber || 1;
    const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

    if (!businessId) {
      return res.status(400).send({ message: 'businessId is required' });
    }

    if (findUser) {
      const customers = await ReviewsCustomer.findOne({
        businessId,
        phone: findUser,
      });

      if (!customers) {
        return res.status(404).send({ message: 'Customer not found' });
      }

      return res.send(customers);
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

      return res.send(customers);
    }

    if (from && to) {
      if (fromDate > toDate) {
        return res.status(400).send('From date cannot be greater than to date.');
      }
      const customers = await filterCustomers(fromDate, toDate, businessId, skip, PAGE_SIZE);

      return res.send(customers);
    }

    return res.status(400).send('Invalid query parameters');
  } catch (error: any) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

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
router.get(
  '/v1/payments/:id/userDashboard',

  async (req: Request, res: Response) => {
    try {
      let { from, to } = req.query;
      let fromDate = Number(from);
      let toDate = Number(to);

      const businessId = req.query.businessId as string;
      if (!businessId) {
        return res.status(400).send({ message: 'businessId is required' });
      }
      if (!from && !to) {
        const obj = await filterBasedOnDate(startOfToday.getTime(), endOfToday.getTime(), businessId);

        return res.send(obj);
      }
      if (from && to) {
        if (fromDate > toDate) {
          return res.status(400).send('From date cannot be greater than to date.');
        }
        const obj = await filterBasedOnDate(fromDate, toDate, businessId);

        return res.send(obj);
      }

      return res.status(400).send('Invalid query parameters');
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
);

// Retrieves a list of customers who visited the restaurant today.
router.get(
  '/v1/payments/:id/newCustomer',

  async (req: Request, res: Response) => {
    try {
      const businessId = req.query.businessId as string;
      let PAGE_SIZE = 20;
      let pageNumber: any = req?.query?.pageNumber || 1;
      const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;
      if (!businessId) {
        return res.status(400).send({ message: 'businessId is required' });
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

      return res.send(newCustomers);
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
);

// Retrieves payment statistics for a specific business and customer phone number
router.get(
  '/v1/payments/:id/billsByUser',

  async (req: Request, res: Response) => {
    try {
      const { businessId, phone } = req.query;

      if (!businessId || !phone) {
        return res.status(400).send({ message: 'businessId and phone is required' });
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

      return res.send(obj);
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
);

// Retrieves the payment bills for a specific business and customer phone number.
router.get(
  '/v1/payments/:id/customerBills',

  async (req: Request, res: Response) => {
    try {
      const { businessId, phone, name } = req.query;
      let PAGE_SIZE = 20;
      let pageNumber: any = req?.query?.pageNumber || 1;
      const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

      if (!businessId || !phone) {
        return res.status(400).send({ message: 'businessId and phone is required' });
      }

      const bills = await Payment.find({
        businessId,
        customerPhone: { $in: [phone, `91${phone}`] },
      })
        .select(fields.join(' '))
        .skip(skip)
        .limit(PAGE_SIZE);

      return res.send({ customerName: bills[0]?.customerName || name, bills });
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
);

// Retrieves reviews from the database based on the provided criteria.
router.get(
  '/v1/payments/:id/customerReviews',

  async (req: Request, res: Response) => {
    try {
      const { businessId, phone, name } = req.query;
      let PAGE_SIZE = 20;
      let pageNumber: any = req?.query?.pageNumber || 1;
      const skip: number = (parseInt(pageNumber) - 1) * PAGE_SIZE;

      if (!businessId || !phone) {
        return res.status(400).send({ message: 'businessId and phone is required' });
      }

      const reviews = await Reviews.find({
        businessId,
        reviewerPhone: { $in: [phone, `91${phone}`] },
      })
        .select(reviewsFields.join(' '))
        .skip(skip)
        .limit(PAGE_SIZE);

      return res.send({
        customerName: reviews[0]?.reviewerName || name,
        reviews,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
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

  async (req: Request, res: Response) => {
    try {
      let { from, to } = req.query;
      let startDate = Number(from);
      let endDate = Number(to);

      const businessId = req.query.businessId as string;
      if (!businessId) {
        return res.status(400).send({ message: 'businessId is required' });
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
          return res.status(400).send('Start date cannot be greater than end date.');
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

      return res.status(400).send('Invalid query parameters');
    } catch (error: any) {
      console.error(error);
      res.status(500).send({ message: error.message });
    }
  },
);

// router.get(
//   "/v1/payments/:id/paymentAlert",
//   currentUser,
//   // requireAuthorization([
//   //   ClientRoles.RESTAURANT_OWNER,
//   //   ClientRoles.RESTAURANT_MANAGER,
//   // ]),
//   async (req: Request, res: Response) => {
//     const { businessId, tableId, zoneId } = req.query;
//     const alerts = await Alert.find({
//       businessId,
//       zoneId,
//       isAlertOn: true,
//     });

//     res.status(200).send(alerts);
//   }
// );

// router.get(
//   "/v1/payments/:id/deleteAlert/:alertId",

//   async (req: Request, res: Response) => {
//     const { alertId } = req.params;
//     const deleteAlert = await Alert.findByIdAndUpdate(alertId, {
//       isAlertOn: false,
//     });

//     res.status(200).send(deleteAlert);
//   }
// );

export { router as readPaymentsRouter };
