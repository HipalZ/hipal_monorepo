"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}

interface RestaurantCardProps {
  restaurant: ILinkHotels;
  onSelect: (restaurant: ILinkHotels) => void;
  isSelected: boolean;
}

export const RestaurantCard = ({
  restaurant,
  onSelect,
  isSelected,
}: RestaurantCardProps) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all cursor-pointer border rounded-xl bg-[linear-gradient(135deg,_#F0F4FF_0%,_#FFFFFF_100%)] shadow-md hover:shadow-xl ${
        isSelected ? "ring-2 ring-h-primary" : "ring-0"
      }`}
      onClick={() => onSelect(restaurant)}
    >
      {/* Image Section */}
      <div className="relative w-full h-36 overflow-hidden rounded-t-xl">
        <Image
          src={restaurant?.logo || ""}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </div>

      {/* Content Section */}
      <div className="p-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight poppins-regular">
            {restaurant.name}
          </h3>
        </div>
        <ArrowRight className="text-gray-800 h-5 w-5" />
      </div>

      {/* Selected Overlay */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-h-primary pointer-events-none" />
      )}
    </Card>
  );
};
