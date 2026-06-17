// books.ts
import {
  Banner,
  BusinessSettings,
  OutLetInfo,
  TermAndCondition,
} from "@hi/db-models";
import {
  BusinessSettingsSchema,
  bannerSchema,
  termsAndConditionSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { pushToken } from "../../services/token";
import { cache } from "../../utils/cacheHelper";
import { respond } from "../../utils/response";
import { razorpayWrapper } from "./../../utils/razorpay-wrapper";

export interface MerChantDetails {
  businessId: string;
  razorpayMerchantId: string;
  razorpayKeyId: string;
}
const settingsRouter = new Hono()

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
          .then(() => {})
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
  .post(
    "/terms_and_condition",
    authTokenValidator,
    requireAuthorization([
      ClientRoles.OWNER,
      ClientRoles.HIPAL_CUSTOMER,
      ClientRoles.CAPTAIN,
    ]),

    zValidator("json", termsAndConditionSchema),

    async (c) => {
      const requestData = await c.req.json();

      const { businessId, termsAndConditions } = requestData;

      const saveAndUpdateTermsAndConditions =
        await TermAndCondition.findOneAndUpdate(
          {
            businessId: businessId,
          },
          {
            termsAndConditions: termsAndConditions,
          },
          { upsert: true },
        );

      return respond(c, "update", false, 200);
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
        const cleanedUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([, value]) => value !== undefined),
        );

        const updateSetting = await BusinessSettings.findByIdAndUpdate(
          settingsId,
          cleanedUpdateData,
          { new: true },
        );

        if (!updateSetting) {
          return respond(c, "Error in updating setting", true, 400, {});
        }

        await OutLetInfo.findOneAndUpdate(
          { businessId: updateSetting.businessId },
          {
            registeredName: requestData.registerName,
          },
          { new: true },
        );

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
      pushToken(c);
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

      pushToken(c);
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
        merchant = await BusinessSettings.findOne({
          businessId,
          isActive: true,
        })
          .select("razorpayMerchantId razorpayKeyId businessId")
          .lean();

        if (!merchant?.razorpayMerchantId) {
          return respond(c, "Merchant not found", false, 200, {});
        }
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
