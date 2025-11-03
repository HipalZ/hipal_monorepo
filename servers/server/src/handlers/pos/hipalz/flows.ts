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
      keywords: ["hi", "anvita", "project", "real estate"],
      start: "ivana_welcome",
    },
    { keywords: ["test"], start: "test_q_name" },
  ],
  nodes: [
    {
      id: "test_q_name",
      type: "ask_question",
      next: "test_reply",
      prompt: "👋 Hi there! What’s your name?",
      storeVariable: "@user_name",
      inputType: "text",
      required: true,
    },
    {
      id: "test_reply",
      type: "send_message",
      next: "sheet_export",
      contentType: "text",
      text: `✅ Got it! You said your name is {{@user_name}}.`,
      storeVariable: "@last_message",
    },
    {
      id: "sheet_export",
      type: "google_sheet_export",
      next: null,
      sheet: {
        spreadsheetId: "1abcDxyzYOUR_SHEET_ID",
        sheetName: "Sheet1",
        columns: ["@user_name", "@phone", "@last_message"],
      },
    },

    {
      id: "d_img_welcome",
      type: "send_message",
      next: "d_interactive_entry",
      contentType: "image",
      mediaUrl:
        "https://media.istockphoto.com/id/1271195625/photo/man-having-teeth-examined-at-dentists.jpg?s=612x612&w=0&k=20&c=D9BP07tM6I1Se6gNrivBOWvLLpYXsn4a-9YOR7VgnWI=",
      fileName: "",
    },
    {
      id: "d_interactive_entry",
      type: "interactive_message",
      layout: "button",
      bodyText: "Welcome {{name||Guest}} to Universal Dental Clinic 🦷",
      footerText: "Tap to begin your booking",
      buttons: [
        { id: "d_btn_start", title: "Start Booking" },
        { id: "d_btn_info", title: "Clinic Info" },
      ],
      routes: {
        d_btn_start: "d_q_name",
        d_btn_info: "d_msg_info",
      },
    },
    {
      id: "d_msg_info",
      type: "send_message",
      next: "d_interactive_entry",
      contentType: "text",
      text: "We’re open Mon–Sat, 9am–7pm at MG Road. Consultations start at ₹500.",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "d_q_name",
      type: "ask_question",
      next: "d_q_gender",
      prompt: "Great! What’s your full name?",
      variable: "name",
      inputType: "text",
      required: true,
    },
    {
      id: "d_q_gender",
      type: "ask_question",
      next: "d_q_phone",
      prompt: "Your gender? (e.g., Male/Female/Other)",
      variable: "gender",
      inputType: "text",
      required: true,
    },
    {
      id: "d_q_phone",
      type: "ask_question",
      next: "d_slots",
      prompt: "Your phone number?",
      variable: "phone",
      inputType: "phone",
      required: true,
    },
    {
      id: "d_slots",
      type: "interactive_message",
      layout: "button",
      bodyText: "Pick a preferred slot for {{name}}",
      footerText: "We’ll confirm right away",
      buttons: [
        { id: "d_slot_10", title: "10:00–10:30" },
        { id: "d_slot_12", title: "12:00–12:30" },
        { id: "d_slot_17", title: "17:00–17:30" },
      ],
      routes: {
        d_slot_10: "d_thanks",
        d_slot_12: "d_thanks",
        d_slot_17: "d_thanks",
      },
    },
    {
      id: "d_thanks",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "Thank you {{name}}! Your dental appointment request has been received. We’ll call {{phone}} to confirm.",
      mediaUrl: "",
      fileName: "",
    },

    // ---------------- T R A I N ----------------
    {
      id: "t_img_welcome",
      type: "send_message",
      next: "t_interactive_entry",
      contentType: "image",
      mediaUrl:
        "https://img.etimg.com/thumb/width-1200,height-900,imgsize-1063601,resizemode-75,msid-115732108/industry/transportation/railways/high-speed-trains-indian-railways-280-kmph-speed-aerodynamic-design-indias-next-high-speed-trains-are-coming-soon-beml-icf-ashwini-vaishnaw.jpg",
      fileName: "",
    },
    {
      id: "t_interactive_entry",
      type: "interactive_message",
      layout: "button",
      bodyText: "Welcome {{name||Traveler}}! 🚆 Plan your journey.",
      footerText: "Tap to begin train booking",
      buttons: [
        { id: "t_btn_start", title: "Start Booking" },
        { id: "t_btn_help", title: "Help" },
      ],
      routes: {
        t_btn_start: "t_q_name",
        t_btn_help: "t_msg_help",
      },
    },
    {
      id: "t_msg_help",
      type: "send_message",
      next: "t_interactive_entry",
      contentType: "text",
      text: "We’ll ask your details, show available trains, then date & time slots for booking.",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "t_q_name",
      type: "ask_question",
      next: "t_q_age",
      prompt: "Your full name?",
      variable: "t_name",
      inputType: "text",
      required: true,
    },
    {
      id: "t_q_age",
      type: "ask_question",
      next: "t_q_phone",
      prompt: "Your age?",
      variable: "t_age",
      inputType: "number",
      required: true,
    },
    {
      id: "t_q_phone",
      type: "ask_question",
      next: "t_list_trains",
      prompt: "Your phone number?",
      variable: "t_phone",
      inputType: "phone",
      required: true,
    },
    // Show list of available trains (Interactive LIST)
    {
      id: "t_list_trains",
      type: "interactive_message",
      layout: "list",
      bodyText: "Available trains today",
      footerText: "Choose a train to continue",
      list: {
        buttonText: "View Trains",
        sections: [
          {
            title: "Express Services",
            rows: [
              {
                id: "t_train_rajdhani",
                title: "Rajdhani Express",
                description: "Fast, AC sleeper",
              },
              {
                id: "t_train_shatabdi",
                title: "Shatabdi Express",
                description: "Daytime chair car",
              },
            ],
          },
          {
            title: "Other Options",
            rows: [
              {
                id: "t_train_intercity",
                title: "Intercity Express",
                description: "Affordable",
              },
            ],
          },
        ],
      },
      routes: {
        t_train_rajdhani: "t_date_picker",
        t_train_shatabdi: "t_date_picker",
        t_train_intercity: "t_date_picker",
      },
    },
    // Date picker (simulate with buttons)
    {
      id: "t_date_picker",
      type: "interactive_message",
      layout: "button",
      bodyText: "Select a travel date",
      footerText: "Next 3 days",
      buttons: [
        { id: "t_date_d1", title: "Today" },
        { id: "t_date_d2", title: "Tomorrow" },
        { id: "t_date_d3", title: "Day After" },
      ],
      routes: {
        t_date_d1: "t_time_picker",
        t_date_d2: "t_time_picker",
        t_date_d3: "t_time_picker",
      },
    },
    // Time picker (simulate with buttons)
    {
      id: "t_time_picker",
      type: "interactive_message",
      layout: "button",
      bodyText: "Pick a departure time",
      footerText: "",
      buttons: [
        { id: "t_time_morning", title: "08:30" },
        { id: "t_time_noon", title: "12:45" },
        { id: "t_time_even", title: "18:10" },
      ],
      routes: {
        t_time_morning: "t_done",
        t_time_noon: "t_done",
        t_time_even: "t_done",
      },
    },
    {
      id: "t_done",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "✅ Booking request received for {{t_name}} ({{t_age}} yrs). We’ll call {{t_phone}} to confirm.",
      mediaUrl: "",
      fileName: "",
    },

    // ---------------- W E A T H E R ----------------
    // Start with LIST of cities (or Other)
    {
      id: "w_list_cities",
      type: "interactive_message",
      layout: "list",
      bodyText: "🌤️ Weather center — pick a city",
      footerText: "Or choose Other to type your location",
      list: {
        buttonText: "Choose City",
        sections: [
          {
            title: "Top Cities",
            rows: [
              { id: "w_city_mumbai", title: "Mumbai", description: "MH" },
              { id: "w_city_delhi", title: "Delhi", description: "DL" },
              { id: "w_city_blr", title: "Bengaluru", description: "KA" },
            ],
          },
          {
            title: "More",
            rows: [
              {
                id: "w_city_other",
                title: "Other…",
                description: "Type a location",
              },
            ],
          },
        ],
      },
      routes: {
        w_city_mumbai: "w_reply_mumbai",
        w_city_delhi: "w_reply_delhi",
        w_city_blr: "w_reply_blr",
        w_city_other: "w_q_location",
      },
    },
    // If city chosen directly (demo stub)
    {
      id: "w_reply_mumbai",
      type: "send_message",
      next: "w_thanks",
      contentType: "text",
      text: "Mumbai weather: Sunny 31°C, Humidity 58%, Light breeze.",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "w_reply_delhi",
      type: "send_message",
      next: "w_thanks",
      contentType: "text",
      text: "Delhi weather: Haze 28°C, AQI 160 (Moderate), Light winds.",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "w_reply_blr",
      type: "send_message",
      next: "w_thanks",
      contentType: "text",
      text: "Bengaluru weather: Partly cloudy 26°C, Chance of showers later.",
      mediaUrl: "",
      fileName: "",
    },
    // If “Other”, ask for location then reply
    {
      id: "w_q_location",
      type: "ask_question",
      next: "w_reply_generic",
      prompt: "Type your city or location (e.g., Pune, Andheri, etc.)",
      variable: "w_loc",
      inputType: "text",
      required: true,
    },
    {
      id: "w_reply_generic",
      type: "send_message",
      next: "w_thanks",
      contentType: "text",
      text: "Weather for {{w_loc}}: Mostly clear 27°C (demo).",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "w_thanks",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "Thanks! 🌦️",
      mediaUrl: "",
      fileName: "",
    },
    {
      id: "ivana_welcome",
      type: "send_message",
      next: "ivana_intro",
      contentType: "image",
      mediaUrl: "https://anvita-group.com/ivana/cover-image.jpg", // replace with your project image
      fileName: "",
    },
    {
      id: "ivana_intro",
      type: "interactive_message",
      layout: "button",
      bodyText:
        "🏡 Welcome to *Anvita Ivana, Kollur* – A Landmark of Luxurious Living.\nTap below to learn more!",
      footerText: "Your dream home starts here ✨",
      buttons: [{ id: "btn_interested", title: "Tell me more" }],
      routes: { btn_interested: "ivana_main_menu" },
    },

    // ---- Step 2: Main Menu ----
    {
      id: "ivana_main_menu",
      type: "interactive_message",
      layout: "list",
      bodyText:
        "Please select one of the options to know more, or ask your own question:",
      footerText: "Anvita Ivana – Kollur | Luxury 2, 3 & 4 BHK Sky Villas",
      list: {
        buttonText: "View Options",
        sections: [
          {
            title: "Explore Project",
            rows: [
              { id: "opt_project_details", title: "Project Details" },
              { id: "opt_price", title: "Current Price" },
              { id: "opt_location", title: "Location" },
              { id: "opt_brochure", title: "Download Brochure" },
              { id: "opt_site_visit", title: "Schedule Site Visit" },
              { id: "opt_agent", title: "Talk to an Agent" },
            ],
          },
        ],
      },
      routes: {
        opt_project_details: "ivana_details",
        opt_price: "ivana_price",
        opt_location: "ivana_location",
        opt_brochure: "ivana_brochure",
        opt_site_visit: "ivana_visit",
        opt_agent: "ivana_agent",
      },
    },

    // ---- Step 3: Project Details ----
    {
      id: "ivana_details",
      type: "send_message",
      next: "ivana_main_menu",
      contentType: "text",
      text: `🏙️ *Anvita Ivana – A Landmark of Luxurious Living*\n\nA premium 12.9-acre gated community with 6 elegant towers, 1750+ apartments, 30 Sky Villas, and 40 Cloud Villas.\n\n📍 *Prime Location:* Beside Neopolis, ORR facing, 10 mins from Financial District.\n\n✨ *Unit Sizes:*\n- 2 BHK – 1360 sq.ft.\n- 3 BHK – 1720 to 2580 sq.ft.\n- 4 BHK Cloud Villas – 2915 to 5070 sq.ft.\n\n🌳 *Amenities:*\n- 3-acre Central Park\n- 1,00,000 sq.ft. Clubhouses\n- 2,00,000 sq.ft. podium & terrace amenities\n\n🎥 Watch walkthrough video: https://www.youtube.com/watch?v=eXRppdEf5pc`,
      mediaUrl: "",
      fileName: "",
    },

    // ---- Step 4: Current Price ----
    {
      id: "ivana_price",
      type: "send_message",
      next: "ivana_main_menu",
      contentType: "text",
      text: "💰 *Current Price Ranges:*\n\n- 2 BHK from ₹1.3 Cr*\n- 3 BHK from ₹1.9 Cr*\n- 4 BHK Sky Villas from ₹3.4 Cr*\n\n*Prices subject to change. T&C apply.*",
      mediaUrl: "",
      fileName: "",
    },

    // ---- Step 5: Location ----
    {
      id: "ivana_location",
      type: "send_message",
      next: "ivana_main_menu",
      contentType: "text",
      text: `📍 *Anvita Ivana, Kollur – The Gateway to Kollur*\n\nORR Facing | 6 mins from Neopolis | 8 mins from Kokapet | 13 mins from Wipro Circle | 35 mins from RGIA.\n\n🌿 Surrounded by lush greenery with scenic landscapes and private internal road.\n\nView on map: https://goo.gl/maps/BhSDaocZ3fDcBTmr9`,
      mediaUrl: "",
      fileName: "",
    },

    // ---- Step 6: Brochure ----
    {
      id: "ivana_brochure",
      type: "send_message",
      next: "ivana_main_menu",
      contentType: "document",
      mediaUrl: "https://anvita-group.com/ivana/Anvita_Ivana_Brochure.pdf",
      fileName: "Anvita_Ivana_Brochure.pdf",
    },

    // ---- Step 7: Schedule Site Visit ----
    {
      id: "ivana_visit",
      type: "ask_question",
      next: "ivana_visit_time",
      prompt: "🗓️ Please share your *full name* to schedule your site visit.",
      variable: "visitor_name",
      inputType: "text",
      required: true,
    },
    {
      id: "ivana_visit_time",
      type: "ask_question",
      next: "ivana_visit_phone",
      prompt:
        "When would you like to visit? (e.g., Tomorrow 4 PM or Sunday 11 AM)",
      variable: "visit_time",
      inputType: "text",
      required: true,
    },
    {
      id: "ivana_visit_phone",
      type: "ask_question",
      next: "ivana_visit_confirm",
      prompt:
        "📞 Please share your phone number so our agent can confirm the visit.",
      variable: "visit_phone",
      inputType: "phone",
      required: true,
    },
    {
      id: "ivana_visit_confirm",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "✅ Thank you {{visitor_name}}! We’ve received your site visit request for *{{visit_time}}*. Our representative will call you at {{visit_phone}} to confirm.",
      mediaUrl: "",
      fileName: "",
    },

    // ---- Step 8: Talk to an Agent ----
    {
      id: "ivana_agent",
      type: "send_message",
      next: null,
      contentType: "text",
      text: "☎️ Please contact our sales team directly:\n\n📞 +91 90000 12345\n\nOr just reply *Call me* and we’ll arrange a callback.",
      mediaUrl: "",
      fileName: "",
    },
  ],
  variables: {
    visitor_name: {
      sourceNode: "ivana_visit",
      inputType: "text",
      required: true,
    },
    visit_time: {
      sourceNode: "ivana_visit_time",
      inputType: "text",
      required: true,
    },
    visit_phone: {
      sourceNode: "ivana_visit_phone",
      inputType: "phone",
      required: true,
    },
  },
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

