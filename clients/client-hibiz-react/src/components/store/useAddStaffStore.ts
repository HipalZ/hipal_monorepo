import { create } from 'zustand';
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
}

export const useAddStaffStore = create<AddStaffState>((set) => ({
    pageToggle: 'ADD_STAFF',
    selectedPermissions: [],
    name: '',
    phone: "",
    selectedRole: "",

    setName: (value: string) => set({ name: value }),
    setPhone: (value: string) => set({ phone: value }),
    setPageToggle: (value: AddStaffProps) => set({ pageToggle: value }),
    setSelectedRole: (value: string) => set({ selectedRole: value }),
    toggleMainService: (permission, services) => set((state) => {
        const isSelected = state.selectedPermissions.includes(permission);
        if (isSelected) {
            return {
                selectedPermissions: state.selectedPermissions.filter(
                    (item) => item !== permission && !services.includes(item)
                ),
            };
        } else {
            return {
                selectedPermissions: [...state.selectedPermissions, permission, ...services],
            };
        }
    }),
    toggleSubService: (serviceTitle) => set((state) => {
        const isSelected = state.selectedPermissions.includes(serviceTitle);
        return {
            selectedPermissions: isSelected
                ? state.selectedPermissions.filter((item) => item !== serviceTitle)
                : [...state.selectedPermissions, serviceTitle],
        };
    }),
}));
