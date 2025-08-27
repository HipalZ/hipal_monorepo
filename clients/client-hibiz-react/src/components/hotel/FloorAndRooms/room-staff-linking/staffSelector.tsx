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
import { Home, Search, Users } from "lucide-react";
import type { StaffDoc } from "./types";
import { getRoleColor } from "./roomStaffLinking";

export function StaffSelector({
  staff,
  selectedStaff,
  setSelectedStaff,
  toggleStaffSelection,
  getRoomsByStaff,
}: {
  staff: StaffDoc[];
  selectedStaff: string[];
  setSelectedStaff: (ids: string[]) => void;
  toggleStaffSelection: (id: string) => void;
  getRoomsByStaff: (staffId: string) => any[];
}) {
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    for (const s of staff) for (const r of s.customRole || []) set.add(r.role);
    return Array.from(set).sort();
  }, [staff]);

  const filteredStaff = useMemo(
    () =>
      staff.filter((s) => {
        const q = staffSearchTerm.toLowerCase();
        const searchStaff =
          s.name.toLowerCase().includes(q) ||
          (s.phone || "").includes(staffSearchTerm) ||
          (s.nickName || "").toLowerCase().includes(q);
        const searchRole =
          roleFilter === "all" ||
          (s.customRole || []).some(
            (r) => r.role.toLowerCase() === roleFilter.toLowerCase(),
          );
        return searchStaff && searchRole;
      }),
    [staff, staffSearchTerm, roleFilter],
  );

  const selectAllStaff = () =>
    setSelectedStaff(filteredStaff.map((s) => s._id));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" /> Select Staff
          </CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAllStaff}
              className="w-full sm:w-auto"
            >
              Select All
            </Button>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="By Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search staff..."
            value={staffSearchTerm}
            onChange={(e) => setStaffSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 md:h-[calc(75dvh-10rem)]">
          <div className="space-y-2">
            {filteredStaff.map((s) => {
              const isSelected = selectedStaff.includes(s._id);
              const assignedRooms = getRoomsByStaff?.(s._id) ?? [];
              const role = s.customRole?.[0]?.role;
              return (
                <div
                  key={s._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? "border-purple-300 bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50"
                  }`}
                  onClick={() => toggleStaffSelection(s._id)}
                >
                  <Checkbox
                    checked={isSelected}
                    readOnly
                    className="data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-gray-900 text-sm md:text-base">
                        {s.name}
                      </p>
                      {role && (
                        <Badge
                          className={`${getRoleColor(role)} border text-xs`}
                        >
                          {role.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {s.phone}
                    </p>
                    {!!assignedRooms?.length && (
                      <div className="mt-2 flex items-center gap-1">
                        <Home className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {assignedRooms.length} rooms currently assigned
                        </span>
                      </div>
                    )}
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
