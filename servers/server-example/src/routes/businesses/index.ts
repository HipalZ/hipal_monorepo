// books.ts
import { Business, LoyaltySettings, Role } from '@hi/db-models';
import type { BusinessType } from '@hi/db-models/src/validators';
import { BusinessSchema, paramsSchema } from '@hi/db-models/src/validators';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const businessesRouter = new Hono()
  .post('/', zValidator('json', BusinessSchema), async (c) => {
    const requestData = await c.req.json();
    const {
      likes,
      wallpaper,
      businessName,
      registeredName,
      businessType,
      gstRegistered,
      multipleOutlets,
      customLink,
      logo,
      address,
      gstNumber,
      fssaiLicenseNumber,
      open,
      close,
      isHasSetting,
      isHasDishData,
      hikitchen,
      hitable,
      hipeople,
      hibiz,
      kotPrinter,
      serviceCharge,
      serviceChargeRemovalPass,
      serviceChargePercentage,
      serviceControl,
      ownerPhone,
      takeAwayName,
      loyalty,
      isHasGst,
      gstPercentage,
      isPaymentIntegrated,
      withPopCorn,
      tags,
      description,
    } = requestData;

    const business = await Business.create({
      likes,
      wallpaper,
      businessName,
      registeredName,
      businessType,
      gstRegistered,
      multipleOutlets,
      customLink,
      logo,
      address,
      gstNumber,
      fssaiLicenseNumber,
      status: false,
      tier: 'ON THE HOUSE',
      open,
      close,
      isHasSetting,
      isHasDishData,
      hikitchen,
      hitable,
      hipeople,
      hibiz,
      kotPrinter,
      serviceCharge,
      serviceChargePercentage,
      serviceChargeRemovalPass,
      serviceControl,
      takeAwayName,
      loyalty,
      isHasGst,
      gstPercentage,
      isPaymentIntegrated,
      withPopCorn,
      tags,
      description,
    });
    await business.save();

    return c.json({
      data: business._id,
      status: 200,
      error: false,
    });
  })
  .get('/:id', zValidator('param', BusinessSchema), async (c) => {
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
  .get('/', async (c) => {
    const { clientRole, id } = c.req.query();

    if (clientRole === 'admin') {
      const existingBusinesses = await Business.find({});

      return c.json({
        data: existingBusinesses,
        status: 200,
        error: false,
      });
    }

    const existingBusinesses = await Business.find({
      staff: id,
    });

    return c.json({
      data: existingBusinesses,
      status: 200,
      error: false,
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
