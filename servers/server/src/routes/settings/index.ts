// books.ts
import { Banner, BusinessSettings } from "@hi/db-models";
import {
  BusinessSettingsSchema,
  bannerSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const settingsRouter = new Hono()
  // .get(
  //   '/',

  //   zValidator('query', paramsSchema),
  //   async (c) => {
  //     console.log('settingsRouter');
  //     const { businessId } = c.req.query();
  //     const existingSettings = await Settings.find({
  //       businessId,
  //     }).populate('explore.popular');
  //     return respond(c, 'Settings fetched successfully', false, 200, existingSettings);
  //   },
  // )
  .post(
    "/banner",

    zValidator("json", bannerSchema),

    async (c) => {
      const requestData = await c.req.json();
      const createBanner = await Banner.create(requestData);
      if (!createBanner)
        return respond(c, "Error in creating banner", true, 400, {});
      return respond(
        c,
        "Banner created successfully",
        false,
        201,
        createBanner,
      );
    },
  )
  .post(
    "/",

    zValidator("json", BusinessSettingsSchema),

    async (c) => {
      const requestData = await c.req.json();
      const existingSetting = await BusinessSettings.findOne({
        businessId: requestData.businessId,
      });
      if (existingSetting)
        return respond(c, "Setting already exists", true, 409, {});
      const createSetting = await BusinessSettings.create(requestData);
      if (!createSetting)
        return respond(c, "Error in creating setting", true, 400, {});
      return respond(
        c,
        "Setting created successfully",
        false,
        201,
        createSetting,
      );
    },
  )
  .put(
    "/update/:settingsId",

    zValidator("json", BusinessSettingsSchema.partial()),
    zValidator("param", z.object({ settingsId: z.string() })),

    async (c) => {
      const requestData = await c.req.json();
      const { settingsId } = c.req.param();
      const updateSetting = await BusinessSettings.findByIdAndUpdate(
        settingsId,
        requestData,
        { new: true },
      );
      if (!updateSetting)
        return respond(c, "Error in updating setting", true, 400, {});
      return respond(
        c,
        "Setting updated successfully",
        false,
        200,
        updateSetting,
      );
    },
  )
  .get(
    "/:businessId",

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();
      const existingSetting = await BusinessSettings.findOne({ businessId });
      if (!existingSetting)
        return respond(c, "Setting not found", true, 404, {});
      return respond(
        c,
        "Setting fetched successfully",
        false,
        200,
        existingSetting,
      );
    },
  )

  .put(
    "/banner/:bannerId",

    zValidator("json", bannerSchema.partial()),
    zValidator("param", z.object({ bannerId: z.string() })),

    async (c) => {
      const requestData = await c.req.json();
      const { bannerId } = c.req.param();
      const updateBanner = await Banner.findByIdAndUpdate(
        bannerId,
        requestData,
        { new: true },
      );
      if (!updateBanner)
        return respond(c, "Error in updating banner", true, 400, {});
      return respond(
        c,
        "Banner updated successfully",
        false,
        200,
        updateBanner,
      );
    },
  )
  .get(
    "/banner/:bannerId",

    zValidator("param", z.object({ bannerId: z.string() })),

    async (c) => {
      const { bannerId } = c.req.param();
      const existingBanner = await Banner.findById(bannerId);
      if (!existingBanner) return respond(c, "Banner not found", true, 404, {});
      return respond(
        c,
        "Banner fetched successfully",
        false,
        200,
        existingBanner,
      );
    },
  )
  .get(
    "/banners/:businessId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();
      const existingBanners = await Banner.find({
        businessId,
      });
      return respond(
        c,
        "Banners fetched successfully",
        false,
        200,
        existingBanners,
      );
    },
  );

export default settingsRouter;
