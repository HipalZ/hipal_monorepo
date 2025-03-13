import { create } from "zustand"
import type { IHotelRoom, RoomType, HotelStatusEnumType } from "@/hooks/hotel/useRoomHook"
import type { IAmenity } from "@/hooks/hotel/useAmenities"
import { IStaffMember } from "./useHotelStaff"

interface RoomFormState {
  // Form mode
  isEditMode: boolean
  editRoomId: string | null

  // Form data
  roomInfo: {
    name: string
    description: string
    roomType: RoomType
    pricePerNight: number
    capacity: number
    size: string
    availability: boolean
    roomStatus: HotelStatusEnumType
  }
  selectedAmenities: string[] // Amenity IDs
  selectedFloorId: string
  selectedStaffIds: string[]
  roomImages: string[] // Array of image URLs

  // Form state
  currentStep: number
  errors: {
    name: string
    description: string
    roomType: string
    pricePerNight: string
    capacity: string
    size: string
    floor: string
  }

  // Actions
  setRoomInfo: (info: Partial<RoomFormState["roomInfo"]>) => void
  toggleAmenity: (amenityId: string) => void
  setSelectedFloorId: (floorId: string) => void
  toggleStaff: (staffId: string) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  validateCurrentStep: () => boolean
  clearErrors: () => void
  setError: (field: keyof RoomFormState["errors"], message: string) => void

  // Image actions
  addRoomImage: (imageUrl: string) => void
  removeRoomImage: (imageUrl: string) => void
  setRoomImages: (images: string[]) => void

  // Edit mode actions
  setEditMode: (isEdit: boolean) => void
  setEditRoomId: (id: string | null) => void
  initializeFormForEdit: (roomData: IHotelRoom, amenities: IAmenity[], staffData: IStaffMember[]) => void
}

const useRoomFormStore = create<RoomFormState>((set, get) => ({
  // Initial state
  isEditMode: false,
  editRoomId: null,
  roomInfo: {
    name: "",
    description: "",
    roomType: "SINGLE",
    pricePerNight: 0,
    capacity: 1,
    size: "",
    availability: true,
    roomStatus: "AVAILABLE",
  },
  selectedAmenities: [],
  selectedFloorId: "",
  selectedStaffIds: [],
  roomImages: [],
  currentStep: 1,
  errors: {
    name: "",
    description: "",
    roomType: "",
    pricePerNight: "",
    capacity: "",
    size: "",
    floor: "",
  },

  // Actions
  setRoomInfo: (info) =>
    set((state) => ({
      roomInfo: { ...state.roomInfo, ...info },
    })),

  toggleAmenity: (amenityId) =>
    set((state) => {
      const isSelected = state.selectedAmenities.includes(amenityId)

      if (isSelected) {
        return {
          selectedAmenities: state.selectedAmenities.filter((id) => id !== amenityId),
        }
      } else {
        return {
          selectedAmenities: [...state.selectedAmenities, amenityId],
        }
      }
    }),

  setSelectedFloorId: (floorId) =>
    set({
      selectedFloorId: floorId,
    }),

  toggleStaff: (staffId) =>
    set((state) => {
      const isSelected = state.selectedStaffIds.includes(staffId)

      if (isSelected) {
        return {
          selectedStaffIds: state.selectedStaffIds.filter((id) => id !== staffId),
        }
      } else {
        return {
          selectedStaffIds: [...state.selectedStaffIds, staffId],
        }
      }
    }),

  // Image actions
  addRoomImage: (imageUrl) =>
    set((state) => ({
      roomImages: [...state.roomImages, imageUrl],
    })),

  removeRoomImage: (imageUrl) =>
    set((state) => ({
      roomImages: state.roomImages.filter((url) => url !== imageUrl),
    })),

  setRoomImages: (images) =>
    set({
      roomImages: images,
    }),

  setCurrentStep: (step) => set({ currentStep: step }),

  resetForm: () =>
    set({
      isEditMode: false,
      editRoomId: null,
      roomInfo: {
        name: "",
        description: "",
        roomType: "SINGLE",
        pricePerNight: 0,
        capacity: 1,
        size: "",
        availability: true,
        roomStatus: "AVAILABLE",
      },
      selectedAmenities: [],
      selectedFloorId: "",
      selectedStaffIds: [],
      roomImages: [],
      currentStep: 1,
      errors: {
        name: "",
        description: "",
        roomType: "",
        pricePerNight: "",
        capacity: "",
        size: "",
        floor: "",
      },
    }),

  validateCurrentStep: () => {
    const { currentStep, roomInfo, selectedFloorId, clearErrors, setError } = get()

    // Clear previous errors
    clearErrors()

    // Validate based on current step
    if (currentStep === 1) {
      let isValid = true

      if (!roomInfo.name.trim()) {
        setError("name", "Room name is required")
        isValid = false
      }

      if (!roomInfo.description.trim()) {
        setError("description", "Room description is required")
        isValid = false
      }

      if (!roomInfo.roomType) {
        setError("roomType", "Room type is required")
        isValid = false
      }

      if (roomInfo.pricePerNight < 0) {
        setError("pricePerNight", "Price cannot be negative")
        isValid = false
      }

      if (roomInfo.capacity < 1) {
        setError("capacity", "Capacity must be at least 1")
        isValid = false
      }

      if (!roomInfo.size.trim()) {
        setError("size", "Room size is required")
        isValid = false
      }

      return isValid
    }

    if (currentStep === 3) {
      let isValid = true

      if (!selectedFloorId) {
        setError("floor", "Please select a floor")
        isValid = false
      }

      return isValid
    }

    return true
  },

  clearErrors: () =>
    set({
      errors: {
        name: "",
        description: "",
        roomType: "",
        pricePerNight: "",
        capacity: "",
        size: "",
        floor: "",
      },
    }),

  setError: (field, message) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [field]: message,
      },
    })),

  // Edit mode actions
  setEditMode: (isEdit) => set({ isEditMode: isEdit }),

  setEditRoomId: (id) => set({ editRoomId: id }),

  initializeFormForEdit: (roomData, amenities, staffData) => {
    set({
      isEditMode: true,
      editRoomId: roomData._id,
      roomInfo: {
        name: roomData.name,
        description: roomData.description || "",
        roomType: roomData.roomType,
        pricePerNight: roomData.pricePerNight,
        capacity: roomData.capacity,
        size: roomData.size || "",
        availability: roomData.availability,
        roomStatus: roomData.roomStatus,
      },
      selectedAmenities: roomData.amenities || [],
      selectedFloorId: roomData.zoneId || "",
      selectedStaffIds: roomData.staffIds || [],
      roomImages: roomData.images || [],
      currentStep: 1,
    })
  },
}))

export default useRoomFormStore

