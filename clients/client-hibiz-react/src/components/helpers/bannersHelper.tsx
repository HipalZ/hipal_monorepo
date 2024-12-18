import { useBannerStore } from "@/components/store/useBannerStore";
import { useBannerTemp } from "@/components/store/useBannerTemp";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import type {
  CropperRef,
  IBannerPayload,
  UseBannerStylesProps,
} from "@/components/types/businessData";
import {
  allLayouts,
  BannerPage,
  BannerType,
} from "@/components/utils/bannerLayouts";
import { storeImageAfterSave } from "@/components/utils/helper";
import { type ChangeEvent, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

export const buttonColors = [
  { bgColor: "#FFFFFF", textColor: "#000000" }, // Mint green with black text
  { bgColor: "#9013FE", textColor: "#ffffff" }, // Purple with white text
  { bgColor: "#F5A623", textColor: "#000000" }, // Orange with black text
  { bgColor: "#000000", textColor: "#ffffff" }, // Red with white text
  { bgColor: "#7ED321", textColor: "#000000" }, // Lime green with black text
  { bgColor: "transparent", textColor: "#ffffff" }, // Black with white text
];

export const preDefinedColors = [
  "#FFFFFF", // White
  "#9013FE", // Purple
  "#F5A623", // Orange
  "#000000", // Black
  "#7ED321", // Lime green
  "transparent",
];

// removing the image from the banner and image files
export const useRemoveImage = () => {
  const { setImageFiles, setImg } = useBannerTemp((s) => ({
    setImageFiles: s.setImageFiles,
    setImg: s.setImg,
  }));
  const handleRemoveImage = useCallback(() => {
    setImageFiles(null);
    setImg("");
  }, [setImageFiles, setImg]);

  return { handleRemoveImage };
};

// adding banner, logo and footer image files and opening cropper
export const useImageChange = () => {
  const { setImageFiles, setShowCropper, setCropping } = useBannerTemp((s) => ({
    setImageFiles: s.setImageFiles,
    setShowCropper: s.setShowCropper,
    setCropping: s.setCropping,
  }));
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const type = event?.target?.dataset?.type;
      const file = event?.target?.files?.[0];
      if (file) {
        const maxSizeInBytes = 3 * 1024 * 1024; // 3MB in bytes
        if (file.size > maxSizeInBytes) {
          toast.error("File size exceeds 3MB. Please select a smaller file.");
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setCropping({ image: reader.result, type });
          setShowCropper(true);
          setImageFiles(file);
        };
      }
    },
    [setImageFiles, setShowCropper, setCropping],
  );

  return { handleImageChange };
};

// setting color for the banner, button and paragraph
export const useCustomColor = () => {
  const { setParagraphStyle, setButtonStyle, setSelectedColor } = useBannerTemp(
    (s) => ({
      setParagraphStyle: s.setParagraphStyle,
      setButtonStyle: s.setButtonStyle,
      setSelectedColor: s.setSelectedColor,
    }),
  );
  const handleCustomColor = useCallback(
    (element: string, color: string, buttonColor?: string) => {
      if (element === "paragraph" || element === "heading") {
        setParagraphStyle({ color });
      } else if (element === "button") {
        setButtonStyle({ color, buttonColor });
      } else {
        setSelectedColor({ bgColor: color });
      }
    },
    [setParagraphStyle, setButtonStyle, setSelectedColor],
  );

  return { handleCustomColor };
};

// change event for heading and paragraph text
export const useHeadingChange = () => {
  const { setHeading } = useBannerTemp((s) => ({
    setHeading: s.setHeading,
  }));
  const handleHeadingChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHeading(event.target.value);
    },
    [setHeading],
  );

  return { handleHeadingChange };
};

export const useParagraphChange = () => {
  const { setParagraph } = useBannerTemp((s) => ({
    setParagraph: s.setParagraph,
  }));
  const handleParagraphChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setParagraph(event.target.value);
    },
    [setParagraph],
  );

  return { handleParagraphChange };
};

// handle redirections for the banner on clicking banner in user side redirects to particular item (dish/category)
export const useHandleDirections = () => {
  const { setClickRedirect } = useBannerTemp((s) => ({
    setClickRedirect: s.setClickRedirect,
  }));
  const handleRedirections = useCallback(() => {
    setClickRedirect(true);
  }, [setClickRedirect]);

  return { handleRedirections };
};

// handle button name for the banner
export const useButtonName = () => {
  const { setCallToAction } = useBannerTemp((s) => ({
    setCallToAction: s.setCallToAction,
  }));
  const handleButtonName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setCallToAction(event.target.value);
    },
    [setCallToAction],
  );

  return { handleButtonName };
};

