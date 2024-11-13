import {
  BusinessSettings,
  CouponLink,
  Couponz,
  WhatAppOrder,
  WhatAppTemplate,
  WhatsAppPayment,
  WhatsAppTemplateLimit,
  WhatsAppWallet,
  WhatsAppWalletHistory,
} from "@hi/db-models";
import {
  RazorpayWebhookHeadersSchema,
  WhatAppRazorpayWebhookBodySchema,
  campaignSchema,
  validatePaymentSchema,
  validateWhatAppTemplateSchema,
  whatsAppLimitSchema,
  whatsAppOrderSchema,
  whatsAppWalletHistorySchema,
} from "@hi/db-models/src/validators";
import { createHmac } from "node:crypto";

import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getMerchantConfig } from "../../utils/cacheHelper";
import {
  type MerchantConfig,
  razorpayWrapper,
} from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";
import { whatsAppConfig } from "../../utils/whatAppTemplate";
import { runInTransaction } from "@hi/utils";
import type { ClientSession } from "mongoose";
interface AxiosError {
  response?: {
    status?: number;
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message: string;
}

const functionToCheckBodyVariable = async (
  businessName: string,
  address: string,
  bodyvariblesequence: string[],
  customer: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      phone: string;
      email?: string;
    };
  },
) => {
  const ans = [];

  for (const variable of bodyvariblesequence) {
    let value: string | undefined;

    if (variable === "name") {
      value = customer?.userId?.name?.toString();
    } else if (variable === "phone") {
      value = customer?.userId?.phone?.toString();
    } else if (variable === "businessName") {
      value = businessName?.toString();
    } else if (variable === "email") {
      value = customer?.userId?.email?.toString();
    } else if (variable === "address") {
      value = address?.toString();
    } else if (variable === "time") {
      value = new Date().toLocaleString();
    } else if (variable === "date") {
      value = new Date().toLocaleDateString("en-GB");
    }

    if (value !== undefined) {
      ans.push({
        type: "text",
        text: value,
      });
    }
  }

  return ans;
};

const outPut = async (
  businessName: string,
  address: string,
  bodyvariblesequence: string[],
  customer: {
    name: string;
    phone: string;
  },
) => {
  const ans = [];

  for (const variable of bodyvariblesequence) {
    let value: string | undefined;

    if (variable === "name") {
      value = customer?.name?.toString();
    } else if (variable === "phone") {
      value = customer?.phone?.toString();
    } else if (variable === "businessName") {
      value = businessName?.toString();
    } else if (variable === "address") {
      value = address?.toString();
    } else if (variable === "time") {
      value = new Date().toLocaleString();
    } else if (variable === "date") {
      value = new Date().toLocaleDateString("en-GB");
    }

    if (value !== undefined) {
      ans.push({
        type: "text",
        text: value,
      });
    }
  }

  return ans;
};

