import {
  Business,
  Cart,
  DeviceToken,
  HotelAlert,
  HotelAnalytics,
  HotelNotificationJob,
  HotelRoom,
  HotelRoomChat,
  HotelRoomChatComplain,
  HotelRoomChatReply,
  HotelRoomSession,
  HotelService,
  HotelServiceAvailabilityGroup,
  HotelServiceTemplateMapping,
  HotelStaffLevel,
  OutLetInfo,
  User,
  WhatAppTemplate,
  WhatsAppBusinessConfig,
} from '@hi/db-models';
import {
  type AcceptHotelAlertType,
  type HotelServiceType,
  type UpdateAlertCartType,
  acceptHotelAlert,
  hotelAlert,
  updateAlertCart,
} from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
import axios from 'axios';
import { Hono } from 'hono';
import { Types } from 'mongoose';
import { schedule } from 'node-cron';
import { z } from 'zod';
import { sendPushToToken, sendPushToTokens } from '../../services/notifications';
import { DEFAULT_IOS_NOTIFICATION_SOUND } from '../../services/notifications/sound';
import { isCurrentOccupant, requireRoomOccupancy, requireRoomOccupancyByChatReply } from '../../utils/requireRoomOccupancy';
import { respond } from '../../utils/response';
import whatsAppApiBaseUrl from '../../utils/whatsAppApiBaseUrl/apiPaths';
import { endOfToday, startOfToday } from '../payments';
import { returnHotelBodyComponents } from './rooms';
const admin = require('firebase-admin');

const getCartRestaurantIds = (cart: any[] = [], hotelBusinessId?: string) =>
  Array.from(
    new Set(
      cart
        .map((item) => item?.dish?.businessId || item?.businessId || item?.restaurantId || item?.dish?.restaurantId)
        .filter((id): id is string => typeof id === 'string' && id.length === 24 && (!hotelBusinessId || id !== hotelBusinessId)),
    ),
  );

const hasFoodCartItems = (cart?: any[]) =>
  Boolean(cart?.some((item) => item?.dish || item?.dishId || item?.name || item?.dishName));

const FOOD_ORDER_FULFILLMENT_FALLBACK_MINS = 30;

const foodCartItemPrepMins = (item: any) => {
  const prepMins = Number(item?.dish?.avgPrepTime ?? item?.dish?.avgPreparationTime ?? item?.avgPrepTime ?? item?.avgPreparationTime ?? 0);
  return prepMins > 0 ? prepMins : FOOD_ORDER_FULFILLMENT_FALLBACK_MINS;
};

const foodOrderFulfillmentMins = (cart?: any[]) =>
  hasFoodCartItems(cart) ? Math.max(...cart!.map(foodCartItemPrepMins)) : FOOD_ORDER_FULFILLMENT_FALLBACK_MINS;

const foodCartElemMatch = {
  $elemMatch: {
    $or: [
      { dish: { $exists: true, $ne: null } },
      { dishId: { $exists: true, $ne: null } },
      { name: { $type: 'string', $ne: '' } },
      { dishName: { $type: 'string', $ne: '' } },
    ],
  },
};

const chatComplainPayload = z.object({
  roomChatReplyId: z.string().min(2).max(50),
  userId: z.string().min(2).max(50).optional(),
});

const historyStatuses = ['DELIVERED', 'RESOLVED', 'NOT_DELIVERED', 'REJECTED'] as const;
const historyCategoryValues = ['food', 'housekeeping', 'frontOffice', 'maintenance'] as const;

type HistoryCategory = (typeof historyCategoryValues)[number];

const historyCategoryPatterns: Record<Exclude<HistoryCategory, 'food'>, RegExp> = {
  housekeeping: /house\s*keeping|housekeeping|clean|linen|towel|toilet|soap|shower|comb|dental|laundry|slipper|water|bottle|lotion|kit/i,
  frontOffice: /front|office|reception|checkout|check out|check-in|check in|wake|key|luggage|bill|billing/i,
  maintenance: /maintenance|repair|ac|a\/c|tv|wifi|internet|light|fan|electric|plumb|leak|flush|geyser|tap|shower repair/i,
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toMongoId = (value: string) => (Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value);

const objectIds = (items: Array<{ _id?: unknown }>) =>
  items
    .map((item) => String(item?._id || ''))
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

const alertIdsFromChats = (items: Array<{ alertId?: unknown }>) =>
  items
    .map((item) => String(item?.alertId || ''))
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));

type ServiceInstructionRule = {
  condition?: 'BEFORE_TIME' | 'AFTER_TIME';
  time?: string;
  message?: string;
};

const timeToMinutes = (time?: string) => {
  const match = time?.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const getIndiaClockMinutes = (timestamp: number) => {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(timestamp));
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  return hour * 60 + minute;
};

type ServiceAvailabilityTiming = {
  day?: number;
  start?: number;
  end?: number;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getIndiaClock = (timestamp: number) => {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(timestamp));
  const weekday = parts.find((part) => part.type === 'weekday')?.value || 'Sun';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  return { day: day >= 0 ? day : 0, minutes: hour * 60 + minute };
};

const isServiceTimingActive = (slot: ServiceAvailabilityTiming, currentDay: number, currentMinutes: number) => {
  const day = Number(slot.day ?? -1);
  const start = Number(slot.start);
  const end = Number(slot.end);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;

  const dayMatches = day === -1 || day === currentDay;
  if (start <= end) {
    return dayMatches && currentMinutes >= start && currentMinutes < end;
  }

  const previousDay = (currentDay + 6) % 7;
  const isStartDay = day === -1 || day === currentDay;
  const isEndDay = day === -1 || day === previousDay;
  return (isStartDay && currentMinutes >= start) || (isEndDay && currentMinutes < end);
};

const formatServiceAvailabilityTime = (minutes: number) => {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const getNextServiceAvailabilityLabel = (timings: ServiceAvailabilityTiming[], currentDay: number, currentMinutes: number) => {
  let best: { offset: number; start: number; day: number } | null = null;

  for (let offset = 0; offset < 8; offset += 1) {
    const candidateDay = (currentDay + offset) % 7;

    for (const slot of timings) {
      const day = Number(slot.day ?? -1);
      const start = Number(slot.start);
      if (!Number.isFinite(start)) continue;
      if (!(day === -1 || day === candidateDay)) continue;
      if (offset === 0 && start <= currentMinutes) continue;

      if (!best || offset < best.offset || (offset === best.offset && start < best.start)) {
        best = { offset, start, day: candidateDay };
      }
    }
  }

  if (!best) return 'soon';

  const time = formatServiceAvailabilityTime(best.start);
  if (best.offset === 0) return `at ${time}`;
  if (best.offset === 1) return `tomorrow at ${time}`;
  return `on ${DAY_NAMES[best.day]} at ${time}`;
};

const getServiceAvailabilityIssue = async (businessId: string, servicesById: Map<string, any>, serviceIds: any[]) => {
  const groups = await HotelServiceAvailabilityGroup.find({
    businessId,
    active: true,
    serviceIds: { $in: serviceIds },
  })
    .select('_id name timings serviceIds')
    .lean();

  if (!groups.length) return null;

  const groupsByServiceId = new Map<string, ServiceAvailabilityTiming[]>();
  for (const group of groups) {
    for (const serviceId of group.serviceIds || []) {
      const key = serviceId.toString();
      if (!serviceIds.some((requestedServiceId) => requestedServiceId.toString() === key)) continue;
      groupsByServiceId.set(key, [...(groupsByServiceId.get(key) || []), ...((group.timings || []) as ServiceAvailabilityTiming[])]);
    }
  }

  const clock = getIndiaClock(Date.now());
  for (const serviceId of serviceIds) {
    const key = serviceId.toString();
    const timings = groupsByServiceId.get(key) || [];
    if (!timings.length) continue;
    const isAvailable = timings.some((slot) => isServiceTimingActive(slot, clock.day, clock.minutes));
    if (isAvailable) continue;

    const service = servicesById.get(key);
    return {
      serviceName: service?.name || 'This service',
      nextLabel: getNextServiceAvailabilityLabel(timings, clock.day, clock.minutes),
    };
  }

  return null;
};

const buildServiceInstructionSnapshot = (service: any, requestedAt: number) => {
  const behavior = service?.serviceBehavior;
  if (!behavior?.instructionEnabled) return undefined;

  const baseInstruction = String(behavior?.instruction || '').trim();
  const requestMinutes = getIndiaClockMinutes(requestedAt);
  const rule = (behavior?.instructionRules || []).find((item: ServiceInstructionRule) => {
    const ruleMinutes = timeToMinutes(item?.time);
    const message = String(item?.message || '').trim();
    if (ruleMinutes == null || !message) return false;
    if (item.condition === 'BEFORE_TIME') return requestMinutes < ruleMinutes;
    if (item.condition === 'AFTER_TIME') return requestMinutes >= ruleMinutes;
    return false;
  });
  const ruleMessage = String(rule?.message || '').trim();
  const message = [baseInstruction, ruleMessage].filter(Boolean).join(' ');

  if (!message) return undefined;

  return {
    message,
    baseInstruction: baseInstruction || undefined,
    ruleMessage: ruleMessage || undefined,
    ruleCondition: rule?.condition,
    ruleTime: rule?.time,
  };
};

const findFoodChatAlertIds = async (baseAlertQuery: any, itemSearch?: RegExp) => {
  const candidateAlerts = await HotelAlert.find(baseAlertQuery).select('_id').lean();
  const candidateAlertIds = objectIds(candidateAlerts);
  if (!candidateAlertIds.length) return [];

  const chatQuery: any = {
    alertId: { $in: candidateAlertIds },
    isDeleted: false,
    cart: foodCartElemMatch,
  };

  if (itemSearch) {
    chatQuery.$or = [{ 'cart.dish.name': itemSearch }, { 'cart.name': itemSearch }, { 'cart.dishName': itemSearch }];
  }

  const chats = await HotelRoomChat.find(chatQuery).select('alertId').lean();
  return alertIdsFromChats(chats);
};

const buildHistoryAlertQuery = async ({
  businessId,
  fromDate,
  toDate,
  search,
  category,
  room,
  service,
  status,
  staff,
}: {
  businessId: string;
  fromDate: number;
  toDate: number;
  search?: string;
  category?: HistoryCategory;
  room?: string;
  service?: string;
  status?: string;
  staff?: string;
}) => {
  const query: any = {
    businessId: toMongoId(businessId),
    createdAt: { $gte: fromDate, $lte: toDate },
    alertProgress: status && status !== 'all' ? status : { $in: historyStatuses },
  };
  const andClauses: any[] = [];

  if (room && room !== 'all') {
    const rooms = await HotelRoom.find({ businessId, name: room }).select('_id').lean();
    andClauses.push({ roomId: { $in: objectIds(rooms) } });
  }

  if (service && service !== 'all') {
    if (service === 'Food Order') {
      const foodChatAlertIds = await findFoodChatAlertIds(query);
      andClauses.push({
        $or: [
          { cart: foodCartElemMatch },
          { _id: { $in: foodChatAlertIds } },
        ],
      });
    } else {
      const services = await HotelService.find({ businessId, name: service }).select('_id').lean();
      andClauses.push({ serviceIds: { $in: objectIds(services) } });
    }
  }

  if (staff && staff !== 'all') {
    const staffUsers = await User.find({ name: staff }).select('_id').lean();
    const staffIds = objectIds(staffUsers);
    andClauses.push({
      $or: [{ acceptedBy: { $in: staffIds } }, { deliveredBy: { $in: staffIds } }, { rejectedBy: { $in: staffIds } }],
    });
  }

  if (category === 'food') {
    const foodChatAlertIds = await findFoodChatAlertIds(query);
    andClauses.push({
      $or: [
        { cart: foodCartElemMatch },
        { _id: { $in: foodChatAlertIds } },
      ],
    });
  } else if (category && category !== 'housekeeping') {
    const categoryServices = await HotelService.find({
      businessId,
      name: historyCategoryPatterns[category],
    })
      .select('_id')
      .lean();
    const categoryServiceIds = objectIds(categoryServices);

    andClauses.push(
      category === 'frontOffice'
        ? { $or: [{ serviceIds: { $in: categoryServiceIds } }, { message: /^WAKE_UP_CALL::/ }] }
        : { serviceIds: { $in: categoryServiceIds } },
    );
  }

  if (category === 'housekeeping') {
    const [frontOfficeServices, maintenanceServices] = await Promise.all([
      HotelService.find({ businessId, name: historyCategoryPatterns.frontOffice }).select('_id').lean(),
      HotelService.find({ businessId, name: historyCategoryPatterns.maintenance }).select('_id').lean(),
    ]);
    const excludedServiceIds = [...objectIds(frontOfficeServices), ...objectIds(maintenanceServices)];
    andClauses.push({
      serviceIds: { $nin: excludedServiceIds },
      message: { $not: /^WAKE_UP_CALL::/ },
      $nor: [{ cart: foodCartElemMatch }],
    });
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    const regex = new RegExp(escapeRegex(trimmedSearch), 'i');
    const [rooms, services, users, foodChatAlertIds] = await Promise.all([
      HotelRoom.find({ businessId, name: regex }).select('_id').lean(),
      HotelService.find({ businessId, name: regex }).select('_id').lean(),
      User.find({ $or: [{ name: regex }, { phone: regex }] }).select('_id').lean(),
      findFoodChatAlertIds(query, regex),
    ]);

    const userIds = objectIds(users);
    andClauses.push({
      $or: [
        { roomId: { $in: objectIds(rooms) } },
        { serviceIds: { $in: objectIds(services) } },
        { createdBy: { $in: userIds } },
        { acceptedBy: { $in: userIds } },
        { deliveredBy: { $in: userIds } },
        { rejectedBy: { $in: userIds } },
        { message: regex },
        { 'cart.dish.name': regex },
        { 'cart.name': regex },
        { 'cart.dishName': regex },
        { _id: { $in: foodChatAlertIds } },
      ],
    });
  }

  return andClauses.length ? { ...query, $and: andClauses } : query;
};

const hydrateHistoryAlerts = async (alerts: any[]) => {
  const alertIds = alerts.map((alert) => alert._id);
  const roomChats = alertIds.length
    ? await HotelRoomChat.find({
        alertId: { $in: alertIds },
        isDeleted: false,
      })
        .select('alertId userId cart date')
        .populate({ path: 'userId', select: 'name phone' })
        .lean()
    : [];
  const chatByAlertId = new Map(roomChats.map((chat: any) => [String(chat.alertId), chat]));

  return alerts.map((alert: any) => {
    const chat = chatByAlertId.get(String(alert._id));
    const alertCart = Array.isArray(alert.cart) ? alert.cart : [];
    const chatCart = Array.isArray(chat?.cart) ? chat.cart : [];
    return {
      ...alert,
      cart: hasFoodCartItems(alertCart) ? alertCart : hasFoodCartItems(chatCart) ? chatCart : [],
      createdBy: alert.createdBy || chat?.userId,
      createdAt: alert.createdAt || chat?.date,
    };
  });
};

const getHistoryCategorySummary = async (query: any) => {
  const rows = await HotelAlert.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'hotelservices',
        localField: 'serviceIds',
        foreignField: '_id',
        as: 'services',
      },
    },
    {
      $lookup: {
        from: 'hotelroomchats',
        localField: '_id',
        foreignField: 'alertId',
        as: 'roomChats',
      },
    },
    {
      $addFields: {
        effectiveCart: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ['$cart', []] } }, 0] },
            '$cart',
            { $ifNull: [{ $arrayElemAt: ['$roomChats.cart', 0] }, []] },
          ],
        },
        serviceNamesText: {
          $reduce: {
            input: '$services.name',
            initialValue: '',
            in: { $concat: ['$$value', ' ', '$$this'] },
          },
        },
        messageText: { $ifNull: ['$message', ''] },
      },
    },
    {
      $addFields: {
        hasFoodCart: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: { $ifNull: ['$effectiveCart', []] },
                  as: 'cartItem',
                  cond: {
                    $or: [
                      { $ne: ['$$cartItem.dish', null] },
                      { $ne: ['$$cartItem.dishId', null] },
                      { $gt: [{ $strLenCP: { $ifNull: ['$$cartItem.name', ''] } }, 0] },
                      { $gt: [{ $strLenCP: { $ifNull: ['$$cartItem.dishName', ''] } }, 0] },
                    ],
                  },
                },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        category: {
          $switch: {
            branches: [
              {
                case: '$hasFoodCart',
                then: 'food',
              },
              {
                case: {
                  $or: [
                    { $regexMatch: { input: '$messageText', regex: /^WAKE_UP_CALL::/ } },
                    { $regexMatch: { input: '$serviceNamesText', regex: historyCategoryPatterns.frontOffice } },
                  ],
                },
                then: 'frontOffice',
              },
              {
                case: { $regexMatch: { input: '$serviceNamesText', regex: historyCategoryPatterns.maintenance } },
                then: 'maintenance',
              },
            ],
            default: 'housekeeping',
          },
        },
      },
    },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]).allowDiskUse(true);

  return rows.reduce(
    (acc, row) => {
      if (row?._id && row._id in acc) acc[row._id as HistoryCategory] = row.count;
      return acc;
    },
    { food: 0, housekeeping: 0, frontOffice: 0, maintenance: 0 } as Record<HistoryCategory, number>,
  );
};

