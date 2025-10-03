import { Role, User } from "@hi/db-models";
import type { AddStaffValidatorType } from "@hi/db-models/src/validators";

import { addStaffValidator, roles } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../../utils/response";
import { createPermissionObject, hashPassword } from "../../users";
//
const admin = require("firebase-admin");

const userRouter = new Hono()

  .post(
    "/staff",

    zValidator("json", addStaffValidator),

    async (c) => {
      const requestData = await c.req.json();
      const {
        name,
        phone,
        businessId,
        role,
        permissionIds = [],
        permissionGroupIds = [],
        password,
      } = requestData as AddStaffValidatorType;
      const hashPass = await hashPassword(password);

      const existingUser = await User.findOne({
        phone,
      });

      if (existingUser) {
        const perObj = await createPermissionObject(
          permissionIds,
          permissionGroupIds,
        );
        const customRole = {
          businessId,
          role,

          permissionGroupIds,
          default: false,
          isDeleted: false,
          permissions: perObj,
          permissionIds,
        };

        const updateUser = await User.findOneAndUpdate(
          { phone },
          {
            $addToSet: {
              customRole: customRole,
              password: hashPass,
            },
          },
          { new: true },
        );

        return c.json({
          message: "Staff added successfully",
          data: { user: updateUser },
          err: false,
        });
      }

      const perObj = await createPermissionObject(
        permissionIds,
        permissionGroupIds,
      );

      const customRole = {
        businessId,
        role,

        permissionGroupIds,
        default: false,
        isDeleted: false,
        permissions: perObj,
        permissionIds,
      };

      const user = await User.create({
        name,
        phone,
        role: roles,
        customRole: [customRole],
        password: hashPass,
      });

      return c.json({
        message: "Staff created successfully",
        data: { user },
        err: false,
      });
    },
  )
  .put(
    "/staff/:staffId",
    zValidator(
      "json",
      z.object({
        businessId: z.string(),
        name: z.string().min(2).max(30).optional(),
        role: z.string().optional(),
        permissionIds: z.array(z.string()).optional().default([]),
        permissionGroupIds: z.array(z.string()).optional().default([]),
        removePermissionIds: z.array(z.string()).optional().default([]),
        removePermissionGroupIds: z.array(z.string()).optional().default([]),
        bookMark: z.boolean().optional(),
      }),
    ),
    zValidator("param", z.object({ staffId: z.string().min(24).max(24) })),
    async (c) => {
      const requestData = await c.req.json();
      const {
        name,
        role,
        permissionIds = [],
        permissionGroupIds = [],
        removePermissionIds = [],
        removePermissionGroupIds = [],
        businessId,
        bookMark,
        staffId,
      } = requestData;

      const existingUser = await User.findById(staffId);

      if (!existingUser) {
        return c.json(
          {
            message: "Staff not found",
            data: {},
            err: true,
          },
          404,
        );
      }

      if (removePermissionIds.length > 0) {
        await User.findOneAndUpdate(
          {
            _id: staffId,
            "customRole.businessId": businessId,
          },
          {
            $pull: {
              "customRole.permissionIds": {
                $in: removePermissionIds,
              },
            },
          },
        );
      }

      if (removePermissionGroupIds.length > 0) {
        await User.findOneAndUpdate(
          {
            _id: staffId,
            "customRole.businessId": businessId,
          },
          {
            $pull: {
              "customRole.permissionGroupIds": {
                $in: removePermissionGroupIds,
              },
            },
          },
        );
      }

      const perObj = await createPermissionObject(
        permissionIds,
        permissionGroupIds,
      );

      const customRole = {
        businessId,
        role,
        permissionGroupIds,
        default: false,
        isDeleted: false,
        permissions:
          permissionGroupIds.length > 0 || permissionIds.length > 0
            ? perObj
            : {},
        permissionIds,
      };

      await User.findOneAndUpdate(
        {
          _id: staffId,
          "customRole.businessId": businessId,
        },
        {
          $set: {
            "customRole.$": customRole,
            name: name || undefined,
            bookMark: bookMark,
          },
        },
      );

      return c.json({
        message: "Staff updated successfully",
        data: {},
        err: false,
      });
    },
  )

  .get(
    "/staff",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();
      const existingUser = await User.find({
        customRole: {
          $elemMatch: {
            businessId: businessId,
            isDeleted: false,
          },
        },
      }).select({
        name: 1,
        phone: 1,
        customRole: {
          $elemMatch: {
            businessId: businessId,
            isDeleted: false,
          },
        },
      });

      return respond(c, "Staff fetched successfully", false, 200, existingUser);
    },
  )
  .get(
    "/staff/role",
    zValidator(
      "query",
      z.object({
        businessId: z.string().min(24).max(24),
      }),
    ),
    async (c) => {
      const { businessId } = c.req.query();
      const existingRoles = await Role.find({}).select("name -_id");

      return respond(c, "roles found", false, 200, existingRoles);
    },
  );

export default userRouter;
