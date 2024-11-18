import { useCallback } from "react";
import useWhatsapp, { Step, TemplateSteps } from "../store/useWhatsapp";
import type { CropperRef } from "../types/businessData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parse } from "papaparse";
import toast from "react-hot-toast";
import { useMessageRecipientsStore } from "../store/useMessageRecipientsStore";
import { apiRpc } from "@hi/common";
import useBusinessData from "../store/useBusinessData";

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
      const value = e.target.value
        .replace(/\s+/g, "_") // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9_]/g, "") // Remove anything that is not a letter, number, or underscore
        .toLowerCase();

      setTemplateName(value);
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

export const normalizeAndMapKeys = (
  obj: any,
  keyMap: { [key: string]: string },
) => {
  const normalizeKey = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[\s-_]+/g, " ")
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  return Object.keys(obj).reduce((acc, key) => {
    const normalizedKey = normalizeKey(key);
    const newKey = keyMap[normalizedKey] || key;
    acc[newKey] = obj[key];
    return acc;
  }, {} as any);
};

// Helper function to clean and normalize phone numbers
const normalizePhoneNumber = (phone: string): string | null => {
  const cleanedPhone = phone
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/^\+91/, "") // Remove +91 prefix only if it exists
    .trim(); // Remove leading and trailing spaces
  console.log(
    "cleanedPhone",
    cleanedPhone,
    typeof cleanedPhone,
    cleanedPhone.length,
  );
  // Exclude 12-digit numbers
  if (cleanedPhone.length !== 10) {
    return null; // Invalid number
  }

  return cleanedPhone;
};

// Helper function to remove duplicate objects by phone number
const removeDuplicateContacts = (contacts: any[]): any[] => {
  const uniqueContacts = new Map();
  for (const contact of contacts) {
    const normalizedPhone = normalizePhoneNumber(contact.phone);
    if (!uniqueContacts.has(normalizedPhone)) {
      uniqueContacts.set(normalizedPhone, contact);
    }
  }
  return Array.from(uniqueContacts.values());
};

export const calculateCreditScore = (
  contactsLength: number,
  balance: number,
  templateType: string,
) => {
  const creditScore =
    contactsLength * (templateType === "MARKETING" ? 0.9 : 0.2);
  if (creditScore > balance) {
    toast.error(`You have need ${creditScore} credits to send this message.`);
  } else {
    toast.success(
      `This operation will remove ${creditScore} credits from your balance.`,
    );
  }
};

export const useBulkUploadContacts = () => {
  const queryClient = useQueryClient();
  const { walletBalance, templateType } = useWhatsapp((s) => ({
    walletBalance: s.walletBalance,
    templateType: s.templateType,
  }));
  const { setUploadedFileName, setBulkCustomers } = useMessageRecipientsStore(
    (s) => ({
      setUploadedFileName: s.setUploadedFileName,
      setBulkCustomers: s.setBulkCustomers,
    }),
  );
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (file: File) => {
      return new Promise(() => {
        setUploadedFileName(file.name);
        parse(file, {
          header: true,
          complete: async (result) => {
            const keyMap = {
              name: "name",
              phone: "phone",
            };

            // Normalize keys and clean phone numbers
            const data = result.data.map((item) => {
              const normalizedItem = normalizeAndMapKeys(item, keyMap);
              if (normalizedItem.phone) {
                normalizedItem.phone = normalizePhoneNumber(
                  normalizedItem.phone,
                );
              }
              return normalizedItem;
            });

            // Filter valid data and remove duplicates
            const validData = data.filter(
              (item) => item.name && item.phone && Object.keys(item).length > 0,
            );
            const uniqueContacts = removeDuplicateContacts(validData);
            calculateCreditScore(
              uniqueContacts.length,
              walletBalance,
              templateType,
            );
            setBulkCustomers(uniqueContacts);
          },
        });
      });
    },
    onSuccess: () => {
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
        businessId: businessId || "",
      },
    });

    const response = await res.json();
    setGroups(response.data);
    return response.data;
  };
  return { fetchAllGroups };
};
