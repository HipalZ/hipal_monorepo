import {
  ChatbotNodeLogModel,
  ChatbotSessionModel,
  WhatsappChatbotModel,
} from "@hi/db-models";
import type { Context } from "hono";
import { respond } from "../../../utils/response";
import { qrHandlers } from "../../../utils/whatsappWebhookHandlers/allQrHandler";
import { whatsAppCampaignHandler } from "../../../utils/whatsappWebhookHandlers/campaign";
import { whatsAppChatHandler } from "../../../utils/whatsappWebhookHandlers/chatHandler";
import {
  identifyQrTypeFromMessage,
  whatsAppEventData,
  whatsAppUserAndTextMessage,
} from "../../../utils/whatsappWebhookHandlers/helper";
import { whatsAppBlockUserHandler } from "../../../utils/whatsappWebhookHandlers/whatsappBlockUser";
import path = require("path");
import { google } from "googleapis";

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
  startTime: string | number | Date;
  _id?: string; // ✅ add this
  userId: string;
  currentNodeId: string | null;
  waitingFor: null | "ask" | "interactive";
  variables: Record<string, any>;
  interactiveCtx?: { routes: Record<string, string | null> };
  userName?: string;
};
const sessions = new Map<string, SessionState>();

function getSession(userId: string): SessionState {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      _id: undefined,
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
function interpolate(
  str: string | undefined,
  vars: Record<string, any>,
  cfg?: any,
  userName?: string,
): string {
  if (!str) return "";
  console.log("str to interpolate:", str);
  const context = {
    ...(vars || {}),
    name: userName || "",
    phone: cfg?.waProfile?.phone || cfg?.phone || "",
  };
  console.log("interpolate context", context);

  let result = str;

  // {{var}} – no change needed
  result = result.replace(/\{\{(\w+)(?:\s*\|\|\s*([^}]+))?\}\}/g, (m, k, f) => {
    return context[k] ?? f?.trim() ?? "";
  });

  // @variable – FIX: +? → + (greedy) + escape ] in lookahead
  result = result.replace(
    /@([\w\s\-_]+)(?=\s|$|[.,!?;:)}\\""]|$)/g,
    (match, keyPart) => {
      const key = keyPart.trim();
      console.log("key", key);
      const varKey = key.startsWith("@") ? key : `@${key}`;
      console.log("varKey", varKey);
      console.log("context[varKey]", context[varKey], varKey);
      const val = context[varKey];
      console.log("val", val);
      if (val !== undefined && val !== null && val !== "") {
        return String(val);
      }
      return match;
    },
  );
  console.log("interpolate", result);
  return result;
}

