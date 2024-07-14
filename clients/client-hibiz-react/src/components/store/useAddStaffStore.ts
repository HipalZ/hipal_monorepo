import { create } from "zustand";

export type AddStaffProps = "" | "EDIT_STAFF" | "ADD_STAFF" | "ADD_ROLE" | "ADD_PERMISSIONS" | "COMPLETED";
export type role = "" | "CO_OWNER" | "MANAGER" | "CAPTAIN" | "MARKETING_AGENT" | "OWNER" | "HIPAL_ADMIN" | "HIPAL_CUSTOMER"

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
  selectedRole: role;
  roles: IRoles[];
  permissions: { [role: string]: IPermissions[] };
  isEditing: boolean;
  editStaffId: string;
  setIsEditing: (value: boolean) => void;
  setEditStaffId: (value: string) => void;
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setPageToggle: (value: AddStaffProps) => void;
  setSelectedRole: (value: role) => void;
  setRoles: (roles: IRoles[]) => void;
  setPermissions: (permissions: { [role: string]: IPermissions[] }) => void;
  toggleMainService: (permission: string, services: string[]) => void;
  toggleSubService: (serviceTitle: string) => void;
  setPermissionsBasedOnRole: (role: string) => void;
  setSelectedPermissions: (permissions: string[]) => void;
}

const getPermissionsForRole = (permissions: { [role: string]: IPermissions[] }, role: string): string[] => {
  return (permissions[role] || []).flatMap(p => [p.title, ...p.subPermissions.map(s => s.subTitle)]);
};
export const getUserPermissionsForRole = (permissions: IPermissions[], userPermissions: any): string[] => {
  const allPermissions = permissions.flatMap(p => [p.title, ...p.subPermissions.map(s => s.subTitle)]);
  const userSelectedPermissions = userPermissions.flatMap(p => [p.title, ...p.subPermissions]);
  return allPermissions.filter(permission => userSelectedPermissions.includes(permission));
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
  setSelectedRole: (value: role) => set((state) => {
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
  setSelectedPermissions: (permissions) => set({ selectedPermissions: permissions }), // New state setter

  setPermissionsBasedOnRole: (role) => set((state) => {
    const permissions = getPermissionsForRole(state.permissions, role);
    return {
      selectedPermissions: permissions,
    };
  }),
}));
