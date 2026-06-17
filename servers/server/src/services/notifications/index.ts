import { DeviceToken } from "@hi/db-models";
import {
  DEFAULT_NOTIFICATION_CHANNEL_ID,
  DEFAULT_NOTIFICATION_SOUND,
  type NotificationChannelGroup,
} from "./sound";

const admin = require("firebase-admin");

type PushProvider = "fcm" | "expo" | "apns";
type PushPlatform = "android" | "ios" | "web" | "unknown";

export type PushTarget = {
  _id?: unknown;
  token: string;
  businessId?: unknown;
  provider?: PushProvider;
  platform?: PushPlatform;
  notification?: boolean;
};

type PersistedPushTarget = Omit<PushTarget, "token"> & {
  token?: string;
  businessId?: unknown;
};

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  channelId?: string;
  channelGroup?: NotificationChannelGroup;
};

type PushResult = {
  token: string;
  provider: PushProvider;
  success: boolean;
  response?: unknown;
  error?: string;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const isExpoToken = (token: string) =>
  token.startsWith("ExpoPushToken[") || token.startsWith("ExponentPushToken[");

const getFirebaseMessaging = () => {
  if (!admin.apps?.length) {
    const serviceAccount = require("../../utils/service_account.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.messaging();
};

const resolveProvider = (target: PushTarget): PushProvider => {
  if (target.provider) return target.provider;
  return isExpoToken(target.token) ? "expo" : "fcm";
};

const sendExpoPush = async (target: PushTarget, payload: PushPayload) => {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: target.token,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      sound: DEFAULT_NOTIFICATION_SOUND,
      channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
      priority: "high",
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
};

const sendFirebasePush = async (target: PushTarget, payload: PushPayload) => {
  const sound = DEFAULT_NOTIFICATION_SOUND;
  const message = {
    token: target.token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
    android: {
      notification: {
        channel_id: DEFAULT_NOTIFICATION_CHANNEL_ID,
        sound,
      },
    },
  };

  console.log("[push:fcm:send]", {
    tokenTail: target.token.slice(-12),
    title: payload.title,
    type: payload.data?.type,
    businessId: payload.data?.businessId,
    channelId: message.android.notification.channel_id,
    sound: message.android.notification.sound,
  });

  return getFirebaseMessaging().send(message);
};

const shouldDeleteToken = (error: string) =>
  error.includes("NotRegistered") ||
  error.includes("Device unregistered") ||
  error.includes("Requested entity was not found") ||
  error.includes("DeviceNotRegistered") ||
  error.includes("messaging/registration-token-not-registered") ||
  error.includes("messaging/invalid-registration-token");

export const sendPushToToken = async (
  target: PushTarget,
  payload: PushPayload,
): Promise<PushResult> => {
  const provider = resolveProvider(target);
  const resolvedPayload = {
    ...payload,
    sound: DEFAULT_NOTIFICATION_SOUND,
    channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
  };

  try {
    const response =
      provider === "expo"
        ? await sendExpoPush(target, resolvedPayload)
        : await sendFirebasePush(target, resolvedPayload);

    console.log("Push notification sent:", {
      provider,
      token: target.token,
      channelId: resolvedPayload.channelId,
      sound: resolvedPayload.sound,
      type: resolvedPayload.data?.type,
    });

    return {
      token: target.token,
      provider,
      success: true,
      response,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Push notification failed:", {
      provider,
      token: target.token,
      channelId: resolvedPayload.channelId,
      sound: resolvedPayload.sound,
      error: message,
    });

    if (shouldDeleteToken(message)) {
      console.warn("Deleting stale push token:", {
        provider,
        token: target.token,
        reason: message,
      });

      const deleteResult = await DeviceToken.deleteOne({ token: target.token });

      console.warn("Stale push token delete result:", {
        provider,
        token: target.token,
        deletedCount: deleteResult.deletedCount,
      });
    }

    return {
      token: target.token,
      provider,
      success: false,
      error: message,
    };
  }
};

export const sendPushToTokens = async (
  targets: PersistedPushTarget[],
  payload: PushPayload,
) => {
  const enabledTargets = targets.filter(
    (target): target is PushTarget =>
      target.notification !== false && typeof target.token === "string",
  );
  const resolvedPayload = {
    ...payload,
    sound: DEFAULT_NOTIFICATION_SOUND,
    channelId: DEFAULT_NOTIFICATION_CHANNEL_ID,
  };

  return Promise.all(
    enabledTargets.map((target) => sendPushToToken(target, resolvedPayload)),
  );
};
