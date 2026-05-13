import {
  BusinessSettings,
  Campaign,
  CouponLink,
  Couponz,
  GroupModel,
  RecentCampaign,
  Subscriber,
  User,
  UserReward,
  WhatAppOrder,
  WhatAppTemplate,
  WhatsAppAnalyticsUser,
  WhatsAppBlockedUser,
  WhatsAppBusinessConfig,
  WhatsAppChat,
  WhatsAppPayment,
  WhatsAppWABA,
  WhatsAppWallet,
  WhatsAppWalletHistory,
} from '@hi/db-models';
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
} from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { createHmac, randomUUID } from 'node:crypto';

import { zValidator } from '@hono/zod-validator';
import axios from 'axios';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { ClientSession } from 'mongoose';
import { nanoid } from 'nanoid';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '../../../middleware/authorization';
import { authTokenValidator } from '../../../middleware/tokenValidator';
import { enqueueWhatsAppJob } from '../../queues/enqueue';
import { getMerchantConfig } from '../../utils/cacheHelper';
import { getFutureSeconds } from '../../utils/dateAndTime';
import { exchangeCodeForToken } from '../../utils/instagram';
import { type MerchantConfig, razorpayWrapper } from '../../utils/razorpay-wrapper';
import { respond } from '../../utils/response';
import whatsAppApiBaseUrl from '../../utils/whatsAppApiBaseUrl/apiPaths';
import { qrHandlers } from '../../utils/whatsappWebhookHandlers/allQrHandler';
import { whatsAppCampaignHandler } from '../../utils/whatsappWebhookHandlers/campaign';
import { whatsAppChatHandler } from '../../utils/whatsappWebhookHandlers/chatHandler';
import { handleChatbotFlow } from '../../utils/whatsappWebhookHandlers/flows';
import { identifyQrTypeFromMessage, whatsAppEventData, whatsAppUserAndTextMessage } from '../../utils/whatsappWebhookHandlers/helper';
import { whatsAppBlockUserHandler } from '../../utils/whatsappWebhookHandlers/whatsappBlockUser';

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
  const formattedDate = `${istTime.getUTCDate()}-${istTime.getUTCMonth() + 1}_${istTime.getUTCHours()}:${istTime.getUTCMinutes()}`;
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

    if (variable === 'name') {
      value = customer?.name?.toString();
    } else if (variable === 'phone') {
      value = customer?.phone?.toString();
    } else if (variable === 'businessName') {
      value = businessName?.toString();
    } else if (variable === 'address') {
      value = address?.toString();
    } else if (variable === 'time') {
      value = new Date().toLocaleString();
    } else if (variable === 'date') {
      value = new Date().toLocaleDateString('en-GB');
    } else if (variable === 'email') {
      value = customer?.email?.toString();
    } else if (variable === 'coins') {
      const user = await User.findOne({ phone: customer.phone });
      const userReward = await UserReward.findOne({
        userId: user?._id,
        loyaltyId: businessId,
      });
      value = userReward?.rewards?.toString();
    }

    if (value !== undefined) {
      ans.push({
        type: 'text',
        text: value,
      });
    }
  }

  return ans;
};

