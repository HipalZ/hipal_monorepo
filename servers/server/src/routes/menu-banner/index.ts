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
    "/explore/:businessId",
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
      console.log("convertInSingleObject", convertInSingleObject);
      if (convertInSingleObject) {
        // Merge dishIds and avoid duplicates using a Set
        const mergedDishIds = new Set([
          ...convertInSingleObject.dishIds,
          ...(allHoursDelights?.dishIds ?? []),
        ]);

        const arra = Array.from(mergedDishIds);

        const mergedDishIdsMap = new Map(
          arra.map((dish) => [dish._id.toString(), dish]),
        );
        const mergedDishIdsSet = new Set([
          ...convertInSingleObject.dishIds.map((id) => id.toString()),
          ...(allHoursDelights?.dishIds.map((id) => id.toString()) ?? []),
        ]);
        // Convert the Set back to an array
        convertInSingleObject.dishIds = Array.from(mergedDishIdsSet).map((id) =>
          mergedDishIdsMap.get(id),
        );
      }

      console.log("convertInSingleObject", convertInSingleObject);

      return c.json(
        {
          message: "Menu banners fetched",
          err: false,
          data: convertInSingleObject,
        },
        200,
      );
    },
  )
  .get(
    "/:bannerId",
    zValidator("param", z.object({ bannerId: z.string() })),
    async (c) => {
      const { bannerId } = c.req.param();

      const menuBanner = await MenuBanner.findById(bannerId);

      if (!menuBanner) {
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
          message: "Menu banner fetched",
          err: false,
          data: menuBanner as MenuBannerType,
        },
        200,
      );
    },
  )

  .put(
    "/:bannerId",
    zValidator("json", menuBannerSchema.partial()),
    async (c) => {
      const requestData = await c.req.json();
      const { bannerId } = c.req.param();
      const { heading, isPublished, dishIds } = requestData;

      const menuBanner = await MenuBanner.findByIdAndUpdate(
        bannerId,
        { heading, isPublished, dishIds },
        { new: true },
      );

      if (!menuBanner) {
        return c.json(
          {
            message: "Menu banner not updated",
            err: true,
            data: {},
          },
          400,
        );
      }

      return c.json(
        {
          message: "Menu banner updated",
          err: false,
          data: menuBanner as MenuBannerType,
        },
        200,
      );
    },
  )

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
