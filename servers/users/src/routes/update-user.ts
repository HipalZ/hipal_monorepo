import express, { Request, Response } from "express";

const router = express.Router();
import {
  Admin,
  User,
  UserReward,
  UserRewardHistory,
  UrlModel,
} from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { ClientSession } from "mongoose";
import moment from "moment";


router.put("/v1/users", (req: Request, res: Response) => {
  const { action } = req.query;

  if (action === "logout") {
    req.session = null;
    res.send({});
  }
});

router.put(
  "/v1/users/:userId/updateUser",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params || {};
      const data = req.body || {};
      const userObject = await User.findById(userId);
      // return res.send(userObject);

      if (!userObject)
        return res
          .status(400)
          .send({ status: false, message: "User Not Found Given Id !!! " });

      const updateUserObject = await User.findByIdAndUpdate(userId, data, {
        new: true,
      });
      return res.status(200).send({ status: true, data: updateUserObject });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);









export { router as updateUserRouter };
