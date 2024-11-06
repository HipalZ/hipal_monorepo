import { validateWhatAppTemplateSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { z } from "zod";
import { whatsAppConfig } from "../../utils/whatAppTemplate";
const whatsappRouter = new Hono()
  .get("/", async (c) => {
    return c.json(
      {
        message: "Welcome to WhatsApp API",
        err: false,
        data: {},
      },
      200,
    );
  })
  .post(
    "/template",

    zValidator("json", validateWhatAppTemplateSchema),
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.MANAGER]),

    async (c) => {
      const requestData = await c.req.json();

      const createWhatAppTemplate = await axios.post(
        "https://graph.facebook.com/v21.0/378623998675618/message_templates",
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
          message: "Welcome to WhatsApp API",
          err: false,
          data: createWhatAppTemplate.data,
        },
        200,
      );
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

  .delete("/template/:templateid", async (c) => {
    return c.json(
      {
        message: "Welcome to WhatsApp API",
        err: false,
        data: {},
      },
      200,
    );
  });

export default whatsappRouter;
