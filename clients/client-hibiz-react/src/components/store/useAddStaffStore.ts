import { create } from "zustand";
import { permissionsArray } from "../molecules/addStaffpopup/staffTypes";

export type AddStaffProps = "ADD_STAFF" | "ADD_ROLE" | "ADD_PERMISSIONS" | "COMPLETED";

interface AddStaffState {
  pageToggle: string;
  name: string;
  phone: string;
  selectedPermissions: string[];
  selectedRole: string;

  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setPageToggle: (value: AddStaffProps) => void;
  setSelectedRole: (value: string) => void;
  toggleMainService: (permission: string, services: string[]) => void;
  toggleSubService: (serviceTitle: string) => void;
  setPermissionsBasedOnRole: (role: string) => void;
}

const getPermissionsForRole = (role: string): string[] => {
  switch (role) {
    case "Co-Owner":
      return permissionsArray.flatMap(p => [p.permission, ...p.services.map(s => s.title)]);
    case "Manager":
      return permissionsArray.flatMap(p => [p.permission, ...p.services.map(s => s.title)]);
    case "Marketing Agent":
      return permissionsArray
        .filter(p => p.permission === "Hi Biz")
        .flatMap(p => [p.permission, ...p.services.map(s => s.title)]);
    case "Captain":
      return permissionsArray
        .filter(p => p.permission === "Hi Tables")
        .flatMap(p => [p.permission, ...p.services.map(s => s.title)]);
    default:
      return [];
  }
}

export const useAddStaffStore = create<AddStaffState>((set) => ({
  pageToggle: "ADD_STAFF",
  selectedPermissions: [],
  name: "",
  phone: "",
  selectedRole: "",

  setName: (value: string) => set({ name: value }),
  setPhone: (value: string) => set({ phone: value }),
  setPageToggle: (value: AddStaffProps) => set({ pageToggle: value }),
  setSelectedRole: (value: string) => set((state) => {
    const permissions = getPermissionsForRole(value);
    return {
      selectedRole: value,
      selectedPermissions: permissions
    };
  }),
  toggleMainService: (permission, services) =>
    set((state) => {
      const isSelected = state.selectedPermissions.includes(permission);
      if (isSelected) {
        return {
          selectedPermissions: state.selectedPermissions.filter((item) => item !== permission && !services.includes(item)),
        };
      }
      return {
        selectedPermissions: [...state.selectedPermissions, permission, ...services],
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
    const permissions = getPermissionsForRole(role);
    return {
      selectedPermissions: permissions
    };
  })
}));
