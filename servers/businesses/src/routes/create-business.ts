import express, { Request, Response } from "express";
import { Business, LoyaltySettings, Role } from "@hi/db-models";
import axios from "axios";
import { currentUser } from "@hipal/common";

const router = express.Router();

router.post(
  "/v1/businesses",

  async (req: Request, res: Response) => {
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
    } = req.body;

    let currentObject: any = { ...req?.currentUser };

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
      staff: [req.currentUser?.id as string],
      gstNumber,
      fssaiLicenseNumber,
      status: false,
      tier: "ON THE HOUSE",
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
      ownerPhone: currentObject?.phone,
      takeAwayName,
      loyalty,
      isHasGst,
      gstPercentage,
      isPaymentIntegrated,
      withPopCorn,
    });
    await business.save();

    res.status(201).send(business);
  }
);

router.post(
  "/v1/businesses/:businessId/userlike",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body || {};
      const { businessId } = req.params || {};

      const businessObject = await Business.findById(businessId);

      if (!businessObject) {
        return res
          .status(404)
          .send({ status: false, message: "Business No Found Given Id " });
      }

      let likes =
        businessObject && businessObject.likes ? businessObject.likes : [];

      if (!likes.includes(userId)) {
        // Add userId to likes array if it doesn't already exist
        likes.push(userId);
      } else {
        // Remove userId from likes array if it already exists
        likes = likes.filter((ele: any) => ele !== userId);
      }

      let updateBusinessLike = await Business.findByIdAndUpdate(
        businessId,
        {
          $set: {
            likes: likes,
          },
        },
        { new: true }
      );

      return res.status(201).send({ status: true, data: updateBusinessLike });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

// router.post(
//   "/v1/businesses/:businessId/userReview",
//   async (req: Request, res: Response) => {
//     try {
//       const { businessId } = req.params || {};

//       const {
//         userId,
//         keyword,
//         rating,
//         comment,
//         dateTime,
//         reviewerName,
//         description,
//         satisfactionRating,
//         mostLiked,
//         foodRating,
//         waiterRating,
//       } = req.body || {};
//       if (Object.keys(req.body).length === 0)
//         return res
//           .status(400)
//           .send({ status: false, message: "Body should be not empty !!" });
//       const businessObject = await Business.findById(businessId);

//       // console.log(businessExit)
//       if (!businessObject)
//         return res
//           .status(404)
//           .send({ status: false, message: "Business Not Found Given Id !!" });
//       const review = await Review.create({
//         businessId,
//         userId,
//         keyword,
//         rating,
//         comment,
//         dateTime,
//         businessLogo: businessObject?.logo,
//         businessName: businessObject?.businessName,
//         reviewerName,
//         description,
//         satisfactionRating,
//         mostLiked,
//         foodRating,
//         waiterRating,
//       });

//       return res.status(201).send(review);
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

// router.post(
//   "/v1/businesses/:businessId/:userId/user-trnsaction-history",
//   async (req: Request, res: Response) => {
//     try {
//       const { userId, businessId } = req.params || {};
//       const businessObject = await Business.findById(businessId);
//       if (!businessObject)
//         return res
//           .status(404)
//           .send({ status: false, message: "Not found.     " });
//       const {
//         order_id,
//         date,
//         phone_number,
//         cart,
//         payment_mode,
//         status,
//         deliver_to,
//         totalWithoutTax,
//         OtherCharges,
//         totalAmount,
//       } = req.body || {};
//       if (Object.keys(req.body).length === 0)
//         return res
//           .status(400)
//           .send({ status: false, message: "Body should be not Empty !!" });

//       const obj = {
//         userId,
//         businessId,
//         order_id,
//         phone_number,
//         cart,
//         payment_mode,
//         status,
//         deliver_to,
//         totalWithoutTax,
//         OtherCharges,
//         totalAmount,
//         date,
//         businessLogo: businessObject?.logo,
//         businessName: businessObject?.businessName,
//       };

//       let data = new userTransactionHistory(obj);
//       const userHistory = await data.save();

//       return res.status(201).send({ status: true, data: userHistory });
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
//   // validateUser,
//   //   validateRequest,
// );

// router.post("/v1/businesses/:id/roles", async (req: Request, res: Response) => {
//   const { name, description, permissions } = req.body;
//   const { id } = req.params;

//   const role = await Role.create({
//     name,
//     businessId: id,
//     description,
//     permissions,
//   });
//   res.status(201).send(role);
// });

router.post(
  "/v1/businesses/:id/loyalty",

  async (req: Request, res: Response) => {
    try {
      const { verify } = req.query;

      const { businessId, password } = req.body;
      if (verify) {
        let alert;
        try {
          alert = await axios.get(
            `${process.env.URL}/v1/payments/Get/Alert?loyalty=true&value=${password}`
          );
          alert = alert?.data;
          console.log("alert", alert);
        } catch (err: any) {
          console.log("err", err);
        }
        if (!alert) {
          return res.status(400).send("please enter valid password");
        }

        let ExitSetting = await LoyaltySettings.findOne({
          loyaltyId: alert?.businessId,
          origin: true,
        });
        if (!ExitSetting) {
          return res.status(400).send("Loyalty settings Not found ");
        }
        let newPass = Math.floor(Math.random() * 9000) + 10000;
        const alreadyExit = await LoyaltySettings.findOne({ businessId });
        if (alreadyExit) {
          return res.status(400).send("Loyalty Setting Already Created!!");
        }
        let data = new LoyaltySettings({
          businessId,
          loyaltyId: alert?.businessId,
          password: newPass,
          cardPattern: ExitSetting?.cardPattern,
          cardColor: ExitSetting?.cardColor,
          fontColor: ExitSetting?.fontColor,
          logo: ExitSetting?.logo,
          origin: false,
        });
        const saveLoyaltySetup = await data.save();

        return res.status(201).send(saveLoyaltySetup);
      }

      let ExitSetting = await LoyaltySettings.findOne({
        businessId,
      });

      if (ExitSetting) {
        return res.status(400).send("already exist");
      }
      let newPass = Math.floor(Math.random() * 9000) + 10000;
      let data = new LoyaltySettings({
        ...req.body,
        password: password || newPass,
      });
      const saveLoyaltySetup = await data.save();
      return res.status(201).send(saveLoyaltySetup);
    } catch (err: any) {
      console.log("err", err);
    }
  }
);

router.post(
  "/v1/businesses/:id/roles",

  async (req: Request, res: Response) => {
    const { name, description, permissions } = req.body;
    const { id } = req.params;

    const role = await Role.create({
      name,
      businessId: id,
      description,
      permissions,
    });

    res.status(201).send(role);
  }
);

export { router as createUserRouter };
