import { useHotelTemp } from '@/components/store/useHotelTemp';
import React from 'react'
import type { Room } from "@/components/types/hotelTypes";
import Image from 'next/image';
import { useImageNextPrev } from '@/components/utils/helpersHotel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BookRoomImages = ({ room, imageUrl }: { room: Room, imageUrl: string }) => {
    const { imageIndices, updateImageIndex } = useHotelTemp();
    const { handleImageClick, nextImage, prevImage } = useImageNextPrev();
    const currentIndex = imageIndices[room._id] ?? 0;
    return (
        <section
            className="p-3 relative h-[17.5rem] w-full cursor-pointer overflow-hidden group"
            onClick={(e) => handleImageClick(e, room._id, room.images.length)}
            onKeyDown={(e) => handleImageClick(e, room._id, room.images.length)}
        >
            {/* Create a container for each image with absolute positioning and zoom effect */}
            {room.images.map((image, index) => (
                <div
                    key={index?.toString()}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentIndex
                        ? 'opacity-100 z-10 scale-100'
                        : 'opacity-0 z-0 scale-110'
                        }`}
                >
                    <Image
                        src={image || imageUrl}
                        alt={`${room.name} - image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            ))}
            {/* Navigation arrows with improved z-index */}
            {room.images.length > 1 && (
                <>
                    <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent image click event
                                prevImage(e, room._id, room.images.length);
                            }}
                            className="bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors shadow-md"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent image click event
                                nextImage(e, room._id, room.images.length);
                            }}
                            type="button"
                            className="bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors shadow-md"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </div>
                </>
            )}

            {/* Image counter */}
            {room.images.length > 1 && (
                <div className="absolute bottom-5 right-5 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full z-20 transition-all duration-300 opacity-80 group-hover:opacity-100 shadow-sm">
                    <span className="font-medium">
                        {currentIndex + 1}/{room.images.length}
                    </span>
                </div>
            )}
            {/* Dots indicator */}
            {room.images.length > 1 && (
                <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {room.images.map((_, index) => (
                        <button
                            type="button"
                            key={index?.toString()}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateImageIndex(room._id, index);
                            }}
                            className={`h-2.5 w-2.5 rounded-full transition-colors ${index === currentIndex
                                    ? "bg-white shadow-sm"
                                    : "bg-white/50 hover:bg-white/80"
                                }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

export default BookRoomImages