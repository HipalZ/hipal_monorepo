import type { Room } from '@/components/types/hotelTypes'
import { CardContent } from '@/components/ui/card'
import { Maximize2, Tag, Users } from 'lucide-react'
import React from 'react'

const BookRoomsContent = ({room}:{room:Room}) => {
    return (
        <CardContent className="p-4 pt-2 flex-grow !text-black">
            <div className="grid grid-cols-2 gap-4 mt-2">
                {/* Left column items */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-start">
                    <Users className="h-5 w-5" />
                    <span>
                        {room.capacity} {room.capacity === 1 ? "Guest" : "Guests"}
                    </span>
                </div>

                {/* Right column items - pushed to the right */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground justify-end">
                    <Maximize2 className="h-5 w-5" />
                    <span>{room.size || '110'} sft</span>
                </div>

                {/* Full width item - split into two columns */}
                <div className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Tag className="h-5 w-5" />
                        <span>{room.roomType}</span>
                    </div>
                    {/* Add an empty div to maintain the layout or add additional info */}
                    <div />
                </div>
            </div>

            {room.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{room.description}</p>}

            <div className="mt-4">
                <p className="font-semibold text-lg">
                    ₹{room.pricePerNight.toLocaleString()}{" "}
                    <span className="text-sm font-normal text-muted-foreground">/ night</span>
                </p>
            </div>
        </CardContent>
    )
}

export default BookRoomsContent