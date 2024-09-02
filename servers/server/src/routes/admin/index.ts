import { Admin, Business } from "@hi/db-models";
import { adminSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
// books.ts
import { Hono } from "hono";
import { z } from "zod";
import {
  createAccessToken,
  createRefreshToken,
  hashPassword,
  verifyPassword,
} from "../users";
const adminRouter = new Hono()
  .post("/signUp", zValidator("json", adminSchema), async (c) => {
    const requestData = await c.req.json();
    const { phone, password } = requestData;
    const existingAdmin = await Admin.findOne({ phone });
    if (existingAdmin) {
      return c.json(
        { message: "Admin already exists", err: true, data: {} },
        409,
      );
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = new Admin({
      phone,
      password: hashedPassword,
    });

    await newAdmin.save();

    if (!newAdmin) {
      return c.json({ message: "Admin not created", err: true, data: {} }, 400);
    }

    return c.json(
      {
        message: "Admin created",
        err: false,
        data: {
          phone: newAdmin.phone,
          _id: newAdmin._id,
          role: newAdmin.role,
        },
      },
      201,
    );
  })
  .post("/signIn", zValidator("json", adminSchema), async (c) => {
    const requestData = await c.req.json();
    const { phone, password } = requestData;
    const admin = await Admin.findOne({ phone });

    if (!admin) {
      return c.json({ message: "Admin not found", err: true, data: {} }, 404);
    }

    const verifyPass = await verifyPassword(password, admin.password);

    if (!verifyPass) {
      return c.json({ message: "Invalid password", err: true, data: {} }, 400);
    }

    const accessToken = createAccessToken(admin._id.toString(), "HIPAL_ADMIN");
    const refreshToken = createRefreshToken(
      admin._id.toString(),
      "HIPAL_ADMIN",
    );

    return c.json(
      {
        message: "Admin found",
        err: false,
        data: {
          user: {
            phone: admin.phone,
            role: admin.role,
            _id: admin._id,
          },
          accessToken,
          refreshToken,
        },
      },
      200,
    );
  })
  .get(
    "/businesses",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.HIPAL_ADMIN]),

    async (c) => {
      const businesses = await Business.find()
        .sort({ _id: -1 })
        .select("status name _id ");

      if (!businesses) {
        return c.json(
          { message: "Businesses not found", err: true, data: {} },
          404,
        );
      }

      return c.json(
        { message: "Businesses found", err: false, data: businesses },
        200,
      );
    },
  )
  .put(
    "/:businessId/activate",
    // authTokenValidator,
    // requireAuthorization([ClientRoles.HIPAL_ADMIN]),
    zValidator(
      "param",
      z.object({
        businessId: z.string({
          message: "Business id must be a string",
        }),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const business = await Business.findById(businessId);

      if (!business) {
        return c.json(
          { message: "Business not found", err: true, data: {} },
          404,
        );
      }

      const updatedBusiness = await Business.findByIdAndUpdate(businessId, {
        status: true,
      });

      if (!updatedBusiness) {
        return c.json(
          { message: "Business not activated", err: true, data: {} },
          400,
        );
      }

      return c.json(
        { message: "Business activated", err: false, data: business },
        200,
      );
    },
  );
//

export default adminRouter;
