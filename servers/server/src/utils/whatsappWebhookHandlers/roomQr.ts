import {
  HotelAnalytics,
  HotelRoom,
  HotelRoomSession,
  HotelServiceTemplateMapping,
  UrlModel,
  WhatAppTemplate,
} from "@hi/db-models";
import type { WhatsAppBusinessConfigType } from "@hi/db-models/src/validators";
import axios from "axios";
import { nanoid } from "nanoid";
import { syncHotelStayCompanions } from "../../services/hotelCompanions";
import { returnHotelBodyComponents } from "../../routes/hotel/rooms";
import { buildBackendUrl } from "../backendBaseUrl";
import { setShortUrl } from "../cacheHelper";
import whatsAppApiBaseUrl from "../whatsAppApiBaseUrl/apiPaths";

const appendRoomGuestParams = (
  roomLink: string,
  userId: string,
  sessionId?: string,
) => {
  const url = new URL(roomLink);
  url.searchParams.set("q", "wa");
  url.searchParams.set("id", userId);
  if (sessionId) {
    url.searchParams.set("sessionId", sessionId);
  }
  return url.toString();
};

const createPersonalizedRoomShortUrl = async ({
  roomLink,
  businessId,
  userId,
  sessionId,
}: {
  roomLink?: string;
  businessId?: string;
  userId: string;
  sessionId?: string;
}) => {
  if (!roomLink) return "";

  const longUrl = appendRoomGuestParams(roomLink, userId, sessionId);
  const existingShortUrl = await UrlModel.findOne({
    longUrl,
    shortUrlType: "ROOM_SESSION",
  });

  if (existingShortUrl?.shortUrl) {
    return existingShortUrl.shortUrl;
  }

  let urlCode = nanoid(5);

  while (await UrlModel.exists({ urlCode })) {
    urlCode = nanoid(5);
  }

  const shortUrl = buildBackendUrl(`/surl/r/${urlCode}`);

  const createdShortUrl = await UrlModel.create({
    longUrl,
    shortUrl,
    urlCode,
    businessId,
    shortUrlType: "ROOM_SESSION",
  });

  await setShortUrl(urlCode, longUrl);

  return createdShortUrl.shortUrl;
};

const getRoomUrlButtonParameter = (roomLink: string) => {
  try {
    const url = new URL(roomLink);
    const parts = url.pathname.split("/").filter(Boolean);
    const shortUrlIndex = parts.findIndex((part) => part === "r");

    if (parts[shortUrlIndex - 1] === "surl" && parts[shortUrlIndex + 1]) {
      return parts[shortUrlIndex + 1];
    }
  } catch {
    return roomLink;
  }

  return roomLink;
};

const appendRoomUrlButtonComponent = (
  components: unknown[],
  buttonVariableSequence: string[] | undefined,
  roomLink: string,
  buttonMappings?: Array<{ index?: number; target?: string }>,
) => {
  if (!buttonVariableSequence?.length || !roomLink) {
    return components;
  }

  const activeMappings = buttonMappings?.filter(
    (mapping) => mapping.target === "roomLink",
  );
  const mappedButtons = activeMappings?.length
    ? activeMappings
    : [{ index: 0, target: "roomLink" }];

  return [
    ...components,
    ...mappedButtons.map((mapping) => ({
      type: "button",
      sub_type: "url",
      index: String(mapping.index || 0),
      parameters: [
        {
          type: "text",
          text: getRoomUrlButtonParameter(roomLink),
        },
      ],
    })),
  ];
};

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
    }).lean();

    if (serviceTemplateMapping) {
      const template = (await WhatAppTemplate.findOne({
        businessId: whatsAppBusinessConfigData.businessId,
        templateId: serviceTemplateMapping.templateId,
        isDeleted: false,
      })) as {
        templateName: string;
        bodyVariableSequence: string[];
        buttonVariableSequence?: string[];
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
      const bodyComponents = await returnHotelBodyComponents(
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
      const components = appendRoomUrlButtonComponent(
        bodyComponents,
        template.buttonVariableSequence,
        roomLink,
        serviceTemplateMapping.buttonMappings,
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
        roomQrShortUrl = await createPersonalizedRoomShortUrl({
          roomLink: roomQrShortUrl,
          businessId: whatsAppBusinessConfigData?.businessId,
          userId,
          sessionId: roomSession?._id?.toString(),
        });

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

    roomQrShortUrl = await createPersonalizedRoomShortUrl({
      roomLink: roomQrShortUrl,
      businessId: whatsAppBusinessConfigData?.businessId,
      userId,
      sessionId: roomSession?._id?.toString(),
    });

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
