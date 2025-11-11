import { ChatbotNodeLogModel, ChatbotSessionModel, WhatsappChatbotModel } from '@hi/db-models';
import type { Context } from 'hono';
import { respond } from '../../../utils/response';
import { qrHandlers } from '../../../utils/whatsappWebhookHandlers/allQrHandler';
import { whatsAppCampaignHandler } from '../../../utils/whatsappWebhookHandlers/campaign';
import { whatsAppChatHandler } from '../../../utils/whatsappWebhookHandlers/chatHandler';
import { identifyQrTypeFromMessage, whatsAppEventData, whatsAppUserAndTextMessage } from '../../../utils/whatsappWebhookHandlers/helper';
import { whatsAppBlockUserHandler } from '../../../utils/whatsappWebhookHandlers/whatsappBlockUser';
import path = require('path');
const credentials = require('../../../utils/credentials_oauth.json').web;
const { google } = require('googleapis');

/* ----------------------------------------------------------------------------
 * FLOW CACHE (per business)
 * ------------------------------------------------------------------------- */
async function getAllChatbotFlows(businessId: string) {
  const flows = await WhatsappChatbotModel.find({
    businessId,
    active: true,
    status: 'active',
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
  waitingFor: null | 'ask' | 'interactive';
  variables: Record<string, any>;
  interactiveCtx?: { routes: Record<string, string | null> };
  userName?: string;
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
function interpolate(str: string | undefined, vars: Record<string, any>, cfg?: any, userName?: string) {
  if (!str) return '';

  // Step 1: build merged context (user vars + system vars)
  console.log('userName in interpolate:', userName);
  const context = {
    ...(vars || {}),
    name: userName || '',
    phone: cfg?.waProfile?.phone || cfg?.phone || '',
  };

  // Step 2: replace all patterns
  return (
    str
      // {{name}} , {{phone}} , {{custom||fallback}}
      .replace(/\{\{(\w+)(?:\|\|([^}]+))?\}\}/g, (_, key, fb) => {
        const val = context[key];
        return val !== undefined && val !== null && val !== '' ? String(val) : (fb ?? '');
      })
      // @variable (user responses)
      .replace(/@(\w+)/g, (_, key) => {
        const atKey = `@${key}`;
        return context[atKey] !== undefined && context[atKey] !== null ? String(context[atKey]) : '';
      })
  );
}

function evalRow(row: { var: string; op: string; value?: string }, vars: Record<string, any>) {
  const left = vars[row.var];
  const right = row.value;
  switch (row.op) {
    case 'exists':
      return !!(left && String(left).trim() !== '');
    case 'eq':
      return String(left ?? '').trim() === String(right ?? '').trim();
    case 'ne':
      return String(left ?? '').trim() !== String(right ?? '').trim();
    case 'gt':
      return Number(left) > Number(right);
    case 'lt':
      return Number(left) < Number(right);
    case 'contains':
      return String(left ?? '').includes(String(right ?? ''));
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
  return !node?.next && !node?.trueNext && !node?.falseNext && !(node?.routes && Object.keys(node.routes).length > 0);
}
function matchTriggerStart(FLOW: any, userId: string, text?: string) {
  const msg = (text || '').trim().toLowerCase();
  const trig = (FLOW.triggers || []).find((t: any) => (t.keywords || []).some((k: string) => String(k).toLowerCase() === msg));
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
  const phoneNumberId = String(cfg?.phoneId || '').trim();
  const token = String(cfg?.token || '').replace(/\s+/g, '');
  if (!phoneNumberId) throw new Error('Missing phoneId in cfg');
  if (!token) throw new Error('Missing token in cfg');

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error('[WA send error]', res.status, text);
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
    type: 'text',
    text: { body: text, preview_url: false },
  });
}

async function sendImage(to: string, link: string, caption: string | undefined, cfg: any) {
  await waSend(cfg, {
    to,
    type: 'image',
    image: { link, ...(caption ? { caption } : {}) },
  });
}

async function sendDocument(to: string, link: string, filename: string | undefined, cfg: any) {
  await waSend(cfg, {
    to,
    type: 'document',
    document: { link, ...(filename ? { filename } : {}) },
  });
}

async function sendInteractiveButton(
  to: string,
  bodyText: string,
  footerText: string | undefined,
  buttons: Array<{
    id: string;
    type: 'reply' | 'url';
    title: string;
    url?: string;
  }>,
  header: any | undefined,
  cfg: any,
) {
  const actionButtons = buttons.map((b) => {
    console.log('Button:', b.type, b);
    if (b.type === 'url' && b.url) {
      return {
        type: 'url',
        url: b.url, // ✅ Real clickable link
        title: b.title,
      };
    }
    return {
      type: 'reply',
      reply: {
        id: b.id,
        title: b.title,
      },
    };
  });

  const interactive: any = {
    type: 'button',
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: { buttons: actionButtons },
  };

  if (header?.type === 'image' && header?.image?.link) {
    interactive.header = { type: 'image', image: { link: header.image.link } };
  }

  await waSend(cfg, { to, type: 'interactive', interactive });
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
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      ...(footerText ? { footer: { text: footerText } } : {}),
      action: {
        button: list.buttonText || 'Choose',
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
    type: 'cta_url',
    body: { text: bodyText },
    ...(footerText ? { footer: { text: footerText } } : {}),
    action: {
      name: 'cta_url',
      parameters: { display_text: ctaLabel, url: ctaUrl },
    },
  };

  if (header?.type === 'image' && header?.image?.link) {
    interactive.header = { type: 'image', image: { link: header.image.link } };
  }
  await waSend(cfg, { to, type: 'interactive', interactive });
}

/* ----------------------------------------------------------------------------
 * ADVANCE FLOW
 * ------------------------------------------------------------------------- */
export async function advance(FLOW: any, NODE_BY_ID: Map<string, any>, userId: string, waTo: string, cfg: any, userName?: string) {
  let s = getSession(userId);
  let hops = 0;

  while (s.currentNodeId) {
    if (++hops > 25) {
      console.warn('[flow] hop limit exceeded');
      break;
    }

    const node = NODE_BY_ID.get(s.currentNodeId);
    if (!node) {
      console.warn('⚠️ Missing node for ID:', s.currentNodeId);
      setSession(userId, { currentNodeId: null, waitingFor: null, interactiveCtx: undefined });
      break;
    }

    // 🧩 Log node entry
    const nodeStartTime = Date.now();
    const nodeLog = await ChatbotNodeLogModel.create({
      sessionId: s._id,
      chatbotId: FLOW._id,
      nodeId: node.id,
      nodeType: node.type,
      enteredAt: new Date(),
    });

    // 🧭 Update session progression
    await ChatbotSessionModel.findOneAndUpdate(
      { userId, chatbotId: FLOW._id },
      { $inc: { totalMessages: 1 }, $set: { lastNodeId: node.id } },
      { sort: { startTime: -1 } },
    );

    /* ===============================
     * 🟢 SEND MESSAGE NODES
     * =============================== */
    if (node.type === 'send_message') {
      if (node.contentType === 'text') {
        await sendText(waTo, interpolate(node.text, s.variables, cfg, userName), cfg);
      } else if (node.contentType === 'image') {
        await sendImage(waTo, String(node.mediaUrl || ''), interpolate(node.caption || node.bodyText || '', s.variables, cfg, userName), cfg);
      } else if (node.contentType === 'document') {
        await sendDocument(waTo, String(interpolate(node.mediaUrl || '', s.variables, cfg, userName)), node.fileName || undefined, cfg);
      }

      // ✅ Log node exit
      await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
        exitedAt: new Date(),
        durationMs: Date.now() - nodeStartTime,
      });

      // ✅ End of flow
      if (isEndNode(node)) {
        await ChatbotSessionModel.findOneAndUpdate(
          { userId, chatbotId: FLOW._id },
          {
            completed: true,
            endTime: new Date(),
            sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
            lastNodeId: node.id,
          },
          { sort: { startTime: -1 } },
        );
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
    if (node.type === 'ask_question') {
      await sendText(waTo, interpolate(node.prompt, s.variables, cfg, userName), cfg);

      await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
        exitedAt: new Date(),
        durationMs: Date.now() - nodeStartTime,
      });

      setSession(userId, { waitingFor: 'ask' });
      return;
    }

    /* ===============================
     * 🔵 CONDITION NODES
     * =============================== */
    if (node.type === 'set_condition') {
      const ok = evalCondition(node, s.variables);

      await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
        exitedAt: new Date(),
        durationMs: Date.now() - nodeStartTime,
        nextNodeId: ok ? node.trueNext : node.falseNext,
      });

      setSession(userId, { currentNodeId: (ok ? node.trueNext : node.falseNext) || null });
      s = getSession(userId);
      continue;
    }

    /* ===============================
     * 🟣 INTERACTIVE MESSAGES
     * =============================== */
    if (node.type === 'interactive_message') {
      const layout = node.layout || 'button';
      const body = interpolate(node.bodyText || '', s.variables, cfg, userName);
      const footer = interpolate(node.footerText || '', s.variables, cfg, userName);
      const header = node.header?.type === 'image' && node.header.mediaUrl ? { type: 'image', image: { link: node.header.mediaUrl } } : undefined;

      if (layout === 'list' && node.list) {
        await sendInteractiveList(waTo, body, footer || undefined, node.list, cfg);
        await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, { exitedAt: new Date(), durationMs: Date.now() - nodeStartTime });
        setSession(userId, { waitingFor: 'interactive', interactiveCtx: { routes: node.routes || {} } });
        return;
      }

      if (layout === 'cta_url') {
        const ctaUrl = String(node?.cta?.url || '').trim();
        const ctaLabel = String(node?.cta?.label || 'Open Link').trim();
        if (ctaUrl) {
          await sendInteractiveCTAUrl(waTo, body, footer, ctaUrl, ctaLabel, header, cfg);
        } else {
          await sendInteractiveButton(waTo, body, footer || undefined, [{ id: 'fallback_continue', type: 'reply', title: 'Continue' }], header, cfg);
        }
        await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, { exitedAt: new Date(), durationMs: Date.now() - nodeStartTime });
        setSession(userId, {
          currentNodeId: node.next || null,
          waitingFor: 'interactive',
          interactiveCtx: { routes: node.routes || { fallback_continue: node.next } },
        });
        return;
      }

      if (layout === 'button' && node.buttons?.length > 0) {
        await sendInteractiveButton(waTo, body, footer || undefined, node.buttons, header, cfg);
        await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, { exitedAt: new Date(), durationMs: Date.now() - nodeStartTime });
        setSession(userId, { waitingFor: 'interactive', interactiveCtx: { routes: node.routes || {} } });
        return;
      }

      await sendText(waTo, body, cfg);
      await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, { exitedAt: new Date(), durationMs: Date.now() - nodeStartTime });
      setSession(userId, { currentNodeId: node.next || null });
      continue;
    }

    /* ===============================
     * 🧾 GOOGLE SHEET NODE
     * =============================== */
    if (node.type === 'google_sheet') {
      try {
        const sheet = node.sheet || {};
        const { spreadsheetId, sheetName, cells } = sheet;
        if (!spreadsheetId || !sheetName || !Array.isArray(cells)) {
          console.warn('⚠️ Missing Sheet details');
          setSession(userId, { currentNodeId: node.next || null });
          s = getSession(userId);
          continue;
        }

        const auth = new google.auth.GoogleAuth({
          keyFile: path.join(__dirname, '../../../utils/testing.json'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        const resolvedRow = cells.map((c: any) => interpolate(c.value, s.variables, cfg, s.userName));

        await googleSheets.spreadsheets.values.append({
          spreadsheetId,
          range: sheetName,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [resolvedRow] },
        });

        await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
          exitedAt: new Date(),
          durationMs: Date.now() - nodeStartTime,
          nextNodeId: node.next || null,
        });

        setSession(userId, { currentNodeId: node.next || null });
        s = getSession(userId);
        continue;
      } catch (err: any) {
        console.error('❌ Google Sheet append failed:', err);
        setSession(userId, { currentNodeId: node.next || null });
        s = getSession(userId);
        continue;
      }
    }

    // ✅ Default: end session if no next node
    await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
      exitedAt: new Date(),
      durationMs: Date.now() - nodeStartTime,
      wasEnd: true,
    });

    await ChatbotSessionModel.findOneAndUpdate(
      { userId, chatbotId: FLOW._id },
      {
        completed: false,
        droppedAtNode: node.id,
        endTime: new Date(),
        sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
      },
      { sort: { startTime: -1 } },
    );

    setSession(userId, { currentNodeId: null, waitingFor: null, interactiveCtx: undefined });
    break;
  }
}

