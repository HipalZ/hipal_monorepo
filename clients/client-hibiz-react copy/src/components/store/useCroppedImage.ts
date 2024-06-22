import { create } from 'zustand';

type CroppedImage = {
  croppedImage: string;
  setCroppedImage: (image: string) => void;
};

export const useCroppedImage = create<CroppedImage>((set) => ({
  croppedImage: '',
  setCroppedImage: (image) => set({ croppedImage: image }),
}));
