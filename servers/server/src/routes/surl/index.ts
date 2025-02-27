import {
  BillUrlModel,
  QrBill,
  UrlModel,
  UserSession,
  WhatsAppBusinessConfig,
} from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getShortUrl, setShortUrl } from "../../utils/cacheHelper";
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

      const Bid = await UrlModel.findOne({
        urlCode,
      }).select("businessId");

      const whatsAppBusinessConfig = await WhatsAppBusinessConfig.findOne({
        businessId: Bid?.businessId,
      });

      const menuRedirection = whatsAppBusinessConfig?.menuRedirection;

      if (menuRedirection && menuRedirection === "WA") {
        const redirectUrl = `https://wa.me/${whatsAppBusinessConfig.whatsAppPhone}?text=Hi, I'm interested in your menu. Could you share more details? I am sitting at T-${urlCode}`;

        return c.redirect(redirectUrl);
      }

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
          shortUrl: `https://api.test.hipalz.com/surl/${uniqueOrderId}`,
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
  )
  .get(
    "/get_table_data/:orderId",
    zValidator(
      "param",
      z.object({
        orderId: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { orderId } = c.req.param();

      const userSession = await UserSession.findOne({ requestBillId: orderId });

      const updateBill = await QrBill.findOneAndUpdate(
        { requestBillId: orderId },
        {
          total: userSession?.finalTotal,
          tax: userSession?.finalTax.toFixed(2),
          subTotal: userSession?.intialSubTotal,
          tips: userSession?.tips,
          claimedCoins: userSession?.claimedCoins,
          couponId: userSession?.couponId,
        },
        { new: true },
      );

      if (!updateBill) {
        return c.json(
          {
            message: "Bill not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json({
        message: "Bill found",
        err: false,
        data: updateBill,
      });
    },
  );

export default surlRouter;
