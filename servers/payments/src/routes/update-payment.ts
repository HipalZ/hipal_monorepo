import express, { Request, Response } from "express";

import moment from "moment";

import { Payment, Dues } from "@hi/db-models";
const router = express.Router();

router.put(
  "/v1/payments/:id",

  // requireAuthorization([ClientRoles.RESTAURANT_OWNER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { remove } = req.query;
    const update = { ...req.body };
    if (remove) {
      const existingPayment = await Payment.findByIdAndDelete(id);

      res.status(200).send(existingPayment);
    }

    const existingPayment = await Payment.findByIdAndUpdate(id, update);

    res.status(200).send(existingPayment);
  }
);

router.put("/v1/payments/Settle/Dues", async (req: Request, res: Response) => {
  const { paymentIds, mode } = req.body;
  let currentTime = Date.now();
  let momentTime = moment(currentTime);

  let Time = momentTime.clone().utcOffset("+05:30");
  var indianTime = momentTime.clone().utcOffset("+05:30").format("HH:mm");

  let dayAndDate = Time.format("DD-MM-YYYY");

  for (let i = 0; i < paymentIds?.length; i++) {
    let id = paymentIds[i];
    await Payment.findByIdAndUpdate(
      id,
      { settle: true, mode, paymentDate: dayAndDate, time: indianTime },
      {
        new: true,
      }
    );
  }

  res.status(200).send("Settle SuccessFully");
});

router.put(
  "/v1/payments/:id/deleteDues/:duesId",
  async (req: Request, res: Response) => {
    try {
      let { duesId } = req.params;

      const existingDues = await Dues.findByIdAndDelete(duesId);
      if (!existingDues) {
        return res.status(404).send("Dues Not Found..");
      }

      return res.status(200).send(existingDues);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    }
  }
);

export { router as updatePaymentsRouter };
