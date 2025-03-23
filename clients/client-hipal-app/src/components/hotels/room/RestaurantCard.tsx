"use client"

import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import chefServe from "@/assets/hotel/chefServe.jpg"
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
      className={`overflow-hidden transition-all cursor-pointer shadow-xl ${
        isSelected ? "border-h-primary" : "border-transparent"
      } rounded-xl`}
      onClick={() => onSelect(restaurant)}
    >
      {/* Image Section */}
      <div className="relative w-full h-36 overflow-hidden bg-gray-100">
        <Image
          src={chefServe || ""}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-4 flex justify-between">
        <div>
          <h3 className="font-medium text-lg text-gray-900">{restaurant.name}</h3>
          <span className="text-gray-600">#Restaurant</span>
        </div>
          <ArrowRight className="text-gray-900 h-5 w-5 mt-1" />
      </div>

      {/* Selected Indicator */}
      {isSelected && <div className="absolute inset-0 border-2 border-h-primary rounded-xl pointer-events-none" />}
    </Card>
  )
}

