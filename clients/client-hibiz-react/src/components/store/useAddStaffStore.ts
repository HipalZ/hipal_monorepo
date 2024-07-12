// /store/useAddStaffStore.ts
import { create } from "zustand";

export type AddStaffProps = "EDIT_STAFF" |"ADD_STAFF" | "ADD_ROLE" | "ADD_PERMISSIONS" | "COMPLETED";

export interface IRoles {
  _id: string;
  name: string;
  description: string;
}

export interface ISubPermission {
  subTitle: string;
  descriptions: string;
  _id: string;
}

export interface IPermissions {
  title: string;
  subPermissions: ISubPermission[];
}

interface AddStaffState {
  pageToggle: AddStaffProps;
  name: string;
  phone: string;
  selectedPermissions: string[];
  selectedRole: string;
  roles: IRoles[];
  permissions: { [role: string]: IPermissions[] };
  isEditing: boolean;
  editStaffId: string;
  setIsEditing: (value: boolean) => void;
  setEditStaffId: (value: string) => void;
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setPageToggle: (value: AddStaffProps) => void;
  setSelectedRole: (value: string) => void;
  setRoles: (roles: IRoles[]) => void;
  setPermissions: (permissions: { [role: string]: IPermissions[] }) => void;
  toggleMainService: (permission: string, services: string[]) => void;
  toggleSubService: (serviceTitle: string) => void;
  setPermissionsBasedOnRole: (role: string) => void;
}

const getPermissionsForRole = (permissions: { [role: string]: IPermissions[] }, role: string): string[] => {
  return (permissions[role] || []).flatMap(p => [p.title, ...p.subPermissions.map(s => s.subTitle)]);
};

export const useAddStaffStore = create<AddStaffState>((set) => ({
  pageToggle: "ADD_STAFF",
  selectedPermissions: [],
  name: "",
  phone: "",
  selectedRole: "",
  roles: [],
  permissions: {},

  isEditing: false,
  editStaffId: "",
  setIsEditing: (value: boolean) => set({ isEditing: value }),
  setEditStaffId: (value: string) => set({ editStaffId: value }),

  setName: (value: string) => set({ name: value }),
  setPhone: (value: string) => set({ phone: value }),
  setPageToggle: (value: AddStaffProps) => set({ pageToggle: value }),
  setSelectedRole: (value: string) => set((state) => {
    const permissions = getPermissionsForRole(state.permissions, value);
    return {
      selectedRole: value,
      selectedPermissions: permissions,
    };
  }),
  setRoles: (roles: IRoles[]) => set({ roles }),
  setPermissions: (permissions: { [role: string]: IPermissions[] }) => set({ permissions }),
  toggleMainService: (permission, services) =>
    set((state) => {
      const isSelected = state.selectedPermissions.includes(permission);
      return {
        selectedPermissions: isSelected
          ? state.selectedPermissions.filter((item) => item !== permission && !services.includes(item))
          : [...state.selectedPermissions, permission, ...services],
      };
    }),
  toggleSubService: (serviceTitle) =>
    set((state) => {
      const isSelected = state.selectedPermissions.includes(serviceTitle);
      return {
        selectedPermissions: isSelected
          ? state.selectedPermissions.filter((item) => item !== serviceTitle)
          : [...state.selectedPermissions, serviceTitle],
      };
    }),
  setPermissionsBasedOnRole: (role) => set((state) => {
    const permissions = getPermissionsForRole(state.permissions, role);
    return {
      selectedPermissions: permissions,
    };
  }),
}));
