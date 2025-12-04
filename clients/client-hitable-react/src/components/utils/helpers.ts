import { type ClassValue, clsx } from "clsx";
import toast from "react-hot-toast";
import type { IconType } from "react-icons";
import { BsGraphUpArrow } from "react-icons/bs";
import { CiGlobe } from "react-icons/ci";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { MdOutlineHistory, MdOutlineTableBar } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { useHiClientZ } from "../store/useHiClientzData";
import type { NavItemTypes } from "../types/hiClientzData";
import { useStaffPermissionStore } from "@/components/store/usePermissions";

export function timestampToDateTime(timestamp: number): string {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const date = new Date(timestamp + IST_OFFSET);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const day = date.getUTCDate();
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
  const month = monthNames[date.getUTCMonth()];

  // Determine the day suffix
  let daySuffix: string;
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

//apply cn
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getDate = (timeStampStart: number) => {
  const date = new Date(timeStampStart);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const useErrorHandling = () => {
  const navigate = useNavigate();

  const errorText = () => {
    let message = "";
    navigate("/");
    message = "Session Expired: Please log in again to continue.";
    toast.error(message);
    return message;
  };

  return { errorText };
};

export function createNavItems(
  isPos: boolean,
  canViewSales: boolean,
): Array<{
  type: NavItemTypes;
  icon: IconType;
}> {
  let navItems: Array<{ type: NavItemTypes; icon: IconType }> = [
    { type: "Cart" as NavItemTypes, icon: HiOutlineShoppingCart },
    { type: "Alerts" as NavItemTypes, icon: CiGlobe },
    { type: "Sales" as NavItemTypes, icon: BsGraphUpArrow },
    { type: "History" as NavItemTypes, icon: MdOutlineHistory },
  ];

  // Remove Sales if no permission
  if (!canViewSales) {
    navItems = navItems.filter((item) => item.type !== "Sales");
  }

  // Add Tables at the beginning for POS
  if (isPos) {
    navItems.unshift({
      type: "Tables" as NavItemTypes,
      icon: MdOutlineTableBar,
    });
  }

  return navItems;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export type FOOD_TYPES =
  | "VEG"
  | "NON_VEG"
  | "EGG"
  | "VEGAN"
  | "ALCOHOL"
  | "NON_ALCOHOL"
  | "GLUTEN_FREE"
  | "MIX";

// --- 2) Normalizers
const FOOD_CANON_MAP: Record<string, FOOD_TYPES> = {
  VEG: "VEG",
  NON_VEG: "NON_VEG",
  NONVEG: "NON_VEG",
  "NON VEG": "NON_VEG",

  EGG: "EGG",
  VEGAN: "VEGAN",

  ALCOHOL: "ALCOHOL",
  NON_ALCOHOL: "NON_ALCOHOL",
  NONALCOHOL: "NON_ALCOHOL",
  "NON ALCOHOL": "NON_ALCOHOL",

  GLUTEN_FREE: "GLUTEN_FREE",
  GLUTENFREE: "GLUTEN_FREE",
  "GLUTEN FREE": "GLUTEN_FREE",

  MIX: "MIX",
};

export function normalizeFoodType(raw: string): FOOD_TYPES | null {
  const key = raw.replace(/[\s-]+/g, "_").toUpperCase(); // "non veg" -> "NON_VEG"
  return (
    FOOD_CANON_MAP[key] ??
    FOOD_CANON_MAP[key.replace(/_/g, "")] ?? // also try compact: "NONVEG"
    null
  );
}

export function normalizeFoodTypes(raw?: string[] | null): FOOD_TYPES[] {
  if (!raw?.length) return [];
  const out = new Set<FOOD_TYPES>();
  for (const r of raw) {
    const n = normalizeFoodType(r);
    if (n) out.add(n);
  }
  return Array.from(out);
}

export function gradientForFood(types: FOOD_TYPES[]): string {
  const has = (t: FOOD_TYPES) => types.includes(t);

  if (has("VEG"))
    return "bg-gradient-to-r from-green-50 via-white to-green-100";
  if (has("NON_VEG"))
    return "bg-gradient-to-r from-red-50 via-white to-red-100";
  if (has("EGG"))
    return "bg-gradient-to-r from-yellow-50 via-white to-yellow-100";
  if (has("VEGAN"))
    return "bg-gradient-to-r from-green-50 via-white to-green-100";
  if (has("GLUTEN_FREE"))
    return "bg-gradient-to-r from-blue-50 via-white to-blue-100";
  if (has("ALCOHOL"))
    return "bg-gradient-to-r from-gray-50 via-white to-gray-100";
  if (has("NON_ALCOHOL"))
    return "bg-gradient-to-r from-gray-50 via-white to-gray-100";
  if (has("MIX"))
    return "bg-gradient-to-r from-indigo-50 via-white to-indigo-100";

  return "bg-gradient-to-r from-white via-white to-purple-50"; // default
}

export function formatDateToIST(date: number): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-GB", opts);
  const parts = formatter.formatToParts(new Date(date));

  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  return `${day}-${month}-${year} ${hour}:${minute}`;
}
