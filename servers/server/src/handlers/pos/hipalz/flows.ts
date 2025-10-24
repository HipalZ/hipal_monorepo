import type { Context } from "hono";
import { whatsAppCampaignHandler } from "../../../utils/whatsappWebhookHandlers/campaign";
import { whatsAppBlockUserHandler } from "../../../utils/whatsappWebhookHandlers/whatsappBlockUser";
import { whatsAppChatHandler } from "../../../utils/whatsappWebhookHandlers/chatHandler";
import { qrHandlers } from "../../../utils/whatsappWebhookHandlers/allQrHandler";
import {
  identifyQrTypeFromMessage,
  whatsAppEventData,
  whatsAppUserAndTextMessage,
} from "../../../utils/whatsappWebhookHandlers/helper";
import { respond } from "../../../utils/response";

// ---- FLOW JSON (interactive-only, 3 flows) ----
const FLOW: {
  version: number;
  triggers: { keywords: string[]; start: string | null }[];
  nodes: any[];
} = {
  version: 2,
  triggers: [
    { keywords: ["dental"], start: "d_img_welcome" },
    { keywords: ["train"], start: "t_img_welcome" },
    { keywords: ["weather"], start: "w_list_cities" },
    {
      keywords: ["hoi"],
      start: "sx685mle",
    },
  ],
  // nodes: [
  //   // ---------------- D E N T A L ----------------
  //   {
  //     id: "d_img_welcome",
  //     type: "send_message",
  //     next: "d_interactive_entry",
  //     contentType: "image",
  //     mediaUrl:
  //       "https://media.istockphoto.com/id/1271195625/photo/man-having-teeth-examined-at-dentists.jpg?s=612x612&w=0&k=20&c=D9BP07tM6I1Se6gNrivBOWvLLpYXsn4a-9YOR7VgnWI=",
  //     fileName: "",
  //   },
  //   {
  //     id: "d_interactive_entry",
  //     type: "interactive_message",
  //     layout: "button",
  //     bodyText: "Welcome {{name||Guest}} to Universal Dental Clinic 🦷",
  //     footerText: "Tap to begin your booking",
  //     buttons: [
  //       { id: "d_btn_start", title: "Start Booking" },
  //       { id: "d_btn_info", title: "Clinic Info" },
  //     ],
  //     routes: {
  //       d_btn_start: "d_q_name",
  //       d_btn_info: "d_msg_info",
  //     },
  //   },
  //   {
  //     id: "d_msg_info",
  //     type: "send_message",
  //     next: "d_interactive_entry",
  //     contentType: "text",
  //     text: "We’re open Mon–Sat, 9am–7pm at MG Road. Consultations start at ₹500.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  //   {
  //     id: "d_q_name",
  //     type: "ask_question",
  //     next: "d_q_gender",
  //     prompt: "Great! What’s your full name?",
  //     variable: "name",
  //     inputType: "text",
  //     required: true,
  //   },
  //   {
  //     id: "d_q_gender",
  //     type: "ask_question",
  //     next: "d_q_phone",
  //     prompt: "Your gender? (e.g., Male/Female/Other)",
  //     variable: "gender",
  //     inputType: "text",
  //     required: true,
  //   },
  //   {
  //     id: "d_q_phone",
  //     type: "ask_question",
  //     next: "d_slots",
  //     prompt: "Your phone number?",
  //     variable: "phone",
  //     inputType: "phone",
  //     required: true,
  //   },
  //   {
  //     id: "d_slots",
  //     type: "interactive_message",
  //     layout: "button",
  //     bodyText: "Pick a preferred slot for {{name}}",
  //     footerText: "We’ll confirm right away",
  //     buttons: [
  //       { id: "d_slot_10", title: "10:00–10:30" },
  //       { id: "d_slot_12", title: "12:00–12:30" },
  //       { id: "d_slot_17", title: "17:00–17:30" },
  //     ],
  //     routes: {
  //       d_slot_10: "d_thanks",
  //       d_slot_12: "d_thanks",
  //       d_slot_17: "d_thanks",
  //     },
  //   },
  //   {
  //     id: "d_thanks",
  //     type: "send_message",
  //     next: null,
  //     contentType: "text",
  //     text: "Thank you {{name}}! Your dental appointment request has been received. We’ll call {{phone}} to confirm.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },

  //   // ---------------- T R A I N ----------------
  //   {
  //     id: "t_img_welcome",
  //     type: "send_message",
  //     next: "t_interactive_entry",
  //     contentType: "image",
  //     mediaUrl:
  //       "https://img.etimg.com/thumb/width-1200,height-900,imgsize-1063601,resizemode-75,msid-115732108/industry/transportation/railways/high-speed-trains-indian-railways-280-kmph-speed-aerodynamic-design-indias-next-high-speed-trains-are-coming-soon-beml-icf-ashwini-vaishnaw.jpg",
  //     fileName: "",
  //   },
  //   {
  //     id: "t_interactive_entry",
  //     type: "interactive_message",
  //     layout: "button",
  //     bodyText: "Welcome {{name||Traveler}}! 🚆 Plan your journey.",
  //     footerText: "Tap to begin train booking",
  //     buttons: [
  //       { id: "t_btn_start", title: "Start Booking" },
  //       { id: "t_btn_help", title: "Help" },
  //     ],
  //     routes: {
  //       t_btn_start: "t_q_name",
  //       t_btn_help: "t_msg_help",
  //     },
  //   },
  //   {
  //     id: "t_msg_help",
  //     type: "send_message",
  //     next: "t_interactive_entry",
  //     contentType: "text",
  //     text: "We’ll ask your details, show available trains, then date & time slots for booking.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  //   {
  //     id: "t_q_name",
  //     type: "ask_question",
  //     next: "t_q_age",
  //     prompt: "Your full name?",
  //     variable: "t_name",
  //     inputType: "text",
  //     required: true,
  //   },
  //   {
  //     id: "t_q_age",
  //     type: "ask_question",
  //     next: "t_q_phone",
  //     prompt: "Your age?",
  //     variable: "t_age",
  //     inputType: "number",
  //     required: true,
  //   },
  //   {
  //     id: "t_q_phone",
  //     type: "ask_question",
  //     next: "t_list_trains",
  //     prompt: "Your phone number?",
  //     variable: "t_phone",
  //     inputType: "phone",
  //     required: true,
  //   },
  //   // Show list of available trains (Interactive LIST)
  //   {
  //     id: "t_list_trains",
  //     type: "interactive_message",
  //     layout: "list",
  //     bodyText: "Available trains today",
  //     footerText: "Choose a train to continue",
  //     list: {
  //       buttonText: "View Trains",
  //       sections: [
  //         {
  //           title: "Express Services",
  //           rows: [
  //             {
  //               id: "t_train_rajdhani",
  //               title: "Rajdhani Express",
  //               description: "Fast, AC sleeper",
  //             },
  //             {
  //               id: "t_train_shatabdi",
  //               title: "Shatabdi Express",
  //               description: "Daytime chair car",
  //             },
  //           ],
  //         },
  //         {
  //           title: "Other Options",
  //           rows: [
  //             {
  //               id: "t_train_intercity",
  //               title: "Intercity Express",
  //               description: "Affordable",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     routes: {
  //       t_train_rajdhani: "t_date_picker",
  //       t_train_shatabdi: "t_date_picker",
  //       t_train_intercity: "t_date_picker",
  //     },
  //   },
  //   // Date picker (simulate with buttons)
  //   {
  //     id: "t_date_picker",
  //     type: "interactive_message",
  //     layout: "button",
  //     bodyText: "Select a travel date",
  //     footerText: "Next 3 days",
  //     buttons: [
  //       { id: "t_date_d1", title: "Today" },
  //       { id: "t_date_d2", title: "Tomorrow" },
  //       { id: "t_date_d3", title: "Day After" },
  //     ],
  //     routes: {
  //       t_date_d1: "t_time_picker",
  //       t_date_d2: "t_time_picker",
  //       t_date_d3: "t_time_picker",
  //     },
  //   },
  //   // Time picker (simulate with buttons)
  //   {
  //     id: "t_time_picker",
  //     type: "interactive_message",
  //     layout: "button",
  //     bodyText: "Pick a departure time",
  //     footerText: "",
  //     buttons: [
  //       { id: "t_time_morning", title: "08:30" },
  //       { id: "t_time_noon", title: "12:45" },
  //       { id: "t_time_even", title: "18:10" },
  //     ],
  //     routes: {
  //       t_time_morning: "t_done",
  //       t_time_noon: "t_done",
  //       t_time_even: "t_done",
  //     },
  //   },
  //   {
  //     id: "t_done",
  //     type: "send_message",
  //     next: null,
  //     contentType: "text",
  //     text: "✅ Booking request received for {{t_name}} ({{t_age}} yrs). We’ll call {{t_phone}} to confirm.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },

  //   // ---------------- W E A T H E R ----------------
  //   // Start with LIST of cities (or Other)
  //   {
  //     id: "w_list_cities",
  //     type: "interactive_message",
  //     layout: "list",
  //     bodyText: "🌤️ Weather center — pick a city",
  //     footerText: "Or choose Other to type your location",
  //     list: {
  //       buttonText: "Choose City",
  //       sections: [
  //         {
  //           title: "Top Cities",
  //           rows: [
  //             { id: "w_city_mumbai", title: "Mumbai", description: "MH" },
  //             { id: "w_city_delhi", title: "Delhi", description: "DL" },
  //             { id: "w_city_blr", title: "Bengaluru", description: "KA" },
  //           ],
  //         },
  //         {
  //           title: "More",
  //           rows: [
  //             {
  //               id: "w_city_other",
  //               title: "Other…",
  //               description: "Type a location",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     routes: {
  //       w_city_mumbai: "w_reply_mumbai",
  //       w_city_delhi: "w_reply_delhi",
  //       w_city_blr: "w_reply_blr",
  //       w_city_other: "w_q_location",
  //     },
  //   },
  //   // If city chosen directly (demo stub)
  //   {
  //     id: "w_reply_mumbai",
  //     type: "send_message",
  //     next: "w_thanks",
  //     contentType: "text",
  //     text: "Mumbai weather: Sunny 31°C, Humidity 58%, Light breeze.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  //   {
  //     id: "w_reply_delhi",
  //     type: "send_message",
  //     next: "w_thanks",
  //     contentType: "text",
  //     text: "Delhi weather: Haze 28°C, AQI 160 (Moderate), Light winds.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  //   {
  //     id: "w_reply_blr",
  //     type: "send_message",
  //     next: "w_thanks",
  //     contentType: "text",
  //     text: "Bengaluru weather: Partly cloudy 26°C, Chance of showers later.",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  //   // If “Other”, ask for location then reply
  //   {
  //     id: "w_q_location",
  //     type: "ask_question",
  //     next: "w_reply_generic",
  //     prompt: "Type your city or location (e.g., Pune, Andheri, etc.)",
  //     variable: "w_loc",
  //     inputType: "text",
  //     required: true,
  //   },
  //   {
  //     id: "w_reply_generic",
  //     type: "send_message",
  //     next: "w_thanks",
  //     contentType: "text",
  //     text: "Weather for {{w_loc}}: Mostly clear 27°C (demo).",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  //   {
  //     id: "w_thanks",
  //     type: "send_message",
  //     next: null,
  //     contentType: "text",
  //     text: "Thanks! 🌦️",
  //     mediaUrl: "",
  //     fileName: "",
  //   },
  // ],
  nodes: [
    {
      id: "sx685mle",
      type: "ask_question",
      next: "dyz24qrl",
      prompt: "please enter your email address",
      variable: "email",
      inputType: "text",
      required: true,
    },
    {
      id: "dyz24qrl",
      type: "set_condition",
      logic: [
        {
          var: "email",
          op: "eq",
          value: "mvvk96@gmail.com",
        },
      ],
      trueNext: "zqj1a4rq",
      falseNext: "s4zlrzwa",
    },
    {
      id: "zqj1a4rq",
      type: "ask_question",
      next: null,
      prompt: "enter correct email address",
      variable: "email",
      inputType: "text",
      required: true,
    },
    {
      id: "s4zlrzwa",
      type: "send_message",
      next: "29n4t766",
      contentType: "text",
      text: "thank you",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "29n4t766",
      type: "interactive_message",
      layout: "button",
      header: {
        type: "",
        mediaUrl: "",
        fileName: "",
      },
      bodyText:
        "This is the question, and lets choose the options and when you are choosing the option",
      footerText: "powered by hipalz",
      buttons: [
        {
          id: "opt_6swb9rhe",
          title: "option 1",
          description: "",
        },
        {
          id: "opt_illrk8b9",
          title: "option 2",
          description: "",
        },
      ],
      routes: {},
      next: "65e7inur",
    },
    {
      id: "x8piqdbc",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "You have chosen option 1",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "65e7inur",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "You have chosen option 2",
      mediaUrl: "",
      fileName: "",
    },
  ],
};

