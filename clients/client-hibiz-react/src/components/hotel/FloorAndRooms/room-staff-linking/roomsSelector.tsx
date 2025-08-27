import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, MapPin, Search, User } from "lucide-react";
import type { FloorDoc, RoomDoc } from "./types";
import { getRoomTypeName } from "./roomStaffLinking";

export function RoomsSelector({
  rooms,
  floors,
  selectedRooms,
  setSelectedRooms,
  toggleRoomSelection,
  getStaffByRoom,
  roomTypes,
}: {
  rooms: RoomDoc[];
  floors: FloorDoc[];
  selectedRooms: string[];
  setSelectedRooms: (ids: string[]) => void;
  toggleRoomSelection: (id: string) => void;
  getStaffByRoom: (roomId: string) => any[];
  roomTypes: any[];
}) {
  const [roomSearchTerm, setRoomSearchTerm] = useState("");
  const [floorFilter, setFloorFilter] = useState<string>("all");

  const floorNameById = useMemo(
    () => Object.fromEntries(floors.map((f) => [f._id, f.name])),
    [floors],
  );

  const roomsByFloor = useMemo(() => {
    const mapping = new Map<string, { floorName: string; rooms: RoomDoc[] }>();
    for (const room of rooms) {
      const floorId = room.zoneId;
      const floorName = floorNameById[floorId] || "Unassigned";
      if (!mapping.has(floorId)) mapping.set(floorId, { floorName, rooms: [] });
      const roomSearch = room.name
        .toLowerCase()
        .includes(roomSearchTerm.toLowerCase());
      const searchFloor = floorFilter === "all" || floorId === floorFilter;
      if (roomSearch && searchFloor) mapping.get(floorId)!.rooms.push(room);
    }
    return Array.from(mapping.entries())
      .map(([floorId, data]) => ({
        floorId,
        floorName: data.floorName,
        rooms: data.rooms,
      }))
      .filter((f) => f.rooms.length > 0);
  }, [rooms, roomSearchTerm, floorFilter, floorNameById]);

  const selectAllRooms = () => {
    const allRoomIds = roomsByFloor.flatMap((f) => f.rooms.map((r) => r._id));
    const allSelected =
      allRoomIds.every((id) => selectedRooms.includes(id)) &&
      allRoomIds.length > 0;
    setSelectedRooms(allSelected ? [] : allRoomIds);
  };

  const toggleFloorRooms = (fid: string) => {
    const floor = roomsByFloor.find((f) => f.floorId === fid);
    if (!floor) return;
    const ids = floor.rooms.map((r) => r._id);
    const cur = new Set(selectedRooms);
    const allSelected = ids.every((id) => cur.has(id));
    setSelectedRooms(
      allSelected
        ? selectedRooms.filter((id) => !ids.includes(id))
        : Array.from(new Set([...selectedRooms, ...ids])),
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-emerald-600" /> Select Rooms by
            Floor
          </CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAllRooms}
              className="w-full sm:w-auto"
            >
              {selectedRooms?.length > 0 ? "Deselect All" : "Select All"}
            </Button>
            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={roomSearchTerm}
            onChange={(e) => setRoomSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 md:h-[calc(75dvh-10rem)]">
          <div className="space-y-4">
            {roomsByFloor.map((f) => {
              const ids = f.rooms.map((r) => r._id);
              const selectedInFloor = ids.filter((id) =>
                selectedRooms.includes(id),
              ).length;
              const allInFloor =
                selectedInFloor === ids.length && ids.length > 0;
              return (
                <div key={f.floorId} className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-gray-900 text-sm md:text-base">
                        {f.floorName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {selectedInFloor}/{f.rooms.length} selected
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFloorRooms(f.floorId)}
                      className="text-xs w-full sm:w-auto"
                    >
                      {allInFloor ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {f.rooms.map((r) => {
                      const isSelected = selectedRooms.includes(r._id);
                      const assigned = getStaffByRoom?.(r._id) ?? [];
                      return (
                        <div
                          key={r._id}
                          className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                            isSelected
                              ? "border-purple-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50"
                          }`}
                          onClick={() => toggleRoomSelection(r._id)}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <Checkbox
                              checked={isSelected}
                              readOnly
                              className="mt-0.5 data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                            />
                            <Badge variant="outline" className="text-xs">
                              {getRoomTypeName(r.roomTypeId, roomTypes)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {r.name}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Cap: {r.capacity ?? 0}</span>
                            </div>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                r.availability ? "bg-green-400" : "bg-red-400"
                              }`}
                              title={r.availability ? "Available" : "Occupied"}
                            />
                            {!!assigned.length && (
                              <div className="mt-1 flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-gray-500">
                                  {assigned.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
