import {
  BillUrlModel,
  QrBill,
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

      // Redirect to the original URL
      return c.redirect(result.longUrl);
    },
  )

  .get(
    "/bill_short_url/bill",
    zValidator(
      "query",
      z.object({
        urlCode: z.string().min(1).max(500),
      }),
    ),
    async (c) => {
      const { urlCode } = c.req.query();

      console.log("aara", urlCode);

      const result = await BillUrlModel.findOne({ urlCode });

      console.log("result", result);
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

      const billInfo = await QrBill.findOne({
        requestBillId: orderId,
      });

      if (!billInfo) {
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
        data: billInfo,
      });
    },
  );

export default surlRouter;
