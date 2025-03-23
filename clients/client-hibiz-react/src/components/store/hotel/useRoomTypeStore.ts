import { create } from "zustand"

export type RoomTypeEnum = "SINGLE" | "DOUBLE" | "TRIPLE" | "QUAD" | "SUITE" | "DELUXE"

interface RoomTypeFormState {
  // Modal state
  openRoomTypeModal: boolean
  setOpenRoomTypeModal: (open: boolean) => void

  // Form mode
  isEditMode: boolean
  editRoomTypeId: string | null

  // Form data
  roomTypeInfo: {
    roomType: RoomTypeEnum
    description: string
    pricePerNight: number
    size: string
    capacity: number
  }
  roomTypeImages: string[]

  // Form errors
  errors: {
    roomType: string
    pricePerNight: string
    size: string
    capacity: string
  }

  // Actions
  setRoomTypeInfo: (info: Partial<RoomTypeFormState["roomTypeInfo"]>) => void
  addRoomTypeImage: (imageUrl: string) => void
  removeRoomTypeImage: (imageUrl: string) => void
  setRoomTypeImages: (images: string[]) => void

  setEditMode: (isEdit: boolean) => void
  setEditRoomTypeId: (id: string | null) => void
  initializeFormForEdit: (roomTypeData: any) => void

  resetForm: () => void
  validateForm: () => boolean
  clearErrors: () => void
  setError: (field: keyof RoomTypeFormState["errors"], message: string) => void
}

const useRoomTypeStore = create<RoomTypeFormState>((set, get) => ({
  // Modal state
  openRoomTypeModal: false,
  setOpenRoomTypeModal: (open) => set({ openRoomTypeModal: open }),

  // Form mode
  isEditMode: false,
  editRoomTypeId: null,

  // Form data
  roomTypeInfo: {
    roomType: "SINGLE",
    description: "",
    pricePerNight: 0,
    size: "",
    capacity: 1,
  },
  roomTypeImages: [],

  // Form errors
  errors: {
    roomType: "",
    pricePerNight: "",
    size: "",
    capacity: "",
  },

  // Actions
  setRoomTypeInfo: (info) =>
    set((state) => ({
      roomTypeInfo: { ...state.roomTypeInfo, ...info },
    })),

  addRoomTypeImage: (imageUrl) =>
    set((state) => ({
      roomTypeImages: [...state.roomTypeImages, imageUrl],
    })),

  removeRoomTypeImage: (imageUrl) =>
    set((state) => ({
      roomTypeImages: state.roomTypeImages.filter((url) => url !== imageUrl),
    })),

  setRoomTypeImages: (images) =>
    set({
      roomTypeImages: images,
    }),

  setEditMode: (isEdit) => set({ isEditMode: isEdit }),

  setEditRoomTypeId: (id) => set({ editRoomTypeId: id }),

  initializeFormForEdit: (roomTypeData) => {
    set({
      isEditMode: true,
      editRoomTypeId: roomTypeData._id,
      roomTypeInfo: {
        roomType: roomTypeData.roomType,
        description: roomTypeData.description || "",
        pricePerNight: roomTypeData.pricePerNight,
        size: roomTypeData.size || "",
        capacity: roomTypeData.capacity,
      },
      roomTypeImages: roomTypeData.images || [],
    })
  },

  resetForm: () =>
    set({
      isEditMode: false,
      editRoomTypeId: null,
      roomTypeInfo: {
        roomType: "SINGLE",
        description: "",
        pricePerNight: 0,
        size: "",
        capacity: 1,
      },
      roomTypeImages: [],
      errors: {
        roomType: "",
        pricePerNight: "",
        size: "",
        capacity: "",
      },
    }),

  validateForm: () => {
    const { roomTypeInfo, clearErrors, setError } = get()

    // Clear previous errors
    clearErrors()

    let isValid = true

    if (!roomTypeInfo.roomType) {
      setError("roomType", "Room type is required")
      isValid = false
    }

    if (roomTypeInfo.pricePerNight <= 0) {
      setError("pricePerNight", "Price must be greater than 0")
      isValid = false
    }

    if (!roomTypeInfo.size.trim()) {
      setError("size", "Room size is required")
      isValid = false
    }

    if (roomTypeInfo.capacity <= 0) {
      setError("capacity", "Capacity must be at least 1")
      isValid = false
    }

    return isValid
  },

  clearErrors: () =>
    set({
      errors: {
        roomType: "",
        pricePerNight: "",
        size: "",
        capacity: "",
      },
    }),

  setError: (field, message) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [field]: message,
      },
    })),
}))

export default useRoomTypeStore

