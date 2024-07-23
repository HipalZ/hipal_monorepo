import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "@/axios";
import veg from "@/assets/dishTypes/veg.png";
import nonVeg from "@/assets/dishTypes/non_veg.png";
import egg from "@/assets/dishTypes/egg.png";
import vegan from "@/assets/dishTypes/vegan.png";
import { DishTypeEnum } from "@hi/db-models/src/validators";
import {
  DishSteps,
  type SetImageFilesFunction,
  type SetImagePreviewsFunction,
} from "../store/useMenuStorage";
import { cropImage } from "../cropper";
import toast from "react-hot-toast";

export async function storeImageAfterSave(
  image: File,
  imagePreview: string | null,
  setImageUploading: (value: boolean) => void,
  setIsLoading?: (loading: boolean) => void,
) {
  if (!image) return;
  setImageUploading(true);
  const imageId = crypto.randomUUID();
  if (imagePreview) {
    setIsLoading?.(true);
    const blobBin = atob(imagePreview.toString().split(",")[1]);
    const array = [];
    for (let i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    const file = new Blob([new Uint8Array(array)], {
      type: image.type,
    });
    const formdata = new FormData();
    formdata.append("fileData", file);
    formdata.append("fileName", `${imageId}`);
    formdata.append("bucketName", "assets");
    try {
      const response = await axios.post(
        "https://api.hipal.life/v1/storage",
        formdata,
      );
      if (response.status === 201) {
        setIsLoading?.(false);
        return `https://storage.hipal.life/minio/assets/${imageId}`;
      }
      setIsLoading?.(false);
      return toast.error("Failed to upload image");
    } catch (error) {
      setImageUploading(false);
      console.log(error);
    }
    setIsLoading?.(false);
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

const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.9;

export const compressArrayOfImages = (
  file: File,
  type: string,
  setImageFiles: SetImageFilesFunction,
  setImagePreviews: SetImagePreviewsFunction,
) => {
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;
  img.onerror = () => {
    URL.revokeObjectURL(img.src);
    console.log("Cannot load image");
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
            setImageFiles((prev) => ({ ...prev, [type]: compressedFile }));
            const reader = new FileReader();
            reader.onload = () => {
              if (reader.result) {
                setImagePreviews((prev) => ({
                  ...prev,
                  [type]: reader.result,
                }));
              }
            };
            reader.readAsDataURL(compressedFile);
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
          compressArrayOfImages(
            croppedFile,
            type,
            setImageFiles,
            setImagePreviews,
          );
          setDishStep(DishSteps.DISH_STEP_2);
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

export const preDefinedButtons = ["Explore", "Buy now", "Book"];
