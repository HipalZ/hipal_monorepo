import { useHotelTemp } from '@/components/store/useHotelTemp';
import type { Room } from "@/components/types/hotelTypes";
import Image from 'next/image';
import { useImageNextPrev } from '@/components/utils/helpersHotel';
import { useSwipe } from '@/components/utils/useSwipe';

const BookRoomImages = ({ room, imageUrl }: { room: Room, imageUrl: string }) => {
    const { imageIndices, updateImageIndex } = useHotelTemp();
    const { handleImageClick, nextImage, prevImage } = useImageNextPrev();
    const currentIndex = imageIndices[room._id] ?? 0;
    const swipeHandlers = useSwipe({
        onSwipeLeft: () => nextImage(room._id, room.images.length),
        onSwipeRight: () => prevImage(room._id, room.images.length),
        threshold: 30,
    })
    return (
        <section
            className="p-3 relative h-[17.5rem] w-full cursor-pointer overflow-hidden group"
            onClick={(e) => handleImageClick(e, room._id, room.images.length)}
            onTouchStart={swipeHandlers.onTouchStart}
            onTouchMove={swipeHandlers.onTouchMove}
            onTouchEnd={swipeHandlers.onTouchEnd}
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