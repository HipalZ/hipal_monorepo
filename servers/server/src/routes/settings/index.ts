// books.ts
import { Banner, BusinessSettings } from "@hi/db-models";
import {
  BusinessSettingsSchema,
  bannerSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { cache } from "../../utils/cacheHelper";
import { respond } from "../../utils/response";
import { razorpayWrapper } from "./../../utils/razorpay-wrapper";

export interface MerChantDetails {
  businessId: string;
  razorpayMerchantId: string;
  razorpayKeyId: string;
}
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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

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
      if (
        createSetting.razorpayKeyId &&
        createSetting.razorpayKeySecret &&
        createSetting.razorpayMerchantId &&
        createSetting.razorpayWebhookSecret
      ) {
        await razorpayWrapper
          .create(createSetting.razorpayMerchantId)
          .then(() => {
            console.log(
              "Razorpay instance created successfully",
              createSetting.razorpayMerchantId,
            );
          })
          .catch((err) => {
            console.error("Error creating Razorpay instance", err);
          });
      }
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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),
    zValidator("json", BusinessSettingsSchema.partial()),
    zValidator("param", z.object({ settingsId: z.string() })),
    async (c) => {
      try {
        const requestData = await c.req.json();
        const { settingsId } = c.req.param();

        const updateData = {
          registerName: requestData.registerName,
          registerType: requestData.registerType,
          establishmentYear: requestData.establishmentYear,
          panNumber: requestData.panNumber,
          gstNumber: requestData.gstNumber,
          bankName: requestData.bankName,
          accountNumber: requestData.accountNumber,
          ifscCode: requestData.ifscCode,
          branchName: requestData.branchName,
          beneficiaryName: requestData.beneficiaryName,
        };

        const updateSetting = await BusinessSettings.findByIdAndUpdate(
          settingsId,
          updateData,
          { new: true },
        );

        if (!updateSetting) {
          return respond(c, "Error in updating setting", true, 400, {});
        }

        if (
          requestData.razorpayKeyId &&
          requestData.razorpayKeySecret &&
          requestData.razorpayMerchantId &&
          requestData.razorpayWebhookSecret
        ) {
          const deletes = cache.delete(requestData.businessId as string);
          console.log("deletes", deletes);

          await BusinessSettings.findByIdAndUpdate(settingsId, {
            razorpayKeyId: requestData.razorpayKeyId,
            razorpayKeySecret: requestData.razorpayKeySecret,
            razorpayMerchantId: requestData.razorpayMerchantId,
            razorpayWebhookSecret: requestData.razorpayWebhookSecret,
          });

          try {
            await razorpayWrapper.create(requestData.razorpayMerchantId);
            console.log(
              "Razorpay instance created successfully",
              requestData.razorpayMerchantId,
            );
          } catch (err) {
            return respond(
              c,
              "Error in creating Razorpay instance",
              true,
              400,
              {},
            );
          }
        }

        return respond(
          c,
          "Setting updated successfully",
          false,
          200,
          updateSetting,
        );
      } catch (error) {
        return respond(c, "Error in updating setting", true, 500, { error });
      }
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
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

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
    zValidator("query", z.object({ isPublished: z.string().optional() })),
    async (c) => {
      const { businessId } = c.req.param();
      const { isPublished } = c.req.query();
      if (isPublished) {
        const existingBanners = await Banner.find({
          businessId,
          isPublished: true,
        }).sort({ sequence: 1, createdAt: -1 });
        return respond(
          c,
          "Banners fetched successfully",
          false,
          200,
          existingBanners,
        );
      }
      const existingBanners = await Banner.find({
        businessId,
      }).sort({ sequence: 1, createdAt: -1 });
      return respond(
        c,
        "Banners fetched successfully",
        false,
        200,
        existingBanners,
      );
    },
  )
  .delete(
    "/banners/:bannerId",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("param", z.object({ bannerId: z.string() })),

    async (c) => {
      const { bannerId } = c.req.param();
      const existingBanners = await Banner.deleteOne({
        _id: bannerId,
      });
      return respond(
        c,
        "Banners delete successfully",
        false,
        200,
        existingBanners,
      );
    },
  )
  .put(
    "/banners/sequence",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", z.object({ sequenceOfBannerIds: z.array(z.string()) })),

    async (c) => {
      const { sequenceOfBannerIds = [] } = await c.req.json();

      // Update each banner's sequence according to the order in bannerIds
      for (let i = 0; i < sequenceOfBannerIds.length; i++) {
        console.log("sequenceOfBannerIds[i]", sequenceOfBannerIds[i], i);
        await Banner.updateOne(
          { _id: sequenceOfBannerIds[i] },
          { $set: { sequence: i + 1 } },
        );
      }

      return respond(c, "Banners sequence updated successfully", false, 200, {
        updatedBannerIds: sequenceOfBannerIds,
      });
    },
  )
  .get(
    "/:businessId/getMerchantKeySecret",

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      let merchant: MerChantDetails | null = (await cache.get(
        businessId as string,
      )) as MerChantDetails;
      if (!merchant) {
        console.log("from db");
        merchant = await BusinessSettings.findOne({
          businessId,
        })
          .select("razorpayMerchantId razorpayKeyId businessId")
          .lean();
        await cache.set(businessId as string, merchant as MerChantDetails);
      }

      console.log("form cache", merchant);
      if (businessId === "66a8032dd1afb0385308ba86") {
        merchant = {
          businessId: "66a8032dd1afb0385308ba86",
          razorpayMerchantId: "OnqWcKffL2kgJx",
          razorpayKeyId: "rzp_live_j4TGFR1g1Ah1kv",
        };
      }
      if (businessId === "66e73800539ac167a2ba63a4") {
        merchant = {
          businessId: "66e73800539ac167a2ba63a4",
          razorpayMerchantId: "P7KMwhrfQWAjkg",
          razorpayKeyId: "rzp_live_rgCBLhpnx7kcCO",
        };
      }

      if (businessId === "66b4cf43c88e8035f92d9e50") {
        merchant = {
          businessId: "66b4cf43c88e8035f92d9e50",
          razorpayMerchantId: "P8r2y6iMlbTAn8",
          razorpayKeyId: "rzp_live_CWW534Oc5LX3MV",
        };
      }

      if (businessId === "672eeece780dea11f8652d98") {
        merchant = {
          businessId: "672eeece780dea11f8652d98",
          razorpayMerchantId: "PQGK6Ucj3IyaDP",
          razorpayKeyId: "rzp_live_eozBSuDh3uqEOf",
        };
      }

      if (businessId === "6725fd054e337b714569be47") {
        merchant = {
          businessId: "6725fd054e337b714569be47",
          razorpayMerchantId: "PIkKzYsZdIL6uB",
          razorpayKeyId: "rzp_live_OO7R70qnj9xtwE",
        };
      }

      if (businessId === "673b2fcea221aac4288d6930") {
        merchant = {
          businessId: "673b2fcea221aac4288d6930",
          razorpayMerchantId: "PQidRDZmgNwGfQ",
          razorpayKeyId: "rzp_live_UAeMuc3d2Prq63",
        };
      }

      const razorpayObject = {
        businessId: merchant?.businessId,
        razorpayKeyId: merchant?.razorpayKeyId,
        razorpayMerchantId: merchant?.razorpayMerchantId,
      };

      return respond(
        c,
        "Settings fetched successfully",
        false,
        200,
        razorpayObject,
      );
    },
  )

  .get(
    "/:businessId/getPaltribeMerchantKeySecret",

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const businessId = "66b08937c88e8035f92d2f77";

      let merchant: MerChantDetails | null = (await cache.get(
        businessId as string,
      )) as MerChantDetails;
      if (!merchant) {
        console.log("from db");
        merchant = await BusinessSettings.findOne({
          businessId: "66b08937c88e8035f92d2f77",
        })
          .select("razorpayMerchantId razorpayKeyId businessId")
          .lean();
        await cache.set(businessId as string, merchant as MerChantDetails);
      }

      const razorpayObject = {
        businessId: merchant?.businessId,
        razorpayKeyId: merchant?.razorpayKeyId,
        razorpayMerchantId: merchant?.razorpayMerchantId,
      };

      return respond(
        c,
        "Settings fetched successfully",
        false,
        200,
        razorpayObject,
      );
    },
  )

  .get(
    "/:businessId/getPaltribeMerchantKeySecret",

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      let merchant: MerChantDetails | null = (await cache.get(
        businessId as string,
      )) as MerChantDetails;
      if (!merchant) {
        console.log("from db");
        merchant = await BusinessSettings.findOne({
          businessId,
        })
          .select("razorpayMerchantId razorpayKeyId businessId")
          .lean();
        await cache.set(businessId as string, merchant as MerChantDetails);
      }

      const razorpayObject = {
        businessId: merchant?.businessId,
        razorpayKeyId: merchant?.razorpayKeyId,
        razorpayMerchantId: merchant?.razorpayMerchantId,
      };

      return respond(
        c,
        "Settings fetched successfully",
        false,
        200,
        razorpayObject,
      );
    },
  );

export default settingsRouter;