function interpolate(str: string | undefined, vars: Record<string, any>) {
  if (!str) return "";

  // Regex supports both {{name}} and {{@user_name}}, including fallbacks like {{@user_name||Guest}}
  return str
    .replace(/\{\{([@\w]+)\|\|([^}]+)\}\}/g, (_, key, fallback) => {
      // If the variable starts with @, treat it as a stored variable
      const value = key.startsWith("@")
        ? vars[key]
        : vars[key.replace(/^@/, "")];
      return isEmpty(value) ? fallback : String(value);
    })
    .replace(/\{\{([@\w]+)\}\}/g, (_, key) => {
      const value = key.startsWith("@")
        ? vars[key]
        : vars[key.replace(/^@/, "")];
      return value !== undefined ? String(value) : "";
    });
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

async function advance(
  userId: string,
  waTo: string,
  whatsAppBusinessConfigData: any,
) {
  let s = getSession(userId);
  let hops = 0;

  while (s.currentNodeId) {
    if (++hops > 25) break;

    const node = NODE_BY_ID.get(s.currentNodeId);
    if (!node) break;

    // --- send_message ---
    if (node.type === "send_message") {
      const text = interpolate(node.text || "", s.variables);

      if (node.contentType === "text")
        await sendText(waTo, text, whatsAppBusinessConfigData);
      else if (node.contentType === "image")
        await sendImage(
          waTo,
          interpolate(node.mediaUrl, s.variables),
          whatsAppBusinessConfigData,
        );
      else if (node.contentType === "document")
        await sendDocument(
          waTo,
          interpolate(node.mediaUrl, s.variables),
          node.fileName,
          whatsAppBusinessConfigData,
        );

      // ✅ If node defines storeVariable, save sent message text automatically
      if (node.storeVariable) {
        setSession(userId, {
          variables: {
            ...s.variables,
            [node.storeVariable]: text,
          },
        });
        console.log(`📦 Stored ${node.storeVariable}:`, text);
      }

      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    // --- ask_question ---
    if (node.type === "ask_question") {
      await sendText(
        waTo,
        interpolate(node.prompt, s.variables),
        whatsAppBusinessConfigData,
      );
      setSession(userId, { waitingFor: "ask" });
      return;
    }

    // --- interactive_message ---
    if (node.type === "interactive_message") {
      const layout = node.layout || "button";
      const body = interpolate(node.bodyText || "", s.variables);
      const footer = interpolate(node.footerText || "", s.variables);

      if (layout === "list" && node.list) {
        await sendInteractiveList(
          waTo,
          body,
          node.list,
          footer,
          whatsAppBusinessConfigData,
        );
        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: {
            routes: node.routes || {},
            storeVariable: node.storeVariable,
          },
        });
        return;
      }

      if (layout === "button" && node.buttons?.length > 0) {
        await sendInteractiveButton(
          waTo,
          body,
          node.buttons,
          footer,
          whatsAppBusinessConfigData,
        );
        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: {
            routes: node.routes || {},
            storeVariable: node.storeVariable, // ✅
          },
        });
        return;
      }

      await sendText(waTo, body, whatsAppBusinessConfigData);
      setSession(userId, { currentNodeId: node.next || null });
      return;
    }

    // --- condition ---
    if (node.type === "set_condition") {
      const ok = evalCondition(node, s.variables);
      setSession(userId, {
        currentNodeId: (ok ? node.trueNext : node.falseNext) || null,
      });
      s = getSession(userId);
      continue;
    }

    // --- google_sheet_export ---
    if (node.type === "google_sheet_export") {
      const rowData = node.sheet.columns.map(
        (col: string) => s.variables[col] || "",
      );
      await appendToSheet({
        spreadsheetId: node.sheet.spreadsheetId,
        sheetName: node.sheet.sheetName || "Sheet1",
        rowValues: rowData,
      });

      console.log(`📊 Exported to Google Sheet: ${node.sheet.spreadsheetId}`);
      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    // fallback
    setSession(userId, { currentNodeId: null, waitingFor: null });
    break;
  }
}

