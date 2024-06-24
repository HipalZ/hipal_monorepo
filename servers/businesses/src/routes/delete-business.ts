import { ClientRoles, requireAuthorization } from '@hi/common';
import { Business, LoyaltySettings } from '@hi/db-models';
import express, { Request, Response } from 'express';


const router = express.Router();

router.delete(
  '/v1/businesses/:businessId',
  // validateRequest({
  //   body: BusinessSchema,
  // }),
  requireAuthorization([ClientRoles.HIPAL_ADMIN]),
  async (req: Request<{ businessId: string }>, res: Response) => {
    const { businessId } = req.params;
    const deletedBusiness = await Business.findByIdAndDelete(businessId);

    if (!deletedBusiness) {
      return res.status(404).send({
        message: 'Business not found',
        status: false,
      });
    }
    res.status(200).send({
      message: 'Business deleted successfully',
      status: true,
      data: deletedBusiness._id,
    });
  },
);

//TODO : datta verify the data object in response
router.delete(
  '/v1/businesses/:id/deleteLoyalty',
  // validateRequest({
  //   body: loyaltySchema,
  // }),
  requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    let { businessId } = req.query;
    let exitingSettings = await LoyaltySettings.deleteOne({ businessId });

    return res.status(200).send({
      err: false,
      message: 'Loyalty deleted successfully',
      //@ts-ignore 
      data: exitingSettings._id,
    });
  },
);

export { router as deleteBusinessesRouter };
