import { UrlModel, WhatsAppBusinessConfig } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getShortUrl, setShortUrl } from "../../utils/cacheHelper";
//
const hipalzRouter = new Hono()
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

      const Bid = await UrlModel.findOne({
        urlCode,
      }).select("businessId");

      const whatsAppBusinessConfig = await WhatsAppBusinessConfig.findOne({
        businessId: Bid?.businessId,
      });

      const menuRedirection = whatsAppBusinessConfig?.menuRedirection;

      const getUrlFromCache = (await getShortUrl(urlCode)) as string;

      if (getUrlFromCache) {
        return c.redirect(getUrlFromCache);
      }

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

      setShortUrl(urlCode, result.longUrl);

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
        businessId: z.string().min(1).max(500).optional(),
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
          shortUrl: `https://api.hipalz.com/hipalz/${uniqueOrderId}`,
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

export default hipalzRouter;
