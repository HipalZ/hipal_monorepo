"use client";

import { ArrowLeft } from "lucide-react";
import { MenuItemSkeleton } from "./MenuItemSkeleton";
import { useGetAllRestaurantMenu } from "@/components/hooks/useGetAllRestaurantMenu";
import DishesList from "@/components/organisms/category/dishesList";
import MenuBannerPage from "@/components/organisms/menuBanner";
import LiveCartHotel from "./LiveCartForRestaurant";
import type { IMenuLayout } from "@/components/types/businessData";
import { useSearch } from "@/components/store/useSearch";

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
  menuId: IMenuLayout;
}

export const MenuView = ({ restaurant, onBack, isLoading }: MenuViewProps) => {
  const { menuLoading, menuData } = useGetAllRestaurantMenu(
    restaurant._id as string,
  );
  const { setIsSearchActive, setSearchText } = useSearch();

  const handleBack = () => {
    setSearchText("");
    setIsSearchActive(false);
    onBack();
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
            timings={menuData?.timings}
            childCategory={menuData?.childCategories || []}
          />
          <DishesList
            parentCategory={menuData?.parentCategories || []}
            childCategory={menuData?.childCategories || []}
            timings={menuData?.timings}
            menuLayout={menuData?.menuData}
          />
          <LiveCartHotel />
        </>
      )}
    </div>
  );
};
