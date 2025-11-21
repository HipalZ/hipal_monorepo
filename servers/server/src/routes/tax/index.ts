import { Dish, Menu, Tax, TaxName } from "@hi/db-models";
import {
  TaxTypeSchema,
  updateTaxTypeSchema,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { addInTempMenuChanges } from "../../services/tempMenuChanges";
import { respond } from "../../utils/response";
//

function extractGstRate(name: string): number {
  const match = name.match(/\((\d+)%\)/);
  if (!match) {
    throw new Error(`Could not parse GST rate from "${name}"`);
  }
  return Number(match[1]);
}
const taxRouter = new Hono()
  .post("/", zValidator("json", TaxTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const taxName = requestData.name.trim().toLowerCase();

    if (taxName.includes("gst")) {
      const rateInName = extractGstRate(taxName);
      if (rateInName !== requestData.value) {
        throw new Error(
          `GST mismatch: name indicates ${rateInName}%, but payload has ${requestData.value}%`,
        );
      }
    }

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

  .post(
    "/link_dishes",
    zValidator(
      "json",
      z.object({
        dishIds: z.array(z.string().min(24).max(24)),
        taxId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { dishIds, taxId } = await c.req.json();

        const tax = await Tax.findById(taxId).session(session);
        if (!tax) {
          return respond(c, "Tax not found", true, 404, {});
        }

       

       

        const result = await Dish.updateMany(
          { _id: { $in: dishIds } },
          { $set: { gst: tax.value } },
          { session },
        );

        if (result.modifiedCount < 1) {
          return respond(
            c,
            "No dishes were linked (maybe already set)",
            true,
            400,
            {},
          );
        }

        return respond(c, "Dishes linked successfully", false, 200, {
          taxId: tax._id.toString(),
        });
      });
    },
  )

  .post(
    "/unlink_dishes",
    zValidator(
      "json",
      z.object({
        dishIds: z.array(z.string().min(24).max(24)),
        taxId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session: ClientSession) => {
        const { dishIds, taxId } = await c.req.json();

        const tax = await Tax.findById(taxId).session(session);
        if (!tax) {
          return respond(c, "Tax not found", true, 404, {});
        }

      

       

        const result = await Dish.updateMany(
          { _id: { $in: dishIds } },
          { $set: { gst: 0 } },
          { session },
        );

        return respond(c, "Dishes unlinked successfully", false, 200, {
          taxId: tax._id,
        });
      });
    },
  )

  .put("/", zValidator("json", updateTaxTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const { taxId, name, value, menuId } = requestData;

    const findTax = await Tax.findById(taxId);
    if (!findTax) {
      return respond(c, "Tax not found", true, 404, {});
    }

    if (findTax.name.includes("gst")) {
      const rateInName = extractGstRate(findTax.name);
      if (rateInName !== value) {
        throw new Error(
          `GST mismatch: name indicates ${rateInName}%, but payload has ${value}%`,
        );
      }
    }

  

    const tax = await Tax.findByIdAndUpdate(
      taxId,
      { $set: { value, menuId } },
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
        return respond(c, "Menu not found", true, 404, {});
      }

      const menu = await Menu.findById(tax.menuId);

  

      return respond(c, "Tax updated successfully", false, 200, {
        _id: tax._id,
      });
    },
  )

   .put("/service_charge", zValidator("json", updateTaxTypeSchema), async (c) => {
    const requestData = await c.req.json();

    const { taxId, name, value, menuId } = requestData;

    const findTax = await Tax.findById(taxId);
    if (!findTax) {
      return respond(c, "Tax not found", true, 404, {});
    }

    if (findTax.name.includes("gst")) {
      const rateInName = extractGstRate(findTax.name);
      if (rateInName !== value) {
        throw new Error(
          `GST mismatch: name indicates ${rateInName}%, but payload has ${value}%`,
        );
      }
    }

  

    const tax = await Tax.findByIdAndUpdate(
      taxId,
      { $set: { value, menuId } },
      { new: true },
    );

    if (!tax) {
      return respond(c, "Tax not found", true, 404, {});
    }

    

    return respond(c, "Tax updated successfully", false, 200, {
      _id: tax._id,
    });
  })

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
  )
  .get(
    "/tax_name/fetch_all",

    async (c) => {
      const taxeNames = await TaxName.find({});

      return respond(c, "Taxes fetched successfully", false, 200, taxeNames);
    },
  );

export default taxRouter;
