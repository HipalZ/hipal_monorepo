import express, { Request, Response } from 'express';

import { Dues, Payment, PaymentMode, Reviews, ReviewsCustomer } from '@hi/db-models';
import momentTimeZone from 'moment-timezone';

import axios from 'axios';

const crypto = require('crypto');
const ENC_KEY = process.env.API_KEY; // set random encryption key
const IV = process.env.API_KEY?.slice(0, 16);

// set random initialisation vector

const encrypt = (val: string) => {
  let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

const decrypt = (encrypted: string) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return decrypted + decipher.final('utf8');
};

const router = express.Router();

router.post(
  '/v1/payments',

  async (req: Request, res: Response) => {
    try {
      const {
        businessId,
        businessName,
        address,
        gstin,
        items,
        subTotal,
        sgst,
        cgst,
        total,
        customerId,
        customerName,
        customerPhone,
        discount,
        zoneId,
        tableId,
        paymentMode,
        mode,
        paymentDate,
        time,
        tableName,
        modeCommission,
        duesPersonId,
        settle,
        logo,
        discountDescription,
        claimedAmount,
        serviceCharge,
        modeBreakDown,
        otherCharges,
        waiterName,
        tips,
        zoneType,
        isEdit,
        editedBy,
        orderId,
        swiggyBillObj,
        payment_date,
        razorpayPaymentId,
        razorpayOrderId,
        razorpayAcquirerData,
        serviceChargeRemovedBy,
        serviceChargeAddedBy,
        coinsGivenBy,
        discountGivenBy,
        discountRemovedBy,
        tipsGivenBy,
      } = req.body;

      const date = new Date().toISOString().replace('T', ' ').slice(0, 19);

      const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD');

      const payment = await Payment.create({
        businessId,
        businessName,
        address,
        gstin,
        items,
        date: dayAndDate,
        subTotal,
        sgst,
        cgst,
        total,
        customerId,
        customerName,
        customerPhone,
        discount,
        zoneId,
        tableId,
        paymentMode,
        mode,
        paymentDate,
        time,
        tableName,
        modeCommission,
        duesPersonId,
        settle,
        logo,
        discountDescription,
        claimedAmount,
        serviceCharge,
        modeBreakDown,
        otherCharges,
        waiterName,
        tips,
        zoneType,
        isEdit,
        editedBy,
        orderId,
        swiggyBillObj,
        payment_date,
        razorpayPaymentId,
        razorpayOrderId,
        razorpayAcquirerData,
        serviceChargeRemovedBy,
        serviceChargeAddedBy,
        coinsGivenBy,
        discountGivenBy,
        discountRemovedBy,
        tipsGivenBy,
      });

      res.status(201).send(payment);
    } catch (err: any) {
      console.log('error', err);
      return res.status(500).send({ status: false, mes: err });
    }
  },
);

// router.post(
//   "/v1/payments/1pay",

//   async (req: Request, res: Response) => {
//     const response = JSON.parse(decrypt(req.body.respData));

//     const existingPayment = await Payment.findById(response["txn_id"]);

//     existingPayment.paymentMode = response["payment_mode"];
//     existingPayment.respMsg = response["resp_message"];
//     existingPayment.tranStatus = response["trans_status"];
//     existingPayment.respCode = response["resp_code"];
//     existingPayment.bankRefId = response["bank_ref_id"];
//     existingPayment.pgRefId = response["pg_ref_id"];

//     await existingPayment.save();

//     // const payment = Payment.build({
//     //   businessId,
//     //   reviewerName,
//     //   description,
//     //   satisfactionRating,
//     //   mostLiked,
//     //   time,
//     // });
//     // await payment.save();

//     res.redirect(
//       process.env.redirectURL ||
//         `https://biz.hipal.life/order/${existingPayment.id}`
//     );
//   }
// );

