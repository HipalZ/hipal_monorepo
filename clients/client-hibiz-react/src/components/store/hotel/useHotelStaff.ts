import type { IHotel_Roll, IHotelRoll } from '@/hooks/useHotelStaff';
import { create } from 'zustand';

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
    restaurantIds?: string[];
    _id: string;
  }[];
}
export interface StaffRole {
  _id: string;
  businessId: string;
  name: string;
  permissionGroupIds: string[];
  permissionIds: string[];
  serviceIds: string[];
  restaurantIds?: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export interface Staff {
  _id: string;
  name: string;
  phone: string;
  dob?: string;
  address?: string;
  profession?: string;
  customRole: StaffRole[];
  birthdayTriggerCount: number;
  withScaner: boolean;
  bookMark: boolean;
  nickName?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  // Additional fields for room linking
  assignedRoomIds?: string[];
}

export interface RoomStaffAssignment {
  roomId: string;
  staffIds: string[];
  assignedAt: string;
}
interface IStaffData {
  staffData: IStaffMember[];
  setStaffData: (data: IStaffMember[]) => void;

  roomStaffAssignments: RoomStaffAssignment[];

  showStaffReport: boolean;
  setShowStaffReport: (value: boolean) => void;

  // Batch selection state
  selectedRooms: string[];
  selectedStaff: string[];

  // Actions
  staffList: Staff[];
  setStaffList: (staff: Staff[]) => void;
  addStaff: (staff: Staff) => void;
  updateStaff: (staffId: string, updates: Partial<Staff>) => void;
  deleteStaff: (staffId: string) => void;

  // Room-staff linking actions
  linkStaffToRooms: (staffIds: string[], roomIds: string[]) => void;
  unlinkStaffFromRooms: (staffIds: string[], roomIds: string[]) => void;
  getStaffByRoom: (roomId: string) => Staff[];
  getRoomsByStaff: (staffId: string) => string[];

  // Batch selection actions
  setSelectedRooms: (roomIds: string[]) => void;
  setSelectedStaff: (staffIds: string[]) => void;
  toggleRoomSelection: (roomId: string) => void;
  toggleStaffSelection: (staffId: string) => void;
  clearSelections: () => void;

