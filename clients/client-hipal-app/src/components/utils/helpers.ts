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
import type { Coupon, IDish, IExtraItem } from "../types/businessData";
import { FaWhatsapp } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdOutlineCall } from "react-icons/md";
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";
import { useCallback } from "react";

export const getPrice = (price: number | string) => {
  if (!price || price === 0) {
    return "";
  }

  return `${price}`;
};

export const getTimeIn12HrFormat = (time: string) => {
  if (!time || !time.includes(":")) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours, 10);

  const amPm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${amPm}`;
};

export function formatTime(time: number): string {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

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

export const formatDate = (timestamp: number): string => {
  if (timestamp === 0) {
    return "No expiry";
  }
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()]; // Get the month abbreviation
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const calculateReward = (
  exist: number,
  reward: number,
  limit: number,
) => {
  console.log("exist", exist, "reward", reward, "limit", limit);
  let total = exist + reward;

  const sum = Math.min(total, limit);
  const finalReward = Math.round(sum - exist);
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
  "primary-focus": "--pf",
  "secondary-focus": "--sf",
  "accent-focus": "--af",
  "neutral-focus": "--nf",
  "base-100": "--b1",
  "base-200": "--b2",
  "base-300": "--b3",
  "base-content": "--bc",
  "primary-content": "--pc",
  "secondary-content": "--sc",
  "accent-content": "--ac",
  "info-content": "--inc",
  "success-content": "--suc",
  "neutral-content": "--nc",

  secondary: "--s",
  accent: "--a",
  neutral: "--n",
  info: "--in",
  success: "--su",
  warning: "--wa",
  "warning-content": "--wac",
  error: "--er",
  "error-content": "--erc",
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
  selectedExtras: IExtraItem,
): number {
  let totalPrice = 0;

  if (selectedPortion) {
    const portion = dishData?.portions?.find((p) => p.name === selectedPortion);
    totalPrice = portion?.price ?? dishData.price;
  } else {
    totalPrice = dishData.price;
  }

  for (const extraId of Object.keys(selectedExtras)) {
    const extra = dishData?.extras?.[0]?.items?.find(
      (item) => item._id === extraId,
    );
    if (extra) {
      totalPrice += extra.price * selectedExtras[extraId];
    }
  }

  return totalPrice;
}

export const preDefinedHeroButtons = [
  {
    _id: "1",
    label: "Direction",
    icon: FaMapMarkerAlt,
  },
  {
    _id: "2",
    label: "Call",
    icon: MdOutlineCall,
  },
  {
    _id: "3",
    label: "WhatsApp",
    icon: FaWhatsapp,
  },
];

export function hexToRGBA(hex, opacity) {
  let r = 0,
    g = 0,
    b = 0;
  // Check for shorthand hex code (e.g., #03F)
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

const firebaseConfig = {
  apiKey: "AIzaSyC_Gx_LwNxkBTHw1ewq5Vx3IRP78fvzRvE",
  authDomain: "reviewz-ecd55.firebaseapp.com",
  projectId: "reviewz-ecd55",
  storageBucket: "reviewz-ecd55.appspot.com",
  messagingSenderId: "521843864608",
  appId: "1:521843864608:web:8487879b0144a9257b7845",
  measurementId: "G-9SW8ES10NE",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
export const colors = [
  {
    bgColor: "bg-[#FFC93C]",
    color: "#FFC93C",
    textColor: "text-[#000000]",
    linearGradient: "linear-gradient(92.87deg, #F2FF9D 0.47%, #DDE79E 99.53%)",
    hueRotate: 116,
  },
  {
    bgColor: "bg-[#67A5EC]",
    color: "#67A5EC",
    textColor: "text-[#000000]",
    linearGradient: "linear-gradient(92.87deg, #9DFFFD 0.47%, #A5E79E 99.53%)",
    hueRotate: 259,
  },
  {
    bgColor: "bg-[#9267EC]",
    color: "#9267EC",
    linearGradient: "linear-gradient(92.87deg, #B79DFF 0.47%, #E59EE7 99.53%)",
    textColor: "text-[#000000]",
    hueRotate: 343,
  },
  {
    bgColor: "bg-[#EC678D]",
    color: "#EC678D",
    textColor: "text-[#000000]",
    linearGradient: "linear-gradient(92.87deg, #FF9DB7 0.47%, #E79E9F 99.53%)",
    hueRotate: 43,
  },
  {
    bgColor: "bg-[#67EC8D]",
    color: "#67EC8D",
    textColor: "text-[#000000]",
    linearGradient: "linear-gradient(92.87deg, #D6FF9D 0.47%, #9EE7A8 99.53%)",
    hueRotate: 212,
  },
];
export function getLinearGradient(hexColor: string): string | null {
  const colorObject = colors?.find(
    (color) => color?.color?.toLowerCase() === hexColor?.toLowerCase(),
  );
  return colorObject
    ? colorObject?.linearGradient
    : "linear-gradient(92.87deg, #B79DFF 0.47%, #E59EE7 99.53%)";
}

export function getTextColor(hexColor: string): string {
  const colorObject = colors?.find(
    (color) => color?.color?.toLowerCase() === hexColor?.toLowerCase(),
  );
  return colorObject?.textColor ?? "#000000"; // Default to black if not found
}

export function getHueColor(hexColor: string): number | null {
  const colorObject = colors?.find(
    (color) => color?.color?.toLowerCase() === hexColor?.toLowerCase(),
  );
  return colorObject ? colorObject?.hueRotate : null;
}

// convert hex code to linear gradient other color
export const adjustLightness = (color, amount) => {
  let hsl = hexToHSL(color);
  hsl.l = Math.max(0, Math.min(100, hsl.l - amount)); // Ensure within [0, 100]
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};

const hexToHSL = (H) => {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H?.length === 4) {
    r = parseInt(H[1] + H[1], 16);
    g = parseInt(H[2] + H[2], 16);
    b = parseInt(H[3] + H[3], 16);
  } else if (H?.length === 7) {
    r = parseInt(H[1] + H[2], 16);
    g = parseInt(H[3] + H[4], 16);
    b = parseInt(H[5] + H[6], 16);
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
    : 0;
  return {
    h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    s: 100 * (s ? s / (l + Math.min(r, g, b)) : 0),
    l: (100 * (l + Math.min(r, g, b))) / 2,
  };
};

// finding percentage or value in coupon
export const formatDiscount = (value: number, discountType: string): string => {
  return discountType === "PERCENTAGE" ? `${value}% ` : `₹${value} `;
};

// getting todays date in day, month, year
export const getTodayDate = () => {
  const today = new Date();
  const day = today.getDate().toString();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear().toString();
  return { day, month, year };
};

// couponz enum
export enum ICouponPage {
  SINGLECOUPON = "singleCoupon",
  BIRTHDAYCOUPON = "birthdayCoupon",
  CONGRATULATIONZ = "congratulationz",
  ALLCOUPONZ = "allCouponz",
  TERMSANDCONDITIONS = "termsAndConditions",
  SEEMYCOUPONZ = "seeMyCouponz",
}

// random generating the blasts
export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
export function triggerConfettiBlast() {
  confetti({
    angle: randomInRange(55, 125),
    spread: randomInRange(50, 70),
    particleCount: randomInRange(50, 100),
    origin: { y: 0.6 },
  });
}

// calculation of timestamp
const monthMapping: { [key: string]: number } = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export const convertToTimestamp = (date) => {
  const { day, month, year } = date;
  // JavaScript months are 0-indexed, so subtract 1 to align with your month values (where January = 1)
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.getTime(); // getTime() returns milliseconds since the Unix Epoch
};

// hexcode to gradient
export function hexToGradient(hex: string): {
  h: number;
  s: number;
  l: number;
} {
  // Remove the # if it exists
  hex = hex.replace(/^\s*#|\s*$/g, "");

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function HSLToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 15) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return (
    "#" +
    [255 * f(0), 255 * f(8), 255 * f(4)]
      .map((x) => Math.round(x).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function generateComplementaryColor(hex: string): string {
  let { h, s, l } = hexToHSL(hex);

  // Shift hue by 15 degrees and increase lightness
  h = (h + 10) % 360;
  l = Math.min(l + 10, 100);

  return HSLToHex(h, s, l);
}

export const getCustomDays = (days: string[]) => {
  return days.map((day) => {
    switch (day.toLowerCase()) {
      case "monday":
        return "Mon";
      case "tuesday":
        return "Tue";
      case "wednesday":
        return "Wed";
      case "thursday":
        return "Thu";
      case "friday":
        return "Fri";
      case "saturday":
        return "Sat";
      case "sunday":
        return "Sun";
      default:
        return "All";
    }
  });
};

export const getAvailabilityText = (when: string, customDays: string[]) => {
  switch (when?.toLowerCase()) {
    case "custom":
      return getCustomDays(customDays);
    case "allthetime":
      return ["All Days"];
    case "weekdays":
      return ["Week Days"];
    case "weekends":
      return ["Week Ends"];
    default:
      return ["All Days"];
  }
};

export type PageStates = "INVOICE" | "MODE" | "ONLINE" | "OFFLINE";

export const calculateDiscount = (coupon, billValue, claimedCoinz) => {
  let discountValue = 0;

  if (
    coupon?.config?.discountType?.toLowerCase() === "percentage" &&
    coupon?.config?.upto
  ) {
    discountValue = Math.round((coupon?.config?.value / 100) * billValue);
    if (discountValue > coupon?.config?.upto) {
      discountValue = coupon?.config?.upto;
    }
  } else if (coupon?.config?.discountType?.toLowerCase() === "percentage") {
    discountValue = Math.round((coupon?.config?.value / 100) * billValue);
  } else {
    discountValue = coupon?.config?.value;
  }

  return { discountValue, resetClaimedCoinz: claimedCoinz > 0 };
};

const calculateDiscountValue = (
  billValue,
  discountValue,
  discountType,
  upto,
) => {
  let discount = 0;

  if (discountType?.toLowerCase() === "percentage") {
    discount = (billValue * discountValue) / 100;
    if (billValue === 0 && discountValue === 100) {
      // Ensuring that the discount cannot exceed the bill amount
      discount = Math.min(discountValue, billValue);
    }
  } else if (discountType?.toLowerCase() === "amount") {
    // Ensuring that the discount does not exceed the bill amount
    discount = Math.min(discountValue, billValue);
  }

  // Apply the 'upto' limit if it exists and it's a percentage discount
  if (upto !== undefined && discountType?.toLowerCase() === "percentage") {
    discount = Math.min(discount, upto);
  }
  return discount;
};

export const calculateFinalBill = (
  billValue: number,
  claimedCoinz: number,
  claimCouponz: number,
  tips: number,
): number => {
  const adjustedClaimCouponz =
    claimCouponz >= billValue ? billValue : claimCouponz;
  const finalBillValue = billValue - claimedCoinz - adjustedClaimCouponz + tips;
  return finalBillValue;
};

// Function to get the best coupon suggestion

export const getBestCouponSuggestion = (
  availedCoupon,
  missingOutCouponz,
  billValue,
) => {
  const availedDiscount = calculateDiscountValue(
    billValue,
    availedCoupon?.config?.value || 0,
    availedCoupon?.config?.discountType || "percentage",
    availedCoupon?.config?.upto,
  );
  let bestCoupon: Coupon = null;
  let bestDiscount = availedDiscount;
  let additionalAmount = Number.POSITIVE_INFINITY;

  for (const coupon of missingOutCouponz) {
    const couponBillValue = coupon?.conditions?.billValue || 0;
    let currentAdditionalAmount = 0;
    let effectiveBillValue = billValue;

    if (couponBillValue > billValue) {
      currentAdditionalAmount = couponBillValue - billValue;
      effectiveBillValue = couponBillValue;
    }

    const couponDiscount = calculateDiscountValue(
      effectiveBillValue,
      coupon?.config?.value || 0,
      coupon?.config?.discountType || "percentage",
      coupon?.config?.upto,
    );

    // Prioritize higher discounts and handle edge cases
    if (
      currentAdditionalAmount < additionalAmount ||
      (currentAdditionalAmount === additionalAmount &&
        couponDiscount > bestDiscount) ||
      (currentAdditionalAmount > 0 &&
        additionalAmount > 0 &&
        couponDiscount - currentAdditionalAmount >
          bestDiscount - additionalAmount)
    ) {
      bestCoupon = coupon;
      bestDiscount = couponDiscount;
      additionalAmount = currentAdditionalAmount;
    } else {
      bestCoupon = 0;
      bestDiscount = 0;
      additionalAmount = 0;
    }
  }

  return { bestCoupon, bestDiscount, additionalAmount };
};
