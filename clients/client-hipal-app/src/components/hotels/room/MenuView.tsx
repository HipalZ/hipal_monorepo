"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { MenuItemSkeleton } from "./MenuItemSkeleton";
import { useGetAllRestaurantMenu } from "@/components/hooks/useGetAllRestaurantMenu";
import DishesList from "@/components/organisms/category/dishesList";
import MenuBannerPage from "@/components/organisms/menuBanner";
import LiveCartHotel from "./LiveCartForRestaurant";
import type { IMenuLayout, TimingType } from "@/components/types/businessData";
import { useSearch } from "@/components/store/useSearch";
import { useActiveClass } from "@/components/store/useActiveClass";

interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}

interface MenuViewProps {
  restaurant: ILinkHotels;
  onBack: () => void;
  isLoading: boolean;
  menuId?: IMenuLayout;
}

const DEFAULT_MENU_LAYOUT: IMenuLayout = {
  _id: "",
  menuType: 2,
  categoryLayout: 2,
  cardLayout: 1,
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
};

const EMPTY_TIMINGS: TimingType = {
  _id: "",
  name: "",
  businessId: "",
  isPublished: false,
  heading: "",
  dishIds: [],
};

export const MenuView = ({ restaurant, onBack, isLoading }: MenuViewProps) => {
  const { menuLoading, menuData } = useGetAllRestaurantMenu(
    restaurant._id as string
  );
  const { setIsSearchActive, setSearchText } = useSearch();
  const {
    setActiveCategory,
    setActiveChildCategory,
    setActiveDishType,
    setActiveParentCategory,
  } = useActiveClass();

  useEffect(() => {
    setSearchText("");
    setIsSearchActive(false);
    setActiveDishType("all");
    setActiveCategory("");
    setActiveChildCategory("");
    setActiveParentCategory("");
  }, [
    restaurant._id,
    setActiveCategory,
    setActiveChildCategory,
    setActiveDishType,
    setActiveParentCategory,
    setIsSearchActive,
    setSearchText,
  ]);

  const handleBack = () => {
    setSearchText("");
    setIsSearchActive(false);
    onBack();
  };

  const restaurantMenu = menuData ?? {
    parentCategories: [],
    childCategories: [],
    timings: EMPTY_TIMINGS,
    menuData: DEFAULT_MENU_LAYOUT,
  };

  return (
    <div className="relative">
      <div className="flex items-center mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="p-1 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-h-primary" />
        </button>
        <h2 className="text-xl font-bold text-h-primary">{restaurant.name}</h2>
      </div>

      {isLoading || menuLoading ? (
        <div className="mb-20 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <MenuBannerPage
            timings={restaurantMenu.timings}
            childCategory={restaurantMenu.childCategories}
          />
          <DishesList
            parentCategory={restaurantMenu.parentCategories}
            childCategory={restaurantMenu.childCategories}
            timings={restaurantMenu.timings}
            menuLayout={restaurantMenu.menuData}
          />
          <LiveCartHotel />
        </>
      )}
    </div>
  );
};
