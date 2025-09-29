import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Check } from "lucide-react";
import useFloorFormStore from "@/components/store/hotel/useFloorStore";
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff";
import useBusinessData from "@/components/store/useBusinessData";
import { findRole } from "@/components/utils/helper";

const StaffPreviewStep: React.FC = () => {
  const { selectedStaffIds } = useFloorFormStore();
  const staffData = useStaffDataStore((s) => s.staffData);
  const businessId = useBusinessData((s) => s?.outletInfo?.businessId);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-primary">
            <Users className="w-4 h-4" />
            <h3>Assigned Staff</h3>
          </div>
          <Badge variant="outline" className="px-2 py-0.5">
            {selectedStaffIds.length} selected
          </Badge>
        </div>

        <div className="pl-6">
          {staffData.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {staffData.map((staff) => {
                const isSelected = selectedStaffIds.includes(staff._id);
                return (
                  <div
                    key={staff._id}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      isSelected ? "bg-muted/50" : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="font-medium">{staff.name}</span>
                      {staff.customRole && staff.customRole.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {findRole(staff.customRole)}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              No staff available
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(StaffPreviewStep);
