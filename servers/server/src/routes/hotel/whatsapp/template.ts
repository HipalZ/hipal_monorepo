import { WhatAppTemplate, WhatsAppBusinessConfig } from "@hi/db-models";
import { validateWhatAppTemplateSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import whatsAppApiBaseUrl, {
  WHATSAPP_BUSINESS_DISABLED_MESSAGE,
  isWhatsAppConfigEnabled,
} from "../../../utils/whatsAppApiBaseUrl/apiPaths";

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

const updateWhatsAppTemplate = async ({
  templateId,
  businessId,
  requestData,
}: {
  templateId: string;
  businessId: string;
  requestData: any;
}) => {
  const whatsAppConfigData = await WhatsAppBusinessConfig.findOne({
    businessId,
  });

  if (!whatsAppConfigData) {
    return {
      statusCode: 404 as const,
      body: {
        message: "whatsAppConfigData not found",
        err: true,
        data: {},
      },
    };
  }

  if (!isWhatsAppConfigEnabled(whatsAppConfigData)) {
    return {
      statusCode: 403 as const,
      body: {
        message: WHATSAPP_BUSINESS_DISABLED_MESSAGE,
        err: true,
        data: {},
      },
    };
  }

  const updateWhatAppTemplate = await axios.post(
    `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${templateId}`,
    {
      ...requestData,
      businessId,
    },
    {
      headers: {
        Authorization: `Bearer ${whatsAppConfigData.token}`,
      },
    },
  );

  await WhatAppTemplate.findOneAndUpdate(
    { templateId, businessId },
    {
      bodyVariableSequence: requestData.bodyVariableSequence || [],
      headerVariableSequence: requestData.headerVariableSequence || [],
      footerVariableSequence: requestData.footerVariableSequence || [],
      buttonVariableSequence: requestData.buttonVariableSequence || [],
    },
  );

  return {
    statusCode: 200 as const,
    body: {
      message: "Edited successfully",
      err: false,
      data: updateWhatAppTemplate.data,
    },
  };
};

const whatsappTemplateRouter = new Hono()
  .post("/", zValidator("json", validateWhatAppTemplateSchema), async (c) => {
    try {
      const requestData = await c.req.json();
      const {
        bodyVariableSequence,
        headerVariableSequence,
        footerVariableSequence,
        buttonVariableSequence,
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
            buttonVariableSequence,
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
  })
  .get(
    "/",

    zValidator("query", z.object({ businessId: z.string().min(24).max(24) })),

    async (c) => {
      try {
        const { businessId } = c.req.query();

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

        if (!isWhatsAppConfigEnabled(whatsAppConfigData)) {
          return c.json(
            {
              message: WHATSAPP_BUSINESS_DISABLED_MESSAGE,
              err: true,
              data: {},
            },
            403,
          );
        }

        const wabaId = whatsAppConfigData.whatsAppAccountId;

        if (!wabaId) {
          return c.json(
            {
              message: "WhatsApp Business Account ID missing in config",
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

        const templatesArray = getWhatAppTemplate.data.data || [];

        const localTemplates = await WhatAppTemplate.find({
          businessId,
          isDeleted: { $ne: true },
        })
          .select("templateId")
          .limit(30);

        const localTemplateIds = new Set(
          localTemplates.map((template) => String(template.templateId)),
        );

        const syncedTemplates = templatesArray.filter((template: any) =>
          localTemplateIds.has(String(template.id)),
        );

        return c.json(
          {
            message: "fetched successfully",
            err: false,
            data: syncedTemplates,
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
    "/:templateid/:businessId",

    zValidator(
      "param",
      z.object({
        templateid: z.string().min(3).max(30),
        businessId: z.string().min(3).max(26),
      }),
    ),
    zValidator("json", validateWhatAppTemplateSchema.partial()),

    async (c) => {
      try {
        const { templateid, businessId } = c.req.param();
        const requestData = await c.req.json();
        const result = await updateWhatsAppTemplate({
          templateId: templateid,
          businessId,
          requestData,
        });

        return c.json(result.body, result.statusCode);
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

  .put(
    "/:templateId",

    zValidator(
      "param",
      z.object({
        templateId: z.string().min(3).max(30),
      }),
    ),
    zValidator("json", validateWhatAppTemplateSchema.partial()),

    async (c) => {
      const { templateId } = c.req.param();
      const requestData = await c.req.json();
      const { businessId } = requestData;

      if (!businessId) {
        return c.json(
          {
            message: "businessId is required to update template",
            err: true,
            data: {},
          },
          400,
        );
      }

      try {
        const result = await updateWhatsAppTemplate({
          templateId,
          businessId,
          requestData,
        });

        return c.json(result.body, result.statusCode);
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
    "/:templateId/:templateName/:businessId",

    zValidator(
      "param",
      z.object({
        templateName: z.string(),
        templateId: z.string(),
        businessId: z.string().min(3).max(26),
      }),
    ),

    async (c) => {
      try {
        const { templateName, templateId, businessId } = c.req.param();

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
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${whatsAppConfigData.whatsAppAccountId}/message_templates?name=${templateName}`,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfigData.token}`,
            },
          },
        );

        const deleteTemplate = await WhatAppTemplate.findOneAndUpdate(
          {
            templateId: templateId,
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
  );

export default whatsappTemplateRouter;
