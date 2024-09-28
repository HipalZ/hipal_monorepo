import { create } from "zustand";

interface IBannerTemp {
  itemName: string;
  setItemName: (name: string) => void;

  showCropper: boolean;
  setShowCropper: (show: boolean) => void;

  heading: string;
  setHeading: (heading: string) => void;

  paragraph: string;
  setParagraph: (paragraph: string) => void;

  clickRedirect: boolean;
  setClickRedirect: (click: boolean) => void;

  callToAction: string;
  setCallToAction: (callToAction: string) => void;

  redirectionId: string;
  setRedirectionId: (id: string) => void;

  redirectionType: string;
  setRedirectionType: (type: string) => void;

  colorWheel: {
    background: boolean;
    paragraph: boolean;
    button: boolean;
  };
  setColorWheel: (key: string, value: boolean) => void;

  colorWheelParagraph: boolean;
  setColorWheelParagraph: (colorWheelParagraph: boolean) => void;

  colorWheelBackground: boolean;
  setColorWheelBackground: (colorWheelBackground: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  isPublished: boolean;
  setIsPublished: (published: boolean) => void;

  imageFiles: File | null;
  setImageFiles: (imageFile: File | null) => void;

  img: string;
  setImg: (img: string) => void;

  paragraphStyle: {
    color: string;
  };
  setParagraphStyle: (style: { color: string }) => void;

  buttonStyle: {
    color: string;
    buttonColor: string;
  };
  setButtonStyle: (style: { color: string; buttonColor: string }) => void;

  selectedColor: {
    bgColor: string;
    textColor: string;
  };

  setSelectedColor: (color: { bgColor: string; textColor: string }) => void;

  cropping: {
    image: null | string;
    type: null | string;
  };

  setCropping: (cropping: {
    image: null | string;
    type: null | string;
  }) => void;

  updateEditBanner: (editingBanner: any) => void;
}

export const useBannerTemp = create<IBannerTemp>((set) => ({
  itemName: "",
  setItemName: (name) => set({ itemName: name }),

  showCropper: false,
  setShowCropper: (show) => set({ showCropper: show }),

  heading: "",
  setHeading: (heading) => set({ heading }),

  paragraph: "",
  setParagraph: (paragraph) => set({ paragraph }),

  clickRedirect: false,
  setClickRedirect: (click) => set({ clickRedirect: click }),

  callToAction: "",
  setCallToAction: (callToAction) => set({ callToAction }),

  redirectionId: "",
  setRedirectionId: (id) => set({ redirectionId: id }),

  redirectionType: "",
  setRedirectionType: (type) => set({ redirectionType: type }),

  colorWheel: {
    background: false,
    paragraph: false,
    button: false,
  },
  setColorWheel: (key, value) =>
    set((state) => ({
      colorWheel: { ...state.colorWheel, [key]: value },
    })),

  colorWheelParagraph: false,
  setColorWheelParagraph: (colorWheelParagraph) => set({ colorWheelParagraph }),

  colorWheelBackground: false,
  setColorWheelBackground: (colorWheelBackground) =>
    set({ colorWheelBackground }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  isPublished: false,
  setIsPublished: (published) => set({ isPublished: published }),

  imageFiles: null,
  setImageFiles: (imageFile) => set({ imageFiles: imageFile }),

  img: "",
  setImg: (img) => set({ img }),

  paragraphStyle: { color: "" },
  setParagraphStyle: (style) => {
    set((state) => ({
      paragraphStyle: { ...state.paragraphStyle, ...style },
    }));
  },

  buttonStyle: { color: "", buttonColor: "" },
  setButtonStyle: (style) =>
    set((state) => ({ buttonStyle: { ...state.buttonStyle, ...style } })),

  selectedColor: { bgColor: "", textColor: "" },
  setSelectedColor: (color) =>
    set((state) => ({ selectedColor: { ...state.selectedColor, ...color } })),

  cropping: {
    image: null,
    type: null,
  },
  setCropping: (cropping) => set({ cropping }),

  updateEditBanner: (editingBanner) => {
    set({
      img: editingBanner?.bannerImage || "",
      itemName: editingBanner.redirectionName || "",
      heading: editingBanner.heading || "",
      paragraph: editingBanner.paragraph || "",
      callToAction: editingBanner.callToAction || "",
      isPublished: editingBanner.isPublished || false,
      redirectionId: editingBanner.redirectionId || "",
      redirectionType: editingBanner.redirectionType || "",
      redirectionName: editingBanner.redirectionName || "",
      paragraphStyle: {
        color: editingBanner.paragraphColor || "",
      },
      buttonStyle: {
        color: editingBanner.buttonColor || "",
        buttonColor: editingBanner.buttonTextColor || "",
      },
      selectedColor: {
        bgColor: editingBanner.backgroundColor || "",
      },
    });
  },
}));
