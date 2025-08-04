import { memo, useState } from "react";
import {
  Building2,
  Users,
  MoreVertical,
  Edit,
  Download,
  Bed,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IHotelRoom } from "@/hooks/hotel/useRoomHook";

interface RoomCardProps {
  room: IHotelRoom;
  onEdit: (roomId: string) => void;
  floorName: string;
  staffNames: string[];
  downloadSingleQRCode: (
    e: React.MouseEvent<HTMLButtonElement>,
    roomId: string,
  ) => void;
}

function getRoomStatusColor(status: string) {
  const statusColors: Record<
    string,
    { color: string; bgColor: string; textColor: string }
  > = {
    AVAILABLE: {
      color: "#10b981",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    BOOKED: {
      color: "#3b82f6",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    OCCUPIED: {
      color: "#ef4444",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
    },
    MAINTENANCE: {
      color: "#f59e0b",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
    },
    CLEANING: {
      color: "#06b6d4",
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-800",
    },
    RESERVED: {
      color: "#8b5cf6",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    },
    BLOCKED: {
      color: "#6b7280",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
  };
  return (
    statusColors[status] || {
      color: "#6b7280",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    }
  );
}

export const RoomCard = memo(
  ({
    room,
    onEdit,
    floorName,
    staffNames,
    downloadSingleQRCode,
  }: RoomCardProps) => {
    const [showAllStaff, setShowAllStaff] = useState(false);
    const maxVisible = 3;
    const hasOverflow = staffNames.length > maxVisible;
    const visibleStaff = showAllStaff
      ? staffNames
      : staffNames.slice(0, maxVisible);

    return (
      <Card
        className="relative flex flex-col justify-between h-full overflow-hidden transition-all duration-200 border-l-4 hover:shadow-md"
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3 flex-1 overflow-auto">
          <div className="flex flex-col space-y-3">
            {/* Floor */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{floorName}</span>
            </div>

            {/* Staff */}
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                {staffNames.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {visibleStaff.map((name, index) => (
                        <Badge
                          key={index?.toString()}
                          variant="outline"
                          className="text-xs"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                    {hasOverflow && (
                      <button
                        type="button"
                        onClick={() => setShowAllStaff((prev) => !prev)}
                        className="mt-1 text-xs text-blue-600 hover:underline focus:outline-none"
                      >
                        {showAllStaff
                          ? "Show less"
                          : `+${staffNames.length - maxVisible} more`}
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No staff assigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <Badge
              variant="outline"
              className={`${getRoomStatusColor(room.roomStatus).bgColor} ${
                getRoomStatusColor(room.roomStatus).textColor
              }`}
            >
              {room.roomStatus.replace(/_/g, " ")}
            </Badge>
            <Badge
              variant={room.availability ? "default" : "secondary"}
              className="ml-auto"
            >
              {room.availability ? "Available" : "Unavailable"}
            </Badge>
          </div>
        </CardFooter>

        {room.downLoadLink && (
          <div className="sticky bottom-0 z-10 bg-white border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => downloadSingleQRCode(e, room._id)}
              className="flex items-center w-full gap-1 rounded-none"
            >
              <Download className="w-4 h-4" />
              QR Code
            </Button>
          </div>
        )}
      </Card>
    );
  },
);

interface EmptyStateProps {
  onAddRoom: () => void;
}

export const EmptyState = memo(({ onAddRoom }: EmptyStateProps) => (
  <Card className="p-8 mt-8 text-center">
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="p-4 rounded-full shadow-lg bg-gradient-to-br from-gray-400 to-gray-600">
        <Bed className="w-10 h-10 text-white drop-shadow-md" />
      </div>
      <h3 className="text-lg font-medium">No Rooms Added Yet</h3>
      <p className="text-sm text-muted-foreground">
        Add rooms to your hotel to start managing them
      </p>
      <Button onClick={onAddRoom} className="mt-2">
        <Plus className="w-4 h-4 mr-2" />
        Add First Room
      </Button>
    </div>
  </Card>
));
