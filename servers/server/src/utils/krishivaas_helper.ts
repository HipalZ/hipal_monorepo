import axios from "axios";
import { WhatsAppBusinessConfig } from "@hi/db-models";
import whatsAppApiBaseUrl from "./whatsAppApiBaseUrl/apiPaths";

type Props = {
  from: string;
  userObj: any;
  c: any;
  config: any;
  whatsAppApiBaseUrl: any;
};

export async function krishivaasInteractiveHandler(
  messages: any,
  c: any,
  phon_no_id: string,
) {
  const from = messages?.from;
  if (!messages.interactive?.nfm_reply?.response_json)
    return c.json({ message: "No response_json found in the message" }, 400);
  const config = await WhatsAppBusinessConfig.findOne({
    phoneId: phon_no_id,
  });
  if (!config) {
    return c.json({ message: "WhatsApp config not found", err: true }, 404);
  }

  try {
    await axios.post(
      `${whatsAppApiBaseUrl.BASE_URL}${config.version}/${config.phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        type: "text",
        text: {
          body: "Thank you so much for your response. We will get back to you shortly.",
        },
      },
      { headers: { Authorization: `Bearer ${config.token}` } },
    );

    return c.json({ message: "Template sent successfully." }, 200);
  } catch (error) {
    console.error(
      "Error in WhatsApp send flow:",
      error?.response?.data || error.message,
    );
    return c.json(
      {
        message: "Error sending WhatsApp message",
        error: error?.response?.data || error.message,
      },
      500,
    );
  }
}

export async function KrishivaasAutoMessageHandler(props: Props) {
  const { from, userObj, c, config, whatsAppApiBaseUrl } = props;
  const payload = {
    messaging_product: "whatsapp",
    to: from,
    type: "template",
    template: {
      name: "krishivaas_welcome",
      language: {
        code: "en_GB",
      },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                link: "https://media.licdn.com/dms/image/v2/D5622AQHMxS3lVWs0Mg/feedshare-shrink_800/B56ZhQEfQaG0Aw-/0/1753690012360?e=2147483647&v=beta&t=8CwV0dOlTTRR9O42Rl5mxTn4B5uK8rmPK-6u3BkLI0w",
              },
            },
          ],
        },
        {
          type: "BODY",
          parameters: [
            {
              type: "text",
              text: userObj.name,
            },
          ],
        },
        {
          type: "FOOTER",
          parameters: [
            {
              type: "text",
              text: "Powered by Namaste",
            },
          ],
        },
        {
          type: "button",
          sub_type: "flow",
          index: "0",
          parameters: [
            {
              type: "action",
              action: {
                flow_token: "token",
                flow_action_data: {
                  prefill_name: userObj.name,
                },
              },
            },
          ],
        },
      ],
    },
  };
  try {
    // 1️⃣ Check if customer exists in Krishivaas DB
    const checkResponse = await axios.get(
      `https://api.staging.krishivaas.ai/api/v1/get-name-by-mobile-number/9896000099`,
    );
    const name = checkResponse?.data?.data;
    console.log("name", name);
    if (!name) {
      await axios.post(
        `${whatsAppApiBaseUrl.BASE_URL}${config.version}/${config.phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          type: "text",
          text: {
            body: "We are sorry, we are unable to find you in our records. Please contact our support team.",
          },
        },
        {
          headers: { Authorization: `Bearer ${config.token}` },
        },
      );

      return c.json({ message: "Fallback text message sent." }, 200);
    }
    await axios.post(
      `${whatsAppApiBaseUrl.BASE_URL}${config.version}/${config.phoneId}/messages`,
      payload,
      {
        headers: { Authorization: `Bearer ${config.token}` },
      },
    );

    return c.json({ message: "Template sent successfully." }, 200);
  } catch (error) {
    console.error(
      "Error in WhatsApp send flow:",
      error?.response?.data || error.message,
    );
    return c.json(
      {
        message: "Error sending WhatsApp message",
        error: error?.response?.data || error.message,
      },
      500,
    );
  }
}
