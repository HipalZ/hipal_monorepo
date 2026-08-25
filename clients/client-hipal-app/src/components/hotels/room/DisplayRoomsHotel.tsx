"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useShareRoom } from "@/components/utils/helpersHotel";
import RoomTypeContent from "./BookRoomsContent";
import RoomTypeImages from "./BookRoomImages";

// Define the RoomType interface based on the provided data structure
interface RoomType {
  _id: string;
  roomType: string;
  availability: boolean;
  amenities: string[];
  images: string[];
  businessId: string;
  description: string;
  roomIds: string[];
  pricePerNight: number;
  size: string;
  capacity: number;
  typeOfBed?: string;
}

export function DisplayRoomTypes({
  roomTypes,
  imageUrl,
}: { roomTypes: RoomType[]; imageUrl: string }) {
  const { shareCart } = useShareRoom();
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const handleBookNow = (roomType: RoomType) => {
    const roomDetails = `
Room Type: ${roomType.roomType}
Price: ₹${roomType.pricePerNight.toLocaleString()} per night
Capacity: ${roomType.capacity} ${roomType.capacity === 1 ? "Guest" : "Guests"}
Size: ${roomType.size || "110"} sqft
${roomType.typeOfBed ? `Bed Type: ${roomType.typeOfBed}` : ""}
${roomType.description ? `Description: ${roomType.description}` : ""}
Available Rooms: ${roomType.roomIds.length}
    `.trim();

    shareCart(roomDetails);
  };

  const toggleExpand = (typeId: string) => {
    setExpandedType(expandedType === typeId ? null : typeId);
  };

  // Sort room types by price (lowest first)
  const sortedRoomTypes = [...roomTypes].sort(
    (a, b) => a.pricePerNight - b.pricePerNight,
  );

  return (
    <section className="plus-jakarta-font pb-[5rem]">
      {sortedRoomTypes.length === 0 ? (
        <div className="p-8 mt-4 text-center">
          <p className="text-muted-foreground">
            No room types available at the moment.
          </p>
        </div>
      ) : (
        sortedRoomTypes.map((roomType) => {
          const isExpanded = expandedType === roomType._id;

          return (
            <Card
              key={roomType._id}
              className="flex flex-col h-full m-4 overflow-hidden"
            >
              <RoomTypeImages
                images={
                  roomType.images.length > 0 ? roomType.images : [imageUrl]
                }
                roomType={roomType.roomType}
                roomCount={roomType.roomIds.length}
              />
              <CardHeader className="p-4 pb-2 !text-black">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold line-clamp-1">
                    {roomType.roomType.replace(/_/g, " ")}{" "}
                    {roomType.roomIds.length > 1 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({roomType.roomIds.length} rooms)
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 font-bold text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-bold text-black">
                      {(4.5).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <RoomTypeContent
                roomType={roomType}
                isExpanded={isExpanded}
                toggleExpand={() => toggleExpand(roomType._id)}
              />

              <CardFooter className="p-4 pt-0 mt-auto">
                <Button
                  type="button"
                  onClick={() => handleBookNow(roomType)}
                  className="w-full bg-primary text-secondary"
                  size="lg"
                  style={{
                    color: "var(--s)",
                  }}
                  disabled={!roomType.availability}
                >
                  {roomType.availability ? "Book now" : "Not Available"}
                </Button>
              </CardFooter>
            </Card>
          );
        })
      )}
    </section>
  );
}
