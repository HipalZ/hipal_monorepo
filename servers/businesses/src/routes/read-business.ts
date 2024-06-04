import express, { Request, Response } from "express";
import { Business, LoyaltySettings, Role } from "@hi/db-models";

const router = express.Router();

router.get("/v1/businesses", async (req: Request, res: Response) => {
  const { clientRole, id } = req.query;
  if (clientRole === "admin") {
    const existingBusinesses = await Business.find({});
    res.status(200).send(existingBusinesses);
    return;
  }
  const userId = req.currentUser?.id;
  const existingBusinesses = await Business.find({
    staff: userId || id,
  });

  res.status(200).send(existingBusinesses);
});

router.get("/v1/businesses/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { customLink } = req.query;
  if (customLink) {
    const existingBusiness = await Business.findOne({ customLink: id });
    res.send({
      exists: !!existingBusiness,
    });
    return;
  }
  const existingBusiness = await Business.findById(id);

  res.status(200).send(existingBusiness);
});

router.get(
  "/v1/businesses/get/Single/:businessId",

  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const query = req.query;
    if (query.bill) {
      const existingBusiness = await Business.findById(businessId).select(
        "businessName logo id serviceCharge serviceChargePercentage gstNumber fssaiLicenseNumber "
      );

      return res.send(existingBusiness);
    }

    if (query) {
      const existingBusiness = await Business.findByIdAndUpdate(
        businessId,
        query,
        { new: true }
      );

      return res.send(existingBusiness);
    }

    const existingBusiness = await Business.findById(businessId);

    res.status(200).send(existingBusiness);
  }
);

router.get(
  "/v1/businesses/get/allbusiness",
  async (req: Request, res: Response) => {
    try {
      const existingBusinesses = await Business.find({
        isHasSetting: true,
        isHasDishData: true,
      });

      res.status(200).send(existingBusinesses);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);
router.get(
  "/v1/businesses/:id/testing",
  async (req: Request, res: Response) => {
    try {
      const message = "Test Successfully...!";
      res.status(200).send(message);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.get(
  "/v1/businesses/:businessId/passwordManager",
  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      const business = await Business.findById(businessId).lean();
      const loyaltySetting = await LoyaltySettings.findOne({ businessId });
      let dublicate: any = { ...business };
      const obj: any = {};
      obj["serviceChargePassword"] = business?.serviceChargeRemovalPass;
      obj["discountPassword"] = dublicate?.serviceControl?.discountPassword;
      obj["loyaltyPassword"] = loyaltySetting?.password;

      return res.send(obj);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/businesses/getsingle/data",
  async (req: Request, res: Response) => {
    try {
      return res
        .status(200)
        .send({ status: true, message: "Test Successfully...!" });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/businesses/n/:customLink",
  async (req: Request, res: Response) => {
    let { customLink } = req.params || {};

    customLink = customLink.trim();

    const getBusiness = await Business.findOne({ customLink: customLink });
    if (!getBusiness)
      return res
        .status(404)
        .send({ status: false, message: "Business Not found given name " });
    const businessIdData = {
      businessId: getBusiness?.id,
    };

    return res.status(200).send({ status: true, data: businessIdData });
  }
);

router.get(
  "/v1/businesses/:id/loyalty",

  async (req: Request, res: Response) => {
    try {
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

      return res.status(200).send(exitingSettings);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.get(
  "/v1/businesses/:id/getAllLoyaltyBusinesses",

  async (req: Request, res: Response) => {
    try {
      let exitingSettings = (await LoyaltySettings.find({})) || [];

      return res.status(200).send(exitingSettings);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.get(
  "/v1/businesses/:id/deleteLoyalty",

  async (req: Request, res: Response) => {
    try {
      let { businessId } = req.query;
      let exitingSettings = await LoyaltySettings.deleteOne({ businessId });

      return res.status(200).send(exitingSettings);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.get("/v1/businesses/roles/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const existingRoles = await Role.findById(id);

  res.status(200).send(existingRoles);
});

router.get(
  "/v1/businesses/:id/roles",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    console.log("aaaaa");
    const { id } = req.params;
    const existingRoles = await Role.find({
      businessId: id,
    });

    res.status(200).send(existingRoles);
  }
);

export { router as readBusinessRouter };
