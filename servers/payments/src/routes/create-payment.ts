import express, { Request, Response } from 'express';

import { Dues, Payment, PaymentMode, Reviews, ReviewsCustomer } from '@hi/db-models';
import {
  CustomerSchema,
  DuesSchema,
  orderSchema,
  PaymentModeSchema,
  PaymentSchema,
  RazorpayWebhookBodySchema,
  RazorpayWebhookHeadersSchema,
  ReviewsSchema,
  validatePaymentSchema,
} from '@hi/db-models/src/validators';
import axios from 'axios';
import { createHmac } from 'crypto';
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
const dayAndDate = momentTimeZone.tz('Asia/Kolkata').format('YYYY-MM-DD');

const decrypt = (encrypted: string) => {
  let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return decrypted + decipher.final('utf8');
};

import { runInTransaction } from '@hi/utils';
import { ClientSession } from 'mongoose';
import { nanoid } from 'nanoid';
const { validateWebhookSignature } = require('../utils/razorpay-utils');

import { razorpayWrapper } from '../razorpay-wrapper';

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

router.post(
  '/v1/payments/createOrder',
  // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),
  validateRequest({
    body: orderSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof orderSchema>>, res: Response) => {
    const { amount, currency, name, phone } = req.body || {};
    // SAVE ORDER IN DB LIMIT 1 MINS
    // SAVE NAME AND PHONE IN DB
    TODO: const uniqueOrderId = nanoid(10);
    const response = await razorpayWrapper.client.orders.create({
      amount: amount * 100,
      currency: currency,
      receipt: uniqueOrderId,
      notes: {
        name: name,
        phone: phone,
      },
    });

    res.status(200).send({ err: false, message: 'Order created successfully', data: response.id });
  },
);

router.post(
  '/v1/payments/validPayment',
  // requireAuthorization([ClientRoles.HIPAL_CUSTOMER]),

  validateRequest({
    body: validatePaymentSchema,
  }),
  async <T, K>(req: Request<T, K, z.infer<typeof validatePaymentSchema>>, res: Response) => {
    const { response } = req.body || {};
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

    const signature = createHmac('sha256', process.env.RAZORPAY_SECRET as string)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (signature === razorpay_signature) {
      return res.status(200).send({ err: false, message: 'Payment is valid', data: razorpay_order_id });
    } else {
      return res.status(400).send({ err: true, message: 'Payment is not valid' });
    }
  },
);

router.post('/v1/payments/razorpay-webhook', async (req: Request, res: Response) => {
  await runInTransaction(async (session: ClientSession) => {
    const headersResult = RazorpayWebhookHeadersSchema.safeParse(req.headers);
    if (!headersResult.success) {
      throw new Error('Invalid headers');
    }
    const { 'x-razorpay-signature': razorpaySignature, 'x-razorpay-event-id': razorpayEventId } = headersResult.data;

    const isSignatureValid = validateWebhookSignature(JSON.stringify(req.body), razorpaySignature, process.env.RAZORPAY_WEBHOOK_SECRET as string);
    if (!isSignatureValid) {
      console.log('Invalid signature');
      throw new Error('Invalid signature');
    }

    const bodyResult = RazorpayWebhookBodySchema.safeParse(req.body);
    if (!bodyResult.success) {
      throw new Error('Invalid body');
    }
    const { event, payload } = bodyResult.data;

    if (event === 'payment.captured') {
      console.log('payment captured');
      // create alert for payment captured
      // await Alert.create(
      //   {
      //     businessId: payload.payment.entity.notes.businessId,
      //     tableName: payload.payment.entity.notes.tableName,
      //     tableId: payload.payment.entity.notes.tableId,
      //     zoneId: payload.payment.entity.notes.zoneId,
      //     staffId: payload.payment.entity.notes.staffId,
      //     status: 'PAID_BY_ONLINE',
      //     time: payload.payment.entity.created_at,
      //     message: `Paid ${payload.payment.entity.notes.total}`,
      //     razorpayPaymentId: payload.payment.entity.id,
      //     razorpayOrderId: payload.payment.entity.order_id,
      //     razorpayAcquirerData: payload.payment.entity.acquirer_data,
      //     mode: payload.payment.entity.method,
      //     razorpayEventId: razorpayEventId,
      //   },
      //   { session },
      // );

      // const tableId = payload.payment.entity.notes.tableId;

      // await Kot.updateMany({ tableId, status: 'UNPAID' }, { status: 'PAID', cookedAt: Date.now() }, { session });

      // const updatedKOTs = await Kot.find({ tableId, status: 'PAID', isDeleted: false }, null, { session });

      // const created: KOTType[] = updatedKOTs.map((kot) => kot.toObject());

      // const items = created.map((kot: any) => {
      //   const newobj: PaymentItemType = {
      //     name: kot.dish?.name,
      //     quantity: kot.dish?.qty || kot.dish?.quantity,
      //     amount: kot.dish?.price,
      //     category: kot.category,
      //     portions: kot.dish?.portions,
      //     extras: kot.dish?.extras,
      //     comments: 'spicy',
      //   };

      //   let price = 0;
      //   if (newobj.portions) {
      //     price = parseInt(newobj.portions.price) * (newobj.quantity || 1);
      //   } else {
      //     price = newobj.amount || 0;
      //   }

      //   let extrasPrice = 0;
      //   if (newobj.extras?.length > 0) {
      //     for (const extra of newobj.extras) {
      //       extrasPrice += parseInt(extra.price || 0) * (extra.quantity || extra.qty);
      //     }
      //   }

      //   newobj.amount = price + extrasPrice || 0;

      //   return newobj;
      // });

      // await Tempmodel.deleteOne(
      //   {
      //     tableId: tableId,
      //   },
      //   { session },
      // );

      // await Tempmodel.findOneAndUpdate({ tableId }, { $set: { hiCode: payload.payment.entity.notes.hiCode } }, { upsert: true, session });

      // save payment Object in payment collection
      await Payment.create(
        [
          {
            businessId: payload.payment.entity.notes.businessId,
            date: dayAndDate,
            // items: [],
            // subTotal: Number(payload.payment.entity.notes.subTotal) || 0,
            // sgst: Number(payload.payment.entity.notes.cgst)?.toFixed(2) || 0,
            // cgst: Number(payload.payment.entity.notes.cgst)?.toFixed(2) || 0,
            total: payload.payment.entity.notes.total,
            // paymentMode: payload.payment.entity.method || 'Online',
            // paymentDate: payload.payment.entity.notes.dayAndDate || '',
            mode: payload.payment.entity.method,
            customerName: payload.payment.entity.notes.name,
            customerPhone: payload.payment.entity.notes.phone,
            // discount: payload.payment.entity.notes.discount || 0,
            // zoneId: payload.payment.entity.notes.zoneId || '',
            // tableId: payload.payment.entity.notes.tableId || '',
            // time: payload.payment.entity.notes.indianTime || '',
            // tableName: payload.payment.entity.notes.tableName || '',
            claimedAmount: payload.payment.entity.notes.claimedAmount || 0,
            // serviceCharge: payload.payment.entity.notes.serviceCharge || 0,
            tips: payload.payment.entity.notes.tips || 0,
            zoneType: 'Dine In',
            razorpayPaymentId: payload.payment.entity.id,
            razorpayOrderId: payload.payment.entity.order_id,
            razorpayAcquirerData: payload.payment.entity.acquirer_data,
            razorpayEventId: razorpayEventId,
          },
        ],
        { session },
      );

      //TODO: LINK PAYMENT OBJECT WITH ORDER OBJECT

      // const updateConfig = {
      //   status: 'Empty',
      //   activeUser: 0,
      //   time: '',
      //   totalDishQuantity: 0,
      //   deliveredDish: 0,
      //   role: null,
      //   hiCode: '',
      //   mergedBy: '',
      //   reservedBy: '',
      // };
      // await Table.findByIdAndUpdate(tableId, updateConfig, { session });
    }
    //todo: add before capture event

    if (event === 'payment.failed') {
      console.log('payment failed');
      // create alert for payment failed
      // await Alert.create(
      //   {
      //     businessId: payload.payment.entity.notes.businessId,
      //     tableName: payload.payment.entity.notes.tableName,
      //     tableId: payload.payment.entity.notes.tableId,
      //     zoneId: payload.payment.entity.notes.zoneId,
      //     staffId: payload.payment.entity.notes.staffId,
      //     status: 'FAIL',
      //     time: payload.payment.entity.created_at,
      //     message: `FAIL ${payload.payment.entity.notes.total}`,
      //     razorpayPaymentId: payload.payment.entity.id || '',
      //     razorpayOrderId: payload.payment.entity.order_id || '',
      //     razorpayAcquirerData: payload.payment.entity.acquirer_data || '',
      //     mode: payload.payment.entity.method,
      //     razorpayEventId: razorpayEventId || '',
      //   },
      //   { session },
      // );
    }
  });

  return res.status(200).send({ err: false, message: 'Webhook processed successfully', data: {} });
});

export { router as createPaymentRouter };
