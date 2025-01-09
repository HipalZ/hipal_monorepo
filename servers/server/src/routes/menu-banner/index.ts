import { MenuBanner } from "@hi/db-models";
import {
  type MenuBannerType,
  menuBannerSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import axios from "axios";
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
      }).lean();

      console.log("menuBanners", menuBanners);

      const allHoursDelights = await MenuBanner.findOne({
        businessId,
        heading: "All Hours Delights",
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
          convertInSingleObject.dishIds.map(
            (dish) => dish._id.toString() || dish.id.toString(),
          ),
        );

        const newDishIds = allHoursDelights.dishIds.filter(
          (dish) =>
            !existingDishIdsSet.has(dish._id.toString() || dish.id.toString()),
        );

        convertInSingleObject.dishIds.push(...newDishIds);
      }

      return c.json(
        {
          message: "Menu banners fetcheds",
          err: false,
          data: convertInSingleObject || {},
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
  .post("/whatsapp/template", async (c) => {
    const body = await c.req.json();
    const token =
      "EAAQk2VVQJsEBOZBP8xHCHCZAvBWeAX1APC5E08Y0PCMCTGemp6OUsJrugkr6nNNYWnnrJcTL18GHoRzRBPuW2L0CGQvkK98djZBCxaAkUxKbH148EOMtYGxvj87NTqPz9TfoyjdVWMp5sKgZBI5tIdI4yvGBtyxsRCY5y81ZBvlYdLQNCaqQQP94ZC5llBP1EtJAZDZD";
    const phoneId = "365941956611521";
    console.log("body", body);

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to: `${body?.phone}`,
          type: "template",
          template: {
            name: "couponz_template",
            language: { code: "en_gb" },
            components: [
              {
                type: "body",
                parameters: [
                  // businessName
                  {
                    type: "text",
                    text: "Rishabh",
                  },
                  {
                    type: "text",
                    text: "14 Oct",
                  },
                  {
                    type: "text",
                    text: "16 Oct",
                  },
                ],
              },
            ],
          },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("response", response);
      return c.json(
        {
          message: "Whatsapp template sent",
          err: false,
          data: response.data,
        },
        200,
      );
    } catch (error) {
      return c.json(
        {
          message: "Whatsapp template not sent",
          err: true,
          data: error,
        },
        400,
      );
    }
  })
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
