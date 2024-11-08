import { useCallback } from "react";
import useWhatsapp from "../store/useWhatsapp";
import type { CropperRef } from "../types/businessData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parse } from "papaparse";
import { normalizeAndMapKeys } from "@/hooks/useCategory";
import toast from "react-hot-toast";
import { useMessageRecipientsStore } from "../store/useMessageRecipientsStore";
import { apiRpc } from "@hi/common";
import useBusinessData from "../store/useBusinessData";
import { setgroups } from "process";

export const useWhatzappCroppedImg = () => {
  const {
    cropping,
    imageFiles,
    setShowCropper,
    setImagePreview,
    setImageFiles,
  } = useWhatsapp((s) => ({
    cropping: s.cropping,
    imageFiles: s.imageFiles,
    setShowCropper: s.setShowCropper,
    setImagePreview: s.setImagePreview,
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
    console.log("type", type);
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
            setImagePreview(reader?.result);
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

export const useAddTemplate = () => {
  const { setTemplateName, setBodyText } = useWhatsapp((s) => ({
    setTemplateName: s.setTemplateName,
    setBodyText: s.setBodyText,
  }));

  const addTemplateName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/ /g, "_");
      const regex = /^[a-z0-9_]*$/;

      if (regex.test(value)) {
        setTemplateName(value);
      }
    },
    [setTemplateName],
  );

  const handleBodyTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setBodyText(e.target.value);
    },
    [setBodyText],
  );

  return { addTemplateName, handleBodyTextChange };
};

export const useBulkUploadContacts = () => {
  const queryClient = useQueryClient();
  const { setUploadedFileName, setBulkCustomers } = useMessageRecipientsStore(
    (s) => ({
      setUploadedFileName: s.setUploadedFileName,
      setBulkCustomers: s.setBulkCustomers,
    }),
  );
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise((resolve, reject) => {
        setUploadedFileName(file.name);
        parse(file, {
          header: true,
          complete: async (result) => {
            const keyMap = {
              name: "name",
              phone: "phone",
            };

            const data = result.data.map((item) =>
              normalizeAndMapKeys(item, keyMap),
            );

            const validData = data.filter(
              (item) => item.name && item.phone && Object.keys(item).length > 0,
            );

            console.log("validData", validData);
            setBulkCustomers(validData);
          },
        });
      });
    },
    onSuccess: () => {
      toast.success("Contacts uploaded successfully");
      queryClient.invalidateQueries(["getContacts"]);
    },
    onError: () => {
      toast.error("Failed to upload contacts");
    },
  });

  return { mutate: mutateAsync, isPending };
};

export const useGetAllGroups = () => {
  const businessId = useBusinessData((s) => s.businessData?._id);
  const { setGroups } = useMessageRecipientsStore((s) => ({
    setGroups: s.setGroups,
  }));
  const fetchAllGroups = async () => {
    const res = await apiRpc.groups.$get({
      query: {
        businessId,
      },
    });

    const response = await res.json();
    setGroups(response.data);
    return response.data;
  };
  return { fetchAllGroups };
};