const getHistoryRoomSummary = async (query: any) => {
  const rows = await HotelAlert.aggregate([
    { $match: query },
    { $group: { _id: '$roomId', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'hotelrooms',
        localField: '_id',
        foreignField: '_id',
        as: 'room',
      },
    },
    {
      $project: {
        _id: 0,
        name: { $arrayElemAt: ['$room.name', 0] },
        count: 1,
      },
    },
    { $match: { name: { $type: 'string', $ne: '' } } },
    { $sort: { name: 1 } },
  ]).allowDiskUse(true);

  return rows.map((row) => ({
    name: row.name,
    count: row.count,
  }));
};

const oneTimeCronExpression = (runTime: Date) =>
  `${runTime.getSeconds()} ${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${runTime.getMonth() + 1} *`;

const sendPushNotification = async (token: string, businessId: string, hotelNo: string, serviceName: string) => {
  const pushMessage = {
    token: token, // or use 'topic' if you're sending to a topic
    notification: {
      title: 'Room Attention Required',
      body: `${hotelNo} requires your attention for ${serviceName}. kindly respond to the alert!`,
    },
    data: {
      type: 'HOTEL_SERVICE_ALERT',
      businessId,
      roomName: hotelNo,
      serviceName,
    },
    android: {
      notification: {
        channel_id: 'custom_channel_id',
        sound: 'order',
      },
    },
    apns: {
      payload: {
        aps: { sound: DEFAULT_IOS_NOTIFICATION_SOUND },
      },
    },
  };

  try {
    const androidNotification = (pushMessage as any).android?.notification;

    console.log('[hotelAlert:push:send]', {
      tokenTail: token.slice(-12),
      businessId,
      roomName: hotelNo,
      serviceName,
      title: pushMessage.notification.title,
      hasAndroidNotification: Boolean(androidNotification),
      channelId: androidNotification?.channel_id,
      sound: androidNotification?.sound,
      iosSound: pushMessage.apns.payload.aps.sound,
      note: 'raw hotel service payload',
    });

    const response = await admin.messaging().send(pushMessage);
    return { success: true, response };
  } catch (error) {
    console.error('[hotelAlert:push:failed]', {
      tokenTail: token.slice(-12),
      businessId,
      roomName: hotelNo,
      serviceName,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const sendPushNotificationForNotDeliverd = async (token: string, businessId: string, hotelNo: string) => {
  const pushMessage = {
    token: token,
    notification: {
      title: 'Service Delivery Alert 🚨',
      body: `Heads up! ${hotelNo} has a service that wasn't delivered. Please check and resolve ASAP.`,
    },
    data: {
      type: 'HOTEL_SERVICE_DELIVERY_ALERT',
      businessId,
      roomName: hotelNo || '',
    },
    android: {
      notification: {
        channel_id: 'custom_channel_id',
        sound: 'order',
      },
    },
    apns: {
      payload: {
        aps: { sound: DEFAULT_IOS_NOTIFICATION_SOUND },
      },
    },
  };

  try {
    console.log('[hotelAlert:deliveryPush:send]', {
      tokenTail: token.slice(-12),
      businessId,
      roomName: hotelNo,
      title: pushMessage.notification.title,
      type: pushMessage.data.type,
      channelId: pushMessage.android.notification.channel_id,
      sound: pushMessage.android.notification.sound,
      iosSound: pushMessage.apns.payload.aps.sound,
    });

    const response = await admin.messaging().send(pushMessage);
    return { success: true, response };
  } catch (error) {
    console.error('[hotelAlert:deliveryPush:failed]', {
      tokenTail: token.slice(-12),
      businessId,
      roomName: hotelNo,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const scheduleAlertUpdate = (
  alertId: string,
  avgTime: number,
  businessId: string,
  roomName: string,
  serviceName: string,
  validStaffIds: string[],
  roomStaffIds: string[],
  serviceId: string,
) => {
  if (avgTime > 0) {
    // Calculate the run time: current time + avgTime minutes

    const runTime = new Date(Date.now() + avgTime * 60 * 1000);
    const cronExpression = oneTimeCronExpression(runTime);

    schedule(cronExpression, async () => {
      const alertData = await HotelAlert.findById(alertId).populate({
        path: 'serviceIds',
        select: 'name',
      });

      if (alertData && alertData?.alertProgress !== 'REJECTED') {
        if (alertData.alertProgress === 'CREATED') {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              alertProgress: 'NON_ACCEPTED_AND_WARNING',
            },
            { new: true },
          );
        }

        if (alertData.alertProgress === 'ACCEPTED') {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              alertProgress: 'IS_ACCEPTED_AND_WARNING',
            },
            { new: true },
          );
        }

        if (alertData.alertProgress === 'IS_ACCEPTED_AND_WARNING') {
          const alert = await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              isEscalated: true,
              alertProgress: 'IS_ACCEPTED_AND_ESCALATION',
            },
            { new: true },
          );
          const validManagers = await User.find({
            _id: { $in: roomStaffIds },
            customRole: {
              $elemMatch: {
                serviceIds: { $in: [serviceId] },
                businessId: { $eq: businessId },
                role: 'MANAGER',
              },
            },
          }).lean();

          const validManagerIds = validManagers.map((manager) => manager._id.toString());

          const l2AndL3ManagerIds = [] as string[];

          const levelOneStaffs = await HotelStaffLevel.findOne({
            businessId,
            level: 1,
          });

          const levelTwoStaffs = await HotelStaffLevel.findOne({
            businessId,
            level: 2,
          });

          for (const id of levelTwoStaffs?.staffIds || []) {
            l2AndL3ManagerIds.push(id.toString());
          }

          const levelThreeStaffs = await HotelStaffLevel.findOne({
            businessId,
            level: 3,
          });

          for (const id of levelThreeStaffs?.staffIds || []) {
            l2AndL3ManagerIds.push(id.toString());
          }

          const filteredManagerIds = validManagerIds.filter((id) => !l2AndL3ManagerIds.includes(id));

          const filterL2ManagerIds = levelTwoStaffs?.staffIds.filter((id) => validManagerIds.includes(id.toString())) || [];

          const filterL3ManagerIds = levelThreeStaffs?.staffIds.filter((id) => validManagerIds.includes(id.toString())) || [];

          const registrationTokens = await DeviceToken.find({
            userId: { $in: filteredManagerIds },
            notification: true,
          });
          registrationTokens.map(async (obj) => {
            if (obj.notification) {
              await sendPushNotification(obj.token, businessId, roomName, serviceName);
            }
          });

          const l2Time = levelOneStaffs?.nextLevelTime;
          const l3Time = levelTwoStaffs?.nextLevelTime;
          // schedule cron job
          scheduleLevel2Alert(alertId, l2Time || 0, 2, businessId, roomName, serviceName, filterL2ManagerIds, filterL3ManagerIds, l3Time);

          const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
            businessId: alertData?.businessId,
          });
          if (whatsAppConfig) {
            for (const staffId of filteredManagerIds) {
              const staffData = await User.findById(staffId).lean();

              const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
                businessId: alertData?.businessId,
                serviceName: 'service_escalation',
              });

              if (serviceTemplateMapping) {
                const template = (await WhatAppTemplate.findOne({
                  businessId: alertData?.businessId,
                  templateId: serviceTemplateMapping.templateId,
                  isDeleted: false,
                })) as {
                  templateName: string;
                  bodyVariableSequence: string[];
                  templateId: string;
                  languageCode: string;
                  category: string;
                };

                // const businessWallet = await WhatsAppWallet.findOne({
                //   businessId: roomExists.businessId,
                // }).select("currentBalance");

                const outLetInfo = await OutLetInfo.findOne({
                  businessId: alertData?.businessId,
                });

                const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
                const components = await returnHotelBodyComponents(
                  outLetInfo?.name || 'businessName',
                  outLetInfo?.address || 'address',
                  template.bodyVariableSequence,
                  'roomLink',
                  roomName,
                  'authCode',
                  (staffData?.name as string) || 'datta',
                  alertData?.serviceIds?.[0]?.name || serviceName || 'other',
                  staffData?.name as string,
                  'https://chatlink.com',
                  outLetInfo?.placeUrl || 'googleReviewLink',
                  'serviceRejectionReason',
                  staffData?.phone || '9588413799',
                );

                const payload = {
                  messaging_product: 'whatsapp',
                  to: staffData?.phone?.toString(),
                  type: 'template',
                  template: {
                    name: template.templateName,
                    language: { code: template.languageCode },
                    components,
                  },
                };

                const axiosConfig = {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                };

                try {
                  const respo = await axios.post(url, payload, axiosConfig);
                } catch (error) {
                  console.error('Error sending message:', error);
                }
              }
            }
          }
        }

        if (alertData.alertProgress === 'NON_ACCEPTED_AND_WARNING') {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              isEscalated: true,
              alertProgress: 'NON_ACCEPTED_AND_ESCALATION',
            },
            { new: true },
          );
          // manager who are assigned to that room and service
          const validManagers = await User.find({
            _id: { $in: roomStaffIds },
            customRole: {
              $elemMatch: {
                serviceIds: { $in: [serviceId] },
                businessId: { $eq: businessId },
                role: 'MANAGER',
              },
            },
          }).lean();
          // extract ids
          const validManagerIds = validManagers.map((manager) => manager._id.toString());

          const l2AndL3ManagerIds = [] as string[];

          const levelOneStaffs = await HotelStaffLevel.findOne({
            businessId,
            level: 1,
          });

          const levelTwoStaffs = await HotelStaffLevel.findOne({
            businessId,
            level: 2,
          });

          for (const id of levelTwoStaffs?.staffIds || []) {
            l2AndL3ManagerIds.push(id.toString());
          }

          const levelThreeStaffs = await HotelStaffLevel.findOne({
            businessId,
            level: 3,
          });

          for (const id of levelThreeStaffs?.staffIds || []) {
            l2AndL3ManagerIds.push(id.toString());
          }

          const filteredManagerIds = validManagerIds.filter((id) => !l2AndL3ManagerIds.includes(id));

          const filterL2ManagerIds = levelTwoStaffs?.staffIds.filter((id) => validManagerIds.includes(id.toString())) || [];

          const filterL3ManagerIds = levelThreeStaffs?.staffIds.filter((id) => validManagerIds.includes(id.toString())) || [];

          const registrationTokens = await DeviceToken.find({
            userId: { $in: filteredManagerIds },
            notification: true,
          });
          registrationTokens.map(async (obj) => {
            if (obj.notification) {
              await sendPushNotification(obj.token, businessId, roomName, serviceName);
            }
          });

          const l2Time = levelOneStaffs?.nextLevelTime;
          const l3Time = levelTwoStaffs?.nextLevelTime;
          // schedule cron job
          scheduleLevel2Alert(alertId, l2Time || 0, 2, businessId, roomName, serviceName, filterL2ManagerIds, filterL3ManagerIds, l3Time);

          const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
            businessId: alertData?.businessId,
          });
          if (whatsAppConfig) {
            for (const staffId of filteredManagerIds) {
              const staffData = await User.findById(staffId).lean();

              const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
                businessId: alertData?.businessId,
                serviceName: 'service_escalation',
              });

              if (serviceTemplateMapping) {
                const template = (await WhatAppTemplate.findOne({
                  businessId: alertData?.businessId,
                  templateId: serviceTemplateMapping.templateId,
                  isDeleted: false,
                })) as {
                  templateName: string;
                  bodyVariableSequence: string[];
                  templateId: string;
                  languageCode: string;
                  category: string;
                };

                // const businessWallet = await WhatsAppWallet.findOne({
                //   businessId: roomExists.businessId,
                // }).select("currentBalance");

                const outLetInfo = await OutLetInfo.findOne({
                  businessId: alertData?.businessId,
                });

                const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
                const components = await returnHotelBodyComponents(
                  outLetInfo?.name as string,
                  outLetInfo?.address as string,
                  template.bodyVariableSequence,
                  'roomName',
                  roomName,
                  'authCode',
                  (staffData?.name as string) || 'datta',
                  alertData?.serviceIds?.[0]?.name || serviceName || 'other',
                  staffData?.name as string,
                  'https://chatlink.com',
                  outLetInfo?.placeUrl || 'googleReviewLink',
                  'serviceRejectionReason',
                  staffData?.phone || '9588413799',
                );

                const payload = {
                  messaging_product: 'whatsapp',
                  to: staffData?.phone?.toString(),
                  type: 'template',
                  template: {
                    name: template.templateName,
                    language: { code: template.languageCode },
                    components,
                  },
                };

                const axiosConfig = {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                };

                try {
                  const respo = await axios.post(url, payload, axiosConfig);
                } catch (error) {
                  console.error('Error sending message:', error);
                }
              }
            }
          }
        }
      }
    });
  }
};

