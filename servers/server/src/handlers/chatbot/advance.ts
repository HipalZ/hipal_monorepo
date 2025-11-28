import { interpolate } from "./interpolation";
import { evalCondition } from "./conditions";
import { getSession, setSession } from "./session";
import {
  sendText,
  sendImage,
  sendVideo,
  sendDocument,
  sendInteractiveButton,
  sendInteractiveList,
  sendInteractiveCTAUrl,
} from "./senders";

import { AnyNode, LoadedFlow, SessionState } from "../types/chatbot";

import { ChatbotNodeLogModel, ChatbotSessionModel } from "@hi/db-models";

export async function advance(
  FLOW: LoadedFlow["flow"],
  NODE_BY_ID: Map<string, AnyNode>,
  userId: string,
  waTo: string,
  cfg: any,
  userName?: string,
) {
  let s = getSession(userId);
  let hops = 0;

  while (s.currentNodeId) {
    if (++hops > 25) {
      console.error("Flow halted: too many hops (possible loop).");
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
    setSession(userId, { nodeStartTime });

    // Create log document if session exists
    try {
      if (s._id) {
        nodeLog = await ChatbotNodeLogModel.create({
          sessionId: s._id,
          chatbotId: FLOW._id,
          nodeId: node.id,
          nodeType: node.type,
          enteredAt: new Date(),
        });
      }
    } catch (err) {
      console.error("NodeLog create failed:", err);
    }

    // Increment session message count
    await ChatbotSessionModel.findOneAndUpdate(
      { userId, chatbotId: FLOW._id },
      { $inc: { totalMessages: 1 }, $set: { lastNodeId: node.id } },
      { sort: { startTime: -1 } },
    );

    /* ======================================================
     * 1️⃣ SEND MESSAGE NODE
     * ====================================================== */
    if (node.type === "send_message") {
      const text = interpolate(node.text, s.variables, cfg, userName);
      const caption = interpolate(
        node.caption || "",
        s.variables,
        cfg,
        userName,
      );
      const body = interpolate(node.bodyText || "", s.variables, cfg, userName);

      try {
        if (node.contentType === "text") {
          await sendText(waTo, text, cfg);
        } else if (node.contentType === "image") {
          await sendImage(waTo, node.mediaUrl!, caption || body, cfg);
        } else if (node.contentType === "video") {
          await sendVideo(waTo, node.mediaUrl!, caption || body, cfg);
        } else if (node.contentType === "document") {
          const resolvedUrl = interpolate(
            node.mediaUrl || "",
            s.variables,
            cfg,
            userName,
          );
          await sendDocument(waTo, resolvedUrl, node.fileName, cfg);
        }
      } catch (err) {
        console.error("Error sending send_message node:", err);
      }

      await exitLog(nodeLog, node.next, nodeStartTime);

      if (isEndNode(node)) {
        await completeSession(FLOW._id, s, node.id, nodeLog, nodeStartTime);
        break;
      }

      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    /* ======================================================
     * 2️⃣ ASK QUESTION NODE
     * ====================================================== */
    if (node.type === "ask_question") {
      const prompt = interpolate(node.prompt, s.variables, cfg, userName);

      await sendText(waTo, prompt, cfg);
      await exitLog(nodeLog, node.next, nodeStartTime);

      if (isEndNode(node)) {
        await completeSession(FLOW._id, s, node.id, nodeLog, nodeStartTime);
        break;
      }

      setSession(userId, { waitingFor: "ask" });
      return;
    }

    /* ======================================================
     * 3️⃣ CONDITION NODE
     * ====================================================== */
    if (node.type === "set_condition") {
      const ok = evalCondition(node, s.variables);

      const nextId = ok ? node.trueNext : node.falseNext;

      await exitLog(nodeLog, nextId, nodeStartTime);

      if (isEndNode(node)) {
        await completeSession(FLOW._id, s, node.id, nodeLog, nodeStartTime);
        break;
      }

      setSession(userId, { currentNodeId: nextId || null });
      s = getSession(userId);
      continue;
    }

    /* ======================================================
     * 4️⃣ INTERACTIVE NODES
     * ====================================================== */
    if (
      node.type === "interactive" ||
      node.type === "interactive_list_message" ||
      node.type === "interactive_button_message"
    ) {
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

      /* LIST */
      if (node.layout === "list" && "list" in node) {
        await sendInteractiveList(waTo, body, footer, node.list, cfg);
        await exitLog(nodeLog, null, nodeStartTime);

        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      /* CTA URL */
      if (node.layout === "cta_url") {
        const url = node?.cta?.url || "";
        const label = node?.cta?.label || "Open Link";

        await sendInteractiveCTAUrl(
          waTo,
          body,
          footer,
          url,
          label,
          header,
          cfg,
        );
        await exitLog(nodeLog, null, nodeStartTime);

        setSession(userId, {
          currentNodeId: node.next || null,
          waitingFor: "interactive",
          interactiveCtx: {
            routes: node.routes || { fallback_continue: node.next },
          },
        });
        return;
      }

      /* BUTTON */
      if (
        node.layout === "button" &&
        "buttons" in node &&
        node.buttons.length
      ) {
        await sendInteractiveButton(
          waTo,
          body,
          footer,
          node.buttons,
          header,
          cfg,
        );

        await exitLog(nodeLog, null, nodeStartTime);

        setSession(userId, {
          waitingFor: "interactive",
          interactiveCtx: { routes: node.routes || {} },
        });
        return;
      }

      // Fallback → text
      await sendText(waTo, body, cfg);

      await exitLog(nodeLog, null, nodeStartTime);
      setSession(userId, { currentNodeId: node.next || null });
      continue;
    }

    /* ======================================================
     * 5️⃣ GOOGLE SHEET NODE
     * ====================================================== */
    if (node.type === "google_sheet") {
      try {
        const sheet = node.sheet;
        if (sheet?.spreadsheetId && sheet?.sheetName) {
          const auth = new cfg.googleAuth();
          const gsheets = cfg.googleSheetsClient(auth);

          const row = sheet.cells.map((c) =>
            interpolate(c.value, s.variables, cfg, userName),
          );

          await gsheets.appendRow(sheet.spreadsheetId, sheet.sheetName, row);
        }
      } catch (err) {
        console.error("Google Sheet error:", err);
      }

      await exitLog(nodeLog, node.next, nodeStartTime);
      setSession(userId, { currentNodeId: node.next || null });
      s = getSession(userId);
      continue;
    }

    /* ======================================================
     * 6️⃣ UNKNOWN NODE TYPE → STOP
     * ====================================================== */
    await exitLog(nodeLog, null, nodeStartTime);
    await markDropped(FLOW._id, s, node.id, nodeStartTime);

    setSession(userId, {
      currentNodeId: null,
      waitingFor: null,
      interactiveCtx: undefined,
    });

    break;
  }
}

/* ---------------------------------------------------------
 * HELPERS
 * --------------------------------------------------------- */

async function exitLog(
  nodeLog: any,
  nextNodeId: string | null,
  startTime: number,
) {
  if (!nodeLog) return;
  try {
    await ChatbotNodeLogModel.findByIdAndUpdate(nodeLog._id, {
      exitedAt: new Date(),
      durationMs: Date.now() - startTime,
      nextNodeId,
    });
  } catch (err) {
    console.error("NodeLog update failed:", err);
  }
}

function isEndNode(node: AnyNode) {
  return (
    !node.next &&
    !(node as any).trueNext &&
    !(node as any).falseNext &&
    !(node.routes && Object.keys(node.routes).length)
  );
}

async function completeSession(
  chatbotId: string,
  s: SessionState,
  lastNodeId: string,
  nodeLog: any,
  startTime: number,
) {
  await ChatbotSessionModel.findByIdAndUpdate(s._id, {
    completed: true,
    endTime: new Date(),
    lastNodeId,
    sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
  });

  await exitLog(nodeLog, null, startTime);

  setSession(s.userId, { currentNodeId: null, waitingFor: null });
}

async function markDropped(
  chatbotId: string,
  s: SessionState,
  nodeId: string,
  startTime: number,
) {
  await ChatbotSessionModel.findByIdAndUpdate(s._id, {
    completed: false,
    droppedAtNode: nodeId,
    endTime: new Date(),
    sessionDurationMs: Date.now() - new Date(s.startTime).getTime(),
  });
}
