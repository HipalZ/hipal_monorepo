import {
  Business,
  BusinessSettings,
  Campaign,
  CouponLink,
  Couponz,
  GroupModel,
  RecentCampaign,
  Subscriber,
  UrlModel,
  User,
  UserReward,
  WhatAppOrder,
  WhatAppTemplate,
  WhatsAppAnalyticsUser,
  WhatsAppBlockedUser,
  WhatsAppBusinessConfig,
  WhatsAppPayment,
  WhatsAppUser,
  WhatsAppWABA,
  WhatsAppWallet,
  WhatsAppWalletHistory,
} from "@hi/db-models";
import {
  RazorpayWebhookHeadersSchema,
  WhatAppRazorpayWebhookBodySchema,
  type WhatsAppBusinessConfigType,
  type WhatsAppWalletType,
  campaignSchema,
  validatePaymentSchema,
  validateWhatAppTemplateSchema,
  whatsAppBusinessConfigSchema,
  whatsAppOrderSchema,
  whatsAppWalletHistorySchema,
} from "@hi/db-models/src/validators";
import { createHmac } from "node:crypto";

import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { nanoid } from "nanoid";
import { schedule } from "node-cron";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { getMerchantConfig } from "../../utils/cacheHelper";
import {
  type MerchantConfig,
  razorpayWrapper,
} from "../../utils/razorpay-wrapper";
import { respond } from "../../utils/response";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";
import {
  type CampaignConfig,
  deleteBlockedUser,
  getBlockedUser,
  getTemplateId,
  setBlockedUser,
  setWhatsAppMessageConfig,
} from "../../utils/whatsAppUserCache";
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

const getCampaignName = (templateName: string): string => {
  const now = new Date();
  const istTime = new Date(now.getTime() + 330 * 60 * 1000); // IST is UTC+5:30
  const formattedDate = `${istTime.getUTCDate()}-${
    istTime.getUTCMonth() + 1
  }_${istTime.getUTCHours()}:${istTime.getUTCMinutes()}`;
  return `${templateName}_${formattedDate}`;
};

