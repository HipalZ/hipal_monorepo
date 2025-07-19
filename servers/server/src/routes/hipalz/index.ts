import { Business, UrlModel, WhatsAppBusinessConfig } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const hipalzRouter = new Hono().get(
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
        let linkNumber = urlCode;
        const linkMatch = result.longUrl.match(/link=([^&]+)/);

        if (linkMatch?.[1]) {
          linkNumber = decodeURIComponent(linkMatch[1]);
        }

        const message = `Hi, I'm interested to know coupon, can you share me link-${urlCode}`;
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
);

export default hipalzRouter;
