import { createWithEqualityFn } from "zustand/traditional";

type CroppedImage = {
  croppedImage: string;
  setCroppedImage: (image: string) => void;
};

export const useCroppedImage = createWithEqualityFn<CroppedImage>((set) => ({
  croppedImage: "",
  setCroppedImage: (image) => set({ croppedImage: image }),
}));
