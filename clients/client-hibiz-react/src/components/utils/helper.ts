import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "@/axios";
import veg from "@/assets/dishTypes/veg.png";
import nonVeg from "@/assets/dishTypes/non_veg.png";
import egg from "@/assets/dishTypes/egg.png";
import vegan from "@/assets/dishTypes/vegan.png";
import { DishTypeEnum } from "@hi/db-models/src/validators";
import { DishSteps } from "../store/useMenuStorage";
import { cropImage } from "../cropper";
import toast from "react-hot-toast";

export async function storeImageAfterSave(
  image: File,
  imagePreview: string | null,
  setIsLoading?: (loading: boolean) => void,
) {
  if (!image || !imagePreview) return;

  const imageId = crypto.randomUUID();
  setIsLoading?.(true);
  try {
    // Validate Base64 string
    const base64Index = imagePreview.indexOf(",");
    console.log("base64Index", base64Index);
    if (base64Index === -1) return;

    const base64Data = imagePreview.split(",")[1];
    const blobBin = atob(base64Data);
    const array = new Uint8Array(blobBin.length);

    for (let i = 0; i < blobBin.length; i++) {
      array[i] = blobBin.charCodeAt(i);
    }

    const file = new Blob([array], { type: image.type });
    const formData = new FormData();
    formData.append("fileData", file);
    formData.append("fileName", `${imageId}`);
    formData.append("bucketName", "assets");

    const response = await axios.post(
      "https://api.hipal.life/v1/storage",
      formData,
    );

    if (response.status === 201 || response.status === 200) {
      setIsLoading?.(false);
      return `https://storage.hipal.life/minio/assets/${imageId}`;
    }
  } catch (error) {
    console.error("Failed to store image:", error);
    setIsLoading?.(false);
    toast.error("Failed to upload image. Please check the image format.");
  }
}
//apply cn
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function timestampToDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const day = date.getDate();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];

  // Determine the day suffix
  let daySuffix;
  switch (day) {
    case 1:
    case 21:
    case 31:
      daySuffix = "st";
      break;
    case 2:
    case 22:
      daySuffix = "nd";
      break;
    case 3:
    case 23:
      daySuffix = "rd";
      break;
    default:
      daySuffix = "th";
  }

  // Convert to 12-hour format
  const hourFormatted = hours % 12 || 12; // Converts 0 to 12 for midnight
  const minuteFormatted = minutes < 10 ? `0${minutes}` : minutes;
  const amPm = hours < 12 ? "AM" : "PM";

  return `${day}${daySuffix} ${month} ${hourFormatted}:${minuteFormatted} ${amPm}`;
}

export function filterPayload(
  payload: Record<string, any>,
): Record<string, any> {
  const filteredPayload = Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) =>
        value !== null &&
        value !== "" &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
  return filteredPayload;
}

export const foodTypes = [
  { name: DishTypeEnum[0], icon: veg },
  { name: DishTypeEnum[1], icon: nonVeg },
  { name: DishTypeEnum[2], icon: egg },
  { name: DishTypeEnum[3], icon: vegan },
];

export const TagsEnum = [
  "New",
  "Best_seller",
  "Spicy",
  "Occasional",
  "Popular",
];

const MAX_WIDTH = 1000;
const MAX_HEIGHT = 1000;
const MIME_TYPE = "image/webp";
const QUALITY = 1;

export const compressImage = (file, callback) => {
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;
  img.onerror = () => {
    URL.revokeObjectURL(img.src);
  };
  img.onload = () => {
    URL.revokeObjectURL(img.src);
    const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: MIME_TYPE,
              lastModified: Date.now(),
            });
            console.log("Original File:", file);
            console.log("Compressed File:", compressedFile);
            callback(compressedFile);
          }
        },
        MIME_TYPE,
        QUALITY,
      );
    }
  };
};

const calculateSize = (
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
): [number, number] => {
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
};

export const handleCrop = async (
  cropping,
  cropperRef,
  imageFiles,
  setImageFiles,
  setImagePreviews,
  setDishStep,
) => {
  const { image, type } = cropping;
  const cropper = cropperRef.current;
  if (cropper && image && type) {
    const coordinates = cropper?.getCoordinates();
    if (coordinates) {
      try {
        const croppedDataUrl = await cropImage(image, coordinates);
        if (typeof croppedDataUrl === "string") {
          const blob = await (await fetch(croppedDataUrl)).blob();
          const croppedFile = new File([blob], imageFiles[type]?.name, {
            type: "image/png",
          });
          // Save the cropped image
          setImageFiles((prev) => ({ ...prev, [type]: croppedFile }));
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) {
              setImagePreviews((prev) => ({
                ...prev,
                [type]: reader.result,
              }));
              setDishStep(DishSteps.DISH_STEP_2);
            }
          };
          reader.readAsDataURL(croppedFile);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
};

export const updateImage = async (
  file: File,
  preview: string | undefined,
  currentImage: string | undefined,
) => {
  if (preview !== "" && file) {
    return await storeImageAfterSave(file, preview as string);
  }
  return currentImage;
};

export const preDefinedButtons = ["Explore", "Buy", "Book"];

export const validateDish = (
  dishName: string,
  dishPrice: number,
  dishTypes: string[],
) => {
  console.log("dishTypes", dishTypes);
  console.log("dishname", dishName);
  console.log("dishPrice", dishPrice);
  if (dishName.length === 0) {
    toast.error("Please enter dish name");
    return false;
  }
  if (dishPrice === 0) {
    toast.error("Please enter dish price");
    return false;
  }
  if (dishTypes.length === 0) {
    toast.error("Please select dish type");
    return false;
  }
  return true;
};

export const handleClick = (
  e: React.MouseEvent<HTMLLabelElement, MouseEvent>,
  inputRef: React.RefObject<HTMLInputElement>,
) => {
  if (inputRef.current) {
    inputRef.current.value = "";
    inputRef.current.click();
  }
};