const whatsappRouter = new Hono()
  .get(
    "/template/all/:businessId",

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      try {
        const { businessId } = c.req.param();

        const getWhatAppTemplate = await WhatAppTemplate.find({
          businessId,
          isDeleted: false,
        }).select("templateId");

        const templateIds = getWhatAppTemplate.map(
          (template) => template.templateId,
        );

        const templatesArray = [];

        for (const templateId of templateIds) {
          const getWhatAppTemplate = await axios.get(
            `https://graph.facebook.com/${whatsAppConfig.version}/${templateId}`,
            {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            },
          );

          templatesArray.push(getWhatAppTemplate.data);
        }

        return c.json(
          {
            message: "fetched successfully",
            err: false,
            data: templatesArray,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message =
          axiosError.response?.data?.error?.message || axiosError.message;

        return c.json(
          {
            message: `Error fetching template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .post(
    "/template",
    zValidator("json", validateWhatAppTemplateSchema),
    async (c) => {
      try {
        const requestData = await c.req.json();
        const {
          bodyVariableSequence,
          headerVariableSequence,
          footerVariableSequence,
          businessId,
        } = requestData;

        const templateNameAlreadyExist = await WhatAppTemplate.findOne({
          templateName: requestData.name,
        }).select("templateName");

        if (templateNameAlreadyExist) {
          return c.json(
            {
              message: "Template name already exist",
              err: true,
              data: {},
            },
            400,
          );
        }

        const { status, data } = await axios.post(
          `https://graph.facebook.com/v21.0/${whatsAppConfig.whatAppAccountId}/message_templates`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        if (status === 200) {
          if (data.status === "REJECTED") {
            return c.json(
              {
                message: "Your template has been rejected!",
                err: true,
                data: {},
              },
              400,
            );
          }

          if (data.status === "PENDING") {
            const { id } = data;

            const createTemplate = await WhatAppTemplate.create({
              templateId: id,
              bodyVariableSequence,
              headerVariableSequence,
              footerVariableSequence,
              businessId,
              date: Date.now(),
              templateName: requestData?.name,
              languageCode: requestData?.language,
              imageUrl: requestData?.imageUrl,
            });

            if (!createTemplate) {
              return c.json(
                {
                  message: "Error creating template",
                  err: true,
                  data: {},
                },
                400,
              );
            }
          }

          return c.json(
            {
              message: "Template created successfully",
              err: false,
              data,
            },
            201,
          );
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
          axiosError.response?.data?.error?.message || axiosError.message;

        return c.json(
          {
            message: `Error creating template: ${errorMessage}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )

  .get(
    "/template/:templateid",

    zValidator("param", z.object({ templateid: z.string() })),

    async (c) => {
      const { templateid } = c.req.param();

      try {
        const getWhatAppTemplate = await axios.get(
          `https://graph.facebook.com/${whatsAppConfig.version}/${templateid}`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        return c.json(
          {
            message: "fetched successfully",
            err: false,
            data: getWhatAppTemplate.data,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message =
          axiosError.response?.data?.error?.message || axiosError.message;

        return c.json(
          {
            message: `Error fetching template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .put(
    "/template/:templateid",

    zValidator("param", z.object({ templateid: z.string() })),
    zValidator("json", validateWhatAppTemplateSchema.partial()),

    async (c) => {
      const { templateid } = c.req.param();

      const requestData = await c.req.json();

      try {
        const updateWhatAppTemplate = await axios.post(
          `https://graph.facebook.com/${whatsAppConfig.version}/${templateid}`,
          {
            ...requestData,
          },
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        return c.json(
          {
            message: "Edited successfully",
            err: false,
            data: updateWhatAppTemplate.data,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message =
          axiosError.response?.data?.error?.message || axiosError.message;

        return c.json(
          {
            message: `Error updating template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .delete(
    "/template/:template_name/:templateid",

    zValidator(
      "param",
      z.object({ template_name: z.string(), templateid: z.string() }),
    ),

    async (c) => {
      try {
        const { template_name, templateid } = c.req.param();

        await axios.delete(
          `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.whatAppAccountId}/message_templates?name=${template_name}`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        const deleteTemplate = await WhatAppTemplate.findOneAndUpdate(
          {
            templateId: templateid,
          },
          {
            isDeleted: true,
          },
        );

        if (!deleteTemplate) {
          return c.json(
            {
              message: "Error deleting template",
              err: true,
              data: {},
            },
            400,
          );
        }

        return c.json(
          {
            message: "Template deleted successfully",
            err: false,
            data: {},
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message =
          axiosError.response?.data?.error?.message || axiosError.message;

        return c.json(
          {
            message: `Error creating template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .post(
    "/template/campaign",
    zValidator("json", campaignSchema),
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.MANAGER]),
    async (c) => {
      try {
        const requestData = await c.req.json();
        const {
          businessId,
          templateId,
          allCustomers,
          bulkCustomers,
          customerPhone,
          groupIds,
          businessName,
          sendLaterTime,
          address,
        } = requestData;

        const template = await WhatAppTemplate.findOne({
          businessId,
          templateId,
        });

        const bodyVariableSequence = template?.bodyVariableSequence as string[];

        const imageUrl = template?.imageUrl;

        if (!template) {
          return c.json(
            {
              message: "Template not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        if (allCustomers) {
          // const allCustomersList = await Subscriber.find({
          //   businessId,
          // })
          //   .select("userId")
          //   .populate({
          //     path: "userId",
          //     select: "phone name",
          //   });

          const allCustomersList = [
            {
              _id: "66b5e75e9bc1f065777a46cd",
              userId: {
                _id: "665ee8aab437be96f17c6f64",
                name: "Datta",
                phone: "9588413799",
              },
            },
            {
              _id: "66b5e75e9bc1f065777a46d0",
              userId: {
                _id: "665ee910b437be96f17c6f68",
                name: "vamsi",
                phone: "7702605494",
              },
            },
            {
              _id: "66b5e75e9bc1f065777a46d3",
              userId: {
                _id: "666007fb241426acafd47fb0",
                name: "Sankalesh",
                phone: "8668229890",
              },
            },
            {
              _id: "66b5e75e9bc1f065777a46d6",
              userId: {
                _id: "667670781570550c31c59526",
                name: "Abhishek",
                phone: "9160787050",
              },
            },
            {
              _id: "66b5e75e9bc1f065777a46d9",
              userId: {
                _id: "6690e44b80e8eae20f9ac7be",
                name: "Rishabh",
                phone: "9177914130",
              },
            },
            {
              _id: "66b5e75e9bc1f065777a46d9",
              userId: {
                _id: "6690e44b80e8eae20f9ac7be",
                name: "Ravi",
                phone: "7731843582",
              },
            },
          ];

          for (const customer of allCustomersList) {
            const parameters = await functionToCheckBodyVariable(
              businessName,
              address,
              bodyVariableSequence,
              customer,
            );

            const components = [];

            // Conditionally add HEADER component
            if (imageUrl) {
              components.push({
                type: "HEADER",
                parameters: [
                  {
                    type: "image",
                    image: {
                      link: imageUrl,
                    },
                  },
                ],
              });
            }

            components.push({
              type: "BODY",
              parameters: parameters,
            });

            try {
              const res = await axios.post(
                `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
                {
                  messaging_product: "whatsapp",
                  to: customer?.userId?.phone?.toString(),
                  type: "template",
                  template: {
                    name: template.templateName || "festivals_template",
                    language: { code: template.languageCode || "en_GB" },
                    components: components,
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                },
              );
            } catch (error) {
              const axiosError = error as AxiosError;
              const message =
                axiosError.response?.data?.error?.message || axiosError.message;

              return c.json(
                {
                  message: `Error creating template: ${message}`,
                  err: true,
                  data: axiosError.response?.data || {},
                },
                400,
              );
            }
          }
        }

        if (bulkCustomers.length > 0) {
          const bulkCustomersList = [
            {
              name: "YEYE",
              phone: "9588413799",
            },
            {
              name: "sankalesh",
              phone: "8668229890",
            },
            {
              name: "vamsi",
              phone: "7702605494",
            },
            {
              name: "abhishek",
              phone: "9160787050",
            },
          ];
          for (const customer of bulkCustomersList) {
            const parameters = await outPut(
              businessName,
              address,
              bodyVariableSequence,
              customer,
            );

            const components = [];
            // Conditionally add HEADER component
            if (imageUrl) {
              components.push({
                type: "HEADER",
                parameters: [
                  {
                    type: "image",
                    image: {
                      link: imageUrl,
                    },
                  },
                ],
              });
            }

            components.push({
              type: "BODY",
              parameters: parameters,
            });

            try {
              await axios.post(
                `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
                {
                  messaging_product: "whatsapp",
                  to: customer?.phone?.toString(),
                  type: "template",
                  template: {
                    name: template.templateName || "festivals_template",
                    language: { code: template.languageCode || "en_GB" },
                    components: components,
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                },
              );
            } catch (error) {
              const axiosError = error as AxiosError;
              const message =
                axiosError.response?.data?.error?.message || axiosError.message;

              return c.json(
                {
                  message: `Error creating template: ${message}`,
                  err: true,
                  data: axiosError.response?.data || {},
                },
                400,
              );
            }
          }
        }

        if (groupIds.length > 0) {
          const groupIdsList = [
            {
              name: "YEYE",
              phone: "9588413799",
            },
            {
              name: "sankalesh",
              phone: "8668229890",
            },
            {
              name: "vamsi",
              phone: "7702605494",
            },
            {
              name: "abhishek",
              phone: "9160787050",
            },
          ];

          // for (let i = 0; i < groupIds.length; i++) {
          //   const group = await GroupModel.findOne({
          //     _id: groupIds[i],
          //   }).select("userIds");

          //   for (const user of group.userIds || []) {
          //     const findUser = await Subscriber.findOne({
          //       userId: user,
          //     })
          //       .select("userId")
          //       .populate({
          //         path: "userId",
          //         select: "phone name",
          //       });
          //     groupIdsList.push({
          //       name: findUser?.userId?.name,
          //       phone: findUser?.userId?.phone,
          //     });
          //   }
          // }

          for (const customer of groupIdsList) {
            try {
              const parameters = await outPut(
                businessName,
                address,
                bodyVariableSequence,
                customerPhone,
              );

              const components = [];

              if (imageUrl) {
                components.push({
                  type: "HEADER",
                  parameters: [
                    {
                      type: "image",
                      image: {
                        link: imageUrl,
                      },
                    },
                  ],
                });
              }

              components.push({
                type: "BODY",
                parameters: parameters,
              });

              const sendTemplateMessageToCustomer = await axios.post(
                `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
                {
                  messaging_product: "whatsapp",
                  to: customer.phone.toString(),
                  type: "template",
                  template: {
                    name: template.templateName || "festivals_template",
                    language: { code: template.languageCode || "en_GB" },
                    components: components,
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                },
              );
            } catch (error) {
              const axiosError = error as AxiosError;
              const message =
                axiosError.response?.data?.error?.message || axiosError.message;

              return c.json(
                {
                  message: `Error creating template: ${message}`,
                  err: true,
                  data: axiosError.response?.data || {},
                },
                400,
              );
            }
          }
        }

        return c.json(
          {
            message: "Template created successfully",
            err: false,
            data: {
              success: true,
            },
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message =
          axiosError.response?.data?.error?.message ?? axiosError.message;

        return c.json(
          {
            message: `Error creating template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .get(
    "/template/analytics/:businessId",

    zValidator(
      "query",
      z.object({
        start: z.string().optional(),
        end: z.string().optional(),

        template_ids: z.array(z.string()).optional(),
      }),
    ),
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      try {
        const { businessId } = c.req.param();

        let allTemplates = await WhatAppTemplate.find({
          businessId,
          isDeleted: false,
        }).select("templateId");

        allTemplates = allTemplates
          .map((template) => template.templateId)
          ?.slice(0, 10);

        const getWhatAppTemplate = await axios.get(
          `https://graph.facebook.com/v21.0/${whatsAppConfig.whatAppAccountId}/template_analytics?start=1730979600&end=1731152438&granularity=daily&metric_types=cost,clicked,delivered,read,sent&template_ids=${allTemplates}`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        const templateids = [];

        let totalSent = 0;
        let totalRead = 0;
        let totalDelivered = 0;
        let totalClicked = 0;
        let totalCost = 0;

        for (const dataPoint of getWhatAppTemplate.data.data[0].data_points) {
          const templateid = dataPoint.template_id;

          const anaLyticsObject = dataPoint;

          const getWhatAppTemplateName = await axios.get(
            `https://graph.facebook.com/${whatsAppConfig.version}/${templateid}`,
            {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            },
          );

          let calculateTotalclicked = 0;
          if (anaLyticsObject?.clicked) {
            for (const click of anaLyticsObject.clicked) {
              calculateTotalclicked += click.count || 0;
            }
          }

          let calculateTotalcost = 0;
          if (anaLyticsObject?.cost) {
            for (const cost of anaLyticsObject.cost) {
              calculateTotalcost += cost.value || 0;
            }
          }

          const newObj = {
            templateName: getWhatAppTemplateName.data.name,
            sent: anaLyticsObject.sent,
            read: anaLyticsObject.read,
            delivered: anaLyticsObject.delivered,
            clicked: calculateTotalclicked,
            cost: Math.round(calculateTotalcost),
          };

          templateids.push(newObj);

          totalSent += anaLyticsObject.sent;
          totalRead += anaLyticsObject.read;
          totalDelivered += anaLyticsObject.delivered;
          totalClicked += calculateTotalclicked;
          totalCost += calculateTotalcost;
        }

        // @ts-ignore
        const mergeTemplates = (templateids) => {
          const result = {};

          // Using for...of to iterate through templateids
          for (const item of templateids) {
            // @ts-ignore
            if (!result[item.templateName]) {
              // @ts-ignore
              result[item.templateName] = { ...item };
            } else {
              // @ts-ignore
              result[item.templateName].sent += item.sent;
              // @ts-ignore
              result[item.templateName].read += item.read;
              // @ts-ignore
              result[item.templateName].delivered += item.delivered;
              // @ts-ignore
              result[item.templateName].clicked += item.clicked;
              // @ts-ignore
              result[item.templateName].cost += item.cost;
            }
          }

          return Object.values(result);
        };

        const mergedData = mergeTemplates(templateids);

        const totalObj = {
          totalSent,
          totalRead,
          totalDelivered,
          totalClicked,
          totalCost,
        };

        mergedData.push(totalObj);

        return c.json(
          {
            message: "fetching all templates",
            err: false,
            data: mergedData,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message =
          axiosError.response?.data?.error?.message || axiosError.message;

        return c.json(
          {
            message: `Error creating template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .get(
    "/whatsapp_wallet/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const wallet = await WhatsAppWallet.findOne({
        businessId,
      });

      if (!wallet) {
        return c.json(
          {
            message: "Wallet not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Wallet found",
          err: false,
          data: wallet,
        },
        200,
      );
    },
  )
  .get(
    "/whatsapp_wallet/history/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),
    zValidator(
      "query",
      z.object({ from: z.string().optional(), to: z.string().optional() }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const { from, to } = c.req.query();

      const fromDate = from
        ? new Date(Number(from))
        : new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(Number(to)) : new Date();

      const walletHistory = await WhatsAppWalletHistory.find({
        businessId,
        date: { $gte: Number(fromDate), $lte: Number(toDate) },
      })
        .populate({
          path: "userId",
          select: "name",
        })
        .populate({
          path: "order_id",
          select: "total billValue",
        });

      return c.json(
        {
          message: "Wallet history",
          err: false,
          data: walletHistory,
        },
        200,
      );
    },
  )
  .post(
    "/wallet/credit",

    zValidator("json", whatsAppWalletHistorySchema),

    async (c) => {
      const { amount, userId, businessId } = await c.req.json();

      const wallet = await WhatsAppWallet.findOneAndUpdate(
        {
          businessId,
        },
        {
          $inc: { currentBalance: amount },
        },
        {
          new: true,
          upsert: true,
        },
      );

      if (!wallet) {
        return c.json(
          {
            message: "Wallet not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      await WhatsAppWalletHistory.create({
        businessId,
        amount,
        userId,
        date: Date.now(),
      });

      return c.json(
        {
          message: "Wallet credited",
          err: false,
          data: wallet,
        },
        200,
      );
    },
  )
  .post(
    "/template_config",
    zValidator("json", whatsAppLimitSchema),

    async (c) => {
      const {
        businessId,
        templateLimit,
        marketingTemplateCharge,
        utilityTemplateCharge,
      } = await c.req.json();

      const config = await WhatsAppTemplateLimit.findOneAndUpdate(
        {
          businessId,
        },
        {
          templateLimit,
          marketingTemplateCharge,
          utilityTemplateCharge,
        },
        {
          new: true,
          upsert: true,
        },
      );

      if (!config) {
        return c.json(
          {
            message: "config not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "config credited",
          err: false,
          data: config,
        },
        200,
      );
    },
  )
  .get(
    "/coupon_link/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const couponLink = await Couponz.find({
        businessId,
        isDeleted: false,
        isExpired: false,
      }).select("name _id");

      const couponLinkArray = [];

      for (const coupon of couponLink) {
        const couponLink = await CouponLink.findOne({
          couponId: coupon._id,
        }).select("link");
        couponLinkArray.push({
          name: coupon.name,
          link: couponLink?.link,
        });

        couponLinkArray.push(couponLink);
      }

      return c.json(
        {
          message: "fetched successfully",
          err: false,
          data: couponLinkArray,
        },
        200,
      );
    },
  )
  .post(
    "/create_whatsapp_order/:merchantId",
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
    zValidator("json", whatsAppOrderSchema),
    zValidator("param", z.object({ merchantId: z.string() })),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
        const {
          total,
          billValue,
          currency,
          userId,
          businessId,
          couponId,
          channelId,
        } = requestData;
        const { merchantId } = c.req.param();
        const uniqueOrderId = nanoid(15);

        const client = await razorpayWrapper.getClient(merchantId);
        const response = await client.orders.create({
          amount: total * 100, // Fixed multiplication logic
          currency: currency,
          receipt: uniqueOrderId,
        });
        const saveOrder = await WhatAppOrder.create(
          [
            {
              total,
              currency,
              billValue,
              businessId,
              receipt: uniqueOrderId,
              userId,
              order_id: response.id,
              couponId,
              channelId,
              date: Date.now(),
            },
          ],
          { session },
        );
        if (!saveOrder || !response)
          return respond(c, "Order not created", true, 400, {});

        return respond(c, "Order created successfully", false, 200, {
          order_id: response.id,
        });
      });
    },
  )
  .post("/whatsapp_webhook/:merchantId", async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { merchantId } = c.req.param();
      const merchantConfig = (await getMerchantConfig(
        merchantId,
      )) as MerchantConfig;

      let RAZORPAY_WEBHOOK_SECRET = "";
      const body = await c.req.json();
      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select("razorpayWebhookSecret");
        RAZORPAY_WEBHOOK_SECRET = merchant?.razorpayWebhookSecret || "";
      } else {
        RAZORPAY_WEBHOOK_SECRET = merchantConfig.razorpayWebhookSecret;
      }

      if (!RAZORPAY_WEBHOOK_SECRET) {
        console.log("razorpay_webhook_secret missing");
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(
        c.req.header(),
      );
      if (!headersResult.success) {
        console.log("Invalid headers");
        return respond(c, "Invalid headers", true, 200, {});
      }

      const {
        "x-razorpay-signature": razorpaySignature,
        "x-razorpay-event-id": razorpayEventId,
      } = headersResult.data;

      const isSignatureValid = validateWebhookSignature(
        JSON.stringify(body),
        razorpaySignature,
        RAZORPAY_WEBHOOK_SECRET,
      );
      if (!isSignatureValid) {
        console.log("Invalid signature");
        return respond(c, "Invalid signature", true, 200, {});
      }

      const bodyResult = WhatAppRazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        console.log("Invalid body", bodyResult);

        return respond(c, "Invalid body", true, 200, {});
      }
      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await WhatAppOrder.findOne({
        order_id: payload.payment.entity.order_id,
      });

      if (event === "payment.failed") {
        const alertExist = await WhatsAppWalletHistory.findOne({
          order_id: getOrder?._id,
        });
        if (!alertExist) {
          await WhatsAppWalletHistory.create(
            [
              {
                errorReason: payload.payment.entity.error_reason,
                errorDescription: payload.payment.entity.error_description,
                businessId: payload.payment.entity.notes.businessId,
                order_id: getOrder?._id,
                userId: getOrder?.userId,

                status: "FAILED",
                date: Date.now(),
              },
            ],
            { session },
          );
        }
      }

      if (event === "payment.captured") {
        const paymentAlreadyExist = await WhatsAppPayment.findOne({
          razorpayEventId: razorpayEventId,
        });

        if (!paymentAlreadyExist && getOrder) {
          await WhatsAppPayment.create(
            [
              {
                businessId: getOrder?.businessId,
                total: getOrder?.total,
                billValue: getOrder?.billValue,
                mode: payload.payment.entity.method,
                userId: getOrder?.userId,
                order_id: getOrder?._id,
                paymentMode: "online",
                razorpayPaymentId: payload.payment.entity.id,
                razorpayOrderId: payload.payment.entity.order_id,
                razorpayAcquirerData: payload.payment.entity.acquirer_data,
                razorpayEventId: razorpayEventId,
                date: Date.now(),
              },
            ],
            { session },
          );

          await WhatsAppWalletHistory.create(
            [
              {
                businessId: getOrder?.businessId,
                status: "SUCCESS",
                order_id: getOrder?._id,
                userId: getOrder?.userId,

                date: Date.now(),
              },
            ],
            { session },
          );

          await WhatsAppWallet.findOneAndUpdate(
            {
              businessId: getOrder?.businessId,
            },
            {
              $inc: { currentBalance: getOrder?.total },
            },
            {
              new: true,
              upsert: true,
              session,
            },
          );
        }
      }

      return respond(c, "whatsapp webhook recieved ", false, 200, {});
    });
  })

  .post(
    "/whatsapp_valid_payment/:merchantId",
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
    zValidator("json", validatePaymentSchema),
    zValidator("param", z.object({ merchantId: z.string() })),

    async (c) => {
      const requestData = await c.req.json();
      const { response } = requestData;
      const { merchantId } = c.req.param();

      const merchantConfig = (await getMerchantConfig(
        merchantId,
      )) as MerchantConfig;
      let RAZORPAY_SECRET = "";

      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select("razorpayKeySecret");
        RAZORPAY_SECRET = merchant?.razorpayKeySecret as string;
      } else {
        RAZORPAY_SECRET = merchantConfig.razorpayKeySecret;
      }

      if (!RAZORPAY_SECRET)
        return respond(
          c,
          "razorpay_secret missing while validating payments",
          true,
          400,
          {},
        );

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        response;

      const signature = createHmac("sha256", RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (signature === razorpay_signature) {
        return c.json({
          err: false,
          message: "Payment is valid",
          data: razorpay_order_id,
        });
      }
      return c.json(
        {
          err: true,
          message: "Payment is invalid",
          data: {},
        },
        400,
      );
    },
  );

export default whatsappRouter;