router.post(
  '/v1/payments/Create/Mode',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    let { mode, businessId, commission } = req.body || {};

    try {
      let payment = await PaymentMode.findOne({ businessId, mode });
      if (payment) {
        return res.status(400).send('Mode already added !!');
      }

      payment = new PaymentMode({
        businessId,
        mode: mode,
        commission: commission,
      });

      const saveMode = await payment.save();
      return res.status(201).send(saveMode);
    } catch (error) {
      console.error('Error while processing the mode:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.post(
  '/v1/payments/Create/Dues',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    let { duesPersonNames, businessId } = req.body || {};

    try {
      if (!duesPersonNames) {
        return res.status(400).send('Name is Required!');
      }
      let dues = await Dues.findOne({
        businessId: businessId,
        duesPersonNames,
      });
      if (dues) {
        return res.status(400).send('Name Already exit...');
      } else {
        dues = new Dues({ businessId, duesPersonNames: duesPersonNames });
      }

      const saveDues = await dues.save();
      return res.status(201).send(saveDues);
    } catch (error) {
      console.error('Error while processing the dues:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// router.post(
//   "/v1/payments/Create/Alert",
//   // currentUser,
//   // requireAuthorization([
//   //   ClientRoles.RESTAURANT_OWNER,
//   //   ClientRoles.RESTAURANT_MANAGER,
//   // ]),
//   async (req: Request, res: Response) => {
//     let { businessId, uniqueName } = req.body || {};

//     try {
//       let alert = await PaymentAlert.findOne({
//         businessId,
//         uniqueName,
//       });
//       if (alert) {
//         return res.status(400).send("Name Already exit...");
//       } else {
//         await BusinessAlert.create({ ...req.body });
//         alert = new PaymentAlert({ ...req.body });
//       }

//       const saveAlert = await alert.save();
//       return res.status(201).send(saveAlert);
//     } catch (error) {
//       console.error("Error while processing the alert:", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// router.post(
//   "/v1/payments/Generate/Alert",
//   // currentUser,
//   // requireAuthorization([
//   //   ClientRoles.RESTAURANT_OWNER,
//   //   ClientRoles.RESTAURANT_MANAGER,
//   // ]),
//   async (req: Request, res: Response) => {
//     let { businessId } = req.query || {};

//     try {
//       const getPaymentAlert = await PaymentAlert.find({ businessId });
//       const getPaymentsModes = await PaymentMode.find({ businessId });

//       const calculateSale = (array: any) => {
//         let summary: any = {
//           totalSale: 0,
//           modes: {},
//         };

//         array.forEach((payment: any) => {
//           if (payment.mode) {
//             if (!summary.modes[payment.mode]) {
//               summary.modes[payment.mode] = 0;
//             }
//             summary.modes[payment.mode] += payment.total;
//           }
//         });

//         // Convert modes object to desired format
//         const modesArray = [];
//         for (const [mode, total] of Object.entries(summary.modes) as any) {
//           // Retrieve commission percentage for the mode
//           const commissionPercent = modes[mode] || 0;

//           // Calculate commission amount
//           const totalCommissionSale = (commissionPercent / 100) * total;

//           // Adjust totalSale by subtracting commission
//           const adjustedTotalSale = total - totalCommissionSale;
//           summary.totalSale += adjustedTotalSale;

//           modesArray.push({
//             mode: mode,
//             totalSale: adjustedTotalSale,
//             commissionPercent: commissionPercent,
//             totalCommissionSale: totalCommissionSale,
//           });
//         }

//         summary.modes = modesArray;
//         return modesArray;
//       };
//       let modes: any = {};
//       getPaymentsModes.forEach((element) => {
//         if (element?.mode) {
//           if (!modes[element.mode]) {
//             modes[element.mode] = element?.commission;
//           }
//         }
//       });
//       const dayAndDate = momentTimeZone.tz("Asia/Kolkata").format("YYYY-MM-DD"); // Adjust timezone as necessary
//       const existingPayments = await Payment.find({
//         businessId,
//         date: { $regex: `^${dayAndDate}` },
//       });

//       let result = calculateSale(existingPayments);
//       let mewObje: any = {};
//       result.forEach((element) => {
//         if (element?.mode) {
//           if (!mewObje[element.mode]) {
//             mewObje[element.mode] = element?.totalSale;
//           }
//         }
//       });
//       const day = momentTimeZone.tz("Asia/Kolkata").format("YYYY-MM-DD");
//       for (let i = 0; i < getPaymentAlert.length; i++) {
//         let element = getPaymentAlert[i];
//         if (mewObje[element?.uniqueName]) {
//           if (element?.lower == true) {
//             if (mewObje[element?.uniqueName] < element.amount) {
//               let newData = new BusinessAlert({
//                 businessId: element?.businessId,
//                 subject: element?.subject,
//                 uniqueName: element?.uniqueName,
//                 amount: element?.amount,
//                 higher: false,
//                 date: day,
//                 lower: true,
//                 value: mewObje[element?.uniqueName],
//               });
//               await newData.save();
//             }
//           } else if (element?.higher == true) {
//             console.log("higher");
//             console.log(
//               "predone",
//               typeof element.amount,
//               typeof mewObje[element?.uniqueName]
//             );

//             if (mewObje[element?.uniqueName] > element.amount) {
//               let newData = new BusinessAlert({
//                 businessId: element?.businessId,
//                 subject: element?.subject,
//                 uniqueName: element?.uniqueName,
//                 amount: element?.amount,
//                 higher: true,
//                 date: day,
//                 lower: false,
//                 value: mewObje[element?.uniqueName],
//               });
//               await newData.save();
//             }
//           }
//         }
//       }

//       return res.status(200).send("generate alert !");
//     } catch (error) {
//       console.error("Error while processing the alert:", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// router.post(
//   "/v1/payments/createLoyaltyAlert",
//   // currentUser,
//   // requireAuthorization([
//   //   ClientRoles.RESTAURANT_OWNER,
//   //   ClientRoles.RESTAURANT_MANAGER,
//   // ]),
//   async (req: Request, res: Response) => {
//     let { loyaltyId, businessName, ownerName } = req.body || {};

//     try {
//       let newPass = Math.floor(Math.random() * 9000) + 10000;
//       const exitingLoyaltyAlert = await BusinessAlert.findOne({
//         businessId: loyaltyId,
//         uniqueName: "loyaltyAlert",
//       });
//       if (exitingLoyaltyAlert) {
//         return res.status(400).send("Alert Already Send");
//       }
//       let createAlert = new BusinessAlert({
//         businessId: loyaltyId,
//         value: newPass,
//         subject: `${businessName} want to use your loyalty feature if yes please share your password to ${ownerName}`,
//         uniqueName: "loyaltyAlert",
//       });

//       const saveAlert = await createAlert.save();
//       return res.status(201).send(saveAlert);
//     } catch (error) {
//       console.error("Error while processing the dues:", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

router.post(
  '/v1/payments/discountAlert',
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
    // const day = momentTimeZone.tz("Asia/Kolkata").format("YYYY-MM-DD");

    try {
      let response = await axios.post(
        `https://graph.facebook.com/v17.0/${phoneId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: `${body?.phone}`,
          type: 'template',
          template: {
            name: 'discount',
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

                  //tableName
                  {
                    type: 'text',
                    text: `${body?.tableName}`,
                  },
                  //data&time
                  {
                    type: 'date_time',
                    date_time: {
                      fallback_value: `${'day'}`,
                      day_of_week: 3,
                      day_of_month: 22,
                      year: 2023,
                      month: 11,
                      hour: 17,
                      minute: 59,
                    },
                  },
                  //billNumber
                  {
                    type: 'text',
                    text: '10548',
                  },
                  //discountPercentage
                  {
                    type: 'text',
                    text: `${body?.discountPercentage}`,
                  },
                  //discountReason
                  {
                    type: 'text',
                    text: `${body?.discountReason}`,
                  },
                  //discountAmount
                  {
                    type: 'currency',
                    currency: {
                      fallback_value: `${body?.discount * 1000}`,
                      code: 'INR',
                      amount_1000: body?.discount * 1000,
                    },
                  },

                  //waiterName
                  {
                    type: 'text',
                    text: `${body?.waiterName}`,
                  },
                  //numbers of bills
                  {
                    type: 'text',
                    text: '1',
                  },

                  // discount amount
                  {
                    type: 'currency',
                    currency: {
                      fallback_value: `${body?.discount * 1000}`,
                      code: 'INR',
                      amount_1000: body?.discount * 1000,
                    },
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
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.post(
  '/v1/payments/saleAlert',
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    let body = req.body || {};

    console.log('bodys', body?.phone);
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
            name: 'salealert',
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
                    text: `${body?.date}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.totalSale}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.serviceCharge}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.taxes}`,
                  },

                  {
                    type: 'text',
                    text: `${body?.dues}`,
                  },

                  {
                    type: 'text',
                    text: `${body?.dineInTotal}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.takeAwayTotal}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.deliveryTotal}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.pos}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.upi}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.cash}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.online}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.card}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.zomato}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.swiggy}`,
                  },
                  //discountPercentage
                  {
                    type: 'text',
                    text: `${body?.percentage}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.upOrDown}`,
                  },
                ],
              },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.status(200).send(response);
    } catch (error) {
      console.error('Error while processing the dues:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

router.post(
  '/v1/payments/serviceChargeAlert',
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
            name: 'chargealert',
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
                  {
                    type: 'text',
                    text: `${body?.date}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.billNumber}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.serviceCharge}`,
                  },
                  {
                    type: 'text',
                    text: `${body?.reason}`,
                  },

                  {
                    type: 'text',
                    text: `${body?.customerName}`,
                  },

                  {
                    type: 'text',
                    text: `${body?.waiterName}`,
                  },
                ],
              },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.status(200).send(response);
    } catch (error: any) {
      console.error('Error while processing the dues:', error.message);
      return res.status(500).send(error.message);
    }
  },
);

// create review
router.post(
  '/v1/payments/reviews',

  async (req: Request, res: Response) => {
    const { businessId, reviewerPhone, reviewRating } = req.body || {};

    if (!businessId || !reviewerPhone || !reviewRating) {
      return res.status(400).send('businesId, reviewerPhone, reviewRating is required');
    }

    try {
      const addReview = await Reviews.create(req.body);

      if (!addReview) {
        return res.status(400).send('Review not  added');
      }

      return res.status(201).send({ id: addReview.id });
    } catch (error) {
      console.error('Error while processing the dues:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

//create customer
router.post(
  '/v1/payments/customer',

  // validateCustomer,
  // requireAuthorization([
  //   ClientRoles.HIPAL_CUSTOMER,
  //   ClientRoles.RESTAURANT_OWNER,
  // ]),

  async (req: Request, res: Response) => {
    const { businessId, phone, name } = req.body || {};

    if (!businessId || !phone) {
      return res.status(400).send('businessId, phone is required');
    }

    try {
      let customer = await ReviewsCustomer.findOne({ businessId, phone });

      if (customer) {
        customer = await ReviewsCustomer.findOneAndUpdate(
          { businessId, phone },
          {
            $inc: { count: 1 },
            date: Date.now(),
          },
          { new: true },
        );
      } else {
        customer = new ReviewsCustomer({
          businessId,
          phone,
          name,
          date: Date.now(),
          count: 1,
        });
        await customer.save();
      }

      if (customer) {
        if (customer.count === 1) {
          return res.status(201).send({ id: customer.id });
        } else {
          return res.status(200).send({ id: customer.id });
        }
      }

      return res.status(400).send('Customer not added');
    } catch (error) {
      console.error('Error while processing the customer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export { router as createPaymentRouter };
