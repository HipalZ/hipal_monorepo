import { type ClassValue, clsx } from "clsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { CiGlobe } from "react-icons/ci";
import { MdOutlineHistory, MdOutlineTableBar } from "react-icons/md";
import type { IconType } from "react-icons";
import type { NavItemTypes } from "../types/hiClientzData";
import { HiOutlineShoppingCart } from "react-icons/hi";
import { BsGraphUpArrow } from "react-icons/bs";

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

export function createNavItems(isPos: boolean): Array<{
  type: NavItemTypes;
  icon: IconType;
}> {
  const navItems = [
    { type: "cart" as NavItemTypes, icon: HiOutlineShoppingCart },
    { type: "payments" as NavItemTypes, icon: CiGlobe },
    { type: "sales" as NavItemTypes, icon: BsGraphUpArrow },
    { type: "history" as NavItemTypes, icon: MdOutlineHistory },
  ];

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
