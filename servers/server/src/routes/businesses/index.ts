// books.ts
import {
  AddOn,
  Banner,
  Business,
  BusinessSettings,
  Category,
  Dish,
  LoyaltySettings,
  OutLetInfo,
  Permissions,
  Role,
  Theme,
  UserReward,
} from "@hi/db-models";
import {
  BranchSchema,
  BusinessSchema,
  UpdateBusinessSchema,
  loyaltySchema,
  outLetInfoSchema,
  paramsSchema,
  permissionsSchema,
} from "@hi/db-models/src/validators";
//@ts-ignore
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ClientSession } from "mongoose";
import { z } from "zod";
import {
  ClientRoles,
  requireAuthorization,
} from "../../../middleware/authorization";
import { authTokenValidator } from "../../../middleware/tokenValidator";
import { respond } from "../../utils/response";
import { convertToHsl } from "../../utils/theme";

const businessesRouter = new Hono()
  .post(
    "/",

    zValidator("json", BusinessSchema),

    async (c) => {
      const requestData = await c.req.json();
      const isCustomLinkExist = await Business.findOne({
        customLink: requestData.customLink,
      });
      if (isCustomLinkExist) {
        return c.json(
          {
            err: true,
            data: {},
            message: "customLink already exist",
          },
          409,
        );
      }
      const business = await Business.create(requestData);
      if (!business) {
        return c.json({
          err: true,
          data: {},
          message: "business not created !",
        });
      }
      await OutLetInfo.findOneAndUpdate(
        {
          businessId: business._id,
        },
        {
          $set: {
            name: business.name,
          },
        },
        { upsert: true, new: true },
      );

      return respond(c, "business created", false, 201, business);
    },
  )
  .post(
    "/createBranch",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", BranchSchema),

    async (c) => {
      //@ts-ignore
      return await runInTransaction(async (session: ClientSession) => {
        const requestData = await c.req.json();
        const isCustomLinkExist = await Business.findOne({
          customLink: requestData.customLink,
        });

        if (isCustomLinkExist)
          return respond(c, "customLink already exist", true, 409, {});

        const business = await Business.create(
          [{ ...requestData, outlet: false }],
          { session },
        );
        if (requestData.parentBranchId) {
          const {
            menu,
            themes,
            rewards,
            paymentAndBusinessSettings,
            parentOutLetId,
          } = requestData;
          const currentBusinessId = business[0]._id;

          if (menu) {
            const categories = await Category.find({
              businessId: parentOutLetId,
            }).lean();

            for (let i = 0; i < categories.length; i++) {
              const category = categories[i];

              delete category._id;
              category.businessId = currentBusinessId;
            }

            await Category.insertMany(categories, { session });

            const dishes = await Dish.find({
              businessId: parentOutLetId,
            }).lean();
            for (let i = 0; i < dishes.length; i++) {
              const dish = dishes[i];
              delete dish._id;
              dish.businessId = currentBusinessId;
            }
            await Dish.insertMany(dishes, { session });

            const extras = await AddOn.find({
              businessId: parentOutLetId,
            }).lean();
            for (const extra of extras) {
              delete extra._id;
              extra.businessId = currentBusinessId;
            }
            await AddOn.insertMany(extras, { session });
          }

          if (themes) {
            console.log("themes", themes);
            const outLet = await OutLetInfo.findOne({
              businessId: parentOutLetId,
            }).lean();

            if (!outLet) return respond(c, "outLet not found", true, 404, {});

            delete outLet._id;

            console.log("outLet", outLet);
            await OutLetInfo.create(
              [{ ...outLet, businessId: currentBusinessId }],
              { session },
            );

            const banners = await Banner.find({
              businessId: parentOutLetId,
            }).lean();
            for (const banner of banners) {
              delete banner._id;
              banner.businessId = currentBusinessId;
            }
            await Banner.insertMany(banners, { session });

            const themesData = await Theme.findOne({
              businessId: parentOutLetId,
            }).lean();
            if (themesData) {
              delete themesData._id;
              await Theme.create(
                [{ theme: themesData.theme, businessId: currentBusinessId }],
                { session },
              );
            }
          }

          if (rewards) {
            const loyaltySettings = await LoyaltySettings.findOne({
              businessId: parentOutLetId,
            }).lean();
            if (!loyaltySettings)
              return respond(c, "loyaltySettings not found", true, 404, {});
            delete loyaltySettings._id;
            await LoyaltySettings.create(
              [{ ...loyaltySettings, businessId: currentBusinessId }],
              { session },
            );

            const loyaltyUsers = await UserReward.find({
              loyaltyId: parentOutLetId,
            }).lean();
            for (const user of loyaltyUsers) {
              delete user._id;
              user.loyaltyId = currentBusinessId.toString();
            }
            await UserReward.insertMany(loyaltyUsers, { session });
          }

          if (paymentAndBusinessSettings) {
            const businessSetting = await BusinessSettings.findOne({
              businessId: parentOutLetId,
            }).lean();
            if (!businessSetting)
              return respond(c, "businessSetting not found", true, 404, {});
            delete businessSetting._id;
            await BusinessSettings.create(
              [{ ...businessSetting, businessId: currentBusinessId }],
              { session },
            );
          }
        }

        return respond(c, "branch created", false, 201, business);
      });
    },
  )
  .post(
    "/outletInfo",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator("json", outLetInfoSchema),

    async (c) => {
      const requestData = await c.req.json();
      const isInfoAlreadyExist = await OutLetInfo.findOne({
        businessId: requestData.businessId,
      });

      if (isInfoAlreadyExist)
        return respond(c, "outletInfo already exists", true, 409, {});

      const outLetInfo = await OutLetInfo.findOneAndUpdate(
        { businessId: requestData.businessId },
        requestData,
        { new: true, upsert: true },
      );
      if (!outLetInfo)
        return respond(c, "outletInfo not created", true, 400, {});

      return respond(c, "outletInfo created", false, 201, outLetInfo);
    },
  )
  .post(
    "/permissions",

    zValidator("json", permissionsSchema),

    async (c) => {
      const requestData = await c.req.json();

      const business = await Permissions.create(requestData);
      if (!business) respond(c, "permissions not created", true, 400, {});

      return respond(c, "permissions created", false, 201, business);
    },
  )
  .post(
    "/:customLink",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator(
      "param",
      z.object({
        customLink: z.string(),
      }),
    ),

    async (c) => {
      let { customLink } = c.req.param();
      customLink = customLink.trim();

      const reservedDomains = [
        "hipal",
        "hipalz",
        "hiclient",
        "pro.hipal",
        "hitable",
        "hibiz",
        "biz",
      ];
      const validDomainRegex = /^[a-z0-9]+$/;
      //TODO: BADWORD

      if (!validDomainRegex.test(customLink)) {
        return c.json(
          {
            err: true,
            data: { exist: false },
            message: "Invalid domain link format",
          },
          400,
        );
      }

      if (reservedDomains.includes(customLink)) {
        return c.json(
          {
            err: true,
            data: { exist: false },
            message: "Custom link is reserved",
          },
          400,
        );
      }

      // Check if the custom link already exists in the database
      const CustomLinkExist = await Business.findOne({
        customLink: customLink,
      });
      //TODO : SEPERATE FUNCTION RESPONSE
      return c.json({
        err: false,
        data: { exist: !!CustomLinkExist },
        message: "fetched",
      });
    },
  )
  .post(
    "/:businessId/role",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.OWNER]),

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator(
      "json",
      z.object({
        name: z.enum([
          "OWNER",
          "CO_OWNER",
          "MANAGER",
          "CAPTAIN",
          "MARKETING_AGENT",
          "HIPAL_ADMIN",
          "HIPAL_CUSTOMER",
        ]),
        description: z.string().optional(),
      }),
    ),
    // ,
    async (c) => {
      const { businessId } = c.req.param();
      const { name, description } = await c.req.json();
      const alreadyExist = await Role.findOne({ name });
      if (alreadyExist) {
        return c.json(
          {
            err: true,
            data: {},
            message: "already exist",
          },
          409,
        );
      }
      const role = await Role.create({
        businessId: businessId,
        name,
        description,
      });

      return c.json({
        data: role,
        status: 200,
        error: false,
      });
    },
  )
  .put(
    "/:businessId",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator("json", UpdateBusinessSchema),

    async (c) => {
      const { businessId } = c.req.param();
      const requestData = await c.req.json();
      console.log("from fro", requestData);
      if (requestData?.primaryColor && requestData?.secondaryColor) {
        const convertedColors = convertToHsl({
          primary: requestData.primaryColor,
          accent: requestData.primaryColor,
          secondary: requestData.secondaryColor,
          "base-100": requestData.secondaryColor,
        });

        const createTheme = await Theme.findOneAndUpdate(
          { businessId: businessId },
          { theme: convertedColors },
          { new: true, upsert: true },
        );

        if (!createTheme) return respond(c, "theme not created", true, 400, {});
      }

      const updateBusiness = await Business.findByIdAndUpdate(
        businessId,
        { ...requestData, themeApplied: true },
        { new: true },
      );
      if (!updateBusiness) {
        return c.json(
          {
            err: true,
            data: {},
            message: "business not found ",
          },
          404,
        );
      }
      return c.json({
        err: false,
        data: updateBusiness,
        message: "update successfully",
      });
    },
  )
  .put(
    "outletInfo/update/:businessId",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator("json", outLetInfoSchema.partial()),

    async (c) => {
      const { businessId } = c.req.param();
      const requestData = await c.req.json();

      const updateOutletInfo = await OutLetInfo.findOneAndUpdate(
        { businessId: businessId },
        requestData,
        { new: true, upsert: true },
      );

      if (!updateOutletInfo)
        return respond(c, "outletInfo not found", true, 404, {});

      return respond(c, "outletInfo updated", false, 200, updateOutletInfo);
    },
  )

  .get(
    "/:businessId/permissions",

    zValidator("param", z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();

      const business = await Permissions.find();
      if (!business) return respond(c, "permissions not found", true, 404, {});

      return respond(c, "permissions found", false, 200, business[0]);
    },
  )
  .get(
    "/getBranches/:ownerId",
    authTokenValidator,
    requireAuthorization([ClientRoles.OWNER, ClientRoles.HIPAL_ADMIN]),

    zValidator(
      "param",
      z.object({
        ownerId: z.string(),
      }),
    ),
    async (c) => {
      const { ownerId } = c.req.param();
      const existingBusinesses = await Business.find({
        staffIds: ownerId,
        outlet: true,
      }).select("name _id");

      return respond(c, "businesses found", false, 200, existingBusinesses);
    },
  )
  .get(
    "/outletInfo/:businessId",

    zValidator("param", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();

      const outLetInfo = await OutLetInfo.findOne({ businessId: businessId });

      if (!outLetInfo) return respond(c, "outletInfo not found", true, 404, {});

      return respond(c, "outletInfo found", false, 200, outLetInfo);
    },
  )
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.query();

      console.log("id", id);

      const existingBusinesses = await Business.find({
        staffIds: id,
      }).populate("parentOutLetId", {
        name: 1,
        _id: 0,
      });

      return respond(c, "businesses found", false, 200, existingBusinesses);
    },
  )
  .get("/getAllbusinesses", async (c) => {
    const existingBusinesses = await Business.find({});

    return respond(c, "businesses found", false, 200, existingBusinesses);
  })
  .get(
    "/:businessId/getOutletsBillingsDate",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const existingBusiness = await OutLetInfo.findOne({
        businessId: businessId,
      }).select("billingStartTime");

      return c.json({
        data: existingBusiness,
        status: 200,
        error: false,
      });
    },
  )
  .get(
    "/get/Single/:businessId",
    zValidator("param", paramsSchema),
    async (c) => {
      const { businessId } = c.req.param();

      const existingBusiness = await Business.findById(businessId);

      return c.json({
        data: existingBusiness,
        status: 200,
        error: false,
      });
    },
  )
  .get("/n/:customLink", zValidator("param", paramsSchema), async (c) => {
    let { customLink } = c.req.param();

    customLink = customLink.trim();

    const getBusiness = await Business.findOne({
      customLink: customLink,
    }).select("_id");
    const outLetInfo = await OutLetInfo.findOne({
      businessId: getBusiness?._id,
    });

    if (!outLetInfo) return respond(c, "business not found", true, 404, {});
    return respond(c, "business found", false, 200, outLetInfo);
  })
  .get(
    "/:businessId/loyalty",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const exitingSettings = await LoyaltySettings.findOne({
        businessId: businessId,
      });

      if (!exitingSettings)
        return c.json(
          {
            data: {},
            message: "loyalty settings not found",

            err: true,
          },
          404,
        );
      return c.json(
        {
          data: exitingSettings,
          message: "loyalty settings found",
          status: 200,
          error: false,
        },
        200,
      );
    },
  )
  .get(
    "/themes/:businessId",
    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();
      console.log("from fro", businessId);

      const existingTheme = await Theme.findOne({ businessId: businessId });
      if (!existingTheme) return respond(c, "theme not found", true, 404, {});

      return respond(c, "theme found", false, 200, existingTheme);
    },
  )

  .get(
    "/:businessId/users",

    zValidator(
      "param",
      z.object({
        businessId: z.string(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const existingRoles = await Role.find({}).select("_id name description");

      return respond(c, "roles found", false, 200, existingRoles);
    },
  )
  .get("/get/allbusiness", async (c) => {
    const existingBusinesses = await Business.find({});

    return c.json({
      data: existingBusinesses,
      status: 200,
      error: false,
    });
  })
  .get("/", async (c) => {
    const existingBusinesses = await Business.find({});

    return c.json({
      data: existingBusinesses,
      status: 200,
      error: false,
    });
  })
  .post(
    "/:businessId/loyalty",
    zValidator("json", loyaltySchema),

    zValidator(
      "param",
      z.object({
        businessId: z.string({ message: "businessId is required" }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const requestData = await c.req.json();

      const existingSettings = await LoyaltySettings.findOne({
        businessId: businessId,
      });

      if (existingSettings) {
        return c.json(
          {
            data: existingSettings,
            Message: "loyalty settings already exist",

            err: true,
          },
          409,
        );
      }

      const createSettings = await LoyaltySettings.create({
        businessId: businessId,
        ...requestData,
      });

      return c.json({
        data: createSettings,
        status: 200,
        error: false,
      });
    },
  )
  .put(
    "/:loyaltyId/loyalty",
    zValidator("json", loyaltySchema.partial()),

    zValidator(
      "param",
      z.object({
        loyaltyId: z.string({ message: "loyaltyId is required" }),
      }),
    ),

    async (c) => {
      const { loyaltyId } = c.req.param();
      const requestData = await c.req.json();

      const updateSettings = await LoyaltySettings.findByIdAndUpdate(
        loyaltyId,
        requestData,
        { new: true },
      );

      if (!updateSettings)
        return c.json(
          {
            data: {},

            err: true,
            message: "loyalty settings not found",
          },
          404,
        );

      return c.json({
        data: updateSettings,
        status: 200,
        error: false,
      });
    },
  )
  .put(
    "/:loyaltyId/pauseLoyalty",

    zValidator(
      "param",
      z.object({
        loyaltyId: z.string({ message: "loyaltyId is required" }),
      }),
    ),

    zValidator(
      "json",
      z.object({ isActive: z.boolean({ message: "isActive is required" }) }),
    ),

    async (c) => {
      const { loyaltyId } = c.req.param();

      const updateSettings = await LoyaltySettings.findByIdAndUpdate(
        loyaltyId,
        { isActive: false },
        { new: true },
      );

      return c.json({
        data: updateSettings,
        status: 200,
        error: false,
      });
    },
  );

export default businessesRouter;
