import { toast } from "react-hot-toast";
import type { User } from "../store/useOwnerLogin";
import CouponsImage from "@/assets/services/coupons.png";
import HibizImage from "@/assets/services/hibiz.png";
import BillsImage from "@/assets/services/bills.png";
import HiPeopleImage from "@/assets/services/hi ppl.png";
import LoyaltyImage from "@/assets/services/loyalty.png";
import MenuImage from "@/assets/services/menu.png";
import StaffImage from "@/assets/services/staff.png";
import Review from "@/assets/services/review.png";
import Themes from "@/assets/services/themes.png";
import Settings from "@/assets/services/setting.png";
export interface ICardButton {
  Icon: React.ElementType;
  text: string;
  class: {
    background: string;
    text: string;
    font: string;
    bg: string;
    color: string;
    opacity?: string;
  };
  visible: boolean;
}

export interface ILiteVersionCardButton {
  image: string;
  text: string;
  description: string;
  navigateTo?: string;
}

export const liteVersionCardButtons: ILiteVersionCardButton[] = [
  {
    image: Themes,
    text: "Themes ",
    description: "Make your app look good",
    navigateTo: "businessControl",
  },
  {
    image: BillsImage,
    text: "Payments",
    description: "All payment related stuff",
    navigateTo: "payments",
  },
  {
    image: StaffImage,
    text: "Staff",
    description: "Create your Team",
    navigateTo: "staff",
  },
  {
    image: HibizImage,
    text: "Hi site",
    description: "Make your website more beautiful",
    navigateTo: "hiSite",
  },
  {
    image: Settings,
    text: "Settings",
    description: "All settings in one place",
    navigateTo: "settings",
  },
  {
    image: MenuImage,
    text: "Menu",
    description: "Manage your menu",
    navigateTo: "menu",
  },
  {
    image: HiPeopleImage,
    text: "Hi People",
    description: "Manage your PplZ Data",
    navigateTo: "people",
  },
  {
    image: LoyaltyImage,
    text: "Loyalty",
    description: "Manage your Loyalty",
    navigateTo: "loyalty",
  },
  {
    image: CouponsImage,
    text: "Coupons",
    description: "Manage your coupons",
    navigateTo: "coupons",
  },
  // {
  //   image: Review,
  //   text: "Reviews",
  //   description: "Manage your reviews",
  //   navigateTo: "reviews",
  // },
  // {
  //   image: HiPeopleImage,
  //   text: "WhatsApp",
  //   description: "Manage your WhatsApp",
  //   navigateTo: "whatsapp",
  // },
];
export interface AccessControlMapping {
  [key: string]: string;
}
export const accessControlMapping: AccessControlMapping = {
  dish: "Items",
  staff: "Staff",
  loyalty: "Loyalty",
  sale: "Sales",
  reports: "Reports",
  zones_tables: "Zones And Tables",
};

export const getUpdatedCardButtons = (
  cards: ICardButton[],
  user: User,
  handleNoAccess: () => void,
) => {
  if (user.role !== "RESTAURANT_MANAGER") {
    return cards.map((card: ICardButton) => ({ ...card }));
  }

  if (
    user.accessControl === undefined ||
    Object.keys(user.accessControl).length === 0
  ) {
    toast.error("You do not have access to this business");
    localStorage.removeItem("ownerLogin");
    handleNoAccess();
    return [];
  }

  return cards.map((card: ICardButton) => {
    const hasAccess =
      user.accessControl &&
      Object.entries(user.accessControl).some(([key, value]) => {
        const permissionName = accessControlMapping[key];
        return permissionName === card.text && value;
      });
    return {
      ...card,
      visible: hasAccess,
    };
  });
};