const bodySequence = async (
  businessName: string,
  address: string,
  bodyvariblesequence: string[],
  customer: {
    name: string;
    phone: string;
    email?: string;
  },
  businessId: string,
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
    } else if (variable === "email") {
      value = customer?.email?.toString();
    } else if (variable === "coins") {
      const user = await User.findOne({ phone: customer.phone });
      const userReward = await UserReward.findOne({
        userId: user?._id,
        loyaltyId: businessId,
      });
      value = userReward?.rewards?.toString();
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

const returnBodyComponents = async (
  businessName: string,
  address: string,
  bodyVariableSequence: string[],
  imageUrl: string,
  customer: {
    name: string;
    phone: string;
  },
  businessId: string,
) => {
  // return components for the body
  const parameters = await bodySequence(
    businessName,
    address,
    bodyVariableSequence,
    customer,
    businessId,
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

  return components;
};

const scheduleCampaign = async (
  customersArray: {
    name: string;
    phone: string;
    email?: string;
  }[],
  template: {
    templateName: string;
    languageCode: string;
    templateId: string;
  },
  businessName: string,
  address: string,
  bodyVariableSequence: string[],
  imageUrl: string,
  whatsAppConfig: {
    version: string;
    phoneId: string;
    token: string;
  },
  businessId: string,
  templateId: string,
) => {
  console.log("ala re");
  const templateName = template.templateName;
  const campaignName = getCampaignName(templateName);

  // for track campaign
  const createCampaign = await Campaign.create({
    businessId,
    templateId,
    campaignName: campaignName,

    date: Date.now(),
  });

  // for recent campaign to track the last campaign sent by the business
  const recentCamp = await RecentCampaign.findOneAndUpdate(
    {
      businessId,
    },
    {
      campaignId: createCampaign._id.toString(),
      templateId,
    },
    {
      upsert: true,
      new: true,
    },
  );

  for (const customer of customersArray) {
    // return components for the body
    const components = await returnBodyComponents(
      businessName,
      address,
      bodyVariableSequence,
      imageUrl,
      customer,
      businessId,
    );

    try {
      const res = await axios.post(
        `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: customer?.phone?.toString(),
          type: "template",
          template: {
            name: template.templateName,
            language: { code: template.languageCode },
            components: components,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${whatsAppConfig.token}`,
          },
        },
      );

      // for track campaign
      await setWhatsAppMessageConfig(res.data.messages?.[0].id, {
        templateId,
        campaignId: createCampaign._id.toString(),
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.log("error", axiosError.response?.data);
      const message = axiosError.response?.data?.error?.message;

      return {
        message: `Error creating template: ${message}`,
        err: true,
        data: axiosError.response?.data || {},
      };
    }
  }
  await WhatsAppBusinessConfig.findOneAndUpdate(
    {
      businessId,
    },
    {
      activeTemplateId: null,
    },
  );

  return true;
};

const calculateAndCheckBalance = (
  templateCategory: string,
  customersArrayLength: number,
  whatsAppConfigData: WhatsAppBusinessConfigType,
  businessWallet: WhatsAppWalletType,
) => {
  let reduceAmount = 0;
  let totalCost = 0;

  if (templateCategory === "MARKETING") {
    totalCost =
      customersArrayLength * (whatsAppConfigData.marketingTemplateCost || 0.89);
    if (businessWallet.currentBalance < totalCost) {
      return { insufficientBalance: true, reduceAmount: 0 };
    }

    reduceAmount = totalCost;
  }

  if (templateCategory === "UTILITY") {
    totalCost =
      customersArrayLength * (whatsAppConfigData.utilityTemplateCost || 0.2);
    if (businessWallet.currentBalance < totalCost) {
      return { insufficientBalance: true, reduceAmount: 0 };
    }
    reduceAmount = totalCost;
  }

  return { insufficientBalance: false, reduceAmount };
};
const whatsappRouter = new Hono()
  .get(
    "/template/all/:businessId",

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      try {
        const { businessId } = c.req.param();

        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: "whatsAppConfigData not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        const getWhatAppTemplate = await WhatAppTemplate.find({
          businessId,
          isDeleted: false,
        })
          .select("templateId")
          .limit(10);

        const templateIds = getWhatAppTemplate.map(
          (template) => template.templateId,
        );

        const templatesArray = [];

        for (const templateId of templateIds) {
          const getWhatAppTemplate = await axios.get(
            `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${templateId}`,
            {
              headers: {
                Authorization: `Bearer ${whatsAppConfigData.token}`,
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
        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: "whatsAppConfigData not found",
              err: true,
              data: {},
            },
            404,
          );
        }

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
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${whatsAppConfigData.whatsAppAccountId}/message_templates`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
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
              category: requestData?.category,
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
    "/template/:templateid/:businessId",

    zValidator(
      "param",
      z.object({
        templateid: z.string(),
        businessId: z.string().min(3).max(26),
      }),
    ),

    async (c) => {
      const { templateid, businessId } = c.req.param();

      const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
        businessId,
      });

      if (!whatsAppConfigData) {
        return c.json(
          {
            message: "whatsAppConfigData not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      try {
        const getWhatAppTemplate = await axios.get(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${templateid}`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
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
    "/template/:templateid/:businessId",

    zValidator(
      "param",
      z.object({
        templateid: z.string().min(3).max(30),
        businessId: z.string().min(3).max(26),
      }),
    ),
    zValidator("json", validateWhatAppTemplateSchema.partial()),

    async (c) => {
      const { templateid, businessId } = c.req.param();

      const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
        businessId,
      });

      if (!whatsAppConfigData) {
        return c.json(
          {
            message: "whatsAppConfigData not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      const requestData = await c.req.json();

      try {
        const updateWhatAppTemplate = await axios.post(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${templateid}`,
          {
            ...requestData,
          },
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
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
    "/template/:template_name/:templateid/:businessId",

    zValidator(
      "param",
      z.object({
        template_name: z.string(),
        templateid: z.string(),
        businessId: z.string().min(3).max(26),
      }),
    ),

    async (c) => {
      try {
        const { template_name, templateid, businessId } = c.req.param();

        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: "whatsAppConfigData not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        await axios.delete(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${whatsAppConfigData.whatsAppAccountId}/message_templates?name=${template_name}`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
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
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.MANAGER]),
    async (c) => {
      try {
        const requestData = await c.req.json();
        const {
          businessId,
          templateId,
          allCustomers,
          bulkCustomers,
          groupIds,
          businessName,
          sendLaterTime = 0,
          address,
        } = requestData;

        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: "whatsAppConfigData not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        let reminderDateObj;

        if (sendLaterTime === 0) {
          const currentDate = new Date();
          const currentISTDate = new Date(
            currentDate.getTime() + 330 * 60 * 1000,
          ); // IST is UTC+5:30
          currentISTDate.setMinutes(currentISTDate.getMinutes() + 1);
          reminderDateObj = currentISTDate;
        } else {
          reminderDateObj = new Date(sendLaterTime);
          reminderDateObj = new Date(
            reminderDateObj.getTime() + 330 * 60 * 1000,
          );
        }

        const cronExpression = `${reminderDateObj.getMinutes()} ${reminderDateObj.getHours()} ${reminderDateObj.getDate()} ${
          reminderDateObj.getMonth() + 1
        } *`;

        const template = (await WhatAppTemplate.findOne({
          businessId,
          templateId,
          isDeleted: false,
        })) as {
          templateName: string;
          bodyVariableSequence: string[];
          imageUrl: string;
          templateId: string;
          languageCode: string;
          category: string;
        };

        const businessWallet = await WhatsAppWallet.findOne({
          businessId,
        }).select("currentBalance");

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
        // for all customers
        if (allCustomers) {
          const allCustomersList = await Subscriber.find({
            businessId,
          })
            .select("userId")
            .populate({
              path: "userId",
              select: "phone name email",
            })
            .limit(200)
            .sort({ _id: -1 });

          const customersArray = [] as {
            name: string;
            phone: string;
            email?: string;
          }[];

          for (const customer of allCustomersList) {
            let findBlockedUser = await getBlockedUser(customer?.userId?.phone);
            if (!findBlockedUser) {
              const blockedUser = await WhatsAppBlockedUser.findOne({
                phone: customer?.userId?.phone,
              }).select("phone");

              findBlockedUser = blockedUser?.phone;
            }

            if (findBlockedUser !== customer?.userId?.phone) {
              customersArray.push({
                name: customer?.userId?.name,
                phone: customer?.userId?.phone,
                email: customer?.userId?.email,
              });
            }
          }

          const { insufficientBalance, reduceAmount } =
            calculateAndCheckBalance(
              template.category,
              customersArray.length,
              whatsAppConfigData,
              businessWallet,
            );

          if (insufficientBalance) {
            return c.json(
              {
                message: "Insufficient balance",
                err: true,
                data: {},
              },
              400,
            );
          }

          schedule(
            cronExpression,
            async () => {
              console.log("scheduled");
              await scheduleCampaign(
                customersArray,
                template,
                businessName,
                address,
                bodyVariableSequence,
                imageUrl,
                whatsAppConfigData,
                businessId,
                templateId,
              );
            },
            {
              scheduled: true,
              timezone: "Asia/Kolkata",
            },
          );

          if (template.category === "UTILITY") {
            await WhatsAppWallet.findOneAndUpdate(
              {
                businessId,
              },
              {
                $inc: {
                  currentBalance: -reduceAmount,
                },
              },
            );
          }

          return c.json({
            message: "Campaign scheduled successfully",
            err: false,
            data: {
              success: true,
            },
          });
        }
        // for bulk customers
        if (bulkCustomers.length > 0) {
          const bulkCustomersList = [] as {
            name: string;
            phone: string;
          }[];
          for (const customer of bulkCustomers) {
            if (customer.phone.length === 10 && customer.name) {
              await User.findOneAndUpdate(
                {
                  phone: customer.phone,
                },
                {
                  name: customer.name,
                  role: [
                    "HIPAL_CUSTOMER",
                    "OWNER",
                    "MANAGER",
                    "CAPTAIN",
                    "CO_OWNER",
                  ],
                },
                {
                  upsert: true,
                },
              );
              let findBlockedUser = await getBlockedUser(customer.phone);
              if (!findBlockedUser) {
                const blockedUser = await WhatsAppBlockedUser.findOne({
                  phone: customer.phone,
                }).select("phone");

                findBlockedUser = blockedUser?.phone;
              }

              if (findBlockedUser !== customer.phone) {
                bulkCustomersList.push({
                  name: customer.name,
                  phone: customer.phone,
                });
              }
            }
          }

          const { insufficientBalance, reduceAmount } =
            calculateAndCheckBalance(
              template.category,
              bulkCustomers.length,
              whatsAppConfigData,
              businessWallet,
            );

          if (insufficientBalance) {
            return c.json(
              {
                message: "Insufficient balance",
                err: true,
                data: {},
              },
              400,
            );
          }

          const data = schedule(
            cronExpression,
            async () => {
              console.log("scheduled");
              await scheduleCampaign(
                bulkCustomersList,
                template,
                businessName,
                address,
                bodyVariableSequence,
                imageUrl,
                whatsAppConfigData,
                businessId,
                templateId,
              );
            },
            {
              scheduled: true,
              timezone: "Asia/Kolkata",
            },
          );

          if (template.category === "UTILITY") {
            await WhatsAppWallet.findOneAndUpdate(
              {
                businessId,
              },
              {
                $inc: {
                  currentBalance: -reduceAmount,
                },
              },
            );
          }

          return c.json({
            message: "Campaign scheduled successfully",
            err: false,
            data: {
              success: true,
            },
          });
        }
        // for group customers
        if (groupIds.length > 0) {
          const groupIdsList = [] as {
            name: string;
            phone: string;
          }[];

          for (let i = 0; i < groupIds.length; i++) {
            const group = await GroupModel.findOne({
              _id: groupIds[i],
            }).select("userIds");

            if (!group) {
              return c.json(
                {
                  message: "Group not found",
                  err: true,
                  data: {},
                },
                404,
              );
            }

            for (const user of group.userIds || []) {
              const findUser = await Subscriber.findOne({
                userId: user,
              })
                .select("userId")
                .populate({
                  path: "userId",
                  select: "phone name",
                });
              let findBlockedUser = await getBlockedUser(
                findUser?.userId?.phone,
              );
              if (!findBlockedUser) {
                const blockedUser = await WhatsAppBlockedUser.findOne({
                  phone: findUser?.userId?.phone,
                }).select("phone");

                findBlockedUser = blockedUser?.phone;
              }

              if (findBlockedUser !== findUser?.userId?.phone) {
                groupIdsList.push({
                  name: findUser?.userId?.name,
                  phone: findUser?.userId?.phone,
                });
              }
            }
          }

          const { insufficientBalance, reduceAmount } =
            calculateAndCheckBalance(
              template.category,
              groupIdsList.length,
              whatsAppConfigData,
              businessWallet,
            );

          if (insufficientBalance) {
            return c.json(
              {
                message: "Insufficient balance",
                err: true,
                data: {},
              },
              400,
            );
          }

          schedule(
            cronExpression,
            async () => {
              await scheduleCampaign(
                groupIdsList,
                template,
                businessName,
                address,
                bodyVariableSequence,
                imageUrl,
                whatsAppConfigData,
                businessId,
                templateId,
              );
            },
            {
              scheduled: true,
              timezone: "Asia/Kolkata",
            },
          );

          if (template.category === "UTILITY") {
            await WhatsAppWallet.findOneAndUpdate(
              {
                businessId,
              },
              {
                $inc: {
                  currentBalance: -reduceAmount,
                },
              },
            );
          }

          return c.json({
            message: "Campaign scheduled successfully",
            err: false,
            data: {
              success: true,
            },
          });
        }

        return c.json(
          {
            message: "No customers found",
            err: true,
            data: {},
          },
          400,
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

        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: "whatsAppConfigData not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const thirtyDaysAgoTimestamp = currentTimestamp - 20 * 24 * 60 * 60;

        let allTemplates = await WhatAppTemplate.find({
          businessId,
          isDeleted: false,
        }).select("templateId templateName");

        allTemplates = allTemplates
          .map((template) => template.templateId)
          ?.slice(0, 10);

        const getWhatAppTemplate = await axios.get(
          `https://graph.facebook.com/v21.0/${whatsAppConfigData.whatsAppAccountId}/template_analytics?start=${thirtyDaysAgoTimestamp}&end=${currentTimestamp}&granularity=daily&metric_types=clicked,delivered,read,sent,cost&template_ids=${allTemplates}&limit=1000`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
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

          const getWhatAppTemplateName = await WhatAppTemplate.findOne({
            templateId: templateid,
          }).select("templateName");

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
            templateName: getWhatAppTemplateName?.templateName,
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
    "/analytics/by_template_id",

    zValidator(
      "query",
      z.object({
        templateId: z.string(),
        businessId: z.string(),
      }),
    ),

    async (c) => {
      try {
        const { templateId, businessId } = c.req.query();
        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: "whatsAppConfigData not found",
              err: true,
              data: {},
            },
            404,
          );
        }

        const templateById = await WhatAppTemplate.findOne({
          businessId,
          isDeleted: false,
          templateId: templateId,
        }).select("templateId templateName");

        if (!templateById) {
          return c.json(
            {
              message: "Template not found",
              err: true,
              data: {},
            },
            404,
          );
        }
        const failedCount = await WhatsAppAnalyticsUser.find({
          templateId: templateId,
          status: "failed",
        }).count();
        const currentTimestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const ninetyDaysAgoTimestamp = currentTimestamp - 60 * 24 * 60 * 60;

        const getWhatAppTemplate = await axios.get(
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${
            whatsAppConfigData.whatsAppAccountId
          }/template_analytics?start=${ninetyDaysAgoTimestamp}&end=${currentTimestamp}&granularity=daily&metric_types=clicked,delivered,read,sent,cost&template_ids=${[
            templateById?.templateId,
          ]}&limit=5000`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
            },
          },
        );

        const templateids = [];

        for (const dataPoint of getWhatAppTemplate.data.data[0].data_points) {
          const anaLyticsObject = dataPoint;

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
            tamplateId: templateById?.templateId,
            templateName: templateById?.templateName,
            sent: anaLyticsObject.sent,
            read: anaLyticsObject.read,
            delivered: anaLyticsObject.delivered,
            clicked: calculateTotalclicked,
            cost: calculateTotalcost,
            failed: failedCount,
          };

          templateids.push(newObj);
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

        return c.json(
          {
            message: "fetching  template",
            err: false,
            data: mergedData[0],
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
  )

  .get(
    "/wa-webhooks",

    async (c) => {
      const mode = c.req.query("hub.mode");
      const challenge = c.req.query("hub.challenge");
      const token = c.req.query("hub.verify_token");

      if (mode === "subscribe" && token === "token") {
        return c.text(challenge ?? "", 200);
      }

      return c.json({
        message: "Webhook not verified",
        err: true,
        data: {},
      });
    },
  )

  .post(
    "/wa-webhooks",

    async (c) => {
      const body = await c.req.json();

      console.log("hello");

      if (body.object) {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages?.[0];
        const contacts = value?.contacts?.[0];
        const statuses = value?.statuses;

        const phon_no_id = value?.metadata?.phone_number_id;
        const config = await WhatsAppBusinessConfig.findOne({
          phoneId: phon_no_id,
        });

        const bName = await Business.findById(config?.businessId).select(
          "name",
        );

        if (statuses && statuses.length > 0) {
          const firstStatus = statuses[0];
          const extractedData = {
            status: firstStatus.status,
            category: firstStatus.pricing?.category,
          };

          const wamid = firstStatus.id;
          const userPhoneNumber = firstStatus?.recipient_id.toString().slice(2);

          const getTemplateIdInfo = (await getTemplateId(
            wamid,
          )) as CampaignConfig;

          const userInfo = await User.findOne({
            phone: userPhoneNumber,
          });

          if (getTemplateIdInfo && extractedData.category !== "service") {
            await WhatsAppAnalyticsUser.findOneAndUpdate(
              {
                businessId: config?.businessId,
                phone: userInfo?.phone,
                status: extractedData?.status,
                templateId: getTemplateIdInfo.templateId,
                campaignId: getTemplateIdInfo.campaignId,
              },
              {
                businessId: config?.businessId,
                name: userInfo?.name,
                phone: userInfo?.phone,
                status: extractedData?.status,
                templateId: getTemplateIdInfo.templateId,
                date: Date.now(),
                campaignId: getTemplateIdInfo.campaignId,
              },
              {
                upsert: true,
                new: true,
              },
            );
          }

          if (
            extractedData?.status === "delivered" &&
            extractedData?.category === "marketing"
          ) {
            // Fetch the current balance
            const wallet = await WhatsAppWallet.findOne({
              businessId: config?.businessId,
            });

            const minimumAmount = config?.marketingTemplateCost || 0.89;

            if (wallet && wallet.currentBalance >= minimumAmount) {
              // Update the balance only if it won't go negative
              await WhatsAppWallet.findOneAndUpdate(
                { businessId: config?.businessId },
                { $inc: { currentBalance: -minimumAmount } },
              );
            } else {
              console.log("Insufficient balance to decrement");
            }
          }
        }
        if (messages && config) {
          const from = messages?.from;
          const userName = contacts?.profile?.name;
          let userPhone = contacts?.wa_id;
          const userText = messages?.text?.body;

          let longUrl = "";
          let shortUrlType = "";

          if (userText) {
            if (userText.trim().toLowerCase() === "stop") {
              const RecentCampaignData = await RecentCampaign.findOne({
                businessId: config?.businessId,
              });

              const ifAlreadyBlocked = await WhatsAppBlockedUser.findOne({
                phone: userPhone.toString().slice(2),
              });

              if (!ifAlreadyBlocked) {
                await WhatsAppAnalyticsUser.create({
                  businessId: RecentCampaignData?.businessId,
                  name: userName,
                  phone: userPhone.toString().slice(2),
                  status: "blocked",
                  templateId: RecentCampaignData?.templateId,
                  date: Date.now(),
                  campaignId: RecentCampaignData?.campaignId,
                });
              }
              const findBlockedUser = await getBlockedUser(
                userPhone.toString().slice(2),
              );

              if (!findBlockedUser) {
                await WhatsAppBlockedUser.findOneAndUpdate(
                  {
                    phone: userPhone.toString().slice(2),
                  },
                  {
                    phone: userPhone.toString().slice(2),
                  },
                  {
                    upsert: true,
                    new: true,
                  },
                );
                await setBlockedUser(
                  userPhone.toString().slice(2),
                  userPhone.toString().slice(2),
                );
              }
            }
            if (userText.trim().toLowerCase() === "unstop") {
              await WhatsAppBlockedUser.findOneAndDelete({
                phone: userPhone.toString().slice(2),
              });
              await deleteBlockedUser(userPhone.toString().slice(2));
            }
          }

          if (userText) {
            const tableCode = userText.slice(-5);

            const findLongUrl = await UrlModel.findOne({
              urlCode: tableCode,
            }).select("longUrl shortUrl shortUrlType");

            console.log("findLongUrl", findLongUrl);

            longUrl = `${findLongUrl?.shortUrl}?q=wa`;
            shortUrlType = findLongUrl?.shortUrlType || "";
          }

          if (userPhone) {
            userPhone = userPhone.toString().slice(2);
          }

          if (phon_no_id && from && longUrl) {
            console.log("longUrl", longUrl);
            if (shortUrlType === "COUPON") {
              await axios({
                method: "POST",
                url: `${whatsAppApiBaseUrl.BASE_URL}/${config?.version}/${phon_no_id}/messages?access_token=${config?.token}`,
                data: {
                  messaging_product: "whatsapp",
                  to: from,
                  text: {
                    body: `Welcome to ${bName?.name} 🌿
              
              Hey there! Thanks for stopping by at the Lala Land Flea Market! 🎉
              
              We’re excited to introduce Urban Nemo – where great coffee, delicious food, and a peaceful ambiance come together. Here's a special treat just for you!
              
              🎁 Grab Coupon: ${longUrl}
              
              ✅ Enjoy Flat 20% OFF  
              👉 At our stall in the flea market  
              👉 At Urban Nemo Garden Cafe near Jubilee Hills Checkpost  
              
              📍 Find us here: https://g.co/kgs/9dszAqh  
              📸 Follow us for more perks: https://www.instagram.com/urbannemocafehyd  
              
              Show this message to claim your discount! Looking forward to serving you! ☕`,
                  },
                },
                headers: {
                  "Content-Type": "application/json",
                },
              });
            } else {
              await axios({
                method: "POST",
                url: `${whatsAppApiBaseUrl.BASE_URL}/${config?.version}/${phon_no_id}/messages?access_token=${config?.token}`,
                data: {
                  messaging_product: "whatsapp",
                  to: from,
                  text: {
                    body: `Welcome to ${bName?.name}! ☕\nWe’re excited to offer you an exceptional dining experience.\n🔗 Explore Menu: ${longUrl}\n🍽️ View our curated menu featuring handcrafted delights.`,
                  },
                },
                headers: {
                  "Content-Type": "application/json",
                },
              });
            }
          } else {
            const user = await User.findOne({
              phone: userPhone,
            }).select("_id");

            if (user && messages?.text?.body) {
              await WhatsAppUser.create({
                businessId: config?.businessId,
                date: Date.now(),
                message: messages?.text?.body,
                isOwner: false,
                userId: user?._id,
                ownerId: config?.ownerId,
              });

              const unseenMessages = await WhatsAppUser.find({
                businessId: config?.businessId,
                userId: user?._id,
                isOwner: false,
                seen: false,
              }).select("seen");

              await Subscriber.findOneAndUpdate(
                {
                  userId: user?._id,
                  businessId: config?.businessId,
                },
                {
                  $set: {
                    whatsappMsgUnseenCount: unseenMessages.length,
                  },
                },
                { new: true },
              );
            }
          }

          if (userPhone.length === 10) {
            await User.findOneAndUpdate(
              {
                phone: userPhone,
              },
              {
                name: userName,
                role: [
                  "HIPAL_CUSTOMER",
                  "OWNER",
                  "MANAGER",
                  "CAPTAIN",
                  "CO_OWNER",
                ],
              },
              {
                upsert: true,
              },
            );
          }

          return c.json({
            message: "Webhook verified",
            err: false,
            data: {},
          });
        }
      }

      return c.json({
        message: "running",
        err: true,
        data: {},
      });
    },
  )

  .get(
    "/testing",

    async (c) => {
      //@ts-ignore

      const redirectUrl =
        "https://wa.me/7075179325?text=Hi, I'm interested in your menu. Could you share more details? I am sitting at qpxIq";

      return c.redirect(redirectUrl);
    },
  )
  .get(
    "/whatsapp_config/:businessId",

    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER]),

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId,
      }).select("appId token -_id");

      if (!whatsAppConfig) {
        return c.json({
          message: "Config not found",
          err: true,
          data: {},
        });
      }

      return c.json({
        message: "Config found",
        err: false,
        data: whatsAppConfig,
      });
    },
  )

  .post(
    "/update_whatsapp_config",

    zValidator("json", whatsAppBusinessConfigSchema),

    async (c) => {
      const requestData = await c.req.json();

      const createWhatsAppConfig =
        await WhatsAppBusinessConfig.findOneAndUpdate(
          {
            businessId: requestData.businessId,
          },
          {
            $set: {
              businessId: requestData.businessId,
              menuRedirection: requestData.menuRedirection,
              phoneId: requestData.phoneId,
              templateLimit: requestData.templateLimit,
              token: requestData.token,
              version: requestData.version,
              whatsAppAccountId: requestData.whatsAppAccountId,
              whatsAppPhone: requestData.whatsAppPhone,
              appId: requestData.appId,
              configId: requestData.configId,
            },
          },
          {
            upsert: true,
          },
        );

      if (!createWhatsAppConfig) {
        return c.json({
          message: "Error updating config",
          err: true,
          data: {},
        });
      }

      return c.json({
        message: "Updated successfully",
        err: false,
        data: createWhatsAppConfig,
      });
    },
  )

  .post(
    "/send-messages",

    async (c) => {
      const body = await c.req.json();
      const { text, phoneNumber, businessId, isOwner, userId, ownerId } = body;
      const config = await WhatsAppBusinessConfig.findOne({
        businessId,
      }).select("token phoneId");
      await axios({
        method: "POST",
        url: `${whatsAppApiBaseUrl.BASE_URL}${config?.version}/${config?.phoneId}/messages?access_token=${config?.token}`,
        data: {
          messaging_product: "whatsapp",
          to: phoneNumber?.toString(),
          text: {
            body: text,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      const saveUserMessage = await WhatsAppUser.create({
        businessId,
        date: Date.now(),
        message: text,
        isOwner: isOwner,
        userId: userId,
        ownerId: ownerId,
      });
      if (!saveUserMessage) {
        return c.json({
          message: "Error sending message",
          err: true,
          data: {},
        });
      }

      return c.json({
        message: "Message sent successfully",
        err: false,
        data: {},
      });
    },
  )

  .get(
    "/user-messages/:userId/:ownerId/:businessId",

    async (c) => {
      const { userId, ownerId, businessId } = c.req.param();

      const user = await WhatsAppUser.find({
        userId,
        ownerId,
        isDeleted: false,
      });

      await WhatsAppUser.updateMany(
        {
          userId,
          ownerId,
        },
        {
          $set: {
            seen: true,
          },
        },
      );

      await Subscriber.findOneAndUpdate(
        {
          userId: userId,
          businessId,
        },
        {
          whatsappMsgUnseenCount: 0,
        },
      );

      return c.json({
        message: "Messages found",
        err: false,
        data: user,
      });
    },
  )
  .get(
    "/allUsers-messages/:ownerId",

    async (c) => {
      const { ownerId } = c.req.param();

      const user = await WhatsAppUser.find({
        ownerId,
      });

      return c.json({
        message: "Messages found",
        err: false,
        data: user,
      });
    },
  )

  .delete(
    "/user-messages/:userId/:ownerId",

    async (c) => {
      const { userId, ownerId } = c.req.param();

      const user = await WhatsAppUser.updateMany(
        {
          userId,
          ownerId,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );

      return c.json({
        message: "Messages found",
        err: false,
        data: user,
      });
    },
  )
  .post(
    "/whatsapp_waba_registration",

    async (c) => {
      const {
        displayName,
        displayNumber,
        facebookId,
        facebookPassword,
        businessId,
      } = await c.req.json();

      const waba = await WhatsAppWABA.create({
        displayName,
        displayNumber,
        facebookId,
        facebookPassword,
        businessId,
        date: Date.now(),
      });

      return c.json({
        message: "Waba registered successfully",
        err: false,
        data: waba,
      });
    },
  )
  .get(
    "/fetch_waba/:businessId",

    async (c) => {
      const { businessId } = c.req.param();

      const waba = await WhatsAppWABA.findOne({
        businessId,
      });

      if (!waba) {
        return c.json(
          {
            message: "Waba not found",
            err: true,
            data: {},
          },
          404,
        );
      }
      return c.json({
        message: "waba found",
        err: false,
        data: waba,
      });
    },
  )
  .get(
    "/wa_analytics_user/:businessId/:templateId",
    zValidator(
      "param",
      z.object({ businessId: z.string(), templateId: z.string() }),
    ),
    zValidator(
      "query",
      z.object({
        pageNumber: z.string().optional(),
        status: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, templateId } = c.req.param();
      const { pageNumber, status } = c.req.query();
      const pageNumberInt = Number(pageNumber) || 1;
      if (status) {
        const waAnalyticsUser = await WhatsAppAnalyticsUser.find({
          businessId,
          templateId,
          status: status,
        })
          .skip((pageNumberInt - 1) * 40)
          .limit(40);

        return c.json({
          message: "wa analytics user",
          err: false,
          data: waAnalyticsUser,
        });
      }

      const waAnalyticsUser = await WhatsAppAnalyticsUser.find({
        businessId,
        templateId,
      })
        .skip((pageNumberInt - 1) * 40)
        .limit(40);

      return c.json({
        message: "wa analytics user",
        err: false,
        data: waAnalyticsUser,
      });
    },
  )

  .get(
    "/campaigns/:businessId/:templateId",
    zValidator(
      "param",
      z.object({ businessId: z.string(), templateId: z.string() }),
    ),

    async (c) => {
      const { businessId, templateId } = c.req.param();

      const campaigns = await Campaign.find({
        businessId,
        templateId,
      });

      return c.json({
        message: "campaigns",
        err: false,
        data: campaigns,
      });
    },
  )

  .get(
    "/campaign_analytics/:businessId/:campaignId",
    zValidator(
      "param",
      z.object({ businessId: z.string(), campaignId: z.string() }),
    ),
    zValidator(
      "query",
      z.object({
        status: z.string().optional(),
      }),
    ),

    async (c) => {
      const { businessId, campaignId } = c.req.param();
      const { status } = c.req.query();

      const waAnalyticsUser = await WhatsAppAnalyticsUser.find({
        businessId,
        campaignId,
      });

      const obj = waAnalyticsUser.reduce(
        (acc, user) => {
          acc.sent += user.status === "sent" ? 1 : 0;
          acc.delivered += user.status === "delivered" ? 1 : 0;
          acc.read += user.status === "read" ? 1 : 0;
          acc.clicked += user.status === "clicked" ? 1 : 0;
          acc.failed += user.status === "failed" ? 1 : 0;
          acc.blocked += user.status === "blocked" ? 1 : 0;
          return acc;
        },
        {
          sent: 0,
          delivered: 0,
          read: 0,
          clicked: 0,
          failed: 0,
          blocked: 0,
        },
      );
      if (status) {
        const waCampaignAnalyticsUser = await WhatsAppAnalyticsUser.find({
          businessId,
          campaignId,

          status: status,
        });

        return c.json({
          message: "wa analytics user",
          err: false,
          data: {
            overAllCount: obj,
            campaignAnalttics: waCampaignAnalyticsUser,
          },
        });
      }

      return c.json({
        message: "wa analytics user",
        err: false,
        data: {
          overAllCount: obj,
          campaignAnalytics: waAnalyticsUser,
        },
      });
    },
  )

  .post(
    "/wa_embedded_signup",
    zValidator(
      "json",
      z.object({
        client_id: z.string().min(1).max(50),
        client_secret: z.string().min(1).max(70),
        code: z.string().min(1).max(500),
        businessId: z.string().min(1).max(50),
      }),
    ),

    async (c) => {
      try {
        const { client_id, client_secret, code, businessId } =
          await c.req.json();

        const getAccessToken = await axios.get(
          `${whatsAppApiBaseUrl.BASE_URL}/v18.0/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`,
        );

        const { access_token, token_type } = getAccessToken.data;

        const appInfo = await axios.get(
          `${whatsAppApiBaseUrl.BASE_URL}/v21.0/app`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        // create whatsapp business config

        const alreadyExist = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (alreadyExist) {
          return c.json(
            {
              message: "whatsapp business config already exist",
              err: true,
              data: {},
            },
            409,
          );
        }

        // const createWhatsAppConfig = await WhatsAppBusinessConfig.create({
        //   businessId: appInfo.data.business.id,
        //   token: access_token,
        //   version: "v1",
        //   whatsAppAccountId: appInfo.data.id,
        //   whatsAppPhone: appInfo.data.phone_number,
        //   appId: appInfo.data.app_id,
        //   configId: appInfo.data.config_id,
        // });

        return c.json(
          {
            message: "whatsapp business config created",
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
            message: `Error fetching template: ${message}`,
            err: true,
            data: axiosError.response?.data || {},
          },
          400,
        );
      }
    },
  );

export default whatsappRouter;
