import { MenuBanner } from "@hi/db-models";
import {
  type MenuBannerType,
  menuBannerSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
const menuBannerRouter = new Hono()
  .get(
    "/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();

      const menuBanners = await MenuBanner.findOne({
        businessId: businessId,
      }).populate({
        path: "dishIds",
        select: "name price images description",
      });

      if (!menuBanners) {
        return c.json(
          {
            message: "Menu banner not found",
            err: true,
            data: {},
          },
          404,
        );
      }

      return c.json(
        {
          message: "Menu banner found",
          err: false,
          data: menuBanners as MenuBannerType,
        },
        200,
      );
    },
  )
  .post("/", zValidator("json", menuBannerSchema), async (c) => {
    const requestData = await c.req.json();

    const {
      businessId,
      dishIds,
      startTime,
      endTime,
      heading,
      isPublished,
      _id,
    } = requestData;

    await MenuBanner.findOneAndDelete({ _id: _id });

    if (startTime >= endTime) {
      return c.json(
        {
          message: "Start time should be less than end time",
          err: true,
          data: {},
        },
        400,
      );
    }

    const menuBanner = new MenuBanner({
      businessId,
      dishIds,
      startTime: startTime * 60 * 60 * 1000,
      endTime: endTime * 60 * 60 * 1000,
      heading,
      isPublished,
    });

    await menuBanner.save();

    if (!menuBanner) {
      return c.json(
        {
          message: "Menu banner not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "Menu banner created",
        err: false,
        data: menuBanner as MenuBannerType,
      },
      201,
    );
  });

export default menuBannerRouter;
