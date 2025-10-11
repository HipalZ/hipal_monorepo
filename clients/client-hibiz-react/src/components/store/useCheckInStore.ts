import { createWithEqualityFn } from "zustand/traditional";
import { devtools } from "zustand/middleware";

interface ICheckInQr {
  _id: string;
  name: string;
  businessId: string;
  downloadLink: string;
  date: number;
  isDeleted: boolean;
}

interface ICheckInForm {
  name: string;
}

interface ICheckInStore {
  checkInQrs: ICheckInQr[];
  selectedQr: ICheckInQr | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  formData: ICheckInForm;
  businessId: string;

  setCheckInQrs: (qrs: ICheckInQr[]) => void;
  setSelectedQr: (qr: ICheckInQr | null) => void;
  setBusinessId: (id: string) => void;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (qr: ICheckInQr) => void;
  closeEditModal: () => void;
  openDeleteModal: (qr: ICheckInQr) => void;
  closeDeleteModal: () => void;

  setFormData: (data: Partial<ICheckInForm>) => void;
  resetFormData: () => void;

  resetStore: () => void;
}

const initialFormData: ICheckInForm = {
  name: "",
};

export const useCheckInStore = createWithEqualityFn<ICheckInStore>()(
  devtools(
    (set) => ({
      // Initial state
      checkInQrs: [],
      selectedQr: null,
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      formData: initialFormData,
      businessId: "",

      // Actions
      setCheckInQrs: (qrs) => set({ checkInQrs: qrs }),
      setSelectedQr: (qr) => set({ selectedQr: qr }),
      setBusinessId: (id) => set({ businessId: id }),

      // Modal actions
      openCreateModal: () =>
        set({
          isCreateModalOpen: true,
          formData: initialFormData,
        }),
      closeCreateModal: () =>
        set({
          isCreateModalOpen: false,
          formData: initialFormData,
        }),
      openEditModal: (qr) =>
        set({
          isEditModalOpen: true,
          selectedQr: qr,
          formData: { name: qr.name },
        }),
      closeEditModal: () =>
        set({
          isEditModalOpen: false,
          selectedQr: null,
          formData: initialFormData,
        }),
      openDeleteModal: (qr) =>
        set({
          isDeleteModalOpen: true,
          selectedQr: qr,
        }),
      closeDeleteModal: () =>
        set({
          isDeleteModalOpen: false,
          selectedQr: null,
        }),

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetFormData: () => set({ formData: initialFormData }),

      resetStore: () =>
        set({
          checkInQrs: [],
          selectedQr: null,
          isCreateModalOpen: false,
          isEditModalOpen: false,
          isDeleteModalOpen: false,
          formData: initialFormData,
          businessId: "",
        }),
    }),
    { name: "checkInStore" },
  ),
);
