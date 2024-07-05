// books.ts
import { Dish, Settings, User } from '@hi/db-models';
import type { DishType } from '@hi/db-models/src/validators';
import { paramsSchema } from '@hi/db-models/src/validators';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { authTokenValidator } from '../../../middleware/tokenValidator';

import { ClientRoles, requireAuthorization } from '../../../middleware/authorization';
const settingsRouter = new Hono().get(
  '/',

  zValidator('query', paramsSchema),
  async (c) => {
    console.log('settingsRouter');
    const { businessId } = c.req.query();
    const existingSettings = await Settings.find({
      businessId,
    }).populate('explore.popular');
    return c.json({
      status: true,
      message: 'Settings fetched successfully',
      data: existingSettings,
    });
  },
);

export default settingsRouter;
