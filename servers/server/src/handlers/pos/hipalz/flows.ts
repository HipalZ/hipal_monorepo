import type { Context } from "hono";
import { ChatbotSessionModel, WhatsappChatbotModel } from "@hi/db-models";
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

/* ----------------------------------------------------------------------------
 * FLOW CACHE (per business)
 * ------------------------------------------------------------------------- */
async function getAllChatbotFlows(businessId: string) {
  const flows = await WhatsappChatbotModel.find({
    businessId,
    active: true,
    status: "active",
  }).lean();

  if (!flows.length) return [];

  return flows.map((flow) => ({
    flow,
    NODE_BY_ID: new Map(flow.nodes.map((n) => [n.id, n])),
    lastLoaded: Date.now(),
  }));
}

/* ----------------------------------------------------------------------------
 * RUNTIME SESSION
 * ------------------------------------------------------------------------- */
type SessionState = {
  userId: string;
  currentNodeId: string | null;
  waitingFor: null | "ask" | "interactive";
  variables: Record<string, any>;
  interactiveCtx?: { routes: Record<string, string | null> };
};
const sessions = new Map<string, SessionState>();

function getSession(userId: string): SessionState {
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
function setSession(userId: string, patch: Partial<SessionState>) {
  const s = getSession(userId);
  sessions.set(userId, { ...s, ...patch });
}

/* ----------------------------------------------------------------------------
 * FLOW UTILS
 * ------------------------------------------------------------------------- */
const isEmpty = (v: any) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "");

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
      return !!(left && String(left).trim() !== "");
    case "eq":
      return String(left ?? "").trim() === String(right ?? "").trim();
    case "ne":
      return String(left ?? "").trim() !== String(right ?? "").trim();
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
  const rules = node?.logic || [];
  if (!Array.isArray(rules) || rules.length === 0) return false;
  return rules.every((r: any) => evalRow(r, vars));
}
function isEndNode(node: any): boolean {
  return (
    !node?.next &&
    !node?.trueNext &&
    !node?.falseNext &&
    !(node?.routes && Object.keys(node.routes).length > 0)
  );
}
function matchTriggerStart(FLOW: any, userId: string, text?: string) {
  const msg = (text || "").trim().toLowerCase();
  const trig = (FLOW.triggers || []).find((t: any) =>
    (t.keywords || []).some((k: string) => String(k).toLowerCase() === msg),
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

/* ----------------------------------------------------------------------------
 * WA SEND HELPERS (text, image, doc, interactive)
 * ------------------------------------------------------------------------- */
async function waSend(cfg: any, payload: any) {
  const phoneNumberId = String(cfg?.phoneId || "").trim();
  const token = String(cfg?.token || "").replace(/\s+/g, "");
  if (!phoneNumberId) throw new Error("Missing phoneId in cfg");
  if (!token) throw new Error("Missing token in cfg");

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
    throw new Error(`WA send failed ${res.status}: ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function sendText(to: string, text: string, cfg: any) {
  await waSend(cfg, {
    to,
    type: "text",
    text: { body: text, preview_url: false },
  });
}

async function sendImage(
  to: string,
  link: string,
  caption: string | undefined,
  cfg: any,
) {
  await waSend(cfg, {
    to,
    type: "image",
    image: { link, ...(caption ? { caption } : {}) },
  });
}

async function sendDocument(
  to: string,
  link: string,
  filename: string | undefined,
  cfg: any,
) {
  await waSend(cfg, {
    to,
    type: "document",
    document: { link, ...(filename ? { filename } : {}) },
  });
}

async function sendInteractiveButton(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  buttons: Array<{
    id: string;
    type: "reply" | "url";
    title: string;
    url?: string;
  }>,
  header: any | undefined,
  cfg: any,
) {
  const actionButtons = buttons.map((b) => {
    console.log("Button:", b.type, b);
    if (b.type === "url" && b.url) {
      return {
        type: "url",
        url: b.url, // ✅ Real clickable link
        title: b.title,
      };
    }
    return {
      type: "reply",
      reply: {
        id: b.id,
        title: b.title,
      },
    };
  });

  const interactive: any = {
    type: "button",
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: { buttons: actionButtons },
  };

  if (header?.type === "image" && header?.image?.link) {
    interactive.header = { type: "image", image: { link: header.image.link } };
  }

  await waSend(cfg, { to, type: "interactive", interactive });
}

async function sendInteractiveList(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  list: {
    buttonText?: string;
    sections: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[];
  },
  cfg: any,
) {
  const payload = {
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: {
        button: list.buttonText || "Choose",
        sections: (list.sections || []).map((s) => ({
          title: s.title,
          rows: (s.rows || []).map((r) => ({
            id: r.id,
            title: r.title,
            ...(r.description ? { description: r.description } : {}),
          })),
        })),
      },
    },
  };

  await waSend(cfg, payload);
}

async function sendInteractiveCTAUrl(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  ctaUrl: string,
  ctaLabel: string,
  header: any | undefined,
  cfg: any,
) {
  const interactive: any = {
    type: "cta_url",
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: {
      name: "cta_url",
      parameters: { display_text: ctaLabel, url: ctaUrl },
    },
  };

  if (header?.type === "image" && header?.image?.link) {
    interactive.header = { type: "image", image: { link: header.image.link } };
  }
  await waSend(cfg, { to, type: "interactive", interactive });
}

/* ----------------------------------------------------------------------------
 * ADVANCE FLOW
 * ------------------------------------------------------------------------- */
async function advance(
  FLOW: any,
  NODE_BY_ID: Map<string, any>,
  userId: string,
  waTo: string,
  cfg: any,
) {
  let s = getSession(userId);
  let hops = 0;
  while (s.currentNodeId) {
    if (++hops > 25) {
      console.warn("[flow] hop limit exceeded");
      break;
    }
    const node = NODE_BY_ID.get(s.currentNodeId);
    console.log("node", node);
    if (!node) {
      setSession(userId, {
        currentNodeId: null,
        waitingFor: null,
        interactiveCtx: undefined,
      });
      break;
    }

    // Update session progress
    await ChatbotSessionModel.findOneAndUpdate(
      { userId, chatbotId: FLOW._id },
      { $inc: { totalMessages: 1 }, $set: { lastNodeId: node.id } },
      { sort: { startTime: -1 } },
    );
    // --- SEND MESSAGE ---
    if (node.type === "send_message") {
      if (node.contentType === "text") {
        await sendText(waTo, interpolate(node.text, s.variables), cfg);
      } else if (node.contentType === "image") {
        await sendImage(
          waTo,
          String(node.mediaUrl || ""),
          interpolate(node.caption || node.bodyText || "", s.variables),
          cfg,
        );
      } else if (node.contentType === "document") {
        await sendDocument(
          waTo,
          String(interpolate(node.mediaUrl || "", s.variables)),
          node.fileName || undefined,
          cfg,
        );
      }

      if (isEndNode(node)) {
        await ChatbotSessionModel.findOneAndUpdate(
          { userId, chatbotId: FLOW._id },
          { completed: true, endTime: new Date(), lastNodeId: node.id },
          { sort: { startTime: -1 } },
        );
        setSession(userId, { currentNodeId: null });
        break;
      }

      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    // --- ASK QUESTION ---
    if (node.type === "ask_question") {
      await sendText(waTo, interpolate(node.prompt, s.variables), cfg);
      setSession(userId, { waitingFor: "ask" });
      return;
    }

    // --- SET CONDITION ---
    if (node.type === "set_condition") {
      const ok = evalCondition(node, s.variables);
      setSession(userId, {
        currentNodeId: (ok ? node.trueNext : node.falseNext) || null,
      });
      s = getSession(userId);
      continue;
    }

    // --- INTERACTIVE MESSAGE ---
    if (node.type === "interactive_message") {
      const layout = node.layout || "button";
      const body = interpolate(node.bodyText || "", s.variables);
      const footer = interpolate(node.footerText || "", s.variables);
      const header = node.header
        ? node.header.type === "image" && node.header.mediaUrl
          ? { type: "image", image: { link: node.header.mediaUrl } }
          : undefined
        : undefined;

      // LIST
      if (layout === "list" && node.list) {
        await sendInteractiveList(
          waTo,
          body,
          footer || undefined,
          node.list,
          cfg,
        );
        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      // CTA URL
      if (layout === "cta_url") {
        const ctaUrl = String(node?.cta?.url || "").trim();
        const ctaLabel = String(node?.cta?.label || "Open Link").trim();

        if (ctaUrl) {
          await sendInteractiveCTAUrl(
            waTo,
            body,
            footer,
            ctaUrl,
            ctaLabel,
            header,
            cfg,
          );
        } else {
          // graceful fallback to a "Continue" reply button
          await sendInteractiveButton(
            waTo,
            body,
            footer || undefined,
            [{ id: "fallback_continue", type: "reply", title: "Continue" }],
            header,
            cfg,
          );
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
      // BUTTONS
      if (
        layout === "button" &&
        Array.isArray(node.buttons) &&
        node.buttons.length > 0
      ) {
        await sendInteractiveButton(
          waTo,
          body,
          footer || undefined,
          node.buttons,
          header,
          cfg,
        );
        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      // If only header image without actions, just send the image + caption
      if ((!node.buttons || node.buttons.length === 0) && header?.image?.link) {
        await sendImage(waTo, header.image.link, body || footer || "", cfg);
        setSession(userId, { currentNodeId: node.next || null });
        return;
      }

      // Fallback to plain text
      await sendText(waTo, body, cfg);
      setSession(userId, { currentNodeId: node.next || null });
      return;
    }

    if (node.type === "interactive_button_message") {
      const buttons = node.buttons.map((b) => ({
        type: "reply",
        reply: { id: b.id, title: b.title },
      }));

      await waSend(cfg, {
        to: waTo,
        type: "interactive",
        interactive: {
          type: "button",
          header: node.headerText
            ? { type: "text", text: node.headerText }
            : undefined,
          body: { text: node.bodyText },
          footer: node.footerText ? { text: node.footerText } : undefined,
          action: { buttons },
        },
      });
      setSession(userId, {
        waitingFor: "interactive",
        interactiveCtx: { routes: node.routes || {} },
      });

      return;
    }

    if (node.type === "interactive_list_message") {
      const header = node.headerText
        ? { type: "text", text: node.headerText }
        : undefined;

      // Build all sections with rows
      const sections = (node.list?.sections || []).map((section: any) => ({
        title: section.title || "",
        rows: (section.rows || []).map((row: any) => ({
          id: row.id,
          title: row.title,
          ...(row.description ? { description: row.description } : {}),
        })),
      }));

      // Validate WhatsApp API limits
      if (!sections.length || !sections[0].rows.length) {
        console.warn("⚠️ No sections or rows in list node", node.id);
        return;
      }

      // ✅ Send WhatsApp-compliant payload
      await waSend(cfg, {
        to: waTo,
        type: "interactive",
        interactive: {
          type: "list",
          ...(header ? { header } : {}),
          body: { text: node.bodyText || "Choose an option:" },
          ...(node.footerText ? { footer: { text: node.footerText } } : {}),
          action: {
            button: node.list?.buttonText || "Choose",
            sections,
          },
        },
      });

      // ✅ Wait for user interaction
      setSession(userId, {
        waitingFor: "interactive",
        interactiveCtx: { routes: node.routes || {} },
      });

      return;
    }

    // Unknown node type: finish session gracefully
    await ChatbotSessionModel.findOneAndUpdate(
      { userId, chatbotId: FLOW._id },
      { completed: true, endTime: new Date(), lastNodeId: node.id },
      { sort: { startTime: -1 } },
    );
    setSession(userId, {
      currentNodeId: null,
      waitingFor: null,
      interactiveCtx: undefined,
    });
    break;
  }
}

/* ----------------------------------------------------------------------------
 * MAIN WEBHOOK
 * ------------------------------------------------------------------------- */
export const waWebhookHandler = async (c: Context) => {
  const body = await c.req.json();

  // health-check ping
  if ((body as any).action === "ping")
    return c.json({ version: "3.0", data: { status: "active" } }, 200);

  if (!body?.object) return c.json({ message: "ignored", err: false }, 200);

  const { messages, contacts, statuses, whatsAppBusinessConfigData } =
    await whatsAppEventData(body as any);

  const from = messages?.from || contacts?.[0]?.wa_id || contacts?.[0]?.waId;
  let textBody: string | undefined;
  let interactiveTitleOrId: string | undefined;

  // --- Parse message types
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

  const businessId = whatsAppBusinessConfigData?.businessId;
  if (!businessId)
    return respond(c, "Missing businessId in config", true, 400, {});

  // Load all active chatbots for the business
  const chatbotList = await getAllChatbotFlows(businessId);
  if (!chatbotList.length)
    return respond(c, "No active chatbots found", true, 404, {});

  // ---------------------------------------------------------------
  // 1️⃣ Handle interactive button/list replies (continue existing flow)
  // ---------------------------------------------------------------
  const session = getSession(from);
  if (interactiveTitleOrId && session.waitingFor === "interactive") {
    const currentRoutes = session.interactiveCtx?.routes || {};
    const targetNodeId =
      currentRoutes[interactiveTitleOrId] ||
      Object.entries(currentRoutes).find(
        ([key]) => key.toLowerCase() === interactiveTitleOrId.toLowerCase(),
      )?.[1];

    if (targetNodeId) {
      console.log("✅ Interactive reply matched route →", targetNodeId);
      setSession(from, {
        currentNodeId: targetNodeId,
        waitingFor: null,
        interactiveCtx: undefined,
      });

      // ✅ Find last chatbot this user interacted with
      const lastSession = await ChatbotSessionModel.findOne({ userId: from })
        .sort({ startTime: -1 })
        .select("chatbotId")
        .lean();

      const activeBot =
        chatbotList.find(
          (b) => b.flow._id.toString() === lastSession?.chatbotId?.toString(),
        ) || chatbotList[0];

      await advance(
        activeBot.flow,
        activeBot.NODE_BY_ID,
        from,
        from,
        whatsAppBusinessConfigData,
      );
      return respond(c, "flow continued (interactive reply)", false, 200, {});
    }
  }

  // ---------------------------------------------------------------
  // 🟢 1.5 Handle text replies to "Ask Question" nodes
  // ---------------------------------------------------------------
  const sessionState = getSession(from);

  if (
    textBody &&
    sessionState.waitingFor === "ask" &&
    sessionState.currentNodeId
  ) {
    const lastSession = await ChatbotSessionModel.findOne({ userId: from })
      .sort({ startTime: -1 })
      .select("chatbotId")
      .lean();

    const activeBot =
      chatbotList.find(
        (b) => b.flow._id.toString() === lastSession?.chatbotId?.toString(),
      ) || chatbotList[0];

    const { flow: FLOW, NODE_BY_ID } = activeBot;
    const node = NODE_BY_ID.get(sessionState.currentNodeId);

    if (node && node.type === "ask_question") {
      const value = textBody.trim();

      // ✅ Store answer in session
      setSession(from, {
        variables: { ...sessionState.variables, [node?.variable]: value },
      });

      // ✅ Move forward to next node
      setSession(from, {
        waitingFor: null,
        currentNodeId: node.next || null,
      });

      console.log(
        `✅ [Ask Reply] ${node.variable} = "${value}" → next: ${node.next}`,
      );

      await advance(FLOW, NODE_BY_ID, from, from, whatsAppBusinessConfigData);
      return respond(c, "flow continued (ask reply)", false, 200, {});
    }
  }

  // ---------------------------------------------------------------
  // 2️⃣ Handle trigger-based start (first message or keyword)
  // ---------------------------------------------------------------
  const messageInput = textBody || interactiveTitleOrId;
  let matchedBot: { flow: any; NODE_BY_ID: Map<string, any> } | null = null;

  if (messageInput) {
    for (const bot of chatbotList) {
      const { flow } = bot;
      if (matchTriggerStart(flow, from, messageInput)) {
        matchedBot = bot;
        console.log("✅ Trigger matched chatbot:", flow.chatbotName);
        break;
      }
    }
  }

  if (matchedBot) {
    const { flow: FLOW, NODE_BY_ID } = matchedBot;

    await ChatbotSessionModel.create({
      chatbotId: FLOW._id,
      userId: from,
      startTime: new Date(),
      completed: false,
    });

    await advance(FLOW, NODE_BY_ID, from, from, whatsAppBusinessConfigData);
    return respond(c, "flow started (trigger)", false, 200, {});
  }

  // ---------------------------------------------------------------
  // 3️⃣ Fallback — other messages or campaign status
  // ---------------------------------------------------------------
  if (messages && whatsAppBusinessConfigData) {
    // A safe fallback text: text body OR interactive id/title OR empty string
    const safeText = (
      messages?.text?.body ??
      (messages?.interactive?.button_reply?.id ||
        messages?.interactive?.button_reply?.title ||
        messages?.interactive?.list_reply?.id ||
        messages?.interactive?.list_reply?.title) ??
      ""
    ).toString();

    // Your helper may return undefined userInput for interactive events; guard it.
    const { userData, userInput } = await whatsAppUserAndTextMessage(
      contacts,
      messages,
      whatsAppBusinessConfigData,
    );

    // Pick the best available text to use in downstream handlers
    const effectiveInput = (
      typeof userInput === "string" && userInput.trim().length > 0
        ? userInput
        : safeText
    ).trim();

    // QR handlers only run if we actually have some input
    if (effectiveInput) {
      const qrType = identifyQrTypeFromMessage(effectiveInput);
      if (qrType?.qrType && qrHandlers[qrType.qrType]) {
        await qrHandlers[qrType.qrType](
          qrType.value,
          userData.phone,
          userData._id.toString(),
          userData.name || "Guest",
          whatsAppBusinessConfigData,
        );
      }
    }

    // Chat handler: only if feature is on AND we have a non-empty message
    if (whatsAppBusinessConfigData.chat && effectiveInput) {
      await whatsAppChatHandler(
        effectiveInput,
        userData._id.toString(),
        whatsAppBusinessConfigData,
      );
    }

    // Block handler: pass a string always; handler will guard internally too
    await whatsAppBlockUserHandler(
      whatsAppBusinessConfigData,
      userData?.phone,
      userData._id.toString(),
      messages?.id,
      effectiveInput, // string (possibly empty)
    );
  }

  // ✅ Keep this part as it is
  if (statuses && statuses.length > 0 && whatsAppBusinessConfigData) {
    await whatsAppCampaignHandler(whatsAppBusinessConfigData, statuses);
  }

  return respond(c, "event received", false, 200, {});
};
