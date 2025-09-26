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
    console.log("roomInfo", roomInfo);
    if (!roomInfo) {
      return null;
    }
    let roomQrShortUrl = roomInfo?.downLoadLink;
    roomQrShortUrl = `${roomQrShortUrl}?q=wa&id=${userId}}`;

    const authCode = Math.floor(1000 + Math.random() * 9000).toString();
    const roomSession = await HotelRoomSession.findOne({
      roomId: roomInfo?._id,
    });
    if (roomInfo && roomInfo.userIds.length === 0) {
      if (!roomSession) {
        const roomSession = await HotelRoomSession.create({
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

        await sendWhatsAppTemplateForRoomQr(
          whatsAppBusinessConfigData,
          userPhone,
          roomQrShortUrl,
          true,
          authCode,
        );

        // const serviceTemplateMapping =
        //   await HotelServiceTemplateMapping.findOne({
        //     businessId: whatsAppBusinessConfigData?.businessId,
        //     serviceName: "welcome",
        //   });

        // if (serviceTemplateMapping) {
        //   const template = (await WhatAppTemplate.findOne({
        //     businessId: whatsAppBusinessConfigData?.businessId,
        //     templateId: serviceTemplateMapping.templateId,
        //     isDeleted: false,
        //   })) as {
        //     templateName: string;
        //     bodyVariableSequence: string[];
        //     templateId: string;
        //     languageCode: string;
        //     category: string;
        //     imageUrl?: string;
        //   };

        //   // const businessWallet = await WhatsAppWallet.findOne({
        //   //   businessId: roomExists.businessId,
        //   // }).select("currentBalance");

        //   const imageUrl = template?.imageUrl;

        //   if (!template) {
        //     console.error("Template not found for welcome service.");
        //   }

        //   const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppBusinessConfigData.version}/${whatsAppBusinessConfigData.phoneId}/messages`;
        //   const components = await returnHotelBodyComponents(
        //     whatsAppBusinessConfigData?.businessName as string,
        //     "address",
        //     template.bodyVariableSequence,
        //     `${roomQrShortUrl}&sessionId=${roomSession?._id}`,
        //     "16",
        //     authCode,
        //     userName as string,
        //     "get towel",
        //     "dibesh",
        //     "https://chatlink.com",
        //     (whatsAppBusinessConfigData?.outLetId?.placeUrl as string) || "",
        //     "serviceRejectionReason",
        //     userPhone as string,
        //     imageUrl,
        //   );

        //   const payload = {
        //     messaging_product: "whatsapp",
        //     to: userPhone,
        //     type: "template",
        //     template: {
        //       name: template.templateName,
        //       language: { code: template.languageCode },
        //       components,
        //     },
        //   };

        //   const axiosConfig = {
        //     headers: {
        //       Authorization: `Bearer ${whatsAppBusinessConfigData.token}`,
        //     },
        //   };

        //   try {
        //     const respo = await axios.post(url, payload, axiosConfig);
        //   } catch (error) {
        //     console.error("Error sending message:", error);
        //   }
        // }
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
