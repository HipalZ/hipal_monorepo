import express, { Request, Response } from "express";
import axios from "axios";
import { Business, LoyaltySettings, Tempmodel } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
const router = express.Router();

router.put(
  "/v1/businesses/:id",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const update = { ...req.body };
    const existingBusiness = await Business.findByIdAndUpdate(id, update, {
      new: true,
    });

    res.status(200).send(existingBusiness);
  }
);

router.put(
  "/v1/businesses/:id/updateLoyalty",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      setReward,
      setClaimAmount,
      password,
      origin,
      cardPattern,
      cardColor,
      fontColor,
      logo,
      expiryDate,
      rewardLimit,
    } = req.body;
    const existingLoyalty = await LoyaltySettings.findOneAndUpdate(
      { businessId: id },
      {
        setReward,
        setClaimAmount,
        password,
        origin,
        cardPattern,
        cardColor,
        fontColor,
        logo,
        expiryDate,
        rewardLimit,
      },
      {
        new: true,
      }
    );
    res.status(200).send(existingLoyalty);
  }
);

router.put(
  "/v1/businesses/update/Business",
  async (req: Request, res: Response) => {
    const { isHasDishData, isHasSetting, id } = req.query;
    let existingBusiness;
    if (isHasDishData) {
      existingBusiness = await Business.findByIdAndUpdate(
        id,
        { isHasDishData: true },
        {
          new: true,
        }
      );
    }
    if (isHasSetting) {
      existingBusiness = await Business.findByIdAndUpdate(
        id,
        { isHasSetting: true },
        {
          new: true,
        }
      );
    }
    res.status(200).send(existingBusiness);
  }
);

router.put(
  "/v1/businesses/:id/removalServiceCharge",

  async (req: Request, res: Response) => {
    const { id } = req.params;
    let {
      password,
      tableId,
      reapply,
      serviceChargeRemovedBy,
      serviceChargeAddedBy,
    } = req.body;
    return runInTransaction(async (session: ClientSession) => {
      if (reapply) {
        serviceChargeRemovedBy = "";
      }
      if (!reapply) {
        serviceChargeAddedBy = "";
      }
      const business = await Business.findById(
        { _id: id, password },
        { session }
      );
      if (!business) {
        return res.status(400).send("Business not found");
      }

      const serviceChargeisExist = await Tempmodel.findOne(
        {
          tableId,
          serviceChargeApply: true,
        },
        { session }
      );

      if (serviceChargeisExist && reapply) {
        return res.status(400).send("Service Charge is already applied");
      }

      const updateServiceCharge = await Tempmodel.findOneAndUpdate(
        { tableId: tableId },
        {
          $set: {
            serviceChargeApply: reapply ? true : false,
            serviceChargeRemovedBy,
            serviceChargeAddedBy,
          },
        },

        { session }
      );

      res
        .status(200)
        .send(`Service charge ${reapply ? "Added" : "removed"} successfully`);
    });
  }
);

export { router as updateBusinessRouter };
