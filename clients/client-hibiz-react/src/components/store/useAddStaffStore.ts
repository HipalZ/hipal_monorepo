// src/components/store/useAddStaffStore.ts
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
  // legacy, kept only to avoid breaking any other code
  pageToggle: AddStaffProps;
  setPageToggle: (value: AddStaffProps) => void;

  // wizard step
  currentStep: number;
  setCurrentStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;

  // add / edit states
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editStaffId: string;
  setEditStaffId: (value: string) => void;

  // modal control
  isEditStaffOpen: boolean;
  isAddStaffOpen: boolean;
  setIsAddStaffOpen: (value: boolean) => void;
  setIsEditStaffOpen: (value: boolean) => void;

  // basic info
  name: string;
  setName: (value: string) => void;

  phone: string;
  setPhone: (value: string) => void;

  password: string;
  setPassword: (value: string) => void;

  // role
  selectedRole: role;
  setSelectedRole: (value: role) => void;

  // permissions (selected)
  selectedPermissions: string[];
  setSelectedPermissions: (value: string[]) => void;
  addPermission: (value: string) => void;

  // master roles + permissions lists
  roles: IRoles[];
  setRoles: (value: IRoles[]) => void;

  permissions: IPermissions[];
  setPermissions: (value: IPermissions[]) => void;

  // reset
  removeStaffStore: () => void;
}

export const useAddStaffStore = create<AddStaffState>((set) => ({
  pageToggle: "ADD_STAFF",
  setPageToggle: (value: AddStaffProps) => set({ pageToggle: value }),

  currentStep: 1,
  setCurrentStep: (step: number) => set({ currentStep: step }),
  goNext: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 4),
    })),
  goBack: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  isEditing: false,
  setIsEditing: (value: boolean) => set({ isEditing: value }),
  editStaffId: "",
  setEditStaffId: (value: string) => set({ editStaffId: value }),

  isEditStaffOpen: false,
  isAddStaffOpen: false,
  setIsAddStaffOpen: (value: boolean) => set({ isAddStaffOpen: value }),
  setIsEditStaffOpen: (value: boolean) => set({ isEditStaffOpen: value }),

  name: "",
  setName: (value: string) => set({ name: value }),

  phone: "",
  setPhone: (value: string) => set({ phone: value }),

  password: "",
  setPassword: (value: string) => set({ password: value }),

  selectedRole: "",
  setSelectedRole: (value: role) => set({ selectedRole: value }),

  selectedPermissions: [],
  setSelectedPermissions: (value: string[]) =>
    set({ selectedPermissions: value }),
  addPermission: (value: string) =>
    set((state) => ({
      selectedPermissions: state.selectedPermissions.includes(value)
        ? state.selectedPermissions.filter((p) => p !== value)
        : [...state.selectedPermissions, value],
    })),

  roles: [],
  setRoles: (value: IRoles[]) => set({ roles: value }),

  permissions: [],
  setPermissions: (value: IPermissions[]) => set({ permissions: value }),

  removeStaffStore: () =>
    set({
      name: "",
      phone: "",
      password: "",
      selectedRole: "",
      selectedPermissions: [],
      currentStep: 1,
      editStaffId: "",
      isEditing: false,
      pageToggle: "ADD_STAFF",
    }),
}));
