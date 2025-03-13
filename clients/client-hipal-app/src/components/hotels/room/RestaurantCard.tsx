"use client"

import { Card } from "@/components/ui/card"
import { Utensils } from "lucide-react"
import Image from "next/image"

interface ILinkHotels {
  _id: string
  name: string
  customLink: string
  logo: string
}

interface RestaurantCardProps {
  restaurant: ILinkHotels
  onSelect: (restaurant: ILinkHotels) => void
  isSelected: boolean
}

export const RestaurantCard = ({ restaurant, onSelect, isSelected }: RestaurantCardProps) => {
  return (
    <Card
      className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${
        isSelected ? "border-h-primary bg-h-primary/5" : ""
      }`}
      onClick={() => onSelect(restaurant)}
    >
      <div className="flex items-center gap-4 p-3">
        <div className="relative w-12 h-12 mr-3 overflow-hidden bg-gray-100 rounded-md">
          {restaurant.logo ? (
            <Image src={restaurant.logo || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-h-primary/10">
              <Utensils className="w-6 h-6 text-h-primary/60" />
            </div>
          )}
        </div>
        <h3 className="font-medium text-h-primary">{restaurant.name}</h3>
      </div>
    </Card>
  )
}

