"use client";
import Image from "next/image";
import { Star, Users, Maximize2, Tag, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Room } from "@/components/types/hotelTypes";

export function BookRoomsHotel({ rooms, imageUrl }: { rooms: Room[], imageUrl: string }) {
    const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

    const nextImage = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
        e.stopPropagation();
        setImageIndices((prev) => ({
            ...prev,
            [roomId]: (prev[roomId] ?? 0 + 1) % imagesLength
        }));
    };

    const prevImage = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
        e.stopPropagation();
        setImageIndices((prev) => ({
            ...prev,
            [roomId]: (prev[roomId] ?? 0) === 0 ? imagesLength - 1 : (prev[roomId] ?? 0) - 1
        }));
    };

    const handleImageClick = (e: React.MouseEvent, roomId: string, imagesLength: number) => {
        const { clientX, currentTarget } = e;
        const { left, width } = currentTarget.getBoundingClientRect();
        const clickPosition = clientX - left;

        if (clickPosition < width / 2) {
            prevImage(e, roomId, imagesLength);
        } else {
            nextImage(e, roomId, imagesLength);
        }
    };

    return (
        <>
            {rooms?.map((room) => {
                const currentIndex = imageIndices[room._id] ?? 0;

                return (
                    <Card key={room._id} className="overflow-hidden h-full flex flex-col m-4">
                        <div
                            className="p-3 relative h-[17.5rem] w-full cursor-pointer overflow-hidden group"
                            onClick={(e) => handleImageClick(e, room._id, room.images.length)}
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

                            {/* Navigation arrows */}
                            {room.images.length > 1 && (
                                <>
                                    <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={(e) => prevImage(e, room._id, room.images.length)}
                                            className="bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => nextImage(e, room._id, room.images.length)}
                                            type="button"
                                            className="bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
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
                                                e.stopPropagation(); // Stop event propagation
                                                setImageIndices((prev) => ({ ...prev, [room._id]: index }));
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
                        </div>

                        <CardHeader className="p-4 pb-2 !text-black">
                            <div className="flex items-center justify-between">
                                <h3 className="inter text-xl font-semibold line-clamp-1">{room.name}</h3>
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 font-bold" />
                                    <span className="font-bold text-lg text-black">{room.rating}</span>
                                </div>
                            </div>
                        </CardHeader>

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

                        <CardFooter className="p-4 pt-0 mt-auto">
                            <Button className="w-full bg-[#DC4C35]  text-white" size="lg">
                                Book now
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </>
    );
}
