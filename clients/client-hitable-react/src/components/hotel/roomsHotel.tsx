import { BedDouble, BedSingle, Users, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button"
import { cn } from "../utils/helpers";
import { Input } from "@/components/ui/input"
import { memo, useCallback, useMemo, useState } from "react";
import { useGetAllRooms } from "@/hooks/useHotelApis"
import { useHotelStore } from "../store/useHotelStore";
import LoadingSpinner from "../atoms/loadingSpinner";
import type { RoomData } from "../types/hotelData"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAlertsColors } from "../utils/helpersHotel";

function MemoRoomsHotel() {
    const { allRooms, isLoading } = useGetAllRooms()
    const { setRoomData, setOpenRoomModal } = useHotelStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilters, setStatusFilters] = useState<string[]>([])
    const { getStatusStyles } = useAlertsColors()

    const handleRoom = useCallback((room: RoomData) => {
        setRoomData(room)
        setOpenRoomModal(true)
    }, [setRoomData, setOpenRoomModal])

    const toggleStatusFilter = useCallback((status: string) => {
        setStatusFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
    }, [])

    const clearFilters = useCallback(() => {
        setSearchQuery("")
        setStatusFilters([])
    }, [])

    const filteredRooms = useMemo(() => {
        return allRooms?.filter((room) => {
            const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilters.length === 0 || statusFilters.includes(room.roomStatus)

            return matchesSearch && matchesStatus
        })
    }, [allRooms, searchQuery, statusFilters])

    const statusOptions = ["AVAILABLE", "OCCUPIED", "BOOKED", "MAINTENANCE"]

    if (isLoading) return <LoadingSpinner />

    return (
        <div className="mx-auto py-6 px-4 min-h-screen hide-scrollbar">
            {/* Search and Filter UI */}
            <div className="mb-6 bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Rooms
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search room, service..."
                                className="pl-9 border-blue-200 focus-visible:ring-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="border-gray-200 bg-gray-50">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Status
                                        {statusFilters.length > 0 && (
                                            <span className="ml-1 w-5 h-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                                                {statusFilters.length}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {statusOptions?.map((status) => {
                                        const styles = getStatusStyles(status)
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={status}
                                                checked={statusFilters.includes(status)}
                                                onCheckedChange={() => toggleStatusFilter(status)}
                                            >
                                                <div className="flex items-center">
                                                    <div className={cn("w-2 h-2 rounded-full mr-2", styles.dot)} />
                                                    <span className="capitalize">{status.toLowerCase()}</span>
                                                </div>
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {(searchQuery || statusFilters?.length > 0) && (
                                <Button variant="ghost" onClick={clearFilters} className="text-black bg-gray-200 hover:text-gray-700">
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Results count */}
                <h1 className="mt-4 text-sm text-black">
                    {filteredRooms?.length} {filteredRooms.length === 1 ? "room" : "rooms"} found
                </h1>
                {/* Active filters display */}
                {statusFilters?.length > 0 && (
                    <section className="flex flex-wrap gap-2 mt-3">
                        {statusFilters?.map((status) => {
                            const styles = getStatusStyles(status)
                            return (
                                <article
                                    key={status}
                                    className={cn(
                                        "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                        styles.badge,
                                        styles.text,
                                    )}
                                >
                                    <span className="capitalize">{status.toLowerCase()}</span>
                                    <button
                                        type="button"
                                        onClick={() => toggleStatusFilter(status)}
                                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </article>
                            )
                        })}
                    </section>
                )}
            </div>


            {/* Room cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-[5rem]">
                {filteredRooms?.map((room: RoomData) => {
                    const statusStyles = getStatusStyles(room.roomStatus)
                    return (
                        <section
                            onClick={() => handleRoom(room)}
                            onKeyDown={() => handleRoom(room)}
                            key={room?._id}
                            className={cn(
                                "relative p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                                "border-l-4 border-t border-r border-b",
                                "border-t-gray-200 border-r-gray-200 border-b-gray-200",
                                statusStyles.border,
                                "overflow-hidden",
                            )}
                        >
                            {/* Subtle gradient background based on status */}
                            <article
                                className={cn(
                                    "absolute top-0 left-0 w-full h-full bg-gradient-to-br opacity-30",
                                    statusStyles.gradient,
                                )}
                            />
                            <article className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-medium text-gray-900 truncate pr-2">{room?.name}</h3>
                                    <div className={cn("w-2.5 h-2.5 rounded-full", statusStyles?.dot)} />
                                </div>
                                <article className="flex items-center justify-between">
                                    <article className="flex items-center space-x-1.5">
                                        <div className="bg-gray-100 rounded-md p-1.5 shadow-sm">
                                            {room.roomType === "SINGLE" ? (
                                                <BedSingle className="h-3.5 w-3.5 text-gray-600" />
                                            ) : (
                                                <BedDouble className="h-3.5 w-3.5 text-gray-600" />
                                            )}
                                        </div>

                                        <div className="bg-gray-100 rounded-md p-1.5 shadow-sm">
                                            <Users className="h-3.5 w-3.5 text-gray-600" />
                                            <span className="sr-only">{room?.capacity} capacity</span>
                                        </div>
                                    </article>
                                    <article
                                        className={cn(
                                            "text-xs font-medium capitalize px-2 py-1 rounded-full",
                                            "bg-gray-100 shadow-sm",
                                            statusStyles?.text,
                                        )}
                                    >
                                        {room?.roomStatus.toLowerCase()}
                                    </article>
                                </article>
                                <article className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                                    <span>{room?.roomType.charAt(0) + room?.roomType?.slice(1).toLowerCase()}</span>
                                    <span>
                                        {room?.capacity} {room.capacity === 1 ? "person" : "people"}
                                    </span>
                                </article>
                            </article>
                        </section>
                    )
                })}
            </div>

            {/* Empty state */}
            {filteredRooms?.length === 0 && (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
                    <div className="text-gray-400 mb-2">
                        <Search className="h-12 w-12 mx-auto opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium text-black mb-1">No rooms found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                    <Button onClick={clearFilters} variant="outline">
                        Clear filters
                    </Button>
                </div>
            )}
        </div>
    )
}

const RoomsHotel = memo(MemoRoomsHotel)
export default RoomsHotel