function evalRow(row, vars) {
  let key = String(row.var || "").trim();
  console.log("key", key);
  let left = vars[key];
  console.log("left", left);
  if (left === undefined) {
    const altKey = key.startsWith("@") ? key.slice(1) : `@${key}`;
    console.log("left after altKey check", altKey);
    left = vars[altKey];
  }

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

async function sendVideo(
  to: string,
  link: string,
  caption: string | undefined,
  cfg: any,
) {
  await waSend(cfg, {
    to,
    type: "video",
    video: { link, ...(caption ? { caption } : {}) },
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
    type: "reply";
    title: string;
    url?: string;
  }>,
  header: any | undefined,
  cfg: any,
) {
  const actionButtons = buttons.map((b) => {
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

async function exitNodeLog(nodeLog, nextNodeId, nodeStartTime) {
  if (!nodeLog) return;

  try {
    await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
      exitedAt: new Date(),
      durationMs: Date.now() - nodeStartTime,
      nextNodeId: nextNodeId,
    });
  } catch (e) {
    console.error("NodeLog update failed:", e);
  }
}

/* ----------------------------------------------------------------------------
 * ADVANCE FLOW
 * ------------------------------------------------------------------------- */
export async function advance(
  FLOW: any,
  NODE_BY_ID: Map<string, any>,
  userId: string,
  waTo: string,
  cfg: any,
  userName?: string,
) {
  let s = getSession(userId);
  let hops = 0;

  while (s.currentNodeId) {
    if (++hops > 25) {
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

    let nodeLog = null;
    const nodeStartTime = Date.now();
    setSession(userId, { nodeStartTime: Date.now() });

    try {
      if (s._id) {
        nodeLog = await ChatbotNodeLogModel.create({
          sessionId: s._id,
          chatbotId: FLOW._id,
          nodeId: node.id,
          nodeType: node.type,
          enteredAt: new Date(),
        });
        console.log("created nodeLog:", nodeLog);
      }
    } catch (err) {
      console.error("NodeLog create failed:", err);
    }

    await ChatbotSessionModel.findOneAndUpdate(
      { userId, chatbotId: FLOW._id },
      { $inc: { totalMessages: 1 }, $set: { lastNodeId: node.id } },
      { sort: { startTime: -1 } },
    );

    /* ===============================
     * 🟢 SEND MESSAGE NODES
     * =============================== */
    if (node.type === "send_message") {
      if (node.contentType === "text") {
        await sendText(
          waTo,
          interpolate(node.text, s.variables, cfg, userName),
          cfg,
        );
      } else if (node.contentType === "image") {
        await sendImage(
          waTo,
          String(node.mediaUrl || ""),
          interpolate(
            node.caption || node.bodyText || "",
            s.variables,
            cfg,
            userName,
          ),
          cfg,
        );
      } else if (node.contentType === "video") {
        await sendVideo(
          waTo,
          String(node.mediaUrl || ""),
          interpolate(
            node.caption || node.bodyText || "",
            s.variables,
            cfg,
            userName,
          ),
          cfg,
        );
      } else if (node.contentType === "document") {
        await sendDocument(
          waTo,
          String(interpolate(node.mediaUrl || "", s.variables, cfg, userName)),
          node.fileName || undefined,
          cfg,
        );
      }

      // ✅ Log node exit
      await exitNodeLog(nodeLog, node.next, nodeStartTime);

      // ✅ End of flow
      if (isEndNode(node)) {
        await ChatbotSessionModel.findOneAndUpdate(
          { _id: s._id },
          {
            completed: true,
            endTime: new Date(),
            sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
            lastNodeId: node.id,
          },
        );

        await exitNodeLog(nodeLog, null, nodeStartTime);

        setSession(userId, { currentNodeId: null });
        break;
      }

      // Continue to next node
      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    /* ===============================
     * 🟡 ASK QUESTION NODES
     * =============================== */
    if (node.type === "ask_question") {
      await sendText(
        waTo,
        interpolate(node.prompt, s.variables, cfg, userName),
        cfg,
      );

      await exitNodeLog(nodeLog, node.next, nodeStartTime);
      // ✅ End of flow
      if (isEndNode(node)) {
        await ChatbotSessionModel.findOneAndUpdate(
          { _id: s._id },
          {
            completed: true,
            endTime: new Date(),
            sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
            lastNodeId: node.id,
          },
        );

        await exitNodeLog(nodeLog, null, nodeStartTime);

        setSession(userId, { currentNodeId: null });
        break;
      }

      setSession(userId, { waitingFor: "ask" });
      return;
    }

    /* ===============================
     * 🔵 CONDITION NODES
     * =============================== */
    if (node.type === "set_condition") {
      const ok = evalCondition(node, s.variables);

      await exitNodeLog(
        nodeLog,
        ok ? node.trueNext : node.falseNext,
        nodeStartTime,
      );

      // ✅ End of flow
      if (isEndNode(node)) {
        await ChatbotSessionModel.findOneAndUpdate(
          { _id: s._id },
          {
            completed: true,
            endTime: new Date(),
            sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
            lastNodeId: node.id,
          },
        );

        await exitNodeLog(nodeLog, null, nodeStartTime);

        setSession(userId, { currentNodeId: null });
        break;
      }
      setSession(userId, {
        currentNodeId: (ok ? node.trueNext : node.falseNext) || null,
      });
      s = getSession(userId);
      continue;
    }

    /* ===============================
     * 🟣 INTERACTIVE MESSAGES
     * =============================== */
    // Small helper so we don't repeat this block everywhere
    const completeSessionAndExit = async () => {
      await ChatbotSessionModel.findOneAndUpdate(
        { _id: s._id },
        {
          completed: true,
          endTime: new Date(),
          sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
          lastNodeId: node.id,
        },
      );
      await exitNodeLog(nodeLog, null, nodeStartTime);
      setSession(userId, { currentNodeId: null });
    };
    if (
      node.type === "interactive" ||
      node.type === "interactive_list_message" ||
      node.type === "interactive_button_message"
    ) {
      const layout = node.layout || "button";
      const body = interpolate(node.bodyText || "", s.variables, cfg, userName);
      const footer = interpolate(
        node.footerText || "",
        s.variables,
        cfg,
        userName,
      );
      const header =
        node.header?.type === "image" && node.header.mediaUrl
          ? { type: "image", image: { link: node.header.mediaUrl } }
          : undefined;

      /* ───────────────────── LIST LAYOUT ───────────────────── */
      if (layout === "list" && node.list) {
        await sendInteractiveList(
          waTo,
          body,
          footer || undefined,
          node.list,
          cfg,
        );
        console.log("sent list interactive");

        // ❌ no isEndNode here

        await exitNodeLog(nodeLog, null, nodeStartTime);

        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      /* ───────────────────── CTA URL LAYOUT ───────────────────── */
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
          await sendInteractiveButton(
            waTo,
            body,
            footer || undefined,
            [{ id: "fallback_continue", type: "reply", title: "Continue" }],
            header,
            cfg,
          );
        }

        // ❌ no isEndNode here

        await exitNodeLog(nodeLog, null, nodeStartTime);

        setSession(userId, {
          currentNodeId: node.next || null,
          waitingFor: "interactive",
          interactiveCtx: {
            routes: node.routes || { fallback_continue: node.next },
          },
        });
        return;
      }

      /* ───────────────────── BUTTON LAYOUT ───────────────────── */
      if (layout === "button" && node.buttons?.length > 0) {
        await sendInteractiveButton(
          waTo,
          body,
          footer || undefined,
          node.buttons,
          header,
          cfg,
        );

        // ❌ no isEndNode here

        await exitNodeLog(nodeLog, null, nodeStartTime);

        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      /* ───────────────────── FALLBACK: SIMPLE TEXT ───────────────────── */
      await sendText(waTo, body, cfg);

      // ❌ no isEndNode here

      await exitNodeLog(nodeLog, null, nodeStartTime);
      setSession(userId, { currentNodeId: node.next || null });
      console.log("Interactive fallback to text, continuing to next");
      continue;
    }

    /* ===============================
     * 🧾 GOOGLE SHEET NODE
     * =============================== */
    if (node.type === "google_sheet") {
      try {
        const sheet = node.sheet || {};
        const { spreadsheetId, sheetName, cells } = sheet;
        if (!spreadsheetId || !sheetName || !Array.isArray(cells)) {
          setSession(userId, { currentNodeId: node.next || null });
          s = getSession(userId);
          continue;
        }

        const auth = new google.auth.GoogleAuth({
          keyFile: path.join(__dirname, "../../../utils/testing.json"),
          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: "v4", auth: client });

        const resolvedRow = cells.map((c: any) =>
          interpolate(c.value, s.variables, cfg, s.userName),
        );
        await googleSheets.spreadsheets.values.append({
          spreadsheetId,
          range: sheetName,
          valueInputOption: "USER_ENTERED",
          resource: { values: [resolvedRow] },
        });

        await exitNodeLog(nodeLog, node.next, nodeStartTime);

        setSession(userId, { currentNodeId: node.next || null });
        s = getSession(userId);
        continue;
      } catch (err: any) {
        setSession(userId, { currentNodeId: node.next || null });
        s = getSession(userId);
        continue;
      }
    }

    await exitNodeLog(nodeLog, null, nodeStartTime);

    await ChatbotSessionModel.findOneAndUpdate(
      { _id: s._id },
      {
        completed: false,
        droppedAtNode: node.id,
        endTime: new Date(),
        sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
      },
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
  let session = getSession(from);
  const contactName = contacts?.profile?.name || session.userName || "Guest";
  setSession(from, { userName: contactName });
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
  session = getSession(from);

  if (interactiveTitleOrId && session.waitingFor === "interactive") {
    console.log("Handle interactive button/list replies", interactiveTitleOrId);
    const currentRoutes = session.interactiveCtx?.routes || {};

    let targetNodeId: string | null = null;

    // Find matching route
    for (const [routeKey, routeVal] of Object.entries(currentRoutes)) {
      if (
        routeKey === interactiveTitleOrId ||
        routeKey.toLowerCase() === interactiveTitleOrId?.toLowerCase()
      ) {
        // 🔥 Fix: treat "" or undefined as null (fallback to next node)
        targetNodeId = routeVal && routeVal.trim() !== "" ? routeVal : null;
        console.log(
          "Matched routeKey:",
          routeKey,
          "with targetNodeId:",
          targetNodeId,
        );
        break;
      }
    }

    // Fetch last session & active bot
    const lastSession = await ChatbotSessionModel.findOne({ userId: from })
      .sort({ startTime: -1 })
      .select("_id chatbotId")
      .lean();

    let activeBot =
      chatbotList.find(
        (b) => b.flow._id.toString() === lastSession?.chatbotId?.toString(),
      ) || chatbotList[0];

    const { flow: FLOW, NODE_BY_ID } = activeBot;

    // 🔍 Which node is user currently on?
    const currentNode = NODE_BY_ID.get(session.currentNodeId);
    console.log("currentNode for interactive reply:", currentNode);
    // CASE 1: Route FOUND → Jump to that node
    if (targetNodeId) {
      setSession(from, {
        currentNodeId: targetNodeId,
        waitingFor: null,
        interactiveCtx: undefined,
      });

      if (lastSession?._id) setSession(from, { _id: lastSession._id });

      await advance(
        FLOW,
        NODE_BY_ID,
        from,
        from,
        whatsAppBusinessConfigData,
        contactName,
      );

      return respond(c, "flow continued (interactive reply)", false, 200, {});
    }

    // CASE 2: Route NOT FOUND → Use the node.next as fallback
    if (!targetNodeId && currentNode?.next) {
      setSession(from, {
        currentNodeId: currentNode.next,
        waitingFor: null,
        interactiveCtx: undefined,
      });

      if (lastSession?._id) setSession(from, { _id: lastSession._id });

      await advance(
        FLOW,
        NODE_BY_ID,
        from,
        from,
        whatsAppBusinessConfigData,
        contactName,
      );

      return respond(
        c,
        "flow continued (interactive reply - fallback next)",
        false,
        200,
        {},
      );
    }

    // CASE 3: No route & no next → end flow
    if (lastSession?._id) {
      // load full session to compute duration
      const fullSession = await ChatbotSessionModel.findById(lastSession._id);

      if (fullSession) {
        const now = Date.now();
        fullSession.completed = true; // or `false` + `droppedAtNode` if you want to treat as drop-off
        fullSession.endTime = new Date(now);
        if (fullSession.startTime) {
          fullSession.sessionDurationMs =
            now - new Date(fullSession.startTime).getTime();
        }
        // lastNodeId: the node user was on when they clicked (the interactive node)
        if (session.currentNodeId) {
          fullSession.lastNodeId = session.currentNodeId;
        }
        await fullSession.save();
      }
    }

    setSession(from, {
      currentNodeId: null,
      waitingFor: null,
      interactiveCtx: undefined,
    });

    return respond(c, "flow ended (no route)", false, 200, {});
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
      const varKey = node.variable?.startsWith("@")
        ? node.variable
        : `@${node.variable}`;
      setSession(from, {
        variables: {
          ...sessionState.variables,
          [varKey]: value,
        },
      });

      setSession(from, {
        waitingFor: null,
        currentNodeId: node.next || null,
      });

      await advance(
        FLOW,
        NODE_BY_ID,
        from,
        from,
        whatsAppBusinessConfigData,
        contactName,
      );
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
        break;
      }
    }
  }

  // 2️⃣ If nothing matched, pick a fallback/default bot
  if (!matchedBot) {
    // Prefer a bot with flow.isDefault === true
    const fallbackBot =
      chatbotList.find((b) => b.flow?.isDefault) || chatbotList[0];

    if (fallbackBot) {
      console.log(
        "No keyword matched. Using fallback chatbot:",
        fallbackBot.flow?.chatbotName || fallbackBot.flow?._id,
      );
      matchedBot = fallbackBot;

      // Also set the session's currentNodeId based on a "fallback" trigger if you want
      const FLOW = fallbackBot.flow;

      // If you want per-flow fallback trigger, you can add something like t.isFallback
      const fallbackTrigger =
        (FLOW.triggers || []).find((t: any) => t.isFallback) ||
        FLOW.triggers?.[0];

      if (fallbackTrigger?.start) {
        setSession(from, {
          currentNodeId: fallbackTrigger.start,
          waitingFor: null,
          interactiveCtx: undefined,
        });
      }
    }
  }

  if (matchedBot) {
    const { flow: FLOW, NODE_BY_ID } = matchedBot;

    const newSession = await ChatbotSessionModel.create({
      chatbotId: FLOW._id,
      userId: from,
      startTime: new Date(),
      completed: false,
    });

    setSession(from, {
      _id: newSession._id,
      currentNodeId: FLOW.triggers?.[0]?.start || null,
      waitingFor: null,
      variables: {},
    });

    await advance(
      FLOW,
      NODE_BY_ID,
      from,
      from,
      whatsAppBusinessConfigData,
      contactName,
    );
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
    console.log("effectiveInput:", effectiveInput);
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
      console.log("triggered inside waWebhookHandler - chat handler");
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
