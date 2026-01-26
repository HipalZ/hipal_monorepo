import { Subscriber, WhatsAppChat } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import { downloadWhatsAppMedia, uploadToPermanentStorage } from "./mediaUtils";

// Define payload interface
interface MessagePayload {
  type: string;
  body?: string;
  mediaUrl?: string;
  mediaId?: string;
  caption?: string;
  filename?: string;
}

/**
 * Helper to send the warning text back to the user
 */
async function sendSizeWarning(to: string, config: WhatsAppBusinessConfigType) {
  try {
    const phoneId = config.phoneId;
    await axios.post(
      `https://graph.facebook.com/${config.version}/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: "⚠️ The media you sent is too large. The maximum size allowed is 5MB.",
        },
      },
      { headers: { Authorization: `Bearer ${config.token}` } },
    );
    console.log(`[Warning] Sent 5MB limit warning to ${to}`);
  } catch (err) {
    console.error("Failed to send warning message", err);
  }
}

async function whatsAppChatHandler(
  userInput: MessagePayload,
  userId: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    const { type, body, mediaId, caption, filename } = userInput;
    let { mediaUrl } = userInput;

    // Fetch user to get phone number for warning message
    const subscriber = await Subscriber.findOne({
      userId,
      businessId: whatsAppBusinessConfigData.businessId,
    });
    const userPhone = subscriber?.phone;

    // ✅ MEDIA PROCESSING WITH ERROR HANDLING
    if (mediaId && whatsAppBusinessConfigData.token) {
      try {
        // 1. Download
        const { buffer, extension, mimeType } = await downloadWhatsAppMedia(
          mediaId,
          whatsAppBusinessConfigData.token,
        );

        // 2. Upload
        const permanentUrl = await uploadToPermanentStorage(
          buffer,
          userId,
          extension,
          mimeType,
        );
        if (permanentUrl) mediaUrl = permanentUrl;
      } catch (err: any) {
        // ✅ STEP 3: Handle "FILE_TOO_LARGE" Error
        if (err.code === "FILE_TOO_LARGE") {
          console.warn(`[Media Skipped] File > 5MB for user ${userId}.`);

          // A. Send WhatsApp Warning
          if (userPhone) {
            await sendSizeWarning(userPhone, whatsAppBusinessConfigData);
          }

          // B. Save a text note in DB instead of the media
          await WhatsAppChat.create({
            businessId: whatsAppBusinessConfigData?.businessId,
            date: Date.now(),
            userId,
            isOwner: false,
            type: "text",
            message:
              "⚠️ [System]: User attempted to send a file larger than 5MB.",
          });

          // Stop processing this message
          return;
        }

        // Use temp URL if upload failed but wasn't size related
        console.error(
          "Media processing error (non-size related):",
          err.message,
        );
      }
    }

    const hasContent = (body && body.trim().length > 0) || mediaUrl || mediaId;
    if (!hasContent) return;

    const cleanText = body ? body.trim() : "";

    // Save to DB
    await WhatsAppChat.create({
      businessId: whatsAppBusinessConfigData?.businessId,
      date: Date.now(),
      userId,
      isOwner: false,
      type: type || "text",
      message: cleanText,
      mediaUrl: mediaUrl || undefined,
      mediaId: mediaId || undefined,
      caption: caption || undefined,
      filename: filename || undefined,
    });

    // Update Stats
    await Subscriber.findOneAndUpdate(
      { userId, businessId: whatsAppBusinessConfigData?.businessId },
      {
        $inc: { whatsappMsgUnseenCount: 1 },
        $set: { lastUserMessageAt: Date.now() },
      },
      { new: true },
    );

    console.log(`[whatsAppChatHandler] Logged ${type} message for ${userId}`);
  } catch (error) {
    console.error("Error in whatsAppChatHandler:", error);
  }
}

export { whatsAppChatHandler };
