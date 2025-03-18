import {
  Business,
  DeviceToken,
  Payment,
  Subscriber,
  UserReward,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const admin = require("firebase-admin");

const iconRouter = new Hono()
  .get(
    "/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const iconWithCategories = [
        {
          categoryName: "sandwiches",
          iconUrls: ["https://assets.hipalz.com/Sandwiches/sandwiche(1).png"],
        },
        {
          categoryName: "burgers",
          iconUrls: [
            "https://assets.hipalz.com/Burgers/Burger1.png",

            "https://assets.hipalz.com/Burgers/Burger%20%20(1).png",

            "https://assets.hipalz.com/Burgers/Burger2.png",

            "https://assets.hipalz.com/Burgers/Burger3.png",
          ],
        },
        {
          categoryName: "pizzas",
          iconUrls: ["https://assets.hipalz.com/Pizza/Pizza.png"],
        },
        {
          categoryName: "Bowls",
          iconUrls: ["https://assets.hipalz.com/Bowls/Bowl.png"],
        },
        {
          categoryName: "milkshakes",
          iconUrls: ["https://assets.hipalz.com/Milkshakes/Milkshakes.png"],
        },
        {
          categoryName: "alcohol",
          iconUrls: ["https://assets.hipalz.com/Alcohol/alcohol.png"],
        },
        {
          categoryName: "cakes",
          iconUrls: ["https://assets.hipalz.com/Cakes/cake.png"],
        },
        {
          categoryName: "icecream",
          iconUrls: ["https://assets.hipalz.com/Icecream/Ice%20Cream.png"],
        },
        {
          categoryName: "seafood",
          icons: ["https://assets.hipalz.com/SeaFood/25%20Seafood%20(1).png"],
        },
      ];

      return c.json({
        businessId,
        iconWithCategories,
      });
    },
  )

  .get(
    "/loyalty/data",

    async (c) => {
      const businesses = await Business.find({
        status: true,
      });

      const ans = [];

      for (const business of businesses) {
        const userRewards = await UserReward.find({
          loyaltyId: business._id,
        }).count();

        const totalSessions = await Subscriber.find({
          businessId: business._id,
        }).count();

        let totalCoinsIssued = 0;
        let totalCoinsRedeemed = 0;

        const payment = await Payment.find({
          businessId: business._id,
          earnCoins: { $gt: 0 },
        });
        const payme = await Payment.find({
          businessId: business._id,
          claimedCoins: { $gt: 0 },
        });

        for (const pay of payment) {
          totalCoinsIssued += pay?.earnCoins || 0;
        }

        for (const pay of payme) {
          totalCoinsRedeemed += pay?.claimedCoins || 0;
        }

        ans.push({
          businessId: business.name,
          totalCoinIssuedUsers: userRewards,
          totalSessions,
          totalCoinsIssued,
          totalCoinsRedeemed,
        });
      }

      return c.json({
        ans,
      });
    },
  )

  .get(
    "/send_update/app",

    async (c) => {
      const registrationToken = await DeviceToken.find({});

      if (registrationToken.length > 0) {
        for (const obj of registrationToken) {
          if (obj.notification) {
            const pushMessage = {
              token: obj.token, // or use 'topic' if you're sending to a topic
              notification: {
                title: "New Update Available",
                body: `Click here to download: <a href='https://google.com'>Download</a>`,
              },
              android: {
                notification: {
                  channel_id: "custom_channel_id",
                  sound: "order",
                },
              },
            };

            admin
              .messaging()
              .send(pushMessage)
              .then((response: unknown) => {
                return c.json({
                  message: "FCM message sent successfully",
                  err: false,
                  data: response,
                });
              })
              .catch((err: Error) => {
                return c.json(
                  {
                    message: "Error sending FCM message",
                    err: true,
                    data: {},
                  },
                  400,
                );
              });
          }
        }
      }

      return c.json(
        {
          message: "send_update/app",
          err: true,
          data: {},
        },
        200,
      );
    },
  );

export default iconRouter;
