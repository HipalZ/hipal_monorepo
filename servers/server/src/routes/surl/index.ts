import {
  BillUrlModel,
  CheckInQr,
  HotelRoom,
  Table,
  UrlModel,
  WhatsAppBusinessConfig,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
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
      const { q, id, sessionId } = c.req.query();
      const queryParams = c.req.query();

      const shortUrl = `https://api.hipalz.com/surl/${urlCode}`;

      const result = await UrlModel.findOne({ shortUrl: shortUrl });

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
          const tableInfo = await Table.findOne({
            businessId: whatsAppBusinessConfig.businessId,
            tableLink: result.shortUrl,
          });

          const message = `Hi! I’m interested. Could you share more details-${tableInfo?.name}`;
          const redirectUrl = `https://wa.me/${
            whatsAppBusinessConfig.whatsAppPhone
          }?text=${encodeURIComponent(message)}`;

          return c.redirect(redirectUrl);
        }
      }

      let longUrl = result.longUrl;

      try {
        const urlObj = new URL(longUrl);

        // Append all query params except "q"
        for (const [key, value] of Object.entries(queryParams)) {
          if (key !== "q" && value) {
            urlObj.searchParams.set(key, String(value));
          }
        }

        longUrl = urlObj.toString();
      } catch (err) {
        console.error("Invalid longUrl in DB:", longUrl, err);
        return c.json({ message: "Invalid long URL", err: true }, 400);
      }

      return c.redirect(longUrl);
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
      const queryParams = c.req.query();
      const result = await UrlModel.findOne({ urlCode });
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
          const urlModelData = await UrlModel.findOne({
            urlCode: urlCode,
          });

          const checkInQrInfo = await CheckInQr.findOne({
            businessId: whatsAppBusinessConfig.businessId,
            downloadLink: urlModelData?.shortUrl,
          });

          const message = `Hi, I have checked in via QR-${checkInQrInfo?.name}`;
          const redirectUrl = `https://wa.me/${
            whatsAppBusinessConfig.whatsAppPhone
          }?text=${encodeURIComponent(message)}`;

          return c.redirect(redirectUrl);
        }
      }
      let longUrl = result.longUrl;

      try {
        const urlObj = new URL(longUrl);

        // Append all query params except "q"
        for (const [key, value] of Object.entries(queryParams)) {
          if (key !== "q" && value) {
            urlObj.searchParams.set(key, String(value));
          }
        }

        longUrl = urlObj.toString();
      } catch (err) {
        console.error("Invalid longUrl in DB:", longUrl, err);
        return c.json({ message: "Invalid long URL", err: true }, 400);
      }

      return c.redirect(longUrl);
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
      const queryParams = c.req.query();
      const result = await UrlModel.findOne({ urlCode });

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
          const urlModelData = await UrlModel.findOne({
            urlCode: urlCode,
          });

          const roomInfo = await HotelRoom.findOne({
            businessId: whatsAppBusinessConfig.businessId,
            downLoadLink: urlModelData?.shortUrl,
          });

          const message = `Hi, I'm interested in your services. Can you share more details? I'm in room-${roomInfo?.name}`;
          const redirectUrl = `https://wa.me/${
            whatsAppBusinessConfig.whatsAppPhone
          }?text=${encodeURIComponent(message)}`;

          return c.redirect(redirectUrl);
        }
      }
      let longUrl = result.longUrl;

      try {
        const urlObj = new URL(longUrl);

        // Append all query params except "q"
        for (const [key, value] of Object.entries(queryParams)) {
          if (key !== "q" && value) {
            urlObj.searchParams.set(key, String(value));
          }
        }

        longUrl = urlObj.toString();
      } catch (err) {
        console.error("Invalid longUrl in DB:", longUrl, err);
        return c.json({ message: "Invalid long URL", err: true }, 400);
      }

      return c.redirect(longUrl);
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