// saving redirections for the banner
export const useRedirections = () => {
  const { setRedirectionId, setRedirectionType, setItemName } = useBannerTemp(
    (s) => ({
      setRedirectionId: s.setRedirectionId,
      setRedirectionType: s.setRedirectionType,
      setItemName: s.setItemName,
    }),
  );
  const handleSaveRedirections = useCallback(
    (type: string, id: string, itemName: string) => {
      setRedirectionId(id);
      setRedirectionType(type);
      setItemName(itemName);
    },
    [setRedirectionId, setRedirectionType, setItemName],
  );

  return { handleSaveRedirections };
};

// cropping the image for the banner
export const useCroppedImg = () => {
  const { cropping, imageFiles, setShowCropper, setImg, setImageFiles } =
    useBannerTemp((s) => ({
      cropping: s.cropping,
      imageFiles: s.imageFiles,
      setShowCropper: s.setShowCropper,
      setImg: s.setImg,
      setImageFiles: s.setImageFiles,
    }));
  // compressing the image
  const getCroppedImg = (
    imageSrc: string,
    pixelCrop,
    mimeType = "image/webp",
    quality = 0.9,
  ) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
          );
          resolve(canvas.toDataURL(mimeType, quality));
        } else {
          reject(new Error("Failed to get canvas context"));
        }
      };

      image.onerror = (err) => {
        reject(err);
      };
    });
  };

  // cropping and setting the updated height n width's imageFile and image
  const handleCrop = async (cropperRef: CropperRef) => {
    const { image, type } = cropping;
    if (image && type) {
      const croppedAreaPixels = cropperRef.current?.getCroppedAreaPixels();
      if (croppedAreaPixels) {
        try {
          const mimeType = imageFiles?.type || "image/webp";
          const isGif = imageFiles?.type?.includes("gif");

          let croppedData: Blob | string;
          if (isGif) {
            // croppedData = await compressGif(imageFiles, croppedAreaPixels);
            croppedData = image;
          } else {
            croppedData = await getCroppedImg(
              image,
              croppedAreaPixels,
              mimeType,
            );
          }

          // Use croppedData directly as previewUrl
          const blob = await (await fetch(croppedData)).blob();
          const croppedFile = new File([blob], imageFiles?.name, {
            type: "image/png",
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            setImg(reader?.result);
            setImageFiles(croppedFile);
            setShowCropper(false);
          };
          reader.readAsDataURL(croppedFile);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  return { handleCrop };
};

// handling back click and change layout for the banner
export const useBannerBackChangeLayout = () => {
  const { setBannerPage } = useBannerStore((s) => ({
    setBannerPage: s.setBannerPage,
  }));

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));
  const handleBackClick = useCallback(() => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERS);
  }, [setBannerPage, setToggleExplorePages]);

  const handleChangeLayout = useCallback(() => {
    setBannerPage(BannerPage.VIEW);
    setToggleExplorePages(ExplorePages.BANNERLAYOUTS);
  }, [setBannerPage, setToggleExplorePages]);

  return { handleBackClick, handleChangeLayout };
};

// check validations for the banner if banner is undefined or image is not base64 then only store the image
export const useCheckValidations = () => {
  const { imageFiles, setIsLoading, img } = useExploreStore((s) => ({
    imageFiles: s.imageFiles,
    setIsLoading: s.setIsLoading,
    img: s.img,
  }));

  const checkValidations = async () => {
    let bannerExplore: string | undefined;
    let logoExplore: string | undefined;
    let footerExplore: string | undefined;
    if (imageFiles?.banner !== undefined && /base64/.test(img?.banner)) {
      bannerExplore = await storeImageAfterSave(
        imageFiles?.banner,
        img?.banner,
        setIsLoading,
      );
    }

    if (imageFiles?.logo !== undefined && /base64/.test(img?.logo)) {
      logoExplore = await storeImageAfterSave(
        imageFiles?.logo,
        img?.logo,
        setIsLoading,
      );
    }

    if (imageFiles?.footer !== undefined && /base64/.test(img?.footer)) {
      footerExplore = await storeImageAfterSave(
        imageFiles?.footer,
        img?.footer,
        setIsLoading,
      );
    }

    return { bannerExplore, logoExplore, footerExplore };
  };

  return { checkValidations };
};

// handling edit banner and setting the banner type
export const useEditBanner = () => {
  const { setSelectedBannerType, setSelectedBanner, setEditBanner } =
    useBannerStore((s) => ({
      setSelectedBannerType: s.setSelectedBannerType,
      setSelectedBanner: s.setSelectedBanner,
      setEditBanner: s.setEditBanner,
    }));

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));

  const handleEditBanner = useCallback(
    (banner: IBannerPayload) => {
      setSelectedBanner(banner);
      setSelectedBannerType(banner?.layout || "");
      setEditBanner(banner?._id || "");
      setToggleExplorePages(ExplorePages.EDITBANNER);
    },
    [
      setEditBanner,
      setSelectedBanner,
      setSelectedBannerType,
      setToggleExplorePages,
    ],
  );

  return { handleEditBanner };
};

