import type { IHotel_Roll, IHotelRoll } from "@/hooks/useHotelStaff";
import { create } from "zustand";

export interface IService {
  serviceIds?: {
    _id: string;
    name: string;
    availability: boolean;
  }[];
  _id: string;
  availability: boolean;
  name: string;
  businessId: string;
  categoryId: string;
}
export interface IStaffMember {
  _id: string;
  name: string;
  phone: string;
  customRole: {
    businessId: string;
    role: string;
    nickName?: string;
    serviceIds: string[];
    _id: string;
  }[];
}
interface IStaffData {
  staffData: IStaffMember[];
  setStaffData: (data: IStaffMember[]) => void;
}

export const useStaffDataStore = create<IStaffData>((set) => ({
  staffData: [],
  setStaffData: (data: IStaffMember[]) => set({ staffData: data }),
}));

// Define the types for our store

interface StaffFormState {
  // Form mode
  isEditMode: boolean;
  editStaffId: string | null;
  // Form data
  personalInfo: {
    name: string;
    phone: string;
    nickname: string;
    password: string;
  };
  selectedRole: IHotel_Roll | null;
  selectedServices: IService[];
  setSelectedServices: (value:IService[])=>void;

  // Form state
  currentStep: number;
  errors: {
    name: string;
    phone: string;
    password: string;
    role: string;
  };

  staffModal: boolean;
  setStaffModal: (value: boolean) => void;

  editRoleStr: IHotelRoll;
  setEditRoleStr: (value: IHotelRoll) => void;

  editServiceIds: string[];
  setEditServiceIds: (value: string[]) => void;

  // Actions
  setPersonalInfo: (info: Partial<StaffFormState["personalInfo"]>) => void;
  setSelectedRole: (role: IHotel_Roll | null) => void;
  toggleService: (service: IService) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  validateCurrentStep: () => boolean;
  clearErrors: () => void;
  setError: (field: keyof StaffFormState["errors"], message: string) => void;
  setEditMode: (isEdit: boolean) => void;
  setEditStaffId: (id: string | null) => void;
  initializeFormForEdit: (staff: IStaffMember) => void;
}

// Create the store
const useStaffStore = create<StaffFormState>((set, get) => ({
  // Initial state
  personalInfo: {
    name: "",
    phone: "",
    nickname: "",
    password: "",
  },
  selectedRole: null,
  selectedServices: [],
  setSelectedServices:(value)=>set({selectedServices:value}),
  currentStep: 1,
  errors: {
    name: "",
    phone: "",
    password: "",
    role: "",
  },

  staffModal: false,
  setStaffModal: (value) => set({ staffModal: value }),

  editRoleStr: "",
  setEditRoleStr: (value: IHotelRoll) => set({ editRoleStr: value }),

  editServiceIds: [],
  setEditServiceIds: (value) => set({ editServiceIds: value }),

  // Actions
  setPersonalInfo: (info) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...info },
    })),

  setSelectedRole: (role) => set({ selectedRole: role }),

  toggleService: (service) =>
    set((state) => {
      const isSelected = state.selectedServices.some(
        (s) => s._id === service._id,
      );

      if (isSelected) {
        return {
          selectedServices: state.selectedServices.filter(
            (s) => s._id !== service._id,
          ),
        };
      } else {
        return {
          selectedServices: [...state.selectedServices, service],
        };
      }
    }),

  setCurrentStep: (step) => set({ currentStep: step }),

  resetForm: () =>
    set({
      personalInfo: {
        name: "",
        phone: "",
        nickname: "",
        password: "",
      },
      editRoleStr: "",
      editServiceIds: [],
      isEditMode: false,
      editStaffId: null,
      selectedRole: null,
      selectedServices: [],
      currentStep: 1,
      errors: {
        name: "",
        phone: "",
        password: "",
        role: "",
      },
    }),

  validateCurrentStep: () => {
    const {
      currentStep,
      personalInfo,
      selectedRole,
      clearErrors,
      setError,
      isEditMode,
    } = get();

    // Clear previous errors
    clearErrors();

    // Validate based on current step
    if (currentStep === 1) {
      let isValid = true;

      if (!personalInfo.name.trim()) {
        setError("name", "Name is required");
        isValid = false;
      }

      if (!personalInfo.phone.trim()) {
        setError("phone", "Phone number is required");
        isValid = false;
      } else if (!/^\d{10}$/.test(personalInfo.phone)) {
        setError("phone", "Phone number must be 10 digits");
        isValid = false;
      }

      if (!personalInfo.password.trim() && !isEditMode) {
        setError("password", "Password is required");
        isValid = false;
      } else if (personalInfo.password.length < 4 && !isEditMode) {
        setError("password", "Password must be at least 4 characters");
        isValid = false;
      }

      return isValid;
    }

    if (currentStep === 2) {
      if (!selectedRole) {
        setError("role", "Please select a role");
        return false;
      }
      return true;
    }

    return true;
  },

  clearErrors: () =>
    set({
      errors: {
        name: "",
        phone: "",
        password: "",
        role: "",
      },
    }),

  setError: (field, message) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [field]: message,
      },
    })),

  isEditMode: false,
  editStaffId: null,
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),
  setEditStaffId: (id) => set({ editStaffId: id }),

  initializeFormForEdit: (staff) => {
    const customRole = staff.customRole[0];
    set({
      isEditMode: true,
      editStaffId: staff._id,
      personalInfo: {
        name: staff.name,
        phone: staff.phone,
        nickname: customRole.nickName || "",
        password: "",
      },
      currentStep: 1,
    });
  },
}));

export default useStaffStore;