async function sendNextNode(node, to, cfg, vars = {}) {
  if (!node) return;

  if (node.type === "send_message") {
    if (node.contentType === "text") {
      await waSend(cfg, {
        to,
        type: "text",
        text: { body: interpolate(node.text, vars) },
      });
    } else if (node.contentType === "image") {
      await waSend(cfg, {
        to,
        type: "image",
        image: {
          link: node.mediaUrl,
          caption: interpolate(node.caption || "", vars),
        },
      });
    }
  }

  if (node.type === "ask_question") {
    await waSend(cfg, {
      to,
      type: "text",
      text: { body: interpolate(node.prompt, vars) },
    });
    setSession(to, { waitingFor: "ask" });
  }

  if (node.type === "interactive_message") {
    await waSend(cfg, {
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: interpolate(node.bodyText, vars) },
        action: {
          buttons: node.buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: interpolate(b.title, vars) },
          })),
        },
      },
    });
    setSession(to, { waitingFor: "interactive" });
  }
}
function debugInterpolationExample(userId: string) {
  const s = getSession(userId);
  const test =
    "✅ Got it! You said your name is {{@user_name}} and phone {{phone}}.";
  console.log("➡️ Before:", test);
  console.log("⬅️ After:", interpolate(test, s.variables));
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
    if (interactiveTitleOrId) {
      if (s.waitingFor === "interactive" && s.interactiveCtx?.routes) {
        const routes = s.interactiveCtx.routes;
        let target = routes[interactiveTitleOrId];
        const currentVar = s.interactiveCtx.variable;
        const storeVar = s.interactiveCtx.storeVariable;

        // ✅ Prefer storeVariable if defined on node
        const varName = storeVar || currentVar;
        if (varName) {
          setSession(from, {
            variables: {
              ...s.variables,
              [varName]: interactiveTitleOrId,
            },
          });
          console.log(`📥 Captured ${varName}:`, interactiveTitleOrId);
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
    }

    // Free text
    if (textBody) {
      if (s.waitingFor === "ask" && s.currentNodeId) {
        const node = NODE_BY_ID.get(s.currentNodeId);

        if (node?.storeVariable) {
          setSession(from, {
            variables: {
              ...s.variables,
              [node.storeVariable]: textBody.trim(),
            },
          });
        }

        const updatedSession = getSession(from);
        debugInterpolationExample(from);

        setSession(from, {
          waitingFor: null,
          currentNodeId: node.next || null,
        });

        const nextNode = NODE_BY_ID.get(node.next);
        if (nextNode) {
          await sendNextNode(
            nextNode,
            from,
            whatsAppBusinessConfigData,
            updatedSession.variables,
          );
        }

        return respond(c, "flow consumed (ask)", false, 200, {});
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