// ---- Runtime state + helpers ----
type FlowNode = (typeof FLOW.nodes)[number];
const NODE_BY_ID: Map<string, FlowNode> = new Map(
  FLOW.nodes.map((n) => [n.id, n]),
);

type Session = {
  userId: string;
  currentNodeId: string | null;
  waitingFor: null | "ask" | "interactive";
  variables: Record<string, any>;
  interactiveCtx?: { routes: Record<string, string | null> };
};
const sessions = new Map<string, Session>();

function getSession(userId: string): Session {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      userId,
      currentNodeId: null,
      waitingFor: null,
      variables: {},
    });
  }
  return sessions.get(userId)!;
}
function setSession(userId: string, patch: Partial<Session>) {
  const s = getSession(userId);
  sessions.set(userId, { ...s, ...patch });
}

const isEmpty = (v: any) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

// supports {{var}} and {{var||fallback}}
function interpolate(str: string | undefined, vars: Record<string, any>) {
  if (!str) return "";
  return str
    .replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "")
    .replace(/\{\{(\w+)\|\|([^}]+)\}\}/g, (_, k, fb) =>
      isEmpty(vars[k]) ? fb : String(vars[k]),
    );
}

function evalRow(
  row: { var: string; op: string; value?: string },
  vars: Record<string, any>,
) {
  const left = vars[row.var];
  const right = row.value;
  switch (row.op) {
    case "exists":
      return left && left.trim() !== "";
    case "eq":
      return String(left).trim() === String(right).trim();
    case "ne":
      return String(left).trim() !== String(right).trim();
    case "gt":
      return Number(left) > Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "contains":
      return String(left ?? "").includes(String(right ?? ""));
    default:
      return false;
  }
}
function evalCondition(node: any, vars: Record<string, any>) {
  return node.logic.every((r: any) => evalRow(r, vars));
}

