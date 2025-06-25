import { Tax } from "@hi/db-models";
import {
  TaxTypeSchema,
  updateTaxTypeSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
//
const taxRouter = new Hono()
  .post("/", zValidator("json", TaxTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const taxName = requestData.name.trim().toLowerCase();

    const existingTax = await Tax.findOne({
      name: taxName,
      businessId: requestData.businessId,
      menuId: requestData.menuId,
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

    const createTax = await Tax.create({
      ...requestData,
      name: taxName,
    });

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
        data: {
          _id: createTax._id,
        },
      },
      201,
    );
  })

  .put("/", zValidator("json", updateTaxTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const { taxId, name, value, menuId } = requestData;

    const tax = await Tax.findByIdAndUpdate(
      taxId,
      { $set: { name, value, menuId } },
      { new: true },
    );

    if (!tax) {
      return respond(c, "Tax not found", true, 404, {});
    }

    return respond(c, "Tax updated successfully", false, 200, {
      _id: tax._id,
    });
  })

  .put(
    "/tax_status",
    zValidator(
      "json",
      z.object({ isActive: z.boolean(), taxId: z.string().min(24).max(24) }),
    ),
    async (c) => {
      const requestData = await c.req.json();

      const { taxId, isActive } = requestData;

      const tax = await Tax.findByIdAndUpdate(
        taxId,
        { $set: { isActive } },
        { new: true },
      );

      if (!tax) {
        return respond(c, "Tax not found", true, 404, {});
      }

      return respond(c, "Tax updated successfully", false, 200, {
        _id: tax._id,
      });
    },
  )

  .get(
    "/:taxId",
    zValidator("param", z.object({ taxId: z.string() })),
    async (c) => {
      const { taxId } = c.req.param();

      const tax = await Tax.findById(taxId).select(
        "-__v -createdAt -updatedAt -isDeleted",
      );

      if (!tax) {
        return respond(c, "Tax not found", true, 404, {});
      }

      return respond(c, "Tax fetched successfully", false, 200, tax);
    },
  )

  .get(
    "/",
    zValidator(
      "query",
      z.object({ businessId: z.string(), menuId: z.string() }),
    ),
    async (c) => {
      const { businessId, menuId } = c.req.query();
      const taxes = await Tax.find({
        businessId,
        menuId,
        isActive: true,
        isDeleted: false,
      }).select("-__v -createdAt -updatedAt -isDeleted");

      return respond(c, "Taxes fetched successfully", false, 200, taxes);
    },
  );

export default taxRouter;
