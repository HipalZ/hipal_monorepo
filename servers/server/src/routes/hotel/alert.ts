import {
  Business,
  Cart,
  DeviceToken,
  HotelAlert,
  HotelRoom,
  HotelRoomChat,
  HotelRoomChatComplain,
  HotelRoomChatReply,
  HotelService,
  OutLetInfo,
  User,
  WhatsAppBusinessConfig,
} from "@hi/db-models";
import {
  type AcceptHotelAlertType,
  type HotelServiceType,
  type UpdateAlertCartType,
  acceptHotelAlert,
  hotelAlert,
  updateAlertCart,
  updateRoomChat,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import { schedule } from "node-cron";
import { z } from "zod";
import { respond } from "../../utils/response";
import whatsAppApiBaseUrl from "../../utils/whatsAppApiBaseUrl/apiPaths";
const admin = require("firebase-admin");

const sendPushNotification = async (
  token: string,
  hotelNo: string,
  serviceName: string,
) => {
  const pushMessage = {
    token: token, // or use 'topic' if you're sending to a topic
    notification: {
      title: "Room Attention Required",
      body: `Room ${hotelNo} requires your attention for ${serviceName}. kindly respond to the alert!`,
    },
    android: {
      notification: {
        channel_id: "custom_channel_id",
        sound: "order",
      },
    },
  };

  try {
    const response = await admin.messaging().send(pushMessage);
    return { success: true, response };
  } catch (error) {}
};

const scheduleAlertUpdate = (
  alertId: string,
  avgTime: number,
  businessId: string,
  roomName: string,
  serviceName: string,
  validStaffIds: string[],
) => {
  if (avgTime > 0) {
    // Calculate the run time: current time + avgTime minutes
    const runTime = new Date(Date.now() + avgTime * 60 * 1000);
    const cronExpression = `${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${
      runTime.getMonth() + 1
    } *`;

    schedule(cronExpression, async () => {
      const alertData = await HotelAlert.findById(alertId).populate({
        path: "serviceIds",
        select: "name",
      });

      if (alertData && alertData?.alertProgress !== "REJECTED") {
        if (alertData.alertProgress === "CREATED") {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              alertProgress: "NON_ACCEPTED_AND_WARNING",
            },
            { new: true },
          );
        }

        if (alertData.alertProgress === "ACCEPTED") {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              alertProgress: "IS_ACCEPTED_AND_WARNING",
            },
            { new: true },
          );
        }

        if (alertData.alertProgress === "IS_ACCEPTED_AND_WARNING") {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              isEscalated: true,
              alertProgress: "IS_ACCEPTED_AND_ESCALATION",
            },
            { new: true },
          );
          const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
            businessId: alertData?.businessId,
          });
          if (whatsAppConfig) {
            const managers = await User.find({
              "customRole.businessId": alertData?.businessId,
              "customRole.role": "MANAGER",
            }).lean();

            for (const manager of managers) {
              const res = await axios.post(
                `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
                {
                  messaging_product: "whatsapp",
                  to: manager?.phone?.toString(),
                  type: "template",
                  template: {
                    name: "fi_escalation_template ",
                    language: { code: "en" },
                    components: [
                      {
                        type: "body",
                        parameters: [
                          {
                            type: "text",
                            text: manager?.name,
                          },

                          {
                            type: "text",
                            text: alertData?.serviceIds[0]?.name || "other",
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                },
              );

              if (res.status !== 200) {
                throw new Error("Error sending message");
              }
            }
          }
        }

        if (alertData.alertProgress === "NON_ACCEPTED_AND_WARNING") {
          await HotelAlert.findByIdAndUpdate(
            alertId,
            {
              isEscalated: true,
              alertProgress: "NON_ACCEPTED_AND_ESCALATION",
            },
            { new: true },
          );
          const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
            businessId: alertData?.businessId,
          });
          if (whatsAppConfig) {
            const managers = await User.find({
              "customRole.businessId": alertData?.businessId,
              "customRole.role": "MANAGER",
            }).lean();

            for (const manager of managers) {
              const res = await axios.post(
                `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
                {
                  messaging_product: "whatsapp",
                  to: manager?.phone?.toString(),
                  type: "template",
                  template: {
                    name: "fi_escalation_template ",
                    language: { code: "en" },
                    components: [
                      {
                        type: "body",
                        parameters: [
                          {
                            type: "text",
                            text: manager?.name,
                          },

                          {
                            type: "text",
                            text: alertData?.serviceIds[0]?.name || "other",
                          },
                        ],
                      },
                    ],
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${whatsAppConfig.token}`,
                  },
                },
              );

              if (res.status !== 200) {
                throw new Error("Error sending message");
              }
            }
          }
        }

        const registrationTokens = await DeviceToken.find({
          businessId: businessId,
          userId: { $in: validStaffIds },
          notification: true,
        });
        registrationTokens.map(async (obj) => {
          if (obj.notification) {
            await sendPushNotification(obj.token, roomName, serviceName);
          }
        });
      }
    });
  }
};

const scheduleAlert = (
  intervals: number[],
  businessId: string,
  roomName: string,
  alertId: string,
  serviceName: string,
  validStaffIds: string[],
) => {
  for (const interval of intervals) {
    if (interval > 0) {
      const runTime = new Date(Date.now() + interval * 1000);
      const cronExpression = `${runTime.getSeconds()} ${runTime.getMinutes()} ${runTime.getHours()} ${runTime.getDate()} ${
        runTime.getMonth() + 1
      } *`;

      schedule(cronExpression, async () => {
        const alertData = await HotelAlert.findById(alertId).populate({
          path: "serviceIds",
          select: "name",
        });

        if (alertData?.alertProgress !== "DELIVERED") {
          const registrationTokens = await DeviceToken.find({
            businessId,
            userId: { $in: validStaffIds },
            notification: true,
          });
          for (const obj of registrationTokens) {
            if (obj.notification) {
              await sendPushNotification(obj.token, roomName, serviceName);
            }
          }
        }
      });
    }
  }
};

const hotelAlertRouter = new Hono()
  .get(
    "/fetch_room_alerts",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      // Step 1: Validate Staff and Role
      const staff = await User.findOne(
        { _id: userId, "customRole.businessId": businessId },
        { customRole: 1 },
      ).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRole = staff.customRole?.find(
        (role) => role.businessId.toString() === businessId,
      );

      if (!customRole) {
        return respond(c, "Role not found for this business", true, 404, {});
      }

      const { role, serviceIds } = customRole;

      // Step 2: Get all room IDs assigned to this staff
      const rooms = await HotelRoom.find({
        businessId,
        staffIds: { $in: [userId] },
      })
        .select("_id")
        .lean();

      const roomIds = rooms.map((room) => room._id);

      if (roomIds.length === 0) {
        return respond(
          c,
          "Staff is not assigned to any room in this business",
          true,
          403,
          {},
        );
      }

      // Step 3: Build alert query with both roomId & staffId conditions
      const alertQuery: any = {
        businessId,
        alertProgress: {
          $in: [
            "CREATED",
            "ACCEPTED",
            "IS_ACCEPTED_AND_WARNING",
            "MESSAGE",
            "NON_ACCEPTED_AND_WARNING",
            "IS_ACCEPTED_AND_ESCALATION",
            "NON_ACCEPTED_AND_ESCALATION",
            "NOT_DELIVERED",
          ],
        },

        roomId: { $in: roomIds },
      };

      if (role !== "FRONT_OFFICE") {
        if (!serviceIds || serviceIds.length === 0) {
          return respond(
            c,
            "No assigned services found for this staff",
            true,
            403,
            {},
          );
        }
        alertQuery.serviceIds = { $in: serviceIds };
      }

      // Step 4: Fetch and populate alerts
      const alerts = await HotelAlert.find(alertQuery)
        .populate({ path: "serviceIds", select: "name" })
        .populate({ path: "createdBy", select: "name phone" })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .lean();

      return respond(c, "Alerts fetched successfully", false, 200, alerts);
    },
  )
  .get(
    "/fetch_escalation_alerts",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      const staff = await User.findOne(
        { _id: userId, "customRole.businessId": businessId },
        { customRole: 1 }, // Fetch only required fields
      ).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRole = staff.customRole?.find(
        (role) => role.businessId.toString() === businessId,
      );
      if (!customRole) {
        return respond(c, "Role not found for this business", true, 404, {});
      }

      const { role } = customRole;

      if (role === "MANAGER") {
        const alerts = await HotelAlert.find({
          businessId,
          alertProgress: {
            $in: ["IS_ACCEPTED_AND_ESCALATION", "NON_ACCEPTED_AND_ESCALATION"],
          },
        })
          .populate({ path: "serviceIds", select: "name" })
          .populate({ path: "createdBy", select: "name phone" })
          .populate({ path: "acceptedBy", select: "name phone" })
          .populate({ path: "roomId", select: "name" })
          .lean();
        return respond(c, "Alerts fetched successfully", false, 200, alerts);
      }

      return respond(c, "fetch successfully", false, 200, {});
    },
  )

  .get(
    "/fetch_alert_history",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(2).max(50),
        userId: z.string().min(2).max(50),
      }),
    ),
    async (c) => {
      const { businessId, userId } = c.req.query();

      const staff = await User.findOne(
        { _id: userId, "customRole.businessId": businessId },
        { customRole: 1 },
      ).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRole = staff.customRole?.find(
        (role) => role.businessId.toString() === businessId,
      );
      if (!customRole) {
        return respond(c, "Role not found for this business", true, 404, {});
      }

      const { role, serviceIds } = customRole;

      const alertQuery = {
        businessId,
        alertProgress: "DELIVERED",
      };

      const alerts = await HotelAlert.find(alertQuery)
        .populate({ path: "serviceIds", select: "name" })
        .populate({ path: "createdBy", select: "name phone" })
        .populate({ path: "acceptedBy", select: "name phone" })
        .populate({ path: "deliveredBy", select: "name phone" })
        .populate({ path: "roomId", select: "name" })
        .lean();

      return respond(
        c,
        "Alerts history fetched successfully",
        false,
        200,
        alerts,
      );
    },
  )

  .get(
    "/room_chat",
    zValidator(
      "query",
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
          path: "userId",
          select: "name",
        })
        .populate({
          path: "alertId",
          select: "alertProgress",
          populate: {
            path: "serviceIds",
            select: "name",
          },
        })
        .populate({
          path: "roomChatReplyIds",
          select:
            "description userId date action status roomChatId complainIds",
          populate: {
            path: "userId",
            select: "name",
          },
        });

      return respond(c, "Room chat fetched successfully", false, 200, roomChat);
    },
  )

  .post(
    "/fetch_room_complain",
    zValidator(
      "json",
      z.object({
        complainIds: z.array(z.string().min(1).max(50)),
      }),
    ),
    async (c) => {
      const { complainIds } = await c.req.json();

      const roomChatComplain = await HotelRoomChatComplain.find({
        _id: { $in: complainIds },
      }).populate({
        path: "roomChatComplainReplyIds",
        select: "description date userId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

      return respond(
        c,
        "Room chat complain fetched successfully",
        false,
        200,
        roomChatComplain,
      );
    },
  )

  .post("/create_alert", zValidator("json", hotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      let validStaffIds: string[] = [];
      let serviceData: HotelServiceType = {
        businessId: "",
        name: "",
        availability: false,
        categoryId: "",
        avgCompletionTime: 0,
        avgAcceptanceTime: 0,
        avgDeliveryTime: 0,
        image: "",
      };
      const roomData = await HotelRoom.findOne({
        _id: requestData.roomId,
      });
      if (!roomData) {
        return respond(c, "Room not found", true, 404, {});
      }

      const userData = await User.findById(requestData.userId);
      if (!userData) {
        return respond(c, "User not found", true, 404, {});
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
          throw new Error("Failed to create alert");
        }

        const create = new HotelRoomChat({
          alertId: alert._id,
          userId: requestData.userId,
          authCode: roomData.authCode,
          roomId: roomData._id,
          date: Date.now(),
          description: "Alert created",
          cart: requestData.cart,
        });
        await create.save({ session });

        if (!create) {
          throw new Error("Failed to create room chat");
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
            throw new Error("Failed to create cart");
          }
        }

        serviceData = await HotelService.findById(serviceId).lean();
        const avgCompletionTime = serviceData?.avgCompletionTime || 0;
        const avgAcceptanceTime = serviceData?.avgAcceptanceTime || 0;
        const avgDeliveryTime = serviceData?.avgDeliveryTime || 0;

        const validStaff = await User.find({
          _id: { $in: roomData.staffIds },
          businessId: requestData.businessId,
          customRole: {
            $elemMatch: {
              serviceIds: { $in: [serviceId] },
            },
          },
        })
          .select("_id")
          .lean();
        if (!validStaff.length) {
          return respond(
            c,
            "No valid staff found for this room and service",
            true,
            400,
            {},
          );
        }
        validStaffIds = validStaff.map((u) => u._id);
        const matchedStaff = await User.find({
          _id: { $in: roomData.staffIds },
          customRole: {
            $elemMatch: {
              businessId: requestData.businessId,
              serviceIds: { $in: requestData.serviceIds },
            },
          },
        })
          .select("_id")
          .lean();
        const matchedStaffIds = matchedStaff.map((staff) => staff._id);
        if (matchedStaffIds?.length === 0)
          return respond(
            c,
            "No valid staff found for this room and service",
            true,
            400,
            {},
          );
        if (avgCompletionTime > 0) {
          // Schedule updates based on average times
          scheduleAlertUpdate(
            alert._id.toString(),
            avgCompletionTime,
            requestData.businessId,
            roomData.name,
            serviceData?.name,
            validStaffIds,
          );

          scheduleAlertUpdate(
            alert._id.toString(),
            avgAcceptanceTime,
            requestData.businessId,
            roomData.name,
            serviceData?.name,
            validStaffIds,
          );
        }

        scheduleAlert(
          [0, 60],
          requestData.businessId,
          roomData.name,
          alert._id.toString(),
          serviceData?.name,
          validStaffIds,
        );
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
            await sendPushNotification(
              obj.token,
              roomData.name,
              serviceData?.name,
            );
          }
        }),
      );

      return respond(c, "Alert created successfully", false, 201, {});
    });
  })

  .post("/accept_alert", zValidator("json", acceptHotelAlert), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { alertId, userId, action } = requestData as AcceptHotelAlertType;

      const roomChat = await HotelRoomChat.findOne({
        alertId: alertId,
      });

      const alert = await HotelAlert.findById(alertId).populate({
        path: "serviceIds",
        select: "name",
      });

      if (!alert) {
        return respond(c, "Alert not found", true, 404, {});
      }

      const captainData = await User.findById(userId);

      if (!captainData) {
        return respond(c, "User not found", true, 404, {});
      }

      const userData = await User.findById(alert.userId);
      if (!userData) {
        return respond(c, "User not found", true, 404, {});
      }

      const businessData = await Business.findById(alert.businessId);
      if (!businessData) {
        return respond(c, "Business not found", true, 404, {});
      }

      const roomData = await HotelRoom.findById(alert.roomId);

      if (!roomData) {
        return respond(c, "Room not found", true, 404, {});
      }

      const validTransitions: Record<string, string[]> = {
        ACCEPTED: [
          "CREATED",
          "NON_ACCEPTED_AND_WARNING",
          "NON_ACCEPTED_AND_ESCALATION",
        ],
        DELIVERED: [
          "ACCEPTED",
          "IS_ACCEPTED_AND_WARNING",
          "IS_ACCEPTED_AND_ESCALATION",
        ],
        REJECTED: [
          "CREATED",
          "NON_ACCEPTED_AND_WARNING",
          "NON_ACCEPTED_AND_ESCALATION",
        ],
        RESOLVED: ["NOT_DELIVERED"],
      };

      const updateFields: Record<string, object> = {
        ACCEPTED: {
          alertProgress: "ACCEPTED",
          acceptedAt: Date.now(),
          acceptedBy: userId,
        },
        DELIVERED: {
          alertProgress: "DELIVERED",
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
        REJECTED: {
          alertProgress: "REJECTED",
          rejectedAt: Date.now(),
          rejectedBy: userId,
        },
        RESOLVED: {
          alertProgress: "DELIVERED",
          deliveredAt: Date.now(),
          deliveredBy: userId,
        },
      };

      if (!validTransitions[action]) {
        return respond(c, "Invalid action", true, 400, {});
      }

      if (!validTransitions[action].includes(alert.alertProgress)) {
        return respond(
          c,
          `Cannot mark alert as ${action} because it is in ${alert.alertProgress} state.`,
          true,
          400,
          {},
        );
      }

      const updatedAlert = await HotelAlert.findByIdAndUpdate(
        alertId,
        updateFields[action],
        { session, new: true },
      );

      if (!updatedAlert) {
        throw new Error("Failed to update alert");
      }

      if (action === "ACCEPTED") {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });

        if (!roomChat) {
          throw new Error("Room chat not found");
        }

        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: "In Progress",
          roomChatId: roomChat._id,
          userId: userId,
          status: "NORMAL",
          date: Date.now(),
        });

        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error("Failed to create room chat reply");
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );
      }
      if (action === "DELIVERED") {
        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });
        if (!roomChat) {
          throw new Error("Room chat not found");
        }

        const roomChatReply = new HotelRoomChatReply({
          action: true,
          description: "Delivered",
          roomChatId: roomChat._id,
          userId: userId,
          status: "NORMAL",
          date: Date.now(),
        });

        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error("Failed to create room chat reply");
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
          const outletInfo = await OutLetInfo.findOne({
            businessId: alert.businessId,
          });

          const res = await axios.post(
            `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
            {
              messaging_product: "whatsapp",
              to: userData?.phone?.toString(),
              type: "template",
              template: {
                name: "fi_delivered_template",
                language: { code: "en" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: userData?.name,
                      },

                      {
                        type: "text",
                        text: alert?.serviceIds[0]?.name || "other",
                      },

                      {
                        type: "text",
                        text: roomData?.name,
                      },
                      {
                        type: "text",
                        text: captainData?.name,
                      },
                      {
                        type: "text",
                        text: `https://hipalz.com/${businessData.customLink}/hotel/chat?room=${roomData.name}&id=${userData._id}`,
                      },
                      {
                        type: "text",
                        text: `${outletInfo?.placeUrl}`,
                      },
                    ],
                  },
                ],
              },
            },
            {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            },
          );

          if (res.status !== 200) {
            throw new Error("Error sending message");
          }
        }
      }

      if (action === "RESOLVED") {
        const roomChatComplainId = alert.roomChatComplainId;

        if (!roomChatComplainId) {
          throw new Error("Room chat complain ID not found");
        }

        const roomChat = await HotelRoomChat.findOne({
          alertId: alertId,
        });

        if (!roomChat) {
          throw new Error("Room chat not found");
        }

        const roomChatReply =
          await HotelRoomChatComplain.findById(roomChatComplainId);

        if (!roomChatReply) {
          throw new Error("Room chat reply not found");
        }

        const newChatReply = new HotelRoomChatReply({
          description: `your service ${alert?.serviceIds[0]?.name} is resolved`,
          roomChatId: roomChat._id,
          userId: roomChatReply.userId,
          action: true,
          status: "WARNING",
          date: Date.now(),
        });
        await newChatReply.save({ session });

        if (!newChatReply) {
          throw new Error("Failed to create new room chat reply");
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat._id,
          { $addToSet: { roomChatReplyIds: newChatReply._id } },
          { session },
        );
        const whatsAppConfig = await WhatsAppBusinessConfig.findOne({
          businessId: alert.businessId,
        });

        if (whatsAppConfig) {
          const outletInfo = await OutLetInfo.findOne({
            businessId: alert.businessId,
          });

          const res = await axios.post(
            `${whatsAppApiBaseUrl.BASE_URL}${whatsAppConfig?.version}/${whatsAppConfig?.phoneId}/messages`,
            {
              messaging_product: "whatsapp",
              to: userData?.phone?.toString(),
              type: "template",
              template: {
                name: "f_delivered_template",
                language: { code: "en" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: userData?.name,
                      },

                      {
                        type: "text",
                        text: alert?.serviceIds[0]?.name || "other",
                      },

                      {
                        type: "text",
                        text: roomData?.name,
                      },
                      {
                        type: "text",
                        text: captainData?.name,
                      },
                      {
                        type: "text",
                        text: `https://hipal-test.hipalz.com/${businessData.customLink}/hotel/chat?room=${roomData.name}&id=${userData._id}`,
                      },
                      {
                        type: "text",
                        text: `${outletInfo?.placeUrl}`,
                      },
                    ],
                  },
                ],
              },
            },
            {
              headers: {
                Authorization: `Bearer ${whatsAppConfig.token}`,
              },
            },
          );

          if (res.status !== 200) {
            throw new Error("Error sending message");
          }
        }
      }
      if (action === "REJECTED") {
        const roomChatReply = new HotelRoomChatReply({
          action: false,
          description: "your cart is rejected",
          roomChatId: roomChat?._id,
          userId: alert.userId,
          status: "NORMAL",
          date: Date.now(),
        });

        await roomChatReply.save({ session });

        if (!roomChatReply) {
          throw new Error("Failed to create room chat reply");
        }

        await HotelRoomChat.findByIdAndUpdate(
          roomChat?._id,
          {
            $addToSet: { roomChatReplyIds: roomChatReply._id },
          },
          { session },
        );
      }

      return respond(c, `Alert ${action} successfully`, false, 200, {
        _id: updatedAlert._id,
      });
    });
  })

  .post("/chat_complain", zValidator("json", updateRoomChat), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { roomChatReplyId } = await c.req.json();

      // Retrieve the existing chat reply and its parent room chat
      const roomChatReply = await HotelRoomChatReply.findById(roomChatReplyId);
      if (!roomChatReply) {
        return respond(c, "Room chat reply not found", true, 404, {});
      }

      const roomChat = await HotelRoomChat.findById(roomChatReply.roomChatId);
      if (!roomChat) {
        return respond(c, "Room chat not found", true, 404, {});
      }

      const updatedChatReply = await HotelRoomChatReply.findByIdAndUpdate(
        roomChatReplyId,
        { status: "WARNING" },
        { session, new: true },
      );
      if (!updatedChatReply) {
        throw new Error("Failed to update room chat reply");
      }

      // Create a new chat reply as a response
      const newChatReply = new HotelRoomChatReply({
        action: false,
        description: "we got your complain and we are working on it",
        roomChatId: roomChat._id,
        userId: roomChatReply.userId,
        status: "NORMAL",
        date: Date.now(),
      });
      await newChatReply.save({ session });

      if (!newChatReply) {
        throw new Error("Failed to create new room chat reply");
      }

      await HotelRoomChat.findByIdAndUpdate(
        roomChat._id,
        { $addToSet: { roomChatReplyIds: newChatReply._id } },
        { session },
      );

      // Create a new chat complaint for the existing chat reply
      const newChatComplaint = new HotelRoomChatComplain({
        userId: roomChatReply.userId,
        roomChatReplyId: roomChatReply._id,
        date: Date.now(),
        alertId: roomChat.alertId,
        description: "Room chat complain",
      });
      await newChatComplaint.save({ session });

      // Link the new complaint to the original chat reply
      await HotelRoomChatReply.findByIdAndUpdate(
        roomChatReply._id,
        { $set: { complainIds: newChatComplaint._id } },
        { session },
      );

      const updateAlert = await HotelAlert.findByIdAndUpdate(
        roomChat.alertId,
        {
          alertProgress: "NOT_DELIVERED",
          roomChatComplainId: newChatComplaint._id,
        },
        { session },
      );

      if (!updateAlert) {
        throw new Error("Failed to update alert");
      }

      return respond(c, "Room chat complain created successfully", false, 200, {
        _id: newChatComplaint._id,
      });
    });
  })

  .put("/edit_alert_cart", zValidator("json", updateAlertCart), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { alertId, cart } = requestData as UpdateAlertCartType;

      const alert = await HotelAlert.findById(alertId);

      const roomChat = await HotelRoomChat.findOne({
        alertId: alertId,
      });
      if (!roomChat) {
        return respond(c, "Room chat not found", true, 404, {});
      }

      if (!alert) {
        return respond(c, "Alert not found", true, 404, {});
      }

      const updatedAlert = await HotelAlert.findByIdAndUpdate(
        alertId,
        { cart: cart },
        { session, new: true },
      );

      if (!updatedAlert) {
        throw new Error("Failed to update alert");
      }

      const updateRoomChat = await HotelRoomChat.findOneAndUpdate(
        { alertId: alertId },
        { cart: cart },
        { session, new: true },
      );
      if (!updateRoomChat) {
        throw new Error("Failed to update room chat");
      }

      const roomChatReply = new HotelRoomChatReply({
        action: false,
        description: "your cart is updated",
        roomChatId: roomChat._id,
        userId: alert.userId,
        status: "NORMAL",
        date: Date.now(),
      });

      await roomChatReply.save({ session });

      if (!roomChatReply) {
        throw new Error("Failed to create room chat reply");
      }

      await HotelRoomChat.findByIdAndUpdate(
        roomChat._id,
        {
          $addToSet: { roomChatReplyIds: roomChatReply._id },
        },
        { session },
      );

      return respond(c, "Alert cart updated successfully", false, 200, {
        _id: updatedAlert._id,
      });
    });
  });

export default hotelAlertRouter;
