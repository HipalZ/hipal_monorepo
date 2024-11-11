import { cartSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
import { Cart } from "@hi/db-models";
//
const cartRouter = new Hono()
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const { id } = c.req.param();
      const cart = await Cart.findById(id);
      if (!cart) {
        return respond(c, "cart not found", true, 404, {});
      }
      return respond(c, "cart retrieved successfully", false, 200, cart);
    },
  )
  .get("/", async (c) => {
    const { tableName, businessId } = c.req.query();
    console.log(tableName, businessId);
    if (!tableName) {
      return respond(c, "table name is required", true, 400, {});
    }
    const carts = await Cart.find({ tableName, businessId });
    if (!carts || carts.length === 0) {
      return respond(c, "carts not found for the given table", true, 404, {});
    }
    return respond(c, "carts retrieved successfully", false, 200, carts);
  })
  .post(
    "/create",
    zValidator("json", cartSchema),

    async (c) => {
      const body = await c.req.json();
      const createCart = await Cart.create(body);
      if (!createCart) {
        return respond(c, "cart creation failed", true, 400, {});
      }
      return respond(c, "cart created successfully", false, 201, {
        cartID: createCart._id,
      });
    },
  );

export default cartRouter;
