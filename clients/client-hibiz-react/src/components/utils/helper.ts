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
import pastaDummy from "@/assets/pastaDummy.png";
import { cropImage } from "../cropper";
import ArrowPattern from "../templates/explorePage/dynamicArrowPattern";
import BowPattern from "../templates/explorePage/dynamicBowPattern";
import DotsPattern from "../templates/explorePage/dynamicDotsPattern";
import { BannerType } from "../templates/explorePage/explorePageStore";

export async function storeImageFiles(image: File) {
  if (image === undefined) return;
  const reader = new FileReader();
  reader?.readAsDataURL(image);
  const imageId = crypto.randomUUID();
  await new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };
  });
  if (reader.result) {
    const blobBin = atob(reader.result.toString().split(",")[1]);
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
      const res = await axios.post(
        `https://api.hipal.life/v1/storage`,
        formdata,
      );
      console.log("res", res);
      return `https://storage.hipal.life/minio/assets/${imageId}`;
    } catch (error) {
      console.log(error);
    }
  }
}

export async function storeImageAfterSave(
  image: File,
  imagePreview: string | null,
) {
  if (!image) return;
  const imageId = crypto.randomUUID();
  if (imagePreview) {
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
      await axios.post("https://api.hipal.life/v1/storage", formdata);
      return `https://storage.hipal.life/minio/assets/${imageId}`;
    } catch (error) {
      console.log(error);
    }
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

export const bannerLayouts = [
  {
    _id: BannerType.BANNER_TYPE_1,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Fit With Link",
    image: pastaDummy,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_2,
    heading: "Pasta with Bun, No actions are long",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Fit No Link",
    image: pastaDummy,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts2 = [
  {
    _id: BannerType.BANNER_TYPE_3,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Hanging card with link",
    image: pastaDummy,
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_4,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Hanging card no link",
    image: pastaDummy,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts3 = [
  {
    _id: BannerType.BANNER_TYPE_5,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Expand with link",
    image: pastaDummy,
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_6,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    title: "Expand no link",
    image: pastaDummy,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts4 = [
  {
    _id: BannerType.BANNER_TYPE_7,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Expand center banner",
    image: pastaDummy,
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_8,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "Explore",
    title: "Expand center no link",
    image: pastaDummy,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts5 = [
  {
    _id: BannerType.BANNER_TYPE_9,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Expand top banner",
    image: pastaDummy,
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_10,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Expand top no link",
    image: pastaDummy,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];

export const bannerLayouts6 = [
  {
    _id: BannerType.BANNER_TYPE_11,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: true,
    buttonText: "Explore",
    title: "Cool text link",
    image: pastaDummy,
    isPattern: true,
    pattern: ArrowPattern,
    description: "Works best with 680x920 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_12,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Cool text no link",
    image: pastaDummy,
    isPattern: true,
    pattern: BowPattern,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
  {
    _id: BannerType.BANNER_TYPE_13,
    heading: "Pasta with Bun",
    paragraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
    isButton: false,
    buttonText: "",
    title: "Cool text no link",
    image: pastaDummy,
    isPattern: true,
    pattern: DotsPattern,
    description: "Works best with 680x680 -1:1 Images with desc & link",
  },
];
