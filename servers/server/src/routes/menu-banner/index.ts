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
      })
        .populate({
          path: "dishIds",
          select: "name price description images portions dishTypes",
          populate: {
            path: "addOnIds", // populate addOnIds within dishIds
          },
        })
        .lean();

      const allHoursDelights = await MenuBanner.findOne({
        businessId,
        heading: "All Hours Delights",
      }).populate({
        path: "dishIds",
        select: "name price description images portions dishTypes",
        populate: {
          path: "addOnIds", // populate addOnIds within dishIds
        },
      });

      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istTime = new Date(now.getTime() + istOffset);
      const currentTime =
        istTime.getHours() * 3600000 +
        istTime.getMinutes() * 60000 +
        istTime.getSeconds() * 1000;

      // Filter menuBanners based on current times
      const filteredMenuBanners = menuBanners.filter(
        (banner) =>
          (banner.businessId.toString() === businessId &&
            banner?.startTime <= currentTime &&
            banner?.endTime) >= currentTime,
      );

      const convertInSingleObject = filteredMenuBanners?.[0];

      if (convertInSingleObject && allHoursDelights?.dishIds) {
        const existingDishIdsSet = new Set(
          convertInSingleObject.dishIds.map((dish) => dish._id.toString()),
        );

        const newDishIds = allHoursDelights.dishIds.filter(
          (dish) => !existingDishIdsSet.has(dish._id.toString()),
        );

        convertInSingleObject.dishIds.push(...newDishIds);
      }

      return c.json(
        {
          message: "Menu banners fetcheds",
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
  .get(
    "/all/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();

      const menuBanner = await MenuBanner.find({
        businessId,
      });

      return c.json(
        {
          message: "Menu banner fetched",
          err: false,
          data: menuBanner as MenuBannerType[],
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
  )
  .post("/saveBanner", zValidator("json", menuBannerSchema), async (c) => {
    const requestData = await c.req.json();

    const alreadyExists = await MenuBanner.findOne({
      businessId: requestData.businessId,
      heading: requestData.heading,
    });

    if (alreadyExists) {
      return c.json(
        {
          message: "Menu banner already exists",
          err: true,
          data: {},
        },
        400,
      );
    }
    const menuBanner = new MenuBanner(requestData);
    const savedMenuBanner = await menuBanner.save();
    return c.json(
      {
        message: "Menu banner saved",
        err: false,
        data: savedMenuBanner as MenuBannerType,
      },
      201,
    );
  });

export default menuBannerRouter;
