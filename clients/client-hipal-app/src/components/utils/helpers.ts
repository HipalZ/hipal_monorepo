//@ts-nocheck

import Color from "color";
import {
  beans,
  bowl,
  bud,
  flower,
  love,
  triangleToDataurl,
  waveToDataUrl,
} from "@/components/atoms/card/pathPattern";
import type { ILoyaltySetting } from "../store/useLoyaltyData";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IDish, IExtraItem } from "../types/businessData";

export const getPrice = (price: number | string) => {
  if (!price || price === 0) {
    return "";
  }

  return `₹${price}`;
};

export const getTimeIn12HrFormat = (time: string) => {
  if (!time || !time.includes(":")) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours, 10);

  const amPm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${amPm}`;
};

export type PatternKeys =
  | "wave"
  | "triangle"
  | "beans"
  | "bud"
  | "bowl"
  | "love"
  | "flower";
export const createSrcColor = (loyaltySetting: ILoyaltySetting) => [
  { src: { wave: waveToDataUrl(loyaltySetting?.cardColor, "white").wave } },
  { src: { triangle: triangleToDataurl("white").triangle } },
  { src: { beans: beans(loyaltySetting?.fontColor).beans } },
  { src: { bud: bud(loyaltySetting?.fontColor).bud } },
  { src: { bowl: bowl(loyaltySetting?.fontColor).bowl } },
  { src: { love: love(loyaltySetting?.fontColor).love } },
  { src: { flower: flower(loyaltySetting?.fontColor).flower } },
];

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


export const calculateReward = (exist: number, reward: number, limit: number) => {
	console.log('exist', exist, 'reward', reward, 'limit', limit);
	let total = exist + reward;

	const sum = Math.min(total, limit);
	const finalReward = Number(sum - exist)
	return { finalReward, curentBalance: sum };
};

interface InputObject {
  [key: string]: any;
}

interface ResultObject {
  [key: string]: string;
}

const colorNames: { [key: string]: string } = {
  primary: "--p",
  "primary-content": "--pc",
  secondary: "--s",
  "secondary-content": "--sc",
  accent: "--a",
  "accent-content": "--ac",
  neutral: "--n",
  "neutral-content": "--nc",
  "base-100": "--b1",
  "base-200": "--b2",
  "base-300": "--b3",
  "base-content": "--bc",
  info: "--in",
  "info-content": "--inc",
  success: "--su",
  "success-content": "--suc",
  warning: "--wa",
  "warning-content": "--wac",
  error: "--er",
  "error-content": "--erc",
  "bg-base-100": "--bg-b1",
};

const generateForegroundColorFrom = (color: string): string => {
  // Placeholder implementation:
  const hslArray = Color(color).negate().hsl().array();
  return `${hslArray[0].toPrecision(5).replace(/\.?0+$/, "")} ${hslArray[1]
    .toPrecision(5)
    .replace(/\.?0+$/, "")}% ${hslArray[2]
    .toPrecision(5)
    .replace(/\.?0+$/, "")}%`;
};

export function convertToHsl(input: InputObject): ResultObject | InputObject {
  const resultObj: ResultObject = {};

  if (typeof input === "object" && input !== null) {
    Object.entries(input).forEach(([rule, value]) => {
      if (colorNames.hasOwnProperty(rule)) {
        const hslArray = Color(value).hsl().array();
        resultObj[colorNames[rule]] = `${hslArray[0]
          .toPrecision(5)
          .replace(/\.?0+$/, "")} ${hslArray[1]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}% ${hslArray[2]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}%`;
      } else {
        resultObj[rule] = value;
      }

      // Auto-generate focus colors if not provided
      if (!input.hasOwnProperty("primary-focus")) {
        const darkerHslArray = Color(input["primary"])
          .darken(0.2)
          .hsl()
          .array();
        resultObj["--pf"] = `${darkerHslArray[0]
          .toPrecision(5)
          .replace(/\.?0+$/, "")} ${darkerHslArray[1]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}%`;
      }

      if (!input.hasOwnProperty("secondary-focus")) {
        const darkerHslArray = Color(input["secondary"])
          .darken(0.2)
          .hsl()
          .array();
        resultObj["--sf"] = `${darkerHslArray[0]
          .toPrecision(5)
          .replace(/\.?0+$/, "")} ${darkerHslArray[1]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}%`;
      }

      if (!input.hasOwnProperty("accent-focus")) {
        const darkerHslArray = Color(input["accent"]).darken(0.2).hsl().array();
        resultObj["--af"] = `${darkerHslArray[0]
          .toPrecision(5)
          .replace(/\.?0+$/, "")} ${darkerHslArray[1]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}%`;
      }

      if (!input.hasOwnProperty("neutral-focus")) {
        const darkerHslArray = Color(input["neutral"])
          .darken(0.2)
          .hsl()
          .array();
        resultObj["--nf"] = `${darkerHslArray[0]
          .toPrecision(5)
          .replace(/\.?0+$/, "")} ${darkerHslArray[1]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}%`;
      }

      // Auto-generate base colors
      if (!input.hasOwnProperty("base-100")) {
        resultObj["--b1"] = "0 0% 100%";
      }

      if (!input.hasOwnProperty("base-200")) {
        const darkerHslArray = Color(input["base-100"])
          .darken(0.1)
          .hsl()
          .array();
        resultObj["--b2"] = `${darkerHslArray[0]
          .toPrecision(5)
          .replace(/\.?0+$/, "")} ${darkerHslArray[1]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
          .toPrecision(5)
          .replace(/\.?0+$/, "")}%`;
      }

      if (!input.hasOwnProperty("base-300")) {
        if (input.hasOwnProperty("base-200")) {
          const darkerHslArray = Color(input["base-200"])
            .darken(0.1)
            .hsl()
            .array();
          resultObj["--b3"] = `${darkerHslArray[0]
            .toPrecision(5)
            .replace(/\.?0+$/, "")} ${darkerHslArray[1]
            .toPrecision(5)
            .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
            .toPrecision(5)
            .replace(/\.?0+$/, "")}%`;
        } else {
          const darkerHslArray = Color(input["base-100"])
            .darken(0.2)
            .hsl()
            .array();
          resultObj["--b3"] = `${darkerHslArray[0]
            .toPrecision(5)
            .replace(/\.?0+$/, "")} ${darkerHslArray[1]
            .toPrecision(5)
            .replace(/\.?0+$/, "")}% ${darkerHslArray[2]
            .toPrecision(5)
            .replace(/\.?0+$/, "")}%`;
        }
      }

      if (!input.hasOwnProperty("base-content")) {
        resultObj["--bc"] = generateForegroundColorFrom(input["base-100"]);
      }

      if (!input.hasOwnProperty("primary-content")) {
        resultObj["--pc"] = generateForegroundColorFrom(input["primary"]);
      }

      if (!input.hasOwnProperty("secondary-content")) {
        resultObj["--sc"] = generateForegroundColorFrom(input["secondary"]);
      }

      if (!input.hasOwnProperty("accent-content")) {
        resultObj["--ac"] = generateForegroundColorFrom(input["accent"]);
      }

      if (!input.hasOwnProperty("neutral-content")) {
        resultObj["--nc"] = generateForegroundColorFrom(input["neutral"]);
      }

      if (!input.hasOwnProperty("info-content")) {
        if (input.hasOwnProperty("info")) {
          resultObj["--inc"] = generateForegroundColorFrom(input["info"]);
        } else {
          resultObj["--inc"] = "198 100% 12%";
        }
      }

      if (!input.hasOwnProperty("success-content")) {
        if (input.hasOwnProperty("success")) {
          resultObj["--suc"] = generateForegroundColorFrom(input["success"]);
        } else {
          resultObj["--suc"] = "158 100% 10%";
        }
      }

      if (!input.hasOwnProperty("warning-content")) {
        if (input.hasOwnProperty("warning")) {
          resultObj["--wac"] = generateForegroundColorFrom(input["warning"]);
        } else {
          resultObj["--wac"] = "43 100% 11%";
        }
      }

      if (!input.hasOwnProperty("error-content")) {
        if (input.hasOwnProperty("error")) {
          resultObj["--erc"] = generateForegroundColorFrom(input["error"]);
        } else {
          resultObj["--erc"] = "0 100% 14%";
        }
      }

      if (!input.hasOwnProperty("--rounded-box")) {
        resultObj["--rounded-box"] = "1rem";
      }

      if (!input.hasOwnProperty("--rounded-btn")) {
        resultObj["--rounded-btn"] = "0.5rem";
      }

      if (!input.hasOwnProperty("--rounded-badge")) {
        resultObj["--rounded-badge"] = "1.9rem";
      }

      if (!input.hasOwnProperty("--animation-btn")) {
        resultObj["--animation-btn"] = "0.25s";
      }

      if (!input.hasOwnProperty("--animation-input")) {
        resultObj["--animation-input"] = "0.2s";
      }

      if (!input.hasOwnProperty("--btn-text-case")) {
        resultObj["--btn-text-case"] = "uppercase";
      }

      if (!input.hasOwnProperty("--btn-focus-scale")) {
        resultObj["--btn-focus-scale"] = "0.95";
      }

      if (!input.hasOwnProperty("--border-btn")) {
        resultObj["--border-btn"] = "1px";
      }

      if (!input.hasOwnProperty("--tab-border")) {
        resultObj["--tab-border"] = "1px";
      }

      if (!input.hasOwnProperty("--tab-radius")) {
        resultObj["--tab-radius"] = "0.5rem";
      }
    });

    return resultObj;
  }

  return input;
}

export const defaultThemes: IThemes = {
  primaryColor: "",
  secondaryColor: "",
  footerText: "",
  instagramLink: "",
  facebookLink: "",
  youtubeLink: "",
  linkedinLink: "",
};

export function calculateTotalPrice(
  dishData: IDish,
  selectedPortion: string | null,
  selectedExtras: IExtraItem
): number {
  let totalPrice = 0;

  if (selectedPortion) {
      const portion = dishData?.portions?.find(p => p.name === selectedPortion);
      totalPrice = portion?.price ?? dishData.price;  
  } else {
      totalPrice = dishData.price;  
  }

  for (const extraId of Object.keys(selectedExtras)) {
      const extra = dishData?.extras?.[0]?.items?.find(item => item._id === extraId);
      if (extra) {
          totalPrice += extra.price * selectedExtras[extraId];
      }
  }

  return totalPrice;
}
