import { processAskNodeReply, processInteractiveReply } from "./handlers";
import { getSession, setSession } from "./session";
import { advance } from "./advance";
import { ChatbotSessionModel } from "@hi/db-models";
import { respond } from "../../utils/response";
import { getAllChatbotFlows } from "../../utils/whatsappWebhookHandlers/flows";

export async function handleChatbotFlow({
  messages,
  contacts,
  whatsAppBusinessConfigData,
  c,
}: any) {
  const businessId = whatsAppBusinessConfigData?.businessId;
  if (!businessId) return null;

  const chatbotList = await getAllChatbotFlows(businessId);
  if (!chatbotList.length) return null;

  const from =
    messages?.from || contacts?.[0]?.wa_id || contacts?.[0]?.waId || "";

  let session = getSession(from);
  const contactName = contacts?.profile?.name || session.userName || "Guest";

  setSession(from, { userName: contactName });

  let textBody: string | undefined;
  let interactiveTitleOrId: string | undefined;

  if (messages?.type === "interactive") {
    const inter = messages.interactive;
    interactiveTitleOrId =
      inter?.button_reply?.id ||
      inter?.button_reply?.title ||
      inter?.list_reply?.id ||
      inter?.list_reply?.title;
  } else if (messages?.text?.body) {
    textBody = messages.text.body;
  }

  session = getSession(from);

  // 1) interactive reply
  if (interactiveTitleOrId && session.waitingFor === "interactive") {
    return processInteractiveReply({
      interactiveTitleOrId,
      session,
      chatbotList,
      whatsAppBusinessConfigData,
      from,
      contactName,
      c,
    });
  }

  // 1b) STALE interactive reply — session has moved past the interactive step.
  //     Ignore silently instead of letting it fall through to trigger-based start.
  if (interactiveTitleOrId && session.waitingFor !== "interactive") {
    console.log(
      `[Chatbot] Ignored stale button click "${interactiveTitleOrId}" from ${from} — session.waitingFor is "${session.waitingFor}", not "interactive"`,
    );
    return respond(c, "stale interactive reply ignored", false, 200, {});
  }

  // 2) ask question reply
  if (textBody && session.waitingFor === "ask" && session.currentNodeId) {
    return processAskNodeReply({
      textBody,
      sessionState: session,
      chatbotList,
      whatsAppBusinessConfigData,
      from,
      contactName,
      c,
    });
  }

  // 3) trigger start (only text messages can trigger a new flow)
  const messageInput = textBody;
  let matchedBot = null;

  if (messageInput) {
    matchedBot = chatbotList.find((bot) =>
      matchTrigger(bot.flow, messageInput),
    );
  }

  if (!matchedBot) {
    matchedBot = chatbotList.find((b) => b.flow.isDefault) || chatbotList[0];
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

    return respond(c, "chatbot flow started", false, 200, {});
  }

  return null;
}

function matchTrigger(flow: any, msg: string): boolean {
  const m = msg.trim().toLowerCase();
  const trigger = (flow.triggers || []).find((t: any) =>
    (t.keywords || []).some((k: string) => String(k).toLowerCase() === m),
  );
  return !!trigger;
}
