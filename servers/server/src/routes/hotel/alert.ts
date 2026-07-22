import {
  Business,
  Cart,
  DeviceToken,
  HotelAlert,
  HotelAnalytics,
  HotelRoom,
  HotelRoomChat,
  HotelRoomChatComplain,
  HotelRoomChatReply,
  HotelRoomSession,
  HotelService,
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
  updateRoomChat,
} from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
import axios from 'axios';
import { Hono } from 'hono';
import { schedule } from 'node-cron';
import { z } from 'zod';
import { DEFAULT_IOS_NOTIFICATION_SOUND } from '../../services/notifications/sound';
import { requireRoomOccupancy, requireRoomOccupancyByChatReply } from '../../utils/requireRoomOccupancy';
import { respond } from '../../utils/response';
import whatsAppApiBaseUrl from '../../utils/whatsAppApiBaseUrl/apiPaths';
import { endOfToday, startOfToday } from '../payments';
import { returnHotelBodyComponents } from './rooms';
const admin = require('firebase-admin');

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

const scheduleAlertUpdate = (
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
    const cronExpression = `${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${runTime.getMonth() + 1} *`;

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
                  alertData?.serviceIds[0]?.name || 'other',
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
                  alertData?.serviceIds[0]?.name || 'other',
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
    const cronExpression = `${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${runTime.getMonth() + 1} *`;

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
              alertData?.serviceIds[0]?.name || 'other',
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
    const cronExpression = `${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${runTime.getMonth() + 1} *`;

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
              alertData?.serviceIds[0]?.name || 'other',
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

const scheduleAlert = (businessId: string, roomName: string, alertId: string, serviceName: string, validStaffIds: string[]) => {
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
      const staff = await User.findOne({ _id: userId, 'customRole.businessId': businessId }, { customRole: 1 }).lean();

      if (!staff) {
        return respond(c, 'Staff not found', true, 404, {});
      }

      const customRole = staff.customRole?.find((role) => role.businessId.toString() === businessId);

      if (!customRole) {
        return respond(c, 'Role not found for this business', true, 404, {});
      }

      const { role, serviceIds } = customRole;

      // Step 2: Get all room IDs assigned to this staff
      const rooms = await HotelRoom.find({
        businessId,
        staffIds: { $in: [userId] },
      })
        .select('_id')
        .lean();

      const roomIds = rooms.map((room) => room._id);

      if (roomIds.length === 0) {
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
      ];

      const alertQuery: any = {
        businessId,
        roomId: { $in: roomIds },
        $or: [
          {
            alertProgress: { $in: activeStatuses },
            serviceIds: { $in: serviceIds || [] },
          },
          { alertProgress: 'MESSAGE' },
          {
            alertProgress: 'NOT_DELIVERED',
            message: { $regex: '^WAKE_UP_CALL::' },
          },
        ],
      };

      // Step 4: Fetch and populate alerts
      const populateFields = [
        { path: 'serviceIds', select: 'name image' },
        { path: 'createdBy', select: 'name phone' },
        { path: 'acceptedBy', select: 'name phone' },
        { path: 'roomId', select: 'name' },
      ];

      let alerts = await HotelAlert.find(alertQuery).populate(populateFields).lean();

      if (role === 'MANAGER') {
        alerts = [];
      }

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
          },
        },
      });

      const serviceIds = validManager?.customRole?.find((role) => role.businessId.toString() === businessId)?.serviceIds.map((id) => id.toString());

      const levelData = await HotelStaffLevel.findOne({
        businessId,
        staffIds: userId,
      });

      const alerts = await HotelAlert.find({
        businessId,
        alertProgress: {
          $in: ['IS_ACCEPTED_AND_ESCALATION', 'NON_ACCEPTED_AND_ESCALATION'],
        },
        ...(levelData ? { level: levelData.level } : {}),
        serviceIds: { $in: serviceIds || [] },
      })
        .populate({ path: 'serviceIds', select: 'name' })
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
        alertProgress: { $in: ['DELIVERED', 'RESOLVED'] },
      };

      const alerts = await HotelAlert.find(alertQuery)
        .populate({
          path: 'serviceIds',
          select: 'name avgAcceptanceTime avgDeliveryTime',
        })
        .populate({ path: 'createdBy', select: 'name phone' })
        .populate({ path: 'acceptedBy', select: 'name phone' })
        .populate({ path: 'deliveredBy', select: 'name phone' })
        .populate({ path: 'roomId', select: 'name' })
        .lean();

      return respond(c, 'Alerts history fetched successfully', false, 200, alerts);
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
          select: 'alertProgress acceptedAt createdAt',
          populate: {
            path: 'serviceIds',
            select: 'name avgCompletionTime',
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
          select: 'name avgDeliveryTime avgAcceptanceTime',
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
          dSum += Number(s?.avgDeliveryTime ?? 0);
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
        image: '',
      };
      // Loaded + occupancy-verified by requireRoomOccupancy (no second query).
      const roomData = c.get('hotelRoom');
      if (!roomData) {
        return respond(c, 'Room not found', true, 404, {});
      }

      const userData = await User.findById(requestData.userId);
      if (!userData) {
        return respond(c, 'User not found', true, 404, {});
      }

      const serviceIds = requestData.serviceIds || [];
      for (const serviceId of serviceIds) {
        const alert = new HotelAlert({
          ...requestData,
          serviceIds: [serviceId],
          createdAt: Date.now(),
          createdBy: requestData.userId,
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
          cart: requestData.cart,
        });
        await create.save({ session });

        if (!create) {
          throw new Error('Failed to create room chat');
        }

        if (requestData?.cart?.length !== 0) {
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

        serviceData = await HotelService.findById(serviceId).lean();
        const avgCompletionTime = serviceData?.avgCompletionTime || 0;
        const avgAcceptanceTime = serviceData?.avgAcceptanceTime || 0;

        // Find valid staff for this room and service
        const validStaff = await User.find({
          _id: { $in: roomData.staffIds },
          customRole: {
            $elemMatch: {
              serviceIds: { $in: [serviceId] },
              role: { $ne: 'MANAGER' },
            },
          },
        })
          .select('_id')
          .lean();
        if (!validStaff.length) {
          return respond(c, 'No valid staff found for this room and service', true, 400, {});
        }
        validStaffIds = validStaff.map((u) => u._id);

        if (avgCompletionTime > 0) {
          // Schedule updates based on average times
          scheduleAlertUpdate(
            alert._id.toString(),
            avgCompletionTime,
            requestData.businessId,
            roomData.name,
            serviceData?.name,
            validStaffIds,
            roomData.staffIds,
            serviceId,
          );

          scheduleAlertUpdate(
            alert._id.toString(),
            avgAcceptanceTime,
            requestData.businessId,
            roomData.name,
            serviceData?.name,
            validStaffIds,
            roomData.staffIds,
            serviceId,
          );
        }

        scheduleAlert(requestData.businessId, roomData.name, alert._id.toString(), serviceData?.name, validStaffIds);
      }
      // Step 2: Get device tokens only for those staff
      const registrationTokens = await DeviceToken.find({
        businessId: requestData.businessId,
        userId: { $in: validStaffIds },
        notification: true,
      });

      // Step 3: Send push notifications
      await Promise.all(
        registrationTokens.map(async (obj) => {
          if (obj.notification) {
            await sendPushNotification(obj.token, requestData.businessId, roomData.name, serviceData?.name);
          }
        }),
      );

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
        {
          $addToSet: { serviceIds: serviceIds },
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

        const service = await HotelService.findById(alert.serviceIds[0]);
        const avgCompletionTime = service?.avgCompletionTime || 15;
        const etaTimestamp = Date.now() + avgCompletionTime * 60 * 1000;
        const formattedTime = new Date(etaTimestamp).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        });

        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: `Thanks for your patience. We’ve received your request and are working on it. It will be ready by ${formattedTime}.`,
          roomChatId: roomChat._id,
          userId: userId,
          status: 'NORMAL',
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
        const timeTakenMins = Math.max(1, Math.ceil(timeTakenMs / 60000));
        const service = await HotelService.findById(alert.serviceIds[0]);
        const avgCompletionTime = service?.avgCompletionTime || 15;
        const deliveredFast = timeTakenMins < avgCompletionTime;

        const deliveryAck = deliveredFast
          ? `Great news — your service was delivered in just ${timeTakenMins} min, ahead of schedule! 🎉`
          : `Your service has been successfully delivered in ${timeTakenMins} min.`;

        const roomChatReply = new HotelRoomChatReply({
          action: true,
          description: `${deliveryAck} We hope everything is to your satisfaction. If something isn't right, please tap "Not Delivered" to raise a concern. Otherwise, we'd love to hear your feedback! 😊`,
          roomChatId: roomChat._id,
          userId: userId,
          status: 'NORMAL',
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

              alert?.serviceIds[0]?.name || 'other',
              `${captainData?.name} within ${timeTakenText}`,
              `https://hipalz.com/${businessData.customLink}/hotel/chat?room=${roomData.name}&id=${userData._id}`,
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
          description: `your service ${alert?.serviceIds[0]?.name} is resolved`,
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

              alert?.serviceIds[0]?.name || 'other',
              `${captainData?.name} within ${timeTakenText}`,
              `https://hipalz.com/${businessData.customLink}/hotel/chat?room=${roomData.name}&id=${userData._id}`,
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
                alert?.serviceIds[0]?.name || 'other',
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

      if (alert.alertProgress !== 'MESSAGE' && !(isWakeUpCallAlert && alert.alertProgress === 'NOT_DELIVERED')) {
        return respond(c, 'Only MESSAGE alerts or due wake-up calls can be dismissed via this route', true, 400, {});
      }

      await HotelAlert.findByIdAndUpdate(
        alertId,
        isWakeUpCallAlert
          ? {
              alertProgress: 'RESOLVED',
              deliveredAt: Date.now(),
              deliveredBy: userId,
            }
          : {
              alertProgress: 'REJECTED',
              rejectedAt: Date.now(),
              rejectedBy: userId,
            },
      );

      return respond(c, 'Alert dismissed successfully', false, 200, {
        _id: alertId,
      });
    },
  )

  .post('/chat_complain', zValidator('json', updateRoomChat), requireRoomOccupancyByChatReply, async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { roomChatReplyId } = await c.req.json();

      // Retrieve the existing chat reply and its parent room chat
      const roomChatReply = await HotelRoomChatReply.findById(roomChatReplyId);
      if (!roomChatReply) {
        return respond(c, 'Room chat reply not found', true, 404, {});
      }

      const roomChat = await HotelRoomChat.findById(roomChatReply.roomChatId);
      if (!roomChat) {
        return respond(c, 'Room chat not found', true, 404, {});
      }

      const updatedChatReply = await HotelRoomChatReply.findByIdAndUpdate(roomChatReplyId, { status: 'WARNING' }, { session, new: true });
      if (!updatedChatReply) {
        throw new Error('Failed to update room chat reply');
      }

      // Create a new chat reply as a response
      const newChatReply = new HotelRoomChatReply({
        action: false,
        description: 'we got your complain and we are working on it',
        roomChatId: roomChat._id,
        userId: roomChatReply.userId,
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
        userId: roomChatReply.userId,
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
      const { alertId, cart } = requestData as UpdateAlertCartType;

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

      const updatedAlert = await HotelAlert.findByIdAndUpdate(alertId, { cart: cart }, { session, new: true });

      if (!updatedAlert) {
        throw new Error('Failed to update alert');
      }

      const updateRoomChat = await HotelRoomChat.findOneAndUpdate({ alertId: alertId }, { cart: cart }, { session, new: true });
      if (!updateRoomChat) {
        throw new Error('Failed to update room chat');
      }

      const roomChatReply = new HotelRoomChatReply({
        action: false,
        description: 'your cart is updated',
        roomChatId: roomChat._id,
        userId: alert.userId,
        status: 'NORMAL',
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

      return respond(c, 'Alert cart updated successfully', false, 200, {
        _id: updatedAlert._id,
      });
    });
  });

export default hotelAlertRouter;
