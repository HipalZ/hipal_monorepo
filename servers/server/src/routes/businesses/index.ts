// books.ts
import { Business, LoyaltySettings, OutLetInfo, Permissions, Role } from '@hi/db-models';
import type { BusinessType } from '@hi/db-models/src/validators';
import {
  BusinessSchema,
  outLetInfoSchema,
  paramsSchema,
  permissionsSchema,
  TokenValidator,
  UpdateBusinessSchema,
} from '@hi/db-models/src/validators';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
//@ts-ignore
import { z } from 'zod';
import { ClientRoles, requireAuthorization } from '../../../middleware/authorization';
import { authTokenValidator } from '../../../middleware/tokenValidator';
const businessesRouter = new Hono()
  .post(
    '/',
    // authTokenValidator,
    // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator('json', BusinessSchema),
    zValidator('header', TokenValidator),
    async (c) => {
      const requestData = await c.req.json();
      const isCustomLinkExist = await Business.findOne({ customLink: requestData.customLink });
      if (isCustomLinkExist) {
        return c.json(
          {
            err: true,
            data: {},
            message: 'customLink already exist',
          },
          409,
        );
      }
      const business = await Business.create(requestData);
      if (!business) {
        return c.json({
          err: true,
          data: {},
          message: 'business not created !',
        });
      }

      return c.json({
        data: business,
        status: 200,
        err: false,
      });
    },
  )
  .post(
    '/outletInfo',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator('json', outLetInfoSchema),
    zValidator('header', TokenValidator),
    async (c) => {
      const requestData = await c.req.json();
      const isInfoAlreadyExist = await OutLetInfo.findOne({ businessId: requestData.businessId });
      if (isInfoAlreadyExist) {
        return c.json(
          {
            err: true,
            data: {},
            message: 'outletInfo already exist',
          },
          409,
        );
      }
      const outLetInfo = await OutLetInfo.create(requestData);
      if (!outLetInfo) {
        return c.json(
          {
            err: true,
            data: {},
            message: 'outletInfo not created !',
          },
          400,
        );
      }

      return c.json({
        data: outLetInfo,
        status: 200,
        err: false,
      });
    },
  )
  .post(
    '/permissions',
    // authTokenValidator,
    // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator('json', permissionsSchema),
    async (c) => {
      const requestData = await c.req.json();

      const business = await Permissions.create(requestData);
      if (!business) {
        return c.json({
          err: true,
          data: {},
          message: 'permissions not created !',
        });
      }

      return c.json({
        data: business,
        status: 200,
        err: false,
      });
    },
  )
  .post(
    '/:customLink',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator(
      'param',
      z.object({
        customLink: z.string(),
      }),
    ),
    zValidator('header', TokenValidator),
    async (c) => {
      let { customLink } = c.req.param();
      customLink = customLink.trim();

      const reservedDomains = ['hipal', 'hipalz', 'hiclient', 'pro.hipal', 'hitable', 'hibiz', 'biz'];
      const validDomainRegex = /^[a-z0-9]+$/;
      //TODO: BADWORD

      if (!validDomainRegex.test(customLink)) {
        return c.json(
          {
            err: true,
            data: { exist: false },
            message: 'Invalid domain link format',
          },
          400,
        );
      }

      if (reservedDomains.includes(customLink)) {
        return c.json(
          {
            err: true,
            data: { exist: false },
            message: 'Custom link is reserved',
          },
          400,
        );
      }

      // Check if the custom link already exists in the database
      const CustomLinkExist = await Business.findOne({ customLink: customLink });
      //TODO : SEPERATE FUNCTION RESPONSE
      return c.json({
        err: false,
        data: { exist: !!CustomLinkExist },
        message: 'fetched',
      });
    },
  )
  .post(
    '/:businessId/role',
    // authTokenValidator,
    // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator(
      'param',
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator(
      'json',
      z.object({
        name: z.enum([
          ClientRoles.RESTAURANT_STAFF,
          ClientRoles.RESTAURANT_MANAGER,
          ClientRoles.OPERATOR,
          ClientRoles.RESTAURANT_FLOOR_MANAGER,
          ClientRoles.RESTAURANT_OWNER,
        ]),
      }),
    ),
    // zValidator('header', TokenValidator),
    async (c) => {
      const { businessId } = c.req.param();
      const { name } = await c.req.json();
      const alreadyExist = await Role.findOne({ name });
      if (alreadyExist) {
        return c.json(
          {
            err: true,
            data: {},
            message: 'already exist',
          },
          409,
        );
      }
      const role = await Role.create({
        businessId: businessId,
        name,
      });

      return c.json({
        data: role,
        status: 200,
        error: false,
      });
    },
  )
  .put(
    '/:businessId',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator(
      'param',
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator('json', UpdateBusinessSchema),
    zValidator('header', TokenValidator),
    async (c) => {
      const { businessId } = c.req.param();
      const requestData = await c.req.json();

      const updateBusiness = await Business.findByIdAndUpdate(businessId, requestData, { new: true });
      if (!updateBusiness) {
        return c.json(
          {
            err: true,
            data: {},
            message: 'business not found ',
          },
          404,
        );
      }
      return c.json({
        err: false,
        data: updateBusiness,
        message: 'update successfully',
      });
    },
  )

  // .get('/:id', zValidator('param', BusinessSchema), zValidator('query', BusinessSchema), async (c) => {
  //   const { id } = c.req.param();
  //   const { customLink, nameLogo } = c.req.query();

  //   if (customLink) {
  //     const existingBusiness = await Business.findOne({ customLink: id });

  //     return c.json({
  //       err: false,
  //       message: 'Business not found',
  //       data: !!existingBusiness,
  //     });
  //   }

  //   let existingBusiness: BusinessType | BusinessType[] | null = null;

  //   if (nameLogo) {
  //     existingBusiness = await Business.findById(id).select('logo businessName');
  //   } else {
  //     existingBusiness = await Business.findById(id);
  //   }

  //   return c.json({
  //     data: existingBusiness,
  //     status: 200,
  //     err: false,
  //   });
  // })
  .get(
    '/:businessId/permissions',
    // authTokenValidator,
    // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator('param', z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();

      const business = await Permissions.findOne({ businessId: businessId });
      if (!business) {
        return c.json({
          err: true,
          data: {},
          message: 'permissions not created !',
        });
      }

      return c.json({
        data: business,
        status: 200,
        err: false,
      });
    },
  )
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.query();

      const existingBusinesses = await Business.find({
        staffIds: id,
      });

      return c.json({
        data: existingBusinesses,
        status: 200,
        error: false,
      });
    },
  )
  .get('/get/Single/:businessId', zValidator('param', paramsSchema), async (c) => {
    const { businessId } = c.req.param();

    const existingBusiness = await Business.findById(businessId);

    return c.json({
      data: existingBusiness,
      status: 200,
      error: false,
    });
  })
  .get('/n/:customLink', zValidator('param', paramsSchema), async (c) => {
    let { customLink } = c.req.param();

    customLink = customLink.trim();

    const getBusiness = await Business.findOne({ customLink: customLink });

    return c.json({
      data: getBusiness,
      status: 200,
      error: false,
    });
  })
  .get(
    '/:businessId/loyalty',
    zValidator(
      'param',
      z.object({
        businessId: z.string(),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.param();

      const exitingSettings =
        (await LoyaltySettings.findOne({
          businessId: businessId,
        })) || {};
      return c.json({
        data: exitingSettings,
        status: 200,
        error: false,
      });
    },
  )

  .get(
    '/:businessId/users',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER]),

    zValidator(
      'param',
      z.object({
        businessId: z.string(),
      }),
    ),
    zValidator('header', TokenValidator),
    async (c) => {
      const { businessId } = c.req.param();
      const existingRoles = await Role.find({
        businessId: businessId,
      }).select('_id name');

      return c.json({
        data: existingRoles,
        status: 200,
        error: false,
      });
    },
  )
  .get('/get/allbusiness', async (c) => {
    const existingBusinesses = await Business.find({});

    return c.json({
      data: existingBusinesses,
      status: 200,
      error: false,
    });
  })
  .get('/', async (c) => {
    const existingBusinesses = await Business.find({});

    return c.json({
      data: existingBusinesses,
      status: 200,
      error: false,
    });
  });

export default businessesRouter;
