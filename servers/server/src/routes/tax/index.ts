import { Tax } from "@hi/db-models";
import { TaxTypeSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
//
const taxRouter = new Hono()
  .post("/", zValidator("json", TaxTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const existingTax = await Tax.findOne({
      name: requestData.name,
      businessId: requestData.businessId,
    });

    if (existingTax) {
      return c.json(
        {
          message: "Tax already exist",
          err: true,
          data: {},
        },
        409,
      );
    }

    const createTax = await Tax.create(requestData);

    if (!createTax) {
      return c.json(
        {
          message: "createTax not created",
          err: true,
          data: {},
        },
        400,
      );
    }

    return c.json(
      {
        message: "Tax created successfully",
        err: false,
        data: createTax,
      },
      201,
    );
  })

  .get(
    "/:businessId",
    zValidator("param", z.object({ businessId: z.string() })),
    async (c) => {
      const { businessId } = c.req.param();

      const taxes = await Tax.find({
        businessId: businessId,
      }).select("name value type");

      return c.json(
        {
          message: "Tax fetched successfully",
          err: false,
          data: taxes,
        },
        200,
      );
    },
  );

export default taxRouter;