// for create/ edit banner we need layout object to display or hide the button, pattern, image etc
export const useLayoutObject = (layoutId: string) => {
  const layout = useMemo(() => {
    return allLayouts.find((l) => l._id === layoutId);
  }, [layoutId]);

  return layout;
};

// banner layout styles
export const useBannerStyles = ({
  buttonStyle,
  paragraphStyle,
  openPreview,
  selectedBannerType,
}: UseBannerStylesProps) => {
  const styles = useMemo(() => {
    const buttonStyleTags = {
      backgroundColor:
        buttonStyle?.color === "transparent" || buttonStyle?.color === "#808080"
          ? "transparent"
          : buttonStyle?.color || "#808080",
      color: buttonStyle?.buttonColor || "white",
      background: `linear-gradient(137.02deg, ${
        buttonStyle?.color || "white"
      }80 1.64%,${buttonStyle?.color || "white"}30 98.36%)`,
    };

    const buttonOutlineStyleTags = {
      backgroundColor: "transparent",
      color: buttonStyle?.color || "white",
      border: `1px solid ${buttonStyle?.color || "white"}`,
      transition: "background-color 300ms ease, color 300ms ease",
    };

    const buttonClassNames = `flex items-center justify-center md:px-3
    rounded-full space-x-1 transition-all duration-300 ease-in-out transform shadow-sm
    hover:scale-105 active:scale-95 shadow-inner ${
      openPreview
        ? "text-[0.75rem] px-3 py-1"
        : "text-[0.5rem] px-1.5 py-0.5 md:text-[1rem]"
    }`;

    const arrowButtonStyles = `${
      openPreview ? "text-[0.9rem]" : "text-[0.6rem] md:text-[1rem]"
    }`;

    const headingTextStyle = `${
      selectedBannerType !== BannerType.BANNER_TYPE_1 &&
      selectedBannerType !== BannerType.BANNER_TYPE_2
        ? "text-white"
        : ""
    } ${openPreview ? "text-[1.2rem]" : "text-[0.85rem] md:text-[1.5rem]"}`;

    const paragraphTextStyle = `${
      selectedBannerType !== BannerType.BANNER_TYPE_1 &&
      selectedBannerType !== BannerType.BANNER_TYPE_2
        ? "text-white"
        : ""
    } ${
      openPreview
        ? "text-[0.8rem] text-justify"
        : "text-[0.6rem] md:text-[1.25rem] text-justify"
    }`;

    const paragraphPropsStyle = {
      color:
        paragraphStyle?.color === "transparent"
          ? "white"
          : paragraphStyle?.color,
    };

    const sizeClasses = openPreview
      ? "w-[20rem] h-[25rem]"
      : "md:w-[25rem] md:h-[25rem] w-[14rem] h-[14rem]";

    return {
      buttonStyleTags,
      buttonOutlineStyleTags,
      buttonClassNames,
      arrowButtonStyles,
      headingTextStyle,
      paragraphTextStyle,
      paragraphPropsStyle,
      sizeClasses,
    };
  }, [buttonStyle, paragraphStyle, openPreview, selectedBannerType]);

  return styles;
};

interface ButtonStyle {
  color?: string;
  buttonColor?: string;
}

interface ParagraphStyle {
  color?: string;
}

export const useButtonStyles = (buttonStyle: ButtonStyle) => {
  const buttonStyleTags = useMemo(
    () => ({
      backgroundColor: buttonStyle?.color || "#808080",
      color: buttonStyle?.buttonColor || "white",
      background: `linear-gradient(137.02deg, ${
        buttonStyle?.color || "white"
      }80 1.64%,${buttonStyle?.color || "white"}30 98.36%)`,
    }),
    [buttonStyle],
  );
  const buttonOutlineStyleTags = {
    backgroundColor: "transparent",
    color: buttonStyle?.color || "white",
    border: `1px solid ${buttonStyle?.color || "white"}`,
  };

  return { buttonStyleTags, buttonOutlineStyleTags };
};

export const useParagraphStyles = (paragraphStyle: ParagraphStyle) => {
  const paragraphPropsStyle = useMemo(
    () => ({
      color:
        paragraphStyle?.color === "transparent"
          ? "white"
          : paragraphStyle?.color,
    }),
    [paragraphStyle],
  );

  return paragraphPropsStyle;
};
