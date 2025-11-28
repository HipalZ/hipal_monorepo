import { advance } from "./advance";
import { setSession } from "./session";
import { respond } from "../../utils/response";
import { ChatbotSessionModel } from "@hi/db-models";
import type { AskNodeParams, InteractiveParams } from "./types";

export async function processInteractiveReply({
  interactiveTitleOrId,
  session,
  chatbotList,
  whatsAppBusinessConfigData,
  from,
  contactName,
  c,
}: InteractiveParams) {
  const routes = session.interactiveCtx?.routes || {};
  let targetNodeId: string | null = null;

  for (const [key, val] of Object.entries(routes)) {
    if (
      key === interactiveTitleOrId ||
      key.toLowerCase() === interactiveTitleOrId?.toLowerCase()
    ) {
      targetNodeId = val && val.trim() !== "" ? val : null;
      break;
    }
  }

  const lastSession = await ChatbotSessionModel.findOne({ userId: from })
    .sort({ startTime: -1 })
    .select("_id chatbotId")
    .lean();

  let activeBot =
    chatbotList.find(
      (b) => b.flow._id.toString() === lastSession?.chatbotId?.toString(),
    ) || chatbotList[0];

  const { flow: FLOW, NODE_BY_ID } = activeBot;
  const currentNode = NODE_BY_ID.get(session.currentNodeId);

  // Case 1: matched route
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
    return respond(c, "flow continued (interactive route)", false, 200, {});
  }

  // Case 2: fallback to node.next
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
    return respond(c, "flow continued (interactive fallback)", false, 200, {});
  }

  // Case 3: no route, no next → end session
  if (lastSession?._id) {
    const full = await ChatbotSessionModel.findById(lastSession._id);
    if (full) {
      const now = Date.now();
      full.completed = true;
      full.endTime = new Date(now);
      full.lastNodeId = session.currentNodeId;
      full.sessionDurationMs = now - new Date(full.startTime).getTime();
      await full.save();
    }
  }

  setSession(from, {
    currentNodeId: null,
    waitingFor: null,
    interactiveCtx: undefined,
  });

  return respond(c, "flow ended (no route)", false, 200, {});
}

export async function processAskNodeReply({
  textBody,
  sessionState,
  chatbotList,
  whatsAppBusinessConfigData,
  from,
  contactName,
  c,
}: AskNodeParams) {
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

  if (!node || node.type !== "ask_question") return null;

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
    currentNodeId: node.next || null,
    waitingFor: null,
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
