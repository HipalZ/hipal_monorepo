import { UrlModel } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getShortUrl, setShortUrl } from "../../utils/cacheHelper";
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
);

export default hipalzRouter;