const scheduleLevel2Alert = (
  alertId: string,
  l2Time: number,
  nextLevel: number,
  businessId: string,
  roomName: string,
  serviceName: string,
  l2ManagerIds: string[],
  l3ManagerIds: string[],
  l3Time?: number,
) => {
  if (l2Time > 0) {
    const runTime = new Date(Date.now() + l2Time * 60 * 1000);
    const cronExpression = oneTimeCronExpression(runTime);

    schedule(cronExpression, async () => {
      const alertData = await HotelAlert.findById(alertId).populate({
        path: 'serviceIds',
        select: 'name',
      });

      await HotelAlert.findByIdAndUpdate(alertId, { level: nextLevel }, { new: true });

      // Send push notifications to staff members (skip if accepted)
      const isAccepted =
        alertData && ['ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION', 'DELIVERED'].includes(alertData.alertProgress);

      if (!isAccepted) {
        const registrationTokens = await DeviceToken.find({
          userId: { $in: l2ManagerIds },
          notification: true,
        });
        registrationTokens.map(async (obj) => {
          if (obj.notification) {
            await sendPushNotification(obj.token, businessId, roomName, serviceName);
          }
        });
      }

      scheduleLevel3Alert(alertId, l3Time || 0, 3, businessId, roomName, serviceName, l3ManagerIds);

      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId: alertData?.businessId,
      });
      if (whatsAppConfig) {
        for (const staff of l2ManagerIds) {
          const staffData = await User.findById(staff).lean();

          const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
            businessId: alertData?.businessId,
            serviceName: 'service_escalation',
          });

          if (serviceTemplateMapping) {
            const template = (await WhatAppTemplate.findOne({
              businessId: alertData?.businessId,
              templateId: serviceTemplateMapping.templateId,
              isDeleted: false,
            })) as {
              templateName: string;
              bodyVariableSequence: string[];
              templateId: string;
              languageCode: string;
              category: string;
            };

            // const businessWallet = await WhatsAppWallet.findOne({
            //   businessId: roomExists.businessId,
            // }).select("currentBalance");

            const outLetInfo = await OutLetInfo.findOne({
              businessId: alertData?.businessId,
            });

            const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
            const components = await returnHotelBodyComponents(
              outLetInfo?.name as string,
              outLetInfo?.address as string,
              template.bodyVariableSequence,
              'roomLink',
              roomName,
              'authCode',
              (staffData?.name as string) || 'datta',
              alertData?.serviceIds?.[0]?.name || serviceName || 'other',
              staffData?.name as string,
              'https://chatlink.com',
              outLetInfo?.placeUrl || 'googleReviewLink',
              'serviceRejectionReason',
              staffData?.phone || '9588413799',
            );

            const payload = {
              messaging_product: 'whatsapp',
              to: staffData?.phone?.toString(),
              type: 'template',
              template: {
                name: template.templateName,
                language: { code: template.languageCode },
                components,
              },
            };

            const axiosConfig = {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            };

            try {
              const respo = await axios.post(url, payload, axiosConfig);
            } catch (error) {
              console.error('Error sending message:', error);
            }
          }
        }
      }
    });
  }
};

const scheduleLevel3Alert = (
  alertId: string,
  l3Time: number,
  nextLevel: number,
  businessId: string,
  roomName: string,
  serviceName: string,
  l3ManagerIds: string[],
) => {
  if (l3Time > 0) {
    const runTime = new Date(Date.now() + l3Time * 60 * 1000);
    const cronExpression = oneTimeCronExpression(runTime);

    schedule(cronExpression, async () => {
      const alertData = await HotelAlert.findById(alertId).populate({
        path: 'serviceIds',
        select: 'name',
      });

      await HotelAlert.findByIdAndUpdate(alertId, { level: nextLevel }, { new: true });

      // Send push notifications to staff members (skip if accepted)
      const isAccepted =
        alertData && ['ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION', 'DELIVERED'].includes(alertData.alertProgress);

      if (!isAccepted) {
        const registrationTokens = await DeviceToken.find({
          userId: { $in: l3ManagerIds },
          notification: true,
        });
        registrationTokens.map(async (obj) => {
          if (obj.notification) {
            await sendPushNotification(obj.token, businessId, roomName, serviceName);
          }
        });
      }

      const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
        businessId: alertData?.businessId,
      });
      if (whatsAppConfig) {
        for (const staff of l3ManagerIds) {
          const staffData = await User.findById(staff).lean();

          const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
            businessId: alertData?.businessId,
            serviceName: 'service_escalation',
          });

          if (serviceTemplateMapping) {
            const template = (await WhatAppTemplate.findOne({
              businessId: alertData?.businessId,
              templateId: serviceTemplateMapping.templateId,
              isDeleted: false,
            })) as {
              templateName: string;
              bodyVariableSequence: string[];
              templateId: string;
              languageCode: string;
              category: string;
            };

            // const businessWallet = await WhatsAppWallet.findOne({
            //   businessId: roomExists.businessId,
            // }).select("currentBalance");

            const outLetInfo = await OutLetInfo.findOne({
              businessId: alertData?.businessId,
            });

            const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
            const components = await returnHotelBodyComponents(
              outLetInfo?.name as string,
              outLetInfo?.address as string,
              template.bodyVariableSequence,
              'roomLink',
              roomName,
              'authCode',
              (staffData?.name as string) || 'datta',
              alertData?.serviceIds?.[0]?.name || serviceName || 'other',
              staffData?.name as string,
              'https://chatlink.com',
              outLetInfo?.placeUrl || 'googleReviewLink',
              'serviceRejectionReason',
              'phone',
            );

            const payload = {
              messaging_product: 'whatsapp',
              to: staffData?.phone?.toString(),
              type: 'template',
              template: {
                name: template.templateName,
                language: { code: template.languageCode },
                components,
              },
            };

            const axiosConfig = {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            };

            try {
              const respo = await axios.post(url, payload, axiosConfig);
            } catch (error) {
              console.error('Error sending message:', error);
            }
          }
        }
      }
    });
  }
};

