import { BillUrlModel, UrlModel, WhatsAppBusinessConfig } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { z } from "zod";
import { setShortUrl } from "../../utils/cacheHelper";
//
const surlRouter = new Hono()
  .get(
    "/:urlCode",
    zValidator(
      "param",
      z.object({
        urlCode: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { urlCode } = c.req.param();
      const { q, id } = c.req.query();

      const result = await UrlModel.findOne({ urlCode }).select(
        "businessId longUrl",
      );

      if (!result) {
        return c.json(
          {
            message: "URL not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      if (!q) {
        const whatsAppBusinessConfig = await WhatsAppBusinessConfig.findOne({
          businessId: result.businessId,
        });

        if (whatsAppBusinessConfig?.menuRedirection === "WA") {
          let tableNumber = urlCode;
          const tableMatch = result.longUrl.match(/tableName=([^&]+)/);

          if (tableMatch?.[1]) {
            tableNumber = decodeURIComponent(tableMatch[1]);
          }
          const message = `Hi! I’m interested. Could you share more details-${tableNumber}`;
          const redirectUrl = `https://wa.me/${
            whatsAppBusinessConfig.whatsAppPhone
          }?text=${encodeURIComponent(message)}`;

          return c.redirect(redirectUrl);
        }
      }

      setShortUrl(urlCode, result.longUrl);

      if (id) {
        const getToken = getCookie(c, "token");

        if (getToken) {
          try {
            const decoded = jwt.verify(
              getToken,
              Bun.env.JWT_SECRET as string,
            ) as { id: string; role: string };

            if (decoded.id !== id) {
              return c.json(
                {
                  message: "please scan the QR code again",
                  err: true,
                  data: {},
                },
                400,
              );
            }
          } catch {
            return c.json(
              {
                message: "Invalid token",
                err: true,
                data: {},
              },
              401,
            );
          }
        }

        const token = jwt.sign(
          {
            id: id,
            role: "HIPAL_CUSTOMER",
          },
          Bun.env.JWT_SECRET as string,
        );

        setCookie(c, "token", token, {
          httpOnly: false,
          secure: false,
        });
      }

      return c.redirect(`${result.longUrl}${id ? `&id=${id}` : ""}`);
    },
  )

  .get(
    "/check_in/:urlCode",
    zValidator(
      "param",
      z.object({
        urlCode: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { urlCode } = c.req.param();
      const { q } = c.req.query();
      const result = await UrlModel.findOne({ urlCode }).select(
        "businessId longUrl",
      );
      if (!result) {
        return c.json(
          {
            message: "URL not found",
            err: true,
            data: {},
          },
          404,
        );
      }
      if (!q) {
        const whatsAppBusinessConfig = await WhatsAppBusinessConfig.findOne({
          businessId: result.businessId,
        });

        if (whatsAppBusinessConfig?.menuRedirection === "WA") {
          let tableNumber = urlCode;

          const message = `Hi, I have ve checked in via QR-${tableNumber}`;
          const redirectUrl = `https://wa.me/${
            whatsAppBusinessConfig.whatsAppPhone
          }?text=${encodeURIComponent(message)}`;

          return c.redirect(redirectUrl);
        }
      }
      // Redirect to the original URL
      return c.redirect(result.longUrl);
    },
  )

  .get(
    "/r/:urlCode",
    zValidator(
      "param",
      z.object({
        urlCode: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { urlCode } = c.req.param();
      const { q, id } = c.req.query();
      const result = await UrlModel.findOne({ urlCode }).select(
        "businessId longUrl",
      );

      if (!result) {
        return c.json(
          {
            message: "URL not found",
            err: true,
            data: {},
          },
          404,
        );
      }
      if (!q) {
        const whatsAppBusinessConfig = await WhatsAppBusinessConfig.findOne({
          businessId: result.businessId,
        });
        if (whatsAppBusinessConfig?.menuRedirection === "WA") {
          let roomNumber = urlCode;
          const tableMatch = result.longUrl.match(/room=([^&]+)/);

          if (tableMatch?.[1]) {
            roomNumber = decodeURIComponent(tableMatch[1]);
          }

          const message = `Hi, I'm interested in your services. Can you share more details? I'm in room-${roomNumber}`;
          const redirectUrl = `https://wa.me/${
            whatsAppBusinessConfig.whatsAppPhone
          }?text=${encodeURIComponent(message)}`;

          return c.redirect(redirectUrl);
        }
      }

      // Redirect to the original URL
      return c.redirect(
        `${result.longUrl} ${q ? `?${q}` : ""}${id ? `&id=${id}` : ""}`,
      );
    },
  )

  .get(
    "/c/b",
    zValidator(
      "query",
      z.object({
        urlCode: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { urlCode } = c.req.query();

      const result = await BillUrlModel.findOne({
        urlCode: urlCode.slice(0, 5),
      });

      if (!result) {
        return c.json(
          {
            message: "URL not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      // Redirect to the original URL
      return c.redirect(result.longUrl);
    },
  )
  .post(
    "/create_short_url",
    zValidator(
      "json",
      z.object({
        longUrl: z.string().url().min(1).max(500),
        businessId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      // Get the shortId from the URL
      const { longUrl, businessId } = await c.req.json();

      const uniqueOrderId = nanoid(5);
      const findLongUrl = await UrlModel.findOne({ longUrl });

      if (!findLongUrl) {
        const createShortUrl = await UrlModel.create({
          longUrl: longUrl,
          shortUrl: `https://api.hipalz.com/surl/${uniqueOrderId}`,
          urlCode: uniqueOrderId,
          businessId: businessId,
        });

        setShortUrl(uniqueOrderId, longUrl);

        return c.json(
          {
            message: "Short URL created",
            err: false,
            data: createShortUrl,
          },
          201,
        );
      }

      return c.json(
        {
          message: "Short URL already exists",
          err: true,
          data: findLongUrl,
        },
        200,
      );
    },
  );

export default surlRouter;
