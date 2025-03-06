import { Business, BusinessPosConfig, Pos } from "@hi/db-models";
import { Hono } from "hono";
//
const scriptRouter = new Hono().get("/pos_to_businessposconfig", async (c) => {
  const businesses = await Business.find();

  for (const business of businesses) {
    const businessId = business._id;
    const businessPosConfig = await BusinessPosConfig.findOne({ businessId });
    if (businessPosConfig) {
      const pos = await Pos.findOne({ _id: businessPosConfig.posId });
      if (pos) {
        await BusinessPosConfig.findOneAndUpdate(
          { businessId },
          {
            $set: {
              branchId: pos._id, /// ADD THIS LINE LATER
              accessKey: pos.accessKey,
              secretKey: pos.secretKey,
              restId: pos.restId,
              authToken: pos.authToken,
              posName: "PETPOOJA",
            },
          },
          { new: true },
        );
      }
    }
  }

  return c.json(
    {
      message: "Script executed successfully",
      err: false,
      data: {},
    },
    200,
  );
});

export default scriptRouter;
