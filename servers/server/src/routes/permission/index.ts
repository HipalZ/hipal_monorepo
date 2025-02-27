import { StaffPermission, StaffPermissionGroup } from "@hi/db-models";
import {
  permissionGroupSchema,
  permissionSchema,
} from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const permissionRouter = new Hono()
  .post("/group", zValidator("json", permissionGroupSchema), async (c) => {
    const { name, permissions } = await c.req.json();

    const existingPermission = await StaffPermissionGroup.findOne({
      name,
    });

    if (existingPermission) {
      return c.json({
        message: "Permission group already exists",
        err: true,
      });
    }

    const newPermission = new StaffPermissionGroup({
      name,
      permissions,
    });

    await newPermission.save();

    return c.json({
      message: "Permission group created",
      data: {},
      err: false,
    });
  })
  .post("/", zValidator("json", permissionSchema), async (c) => {
    const { name } = await c.req.json();

    const existingPermission = await StaffPermission.findOne({
      name,
    });

    if (existingPermission) {
      return c.json({
        message: "Permission already exists",
        err: true,
      });
    }

    const newPermission = new StaffPermission({
      name,
    });

    await newPermission.save();

    return c.json({
      message: "Permission created",
      data: {},
      err: false,
    });
  })

  .get("/group", async (c) => {
    const permissionGroups = await StaffPermissionGroup.find();

    return c.json({
      message: "Permission groups",
      data: permissionGroups,
      err: false,
    });
  })
  .get("/", async (c) => {
    const permissions = await StaffPermission.find().select("name");

    return c.json({
      message: "Permissions",
      data: permissions,
      err: false,
    });
  });

export default permissionRouter;
