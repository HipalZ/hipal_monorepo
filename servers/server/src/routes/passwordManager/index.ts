import { PasswordManager } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";

const passwordManagerRouter = new Hono()

  .post(
    "/verify_discount_password",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(24),
        password: z.string().min(4).max(15),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId, password } = await c.req.json();
        const passwordManager = await PasswordManager.findOne({
          businessId,
          name: "DISCOUNT",
          password,
          isActive: true,
        });

        if (!passwordManager) {
          return respond(c, "Password not found", true, 404, {});
        }

        return respond(c, "Password verified successfully", false, 200, {
          _id: passwordManager._id,
        });
      });
    },
  )

  .post(
    "/verify_delete_kot_password",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(24),
        password: z.string().min(4).max(15),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId, password } = await c.req.json();
        const passwordManager = await PasswordManager.findOne({
          businessId,
          name: "DELETE_KOT",
          password,
          isActive: true,
        });
        if (!passwordManager) {
          return respond(c, "Password not found", true, 404, {});
        }
        return respond(c, "Password verified successfully", false, 200, {
          _id: passwordManager._id,
        });
      });
    },
  )

  .post(
    "/verify_service_charge_password",
    zValidator(
      "json",
      z.object({
        businessId: z.string().min(1).max(24),
        password: z.string().min(4).max(15),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId, password } = await c.req.json();
        const passwordManager = await PasswordManager.findOne({
          businessId,
          name: "SERVICE_CHARGE",
          password,
          isActive: true,
        });
        if (!passwordManager) {
          return respond(c, "Password not found", true, 404, {});
        }
        return respond(c, "Password verified successfully", false, 200, {
          _id: passwordManager._id,
        });
      });
    },
  )
  .put(
    "/discount",
    zValidator(
      "json",
      z.object({
        discountPasswordId: z.string().min(1).max(24),
        password: z.string().min(4).max(15).optional(),
        isActive: z.boolean().optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { discountPasswordId, password, isActive } = await c.req.json();

        const discountPassWord =
          await PasswordManager.findById(discountPasswordId);

        if (!discountPassWord) {
          return respond(c, "Password not found", true, 404, {});
        }

        const updatePassword = await PasswordManager.findOneAndUpdate(
          { _id: discountPasswordId },
          { password, isActive },
          { new: true, session },
        );

        if (!updatePassword) {
          return respond(c, "Password not found", true, 400, {});
        }

        return respond(c, "Password updated successfully", false, 200, {
          _id: updatePassword._id,
        });
      });
    },
  )

  .put(
    "/service_charge",
    zValidator(
      "json",
      z.object({
        serviceChargePasswordId: z.string().min(1).max(24),
        password: z.string().min(4).max(15).optional(),
        isActive: z.boolean().optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { serviceChargePasswordId, password, isActive } =
          await c.req.json();

        const discountPassWord = await PasswordManager.findById(
          serviceChargePasswordId,
        );

        if (!discountPassWord) {
          return respond(c, "Password not found", true, 404, {});
        }

        const updatePassword = await PasswordManager.findOneAndUpdate(
          { _id: serviceChargePasswordId },
          { password, isActive },
          { new: true, session },
        );

        if (!updatePassword) {
          return respond(c, "Password not found", true, 400, {});
        }

        return respond(c, "Password updated successfully", false, 200, {
          _id: updatePassword._id,
        });
      });
    },
  )
  .put(
    "/delete_kot",
    zValidator(
      "json",
      z.object({
        deletePasswordId: z.string().min(1).max(24),
        password: z.string().min(4).max(15).optional(),
        isActive: z.boolean().optional(),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { deletePasswordId, password, isActive } = await c.req.json();

        const deletePassWord = await PasswordManager.findById(deletePasswordId);
        if (!deletePassWord) {
          return respond(c, "Password not found", true, 404, {});
        }

        const updatePassword = await PasswordManager.findOneAndUpdate(
          { _id: deletePasswordId },
          { password, isActive },
          { new: true, session },
        );

        if (!updatePassword) {
          return respond(c, "Password not found", true, 400, {});
        }

        return respond(c, "Password updated successfully", false, 200, {
          _id: updatePassword._id,
        });
      });
    },
  )

  .get(
    "/fetch_password",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId } = c.req.query();

        const passwords = await PasswordManager.find({ businessId }).select(
          "name password isActive",
        );

        return respond(
          c,
          "Passwords fetched successfully",
          false,
          200,
          passwords,
        );
      });
    },
  )
  .get(
    "/fetch_without_password",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(1).max(24),
      }),
    ),
    async (c) => {
      //@ts-ignore
      return runInTransaction(async (session) => {
        const { businessId } = c.req.query();

        const passwords = await PasswordManager.find({ businessId }).select(
          "name isActive",
        );

        return respond(
          c,
          "Passwords fetched successfully",
          false,
          200,
          passwords,
        );
      });
    },
  );

export default passwordManagerRouter;
