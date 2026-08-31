import { HotelRoom, HotelStaffLevel, HotelStaffRole, Kitchen, User } from '@hi/db-models';
import { type AddHotelStaffType, addHotelStaff, deleteHotelStaff, editHotelStaff, hotelStaffRole, roles } from '@hi/db-models/src/validators';
import { runInTransaction } from '@hi/utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '../../utils/response';
import { hashPassword } from '../users';

const matchesBusiness = (role: any, businessId: string) => String(role?.businessId) === String(businessId);

const isActiveRole = (role: any, businessId: string) => matchesBusiness(role, businessId) && role?.isDeleted !== true;

const findActiveRoleIndex = (roles: any[], businessId: string) => roles.findIndex((role) => isActiveRole(role, businessId));

const findDeletedRoleIndex = (roles: any[], businessId: string) => roles.findIndex((role) => matchesBusiness(role, businessId) && role?.isDeleted === true);

const staffRouter = new Hono()

  .get(
    '/fetch_roles',

    async (c) => {
      const hotelStaffRoles = await HotelStaffRole.find({}).lean();

      return respond(c, 'All staffroles', false, 200, hotelStaffRoles);
    },
  )

  .get(
    '/fetch_staff',
    zValidator('query', z.object({ staffId: z.string(), businessId: z.string() })),

    async (c) => {
      const { staffId, businessId } = c.req.query();
      const hotelStaff = await User.findOne({
        _id: staffId,
        customRole: { $elemMatch: { businessId, isDeleted: { $ne: true } } },
      })
        .select('-password -__v -createdAt -updatedAt -email -role -isDeleted ')
        .lean();

      if (!hotelStaff) {
        return respond(c, 'Staff not found', true, 404, {});
      }

      return respond(c, 'Staff found', false, 200, {
        ...hotelStaff,
        customRole: (hotelStaff.customRole || []).filter((role) => isActiveRole(role, businessId)),
      });
    },
  )

  .get(
    '/fetch_staffs',
    zValidator('query', z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.query();
      const hotelStaff = await User.find({
        customRole: { $elemMatch: { businessId, isDeleted: { $ne: true } } },
      })
        .select('-password -__v -createdAt -updatedAt -email -role -isDeleted ')
        .lean();

      const activeHotelStaff = hotelStaff.map((staff) => ({
        ...staff,
        customRole: (staff.customRole || []).filter((role) => isActiveRole(role, businessId)),
      }));

      return respond(c, 'Staff found', false, 200, activeHotelStaff);
    },
  )

  .post('/add_role', zValidator('json', hotelStaffRole), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();

      const { role } = requestData;

      const roleAlreadyExists = await HotelStaffRole.exists({
        role,
      });

      if (roleAlreadyExists) {
        return respond(c, 'Role already exists', true, 409, {});
      }

      const newRole = new HotelStaffRole(requestData);

      await newRole.save({ session });

      if (!newRole) {
        throw new Error('Error adding role');
      }

      return respond(c, 'Role added successfully', false, 201, {
        _id: newRole._id,
      });
    });
  })

  .post('/add_staff', zValidator('json', addHotelStaff), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { role, name, phone, businessId, password, nickName, serviceIds, restaurantIds } = requestData as AddHotelStaffType;

      const existingStaff = await User.findOne({
        phone,
      });

      const customRole = {
        businessId,
        role,
        default: false,
        isDeleted: false,
        nickName: nickName ?? name,
        serviceIds: serviceIds ?? [],
        restaurantIds: restaurantIds ?? [],
      };
      const hashPass = await hashPassword(password ?? '6344');

      if (existingStaff) {
        const existingCustomRoles = Array.isArray(existingStaff.customRole) ? existingStaff.customRole : [];
        const activeRoleIndex = findActiveRoleIndex(existingCustomRoles, businessId);
        const deletedRoleIndex = findDeletedRoleIndex(existingCustomRoles, businessId);
        const updatedCustomRoles = [...existingCustomRoles];

        if (activeRoleIndex >= 0) {
          updatedCustomRoles[activeRoleIndex] = {
            ...updatedCustomRoles[activeRoleIndex],
            ...customRole,
          };
        } else if (deletedRoleIndex >= 0) {
          updatedCustomRoles[deletedRoleIndex] = {
            ...updatedCustomRoles[deletedRoleIndex],
            ...customRole,
          };
        } else {
          updatedCustomRoles.push(customRole);
        }

        const updatedStaff = await User.findByIdAndUpdate(
          existingStaff._id,
          {
            customRole: updatedCustomRoles,
            name: name ?? existingStaff.name,
            password: hashPass,
          },
          { new: true, session },
        );

        if (!updatedStaff) {
          return respond(c, 'Staff role exist', false, 409, {});
        }

        return respond(c, 'Staff role updated successfully', false, 200, {
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
        throw new Error('Error adding staff');
      }

      return respond(c, 'Staff added successfully', false, 201, {
        _id: newStaff[0]._id,
      });
    });
  })

  .put('/edit_staff', zValidator('json', editHotelStaff), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { staffId, businessId, role, nickName, serviceIds, restaurantIds, name } = requestData;

      const staff = await User.findById(staffId).lean();

      if (!staff) {
        return respond(c, 'Staff not found', true, 404, {});
      }

      const existingCustomRoles = Array.isArray(staff.customRole) ? staff.customRole : [];
      const customRoleIndex = findActiveRoleIndex(existingCustomRoles, businessId);

      if (customRoleIndex === -1) {
        return respond(c, 'Active business role not found for this staff', true, 404, {});
      }

      const updatedCustomRole = [...existingCustomRoles];
      updatedCustomRole[customRoleIndex] = {
        ...updatedCustomRole[customRoleIndex],
        role: role ?? updatedCustomRole[customRoleIndex].role,
        serviceIds: serviceIds ?? updatedCustomRole[customRoleIndex].serviceIds ?? [],
        restaurantIds: restaurantIds ?? updatedCustomRole[customRoleIndex].restaurantIds ?? [],
        nickName: nickName ?? updatedCustomRole[customRoleIndex].nickName,
        isDeleted: false,
      };

      const updatedStaff = await User.findByIdAndUpdate(staffId, { customRole: updatedCustomRole, name: name ?? staff.name }, { new: true, session });

      if (!updatedStaff) {
        return respond(c, 'Error updating staff role', true, 500, {});
      }

      return respond(c, 'Staff role updated successfully', false, 200, updatedStaff);
    });
  })

  .delete('/delete_staff', zValidator('json', deleteHotelStaff), async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const requestData = await c.req.json();
      const { staffId, businessId } = requestData;

      const staff = await User.findById(staffId).lean();

      if (!staff) {
        return respond(c, 'Staff not found', true, 404, {});
      }

      const existingCustomRoles = Array.isArray(staff.customRole) ? staff.customRole : [];
      const customRoleIndex = findActiveRoleIndex(existingCustomRoles, businessId);

      if (customRoleIndex === -1) {
        return respond(c, 'Active business role not found for this staff', true, 404, {});
      }

      const updatedCustomRole = [...existingCustomRoles];
      updatedCustomRole[customRoleIndex] = {
        ...updatedCustomRole[customRoleIndex],
        isDeleted: true,
      };

      const updatedStaff = await User.findByIdAndUpdate(staffId, { customRole: updatedCustomRole }, { new: true, session });

      if (!updatedStaff) {
        return respond(c, 'Error deleting staff role', true, 500, {});
      }

      await HotelRoom.updateMany({ businessId, staffIds: staffId }, { $pull: { staffIds: staffId } }, { session });
      await Kitchen.updateMany({ businessId, staffIds: staffId }, { $pull: { staffIds: staffId } }, { session });
      await HotelStaffLevel.updateMany({ businessId, staffIds: staffId }, { $pull: { staffIds: staffId } }, { session });

      return respond(c, 'Staff role deleted successfully', false, 200, {
        _id: staffId,
      });
    });
  });

export default staffRouter;