  // Batch assignment
  batchAssignStaffToRooms: () => void;
}

export const useStaffDataStore = create<IStaffData>((set, get) => ({
  staffData: [],
  setStaffData: (data: IStaffMember[]) => set({ staffData: data }),

  showStaffReport: false,
  setShowStaffReport: (value: boolean) => set({ showStaffReport: value }),

  roomStaffAssignments: [],
  selectedRooms: [],
  selectedStaff: [],

  staffList: [],

  setStaffList: (staff) => set({ staffList: staff }),

  addStaff: (staff) =>
    set((state) => ({
      staffList: [...state.staffList, staff],
    })),

  updateStaff: (staffId, updates) =>
    set((state) => ({
      staffList: state.staffList.map((staff) => (staff._id === staffId ? { ...staff, ...updates } : staff)),
    })),

  deleteStaff: (staffId) =>
    set((state) => ({
      staffList: state.staffList.filter((staff) => staff._id !== staffId),
      roomStaffAssignments: state.roomStaffAssignments.map((assignment) => ({
        ...assignment,
        staffIds: assignment.staffIds.filter((id) => id !== staffId),
      })),
    })),

  linkStaffToRooms: (staffIds, roomIds) =>
    set((state) => {
      const newAssignments = [...state.roomStaffAssignments];

      roomIds.forEach((roomId) => {
        const existingAssignment = newAssignments.find((a) => a.roomId === roomId);

        if (existingAssignment) {
          // Add new staff to existing room assignment
          const uniqueStaffIds = [...new Set([...existingAssignment.staffIds, ...staffIds])];
          existingAssignment.staffIds = uniqueStaffIds;
        } else {
          // Create new room assignment
          newAssignments.push({
            roomId,
            staffIds: [...staffIds],
            assignedAt: new Date().toISOString(),
          });
        }
      });

      return { roomStaffAssignments: newAssignments };
    }),

  unlinkStaffFromRooms: (staffIds, roomIds) =>
    set((state) => ({
      roomStaffAssignments: state.roomStaffAssignments
        .map((assignment) =>
          roomIds.includes(assignment.roomId)
            ? {
                ...assignment,
                staffIds: assignment.staffIds.filter((id) => !staffIds.includes(id)),
              }
            : assignment,
        )
        .filter((assignment) => assignment.staffIds.length > 0),
    })),

  getStaffByRoom: (roomId) => {
    const state = get();
    const assignment = state.roomStaffAssignments.find((a) => a.roomId === roomId);
    if (!assignment) return [];

    return state.staffList.filter((staff) => assignment.staffIds.includes(staff._id));
  },

  getRoomsByStaff: (staffId) => {
    const state = get();
    return state.roomStaffAssignments.filter((assignment) => assignment.staffIds.includes(staffId)).map((assignment) => assignment.roomId);
  },

  setSelectedRooms: (roomIds) => set({ selectedRooms: roomIds }),
  setSelectedStaff: (staffIds) => set({ selectedStaff: staffIds }),

  toggleRoomSelection: (roomId) =>
    set((state) => ({
      selectedRooms: state.selectedRooms.includes(roomId) ? state.selectedRooms.filter((id) => id !== roomId) : [...state.selectedRooms, roomId],
    })),

  toggleStaffSelection: (staffId) =>
    set((state) => ({
      selectedStaff: state.selectedStaff.includes(staffId) ? state.selectedStaff.filter((id) => id !== staffId) : [...state.selectedStaff, staffId],
    })),

  clearSelections: () => set({ selectedRooms: [], selectedStaff: [] }),

  batchAssignStaffToRooms: () => {
    const state = get();
    if (state.selectedRooms.length > 0 && state.selectedStaff.length > 0) {
      state.linkStaffToRooms(state.selectedStaff, state.selectedRooms);
      state.clearSelections();
    }
  },
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
  setSelectedServices: (value: IService[]) => void;
  selectedRestaurants: string[];
  setSelectedRestaurants: (value: string[]) => void;
  toggleRestaurant: (restaurantId: string) => void;

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
  setPersonalInfo: (info: Partial<StaffFormState['personalInfo']>) => void;
  setSelectedRole: (role: IHotel_Roll | null) => void;
  toggleService: (service: IService) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  validateCurrentStep: () => boolean;
  clearErrors: () => void;
  setError: (field: keyof StaffFormState['errors'], message: string) => void;
  setEditMode: (isEdit: boolean) => void;
  setEditStaffId: (id: string | null) => void;
  initializeFormForEdit: (staff: IStaffMember) => void;
}

// Create the store
const useStaffStore = create<StaffFormState>((set, get) => ({
  // Initial state
  personalInfo: {
    name: '',
    phone: '',
    nickname: '',
    password: '',
  },
  selectedRole: null,
  selectedServices: [],
  setSelectedServices: (value) => set({ selectedServices: value }),
  selectedRestaurants: [],
  setSelectedRestaurants: (value) => set({ selectedRestaurants: value }),
  toggleRestaurant: (restaurantId) =>
    set((state) => ({
      selectedRestaurants: state.selectedRestaurants.includes(restaurantId)
        ? state.selectedRestaurants.filter((id) => id !== restaurantId)
        : [...state.selectedRestaurants, restaurantId],
    })),
  currentStep: 1,
  errors: {
    name: '',
    phone: '',
    password: '',
    role: '',
  },

  staffModal: false,
  setStaffModal: (value) => set({ staffModal: value }),

  editRoleStr: '',
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
      const isSelected = state.selectedServices.some((s) => s._id === service._id);

      if (isSelected) {
        return {
          selectedServices: state.selectedServices.filter((s) => s._id !== service._id),
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
        name: '',
        phone: '',
        nickname: '',
        password: '',
      },
      editRoleStr: '',
      editServiceIds: [],
      isEditMode: false,
      editStaffId: null,
      selectedRole: null,
      selectedServices: [],
      selectedRestaurants: [],
      currentStep: 1,
      errors: {
        name: '',
        phone: '',
        password: '',
        role: '',
      },
    }),

  validateCurrentStep: () => {
    const { currentStep, personalInfo, selectedRole, clearErrors, setError, isEditMode } = get();

    // Clear previous errors
    clearErrors();

    // Validate based on current step
    if (currentStep === 1) {
      let isValid = true;

      if (!personalInfo.name.trim()) {
        setError('name', 'Name is required');
        isValid = false;
      }

      if (!personalInfo.phone.trim()) {
        setError('phone', 'Phone number is required');
        isValid = false;
      } else if (!/^\d{10}$/.test(personalInfo.phone)) {
        setError('phone', 'Phone number must be 10 digits');
        isValid = false;
      }

      if (!personalInfo.password.trim() && !isEditMode) {
        setError('password', 'Password is required');
        isValid = false;
      } else if (personalInfo.password.length < 4 && !isEditMode) {
        setError('password', 'Password must be at least 4 characters');
        isValid = false;
      }

      return isValid;
    }

    if (currentStep === 2) {
      if (!selectedRole) {
        setError('role', 'Please select a role');
        return false;
      }
      return true;
    }

    return true;
  },

  clearErrors: () =>
    set({
      errors: {
        name: '',
        phone: '',
        password: '',
        role: '',
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
        nickname: customRole.nickName || '',
        password: '',
      },
      currentStep: 1,
    });
  },
}));

export default useStaffStore;