const pushToQueue = async (
  customersArray: {
    name: string;
    phone: string;
    email?: string;
    _id: string;
    variables?: Record<string, string>;
  }[],
  template: {
    templateName: string;
    languageCode: string;
    templateId: string;
    category: string;
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
  delay: number,
) => {
  const templateName = template.templateName;
  const campaignName = getCampaignName(templateName);

  // for track campaign
  const createCampaign = await Campaign.create({
    businessId,
    templateId,
    campaignName: campaignName,
    date: Date.now(),
  });

  await RecentCampaign.findOneAndUpdate(
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

  const payload = {
    businessName: businessName,
    address: address,
    bodyVariableSequence: bodyVariableSequence,
    imageUrl: imageUrl,
    token: whatsAppConfig.token,
    version: whatsAppConfig.version,
    phoneId: whatsAppConfig.phoneId,
    templateName: template.templateName,
    languageCode: template.languageCode,
    whatsAppApiBaseUrl: whatsAppApiBaseUrl.BASE_URL,
    businessId,
    templateId,
    campaignId: createCampaign._id.toString(),
    customersArray: customersArray,
    category: template.category,
  };

  await enqueueWhatsAppJob('pushCustomerIntoQueue', payload, {
    delay: delay,
  });

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

  if (templateCategory === 'MARKETING') {
    totalCost = customersArrayLength * (whatsAppConfigData.marketingTemplateCost || 0.89);
    if (businessWallet.currentBalance < totalCost) {
      return { insufficientBalance: true, reduceAmount: 0 };
    }

    reduceAmount = totalCost;
  }

  if (templateCategory === 'UTILITY') {
    totalCost = customersArrayLength * (whatsAppConfigData.utilityTemplateCost || 0.2);
    if (businessWallet.currentBalance < totalCost) {
      return { insufficientBalance: true, reduceAmount: 0 };
    }
    reduceAmount = totalCost;
  }

  return { insufficientBalance: false, reduceAmount };
};
const whatsappRouter = new Hono()
  .post(
    '/media-upload/:businessId',
    bodyLimit({
      maxSize: 10 * 1024 * 1024,
      onError: (c) =>
        c.json(
          {
            err: true,
            message: 'File exceeds 10 MB upload limit. Compress or pick a smaller file.',
            data: {},
          },
          413,
        ),
    }),
    zValidator('param', z.object({ businessId: z.string().min(3).max(26) })),
    async (c) => {
      try {
        const { businessId } = c.req.param();
        console.log('[media-upload] start', { businessId });

        const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
          businessId,
        });
        if (!whatsAppConfig) {
          return respond(c, 'whatsAppConfigData not found', true, 404, {});
        }
        const appId = '1166415764661953';

        let formData: FormData;
        try {
          formData = await c.req.raw.formData();
        } catch (parseErr: any) {
          console.error('[media-upload] formData parse failed', parseErr);
          return respond(
            c,
            `Could not parse multipart body. Ensure Content-Type is 'multipart/form-data' with a boundary. Detail: ${
              parseErr?.message || parseErr?.name || 'unknown'
            }`,
            true,
            400,
            {},
          );
        }

        const file = formData.get('file');
        const isLikeFile = file && typeof file === 'object' && typeof (file as any).arrayBuffer === 'function';
        if (!isLikeFile) {
          console.error('[media-upload] no file in body', {
            keys: Array.from(formData.keys()),
            fileType: typeof file,
          });
          return respond(c, "Missing 'file' field in multipart body", true, 400, {});
        }
        const fileLike = file as any;
        console.log('[media-upload] file received', {
          name: fileLike.name,
          size: fileLike.size,
          type: fileLike.type,
        });

        // Step 1: Start a resumable upload session with Meta.
        // Read the file bytes ONCE — we'll fan out to two destinations.
        const buffer = Buffer.from(await fileLike.arrayBuffer());

        // ── Destination A: Hipalz storage server (returns a permanent HTTPS URL).
        const storageUpload = (async (): Promise<string> => {
          const storageForm = new FormData();
          storageForm.append('fileData', new Blob([buffer], { type: fileLike.type }), fileLike.name);
          storageForm.append('fileName', randomUUID());
          storageForm.append('bucketName', 'assets');
          const r = await axios.post('https://storage.test.hipalz.com/upload', storageForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
            maxBodyLength: Number.POSITIVE_INFINITY,
            maxContentLength: Number.POSITIVE_INFINITY,
          });
          return r.data?.url || r.data?.location || '';
        })();

        // ── Destination B: Meta Resumable Upload API (returns a media handle).
        const metaUpload = (async (): Promise<string> => {
          const sessionRes = await axios.post(`${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${appId}/uploads`, null, {
            params: {
              file_name: fileLike.name,
              file_length: fileLike.size,
              file_type: fileLike.type,
              access_token: whatsAppConfig.token,
            },
          });
          console.log('[media-upload] step1 ok', {
            sessionId: sessionRes.data?.id,
          });
          const sessionId = String(sessionRes.data?.id ?? '');
          if (!sessionId) throw new Error('Meta did not return an upload session id');
          const sessionPath = sessionId.startsWith('upload:') ? sessionId : `upload:${sessionId}`;

          const uploadRes = await axios.post(`${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${sessionPath}`, buffer, {
            headers: {
              Authorization: `OAuth ${whatsAppConfig.token}`,
              file_offset: '0',
              'Content-Type': 'application/octet-stream',
            },
            maxBodyLength: Number.POSITIVE_INFINITY,
            maxContentLength: Number.POSITIVE_INFINITY,
          });
          const h = uploadRes.data?.h;
          if (!h) throw new Error('Meta did not return a media handle');
          return h as string;
        })();

        // Run both in parallel — total time is max(storage, meta), not sum.
        const [url, handle] = await Promise.all([storageUpload, metaUpload]);

        console.log('[media-upload] fan-out done', {
          urlPresent: Boolean(url),
          handleLen: handle.length,
        });

        return c.json(
          {
            message: 'Uploaded successfully',
            err: false,
            data: { url, handle },
          },
          200,
        );
      } catch (error: any) {
        // Log the full error so we can debug from server logs.
        console.error('[media-upload] unexpected error', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
        });
        const metaMsg = error?.response?.data?.error?.error_user_msg || error?.response?.data?.error?.message || error?.message || 'Unknown error';
        return c.json(
          {
            message: `Media upload failed: ${metaMsg}`,
            err: true,
            data: error?.response?.data || {},
          },
          400,
        );
      }
    },
  )
  .get(
    '/template/all/:businessId',

    zValidator('param', z.object({ businessId: z.string() })),

    async (c) => {
      try {
        const { businessId } = c.req.param();

        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return c.json(
            {
              message: 'whatsAppConfigData not found',
              err: true,
              data: {},
            },
            404,
          );
        }

        const wabaId = whatsAppConfigData.whatsAppAccountId;

        if (!wabaId) {
          return c.json(
            {
              message: 'WhatsApp Business Account ID missing in config',
              err: true,
              data: {},
            },
            400,
          );
        }

        const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${wabaId}/message_templates`;

        const getWhatAppTemplate = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${whatsAppConfigData.token}`,
          },
        });

        const templatesArray = getWhatAppTemplate.data.data;

        // Fetch all local template IDs for this business to filter out unsynced ones
        const localTemplates = await WhatAppTemplate.find({
          businessId,
          isDeleted: { $ne: true },
        }).select('templateId');

        const localTemplateIds = new Set(localTemplates.map((t) => String(t.templateId)));

        // Only return templates that exist in our local DB
        const syncedTemplates = templatesArray.filter((t: any) => localTemplateIds.has(String(t.id)));

        return c.json(
          {
            message: 'fetched successfully',
            err: false,
            data: syncedTemplates,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
  .post('/template', zValidator('json', validateWhatAppTemplateSchema), async (c) => {
    try {
      const requestData = await c.req.json();
      const { bodyVariableSequence, headerVariableSequence, footerVariableSequence, businessId } = requestData;
      const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
        businessId,
      });

      if (!whatsAppConfigData) {
        return c.json(
          {
            message: 'whatsAppConfigData not found',
            err: true,
            data: {},
          },
          404,
        );
      }

      const templateNameAlreadyExist = await WhatAppTemplate.findOne({
        templateName: requestData.name,
        businessId: requestData.businessId,
      }).select('templateName');

      if (templateNameAlreadyExist) {
        return c.json(
          {
            message: 'Template name already exist',
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
        if (data.status === 'REJECTED') {
          return c.json(
            {
              message: 'Your template has been rejected!',
              err: true,
              data: {},
            },
            400,
          );
        }

        if (data.status === 'PENDING') {
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
                message: 'Error creating template',
                err: true,
                data: {},
              },
              400,
            );
          }
        }

        return c.json(
          {
            message: 'Template created successfully',
            err: false,
            data,
          },
          201,
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;

      return c.json(
        {
          message: `Error creating template: ${errorMessage}`,
          err: true,
          data: axiosError.response?.data || {},
        },
        400,
      );
    }
  })

  .get(
    '/template/:templateid/:businessId',

    zValidator(
      'param',
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
            message: 'whatsAppConfigData not found',
            err: true,
            data: {},
          },
          404,
        );
      }

      try {
        const getWhatAppTemplate = await axios.get(`${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${templateid}`, {
          headers: {
            Authorization: `Bearer ${whatsAppConfigData.token}`,
          },
        });

        return c.json(
          {
            message: 'fetched successfully',
            err: false,
            data: getWhatAppTemplate.data,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
    '/template/:templateid/:businessId',

    zValidator(
      'param',
      z.object({
        templateid: z.string().min(3).max(30),
        businessId: z.string().min(3).max(26),
      }),
    ),
    zValidator('json', validateWhatAppTemplateSchema.partial()),

    async (c) => {
      const { templateid, businessId } = c.req.param();
      const requestData = await c.req.json();

      const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
        businessId,
      });

      if (!whatsAppConfigData) {
        return c.json(
          {
            message: 'whatsAppConfigData not found',
            err: true,
            data: {},
          },
          404,
        );
      }

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

        await WhatAppTemplate.findOneAndUpdate(
          { templateId: templateid, businessId },
          {
            bodyVariableSequence: requestData.bodyVariableSequence || [],
          },
        );

        return c.json(
          {
            message: 'Edited successfully',
            err: false,
            data: updateWhatAppTemplate.data,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
    '/template/:template_name/:templateid/:businessId',

    zValidator(
      'param',
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
              message: 'whatsAppConfigData not found',
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
              message: 'Error deleting template',
              err: true,
              data: {},
            },
            400,
          );
        }

        return c.json(
          {
            message: 'Template deleted successfully',
            err: false,
            data: {},
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
    '/template/campaign',
    zValidator('json', campaignSchema),
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.MANAGER]),
    async (c) => {
      try {
        const requestData = await c.req.json();
        const { businessId, templateId, allCustomers, bulkCustomers, groupIds, businessName, sendLaterTime = 0, address } = requestData;

        const upcomingSeconds = getFutureSeconds(sendLaterTime) || 2000;

        // Quick validations
        const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (!whatsAppConfigData) {
          return respond(c, 'whatsAppConfigData not found', true, 404, {});
        }
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

        if (!template) {
          return respond(c, 'Template not found', true, 404, {});
        }

        const businessWallet = await WhatsAppWallet.findOne({
          businessId,
        }).select('currentBalance');

        if (!businessWallet) {
          return respond(c, 'Business wallet not found', true, 404, {});
        }

        const bodyVariableSequence = template?.bodyVariableSequence as string[];
        const imageUrl = template?.imageUrl;

        // Quick estimate of customer count for balance check (without building full list)
        let estimatedCustomerCount = 0;

        if (allCustomers) {
          const subscriberCount = await Subscriber.countDocuments({
            businessId,
          });
          estimatedCustomerCount = Math.min(subscriberCount, 200);
        } else if (bulkCustomers && bulkCustomers.length > 0) {
          estimatedCustomerCount = bulkCustomers.filter(
            (cust: { phone: string; name: string }) => cust.phone?.length === 10 && cust.name && cust.name.length >= 2,
          ).length;
        } else if (groupIds && groupIds.length > 0) {
          for (const groupId of groupIds) {
            const group = await GroupModel.findOne({ _id: groupId }).select('userIds');
            if (!group) {
              return c.json(
                {
                  message: 'Group not found',
                  err: true,
                  data: {},
                },
                404,
              );
            }
            estimatedCustomerCount += group.userIds?.length || 0;
          }
        }

        if (estimatedCustomerCount === 0) {
          return c.json(
            {
              message: 'No customers found',
              err: true,
              data: {},
            },
            400,
          );
        }

        // Balance check using estimated count
        const { insufficientBalance } = calculateAndCheckBalance(template.category, estimatedCustomerCount, whatsAppConfigData, businessWallet);

        if (insufficientBalance) {
          return respond(c, 'Insufficient balance', true, 400, {});
        }

        // Return 200 immediately — process heavy work in background
        // This prevents gateway timeout for large contact lists
        (async () => {
          try {
            // for all customers
            if (allCustomers) {
              const allCustomersList = await Subscriber.find({
                businessId,
              })
                .select('userId')
                .populate({
                  path: 'userId',
                  select: 'phone name email',
                })
                .limit(200)
                .sort({ _id: -1 });

              const customersArray = [] as {
                name: string;
                phone: string;
                email?: string;
                _id: string;
              }[];

              for (const customer of allCustomersList) {
                const blockedUser = await WhatsAppBlockedUser.findOne({
                  phone: customer?.userId?.phone,
                }).select('phone');

                if (!blockedUser) {
                  customersArray.push({
                    name: customer?.userId?.name,
                    phone: customer?.userId?.phone,
                    email: customer?.userId?.email,
                    _id: customer?.userId?._id.toString() || '',
                  });
                }
              }

              if (customersArray.length > 0) {
                await pushToQueue(
                  customersArray,
                  template,
                  businessName,
                  address,
                  bodyVariableSequence,
                  imageUrl,
                  whatsAppConfigData,
                  businessId,
                  templateId,
                  upcomingSeconds,
                );
              }
            }

            // for bulk customers
            else if (bulkCustomers && bulkCustomers.length > 0) {
              const bulkCustomersList = [] as {
                name: string;
                phone: string;
                _id: string;
                variables?: Record<string, string>;
              }[];
              for (const customer of bulkCustomers) {
                if (customer.phone.length === 10 && customer.name && customer.name.length >= 2) {
                  const saveUser = await User.findOneAndUpdate(
                    {
                      phone: customer.phone,
                    },
                    {
                      name: customer.name,
                      role: ['HIPAL_CUSTOMER', 'OWNER', 'MANAGER', 'CAPTAIN', 'CO_OWNER'],
                    },
                    {
                      upsert: true,
                    },
                  );

                  const blockedUser = await WhatsAppBlockedUser.findOne({
                    phone: customer.phone,
                  }).select('phone');

                  if (!blockedUser) {
                    bulkCustomersList.push({
                      name: customer.name,
                      phone: customer.phone,
                      _id: saveUser?._id.toString() || '',
                      variables: customer.variables,
                    });
                  }
                }
              }

              if (bulkCustomersList.length > 0) {
                await pushToQueue(
                  bulkCustomersList,
                  template,
                  businessName,
                  address,
                  bodyVariableSequence,
                  imageUrl,
                  whatsAppConfigData,
                  businessId,
                  templateId,
                  upcomingSeconds,
                );
              }
            }

            // for group customers
            else if (groupIds && groupIds.length > 0) {
              const groupIdsList = [] as {
                name: string;
                phone: string;
                _id: string;
              }[];

              for (let i = 0; i < groupIds.length; i++) {
                const group = await GroupModel.findOne({
                  _id: groupIds[i],
                }).select('userIds');

                if (!group) continue;

                for (const user of group.userIds || []) {
                  const findUser = await Subscriber.findOne({
                    userId: user,
                  })
                    .select('userId')
                    .populate({
                      path: 'userId',
                      select: 'phone name',
                    });

                  const blockedUser = await WhatsAppBlockedUser.findOne({
                    phone: findUser?.userId?.phone,
                  }).select('phone');

                  if (!blockedUser) {
                    groupIdsList.push({
                      name: findUser?.userId?.name,
                      phone: findUser?.userId?.phone,
                      _id: findUser?.userId?.id,
                    });
                  }
                }
              }

              if (groupIdsList.length > 0) {
                await pushToQueue(
                  groupIdsList,
                  template,
                  businessName,
                  address,
                  bodyVariableSequence,
                  imageUrl,
                  whatsAppConfigData,
                  businessId,
                  templateId,
                  upcomingSeconds,
                );
              }
            }
          } catch (bgError) {
            console.error('Background campaign processing error:', bgError);
          }
        })();

        return c.json({
          message: 'Campaign scheduled successfully',
          err: false,
          data: {
            success: true,
          },
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message ?? axiosError.message;

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
    '/template/analytics/:businessId',

    zValidator(
      'query',
      z.object({
        start: z.string().optional(),
        end: z.string().optional(),

        template_ids: z.array(z.string()).optional(),
      }),
    ),
    zValidator(
      'param',
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
              message: 'whatsAppConfigData not found',
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
        }).select('templateId templateName');

        allTemplates = allTemplates.map((template) => template.templateId)?.slice(0, 10);

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
          }).select('templateName');

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
            message: 'fetching all templates',
            err: false,
            data: mergedData,
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
    '/analytics/by_template_id',

    zValidator(
      'query',
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
              message: 'whatsAppConfigData not found',
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
        }).select('templateId templateName');

        if (!templateById) {
          return c.json(
            {
              message: 'Template not found',
              err: true,
              data: {},
            },
            404,
          );
        }
        const failedCount = await WhatsAppAnalyticsUser.find({
          templateId: templateId,
          status: 'failed',
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
            message: 'fetching  template',
            err: false,
            data: mergedData[0],
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
    '/whatsapp_wallet/:businessId',
    zValidator('param', z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const wallet = await WhatsAppWallet.findOne({
        businessId,
      });

      if (!wallet) {
        return c.json(
          {
            message: 'Wallet not found',
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: 'Wallet found',
          err: false,
          data: wallet,
        },
        200,
      );
    },
  )
  .get(
    '/whatsapp_wallet/history/:businessId',
    zValidator('param', z.object({ businessId: z.string() })),
    zValidator('query', z.object({ from: z.string().optional(), to: z.string().optional() })),

    async (c) => {
      const { businessId } = c.req.param();
      const { from, to } = c.req.query();

      const fromDate = from ? new Date(Number(from)) : new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const toDate = to ? new Date(Number(to)) : new Date();

      const walletHistory = await WhatsAppWalletHistory.find({
        businessId,
        date: { $gte: Number(fromDate), $lte: Number(toDate) },
      })
        .populate({
          path: 'userId',
          select: 'name',
        })
        .populate({
          path: 'order_id',
          select: 'total billValue',
        });

      return c.json(
        {
          message: 'Wallet history',
          err: false,
          data: walletHistory,
        },
        200,
      );
    },
  )
  .post(
    '/wallet/credit',

    zValidator('json', whatsAppWalletHistorySchema),

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
            message: 'Wallet not found',
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
          message: 'Wallet credited',
          err: false,
          data: wallet,
        },
        200,
      );
    },
  )

  .get(
    '/coupon_link/:businessId',
    zValidator('param', z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const couponLink = await Couponz.find({
        businessId,
        isDeleted: false,
        isExpired: false,
      }).select('name _id');

      const couponLinkArray = [];

      for (const coupon of couponLink) {
        const couponLink = await CouponLink.findOne({
          couponId: coupon._id,
        }).select('link');
        couponLinkArray.push({
          name: coupon.name,
          link: couponLink?.link,
        });

        couponLinkArray.push(couponLink);
      }

      return c.json(
        {
          message: 'fetched successfully',
          err: false,
          data: couponLinkArray,
        },
        200,
      );
    },
  )
  .post(
    '/create_whatsapp_order/:merchantId',
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
    zValidator('json', whatsAppOrderSchema),
    zValidator('param', z.object({ merchantId: z.string() })),

    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json(); // Assuming c.req.json() is async, which might not be the case.
        const { total, billValue, currency, userId, businessId, couponId, channelId } = requestData;
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
        if (!saveOrder || !response) return respond(c, 'Order not created', true, 400, {});

        return respond(c, 'Order created successfully', false, 200, {
          order_id: response.id,
        });
      });
    },
  )
  .post('/whatsapp_webhook/:merchantId', async (c) => {
    //@ts-ignore
    return runInTransaction(async (session: ClientSession) => {
      const { merchantId } = c.req.param();
      const merchantConfig = (await getMerchantConfig(merchantId)) as MerchantConfig;

      let RAZORPAY_WEBHOOK_SECRET = '';
      const body = await c.req.json();
      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select('razorpayWebhookSecret');
        RAZORPAY_WEBHOOK_SECRET = merchant?.razorpayWebhookSecret || '';
      } else {
        RAZORPAY_WEBHOOK_SECRET = merchantConfig.razorpayWebhookSecret;
      }

      if (!RAZORPAY_WEBHOOK_SECRET) {
      }

      const headersResult = RazorpayWebhookHeadersSchema.safeParse(c.req.header());
      if (!headersResult.success) {
        return respond(c, 'Invalid headers', true, 200, {});
      }

      const { 'x-razorpay-signature': razorpaySignature, 'x-razorpay-event-id': razorpayEventId } = headersResult.data;

      const isSignatureValid = validateWebhookSignature(JSON.stringify(body), razorpaySignature, RAZORPAY_WEBHOOK_SECRET);
      if (!isSignatureValid) {
        return respond(c, 'Invalid signature', true, 200, {});
      }

      const bodyResult = WhatAppRazorpayWebhookBodySchema.safeParse(body);

      if (!bodyResult.success) {
        return respond(c, 'Invalid body', true, 200, {});
      }
      //@ts-ignore
      const { event, payload } = bodyResult.data;

      const getOrder = await WhatAppOrder.findOne({
        order_id: payload.payment.entity.order_id,
      });

      if (event === 'payment.failed') {
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

                status: 'FAILED',
                date: Date.now(),
              },
            ],
            { session },
          );
        }
      }

      if (event === 'payment.captured') {
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
                paymentMode: 'online',
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
                status: 'SUCCESS',
                order_id: getOrder?._id,
                userId: getOrder?.userId,

                date: Date.now(),
              },
            ],
            { session },
          );

          // Wallet credit must use the BASE amount (no GST). The `total`
          // field is the GST-inclusive amount that was charged via Razorpay;
          // `billValue` is the base — that's what gets added to the wallet.
          //
          // Defensive fallback: for legacy orders saved before the frontend
          // started sending a distinct billValue, both fields will be equal
          // (the GST-inclusive value). Detect that and back out the GST so
          // those orders also credit the right amount.
          const totalAmount = Number(getOrder?.total) || 0;
          const storedBase = Number(getOrder?.billValue) || 0;
          const looksLikeLegacy = storedBase > 0 && Math.abs(storedBase - totalAmount) < 0.01;
          const baseToCredit = looksLikeLegacy ? Math.round(totalAmount / 1.18) : storedBase;

          await WhatsAppWallet.findOneAndUpdate(
            {
              businessId: getOrder?.businessId,
            },
            {
              $inc: { currentBalance: baseToCredit },
            },
            {
              new: true,
              upsert: true,
              session,
            },
          );
        }
      }

      return respond(c, 'whatsapp webhook recieved ', false, 200, {});
    });
  })

  .post(
    '/whatsapp_valid_payment/:merchantId',
    // authTokenValidator,
    // requireAuthorization([
    //   ClientRoles.OWNER,
    //   ClientRoles.HIPAL_CUSTOMER,
    //   ClientRoles.CAPTAIN,
    // ]),
    zValidator('json', validatePaymentSchema),
    zValidator('param', z.object({ merchantId: z.string() })),

    async (c) => {
      const requestData = await c.req.json();
      const { response } = requestData;
      const { merchantId } = c.req.param();

      const merchantConfig = (await getMerchantConfig(merchantId)) as MerchantConfig;
      let RAZORPAY_SECRET = '';

      if (!merchantConfig) {
        const merchant = await BusinessSettings.findOne({
          razorpayMerchantId: merchantId,
        }).select('razorpayKeySecret');
        RAZORPAY_SECRET = merchant?.razorpayKeySecret as string;
      } else {
        RAZORPAY_SECRET = merchantConfig.razorpayKeySecret;
      }

      if (!RAZORPAY_SECRET) return respond(c, 'razorpay_secret missing while validating payments', true, 400, {});

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

      const signature = createHmac('sha256', RAZORPAY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');

      if (signature === razorpay_signature) {
        return c.json({
          err: false,
          message: 'Payment is valid',
          data: razorpay_order_id,
        });
      }
      return c.json(
        {
          err: true,
          message: 'Payment is invalid',
          data: {},
        },
        400,
      );
    },
  )
  .get(
    '/wa-webhooks',

    async (c) => {
      const mode = c.req.query('hub.mode');
      const challenge = c.req.query('hub.challenge');
      const token = c.req.query('hub.verify_token');

      if (mode === 'subscribe' && token === 'token') {
        return c.text(challenge ?? '', 200);
      }

      return c.json({
        message: 'Webhook not verified',
        err: true,
        data: {},
      });
    },
  )
  .post(
    '/wa-webhooks',

    async (c) => {
      const body = await c.req.json();
      if (body.action === 'ping') {
        return c.json(
          {
            version: '3.0',
            data: { status: 'active' },
          },
          200,
        );
      }
      if (!body?.object) {
        return c.json({ message: 'ignored', err: false }, 200);
      }
      const { messages, contacts, statuses, whatsAppBusinessConfigData } = await whatsAppEventData(body);
      console.log('statuses', statuses);
      if (messages && whatsAppBusinessConfigData) {
        const { userData, userInput } = await whatsAppUserAndTextMessage(contacts, messages, whatsAppBusinessConfigData);

        const qrType = identifyQrTypeFromMessage(userInput);

        if (qrType?.qrType && qrHandlers[qrType.qrType]) {
          await qrHandlers[qrType.qrType](
            qrType.value,
            userData.phone,
            userData._id.toString(),
            userData.name || 'Guest',
            whatsAppBusinessConfigData,
          );
          return respond(c, 'qrHandlers', false, 200, {});
        }
        if (whatsAppBusinessConfigData.chat) {
          const msgType = messages?.type;

          const messagePayload = {
            type: msgType, // 'text', 'image', 'video', 'document'
            body: '', // The main text content
            mediaUrl: '',
            mediaId: '',
            caption: '',
            filename: '',
          };

          // Extract data based on type
          if (msgType === 'text') {
            messagePayload.body = messages?.text?.body || '';
          } else if (msgType === 'image') {
            messagePayload.mediaUrl = messages?.image?.url || '';
            messagePayload.mediaId = messages?.image?.id || '';
            messagePayload.caption = messages?.image?.caption || '';
            messagePayload.body = messages?.image?.caption || '';
          } else if (msgType === 'video') {
            messagePayload.mediaUrl = messages?.video?.url || '';
            messagePayload.mediaId = messages?.video?.id || '';
            messagePayload.caption = messages?.video?.caption || '';
            messagePayload.body = messages?.video?.caption || '';
          } else if (msgType === 'document') {
            messagePayload.mediaUrl = messages?.document?.url || '';
            messagePayload.mediaId = messages?.document?.id || '';
            messagePayload.caption = messages?.document?.caption || '';
            messagePayload.filename = messages?.document?.filename || '';
            messagePayload.body = messages?.document?.caption || '';
          }

          // Pass the structured object to the handler
          await whatsAppChatHandler(messagePayload, userData._id.toString(), whatsAppBusinessConfigData);
        }
        if (messages?.text?.body?.length > 1) {
          await whatsAppBlockUserHandler(whatsAppBusinessConfigData, userData?.phone, userData._id.toString(), messages?.id, messages?.text?.body);
        }
      }
      if (messages !== undefined) {
        await handleChatbotFlow({
          messages,
          contacts,
          whatsAppBusinessConfigData,
          c,
        });
      }

      if (statuses && statuses.length > 0 && whatsAppBusinessConfigData) {
        await whatsAppCampaignHandler(whatsAppBusinessConfigData, statuses);
      }

      return respond(c, 'event received', false, 200, {});
    },
  )

  // 1) VERIFY WEBHOOK (GET)
  // .get("/instagram-webhooks", async (c) => {
  //   const mode = c.req.query("hub.mode");
  //   const token = c.req.query("hub.verify_token");
  //   const challenge = c.req.query("hub.challenge");

  //   console.log("🔍 IG Webhook Verification Request:", {
  //     mode,
  //     token,
  //     challenge,
  //   });

  //   if (mode === "subscribe" && token === "hipalz_ig_token") {
  //     return c.text(challenge ?? "", 200);
  //   }

  //   return c.text("Verification failed", 403);
  // })

  // 2) RECEIVE EVENTS (POST)
  // .post("/instagram-webhooks", async (c) => {
  //   const body = await c.req.json();
  //   console.log("📥 IG Event:", JSON.stringify(body, null, 2));

  //   const entry = body.entry?.[0];
  //   const messaging = entry?.messaging?.[0];

  //   if (!messaging) {
  //     console.log("⚠️ No messaging object found");
  //     return c.json({ success: true });
  //   }

  //   const senderId = messaging.sender?.id; // IG USER ID
  //   const recipientId = messaging.recipient?.id; // YOUR IG BUSINESS ID
  //   const text = messaging.message?.text; // USER TEXT

  //   console.log("➡️ Incoming IG Message:", text);

  //   // ===========================
  //   //  AUTO REPLY BACK TO USER
  //   // ===========================

  //   const IG_BUSINESS_ID = recipientId; // same as entry id
  //   const PAGE_ACCESS_TOKEN =
  //     "IGAAJL5qBYXRZABZAFN0bmJoOWVyOUY0SXJXZAnBTbVJoRWZAEWlg5RUx6RUFNSWozZAGM2UWt3VFpSNnJhM1NxamRsYkdyNHhrZAjJwd2Qtcl9rQzh5RnN6VHlVZA2pwdFVWOUpYVl9NSFZAlM1p1cTM3aFA4ZAEdB"; // store in DB/env

  //   const replyText = `Thanks for approaching us by ${text} us! We appreciate your message and will get back to you shortly.`;
  //   console.log("IG_BUSINESS_ID", IG_BUSINESS_ID);
  //   console.log("PAGE_ACCESS_TOKEN", PAGE_ACCESS_TOKEN);
  //   console.log("senderId", senderId);
  //   console.log("replyText", replyText);
  //   try {
  //     const sendUrl = `https://graph.facebook.com/v21.0/${IG_BUSINESS_ID}/messages`;

  //     const payload = {
  //       recipient: { id: senderId },
  //       message: { text: replyText },
  //     };

  //     const resp = await axios.post(sendUrl, payload, {
  //       headers: {
  //         Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     const respJson = await resp.data;
  //     console.log("📤 IG Auto-Reply Sent:", respJson);
  //   } catch (err) {
  //     console.log("❌ Error sending IG reply:", err);
  //   }

  //   return c.json({ success: true });
  // })

  // .get("/auth/instagram/callback", async (c) => {
  //   const APP_ID = "646403858128150"; // instagram App ID
  //   const APP_SECRET = "48d11bfcc7f0993b0bc521833f2a5b98"; // instagram App Secret
  //   const REDIRECT_URI =
  //     "https://73dce91d6fff.ngrok-free.app/auth/instagram/callback";

  //   try {
  //     // Check if this is a POST request from frontend with code in body
  //     const contentType = c.req.header("content-type");

  //     if (contentType?.includes("application/json")) {
  //       const { code } = await c.req.json();
  //       console.log("POST request with code:", code);
  //       if (!code) {
  //         return c.json({ error: "Authorization code is required" }, 400);
  //       }

  //       return await exchangeCodeForToken(
  //         c,
  //         code,
  //         APP_ID,
  //         APP_SECRET,
  //         REDIRECT_URI,
  //       );
  //     }
  //     // This is the initial callback from Instagram (GET request with code in query params)
  //     const code = c.req.query("code");

  //     if (!code) {
  //       return c.json({ error: "No authorization code provided" }, 400);
  //     }

  //     const result = await exchangeCodeForToken(
  //       c,
  //       code,
  //       APP_ID,
  //       APP_SECRET,
  //       REDIRECT_URI,
  //     );

  //     // Return a simple success page since this is the direct callback from Instagram
  //     return c.html(`
  //       <!DOCTYPE html>
  //       <html>
  //         <head><title>Instagram Connected</title></head>
  //         <body>
  //           <div style="text-align: center; margin-top: 50px;">
  //             <h2>Instagram account connected successfully!</h2>
  //             <p>You can now close this window and return to the application.</p>
  //           </div>
  //         </body>
  //       </html>
  //     `);
  //   } catch (error) {
  //     console.error("Callback error:", error);
  //     return c.json(
  //       { error: "Failed to process callback", details: error },
  //       500,
  //     );
  //   }
  // })

  .get(
    '/whatsapp_config/:businessId',

    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER]),

    zValidator('param', z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId,
      }).select('appId token tableQrCustomMessage tableQrCustomUrlText tableQrCustomUrl tableQrMessageType -_id');

      if (!whatsAppConfig) {
        return c.json({
          message: 'Config not found',
          err: true,
          data: {},
        });
      }

      return c.json({
        message: 'Config found',
        err: false,
        data: whatsAppConfig,
      });
    },
  )

  .post(
    '/update_whatsapp_config',

    zValidator('json', whatsAppBusinessConfigSchema),

    async (c) => {
      const requestData = await c.req.json();

      const createWhatsAppConfig = await WhatsAppBusinessConfig.findOneAndUpdate(
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
            tableQrCustomMessage: requestData.tableQrCustomMessage,
            tableQrCustomUrlText: requestData.tableQrCustomUrlText,
            tableQrCustomUrl: requestData.tableQrCustomUrl,
          },
        },
        {
          upsert: true,
        },
      );

      if (!createWhatsAppConfig) {
        return c.json({
          message: 'Error updating config',
          err: true,
          data: {},
        });
      }

      return c.json({
        message: 'Updated successfully',
        err: false,
        data: createWhatsAppConfig,
      });
    },
  )

  .patch(
    '/patch_whatsapp_config/:businessId',
    zValidator('param', z.object({ businessId: z.string() })),
    zValidator(
      'json',
      z.object({
        tableQrCustomMessage: z.string().optional(),
        tableQrCustomUrlText: z.string().optional(),
        tableQrCustomUrl: z.string().optional(),
        tableQrMessageType: z.enum(['TEXT', 'INTERACTIVE']).optional(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      const requestData = await c.req.json();

      const updateData: Record<string, any> = {};
      if (requestData.tableQrCustomMessage !== undefined) {
        updateData.tableQrCustomMessage = requestData.tableQrCustomMessage;
      }
      if (requestData.tableQrCustomUrlText !== undefined) {
        updateData.tableQrCustomUrlText = requestData.tableQrCustomUrlText;
      }
      if (requestData.tableQrCustomUrl !== undefined) {
        updateData.tableQrCustomUrl = requestData.tableQrCustomUrl;
      }
      if (requestData.tableQrMessageType !== undefined) {
        updateData.tableQrMessageType = requestData.tableQrMessageType;
      }

      if (Object.keys(updateData).length === 0) {
        return c.json({ message: 'No data to update', err: true, data: {} });
      }

      const updatedConfig = await WhatsAppBusinessConfig.findOneAndUpdate({ businessId }, { $set: updateData }, { new: true });

      return c.json({
        message: 'Config updated',
        err: false,
        data: updatedConfig,
      });
    },
  )

  .post(
    '/send-messages',

    async (c) => {
      const body = await c.req.json();
      const { text, phoneNumber, businessId, isOwner, userId, ownerId, type = 'text', mediaUrl, caption, filename } = body;
      const config = await WhatsAppBusinessConfig.findOne({
        businessId,
      });

      let payload: any = {
        messaging_product: 'whatsapp',
        to: phoneNumber?.toString(),
        type: type,
      };

      if (type === 'text') {
        payload.text = { body: text };
      } else if (type === 'image') {
        payload.image = { link: mediaUrl, caption: caption || text };
      } else if (type === 'video') {
        payload.video = { link: mediaUrl, caption: caption || text };
      } else if (type === 'document') {
        payload.document = {
          link: mediaUrl,
          caption: caption || text,
          filename: filename,
        };
      }

      await axios({
        method: 'POST',
        url: `${whatsAppApiBaseUrl.BASE_URL}${config?.version}/${config?.phoneId}/messages?access_token=${config?.token}`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const saveOwnerChat = await WhatsAppChat.create({
        businessId,
        date: Date.now(),
        message: text,
        mediaUrl,
        type,
        isOwner: true,
        userId: userId,
        ownerId: ownerId,
        caption,
        filename,
      });
      if (!saveOwnerChat) {
        return c.json({
          message: 'Error sending message',
          err: true,
          data: {},
        });
      }

      return c.json({
        message: 'Message sent successfully',
        err: false,
        data: {},
      });
    },
  )

  .get(
    '/user-messages/:userId/:ownerId/:businessId',

    zValidator(
      'query',
      z.object({
        page: z.string().optional().default('1'),
        limit: z.string().optional().default('20'),
      }),
    ),

    async (c) => {
      const { userId, ownerId, businessId } = c.req.param();
      const { page, limit } = c.req.query();
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const totalMessages = await WhatsAppChat.countDocuments({
        userId,
        businessId,
        isDeleted: false,
      });

      const userChats = await WhatsAppChat.find({
        userId,
        businessId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Only mark as seen if it's the first page (latest messages)
      if (pageNum === 1) {
        await WhatsAppChat.updateMany(
          {
            userId,
            businessId,
            seen: false,
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
      }

      return c.json({
        message: 'Messages found',
        err: false,
        data: userChats, // Returns newest first
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalMessages / limitNum),
          totalMessages,
          hasMore: skip + limitNum < totalMessages,
        },
      });
    },
  )
  .get(
    '/allUsers-messages/:ownerId',

    async (c) => {
      const { ownerId } = c.req.param();

      // const user = await WhatsAppUser.find({
      //   ownerId,
      // });

      // return c.json({
      //   message: "Messages found",
      //   err: false,
      //   data: user,
      // });
    },
  )

  .delete(
    '/user-messages/:userId/:ownerId/:businessId',
    zValidator(
      'param',
      z.object({
        userId: z.string(),
        ownerId: z.string(),
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { userId, ownerId, businessId } = c.req.param();

      const user = await WhatsAppChat.updateMany(
        {
          userId,
          businessId,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );

      return c.json({
        message: 'Messages found',
        err: false,
        data: {},
      });
    },
  )
  .post(
    '/whatsapp_waba_registration',

    async (c) => {
      const { displayName, displayNumber, facebookId, facebookPassword, businessId } = await c.req.json();

      const waba = await WhatsAppWABA.create({
        displayName,
        displayNumber,
        facebookId,
        facebookPassword,
        businessId,
        date: Date.now(),
      });

      return c.json({
        message: 'Waba registered successfully',
        err: false,
        data: waba,
      });
    },
  )
  .get(
    '/fetch_waba/:businessId',

    async (c) => {
      const { businessId } = c.req.param();

      const waba = await WhatsAppWABA.findOne({
        businessId,
      });

      if (!waba) {
        return c.json(
          {
            message: 'Waba not found',
            err: true,
            data: {},
          },
          404,
        );
      }
      return c.json({
        message: 'waba found',
        err: false,
        data: waba,
      });
    },
  )
  .get(
    '/wa_analytics_user/:businessId/:templateId',
    zValidator('param', z.object({ businessId: z.string(), templateId: z.string() })),
    zValidator(
      'query',
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
          message: 'wa analytics user',
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
        message: 'wa analytics user',
        err: false,
        data: waAnalyticsUser,
      });
    },
  )

  .get(
    '/campaigns/:businessId/:templateId',
    zValidator('param', z.object({ businessId: z.string(), templateId: z.string() })),

    async (c) => {
      const { businessId, templateId } = c.req.param();

      const campaigns = await Campaign.find({
        businessId,
        templateId,
      });

      return c.json({
        message: 'campaigns',
        err: false,
        data: campaigns,
      });
    },
  )

  .get(
    '/campaign_analytics/:businessId/:campaignId',
    zValidator('param', z.object({ businessId: z.string(), campaignId: z.string() })),
    zValidator(
      'query',
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
        status: {
          $ne: 'pending',
        },
      }).populate({
        path: 'userId',
        select: 'name phone',
      });

      const obj = waAnalyticsUser.reduce(
        (acc, user) => {
          acc.sent += user.status === 'sent' ? 1 : 0;
          acc.delivered += user.status === 'delivered' ? 1 : 0;
          acc.read += user.status === 'read' ? 1 : 0;
          acc.clicked += user.status === 'clicked' ? 1 : 0;
          acc.failed += user.status === 'failed' ? 1 : 0;
          acc.blocked += user.status === 'blocked' ? 1 : 0;
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
        }).populate({
          path: 'userId',
          select: 'name phone',
        });

        return c.json({
          message: 'wa analytics user',
          err: false,
          data: {
            overAllCount: obj,
            campaignAnalttics: waCampaignAnalyticsUser,
          },
        });
      }

      return c.json({
        message: 'wa analytics user',
        err: false,
        data: {
          overAllCount: obj,
          campaignAnalytics: waAnalyticsUser,
        },
      });
    },
  )

  .post(
    '/wa_embedded_signup',
    zValidator(
      'json',
      z.object({
        client_id: z.string().min(1).max(50),
        client_secret: z.string().min(1).max(70),
        code: z.string().min(1).max(500),
        businessId: z.string().min(1).max(50),
      }),
    ),

    async (c) => {
      try {
        const { client_id, client_secret, code, businessId } = await c.req.json();

        const getAccessToken = await axios.get(
          `${whatsAppApiBaseUrl.BASE_URL}/v18.0/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`,
        );

        const { access_token, token_type } = getAccessToken.data;

        const appInfo = await axios.get(`${whatsAppApiBaseUrl.BASE_URL}/v21.0/app`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        // create whatsapp business config

        const alreadyExist = await WhatsAppBusinessConfig.findOne({
          businessId,
        });

        if (alreadyExist) {
          return c.json(
            {
              message: 'whatsapp business config already exist',
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
            message: 'whatsapp business config created',
            err: false,
            data: {},
          },
          200,
        );
      } catch (error) {
        const axiosError = error as AxiosError;
        const message = axiosError.response?.data?.error?.message || axiosError.message;

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
    '/deactivate/wa_redirection/:businessId',
    zValidator('param', z.object({ businessId: z.string() })),
    zValidator('json', z.object({ menuRedirection: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();
      const { menuRedirection } = await c.req.json();

      const updateConfig = await WhatsAppBusinessConfig.findOneAndUpdate({ businessId }, { $set: { menuRedirection } }, { new: true });

      if (!updateConfig) {
        return c.json({
          message: 'Error updating config',
          err: true,
          data: {},
        });
      }

      return c.json({
        message: 'Updated successfully',
        err: false,
        data: updateConfig,
      });
    },
  )
  .get(
    '/wa_payments',
    zValidator(
      'query',
      z
        .object({
          from: z.coerce.number().int().nonnegative().optional(),
          to: z.coerce.number().int().nonnegative().optional(),
          order_id: z.string().optional(),
          razorpay_id: z.string().optional(),
          businessId: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(500).optional().default(100),
          skip: z.coerce.number().int().nonnegative().optional().default(0),
        })
        .refine((d) => (d.from !== undefined && d.to !== undefined) || !!d.order_id || !!d.razorpay_id, {
          message: 'Provide either `from`+`to`, `order_id`, or `razorpay_id`.',
        }),
    ),
    async (c) => {
      const { from, to, order_id, razorpay_id, businessId, limit, skip } = c.req.valid('query');

      const filter: Record<string, any> = {};

      // Priority: specific ID lookups first, then date range.
      if (order_id) {
        filter.order_id = order_id;
      } else if (razorpay_id) {
        // razorpay_id can be either the payment id (pay_xxx) or order id (order_xxx)
        filter.$or = [{ razorpayPaymentId: razorpay_id }, { razorpayOrderId: razorpay_id }];
      } else if (from !== undefined && to !== undefined) {
        if (from > to) {
          return c.json({ message: '`from` must be <= `to`', err: true, data: [] }, 400);
        }
        filter.date = { $gte: from, $lte: to };
      }

      if (businessId) filter.businessId = businessId;

      const [payments, count] = await Promise.all([
        WhatsAppPayment.find(filter)
          .populate('businessId', 'name')
          .select('order_id razorpayPaymentId razorpayOrderId businessId date total billValue mode paymentMode userId')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        WhatsAppPayment.countDocuments(filter),
      ]);

      return c.json({
        message: 'Payments fetched',
        err: false,
        data: { items: payments, total: count, limit, skip },
      });
    },
  );

export default whatsappRouter;
