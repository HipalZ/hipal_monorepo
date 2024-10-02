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
      const menuBanners = await MenuBanner.find({
        businessId,
        isPublished: true,
        heading: { $ne: "All Hours Delights" },
      }).populate({
        path: "dishIds",
        select: "name price description image",
      });

      const allHoursDelights = await MenuBanner.findOne({
        businessId,
        heading: "All Hours Delights",
      }).populate({
        path: "dishIds",
        select: "name price description image",
      });

      const now = new Date();
      const currentTime =
        now.getHours() * 3600000 +
        now.getMinutes() * 60000 +
        now.getSeconds() * 1000;

      // Filter menuBanners based on current time
      const filteredMenuBanners = menuBanners.filter(
        (banner) =>
          banner.businessId.toString() === businessId &&
          banner.startTime <= currentTime &&
          banner.endTime >= currentTime,
      );

      const convertInSingleObject = filteredMenuBanners?.[0];
      if (convertInSingleObject) {
        // Merge dishIds and avoid duplicates using a Set
        const mergedDishIds = new Set([
          ...convertInSingleObject.dishIds,
          ...(allHoursDelights?.dishIds ?? []),
        ]);

        // Convert the Set back to an array
        convertInSingleObject.dishIds = Array.from(mergedDishIds);
      }

      return c.json(
        {
          message: "Menu banners fetched",
          err: false,
          data: (convertInSingleObject as MenuBannerType) || {},
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
  })
  .post(
    "/bulk/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();
      const requestData = [
        {
          businessId: businessId,
          heading: "Breakfast Must try",
          startTime: 4 * 60 * 60 * 1000,
          endTime: 12 * 60 * 60 * 1000,
          isPublished: true,
          dishIds: [],
        },
        {
          businessId: businessId,
          heading: "Lunchi Munchi",
          startTime: 12 * 60 * 60 * 1000,
          endTime: 17 * 60 * 60 * 1000,
          isPublished: true,
          dishIds: [],
        },
        {
          businessId: businessId,
          heading: "Snacky Evenings",
          startTime: 17 * 60 * 60 * 1000,
          endTime: 21 * 60 * 60 * 1000,
          isPublished: true,
          dishIds: [],
        },
        {
          businessId: businessId,
          heading: "Late Dinners",
          startTime: 21 * 60 * 60 * 1000,
          endTime: 24 * 60 * 60 * 1000,
          isPublished: true,
          dishIds: [],
        },
        {
          businessId: businessId,
          heading: "All Hours Delights",
          startTime: 0,
          endTime: 24 * 60 * 60 * 1000,
          isPublished: true,
          dishIds: [],
        },
      ];

      const ifMenuBannerExists = await MenuBanner.find({
        businessId,
        heading: { $in: requestData.map((data) => data.heading) },
      });

      if (ifMenuBannerExists.length > 0) {
        return c.json(
          {
            message: "Menu banners already exists",
            err: true,
            data: {},
          },
          400,
        );
      }

      const menuBanners = await MenuBanner.insertMany(requestData);

      if (!menuBanners) {
        return c.json(
          {
            message: "Menu banners not created",
            err: true,
            data: {},
          },
          400,
        );
      }

      return c.json(
        {
          message: "Menu banners created",
          err: false,
          data: menuBanners as MenuBannerType[],
        },
        201,
      );
    },
  );

export default menuBannerRouter;
