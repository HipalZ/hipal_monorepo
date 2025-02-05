import { create } from "zustand";

export type AddStaffProps =
  | ""
  | "DELETE_STAFF"
  | "EDIT_STAFF"
  | "ADD_STAFF"
  | "ADD_ROLE"
  | "ADD_PERMISSIONS"
  | "COMPLETED";
export type role =
  | ""
  | "CO_OWNER"
  | "MANAGER"
  | "CAPTAIN"
  | "MARKETING_AGENT"
  | "OWNER"
  | "HIPAL_CUSTOMER";

export interface IRoles {
  _id: string;
  name: string;
  description: string;
}

export interface IPermissions {
  _id: string;
  name: string;
}

interface AddStaffState {
  pageToggle: AddStaffProps;

  name: string;
  setName: (value: string) => void;

  phone: string;
  setPhone: (value: string) => void;

  password: string;
  setPassword: (value: string) => void;

  selectedPermissions: string[];
  setSelectedPermissions: (value: string[]) => void;
  addPermission: (value: string) => void;

  selectedRole: role;
  setSelectedRole: (value: role) => void;

  roles: IRoles[];
  setRoles: (value: IRoles[]) => void;

  permissions: IPermissions[];
  setPermissions: (value: IPermissions[]) => void;

  isEditing: boolean;
  editStaffId: string;
  isEditStaffOpen: boolean;
  isAddStaffOpen: boolean;
  setIsAddStaffOpen: (value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  setEditStaffId: (value: string) => void;
  setPageToggle: (value: AddStaffProps) => void;
  setIsEditStaffOpen: (value: boolean) => void;
  removeStaffStore: () => void;
}

export const useAddStaffStore = create<AddStaffState>((set) => ({
  pageToggle: "ADD_STAFF",

  selectedPermissions: [],
  setSelectedPermissions: (value: string[]) =>
    set({ selectedPermissions: value }),

  addPermission: (value: string) =>
    set((state) => ({
      selectedPermissions: state.selectedPermissions.includes(value)
        ? state.selectedPermissions.filter((permission) => permission !== value)
        : [...state.selectedPermissions, value],
    })),

  name: "",
  setName: (value: string) => set({ name: value }),
  phone: "",
  setPhone: (value: string) => set({ phone: value }),

  password: "",
  setPassword: (value: string) => set({ password: value }),

  selectedRole: "",
  setSelectedRole: (value: role) => set({ selectedRole: value }),

  roles: [],
  setRoles: (value: IRoles[]) => set({ roles: value }),

  permissions: [],
  setPermissions: (value: IPermissions[]) => set({ permissions: value }),

  isEditing: false,
  editStaffId: "",
  isEditStaffOpen: false,
  isAddStaffOpen: false,

  setIsAddStaffOpen: (value: boolean) => set({ isAddStaffOpen: value }),
  setIsEditStaffOpen: (value: boolean) => set({ isEditStaffOpen: value }),
  setIsEditing: (value: boolean) => set({ isEditing: value }),
  setEditStaffId: (value: string) => set({ editStaffId: value }),
  setPageToggle: (value: AddStaffProps) => set({ pageToggle: value }),

  removeStaffStore: () =>
    set({
      name: "",
      phone: "",
      selectedRole: "",
      selectedPermissions: [],
    }),
}));
