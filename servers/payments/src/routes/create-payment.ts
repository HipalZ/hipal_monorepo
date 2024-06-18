import express, { Request, Response } from 'express';

import { Dues, Payment, PaymentMode, Reviews, ReviewsCustomer } from '@hi/db-models';
import { CustomerSchema, DuesSchema, PaymentModeSchema, PaymentSchema, ReviewsSchema } from '@hi/db-models/src/validators';
import axios from 'axios';
import momentTimeZone from 'moment-timezone';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';
import { ClientRoles, requireAuthorization } from '@hi/common';

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
  validateRequest({
    body: PaymentSchema,
  }),
  requireAuthorization([ClientRoles.HIPAL_CUSTOMER, ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_STAFF]),
  async <T, K>(req: Request<T, K, z.infer<typeof PaymentSchema>>, res: Response) => {
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

      new Date().toISOString().replace('T', ' ').slice(0, 19);

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

      res.status(201).send({
        err:false,
        message:'',
        data:payment
      });
    } catch (err: any) {
      console.log('error', err);
      return res.status(500).send({ status: false, mes: err, data: {}, err:true });
    }
  },
);

router.post(
  '/v1/payments/Create/Mode',
  requireAuthorization([ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: PaymentModeSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof PaymentModeSchema>>, res: Response) => {
    let { mode, businessId, commission } = req.body || {};

      let payment = await PaymentMode.findOne({ businessId, mode });
      if (payment) {
        return res.status(400).send({
          err:true,
          message:'Mode Already exists...',
          data:{}
        });
      }

      payment = new PaymentMode({
        businessId,
        mode: mode,
        commission: commission,
      });

      const saveMode = await payment.save();
      return res.status(201).send({
        err:false,
        message:'mode created successfully',
        data:saveMode
      });
  },
);

router.post(
  '/v1/payments/Create/Dues',
  requireAuthorization([ClientRoles.RESTAURANT_MANAGER, ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_STAFF]),
  validateRequest({
    body: DuesSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof DuesSchema>>, res: Response) => {
    let { duesPersonNames, businessId } = req.body || {};

      if (!duesPersonNames) {
        return res.status(400).send({
          err:true,
          message:'Name is required',
          data:{}
        });
      }
      let dues = await Dues.findOne({
        businessId: businessId,
        duesPersonNames,
      });
      if (dues) {
        return res.status(400).send({
          err:true,
          message:'Name Already exists...',
          data:{}
        });
      } else {
        dues = new Dues({ businessId, duesPersonNames: duesPersonNames });
      }

      const saveDues = await dues.save();
      return res.status(201).send({
        err:true,
        message:'Dues created successfully',
        data:saveDues
      });
  },
);

router.post(
  '/v1/payments/discountAlert',
  // currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_STAFF
  ]),

  async (req: Request, res: Response) => {
    let body = req.body || {};

    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';
    // const day = momentTimeZone.tz("Asia/Kolkata").format("YYYY-MM-DD");

      await axios.post(
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
      return res.status(200).send({
        err:false,
        message:'discountAlert sent successfully',
        data:{}
      });
  },
);

router.post(
  '/v1/payments/saleAlert',
  // currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_STAFF
  ]),
  async (req: Request, res: Response) => {
    let body = req.body || {};
    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';

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
      return res.status(200).send({
        err:false,
        message:'saleAlert sent successfully',
        data:response
      });

  },
);

router.post(
  '/v1/payments/serviceChargeAlert',
  // currentUser,
  requireAuthorization([
    ClientRoles.RESTAURANT_OWNER,
    ClientRoles.RESTAURANT_MANAGER,
    ClientRoles.RESTAURANT_STAFF
  ]),
  async (req: Request, res: Response) => {
    let body = req.body || {};

    const token =
      'EAATwS76f2vQBOZCKcsKjOKz8KtAdo7sI2bnXgFqcsSKRR4uuhPZCGZBr2rrJg3lBCiQW6fCxVhOC6GtmOFe00ERIALt2xDUZCAEZCKtbk96IMXSrX3IYeVOaBx3PLodGcEd9xbUZCddjbis5ABhgHq6WBWZAoAhmvTMVJPohZCdwr8RbqlV5dGBKyFq7VtiCyLKn';
    const phoneId = '104262732724546';

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
      return res.status(200).send({
        err:false,
        message:'serviceChargeAlert sent successfully',
        data:response
      });
  },
);

// create review
router.post(
  '/v1/payments/reviews',
  requireAuthorization([
    ClientRoles.HIPAL_CUSTOMER
  ]),
  validateRequest({
    body: ReviewsSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof ReviewsSchema>>, res: Response) => {
    const { businessId, reviewerPhone, reviewRating, order_id } = req.body || {};

    if (!businessId || !reviewerPhone || !reviewRating || !order_id) {
      return res.status(400).send({
        err:true,
        data:{},
        message: 'businessId, reviewerPhone, reviewRating, order_id is required'
      });
    }

      const review = await Reviews.findOne({ order_id: order_id });

      if (review) {
        return res.status(400).send({
          err:true,
          message:'Review already added',
          data:{}
        });
      }

      const addReview = await Reviews.create(req.body);

      if (!addReview) {
        return res.status(400).send({
          err:true,
          message:'Review not added',
          data:{}
        });
      }

      return res.status(201).send({ err:false, message:'', data:addReview._id,id: addReview._id });
  },
);

//create customer
router.post(
  '/v1/payments/customer',
  requireAuthorization([
    ClientRoles.HIPAL_CUSTOMER
  ]),
  validateRequest({
    body: CustomerSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof CustomerSchema>>, res: Response) => {
    const { businessId, phone, name } = req.body || {};

    if (!businessId || !phone) {
      return res.status(400).send({
        err:true,
        data:{},
        message: 'businessId, phone is required',
      });
    }

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
          return res.status(201).send({ err:false, message:'Review added successfully', data:customer._id ,id: customer._id });
        } else {
          return res.status(200).send({ err:true, message: 'You have already submitted', data:customer._id,id: customer.id });
        }
      }

      return res.status(400).send({
        err:true,
        data:{},
        message: 'Customer not added',
      });
  },
);

export { router as createPaymentRouter };
