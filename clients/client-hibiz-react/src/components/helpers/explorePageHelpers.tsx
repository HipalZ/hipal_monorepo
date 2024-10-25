import {
  ExplorePages,
  type ImageFiles,
  useExploreStore,
} from "@/components/store/useExploreStore";
import { compressImage, handleImageChange } from "@/components/utils/helper";
import { type ChangeEvent, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import type { CropperRef } from "../types/businessData";

// Callbacks to handle navigation in the explore page
export const useExploreNavigation = () => {
  const {
    originalDishes,
    clearOriginalDishes,
    toggleExplorePages,
    setToggleExplorePages,
    setImg,
    clearBizInfo,
    clearImageFiles,
  } = useExploreStore((state) => ({
    originalDishes: state.originalDishes,
    clearOriginalDishes: state.clearOriginalDishes,
    toggleExplorePages: state.toggleExplorePages,
    setToggleExplorePages: state.setToggleExplorePages,
    setImg: state.setImg,
    clearBizInfo: state.clearBizInfo,
    clearImageFiles: state.clearImageFiles,
  }));
  const businessId = useParams()?.businessId;
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
      navigate(`/app/business/${businessId}/hisite`);
    }
  }, [
    businessId,
    toggleExplorePages,
    clearOriginalDishes,
    originalDishes,
    navigate,
    businessId,
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
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onloadend = () => {
            setCropping({ image: reader.result, type });
            setShowCropper(true);
            setImageFiles({ [type]: compressedFile });
          };
        });
      }
    },
    [setImageFiles, setCropping, setShowCropper],
  );

  return { handleImageChange };
};

// Callbacks to handle changes in the footer section of the explore page
export const useFooterSection = () => {
  const { bizInfo, setBizInfo, setCropping, setShowCropper, setImageFiles } =
    useExploreStore((s) => ({
      bizInfo: s.bizInfo,
      setBizInfo: s.setBizInfo,
      setCropping: s.setCropping,
      setShowCropper: s.setShowCropper,
      setImageFiles: s.setImageFiles,
    }));
  const handleImage = async (event) => {
    const result = await handleImageChange(event);
    if (result) {
      const { image, type, compressedFile } = result;
      setCropping({ image, type });
      setShowCropper(true);
      setImageFiles({ [type]: compressedFile });
    }
  };
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

  return { handleImage, handleFssaiNumber, handlegst, handleFooterComment };
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
    const { image, type } = cropping;
    if (image && type) {
      const croppedAreaPixels = cropperRef.current?.getCroppedAreaPixels();
      if (croppedAreaPixels) {
        try {
          // Revoke the previous object URL if it exists
          if (
            typeof imageFiles[type]?.preview === "string" &&
            imageFiles[type].preview.startsWith("blob:")
          ) {
            URL.revokeObjectURL(imageFiles[type].preview);
          }
          const mimeType = imageFiles[type]?.type || "image/webp";
          const isGif = imageFiles[type]?.name.toLowerCase().endsWith(".gif");

          let croppedData: string | Blob;
          if (isGif) {
            // croppedData = await compressGif(image, croppedAreaPixels);
            croppedData = image;
          } else {
            croppedData = await getCroppedImg(
              image,
              croppedAreaPixels,
              mimeType,
            );
          }
          let blob: Blob;
          if (typeof croppedData === "string") {
            // For non-GIF images
            blob = await fetch(croppedData).then((r) => r.blob());
          } else {
            // For GIF images
            blob = croppedData;
          }
          let previewUrl: string;
          if (isGif) {
            previewUrl = URL.createObjectURL(blob);
          } else {
            previewUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }

          const croppedFile = new File([blob], imageFiles[type]?.name, {
            type: mimeType,
          });

          // Add the preview URL to the file object
          Object.assign(croppedFile, { preview: previewUrl });
          setImg((prev) => ({ ...prev, [type]: previewUrl }));
          setImageFiles((prev) => ({ ...prev, [type]: croppedFile }));
          setShowCropper(false);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };
  return { handleCrop };
};
