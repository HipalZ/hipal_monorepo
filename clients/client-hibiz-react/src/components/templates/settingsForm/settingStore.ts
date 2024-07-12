import type { SettingPageTypes } from "@/components/store/useSettings";
import { AiFillShop } from "react-icons/ai";
import { GiShoppingBag } from "react-icons/gi";

export const settingServices = [
  {
    _id: 1,
    title: "Outlet Setting",
    description: "Bill timings , Accept orders timing & more ",
    icon: GiShoppingBag,
    navigateTo: "OUTLET_FORM" as SettingPageTypes,
  },
  {
    _id: 2,
    title: "Business Setting",
    description: "Banking details, Official details ",
    icon: AiFillShop,
    navigateTo: "BUSINESS_FORM" as SettingPageTypes,
  },
];
