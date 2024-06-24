import { ClientRoles, requireAuthorization } from '@hi/common';
import { Business, LoyaltySettings, Role } from '@hi/db-models';
import express, { Request, Response } from 'express';

const router = express.Router();

router.get(
  '/v1/businesses',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  async (req: Request, res: Response) => {
    const { clientRole, id } = req.query;
    if (clientRole === 'admin') {
      const existingBusinesses = await Business.find({});
      res.status(200).send(existingBusinesses);
      return;
    }
    const userId = req.currentUser?.id;
    const existingBusinesses = await Business.find({
      staff: userId || id,
    });

    res.status(200).send({
      err: false,
      message: 'Businesses fetched successfully',
      data: existingBusinesses,
    });
  },
);

router.get('/v1/businesses/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { customLink, nameLogo } = req.query;

  if (customLink) {
    const existingBusiness = await Business.findOne({ customLink: id });
    res.send({
      exists: !!existingBusiness,
    });
    return;
  }

  let existingBusiness;

  if (nameLogo) {
    existingBusiness = await Business.findById(id).select('logo businessName');
  } else {
    existingBusiness = await Business.findById(id);
  }

  res.status(200).send({
    err: false,
    message: 'Business fetched successfully',
    data: existingBusiness,
  });
});

router.get(
  '/v1/businesses/get/Single/:businessId',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const query = req.query;
    if (query.bill) {
      const existingBusiness = await Business.findById(businessId).select(
        'businessName logo id serviceCharge serviceChargePercentage gstNumber fssaiLicenseNumber ',
      );

      return res.send({
        err: false,
        message: 'Business fetched successfully',
        data: existingBusiness,
      });
    }

    if (query) {
      const existingBusiness = await Business.findByIdAndUpdate(businessId, query, { new: true });

      return res.send({
        err: false,
        message: 'Business fetched successfully',
        data: existingBusiness,
      });
    }

    const existingBusiness = await Business.findById(businessId);

    res.status(200).send({
      err: false,
      message: 'Business fetched successfully',
      data: existingBusiness,
    });
  },
);

router.get(
  '/v1/businesses/get/allbusiness',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  async (req: Request, res: Response) => {
    const existingBusinesses = await Business.find({
      isHasSetting: true,
      isHasDishData: true,
    });
    res.status(200).send({
      err: false,
      message: 'Businesses fetched successfully',
      data: existingBusinesses,
    });
  },
);

router.get(
  '/v1/businesses/:id/testing',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  async (req: Request, res: Response) => {
    const message = 'Test Successfully...!';
    res.status(200).send({
      err: false,
      message: message,
    });
  },
);

router.get(
  '/v1/businesses/:businessId/passwordManager',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const business = await Business.findById(businessId).lean();
    const loyaltySetting = await LoyaltySettings.findOne({ businessId });
    let dublicate: any = { ...business };
    const obj: any = {};
    obj['serviceChargePassword'] = business?.serviceChargeRemovalPass;
    obj['discountPassword'] = dublicate?.serviceControl?.discountPassword;
    obj['loyaltyPassword'] = loyaltySetting?.password;

    return res.status(200).send({
      err: false,
      message: 'Password fetched successfully',
      data: obj,
    });
  },
);

// router.get(
//   '/v1/businesses/getsingle/data',
//   validateRequest({
//     body: BusinessSchema,
//   }),
//   async (req: Request, res: Response) => {
//     return res.status(200).send({ status: true, message: 'Test Successfully...!' });
//   },
// );

router.get(
  '/v1/businesses/n/:customLink',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  async (req: Request, res: Response) => {
    let { customLink } = req.params || {};

    customLink = customLink.trim();

    const getBusiness = await Business.findOne({ customLink: customLink });
    if (!getBusiness) return res.status(404).send({ status: false, message: 'Business Not found given name ' });
    const businessIdData = {
      businessId: getBusiness?.id,
    };

    return res.status(200).send({
      status: true,
      data: businessIdData,
      message: 'Business fetched successfully',
    });
  },
);

router.get(
  '/v1/businesses/:id/loyalty',
  // validateRequest({
  //   body: loyaltySchema,
  // }),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hidePassword } = req.query;
    if (hidePassword) {
      let existingSetting =
        (await LoyaltySettings.findOne({ businessId: id }).select({
          password: 0,
        })) || {};

      return res.status(200).send(existingSetting);
    }

    let exitingSettings =
      (await LoyaltySettings.findOne({
        businessId: id,
      })) || {};

    return res.status(200).send({
      err: false,
      message: 'Loyalty fetched successfully',
      data: exitingSettings,
    });
  },
);

router.get(
  '/v1/businesses/:id/getAllLoyaltyBusinesses',
  // validateRequest({
  //   body: loyaltySchema,
  // }),
  async (req: Request, res: Response) => {
    let exitingSettings = (await LoyaltySettings.find({})) || [];
    return res.status(200).send({
      err: false,
      message: 'Loyalty fetched successfully',
      data: exitingSettings,
    });
  },
);

router.get(
  '/v1/businesses/roles/:id',
  // validateRequest({
  //   body: RoleSchema,
  // }),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingRoles = await Role.findById(id);
    res.status(200).send({
      err: false,
      message: 'Role fetched successfully',
      data: existingRoles,
    });
  },
);

router.get(
  '/v1/businesses/:id/roles',
  // validateRequest({
  //   body: RoleSchema,
  // }),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingRoles = await Role.find({
      businessId: id,
    });

    res.status(200).send({
      err: false,
      message: 'Roles fetched successfully',
      data: existingRoles,
    });
  },
);

export { router as readBusinessRouter };
