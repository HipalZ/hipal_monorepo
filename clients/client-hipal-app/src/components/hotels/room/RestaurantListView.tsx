"use client"

import { RestaurantCard } from "./RestaurantCard"
import { RestaurantCardSkeleton } from "./RestaurantCardSkeleton"

interface ILinkHotels {
  _id: string
  name: string
  customLink: string
  logo: string
}

interface RestaurantListViewProps {
  restaurants: ILinkHotels[] | undefined
  selectedRestaurant: ILinkHotels | null
  onSelectRestaurant: (restaurant: ILinkHotels) => void
  isLoading: boolean
}

export const RestaurantListView = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  isLoading,
}: RestaurantListViewProps) => {
  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-bold text-h-primary">Select a Restaurant</h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : restaurants && restaurants.length > 0 ? (
        <div className="mb-20 space-y-3">
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
        <div className="py-8 text-center text-gray-500">No restaurants available at the moment</div>
      )}
    </div>
  )
}