function matchTriggerStart(userId: string, text?: string) {
  const msg = (text || "").trim().toLowerCase();
  const trig = FLOW.triggers.find((t) =>
    (t.keywords || []).some((k) => String(k).toLowerCase() === msg),
  );
  if (trig?.start) {
    setSession(userId, {
      currentNodeId: trig.start,
      waitingFor: null,
      interactiveCtx: undefined,
    });
    return true;
  }
  return false;
}

// ---- WhatsApp send adapter (uses whatsAppBusinessConfigData: { phoneId, token }) ----
async function waSend(whatsAppBusinessConfigData: any, payload: any) {
  const phoneNumberId = String(
    whatsAppBusinessConfigData?.phoneId || "",
  ).trim();
  const token = String(whatsAppBusinessConfigData?.token || "").replace(
    /\s+/g,
    "",
  );

  if (!phoneNumberId)
    throw new Error("Missing phoneId in whatsAppBusinessConfigData");
  if (!token) throw new Error("Missing token in whatsAppBusinessConfigData");

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("[WA send error]", res.status, text);
    if (res.status === 401 || text.includes('"code":190')) {
      throw new Error(
        "Invalid or malformed access token. Check whatsAppBusinessConfigData.token and .phoneId",
      );
    }
    throw new Error(`WA send failed ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function sendText(
  to: string,
  text: string,
  whatsAppBusinessConfigData: any,
) {
  await waSend(whatsAppBusinessConfigData, {
    to,
    type: "text",
    text: { body: text, preview_url: false },
  });
}
async function sendImage(
  to: string,
  link: string,
  whatsAppBusinessConfigData: any,
) {
  await waSend(whatsAppBusinessConfigData, {
    to,
    type: "image",
    image: { link },
  });
}
async function sendDocument(
  to: string,
  link: string,
  filename: string | undefined,
  whatsAppBusinessConfigData: any,
) {
  await waSend(whatsAppBusinessConfigData, {
    to,
    type: "document",
    document: { link, filename },
  });
}
async function sendInteractiveButton(to, bodyText, buttons, footerText, cfg) {
  await waSend(cfg, {
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  });
}

// NEW: interactive LIST
async function sendInteractiveList(
  to: string,
  bodyText: string,
  list: {
    buttonText: string;
    sections: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[];
  },
  footerText: string | undefined,
  whatsAppBusinessConfigData: any,
) {
  await waSend(whatsAppBusinessConfigData, {
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: {
        button: list.buttonText || "Choose",
        sections: list.sections.map((s) => ({
          title: s.title,
          rows: s.rows.map((r) => ({
            id: r.id,
            title: r.title,
            ...(r.description ? { description: r.description } : {}),
          })),
        })),
      },
    },
  });
}

// ---- Advance the flow until input boundary ----
async function advance(
  userId: string,
  waTo: string,
  whatsAppBusinessConfigData: any,
) {
  let s = getSession(userId);
  let hops = 0;
  while (s.currentNodeId) {
    if (++hops > 25) {
      console.warn("[flow] hop limit exceeded");
      break;
    }

    const node = NODE_BY_ID.get(s.currentNodeId);
    if (!node) {
      setSession(userId, {
        currentNodeId: null,
        waitingFor: null,
        interactiveCtx: undefined,
      });
      break;
    }

    if (node.type === "send_message") {
      if (node.contentType === "text") {
        await sendText(
          waTo,
          interpolate(node.text, s.variables),
          whatsAppBusinessConfigData,
        );
      } else if (node.contentType === "image") {
        await waSend(whatsAppBusinessConfigData, {
          to: waTo,
          type: "image",
          image: {
            link: node.mediaUrl,
            caption: interpolate(
              node.caption || node.bodyText || "",
              s.variables,
            ),
          },
        });
      } else {
        await sendDocument(
          waTo,
          interpolate(node.mediaUrl, s.variables),
          node.fileName || undefined,
          whatsAppBusinessConfigData,
        );
      }
      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    if (node.type === "ask_question") {
      await sendText(
        waTo,
        interpolate(node.prompt, s.variables),
        whatsAppBusinessConfigData,
      );
      setSession(userId, { waitingFor: "ask" });
      return; // wait for user input
    }

    if (node.type === "set_condition") {
      const ok = evalCondition(node, s.variables); // ✅ evaluates true or false

      setSession(userId, {
        currentNodeId: (ok ? node.trueNext : node.falseNext) || null, // ✅ if true → go to trueNext, else → falseNext
      });

      s = getSession(userId);
      continue; // ✅ continue advancing the flow to the next node
    }

    if (node.type === "interactive_message") {
      const layout = node.layout || "button";
      const body = interpolate(node.bodyText || "", s.variables);
      const footer = interpolate(node.footerText || "", s.variables);
      const header = node.header
        ? {
            type: node.header.type,
            [node.header.type]: { link: node.header.mediaUrl },
          }
        : undefined;

      // CASE 1️⃣: Interactive List layout
      if (layout === "list" && node.list) {
        await sendInteractiveList(
          waTo,
          body,
          node.list,
          footer || undefined,
          whatsAppBusinessConfigData,
        );
        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      // CASE 2️⃣: CTA URL layout
      if (layout === "cta_url") {
        const ctaUrl = (node.cta?.url || "").trim();
        const ctaLabel = (node.cta?.label || "Open Link").trim();

        if (ctaUrl) {
          // ✅ Proper CTA URL message
          await waSend(whatsAppBusinessConfigData, {
            to: waTo,
            type: "interactive",
            interactive: {
              type: "cta_url",
              header,
              body: { text: body },
              ...(footer ? { footer: { text: footer } } : {}),
              action: {
                name: "cta_url",
                parameters: {
                  display_text: ctaLabel,
                  url: ctaUrl,
                },
              },
            },
          });
        } else {
          // ⚠️ Missing URL → fallback to button with image + continue
          console.warn("[Flow] Missing CTA URL, fallback to image+body+button");
          await waSend(whatsAppBusinessConfigData, {
            to: waTo,
            type: "interactive",
            interactive: {
              type: "button",
              ...(header ? { header } : {}),
              body: { text: body },
              ...(footer ? { footer: { text: footer } } : {}),
              action: {
                buttons: [
                  {
                    type: "reply",
                    reply: {
                      id: "fallback_continue",
                      title: "Continue",
                    },
                  },
                ],
              },
            },
          });
        }

        setSession(userId, {
          currentNodeId: node.next || null,
          waitingFor: "interactive",
          interactiveCtx: {
            routes: node.routes || { fallback_continue: node.next },
          },
        });
        return;
      }

      // CASE 3️⃣: Button layout with image header (your example)
      if (layout === "button" && node.buttons?.length > 0) {
        await waSend(whatsAppBusinessConfigData, {
          to: waTo,
          type: "interactive",
          interactive: {
            type: "button",
            ...(header ? { header } : {}),
            body: { text: body },
            ...(footer ? { footer: { text: footer } } : {}),
            action: {
              buttons: node.buttons.map((b) => ({
                type: "reply",
                reply: { id: b.id, title: b.title },
              })),
            },
          },
        });

        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      // CASE 4️⃣: No buttons, no CTA, but has image → just send image message
      if ((!node.buttons || node.buttons.length === 0) && header?.image?.link) {
        await waSend(whatsAppBusinessConfigData, {
          to: waTo,
          type: "image",
          image: {
            link: header.image.link,
            caption: body || footer || "",
          },
        });
        setSession(userId, { currentNodeId: node.next || null });
        return;
      }

      // CASE 5️⃣: Fallback plain text if nothing matches
      await sendText(waTo, body, whatsAppBusinessConfigData);
      setSession(userId, { currentNodeId: node.next || null });
      return;
    }

    if (node.layout === "list" && node.list) {
      await waSend(whatsAppBusinessConfigData, {
        to: waTo,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: interpolate(node.bodyText, s.variables) },
          footer: node.footerText
            ? { text: interpolate(node.footerText, s.variables) }
            : undefined,
          action: {
            button: node.list.buttonText,
            sections: node.list.sections.map((s) => ({
              title: s.title,
              rows: s.rows.map((r) => ({
                id: r.id,
                title: r.title,
                ...(r.description ? { description: r.description } : {}),
              })),
            })),
          },
        },
      });
    }

    // unknown type
    setSession(userId, {
      currentNodeId: null,
      waitingFor: null,
      interactiveCtx: undefined,
    });
    break;
  }
}

// ---- Webhook handler ----
export const waWebhookHandler = async (c: Context) => {
  const body = await c.req.json();

  if ((body as any).action === "ping") {
    return c.json({ version: "3.0", data: { status: "active" } }, 200);
  }
  if (!body?.object) {
    return c.json({ message: "ignored", err: false }, 200);
  }

  const { messages, contacts, statuses, whatsAppBusinessConfigData } =
    await whatsAppEventData(body as any);

  let from = messages?.from || contacts?.[0]?.wa_id || contacts?.[0]?.waId;
  let textBody: string | undefined;
  let interactiveTitleOrId: string | undefined;

  if (messages) {
    if (messages.type === "interactive") {
      const inter = messages.interactive;
      interactiveTitleOrId =
        inter?.button_reply?.id ||
        inter?.button_reply?.title ||
        inter?.list_reply?.id ||
        inter?.list_reply?.title;
    } else if (messages?.text?.body) {
      textBody = messages.text.body;
    }
  }

  // Flow runtime first
  if (whatsAppBusinessConfigData && from) {
    const s = getSession(from);

    // CTA selection
    if (interactiveTitleOrId) {
      if (s.waitingFor === "interactive" && s.interactiveCtx?.routes) {
        const routes = s.interactiveCtx.routes;
        let target = routes[interactiveTitleOrId];
        if (!target) {
          const key = Object.keys(routes).find(
            (k) => k.toLowerCase() === interactiveTitleOrId!.toLowerCase(),
          );
          if (key) target = routes[key]!;
        }
        if (target) {
          setSession(from, {
            currentNodeId: target,
            waitingFor: null,
            interactiveCtx: undefined,
          });
          await advance(from, from, whatsAppBusinessConfigData);
          return respond(c, "flow consumed (interactive)", false, 200, {});
        }
      }
      if (matchTriggerStart(from, interactiveTitleOrId)) {
        await advance(from, from, whatsAppBusinessConfigData);
        return respond(
          c,
          "flow consumed (trigger from interactive)",
          false,
          200,
          {},
        );
      }
    }

    // Free text
    if (textBody) {
      if (s.waitingFor === "ask" && s.currentNodeId) {
        const node = NODE_BY_ID.get(s.currentNodeId);
        if (node && node.type === "ask_question") {
          const value = textBody.trim();
          if (
            (node.inputType === "phone" || node.variable?.includes("phone")) &&
            node.required
          ) {
            const ok = /^[+\d][\d\s\-()]{5,}$/.test(value);
            if (!ok) {
              await sendText(
                from,
                "Please enter a valid phone number.",
                whatsAppBusinessConfigData,
              );
              return respond(c, "validation", false, 200, {});
            }
          }
          setSession(from, {
            variables: { ...s.variables, [node.variable]: value },
          });
          setSession(from, {
            waitingFor: null,
            currentNodeId: node.next || null,
          });
          await advance(from, from, whatsAppBusinessConfigData);
          return respond(c, "flow consumed (ask)", false, 200, {});
        }
      }
      if (matchTriggerStart(from, textBody)) {
        await advance(from, from, whatsAppBusinessConfigData);
        return respond(c, "flow consumed (trigger)", false, 200, {});
      }
    }
  }

  // Fallback to your existing logic if flow didn't consume
  if (
    messages &&
    messages?.text?.body?.length > 1 &&
    whatsAppBusinessConfigData
  ) {
    const { userData, userInput } = await whatsAppUserAndTextMessage(
      contacts,
      messages,
      whatsAppBusinessConfigData,
    );

    const qrType = identifyQrTypeFromMessage(userInput);
    if (qrType?.qrType && qrHandlers[qrType.qrType]) {
      await qrHandlers[qrType.qrType](
        qrType.value,
        userData.phone,
        userData._id.toString(),
        userData.name || "Guest",
        whatsAppBusinessConfigData,
      );
    }

    if (whatsAppBusinessConfigData.chat) {
      await whatsAppChatHandler(
        messages?.text?.body,
        userData._id.toString(),
        whatsAppBusinessConfigData,
      );
    }

    await whatsAppBlockUserHandler(
      whatsAppBusinessConfigData,
      userData?.phone,
      userData._id.toString(),
      messages?.id,
      messages?.text?.body,
    );
  }

  if (statuses && statuses.length > 0 && whatsAppBusinessConfigData) {
    await whatsAppCampaignHandler(whatsAppBusinessConfigData, statuses);
  }

  return respond(c, "event received", false, 200, {});
};
