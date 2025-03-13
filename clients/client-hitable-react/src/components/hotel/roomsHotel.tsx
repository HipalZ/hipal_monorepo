import { Card, CardContent } from "@/components/ui/card"
import { useGetAllRooms } from "@/hooks/useHotelApis"
import type { RoomData } from "../types/hotelData"
import LoadingSpinner from "../atoms/loadingSpinner";
import { BedDouble, BedSingle } from "lucide-react";
import { useCallback } from "react";
import { useHotelStore } from "../store/useHotelStore";

export default function RoomsHotel() {
    const { allRooms, isLoading } = useGetAllRooms()
    const { setRoomData, setOpenRoomModal } = useHotelStore()
    const getStatusColor = useCallback((status: string) => {
        switch (status) {
            case "AVAILABLE":
                return "bg-gradient-to-r from-green-600 to-green-800 text-white"
            case "BOOKED":
                return "bg-yellow-500 text-black"
            case "OCCUPIED":
                return "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
            case "MAINTENANCE":
                return "bg-yellow-500 text-black"
            default:
                return "bg-gray-500 text-black"
        }
    }, [])

    const handleRoom = useCallback((room: RoomData) => {
        setRoomData(room)
        setOpenRoomModal(true)
    }, [setRoomData, setOpenRoomModal])

    if (isLoading) return <LoadingSpinner />

    return (
        <div className="mx-auto py-6 px-4 bg-gray-100 min-h-screen hide-scrollbar">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 pb-[5rem]">
                {allRooms.map((room: RoomData) => (
                    <Card onClick={() => handleRoom(room)} key={room?._id} className={"relative bg-gray-50 cursor-pointer"}>
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold pl-2">{room.name}</h3>
                                <h1 className={`${getStatusColor(room.roomStatus)} p-1 text-xs rounded-md capitalize`}>{room.roomStatus}</h1>
                            </div>
                            <div className="inline-flex items-center gap-2 mt-2 text-sm text-black">
                                <span className="bg-gray-200 rounded-full p-1.5">{room.roomType === "SINGLE" ? <BedSingle /> : <BedDouble />}</span><span>{room.roomType}</span>
                            </div>
                            {room.capacity > 0 && <div className="mt-1 text-xs font-medium text-black pl-2">{room.capacity} {room.capacity === 1 ? "person" : "people"}</div>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

