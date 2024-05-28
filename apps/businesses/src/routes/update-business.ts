import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { Business } from "../models/business";
import { LoyaltySettings } from "../models/loyaltySetting";
import axios from "axios";
import { Review } from "../models/userReview";
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

    if (!existingBusiness) {
      throw new NotFoundError();
    }

    res.status(200).send(existingBusiness);
  }
);

router.put(
  "/v1/businesses/:id/reviews/:reviewId",
  currentUser,
  async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params;
      const update = { ...req.body };
      const existingReview = await Review.findByIdAndUpdate(reviewId, update, {
        new: true,
      });

      if (!existingReview) {
        throw new NotFoundError();
      }
      res.status(200).send(existingReview);
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.put(
  "/v1/businesses/:id/updateLoyalty",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
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

    if (!existingLoyalty) {
      throw new NotFoundError();
    }

    res.status(200).send(existingLoyalty);
  }
);

router.put(
  "/v1/businesses/update/Business",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
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

    if (!existingBusiness) {
      throw new NotFoundError();
    }

    res.status(200).send(existingBusiness);
  }
);

router.put(
  "/v1/businesses/:id/removalServiceCharge",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER, ClientRoles.HIPAL_ADMIN]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      password,
      tableId,
      reapply,
      serviceChargeRemovedBy,
      serviceChargeAddedBy,
    } = req.body;
    const existingBusiness = await Business.findOne({
      _id: id,
      serviceChargeRemovalPass: password,
    });
    if (!existingBusiness) {
      throw new NotFoundError();
    }
    const con = {
      method: "put",
      url: `${process.env.URL}/v1/kitchens/:id/serviceCharge`,
      data: { tableId, reapply, serviceChargeRemovedBy, serviceChargeAddedBy },
    };
    await axios(con);

    res
      .status(200)
      .send(`Service charge ${reapply ? "Added" : "removed"} successfully`);
  }
);

export { router as updateBusinessRouter };
