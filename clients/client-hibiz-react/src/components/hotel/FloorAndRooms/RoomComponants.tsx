import { memo } from "react"
import { Building2, Users, MoreVertical, Edit, Trash2, Bed, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook"

interface RoomCardProps {
  room: IHotelRoom
  onEdit: (roomId: string) => void
  floorName: string
  staffNames: string[]
}

// Get room status color
function getRoomStatusColor(status: string) {
  const statusColors: Record<string, { color: string; bgColor: string; textColor: string }> = {
    AVAILABLE: { color: "#10b981", bgColor: "bg-green-100", textColor: "text-green-800" },
    BOOKED: { color: "#3b82f6", bgColor: "bg-blue-100", textColor: "text-blue-800" },
    OCCUPIED: { color: "#ef4444", bgColor: "bg-red-100", textColor: "text-red-800" },
    MAINTENANCE: { color: "#f59e0b", bgColor: "bg-amber-100", textColor: "text-amber-800" },
    CLEANING: { color: "#06b6d4", bgColor: "bg-cyan-100", textColor: "text-cyan-800" },
    RESERVED: { color: "#8b5cf6", bgColor: "bg-purple-100", textColor: "text-purple-800" },
    BLOCKED: { color: "#6b7280", bgColor: "bg-gray-100", textColor: "text-gray-800" },
  }
  return statusColors[status] || { color: "#6b7280", bgColor: "bg-gray-100", textColor: "text-gray-800" }
}

export const RoomCard = memo(({ room, onEdit, floorName, staffNames }: RoomCardProps) => {
  const handleDelete = () => {
    toast.error("Delete functionality not implemented yet")
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-200 border-l-4 hover:shadow-md"
      style={{ borderLeftColor: getRoomStatusColor(room.roomStatus).color }}
    >
      <CardHeader className="pt-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(room._id)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Room
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete()} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-col space-y-3">
          {/* Floor information */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{floorName}</span>
          </div>

          {/* Staff information */}
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              {staffNames.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {staffNames.map((name, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No staff assigned</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-3 bg-muted/20">
        <div className="flex items-center justify-between w-full">
          <Badge
            variant="outline"
            className={`${getRoomStatusColor(room.roomStatus).bgColor} ${getRoomStatusColor(room.roomStatus).textColor}`}
          >
            {room.roomStatus.replace(/_/g, " ")}
          </Badge>

          <Badge variant={room.availability ? "default" : "secondary"} className="ml-auto">
            {room.availability ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  )
})



interface EmptyStateProps {
  onAddRoom: () => void
}

export const EmptyState = memo(({ onAddRoom }: EmptyStateProps) => (
  <Card className="p-8 mt-8 text-center">
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-gray-600">
        <Bed className="w-10 h-10 text-white drop-shadow-md" />
      </div>
      <h3 className="text-lg font-medium">No Rooms Added Yet</h3>
      <p className="text-sm text-muted-foreground">Add rooms to your hotel to start managing them</p>
      <Button onClick={onAddRoom} className="mt-2">
        <Plus className="w-4 h-4 mr-2" />
        Add First Room
      </Button>
    </div>
  </Card>
))


