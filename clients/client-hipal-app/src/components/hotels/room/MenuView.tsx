"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useGetAllRestaurantMenu } from "@/components/hooks/useGetAllRestaurantMenu";
import DishesList from "@/components/organisms/category/dishesList";
import MenuBannerPage from "@/components/organisms/menuBanner";
import LiveCartHotel from "./LiveCartForRestaurant";
import type { IMenuLayout, TimingType } from "@/components/types/businessData";
import { useSearch } from "@/components/store/useSearch";
import { useActiveClass } from "@/components/store/useActiveClass";
import { Skeleton } from "@/components/ui/skeleton";

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
  onMenuLoadingChange?: (isLoading: boolean) => void;
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

export const MenuView = ({
  restaurant,
  onBack,
  isLoading,
  onMenuLoadingChange,
}: MenuViewProps) => {
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

  useEffect(() => {
    onMenuLoadingChange?.(isLoading || menuLoading);
  }, [isLoading, menuLoading, onMenuLoadingChange]);

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
        <section className="space-y-4 px-1 pb-24">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="flex gap-2 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <Skeleton
                key={index}
                className="h-9 min-w-[86px] rounded-full"
              />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/3 rounded-full" />
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-2/3 rounded-full" />
                </div>
                <Skeleton className="h-24 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </section>
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
