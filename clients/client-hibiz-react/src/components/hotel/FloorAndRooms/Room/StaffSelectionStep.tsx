import { memo, useMemo, useState } from "react";
import { Users, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { StepProps } from "./types";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import useBusinessData from "@/components/store/useBusinessData";
import { useGetAllHotelStaff } from "@/hooks/useHotelStaff";
import { Button } from "@/components/ui/button";

const StaffSelectionStep = ({ formData, toggleStaff }: StepProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string;
  useGetAllHotelStaff(businessId as string);
  const staffData = useStaffDataStore((state) => state.staffData);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffData;
    const query = searchQuery.toLowerCase();
    return staffData.filter(
      (staff) =>
        staff.name.toLowerCase().includes(query) ||
        staff.phone?.includes(query),
    );
  }, [searchQuery, staffData]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Assign Staff</h2>
          <p className="text-sm text-muted-foreground leading-tight">
            Select staff members for this room
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (showSearch) {
              setSearchQuery("");
              setShowSearch(false);
            } else {
              setShowSearch(true);
            }
          }}
        >
          {showSearch ? (
            <X className="w-5 h-5" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </Button>
      </div>

      {showSearch && (
        <input
          id="staff-search"
          type="text"
          placeholder="Search by name or phone"
          className="w-full px-3 py-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {filteredStaff.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Users className="w-8 h-8 text-muted-foreground" />
            <h3 className="font-medium">No Staff Members</h3>
            <p className="text-sm text-muted-foreground">
              No staff members available to assign
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredStaff.map((staff) => (
              <Card
                key={staff._id}
                className={`border cursor-pointer transition-all ${
                  formData.staffIds.includes(staff._id) ? "border-primary" : ""
                }`}
                onClick={() => toggleStaff?.(staff._id)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`staff-${staff._id}`}
                      checked={formData.staffIds.includes(staff._id)}
                      onCheckedChange={() => toggleStaff?.(staff._id)}
                      className="pointer-events-none"
                    />
                    <div>
                      <Label
                        htmlFor={`staff-${staff._id}`}
                        className="font-medium cursor-pointer"
                      >
                        {staff.name}
                      </Label>
                      {staff.customRole && staff.customRole.length > 0 && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {staff.customRole[0].role.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-1">
            <p className="text-sm font-medium">
              Selected staff: {formData.staffIds.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default memo(StaffSelectionStep);