const PUSH_INTERVAL_MS = 59 * 1000;

export const scheduleAlert = (businessId: string, roomName: string, alertId: string, serviceName: string, validStaffIds: string[]) => {
  const intervalId = setInterval(async () => {
    try {
      const alertData = await HotelAlert.findById(alertId).select('alertProgress').lean();

      // Keep sending while alert has not been accepted, delivered, or rejected
      const keepReminding = ['CREATED', 'NON_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_ESCALATION'];
      if (!alertData || !keepReminding.includes(alertData.alertProgress)) {
        clearInterval(intervalId);
        return;
      }

      const registrationTokens = await DeviceToken.find({
        businessId,
        userId: { $in: validStaffIds },
        notification: true,
      });
      for (const obj of registrationTokens) {
        if (obj.notification) {
          await sendPushNotification(obj.token, businessId, roomName, serviceName);
        }
      }
    } catch (error) {
      console.error('scheduleAlert interval error:', error);
      clearInterval(intervalId);
    }
  }, PUSH_INTERVAL_MS);
};

const hotelAlertRouter = new Hono()
  .get(
    '/fetch_room_alerts',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      // Step 1: Validate Staff and Role
      const staff = await User.findOne(
        {
          _id: userId,
          customRole: {
            $elemMatch: {
              businessId,
              isDeleted: { $ne: true },
            },
          },
        },
        {
          customRole: {
            $elemMatch: {
              businessId,
              isDeleted: { $ne: true },
            },
          },
        },
      ).lean();

      if (!staff) {
        return respond(c, 'Staff not found', true, 404, {});
      }

      const customRole = staff.customRole?.find((role) => role.businessId.toString() === businessId && role.isDeleted !== true);

      if (!customRole) {
        return respond(c, 'Role not found for this business', true, 404, {});
      }

      const { role, serviceIds, restaurantIds } = customRole;
      const serviceIdStrings = (serviceIds || []).map((id: any) => id.toString());
      const restaurantIdStrings = (restaurantIds || []).map((id: any) => id.toString());

      // Step 2: Get all room IDs assigned to this staff
      const rooms = await HotelRoom.find({
        businessId,
        staffIds: { $in: [userId] },
      })
        .select('_id')
        .lean();

      const roomIds = rooms.map((room) => room._id);

      if (roomIds.length === 0 && role !== 'MANAGER') {
        return respond(c, 'Staff is not assigned to any room in this business', true, 403, {});
      }

      // Step 3: Single query — service alerts by serviceIds, MESSAGE alerts by room only
      const activeStatuses = [
        'CREATED',
        'ACCEPTED',
        'IS_ACCEPTED_AND_WARNING',
        'NON_ACCEPTED_AND_WARNING',
        'IS_ACCEPTED_AND_ESCALATION',
        'NON_ACCEPTED_AND_ESCALATION',
        'NOT_DELIVERED',
        'IS_ACCEPTED_AND_ESCALATION',
        'NON_ACCEPTED_AND_ESCALATION',
      ];

      const hasFoodRestaurantMapping = await User.exists({
        customRole: {
          $elemMatch: {
            businessId,
            restaurantIds: { $exists: true, $ne: [] },
            isDeleted: { $ne: true },
          },
        },
      });

      const foodAlertQuery =
        hasFoodRestaurantMapping && restaurantIdStrings.length
          ? {
              alertProgress: { $in: activeStatuses },
              cart: foodCartElemMatch,
              'cart.dish.businessId': { $in: restaurantIdStrings },
            }
          : !hasFoodRestaurantMapping
            ? {
                alertProgress: { $in: activeStatuses },
                cart: foodCartElemMatch,
              }
            : undefined;

      const alertQuery: any = {
        businessId,
        roomId: { $in: roomIds },
        $or: [
          {
            alertProgress: { $in: activeStatuses },
            serviceIds: { $in: serviceIdStrings },
          },
          { alertProgress: 'MESSAGE' },
          {
            alertProgress: 'NOT_DELIVERED',
            message: { $regex: '^WAKE_UP_CALL::' },
          },
        ],
      };

      if (foodAlertQuery) {
        alertQuery.$or.push(foodAlertQuery);
      }

      // Checkout requests route to front office by room assignment, not by
      // service membership, so surface them regardless of role.serviceIds.
      if (role === 'FRONT_OFFICE') {
        alertQuery.$or.push({
          alertProgress: { $in: activeStatuses },
          message: { $regex: '^CHECKOUT_REQUEST::' },
        });
      }

      // Step 4: Fetch and populate alerts
      const populateFields = [
        {
          path: 'serviceIds',
          select: 'name image avgAcceptanceTime avgCompletionTime avgDeliveryTime',
        },
        { path: 'createdBy', select: 'name phone' },
        { path: 'acceptedBy', select: 'name phone' },
        { path: 'roomId', select: 'name' },
      ];

      if (role === 'MANAGER') {
        const managerEscalationQuery: any = {
          businessId,
          alertProgress: { $in: ['IS_ACCEPTED_AND_ESCALATION', 'NON_ACCEPTED_AND_ESCALATION'] },
          $or: [{ serviceIds: { $in: serviceIdStrings } }],
        };

        if (hasFoodRestaurantMapping && restaurantIdStrings.length) {
          managerEscalationQuery.$or.push({
            cart: foodCartElemMatch,
            'cart.dish.businessId': { $in: restaurantIdStrings },
          });
        } else if (!hasFoodRestaurantMapping) {
          managerEscalationQuery.$or.push({
            cart: foodCartElemMatch,
          });
        }

        const alerts = await HotelAlert.find(managerEscalationQuery).populate(populateFields).lean();
        return respond(c, 'Alerts fetched successfully', false, 200, alerts);
      }

      const alerts = await HotelAlert.find(alertQuery).populate(populateFields).lean();

      return respond(c, 'Alerts fetched successfully', false, 200, alerts);
    },
  )
  .get(
    '/fetch_escalation_alerts',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      const validManager = await User.findOne({
        _id: userId,
        customRole: {
          $elemMatch: {
            businessId: { $eq: businessId },
            role: 'MANAGER',
            isDeleted: { $ne: true },
          },
        },
      });

      const serviceIds =
        validManager?.customRole?.find((role) => role.businessId.toString() === businessId && role.isDeleted !== true)?.serviceIds?.map((id) => id.toString()) || [];

      const alerts = await HotelAlert.find({
        businessId,
        alertProgress: {
          $in: ['IS_ACCEPTED_AND_ESCALATION', 'NON_ACCEPTED_AND_ESCALATION'],
        },
        serviceIds: { $in: serviceIds || [] },
      })
        .populate({
          path: 'serviceIds',
          select: 'name avgAcceptanceTime avgCompletionTime avgDeliveryTime',
        })
        .populate({ path: 'createdBy', select: 'name phone' })
        .populate({ path: 'acceptedBy', select: 'name phone' })
        .populate({ path: 'roomId', select: 'name' })
        .lean();
      return respond(c, 'Alerts fetched successfully', false, 200, alerts);
    },
  )

  .get(
    '/fetch_alert_history',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, userId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      const alertQuery = {
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
        alertProgress: { $in: ['DELIVERED', 'RESOLVED', 'NOT_DELIVERED', 'REJECTED'] },
      };

      const alerts = await HotelAlert.find(alertQuery)
        .populate({
          path: 'serviceIds',
          select: 'name avgAcceptanceTime avgCompletionTime avgDeliveryTime',
        })
        .populate({ path: 'createdBy', select: 'name phone' })
        .populate({ path: 'acceptedBy', select: 'name phone' })
        .populate({ path: 'deliveredBy', select: 'name phone' })
        .populate({ path: 'roomId', select: 'name' })
        .lean();

      const alertIds = alerts.map((alert) => alert._id);
      const roomChats = alertIds.length
        ? await HotelRoomChat.find({
            alertId: { $in: alertIds },
            isDeleted: false,
          })
            .select('alertId userId cart date')
            .populate({ path: 'userId', select: 'name phone' })
            .lean()
        : [];
      const chatByAlertId = new Map(roomChats.map((chat: any) => [String(chat.alertId), chat]));

      const hydratedAlerts = alerts.map((alert: any) => {
        const chat = chatByAlertId.get(String(alert._id));
        const alertCart = Array.isArray(alert.cart) ? alert.cart : [];
        const chatCart = Array.isArray(chat?.cart) ? chat.cart : [];
        return {
          ...alert,
          cart: hasFoodCartItems(alertCart) ? alertCart : hasFoodCartItems(chatCart) ? chatCart : [],
          createdBy: alert.createdBy || chat?.userId,
          createdAt: alert.createdAt || chat?.date,
        };
      });

      return respond(c, 'Alerts history fetched successfully', false, 200, hydratedAlerts);
    },
  )

  .get(
    '/fetch_alert_history_page',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
        from: z.string().optional(),
        to: z.string().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
        category: z.enum(historyCategoryValues).or(z.literal('all')).optional(),
        room: z.string().optional(),
        service: z.string().optional(),
        status: z.enum(historyStatuses).or(z.literal('all')).optional(),
        staff: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, userId, from, to, page, limit, search, category, room, service, status, staff } = c.req.valid('query');
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (Number.isNaN(fromDate) || Number.isNaN(toDate)) {
        return respond(c, 'Invalid dates', true, 400, {});
      }

      if (fromDate > toDate) {
        return respond(c, 'Invalid date range', true, 400, {});
      }

      const pageQuery = await buildHistoryAlertQuery({
        businessId,
        fromDate,
        toDate,
        search,
        category: category === 'all' ? undefined : category,
        room,
        service,
        status,
        staff,
      });
      const summaryQuery = await buildHistoryAlertQuery({
        businessId,
        fromDate,
        toDate,
        search,
        room,
        service,
        status,
        staff,
      });
      const roomSummaryQuery = await buildHistoryAlertQuery({
        businessId,
        fromDate,
        toDate,
        search,
        category: category === 'all' ? undefined : category,
        service,
        status,
        staff,
      });

      const skip = (page - 1) * limit;
      const [total, alerts, summary, roomSummary, rooms, services, acceptedByIds, deliveredByIds, rejectedByIds] = await Promise.all([
        HotelAlert.countDocuments(pageQuery),
        HotelAlert.find(pageQuery)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'serviceIds',
            select: 'name avgAcceptanceTime avgCompletionTime avgDeliveryTime',
          })
          .populate({ path: 'createdBy', select: 'name phone' })
          .populate({ path: 'acceptedBy', select: 'name phone' })
          .populate({ path: 'deliveredBy', select: 'name phone' })
          .populate({ path: 'rejectedBy', select: 'name phone' })
          .populate({ path: 'roomId', select: 'name' })
          .lean(),
        getHistoryCategorySummary(summaryQuery),
        getHistoryRoomSummary(roomSummaryQuery),
        HotelRoom.find({ businessId, isDeleted: false }).select('name').sort({ name: 1 }).lean(),
        HotelService.find({ businessId, availability: true }).select('name').sort({ name: 1 }).lean(),
        HotelAlert.distinct('acceptedBy', summaryQuery),
        HotelAlert.distinct('deliveredBy', summaryQuery),
        HotelAlert.distinct('rejectedBy', summaryQuery),
      ]);

      const staffIds = Array.from(new Set([...acceptedByIds, ...deliveredByIds, ...rejectedByIds].filter(Boolean).map(String)))
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));
      const staffUsers = staffIds.length ? await User.find({ _id: { $in: staffIds } }).select('name').sort({ name: 1 }).lean() : [];
      const rows = await hydrateHistoryAlerts(alerts);
      const serviceOptions = [
        ...new Set([...(summary.food > 0 ? ['Food Order'] : []), ...services.map((item: any) => item?.name).filter(Boolean)]),
      ].sort();

      return respond(c, 'Alerts history fetched successfully', false, 200, {
        rows,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        summary,
        roomSummary,
        filterOptions: {
          rooms: rooms.map((item: any) => item.name).filter(Boolean),
          services: serviceOptions,
          staff: staffUsers.map((item: any) => item.name).filter(Boolean),
        },
      });
    },
  )

  .get(
    '/room_chat',
    zValidator(
      'query',
      z.object({
        roomId: z.string().min(4).max(30),
      }),
    ),
    async (c) => {
      const { roomId } = c.req.query();

      const roomChat = await HotelRoomChat.find({
        roomId: roomId,
        isDeleted: false,
      })
        .populate({
          path: 'userId',
          select: 'name',
        })
        .populate({
          path: 'alertId',
          select: 'alertProgress acceptedAt createdAt deliveredAt rejectedAt message serviceInstructionSnapshot',
          populate: {
            path: 'serviceIds',
            select: 'name image avgAcceptanceTime avgCompletionTime avgDeliveryTime',
          },
        })
        .populate({
          path: 'roomChatReplyIds',
          select: 'description userId date action status roomChatId complainIds',
          populate: {
            path: 'userId',
            select: 'name',
          },
        });

      return respond(c, 'Room chat fetched successfully', false, 200, roomChat);
    },
  )

  .get(
    '/staff_alert_report',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(24).max(24),
        from: z.string().optional(),
        to: z.string().optional(),
        staffId: z.string().min(24).max(24).optional(),
        overallPerformance: z.enum(['on-time', 'late']).optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to, staffId, overallPerformance } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (Number.isNaN(fromDate) || Number.isNaN(toDate)) {
        return respond(c, 'Invalid dates', true, 400, {});
      }
      if (fromDate > toDate) {
        return respond(c, 'Invalid date range', true, 400, {});
      }

      const alerts = await HotelAlert.find({
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
        ...(staffId
          ? {
              $or: [
                {
                  acceptedBy: staffId,
                },
                { deliveredBy: staffId },
              ],
            }
          : {}),
        alertProgress: {
          $nin: ['MESSAGE', 'REJECTED' /* Exclude non-service alerts */],
        },
      })
        .populate({ path: 'acceptedBy', select: 'name phone' })
        .populate({ path: 'deliveredBy', select: 'name phone' })
        .populate({
          path: 'serviceIds',
          select: 'name avgCompletionTime avgDeliveryTime avgAcceptanceTime',
        })
        .lean();

      //
      const getServiceAverages = (serviceIds: HotelServiceType[] = []) => {
        if (!serviceIds.length) return { avgAccept: 0, avgDeliver: 0 };
        let aSum = 0;
        let dSum = 0;
        let n = 0;
        for (const s of serviceIds) {
          aSum += Number(s?.avgAcceptanceTime ?? 0);
          dSum += Number(s?.avgCompletionTime ?? s?.avgDeliveryTime ?? 0);
          n += 1;
        }
        return {
          avgAccept: n ? aSum / n : 0,
          avgDeliver: n ? dSum / n : 0,
        };
      };

      type Totals = {
        staffId: string;
        staffName: string;
        staffPhone?: string;
        acceptOnTime: number;
        acceptTotal: number;
        deliverOnTime: number;
        deliverTotal: number;
        alertIds: Set<string>;
        totalActiveMinutes: number;
      };
      const byStaff: Record<string, Totals> = {};

      const ensureStaff = (staff: any) => {
        if (!staff || !staff._id) return null;
        const id = String(staff._id);
        if (!byStaff[id]) {
          byStaff[id] = {
            staffId: id,
            staffName: staff.name || 'Unknown',
            staffPhone: staff.phone,
            acceptOnTime: 0,
            acceptTotal: 0,
            deliverOnTime: 0,
            deliverTotal: 0,
            alertIds: new Set<string>(),
            totalActiveMinutes: 0,
          };
        }
        return byStaff[id];
      };

      let gAcceptOnTime = 0; // on-time events
      let gAcceptTotal = 0; // total events
      let gAcceptActualSum = 0; // sum of actual times
      let gAcceptSLASum = 0; // sum of SLA times
      let gAcceptCount = 0; // count of events with SLA

      let gDeliverOnTime = 0; // on-time events
      let gDeliverTotal = 0; // total events
      let gDeliverActualSum = 0; // sum of actual times
      let gDeliverSLASum = 0; // sum of SLA times
      let gDeliverCount = 0; // count of events with SLA

      for (const a of alerts) {
        const createdAt = Number(a?.createdAt);
        const acceptedAt = Number(a?.acceptedAt);
        const deliveredAt = Number(a?.deliveredAt);
        const { avgAccept, avgDeliver } = getServiceAverages(a?.serviceIds);

        if (a?.acceptedBy && Number.isFinite(createdAt) && Number.isFinite(acceptedAt)) {
          const s = ensureStaff(a.acceptedBy);
          const actualAcceptMin = (acceptedAt - createdAt) / 60000;

          if (s) {
            s.acceptTotal += 1;
            s.totalActiveMinutes += actualAcceptMin;
            s.alertIds.add(String(a._id));
            if (avgAccept === 0 || actualAcceptMin <= avgAccept) s.acceptOnTime += 1;
          }

          gAcceptTotal += 1;
          if (avgAccept === 0 || actualAcceptMin <= avgAccept) gAcceptOnTime += 1;

          if (avgAccept > 0 && Number.isFinite(actualAcceptMin)) {
            gAcceptActualSum += actualAcceptMin;
            gAcceptSLASum += avgAccept;
            gAcceptCount += 1;
          }
        }

        // Delivery (credited to deliveredBy)
        if (a?.deliveredBy && Number.isFinite(acceptedAt) && Number.isFinite(deliveredAt)) {
          const s = ensureStaff(a.deliveredBy);
          const actualDeliverMin = (deliveredAt - acceptedAt) / 60000;

          if (s) {
            s.deliverTotal += 1;
            s.totalActiveMinutes += actualDeliverMin;
            s.alertIds.add(String(a._id));
            if (avgDeliver === 0 || actualDeliverMin <= avgDeliver) s.deliverOnTime += 1;
          }

          gDeliverTotal += 1;
          if (avgDeliver === 0 || actualDeliverMin <= avgDeliver) gDeliverOnTime += 1;

          if (avgDeliver > 0 && Number.isFinite(actualDeliverMin)) {
            gDeliverActualSum += actualDeliverMin;
            gDeliverSLASum += avgDeliver || 0;
            gDeliverCount += 1;
          }
        }
      }

      const report = Object.values(byStaff).map((s) => {
        const onTimeTotal = s.acceptOnTime + s.deliverOnTime;
        const total = s.acceptTotal + s.deliverTotal;
        const efficiencyPercentage = total ? Math.round((onTimeTotal / total) * 100) : 0;
        const overAllPerformance = efficiencyPercentage >= 80 ? 'on-time' : 'late';
        return {
          staffName: s.staffName,
          staffId: s.staffId,
          acceptanceOnTime: s.acceptOnTime,
          acceptanceTotal: s.acceptTotal,
          acceptancePercent: s.acceptTotal ? Math.round((s.acceptOnTime / s.acceptTotal) * 100) : 0,

          completionOnTime: s.deliverOnTime,
          completionTotal: s.deliverTotal,
          completionPercent: s.deliverTotal ? Math.round((s.deliverOnTime / s.deliverTotal) * 100) : 0,

          overallPerformanceScore: overAllPerformance,
          efficiencyPercent: efficiencyPercentage,
          servicesHandled: s.alertIds.size,
        };
      });

      const grandOnTime = gAcceptOnTime + gDeliverOnTime; // on-time events
      const grandTotal = gAcceptTotal + gDeliverTotal; // all events
      const grandLate = Math.max(grandTotal - grandOnTime, 0);

      const totalActualCount = gAcceptCount + gDeliverCount;

      const totalActualAvg = totalActualCount > 0 ? (gAcceptActualSum + gDeliverActualSum) / totalActualCount : 0;

      const totalSLAAvg = totalActualCount > 0 ? (gAcceptActualSum + gDeliverActualSum) / totalActualCount : 0;

      const overAll = {
        totalOnTimeCount: grandOnTime,
        totalServiceActionCount: grandTotal,
        totalAvgCompletionMinutes: Number(totalActualAvg.toFixed(1)),
        totalAvgSlaMinutes: Number(totalSLAAvg.toFixed(1)),
        totalServicesHandled: new Set(Object.values(byStaff).flatMap((s) => Array.from(s.alertIds))).size,
      };

      const plotValue = {
        onTime: grandOnTime,
        late: grandLate,
      };

      const result = {
        overAll,
        report,
        plotValue,
      };

      if (overallPerformance && report.length) {
        result.report = report.filter((r) => r.overallPerformanceScore === overallPerformance);
      }

      return respond(c, 'Staff alert report generated', false, 200, result);
    },
  )

  .get(
    '/staff_services',
    zValidator(
      'query',
      z.object({
        businessId: z.string().min(24).max(24),
        from: z.string().optional(),
        to: z.string().optional(),
        staffId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { businessId, from, to, staffId } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();

      if (Number.isNaN(fromDate) || Number.isNaN(toDate)) {
        return respond(c, 'Invalid dates', true, 400, {});
      }
      if (fromDate > toDate) {
        return respond(c, 'Invalid date range', true, 400, {});
      }

      const alerts = await HotelAlert.find({
        businessId,
        createdAt: { $gte: fromDate, $lte: toDate },
        ...(staffId
          ? {
              $or: [
                {
                  acceptedBy: staffId,
                },
                { deliveredBy: staffId },
              ],
            }
          : {}),
        alertProgress: {
          $nin: ['MESSAGE', 'REJECTED' /* Exclude non-service alerts */],
        },
      })
        .populate({ path: 'createdBy', select: 'name phone' })
        .populate({ path: 'raisedByStaff', select: 'name phone' })
        .populate({ path: 'acceptedBy', select: 'name phone' })
        .populate({ path: 'deliveredBy', select: 'name phone' })
        .populate({
          path: 'serviceIds',
          select: 'name avgDeliveryTime avgAcceptanceTime avgCompletionTime',
        })
        .lean();

      return respond(c, 'Staff services fetched successfully', false, 200, alerts);
    },
  )

  .post(
    '/fetch_room_complain',
    zValidator(
      'json',
      z.object({
        complainIds: z.array(z.string().min(1).max(50)),
      }),
    ),
    async (c) => {
      const { complainIds } = await c.req.json();

      const roomChatComplain = await HotelRoomChatComplain.find({
        _id: { $in: complainIds },
      }).populate({
        path: 'roomChatComplainReplyIds',
        select: 'description date userId',
        populate: {
          path: 'userId',
          select: 'name',
        },
      });

      return respond(c, 'Room chat complain fetched successfully', false, 200, roomChatComplain);
    },
  )

  .post('/create_alert', zValidator('json', hotelAlert), requireRoomOccupancy, async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      let validStaffIds: string[] = [];
      let serviceData: HotelServiceType = {
        businessId: '',
        name: '',
        availability: false,
        categoryId: '',
        avgCompletionTime: 0,
        avgAcceptanceTime: 0,
        avgDeliveryTime: 0,
        quantityLimit: 1,
        serviceBehavior: {
          instructionEnabled: false,
          instruction: '',
          instructionRules: [],
        },
        image: '',
      };
      // Loaded + occupancy-verified by requireRoomOccupancy (no second query).
      const roomData = c.get('hotelRoom') as
        | {
            _id: { toString(): string };
            authCode?: string;
            name: string;
            staffIds: string[];
          }
        | undefined;
      if (!roomData) {
        return respond(c, 'Room not found', true, 404, {});
      }

      const userData = await User.findById(requestData.userId);
      if (!userData) {
        return respond(c, 'User not found', true, 404, {});
      }

      const isFoodOrderAlert = hasFoodCartItems(requestData.cart);
      const cartRestaurantIds = isFoodOrderAlert ? getCartRestaurantIds(requestData.cart, requestData.businessId) : [];
      const serviceIds = requestData.serviceIds || [];
      const servicesById = new Map<string, any>();
      const requestedServiceIds = new Set(serviceIds.map((serviceId: any) => serviceId.toString()));
      const requestedQuantityByServiceId = new Map<string, { serviceId: any; quantity: number }>();

      for (const item of requestData.serviceRequestItems || []) {
        const itemServiceId = item.serviceId?.toString();
        if (!itemServiceId || !requestedServiceIds.has(itemServiceId)) {
          return respond(c, 'Quantity can only be sent for selected services', true, 400, {});
        }
        requestedQuantityByServiceId.set(itemServiceId, {
          serviceId: item.serviceId,
          quantity: item.quantity,
        });
      }

      if (!isFoodOrderAlert && serviceIds.length === 0) {
        return respond(c, 'No service found for this alert', true, 400, {});
      }

      if (serviceIds.length > 0) {
        const servicesForQuantity = await HotelService.find({
          _id: { $in: serviceIds },
          businessId: requestData.businessId,
        })
          .select('_id name quantityLimit serviceBehavior')
          .lean();
        servicesForQuantity.forEach((service: any) => servicesById.set(service._id.toString(), service));

        for (const serviceId of serviceIds) {
          const serviceIdString = serviceId.toString();
          const service = servicesById.get(serviceIdString);
          if (!service) {
            return respond(c, 'Service not found for this business', true, 404, {});
          }

          const quantity = requestedQuantityByServiceId.get(serviceIdString)?.quantity ?? 1;
          const quantityLimit = Math.max(1, Math.min(20, Math.floor(Number(service.quantityLimit) || 1)));
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > quantityLimit) {
            return respond(c, `You can request up to ${quantityLimit} ${service.name} at a time`, true, 400, {});
          }
        }

        const availabilityIssue = await getServiceAvailabilityIssue(requestData.businessId, servicesById, serviceIds);
        if (availabilityIssue) {
          return respond(
            c,
            `${availabilityIssue.serviceName} is not available right now. It will be available ${availabilityIssue.nextLabel}.`,
            true,
            400,
            {},
          );
        }
      }

      const alertServiceIds = serviceIds.length ? serviceIds : [undefined];

      for (const serviceId of alertServiceIds) {
        const requestedAt = Date.now();
        const currentServiceIds = serviceId ? [serviceId] : [];
        const requestedQuantityItem = serviceId ? requestedQuantityByServiceId.get(serviceId.toString()) : undefined;
        const currentServiceRequestItems = serviceId ? [requestedQuantityItem || { serviceId, quantity: 1 }] : [];
        const instructionSnapshot = serviceId ? buildServiceInstructionSnapshot(servicesById.get(serviceId.toString()), requestedAt) : undefined;
        const alert = new HotelAlert({
          ...requestData,
          serviceIds: currentServiceIds,
          serviceRequestItems: currentServiceRequestItems,
          serviceInstructionSnapshot: instructionSnapshot,
          cart: isFoodOrderAlert ? requestData.cart : undefined,
          createdAt: requestedAt,
          createdBy: requestData.userId,
          // Present only when front office raised it for the guest.
          raisedByStaff: requestData.raisedByStaff || undefined,
          roomData,
        });

        await alert.save({ session });
        if (!alert) {
          throw new Error('Failed to create alert');
        }

        const create = new HotelRoomChat({
          alertId: alert._id,
          userId: requestData.userId,
          authCode: roomData.authCode,
          roomId: roomData._id,
          date: Date.now(),
          description: 'Alert created',
          cart: isFoodOrderAlert ? requestData.cart : undefined,
          serviceRequestItems: currentServiceRequestItems,
        });
        await create.save({ session });

        if (!create) {
          throw new Error('Failed to create room chat');
        }

        if (isFoodOrderAlert) {
          const createItemAnalytics = new Cart({
            businessId: requestData.businessId,
            userId: requestData.userId,
            cart: requestData.cart,
            name: userData.name,
            phone: userData.phone,
            createdAt: Date.now(),
            date: Date.now(),
            tableName: roomData.name,
          });
          await createItemAnalytics.save({ session });
          if (!createItemAnalytics) {
            throw new Error('Failed to create cart');
          }
        }

        serviceData = serviceId
          ? servicesById.get(serviceId.toString()) || (await HotelService.findById(serviceId).lean())
          : {
              businessId: requestData.businessId,
              name: 'Food Order',
              availability: true,
              categoryId: '',
              avgCompletionTime: 0,
              avgAcceptanceTime: 0,
              avgDeliveryTime: 0,
              quantityLimit: 1,
              serviceBehavior: {
                instructionEnabled: false,
                instruction: '',
                instructionRules: [],
              },
              image: '',
            };
        const serviceQuantity = currentServiceRequestItems[0]?.quantity || 1;
        const serviceDisplayName = serviceQuantity > 1 ? `${serviceData?.name} x${serviceQuantity}` : serviceData?.name;
        const avgCompletionTime = serviceData?.avgCompletionTime || 0;
        const avgAcceptanceTime = serviceData?.avgAcceptanceTime || 0;

        // Find valid staff for this room and service
        let validStaff = serviceId
          ? await User.find({
              _id: { $in: roomData.staffIds },
              customRole: {
                $elemMatch: {
                  businessId: requestData.businessId,
                  serviceIds: { $in: [serviceId] },
                  role: { $ne: 'MANAGER' },
                  isDeleted: { $ne: true },
                },
              },
            })
              .select('_id')
              .lean()
          : [];

        let useLegacyFoodStaffRouting = isFoodOrderAlert;

        if (!validStaff.length && isFoodOrderAlert) {
          const hasFoodRestaurantMapping = await User.exists({
            _id: { $in: roomData.staffIds },
            customRole: {
              $elemMatch: {
                businessId: requestData.businessId,
                restaurantIds: { $exists: true, $ne: [] },
                role: { $ne: 'MANAGER' },
                isDeleted: { $ne: true },
              },
            },
          });

          if (hasFoodRestaurantMapping) {
            useLegacyFoodStaffRouting = false;
            if (cartRestaurantIds.length) {
              validStaff = await User.find({
                _id: { $in: roomData.staffIds },
                customRole: {
                  $elemMatch: {
                    businessId: requestData.businessId,
                    restaurantIds: { $in: cartRestaurantIds },
                    role: { $ne: 'MANAGER' },
                    isDeleted: { $ne: true },
                  },
                },
              })
                .select('_id')
                .lean();
            }
          }
        }

        if (!validStaff.length && isFoodOrderAlert && useLegacyFoodStaffRouting) {
          validStaff = await User.find({
            _id: { $in: roomData.staffIds },
            customRole: {
              $elemMatch: {
                businessId: requestData.businessId,
                role: { $ne: 'MANAGER' },
                isDeleted: { $ne: true },
              },
            },
          })
            .select('_id')
            .lean();
        }
        if (!validStaff.length) {
          return respond(c, 'No valid staff found for this room and service', true, 400, {});
        }
        validStaffIds = validStaff.map((u) => u._id);

        if (serviceId && avgCompletionTime > 0) {
          // Schedule updates based on average times
          scheduleAlertUpdate(
            alert._id.toString(),
            avgCompletionTime,
            requestData.businessId,
            roomData.name,
            serviceDisplayName,
            validStaffIds,
            roomData.staffIds,
            serviceId,
          );

          scheduleAlertUpdate(
            alert._id.toString(),
            avgAcceptanceTime,
            requestData.businessId,
            roomData.name,
            serviceDisplayName,
            validStaffIds,
            roomData.staffIds,
            serviceId,
          );
        }

        scheduleAlert(requestData.businessId, roomData.name, alert._id.toString(), serviceDisplayName, validStaffIds);

        const now = Date.now();
        await HotelNotificationJob.create(
          [
            {
              businessId: requestData.businessId,
              alertId: alert._id,
              targetUserIds: validStaffIds,
              title: 'Room Attention Required',
              body: `${roomData.name} requires your attention for ${serviceDisplayName}. kindly respond to the alert!`,
              data: {
                type: 'HOTEL_SERVICE_ALERT',
                businessId: String(requestData.businessId),
                roomId: roomData._id.toString(),
                roomName: roomData.name,
                serviceName: serviceDisplayName || '',
              },
              status: 'PENDING',
              attempts: 0,
              maxAttempts: 8,
              nextAttemptAt: now,
              createdAt: now,
              updatedAt: now,
              expiresAt: new Date(now + 36 * 60 * 60 * 1000),
            },
          ],
          { session },
        );
      }

      const roomSession = await HotelRoomSession.findOne({
        roomId: roomData._id,
      });

      await HotelAnalytics.findOneAndUpdate(
        {
          businessId: requestData.businessId,
          roomId: roomData._id,
          userId: requestData.userId,
          roomSessionId: roomSession?._id,
        },
        serviceIds.length
          ? {
              $addToSet: { serviceIds: { $each: serviceIds } },
            }
          : {
              $setOnInsert: { serviceIds: [] },
            },
        { upsert: true },
      );

      return respond(c, 'Alert created successfully', false, 201, {});
    });
  })

  .post('/accept_alert', zValidator('json', acceptHotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { alertId, userId, action, reasonOfRejection } = requestData as AcceptHotelAlertType;

      const roomChat = await HotelRoomChat.findOne({
        alertId: alertId,
      });

      const alert = await HotelAlert.findById(alertId).populate({
        path: 'serviceIds',
        select: 'name',
      });

      if (!alert) {
        return respond(c, 'Alert not found', true, 404, {});
      }

      const alertServices = (alert.serviceIds || []) as any[];
      const primaryServiceRef = alertServices[0];
      const primaryServiceId = primaryServiceRef?._id || primaryServiceRef;
      const isFoodOrderAlert = hasFoodCartItems(alert.cart);
      const alertServiceName = primaryServiceRef?.name || (isFoodOrderAlert ? 'Food Order' : 'other');
      const foodOrderCompletionMins = foodOrderFulfillmentMins(alert.cart);

      const captainData = await User.findById(userId);

      if (!captainData) {
        return respond(c, 'User not found', true, 404, {});
      }

      const userData = await User.findById(alert.userId);
      if (!userData) {
        return respond(c, 'User not found', true, 404, {});
      }

      const businessData = await Business.findById(alert.businessId);
      if (!businessData) {
        return respond(c, 'Business not found', true, 404, {});
      }

      const roomData = await HotelRoom.findById(alert.roomId);

      if (!roomData) {
        return respond(c, 'Room not found', true, 404, {});
      }

      const validTransitions: Record<string, string[]> = {
        ACCEPTED: ['CREATED', 'NON_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_ESCALATION'],
        DELIVERED: ['ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION'],
        REJECTED: ['CREATED', 'NON_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_ESCALATION'],
        RESOLVED: ['NOT_DELIVERED'],
      };

      const updateFields: Record<string, object> = {
        ACCEPTED: {
          alertProgress: 'ACCEPTED',
          acceptedAt: Date.now(),
          acceptedBy: userId,
        },
        DELIVERED: {
          alertProgress: 'DELIVERED',
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
        REJECTED: {
          alertProgress: 'REJECTED',
          rejectedAt: Date.now(),
          rejectedBy: userId,
          message: reasonOfRejection,
        },
        RESOLVED: {
          alertProgress: 'DELIVERED',
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
      };

      if (!validTransitions[action]) {
        return respond(c, 'Invalid action', true, 400, {});
      }

      if (!validTransitions[action].includes(alert.alertProgress)) {
        return respond(c, `Cannot mark alert as ${action} because it is in ${alert.alertProgress} state.`, true, 400, {});
      }

      const updatedAlert = await HotelAlert.findByIdAndUpdate(alertId, updateFields[action], { session, new: true });

      if (!updatedAlert) {
        throw new Error('Failed to update alert');
      }

      if (action === 'ACCEPTED') {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });

        if (!roomChat) {
          throw new Error('Room chat not found');
        }

        const service = primaryServiceId ? await HotelService.findById(primaryServiceId) : null;
        const avgCompletionTime = service?.avgCompletionTime || (isFoodOrderAlert ? foodOrderCompletionMins : 15);
        const etaTimestamp = Date.now() + avgCompletionTime * 60 * 1000;
        const formattedTime = new Date(etaTimestamp).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });

        const isCheckoutRequest = alert.message?.startsWith('CHECKOUT_REQUEST::') ?? false;
        const acceptedDescription = isCheckoutRequest
          ? `Please visit the front office by ${formattedTime}.`
          : `Your request is being processed. Completion time for service: ${avgCompletionTime} min. Expected by ${formattedTime}.`;

        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: isCheckoutRequest
            ? `Please visit the front office by ${formattedTime}. 🙏`
            : `Thank you! We're preparing your request — it'll be ready by ${formattedTime}. 🙏`,
          roomChatId: roomChat._id,
          userId: userId,
          status: 'NORMAL',
          date: Date.now(),
        });

        roomChatReply.description = acceptedDescription;
        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error('Failed to create room chat reply');
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );
      }

      if (action === 'REJECTED') {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });

        if (!roomChat) {
          throw new Error('Room chat not found');
        }

        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: `Sorry, we’re unable to process your request right now. Reason: ${
            reasonOfRejection || 'not specified'
          }. Please contact the front desk for assistance.`,
          roomChatId: roomChat._id,
          userId: userId,
          status: 'WARNING',
          date: Date.now(),
        });

        roomChatReply.description = `We are sorry, this request cannot be provided right now. Reason:- ${
          reasonOfRejection || 'not specified'
        }. Please contact the front desk for the next best option.`;
        await roomChatReply.save({ session });

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );
      }
      if (action === 'DELIVERED') {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });
        if (!roomChat) {
          throw new Error('Room chat not found');
        }

        const acceptedTime = alert.acceptedAt || alert.createdAt || Date.now();
        const timeTakenMs = Date.now() - acceptedTime;
        const timeTakenSecs = Math.max(1, Math.ceil(timeTakenMs / 1000));
        const timeTakenMins = Math.max(1, Math.ceil(timeTakenMs / 60000));
        const timeTakenLabel = timeTakenSecs < 60 ? `${timeTakenSecs} sec` : `${timeTakenMins} min`;
        const service = primaryServiceId ? await HotelService.findById(primaryServiceId) : null;
        const avgCompletionTime = service?.avgCompletionTime || (isFoodOrderAlert ? foodOrderCompletionMins : 15);
        const deliveredFast = timeTakenMs < avgCompletionTime * 60 * 1000;
        const isCheckoutDelivery = alert.message?.startsWith('CHECKOUT_REQUEST::') ?? false;
        const guestDeliveryAck = isCheckoutDelivery
          ? `Checkout completed. Thank you for staying with us.`
          : deliveredFast
            ? `Completed in ${timeTakenLabel}, ahead of schedule. Thank you for letting us serve you.`
            : `Completed in ${timeTakenLabel}. Thank you for your patience - we are sorry this took longer than expected.`;

        const deliveryAck = alert.message?.startsWith('CHECKOUT_REQUEST::')
          ? `Your checkout is complete — thank you for staying with us! 🙏`
          : deliveredFast
            ? `Delighted to serve you — delivered in just ${timeTakenMins} min, ahead of schedule! 🎉`
            : `Delivered with care in ${timeTakenMins} min — thank you for your patience. 😊`;

        const roomChatReply = new HotelRoomChatReply({
          action: true,
          description: `${deliveryAck} We hope everything's just right for you.`,
          roomChatId: roomChat._id,
          userId: userId,
          status: 'NORMAL',
          date: Date.now(),
        });

        roomChatReply.description = guestDeliveryAck;
        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error('Failed to create room chat reply');
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );

        const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
          businessId: alert.businessId,
        });

        if (whatsAppConfig) {
          const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
            businessId: alert.businessId,
            serviceName: 'delivery',
          });

          if (serviceTemplateMapping) {
            const template = (await WhatAppTemplate.findOne({
              businessId: alert.businessId,
              templateId: serviceTemplateMapping.templateId,
              isDeleted: false,
            })) as {
              templateName: string;
              bodyVariableSequence: string[];
              templateId: string;
              languageCode: string;
              category: string;
            };

            // const businessWallet = await WhatsAppWallet.findOne({
            //   businessId: roomExists.businessId,
            // }).select("currentBalance");

            // const imageUrl = template?.imageUrl;

            if (!template) {
              return c.json(
                {
                  message: 'Template not found',
                  err: true,
                  data: {},
                },
                404,
              );
            }

            const outLetInfo = await OutLetInfo.findOne({
              businessId: alert.businessId,
            });

            const timeTakenMs = Date.now() - (alert?.acceptedAt || alert?.createdAt || Date.now());
            const timeTakenMinutes = Math.floor(timeTakenMs / 60000);
            const timeTakenText = timeTakenMinutes > 0 ? `${timeTakenMinutes} Minutes` : `${Math.floor(timeTakenMs / 1000)} Seconds`;

            const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
            const components = await returnHotelBodyComponents(
              outLetInfo?.name as string,
              outLetInfo?.address as string,
              template.bodyVariableSequence,
              'roomLink',
              roomData?.name as string,
              'authCode',
              userData?.name as string,

              alertServiceName,
              `${captainData?.name} within ${timeTakenText}`,
              `https://hipal-test.hipalz.com/${businessData.customLink}/hotel/chat?room=${roomData.name}&id=${userData._id}`,
              outLetInfo?.placeUrl as string,
              'serviceRejectionReason',
              'phone',
            );

            const payload = {
              messaging_product: 'whatsapp',
              to: userData?.phone?.toString(),
              type: 'template',
              template: {
                name: template.templateName,
                language: { code: template.languageCode },
                components,
              },
            };

            const axiosConfig = {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            };

            try {
              const respo = await axios.post(url, payload, axiosConfig);
            } catch (error) {
              console.error('Error sending message:', error);
            }
          }
        }
      }

      if (action === 'RESOLVED') {
        const roomChatComplainId = alert.roomChatComplainId;

        if (!roomChatComplainId) {
          throw new Error('Room chat complain ID not found');
        }

        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });

        if (!roomChat) {
          throw new Error('Room chat not found');
        }

        const roomChatReply = await HotelRoomChatComplain.findById(roomChatComplainId);

        if (!roomChatReply) {
          throw new Error('Room chat reply not found');
        }

        const newChatReply = new HotelRoomChatReply({
          description: `your service ${alertServiceName} is resolved`,
          roomChatId: roomChat._id,
          userId: roomChatReply.userId,
          action: true,
          status: 'WARNING',
          date: Date.now(),
        });
        await newChatReply.save({ session });

        if (!newChatReply) {
          throw new Error('Failed to create new room chat reply');
        }

        await HotelRoomChat.findByIdAndUpdate(roomChat._id, { $addToSet: { roomChatReplyIds: newChatReply._id } }, { session });
        const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
          businessId: alert.businessId,
        });

        if (whatsAppConfig) {
          const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
            businessId: alert.businessId,
            serviceName: 'delivery',
          });

          if (serviceTemplateMapping) {
            const template = (await WhatAppTemplate.findOne({
              businessId: alert.businessId,
              templateId: serviceTemplateMapping.templateId,
              isDeleted: false,
            })) as {
              templateName: string;
              bodyVariableSequence: string[];
              templateId: string;
              languageCode: string;
              category: string;
            };

            // const businessWallet = await WhatsAppWallet.findOne({
            //   businessId: roomExists.businessId,
            // }).select("currentBalance");

            // const imageUrl = template?.imageUrl;

            if (!template) {
              return c.json(
                {
                  message: 'Template not found',
                  err: true,
                  data: {},
                },
                404,
              );
            }

            const outLetInfo = await OutLetInfo.findOne({
              businessId: alert.businessId,
            });

            const timeTakenMs = Date.now() - (alert?.acceptedAt || alert?.createdAt || Date.now());
            const timeTakenMinutes = Math.floor(timeTakenMs / 60000);
            const timeTakenText = timeTakenMinutes > 0 ? `${timeTakenMinutes} Minutes` : `${Math.floor(timeTakenMs / 1000)} Seconds`;

            const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
            const components = await returnHotelBodyComponents(
              outLetInfo?.name as string,
              outLetInfo?.address as string,
              template.bodyVariableSequence,
              'ROOMlINK',
              roomData?.name as string,
              'authCode',
              userData?.name as string,

              alertServiceName,
              `${captainData?.name} within ${timeTakenText}`,
              `https://hipal-test.hipalz.com/${businessData.customLink}/hotel/chat?room=${roomData.name}&id=${userData._id}`,
              outLetInfo?.placeUrl as string,
              'serviceRejectionReason',
              'phone',
            );

            const payload = {
              messaging_product: 'whatsapp',
              to: userData?.phone?.toString(),
              type: 'template',
              template: {
                name: template.templateName,
                language: { code: template.languageCode },
                components,
              },
            };

            const axiosConfig = {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            };

            try {
              const respo = await axios.post(url, payload, axiosConfig);
            } catch (error) {
              console.error('Error sending message:', error);
            }
          }
        }
      }
      if (action === 'REJECTED') {
        if (alert.alertProgress !== 'MESSAGE') {
          // Removed redundant "your cart is rejected" message
          const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
            businessId: alert.businessId,
          });

          if (whatsAppConfig) {
            const serviceTemplateMapping = await HotelServiceTemplateMapping.findOne({
              businessId: alert.businessId,
              serviceName: 'service_rejection',
            });

            if (serviceTemplateMapping) {
              const template = (await WhatAppTemplate.findOne({
                businessId: alert.businessId,
                templateId: serviceTemplateMapping.templateId,
                isDeleted: false,
              })) as {
                templateName: string;
                bodyVariableSequence: string[];
                templateId: string;
                languageCode: string;
                category: string;
              };

              if (!template) {
                return c.json(
                  {
                    message: 'Template not found',
                    err: true,
                    data: {},
                  },
                  404,
                );
              }

              const outLetInfo = await OutLetInfo.findOne({
                businessId: alert.businessId,
              });

              const url = `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig.version}/${whatsAppConfig.phoneId}/messages`;
              const components = await returnHotelBodyComponents(
                outLetInfo?.name as string,
                outLetInfo?.address as string,
                template.bodyVariableSequence,
                'roomLink',
                roomData?.name as string,
                'authCode',
                userData.name as string,
                alertServiceName,
                captainData?.name as string,
                'https://chatlink.com',
                outLetInfo?.placeUrl as string,
                reasonOfRejection || 'serviceRejectionReason',
                'phone',
              );

              const payload = {
                messaging_product: 'whatsapp',
                to: userData?.phone?.toString(),
                type: 'template',
                template: {
                  name: template.templateName,
                  language: { code: template.languageCode },
                  components,
                },
              };

              const axiosConfig = {
                headers: {
                  Authorization: `Bearer ${whatsAppConfig.token}`,
                },
              };

              try {
                const respo = await axios.post(url, payload, axiosConfig);
              } catch (error) {
                console.error('Error sending message:', error);
              }
            }
          }
        }
      }

      return respond(c, `Alert ${action} successfully`, false, 200, {
        _id: updatedAlert._id,
      });
    });
  })

  .post(
    '/acknowledge_wake_up_alert',
    zValidator(
      'json',
      z.object({
        alertId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { alertId, userId } = await c.req.json();

      const alert = await HotelAlert.findById(alertId);
      if (!alert) {
        return respond(c, 'Alert not found', true, 404, {});
      }

      if (alert.alertProgress !== 'MESSAGE' || !alert.message?.startsWith('WAKE_UP_CALL::')) {
        return respond(c, 'Only active wake-up call alerts can be acknowledged', true, 400, {});
      }

      const updatedAlert = await HotelAlert.findByIdAndUpdate(
        alertId,
        {
          acceptedAt: alert.acceptedAt || Date.now(),
          acceptedBy: alert.acceptedBy || userId,
        },
        { new: true },
      );

      return respond(c, 'Wake-up call acknowledged successfully', false, 200, {
        _id: updatedAlert?._id,
      });
    },
  )

  .post(
    '/dismiss_message_alert',
    zValidator(
      'json',
      z.object({
        alertId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { alertId, userId } = await c.req.json();

      const alert = await HotelAlert.findById(alertId);
      if (!alert) {
        return respond(c, 'Alert not found', true, 404, {});
      }

      const isWakeUpCallAlert = alert.message?.startsWith('WAKE_UP_CALL::');
      const wakeUpAt = Number(alert.wakeUpAt || 0);
      const isWakeUpCallDue = isWakeUpCallAlert && (alert.alertProgress === 'NOT_DELIVERED' || (wakeUpAt > 0 && wakeUpAt <= Date.now()));

      if (alert.alertProgress !== 'MESSAGE' && !(isWakeUpCallAlert && alert.alertProgress === 'NOT_DELIVERED')) {
        return respond(c, 'Only MESSAGE alerts or due wake-up calls can be dismissed via this route', true, 400, {});
      }

      const updateFields =
        isWakeUpCallAlert && isWakeUpCallDue
          ? {
              alertProgress: 'DELIVERED',
              deliveredAt: Date.now(),
              deliveredBy: userId,
            }
          : {
              alertProgress: 'REJECTED',
              rejectedAt: Date.now(),
              rejectedBy: userId,
            };

      await HotelAlert.findByIdAndUpdate(alertId, updateFields);

      return respond(c, 'Alert dismissed successfully', false, 200, {
        _id: alertId,
      });
    },
  )

  .post('/chat_complain', zValidator('json', chatComplainPayload), requireRoomOccupancyByChatReply, async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { roomChatReplyId, userId } = await c.req.json();

      // Retrieve the existing chat reply and its parent room chat
      const roomChatReply = await HotelRoomChatReply.findById(roomChatReplyId);
      if (!roomChatReply) {
        return respond(c, 'Room chat reply not found', true, 404, {});
      }

      const roomChat = await HotelRoomChat.findById(roomChatReply.roomChatId);
      if (!roomChat) {
        return respond(c, 'Room chat not found', true, 404, {});
      }
      const complaintUserId = userId || roomChat.userId || roomChatReply.userId;

      const updatedChatReply = await HotelRoomChatReply.findByIdAndUpdate(roomChatReplyId, { status: 'WARNING' }, { session, new: true });
      if (!updatedChatReply) {
        throw new Error('Failed to update room chat reply');
      }

      // Create a new chat reply as a response
      const newChatReply = new HotelRoomChatReply({
        action: false,
        description: 'we got your complain and we are working on it',
        roomChatId: roomChat._id,
        userId: complaintUserId,
        status: 'NORMAL',
        date: Date.now(),
      });
      await newChatReply.save({ session });

      if (!newChatReply) {
        throw new Error('Failed to create new room chat reply');
      }

      await HotelRoomChat.findByIdAndUpdate(roomChat._id, { $addToSet: { roomChatReplyIds: newChatReply._id } }, { session });

      // Create a new chat complaint for the existing chat reply
      const newChatComplaint = new HotelRoomChatComplain({
        userId: complaintUserId,
        roomChatReplyId: roomChatReply._id,
        date: Date.now(),
        alertId: roomChat.alertId,
        description: 'Room chat complain',
      });
      await newChatComplaint.save({ session });

      // Link the new complaint to the original chat reply
      await HotelRoomChatReply.findByIdAndUpdate(roomChatReply._id, { $set: { complainIds: newChatComplaint._id } }, { session });

      const updateAlert = await HotelAlert.findByIdAndUpdate(
        roomChat.alertId,
        {
          alertProgress: 'NOT_DELIVERED',
          roomChatComplainId: newChatComplaint._id,
        },
        { session },
      );

      const roomData = await HotelRoom.findById(roomChat.roomId);

      const registrationTokens = await DeviceToken.find({
        businessId: roomData?.businessId,
        notification: true,
      });

      // Step 3: Send push notifications
      await Promise.all(
        registrationTokens.map(async (obj) => {
          if (obj.notification) {
            await sendPushNotificationForNotDeliverd(obj.token, roomData?.businessId?.toString() || '', roomData?.name || '');
          }
        }),
      );

      if (!updateAlert) {
        throw new Error('Failed to update alert');
      }

      return respond(c, 'Room chat complain created successfully', false, 200, {
        _id: newChatComplaint._id,
      });
    });
  })

  .put('/edit_alert_cart', zValidator('json', updateAlertCart), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { alertId, cart, removedItems = [], userId } = requestData as UpdateAlertCartType;

      const alert = await HotelAlert.findById(alertId);

      const roomChat = await HotelRoomChat.findOne({
        alertId: alertId,
      });
      if (!roomChat) {
        return respond(c, 'Room chat not found', true, 404, {});
      }

      if (!alert) {
        return respond(c, 'Alert not found', true, 404, {});
      }

      if (!removedItems.length) {
        return respond(c, 'Removed item details are required', true, 400, {});
      }

      const updatedCartItems = Array.isArray(cart) ? cart : [];
      const alertCartItems = Array.isArray(alert.cart) ? alert.cart : [];
      const roomChatCartItems = Array.isArray(roomChat.cart) ? roomChat.cart : [];
      const originalCartItems = hasFoodCartItems(alertCartItems)
        ? alertCartItems
        : hasFoodCartItems(roomChatCartItems)
          ? roomChatCartItems
          : [];
      const updatedCartIds = new Set(updatedCartItems.map((item: any) => item?.id).filter(Boolean));
      const actualRemovedItems = originalCartItems.filter((item: any) => item?.id && !updatedCartIds.has(item.id));
      const removedReasonById = new Map(removedItems.map((item) => [item.id, item.reason?.trim()]));
      const missingRemovalReason = actualRemovedItems.some((item: any) => !removedReasonById.get(item.id));

      if (!actualRemovedItems.length) {
        return respond(c, 'No cart items were removed', true, 400, {});
      }

      if (missingRemovalReason || removedItems.length !== actualRemovedItems.length) {
        return respond(c, 'Reason is required for every removed item', true, 400, {});
      }

      const allItemsRemoved = updatedCartItems.length === 0;
      const removedSummary = actualRemovedItems
        .map((item: any) => {
          const removedItem = removedItems.find((removed) => removed.id === item.id);
          const quantity = item?.quantity || removedItem?.quantity || 1;
          const name = item?.dish?.name || removedItem?.name || 'Item';
          return `${quantity} x ${name} (Reason: ${removedReasonById.get(item.id)})`;
        })
        .join(', ');
      const updatedCartSummary = updatedCartItems.length
        ? updatedCartItems
            .map((item: any) => {
              const quantity = item?.quantity || 1;
              const name = item?.dish?.name || 'Item';
              return `${quantity} x ${name}`;
            })
            .join(', ')
        : 'No items remaining';
      const rejectionReason = removedItems.length === 1 ? removedItems[0]?.reason : `All ordered items were removed. ${removedSummary}`;
      const chatDescription = allItemsRemoved
        ? `Sorry, your food order has been rejected because all ordered items were removed. ${removedSummary}.`
        : `Your order has been updated. Removed: ${removedSummary}. Updated cart items: ${updatedCartSummary}.`;

      const updatedAlert = await HotelAlert.findByIdAndUpdate(
        alertId,
        {
          cart: updatedCartItems,
          ...(allItemsRemoved
            ? {
                alertProgress: 'REJECTED',
                rejectedAt: Date.now(),
                rejectedBy: userId,
                message: rejectionReason,
              }
            : {}),
        },
        { session, new: true },
      );

      if (!updatedAlert) {
        throw new Error('Failed to update alert');
      }

      const updateRoomChat = await HotelRoomChat.findOneAndUpdate({ alertId: alertId }, { cart: updatedCartItems }, { session, new: true });
      if (!updateRoomChat) {
        throw new Error('Failed to update room chat');
      }

      const roomChatReply = new HotelRoomChatReply({
        action: false,
        description: chatDescription,
        roomChatId: roomChat._id,
        userId: userId || alert.acceptedBy || alert.userId,
        status: allItemsRemoved ? 'WARNING' : 'NORMAL',
        date: Date.now(),
      });

      await roomChatReply.save({ session });

      if (!roomChatReply) {
        throw new Error('Failed to create room chat reply');
      }

      await HotelRoomChat.findByIdAndUpdate(
        roomChat._id,
        {
          $addToSet: { roomChatReplyIds: roomChatReply._id },
        },
        { session },
      );

      return respond(c, allItemsRemoved ? 'Order rejected because all items were removed' : 'Alert cart updated successfully', false, 200, {
        _id: updatedAlert._id,
        alertProgress: updatedAlert.alertProgress,
      });
    });
  })

  .put(
    '/guest_edit_alert_cart',
    zValidator(
      'json',
      z.object({
        alertId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
        cart: z.array(z.object({}).passthrough()).min(1),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { alertId, userId, cart } = await c.req.json();

        const alert = await HotelAlert.findById(alertId);
        if (!alert) {
          return respond(c, 'Alert not found', true, 404, {});
        }

        if (String(alert.userId) !== String(userId)) {
          return respond(c, 'You cannot edit this order', true, 403, {});
        }

        const currentCart = Array.isArray(alert.cart) ? alert.cart : [];
        if (!hasFoodCartItems(currentCart)) {
          return respond(c, 'Only food orders can be edited', true, 400, {});
        }

        const terminalStatuses = ['DELIVERED', 'REJECTED', 'NOT_DELIVERED', 'RESOLVED'];
        if (terminalStatuses.includes(alert.alertProgress)) {
          return respond(c, 'This order can no longer be edited', true, 400, {
            editable: false,
          });
        }

        const outletInfo = await OutLetInfo.findOne({
          businessId: alert.businessId,
        })
          .select('orderEditWindowMinutes')
          .lean();
        const editWindowMinutes = Number(outletInfo?.orderEditWindowMinutes ?? 2);
        const editableUntil = Number(alert.createdAt || 0) + editWindowMinutes * 60 * 1000;

        if (editWindowMinutes <= 0) {
          return respond(c, 'Order editing is disabled', true, 400, {
            editable: false,
            editWindowMinutes,
            editableUntil,
          });
        }

        if (Date.now() > editableUntil) {
          return respond(c, 'Order edit time has expired', true, 400, {
            editable: false,
            editWindowMinutes,
            editableUntil,
          });
        }

        const room = await HotelRoom.findById(alert.roomId).select('roomStatus userIds').lean();
        if (!room || !isCurrentOccupant(room, userId)) {
          return respond(c, 'Guest is not checked in to this room', true, 403, {
            editable: false,
          });
        }

        const updatedCartSummary = cart
          .map((item: any) => {
            const quantity = item?.quantity || 1;
            const name = item?.dish?.name || 'Item';
            return `${quantity} x ${name}`;
          })
          .join(', ');

        const updatedAlert = await HotelAlert.findByIdAndUpdate(alertId, { cart }, { session, new: true });

        if (!updatedAlert) {
          throw new Error('Failed to update alert cart');
        }

        const roomChat = await HotelRoomChat.findOneAndUpdate({ alertId }, { cart }, { session, new: true });

        if (!roomChat) {
          throw new Error('Failed to update room chat cart');
        }

        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: `Your order has been updated. Updated cart items: ${updatedCartSummary}.`,
          roomChatId: roomChat._id,
          userId,
          status: 'NORMAL',
          date: Date.now(),
        });

        await roomChatReply.save({ session });

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );

        return respond(c, 'Order updated successfully', false, 200, {
          _id: updatedAlert._id,
          editableUntil,
          editWindowMinutes,
        });
      });
    },
  );

export default hotelAlertRouter;
