import express, { Request, Response } from "express";
import { Business } from "@hi/db-models";

const router = express.Router();

router.delete(
  "/v1/businesses/:businessId",

  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const existingBusiness = await Business.findByIdAndDelete(businessId);
    res.status(200).send({});
  }
);

export { router as deleteBusinessesRouter };
