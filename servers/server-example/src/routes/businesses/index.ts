// books.ts
import { Business, LoyaltySettings, Role } from '@hi/db-models';
import type { BusinessType } from '@hi/db-models/src/validators';
import { BusinessSchema, paramsSchema } from '@hi/db-models/src/validators';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const businessesRouter = new Hono()
  .get('/businesses/:id', zValidator('param', BusinessSchema), async (c) => {
    const { id } = c.req.param();
    const { customLink, nameLogo } = c.req.query();

    if (customLink) {
      const existingBusiness = await Business.findOne({ customLink: id });

      return c.json({
        err: false,
        message: 'Business not found',
        data: !!existingBusiness,
      });
    }

    let existingBusiness: BusinessType | BusinessType[] | null = null;

    if (nameLogo) {
      existingBusiness = await Business.findById(id).select('logo businessName');
    } else {
      existingBusiness = await Business.findById(id);
    }

    return c.json({
      data: existingBusiness,
      status: 200,
      err: false,
    });
  })
  .get('/get/Single/:businessId', zValidator('query', paramsSchema), async (c) => {
    const { businessId } = c.req.param();

    const existingBusiness = await Business.findById(businessId);

    return c.json({
      data: existingBusiness,
      status: 200,
      error: false,
    });
  })
  .get('/n/:customLink', async (c) => {
    let { customLink } = c.req.param();

    customLink = customLink.trim();

    const getBusiness = await Business.findOne({ customLink: customLink });

    return c.json({
      data: getBusiness,
      status: 200,
      error: false,
    });
  })
  .get('/:id/loyalty', async (c) => {
    const { id } = c.req.param();

    const exitingSettings =
      (await LoyaltySettings.findOne({
        businessId: id,
      })) || {};

    console.log('exitingSettings', exitingSettings);

    return c.json({
      data: exitingSettings,
      status: 200,
      error: false,
    });
  })
  .get('/:id/users', async (c) => {
    const { id } = c.req.param();
    const existingRoles = await Role.find({
      businessId: id,
    });

    return c.json({
      data: existingRoles,
      status: 200,
      error: false,
    });
  })
  .get('/get/allbusiness', async (c) => {
    const existingBusinesses = await Business.find({});

    return c.json({
      data: existingBusinesses,
      status: 200,
      error: false,
    });
  });

export default businessesRouter;
