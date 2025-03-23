import {
  ExplorePages,
  type ImageFiles,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { type ChangeEvent, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import type { CropperRef } from "../types/businessData";
import { useExploreTemp } from "../store/useExploreTemp";

// Callbacks to handle navigation in the explore page
export const useExploreNavigation = () => {
  const {
    toggleExplorePages,
    setToggleExplorePages,
    setImg,
    clearBizInfo,
    clearImageFiles,
  } = useExploreStore((state) => ({
    toggleExplorePages: state.toggleExplorePages,
    setToggleExplorePages: state.setToggleExplorePages,
    setImg: state.setImg,
    clearBizInfo: state.clearBizInfo,
    clearImageFiles: state.clearImageFiles,
  }));
  const { clearOriginalDishes } = useExploreTemp((s) => ({
    clearOriginalDishes: s.clearOriginalDishes,
  }));
  const businessId = useParams()?.businessId;
  const hotelId = useParams()?.hotelId;
  const navigate = useNavigate();
  const handleNavigate = useCallback(() => {
    if (toggleExplorePages === ExplorePages.BIZINFO) {
      setToggleExplorePages(ExplorePages.MAINFORM);
    }
    if (toggleExplorePages !== ExplorePages.BIZINFO) {
      clearOriginalDishes();
      clearImageFiles();
      clearBizInfo();
      setImg({});
      if(hotelId) navigate(`/app/hotel/${hotelId}/`);
      if(businessId) navigate(`/app/business/${businessId}/`);
    }
  }, [
    businessId,
    clearBizInfo,
    clearImageFiles,
    setImg,
    setToggleExplorePages,
    toggleExplorePages,
    clearOriginalDishes,
    navigate,
    hotelId,
  ]);

  return { handleNavigate };
};

// Callbacks to handle image changes in the explore page
export const useImageChange = () => {
  const { setCropping, setShowCropper, setImageFiles } = useExploreStore(
    (s) => ({
      setCropping: s.setCropping,
      setShowCropper: s.setShowCropper,
      setImageFiles: s.setImageFiles,
    }),
  );
  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const type = event.target.dataset.type as keyof ImageFiles;
      const file = event.target.files?.[0];
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
          setImageFiles({ [type]: file });
        };
      }
    },
    [setImageFiles, setCropping, setShowCropper],
  );

  return { handleImageChange };
};

// Callbacks to handle changes in the footer section of the explore page
export const useFooterSection = () => {
  const { bizInfo, setBizInfo } = useExploreStore((s) => ({
    bizInfo: s.bizInfo,
    setBizInfo: s.setBizInfo,
  }));

  const handleFssaiNumber = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.length >= 50)
        return toast.error("FSSAI number should be less than 50 characters");
      setBizInfo({ ...bizInfo, fssai: e.target.value });
    },
    [bizInfo, setBizInfo],
  );

  const handlegst = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.length >= 26)
        return toast.error("GST number should be less than 26 characters");
      setBizInfo({ ...bizInfo, gst: e.target.value });
    },
    [bizInfo, setBizInfo],
  );

  const handleFooterComment = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setBizInfo({ ...bizInfo, footerDescription: e.target.value });
    },
    [bizInfo, setBizInfo],
  );

  return { handleFssaiNumber, handlegst, handleFooterComment };
};

// explore page banner, logo, footer images by cropping n compressing
export const useCroppedImg = () => {
  const { cropping, imageFiles, setShowCropper, setImg, setImageFiles } =
    useExploreStore((s) => ({
      cropping: s.cropping,
      imageFiles: s.imageFiles,
      setShowCropper: s.setShowCropper,
      setImg: s.setImg,
      setImageFiles: s.setImageFiles,
    }));

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

  const handleCrop = async (cropperRef: CropperRef) => {
    const { image, type: sectionType } = cropping;
    if (image && sectionType) {
      const croppedAreaPixels = cropperRef.current?.getCroppedAreaPixels();
      if (croppedAreaPixels) {
        try {
          const mimeType = imageFiles[sectionType]?.type || "image/webp";
          const isGif = imageFiles[sectionType]?.type?.includes("gif");

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

          // Use croppedData directly as reader result
          const blob = await (await fetch(croppedData)).blob();
          const croppedFile = new File([blob], imageFiles?.name, {
            type: "image/png",
          });
          const reader = new FileReader();
          reader.onloadend = () => {
            setImg((prev) => ({ ...prev, [sectionType]: reader?.result }));
            setImageFiles((prev) => ({ ...prev, [sectionType]: croppedFile }));
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
