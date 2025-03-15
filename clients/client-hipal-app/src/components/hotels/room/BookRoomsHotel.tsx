"use client";
import dynamic from 'next/dynamic';
import { Star } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Room } from "@/components/types/hotelTypes";
import { useShareRoom } from '@/components/utils/helpersHotel';
const BookRoomsContent = dynamic(() => import("./BookRoomsContent"));
const BookRoomImages = dynamic(() => import("./BookRoomImages"));

export function BookRoomsHotel({ rooms, imageUrl }: { rooms: Room[], imageUrl: string }) {
    const { shareCart } = useShareRoom();
    const handleBookNow = (room: Room) => {
        const roomDetails = `
    Room: ${room.name}
    Type: ${room.roomType}
    Price: ₹${room.pricePerNight.toLocaleString()} per night
    Capacity: ${room.capacity} ${room.capacity === 1 ? "Guest" : "Guests"}
    Size: ${room.size || "110"} sqft
    Image: ${room.images[0]}
    ${room.description ? `Description: ${room.description}` : ""}
        `.trim()
        shareCart(roomDetails)
    }
    return (
        <section className='pb-[5rem]'>
            {rooms?.map((room) => {
                return (
                    <Card key={room._id} className="overflow-hidden h-full flex flex-col m-4">
                        <BookRoomImages room={room} imageUrl={imageUrl} />
                        <CardHeader className="p-4 pb-2 !text-black">
                            <div className="flex items-center justify-between">
                                <h3 className="inter text-xl font-semibold line-clamp-1">{room.name}</h3>
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 font-bold" />
                                    <span className="font-bold text-lg text-black">{room.rating}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <BookRoomsContent room={room} />
                        <CardFooter className="p-4 pt-0 mt-auto">
                            <Button type='button' onClick={() => handleBookNow(room)} className="w-full bg-[#DC4C35]  text-white" size="lg">
                                Book now
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </section>
    );
}
