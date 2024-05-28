import express, { Request, Response } from "express";

import { Settings } from "@hi/db-models";

const router = express.Router();

router.delete(
  "/v1/settings/:id",

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingSettings = await Settings.findByIdAndDelete(id);

    res.status(200).send({});
  }
);

export { router as deleteSettingsRouter };
