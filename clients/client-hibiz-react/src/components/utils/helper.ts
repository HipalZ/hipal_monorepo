import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "@/axios";
import veg from "@/assets/dishTypes/veg.png";
import nonVeg from "@/assets/dishTypes/non_veg.png";
import egg from "@/assets/dishTypes/egg.png";
import vegan from "@/assets/dishTypes/vegan.png";
import { DishTypeEnum } from "@hi/db-models/src/validators";
import { DishSteps, type ImageFiles } from "../store/useMenuStorage";
import { cropImage } from "../cropper";
import toast from "react-hot-toast";
import { differenceInMonths, differenceInYears, format } from "date-fns";
import type { ChangeEvent } from "react";

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
    if (file.type === "image/heic" || file.type === "image/heif") {
      toast.error("unsupported format. Try jp(e)g/png/webp.");
    }
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
  setIsLoading?: (loading: boolean) => void,
) => {
  if (preview !== "" && file) {
    return await storeImageAfterSave(file, preview as string, setIsLoading);
  }
  return currentImage;
};

export const preDefinedButtons = ["Explore", "Buy", "Book"];

export const validateDish = (
  dishName: string,
  dishPrice: number,
  dishTypes: string[],
) => {
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

export const hideMiddleNumbers = (phone: string) => {
  if (phone?.length <= 4) return phone;
  const firstPart = phone?.slice(0, 3);
  const lastPart = phone?.slice(-3);
  return `${firstPart}****${lastPart}`;
};

export const hexToRgba = (hex: string) => {
  let r = 0;
  let g = 0;
  let b = 0;
  const alpha = 0.1;
  // 3 digits
  if (hex && hex?.length === 4) {
    r = Number.parseInt(hex[1] + hex[1], 16);
    g = Number.parseInt(hex[2] + hex[2], 16);
    b = Number.parseInt(hex[3] + hex[3], 16);
  } else if (hex && hex?.length === 7) {
    // 6 digits
    r = Number.parseInt(hex[1] + hex[2], 16);
    g = Number.parseInt(hex[3] + hex[4], 16);
    b = Number.parseInt(hex[5] + hex[6], 16);
  }
  return `rgba(${r},${g},${b},${alpha})`;
};
export const calculateFutureTimestamp = (
  remainder: string,
  duration: string,
  time: string,
): number => {
  // Calculate the future date based on remainder and duration
  const futureDate = calculateFutureDate(remainder, duration);
  // Split the time into hours and minutes
  const [hour, minute] = time.split(":").map(Number);

  // Set the hours and minutes on the future date
  futureDate.setHours(hour);
  futureDate.setMinutes(minute);
  futureDate.setSeconds(0); // Optionally set seconds to 0

  // Convert the future date to a Unix timestamp (milliseconds since Jan 1, 1970)
  return futureDate.getTime();
};

export const parseRemainderDate = (remainderDate) => {
  const now = new Date();
  const futureDate = new Date(remainderDate);

  let remainder = 0;
  let duration = "";

  // Calculate differences
  const totalDayDifference = Math.abs(
    Math.floor((futureDate - now) / (1000 * 60 * 60 * 24)),
  );

  const yearDifference = differenceInYears(futureDate, now);
  const monthDifference = differenceInMonths(futureDate, now);
  const dayDifference =
    totalDayDifference - (yearDifference * 365 + monthDifference * 30); // approximate months to 30 days

  if (yearDifference > 0) {
    remainder = yearDifference;
    duration = "Years";
  } else if (monthDifference > 0) {
    remainder = monthDifference;
    duration = "Months";
  } else if (dayDifference > 0) {
    remainder = dayDifference;
    duration = "Days";
  }

  // Extract time in HH:mm format
  const time = format(futureDate, "HH:mm");

  return { remainder, duration, time };
};

// tagz conversions to milliseconds
export const convertToTime = (milliseconds: number) => {
  const totalMinutes = Math.floor(milliseconds / (60 * 1000));
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12; // Convert 0 to 12 for 12 AM/PM

  const formattedHours = String(hours12);
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes} ${period}`;
};

export const convertToMilliSeconds = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  const hoursInMilliseconds = hours * 3600 * 1000;
  const minutesInMilliseconds = minutes * 60 * 1000;

  const totalMilliseconds = hoursInMilliseconds + minutesInMilliseconds;
  return totalMilliseconds;
};

export const formatTime = (time) => {
  const [hour, minute] = time.split(":");
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute} ${period}`;
};

export const calculateFutureDate = (remainder, duration: string) => {
  const now = new Date();
  if (duration === "Days") {
    now.setDate(now.getDate() + Number.parseInt(remainder, 10));
  } else if (duration === "Months") {
    now.setMonth(now.getMonth() + Number.parseInt(remainder, 10));
  } else if (duration === "Years") {
    now.setFullYear(now.getFullYear() + Number.parseInt(remainder, 10));
  }
  return now;
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const convertMillisecondsToTime = (milliseconds: number) => {
  const date = new Date(milliseconds);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const handleAllChecks = (filteredPayload) => {
  if (filteredPayload?.name.length <= 3) {
    return toast.error("Please enter tag name more than 3 characters");
  }
  if (filteredPayload?.note.length <= 2) {
    return toast.error("Please enter tag notes more than 2 characters");
  }
};

export function hexToRGBA(hex: string, opacity: string) {
  let r = 0;
  let g = 0;
  let b = 0;
  if (hex && hex.length === 4) {
    r = Number.parseInt(hex[1] + hex[1], 16);
    g = Number.parseInt(hex[2] + hex[2], 16);
    b = Number.parseInt(hex[3] + hex[3], 16);
  } else if (hex && hex.length === 7) {
    r = Number.parseInt(hex[1] + hex[2], 16);
    g = Number.parseInt(hex[3] + hex[4], 16);
    b = Number.parseInt(hex[5] + hex[6], 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const handleImageChange = async (
  event: ChangeEvent<HTMLInputElement>,
) => {
  const type = event.target.dataset.type as keyof ImageFiles;
  const file = event.target.files?.[0];
  if (file) {
    return new Promise((resolve) => {
      compressImage(file, (compressedFile) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = () => {
          resolve({
            image: reader.result,
            type,
            compressedFile,
          });
        };
      });
    });
  }
};
