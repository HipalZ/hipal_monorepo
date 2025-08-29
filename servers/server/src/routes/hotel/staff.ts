import { HotelRoom, HotelStaffRole, User } from "@hi/db-models";
import {
  type AddHotelStaffType,
  addHotelStaff,
  deleteHotelStaff,
  editHotelStaff,
  hotelStaffRole,
  roles,
} from "@hi/db-models/src/validators";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
import { hashPassword } from "../users";

const staffRouter = new Hono()

  .get(
    "/fetch_roles",

    async (c) => {
      const hotelStaffRoles = await HotelStaffRole.find({}).lean();

      return respond(c, "All staffroles", false, 200, hotelStaffRoles);
    },
  )

  .get(
    "/fetch_staff",
    zValidator(
      "query",
      z.object({ staffId: z.string(), businessId: z.string() }),
    ),

    async (c) => {
      const { staffId, businessId } = c.req.query();
      const hotelStaff = await User.findOne({
        _id: staffId,
        customRole: { $elemMatch: { businessId } },
      }).select(
        "-password -__v -createdAt -updatedAt -email -role -isDeleted ",
      );

      if (!hotelStaff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      return respond(c, "Staff found", false, 200, hotelStaff);
    },
  )

  .get(
    "/fetch_staffs",
    zValidator("query", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.query();
      const hotelStaff = await User.find({
        customRole: { $elemMatch: { businessId, isDeleted: false } },
      }).select(
        "-password -__v -createdAt -updatedAt -email -role -isDeleted ",
      );

      return respond(c, "Staff found", false, 200, hotelStaff);
    },
  )

  .post("/add_role", zValidator("json", hotelStaffRole), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      const { role } = requestData;

      const roleAlreadyExists = await HotelStaffRole.exists({
        role,
      });

      if (roleAlreadyExists) {
        return respond(c, "Role already exists", true, 409, {});
      }

      const newRole = new HotelStaffRole(requestData);

      await newRole.save({ session });

      if (!newRole) {
        throw new Error("Error adding role");
      }

      return respond(c, "Role added successfully", false, 201, {
        _id: newRole._id,
      });
    });
  })

  .post("/add_staff", zValidator("json", addHotelStaff), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { role, name, phone, businessId, password, nickName, serviceIds } =
        requestData as AddHotelStaffType;

      const existingStaff = await User.findOne({
        customRole: { $elemMatch: { businessId } },
        phone,
      });

      const customRole = {
        businessId,
        role,
        default: false,
        isDeleted: false,
        nickName: nickName ?? name,
        serviceIds: serviceIds ?? [],
      };
      const hashPass = await hashPassword(password ?? "6344");

      if (existingStaff) {
        const updatedStaff = await User.findOneAndUpdate(
          {
            phone,
          },
          {
            $addToSet: { customRole },
            name: name ?? existingStaff.name,

            password: hashPass,
          },
          { new: true, session, upsert: true },
        );

        if (!updatedStaff) {
          return respond(c, "Staff role exist", false, 409, {});
        }

        return respond(c, "Staff role updated successfully", false, 200, {
          _id: updatedStaff._id,
        });
      }

      const newStaff = await User.create(
        [
          {
            name,
            phone,
            role: roles,
            customRole: [customRole],
            password: hashPass,
          },
        ],
        { session },
      );

      if (!newStaff || newStaff.length === 0) {
        throw new Error("Error adding staff");
      }

      return respond(c, "Staff added successfully", false, 201, {
        _id: newStaff[0]._id,
      });
    });
  })

  .put("/edit_staff", zValidator("json", editHotelStaff), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { staffId, businessId, role, nickName, serviceIds, name } =
        requestData;

      const staff = await User.findById(staffId).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRoleIndex = staff.customRole.findIndex(
        (r) => r.businessId.toString() === businessId,
      );

      if (customRoleIndex === -1) {
        return respond(
          c,
          "Business role not found for this staff",
          true,
          404,
          {},
        );
      }

      const updatedCustomRole = [...staff.customRole];
      updatedCustomRole[customRoleIndex] = {
        ...updatedCustomRole[customRoleIndex],
        role,
        serviceIds: serviceIds || updatedCustomRole[customRoleIndex].serviceIds,
        nickName: nickName || updatedCustomRole[customRoleIndex].nickName,
      };

      const updatedStaff = await User.findByIdAndUpdate(
        staffId,
        { customRole: updatedCustomRole, name: name || staff.name },
        { new: true },
      );

      if (!updatedStaff) {
        return respond(c, "Error updating staff role", true, 500, {});
      }

      return respond(
        c,
        "Staff role updated successfully",
        false,
        200,
        updatedStaff,
      );
    });
  })

  .delete("/delete_staff", zValidator("json", deleteHotelStaff), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { staffId, businessId } = requestData;

      const staff = await User.findById(staffId).lean();

      if (!staff) {
        return respond(c, "Staff not found", true, 404, {});
      }

      const customRoleIndex = staff.customRole.findIndex(
        (r) => r.businessId.toString() === businessId,
      );

      if (customRoleIndex === -1) {
        return respond(
          c,
          "Business role not found for this staff",
          true,
          404,
          {},
        );
      }

      const updatedCustomRole = [...staff.customRole];
      updatedCustomRole[customRoleIndex] = {
        ...updatedCustomRole[customRoleIndex],
        isDeleted: true,
      };

      const updatedStaff = await User.findByIdAndUpdate(
        staffId,
        { customRole: updatedCustomRole },
        { new: true, session },
      );

      if (!updatedStaff) {
        return respond(c, "Error deleting staff role", true, 500, {});
      }

      await HotelRoom.updateMany(
        { staffIds: staffId },
        { $pull: { staffIds: staffId } },
        { session },
      );

      return respond(c, "Staff role deleted successfully", false, 200, {
        _id: staffId,
      });
    });
  });

export default staffRouter;
