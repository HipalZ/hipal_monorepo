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
    const baseUrl = result.longUrl;

    if (!q) {
      const whatsAppBusinessConfig = await WhatsAppBusinessConfig.findOne({
        businessId: result?.businessId,
      });

      const menuRedirection = whatsAppBusinessConfig?.menuRedirection;

      const business = await Business.findOne({
        _id: result.businessId,
      });

      if (menuRedirection && menuRedirection === "WA") {
        const redirectUrl = `https://wa.me/${whatsAppBusinessConfig.whatsAppPhone}?text=Hi, ${business?.name}. I'm interested to know coupon, can you share me link:${urlCode}`;

        return c.redirect(`${redirectUrl}`);
      }
    }
    // Redirect to the original UR
    return c.redirect(`${baseUrl} ${q ? `?${q}` : ""}${id ? `&id=${id}` : ""}`);
  },
);

export default hipalzRouter;
