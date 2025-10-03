import { WhatAppTemplate, WhatsAppBusinessConfig } from "@hi/db-models";
import { validateWhatAppTemplateSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import whatsAppApiBaseUrl from "../../../utils/whatsAppApiBaseUrl/apiPaths";

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

const whatsappTemplateRouter = new Hono()
  .post("/", zValidator("json", validateWhatAppTemplateSchema), async (c) => {
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

        const getWhatAppTemplate = await WhatAppTemplate.find({
          businessId,
          isDeleted: false,
        })
          .select("templateId")
          .limit(30);

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
      const { businessId } = await c.req.json();

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
          `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfigData.version}/${templateId}`,
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
