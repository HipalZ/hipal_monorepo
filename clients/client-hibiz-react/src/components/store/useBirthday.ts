import { create } from "zustand";

interface IBirthday {
  imagePreview: string;
  setImagePreview: (imagePreview: string) => void;

  imageFiles: File | null;
  setImageFiles: (imageFiles: File) => void;

  showCropper: boolean;
  setShowCropper: (showCropper: boolean) => void;

  cropping: { image: string | ArrayBuffer | null; type: string };
  setCropping: (cropping: {
    image: string | ArrayBuffer | null;
    type: string;
  }) => void;
}

export const useBirthday = create<IBirthday>((set) => ({
  imagePreview: "",
  setImagePreview: (imagePreview) => set({ imagePreview }),

  imageFiles: null,
  setImageFiles: (imageFiles) => set({ imageFiles }),

  showCropper: false,
  setShowCropper: (showCropper) => set({ showCropper }),

  cropping: { image: "", type: "" },
  setCropping: (cropping) => set({ cropping }),
}));
