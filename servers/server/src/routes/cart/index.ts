import { Cart, DeviceToken } from "@hi/db-models";
import { cartSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
const admin = require("firebase-admin");
//
const cartRouter = new Hono()
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const cart = await Cart.findById(id);
      if (!cart) {
        return respond(c, "cart not found", true, 404, {});
      }
      return respond(c, "cart retrieved successfully", false, 200, cart);
    },
  )
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();

      const carts = await Cart.find({ businessId }).populate({
        path: "userId",
        select: "name phone",
      });

      return respond(c, "carts retrieved successfully", false, 200, carts);
    },
  )
  .post(
    "/create",
    zValidator("json", cartSchema),

    async (c) => {
      const body = await c.req.json();
      const createCart = await Cart.create({
        ...body,
        date: Date.now(),
        createdAt: Date.now(),
      });
      if (!createCart) {
        return respond(c, "cart creation failed", true, 400, {});
      }
      const registrationToken = await DeviceToken.find({
        businessId: body.businessId,
      });

      if (registrationToken.length > 0) {
        for (const obj of registrationToken) {
          if (obj.notification) {
            const pushMessage = {
              token: obj.token,
              notification: {
                title: "Please accept the order !!",
                body: `T${body.tableName?.slice(-2)} `,
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
                console.log("Successfully sent message:", response);
                return c.json({
                  message: "FCM message sent successfully",
                  err: false,
                  data: response,
                });
              })
              .catch((err: Error) => {
                console.log("Error sending FCM message:", err);
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

      return respond(c, "cart created successfully", false, 201, {
        cartID: createCart._id,
      });
    },
  )
  .delete(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const deletedCart = await Cart.findByIdAndDelete(id);

      if (!deletedCart) {
        return respond(c, "cart not found or already deleted", true, 404, {});
      }

      return respond(c, "cart deleted successfully", false, 200, {
        cartID: deletedCart._id,
      });
    },
  );

export default cartRouter;