/* ----------------------------------------------------------------------------
 * MAIN WEBHOOK
 * ------------------------------------------------------------------------- */
export const waWebhookHandler = async (c: Context) => {
  const body = await c.req.json();

  // health-check ping
  if ((body as any).action === 'ping') return c.json({ version: '3.0', data: { status: 'active' } }, 200);

  if (!body?.object) return c.json({ message: 'ignored', err: false }, 200);
  const { messages, contacts, statuses, whatsAppBusinessConfigData } = await whatsAppEventData(body as any);

  const from = messages?.from || contacts?.[0]?.wa_id || contacts?.[0]?.waId;
  let session = getSession(from);
  const contactName = contacts?.profile?.name || session.userName || 'Guest';
  setSession(from, { userName: contactName });
  let textBody: string | undefined;
  let interactiveTitleOrId: string | undefined;

  // --- Parse message types
  if (messages) {
    if (messages.type === 'interactive') {
      const inter = messages.interactive;
      interactiveTitleOrId = inter?.button_reply?.id || inter?.button_reply?.title || inter?.list_reply?.id || inter?.list_reply?.title;
    } else if (messages?.text?.body) {
      textBody = messages.text.body;
    }
  }

  const businessId = whatsAppBusinessConfigData?.businessId;
  if (!businessId) return respond(c, 'Missing businessId in config', true, 400, {});

  // Load all active chatbots for the business
  const chatbotList = await getAllChatbotFlows(businessId);
  if (!chatbotList.length) return respond(c, 'No active chatbots found', true, 404, {});

  // ---------------------------------------------------------------
  // 1️⃣ Handle interactive button/list replies (continue existing flow)
  // ---------------------------------------------------------------
  session = getSession(from);

  if (interactiveTitleOrId && session.waitingFor === 'interactive') {
    const currentRoutes = session.interactiveCtx?.routes || {};
    let targetNodeId: string | undefined;

    for (const [routeKey, routeVal] of Object.entries(currentRoutes)) {
      // Match either by exact ID or by button title
      if (routeKey === interactiveTitleOrId || routeKey.toLowerCase() === interactiveTitleOrId?.toLowerCase()) {
        targetNodeId = routeVal || undefined;
        break;
      }
    }

    if (targetNodeId) {
      setSession(from, {
        currentNodeId: targetNodeId,
        waitingFor: null,
        interactiveCtx: undefined,
      });

      // ✅ Find last chatbot this user interacted with
      const lastSession = await ChatbotSessionModel.findOne({ userId: from }).sort({ startTime: -1 }).select('chatbotId').lean();

      const activeBot = chatbotList.find((b) => b.flow._id.toString() === lastSession?.chatbotId?.toString()) || chatbotList[0];

      await advance(activeBot.flow, activeBot.NODE_BY_ID, from, from, whatsAppBusinessConfigData, contactName);
      return respond(c, 'flow continued (interactive reply)', false, 200, {});
    }
  }

  // ---------------------------------------------------------------
  // 🟢 1.5 Handle text replies to "Ask Question" nodes
  // ---------------------------------------------------------------
  const sessionState = getSession(from);

  if (textBody && sessionState.waitingFor === 'ask' && sessionState.currentNodeId) {
    const lastSession = await ChatbotSessionModel.findOne({ userId: from }).sort({ startTime: -1 }).select('chatbotId').lean();

    const activeBot = chatbotList.find((b) => b.flow._id.toString() === lastSession?.chatbotId?.toString()) || chatbotList[0];

    const { flow: FLOW, NODE_BY_ID } = activeBot;
    const node = NODE_BY_ID.get(sessionState.currentNodeId);

    if (node && node.type === 'ask_question') {
      const value = textBody.trim();

      const varKey = node.variable?.startsWith('@') ? node.variable : `@${node.variable}`;

      setSession(from, {
        variables: {
          ...sessionState.variables,
          [varKey]: value,
        },
      });

      // ✅ Move forward to next node
      setSession(from, {
        waitingFor: null,
        currentNodeId: node.next || null,
      });

      console.log(`✅ [Ask Reply] ${node.variable} = "${value}" → next: ${node.next}`);

      await advance(FLOW, NODE_BY_ID, from, from, whatsAppBusinessConfigData, contactName);
      return respond(c, 'flow continued (ask reply)', false, 200, {});
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
        console.log('✅ Trigger matched chatbot:', flow.chatbotName);
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

    await advance(FLOW, NODE_BY_ID, from, from, whatsAppBusinessConfigData, contactName);
    return respond(c, 'flow started (trigger)', false, 200, {});
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
      ''
    ).toString();

    // Your helper may return undefined userInput for interactive events; guard it.
    const { userData, userInput } = await whatsAppUserAndTextMessage(contacts, messages, whatsAppBusinessConfigData);

    // Pick the best available text to use in downstream handlers
    const effectiveInput = (typeof userInput === 'string' && userInput.trim().length > 0 ? userInput : safeText).trim();

    // QR handlers only run if we actually have some input
    if (effectiveInput) {
      const qrType = identifyQrTypeFromMessage(effectiveInput);
      if (qrType?.qrType && qrHandlers[qrType.qrType]) {
        await qrHandlers[qrType.qrType](qrType.value, userData.phone, userData._id.toString(), userData.name || 'Guest', whatsAppBusinessConfigData);
      }
    }

    // Chat handler: only if feature is on AND we have a non-empty message
    if (whatsAppBusinessConfigData.chat && effectiveInput) {
      await whatsAppChatHandler(effectiveInput, userData._id.toString(), whatsAppBusinessConfigData);
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

  return respond(c, 'event received', false, 200, {});
};
