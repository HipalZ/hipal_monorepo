import { create } from "zustand";

interface IHotelTemp {
  imageIndices: { [key: string]: number };
  setImageIndices: (imageIndices: { [key: string]: number }) => void;
  updateImageIndex: (roomId: string, index: number) => void;
  nextImage: (roomId: string, imagesLength: number) => void;
  prevImage: (roomId: string, imagesLength: number) => void;

  isOpenChat: boolean;
  setIsOpenChat: (isOpenChat: boolean) => void;

  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;

  showConfirmation: boolean;
  setShowConfirmation: (showConfirmation: boolean) => void;
}

export const useHotelTemp = create<IHotelTemp>((set, get) => ({
  imageIndices: {},

  // Set the entire imageIndices object
  setImageIndices: (imageIndices) => set({ imageIndices }),

  // Update a single room's image index
  updateImageIndex: (roomId, index) =>
    set((state) => ({
      imageIndices: {
        ...state.imageIndices,
        [roomId]: index,
      },
    })),

  // Go to next image
  nextImage: (roomId, imagesLength) =>
    set((state) => {
      const currentIndex = state.imageIndices[roomId] ?? 0;
      return {
        imageIndices: {
          ...state.imageIndices,
          [roomId]: (currentIndex + 1) % imagesLength,
        },
      };
    }),

  // Go to previous image
  prevImage: (roomId, imagesLength) =>
    set((state) => {
      const currentIndex = state.imageIndices[roomId] ?? 0;
      return {
        imageIndices: {
          ...state.imageIndices,
          [roomId]: currentIndex === 0 ? imagesLength - 1 : currentIndex - 1,
        },
      };
    }),

  isOpenChat: false,
  setIsOpenChat: (isOpenChat) => set({ isOpenChat }),

  isSubmitting: false,
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  showConfirmation: false,
  setShowConfirmation: (showConfirmation) => set({ showConfirmation }),
}));
