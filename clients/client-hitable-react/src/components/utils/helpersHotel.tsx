import type { IconType } from "react-icons";
import { MdOutlineHistory, MdOutlineNotificationsActive } from "react-icons/md";
import { NavItemsHotelEnum, type NavItemHotelTypes } from "../types/hotelData";
import { LuHotel } from "react-icons/lu";

export function hotelNavItems(): Array<{
    type: NavItemHotelTypes;
    icon: IconType;
}> {
    const navItems = [
        { type: NavItemsHotelEnum.Rooms,icon: LuHotel },
        { type: NavItemsHotelEnum.Alerts, icon: MdOutlineNotificationsActive  },
        { type: NavItemsHotelEnum.History, icon: MdOutlineHistory },
    ];
    return navItems;
}