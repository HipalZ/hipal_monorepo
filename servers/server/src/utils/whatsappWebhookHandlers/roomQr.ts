import {
  HotelAnalytics,
  HotelRoom,
  HotelRoomSession,
  HotelServiceTemplateMapping,
  WhatAppTemplate,
} from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import { syncHotelStayCompanions } from "../../services/hotelCompanions";
import { returnHotelBodyComponents } from "../../routes/hotel/rooms";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

async function sendWhatsAppTemplateForRoomQr(
  whatsAppBusinessConfigData: WhatsAppBusinessConfigType,
  userPhone: string,
  roomLink: string,
  showAuthCode: boolean,
  authCode: string,
  userName: string,
) {
  try {
    const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
      businessId: whatsAppBusinessConfigData.businessId,
      serviceName: "welcome",
    });

    if (serviceTemplateMapping) {
      const template = (await WhatAppTemplate.findOne({
        businessId: whatsAppBusinessConfigData.businessId,
        templateId: serviceTemplateMapping.templateId,
        isDeleted: false,
      })) as {
        templateName: string;
        bodyVariableSequence: string[];
        templateId: string;
        languageCode: string;
        category: string;
        imageUrl?: string;
      };

      const imageUrl = template?.imageUrl;

      if (!template) {
        return null;
      }

      const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppBusinessConfigData.version}/${whatsAppBusinessConfigData.phoneId}/messages`;
      const components = await returnHotelBodyComponents(
        whatsAppBusinessConfigData?.businessName as string,
        "address",
        template.bodyVariableSequence,
        roomLink,
        "16",
        showAuthCode ? authCode : "  ",
        userName,
        "get towel",
        "dibesh",
        "https://chatlink.com",
        "gooleReviewLink",
        "serviceRejectionReason",
        "phone",
        imageUrl,
      );

      const payload = {
        messaging_product: "whatsapp",
        to: userPhone,
        type: "template",
        template: {
          name: template.templateName,
          language: { code: template.languageCode },
          components,
        },
      };

      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${whatsAppBusinessConfigData.token}`,
        },
      };

      try {
        const respo = await axios.post(url, payload, axiosConfig);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
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

    console.log("businessId", whatsAppBusinessConfigData?.businessId);
    console.log("roomNumber", roomNumber);

    console.log("roomInfo", roomInfo);
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

        await syncHotelStayCompanions({
          businessId: whatsAppBusinessConfigData?.businessId,
          roomId: roomInfo?._id,
          roomSessionId: roomSession?._id,
          userIds: [userId],
          source: "whatsapp",
        });
        roomQrShortUrl = `${roomQrShortUrl}?q=wa&id=${userId}&sessionId=${roomSession?._id}`;

        await sendWhatsAppTemplateForRoomQr(
          whatsAppBusinessConfigData,
          userPhone,
          roomQrShortUrl,
          true,
          authCode,
          userName,
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

    await syncHotelStayCompanions({
      businessId: whatsAppBusinessConfigData?.businessId,
      roomId: roomInfo?._id,
      roomSessionId: roomSession?._id,
      userIds: [userId],
      source: "whatsapp",
    });

    roomQrShortUrl = `${roomQrShortUrl}?q=wa&id=${userId}&sessionId=${roomSession?._id}`;

    await sendWhatsAppTemplateForRoomQr(
      whatsAppBusinessConfigData,
      userPhone,
      roomQrShortUrl,
      false,
      "   ",
      userName,
    );

    console.log("aaya");
  } catch (error) {
    console.error("Error in tableQrHandler:", error);
  }
}

export { roomQrHandler };
