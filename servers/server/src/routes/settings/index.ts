// books.ts
import { Banner, Dish, Settings, User } from '@hi/db-models';
import type { DishType } from '@hi/db-models/src/validators';
import { bannerSchema, paramsSchema, TokenValidator } from '@hi/db-models/src/validators';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { authTokenValidator } from '../../../middleware/tokenValidator';

import { ClientRoles, requireAuthorization } from '../../../middleware/authorization';
import { respond } from '../../utils/response';
const settingsRouter = new Hono()
  .get(
    '/',

    zValidator('query', paramsSchema),
    async (c) => {
      console.log('settingsRouter');
      const { businessId } = c.req.query();
      const existingSettings = await Settings.find({
        businessId,
      }).populate('explore.popular');
      return respond(c, 'Settings fetched successfully', false, 200, existingSettings);
    },
  )
  .post(
    '/banner',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator('json', bannerSchema),
    zValidator('header', TokenValidator),
    async (c) => {
      const requestData = await c.req.json();
      const createBanner = await Banner.create(requestData);
      if (!createBanner) return respond(c, 'Error in creating banner', true, 400, {});
      return respond(c, 'Banner created successfully', false, 201, createBanner);
    },
  )
  .put(
    '/banner/:bannerId',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator('json', bannerSchema.partial()),
    zValidator('param', z.object({ bannerId: z.string() })),
    zValidator('header', TokenValidator),
    async (c) => {
      const requestData = await c.req.json();
      const { bannerId } = c.req.param();
      const updateBanner = await Banner.findByIdAndUpdate(bannerId, requestData, { new: true });
      if (!updateBanner) return respond(c, 'Error in updating banner', true, 400, {});
      return respond(c, 'Banner updated successfully', false, 200, updateBanner);
    },
  )
  .get(
    '/banner/:bannerId',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator('header', TokenValidator),
    zValidator('param', z.object({ bannerId: z.string() })),

    async (c) => {
      const { bannerId } = c.req.param();
      const existingBanner = await Banner.findById(bannerId);
      if (!existingBanner) return respond(c, 'Banner not found', true, 404, {});
      return respond(c, 'Banner fetched successfully', false, 200, existingBanner);
    },
  )
  .get(
    '/banners/:businessId',
    authTokenValidator,
    requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
    zValidator('header', TokenValidator),
    zValidator('param', z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.param();
      const existingBanners = await Banner.find({
        businessId,
      });
      return respond(c, 'Banners fetched successfully', false, 200, existingBanners);
    },
  );

export default settingsRouter;
