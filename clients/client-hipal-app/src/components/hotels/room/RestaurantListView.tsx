"use client";

import { RestaurantCard } from "./RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}

interface RestaurantListViewProps {
  restaurants: ILinkHotels[] | undefined;
  selectedRestaurant: ILinkHotels | null;
  onSelectRestaurant: (restaurant: ILinkHotels) => void;
  isLoading: boolean;
}

export const RestaurantListView = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  isLoading,
}: RestaurantListViewProps) => {
  return (
    <div className="plus-jakarta-font p-4">
      <h2 className="mb-4 text-xl font-semibold text-h-primary">
        Select a Restaurant
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-9">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="mt-3 h-4 w-3/4 rounded-full" />
              <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      ) : restaurants && restaurants.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-9">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              onSelect={onSelectRestaurant}
              isSelected={selectedRestaurant?._id === restaurant._id}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No restaurants available at the moment
        </div>
      )}
    </div>
  );
};
