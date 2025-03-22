import { memo } from "react"
import { Bed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook"
import type { IRoomType } from "@/hooks/hotel/useRoomTypeHook"
import { RoomCard } from "./RoomComponants"

interface RoomTypeSectionProps {
  roomType: IRoomType
  rooms: IHotelRoom[]
  onEditRoom: (roomId: string) => void
  getFloorName: (floorId: string) => string
  getStaffNames: (staffIds: string[]) => string[]
}

const RoomTypeSection = ({ roomType, rooms, onEditRoom, getFloorName, getStaffNames }: RoomTypeSectionProps) => {
  if (rooms.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Bed className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{roomType.roomType.replace(/_/g, " ")}</h2>
        <Badge variant="outline" className="ml-2">
          {rooms.length} {rooms.length === 1 ? "Room" : "Rooms"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            room={room}
            onEdit={onEditRoom}
            floorName={getFloorName(room.zoneId)}
            staffNames={getStaffNames(room.staffIds || [])}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(RoomTypeSection)

