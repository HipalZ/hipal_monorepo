"use client"

import { CardContent } from "@/components/ui/card"
import { Maximize2, Tag, Users, ChevronDown, ChevronUp, Bed } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RoomType {
  _id: string
  roomType: string
  availability: boolean
  amenities: string[]
  images: string[]
  businessId: string
  description: string
  roomIds: string[]
  pricePerNight: number
  size: string
  capacity: number
  typeOfBed?: string
}

interface RoomTypeContentProps {
  roomType: RoomType
  isExpanded: boolean
  toggleExpand: () => void
}

const RoomTypeContent = ({ roomType, isExpanded, toggleExpand }: RoomTypeContentProps) => {
  return (
    <CardContent className="p-4 pt-2 flex-grow !text-black">
      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Left column items */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-start">
          <Users className="w-5 h-5" />
          <span>
            {roomType.capacity} {roomType.capacity === 1 ? "Guest" : "Guests"}
          </span>
        </div>

        {/* Right column items - pushed to the right */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-end">
          <Maximize2 className="w-5 h-5" />
          <span>{roomType.size || "110"} sqft</span>
        </div>

        {/* Full width item - split into two columns */}
        <div className="flex items-center justify-between col-span-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Tag className="w-5 h-5" />
            <span>{roomType.roomType.replace(/_/g, " ")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Bed className="w-5 h-5" />
            <span>
              {roomType.roomIds.length} {roomType.roomIds.length === 1 ? "Room" : "Rooms"}
            </span>
          </div>
        </div>

        {/* Bed type if available */}
        {roomType.typeOfBed && (
          <div className="col-span-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Bed className="w-5 h-5" />
            <span>Bed: {roomType.typeOfBed}</span>
          </div>
        )}
      </div>

      {roomType.description && (
        <p className={`mt-3 text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}>
          {roomType.description}
        </p>
      )}

      {/* Expand/collapse button */}
      {roomType.description && roomType.description.length > 100 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            toggleExpand()
          }}
          className="h-auto p-0 mt-1 text-primary hover:text-primary/80 hover:bg-transparent"
        >
          {isExpanded ? (
            <span className="flex items-center text-xs">
              Show less <ChevronUp className="w-3 h-3 ml-1" />
            </span>
          ) : (
            <span className="flex items-center text-xs">
              Show more <ChevronDown className="w-3 h-3 ml-1" />
            </span>
          )}
        </Button>
      )}

      <div className="mt-4">
        <p className="text-lg font-semibold">
          ₹{roomType.pricePerNight.toLocaleString()}{" "}
          <span className="text-sm font-normal text-muted-foreground">/ night</span>
        </p>
      </div>
    </CardContent>
  )
}

export default RoomTypeContent

