import { WhatAppTemplate } from "@hi/db-models";
import {
  campaignSchema,
  validateWhatAppTemplateSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { whatsAppConfig } from "../../utils/whatAppTemplate";
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
const whatsappRouter = new Hono()
  .get(
    "/template/all/:businessId",

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
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
          message: "fetching all templates",
          err: false,
          data: templatesArray,
        },
        200,
      );
    },
  )
  .post(
    "/template",
    zValidator("json", validateWhatAppTemplateSchema),
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.MANAGER]),
    async (c) => {
      try {
        const requestData = await c.req.json();
        const {
          bodyVariableSequence,
          headerVariableSequence,
          footerVariableSequence,
          businessId,
        } = requestData;

        const response = await axios.post(
          "https://graph.facebook.com/v21.0/378623998675618/message_templates",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${whatsAppConfig.token}`,
            },
          },
        );

        const { id } = response.data;

        const createTemplate = await WhatAppTemplate.create({
          templateId: id,
          bodyVariableSequence,
          headerVariableSequence,
          footerVariableSequence,
          businessId,
          date: Date.now(),
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

        return c.json(
          {
            message: "Template created successfully",
            err: false,
            data: response.data,
          },
          201,
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
    "/template/:templateid",

    zValidator("param", z.object({ templateid: z.string() })),

    async (c) => {
      const { templateid } = c.req.param();

      const getWhatAppTemplate = await axios.get(
        `https://graph.facebook.com/${whatsAppConfig.version}/${templateid}`,
        {
          headers: {
            Authorization: `Bearer ${whatsAppConfig.token}`,
          },
        },
      );

      if (!getWhatAppTemplate) {
        return c.json(
          {
            message: "Welcome to WhatsApp API",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Welcome to WhatsApp API",
          err: false,
          data: getWhatAppTemplate.data,
        },
        200,
      );
    },
  )
  .put(
    "/template/:templateid",

    zValidator("param", z.object({ templateid: z.string() })),
    zValidator("json", validateWhatAppTemplateSchema.partial()),

    async (c) => {
      const { templateid } = c.req.param();

      const requestData = await c.req.json();

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

      if (!updateWhatAppTemplate) {
        return c.json(
          {
            message: "error in updating",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Welcome to WhatsApp API",
          err: false,
          data: updateWhatAppTemplate.data,
        },
        200,
      );
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
        } = requestData;

        if (allCustomers) {
          const allCustomersList = [
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

          // const sendTemplateMessageToCustomer = await axios.post(
          //   `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
          //   {
          //     messaging_product: "whatsapp",
          //     to: `${customerPhone}`,
          //     type: "template",
          //     template: {
          //       name: "hello_world",
          //       language: { code: "en_US" },
          //       components: [],
          //     },
          //   },

          //   {
          //     headers: {
          //       Authorization: `Bearer ${whatsAppConfig.token}`,
          //     },
          //   },
          // );

          for (let i = 0; i < allCustomersList.length; i++) {
            const customer = allCustomersList[i];
            console.log("first customer", typeof customer.phone);
            const sendTemplateMessageToCustomer = await axios.post(
              `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
              {
                messaging_product: "whatsapp",
                to: customer.phone.toString(),
                type: "template",
                template: {
                  name: "festivals_template",
                  language: { code: "en_GB" },
                  components: [
                    {
                      type: "HEADER",
                      parameters: [
                        {
                          type: "image",
                          image: {
                            link: "http://higssoftware.com/blog/images/happy-diwali.png",
                          },
                        },
                      ],
                    },

                    {
                      type: "BODY",
                      parameters: [
                        {
                          type: "text",
                          text: customer.name.toString(),
                        },
                        {
                          type: "text",
                          text: businessName.toString(),
                        },
                      ],
                    },
                  ],
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${whatsAppConfig.token}`,
                },
              },
            );

            // if (!sendTemplateMessageToCustomer) {
            //   return c.json(
            //     {
            //       message: "Error sending template",
            //       err: true,
            //       data: {},
            //     },
            //     400,
            //   );
            // }
          }
        }
        if (customerPhone) {
          const sendTemplateMessageToCustomer = await axios.post(
            `https://graph.facebook.com/${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`,
            {
              messaging_product: "whatsapp",
              to: customerPhone.toString(),
              type: "template",
              template: {
                name: "festivals_template",
                language: { code: "en_GB" },
                components: [
                  {
                    type: "HEADER",
                    parameters: [
                      {
                        type: "image",
                        image: {
                          link: "http://higssoftware.com/blog/images/happy-diwali.png",
                        },
                      },
                    ],
                  },

                  {
                    type: "BODY",
                    parameters: [
                      {
                        type: "text",
                        text: customerPhone.toString(),
                      },
                      {
                        type: "text",
                        text: businessName.toString(),
                      },
                    ],
                  },
                ],
              },
            },
            {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            },
          );
        }

        // const template = await axios.get(
        //   `https://graph.facebook.com/${whatsAppConfig.version}/${templateId}`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${whatsAppConfig.token}`,
        //     },
        //   },
        // );

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

export default whatsappRouter;
