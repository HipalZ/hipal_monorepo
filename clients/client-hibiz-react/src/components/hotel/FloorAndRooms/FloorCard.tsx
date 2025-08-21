import { useMemo, memo, useState } from "react";
import {
  Building2,
  Bed,
  PenSquare,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRoomStore } from "@/components/store/hotel/useRoomStore.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Floor {
  _id: string;
  businessId: string;
  amenities: string[];
  availability: boolean;
  name: string;
  roomIds: string[];
  tax: number;
  __v: number;
}

interface FloorCardProps {
  floor: Floor;
  index: number;
  hoveredCard: string | null;
  setHoveredCard: (id: string | null) => void;
  onManageRooms: (floorId: string) => void;
  onEditFloor: (floorId: string) => void;
  onDeleteFloor: (floorId: string) => void;
  onToggleAvailability: (floorId: string, currentStatus: boolean) => void;
}

const FloorCard = ({
  floor,
  index,
  hoveredCard,
  setHoveredCard,
  onManageRooms,
  onEditFloor,
  onDeleteFloor,
  onToggleAvailability,
}: FloorCardProps) => {
  const roomData = useRoomStore((s) => s.roomData);
  const roomTypeData = useRoomStore((s) => s.roomType);

  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize filtered rooms based on floor's roomIds
  const filteredRooms = useMemo(() => {
    return roomData.filter((room) => floor.roomIds.includes(room._id));
  }, [roomData, floor.roomIds]);


  const roomStats = useMemo(() => {
    const availableRooms = filteredRooms.filter(
      (room) => room.roomStatus === "AVAILABLE",
    ).length; // Check room status for availability
    const occupiedRooms = filteredRooms.filter(
      (room) => room.roomStatus === "OCCUPIED",
    ).length; // Check room status for occupied status
    return {
      available: availableRooms,
      occupied: occupiedRooms,
      total: filteredRooms.length,
    };
  }, [filteredRooms]);

  const getRoomTypeName = (roomTypeId: string) => {
    const roomType = roomTypeData?.find((type) => type._id === roomTypeId);
    return roomType?.roomType || "Unknown Type";
  };
  const getRoomStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800 hover:bg-green-100",
      OCCUPIED: "bg-red-100 text-red-800 hover:bg-red-100",
      MAINTENANCE: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      CLEANING: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    };
    return (
      statusColors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
    );
  };

  const floorColor = useMemo(() => {
    const colors = [
      "from-purple-400 to-purple-600",
      "from-blue-400 to-blue-600",
      "from-amber-400 to-amber-600",
      "from-emerald-400 to-emerald-600",
      "from-rose-400 to-rose-600",
      "from-cyan-400 to-cyan-600",
    ];
    return colors[index % colors.length];
  }, [index]);

  return (
    <Card
      className="relative overflow-hidden transition-all duration-300 border-2 hover:shadow-lg"
      style={{
        borderColor:
          hoveredCard === floor._id ? "var(--primary)" : "transparent",
        transform: hoveredCard === floor._id ? "translateY(-5px)" : "none",
      }}
      onMouseEnter={() => setHoveredCard(floor._id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl ml-[4rem]">{floor.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <PenSquare className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditFloor(floor._id)}>
                <PenSquare className="w-4 h-4 mr-2" />
                Edit Floor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteFloor(floor._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Floor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div
            className={`p-4 absolute left-3 top-3 rounded-full bg-gradient-to-br ${floorColor} shadow-lg transform hover:scale-105 transition-transform`}
          >
            <Building2 className="w-6 h-6 text-white drop-shadow-md" />
          </div>

          <div className="flex items-center justify-center gap-3 mt-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1"
            >
              <Bed className="h-3.5 w-3.5" />
              {roomStats.total} Rooms
            </Badge>

            <Badge
              variant={floor.availability ? "default" : "secondary"}
              className={`px-3 py-1 ${
                floor.availability
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }`}
            >
              {floor.availability ? "Available" : "Unavailable"}
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{roomStats.available} Available</span>
            </div>
            <div className="flex items-center gap-1 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>{roomStats.occupied} Occupied</span>
            </div>
          </div>

          {filteredRooms.length > 0 && (
            <div className="w-full mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full justify-center"
              >
                <span>Room Details</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {isExpanded && (
                <div className="mt-3 grid grid-cols-2 gap-4 max-h-48 overflow-y-auto hide-scrollbar">
                  {filteredRooms.map((room) => (
                    <div
                      key={room._id}
                      className="flex flex-col items-start justify-between p-2 bg-muted/50 rounded-md text-sm"
                    >
                      <div className="flex flex-col items-start h-[3.5rem]">
                        <span className="font-semibold">{room.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {getRoomTypeName(room.roomTypeId)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs w-full flex items-center justify-center py-2 ${getRoomStatusColor(
                            room.roomStatus,
                          )}`}
                        >
                          {room.roomStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="default"
          size="sm"
          className="flex items-center w-full gap-1"
          onClick={() => onManageRooms(floor._id)}
        >
          <Bed className="w-4 h-4" />
          <span>Manage Rooms</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

const MemoizedFloorCard = memo(FloorCard);
export default MemoizedFloorCard;
