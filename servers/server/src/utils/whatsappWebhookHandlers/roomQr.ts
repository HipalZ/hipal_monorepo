import { HotelAnalytics, HotelRoom, HotelRoomSession } from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForRoomQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  roomLink: string,
  showAuthCode: boolean,
  authCode: string,
) {
  try {
    await axios.post(
      `${whatsAppApiBaseUrl.BASE_URL}${whatsAppBusinessConfigData?.version}/${whatsAppBusinessConfigData?.phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: userPhone,
        type: "template",
        template: {
          name: "fi_welcoming_template",
          language: { code: "en" },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: "https://t-static.blr1.digitaloceanspaces.com/e3039890-ede4-4fec-bcc4-ad12c2aa87ac.jpeg",
                  },
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: whatsAppBusinessConfigData?.businessName,
                },

                {
                  type: "text",
                  text: roomLink,
                },
                {
                  type: "text",
                  text: showAuthCode ? authCode : "  ",
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${whatsAppBusinessConfigData.token}`,
        },
      },
    );
  } catch (error) {
    console.error("Error sendWhatsAppTemplateForTableQr:", error);
  }
}

async function roomQrHandler(
  roomNumber: string,
  userPhone: string,
  userId: string,
  userName: string,
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
) {
  try {
    const roomInfo = await HotelRoom.findOne({
      businessId: whatsAppBusinessConfigData?.businessId,
      name: roomNumber,
    });
    if (!roomInfo) {
      return null;
    }
    let roomQrShortUrl = roomInfo?.downLoadLink;

    const authCode = Math.floor(1000 + Math.random() * 9000).toString();
    let roomSession = await HotelRoomSession.findOne({
      roomId: roomInfo?._id,
    });

    if (roomInfo && roomInfo.userIds.length === 0) {
      if (!roomSession) {
        roomSession = await HotelRoomSession.create({
          roomId: roomInfo?._id,
          name: roomInfo?.name,
          userIds: [userId],
          date: Date.now(),
          checkIn: Date.now(),
          authCode, // Use nanoid for auth code generation
        });

        await HotelAnalytics.findOneAndUpdate(
          {
            businessId: whatsAppBusinessConfigData?.businessId,
            roomId: roomInfo?._id,
            userId: userId,
            roomSessionId: roomSession?._id,
          },
          {
            checkIn: Date.now(),
            userId: userId,
            source: "not-given",
            $addToSet: { guestUserIds: userId },
          },
          { upsert: true },
        );

        // Update the room with the generated authCode
        await HotelRoom.findOneAndUpdate(
          {
            _id: roomInfo?._id,
          },
          {
            authCode: roomSession.authCode,
            $addToSet: { userIds: userId },
            source: "whatsapp",
            roomStatus: "OCCUPIED",
          },
        );
        roomQrShortUrl = `${roomQrShortUrl}?q=wa&id=${userId}&sessionId=${roomSession?._id}`;

        await sendWhatsAppTemplateForRoomQr(
          whatsAppBusinessConfigData,
          userPhone,
          roomQrShortUrl,
          true,
          authCode,
        );
        return null;
      }
    }
    await HotelAnalytics.findOneAndUpdate(
      {
        businessId: whatsAppBusinessConfigData?.businessId,
        roomId: roomInfo?._id,
        userId: userId,
        roomSessionId: roomSession?._id,
      },
      {
        checkIn: Date.now(),
        userId: userId,
        source: "not-given",
        $addToSet: { guestUserIds: userId },
      },
      { upsert: true },
    );

    roomQrShortUrl = `${roomQrShortUrl}?q=wa&id=${userId}&sessionId=${roomSession?._id}`;

    await sendWhatsAppTemplateForRoomQr(
      whatsAppBusinessConfigData,
      userPhone,
      roomQrShortUrl,
      false,
      "",
    );
  } catch (error) {
    console.error("Error in tableQrHandler:", error);
  }
}

export { roomQrHandler };
