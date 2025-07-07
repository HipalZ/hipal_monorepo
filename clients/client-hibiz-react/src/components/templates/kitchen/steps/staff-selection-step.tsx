import { memo, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useGetAllStaff } from "@/hooks/useStaff.ts";
import type { UserProfile } from "@/components/types/businessData";
import { Users, Search, Crown } from "lucide-react";
import { useParams } from "react-router-dom";

interface StaffSelectionStepProps {
  formData: {
    selectedStaffIds: string[];
  };
  updateFormData: (updates: Partial<{ selectedStaffIds: string[] }>) => void;
}

function StaffSelectionStepComponent({
  formData,
  updateFormData,
}: StaffSelectionStepProps) {
  const businessId = useParams<{ businessId: string }>().businessId;
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const { rawStaffDetails, isLoadingStaff } = useGetAllStaff(businessId);

  const filteredStaff = useMemo(
    () =>
      rawStaffDetails?.filter((staff) =>
        staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()),
      ),
    [rawStaffDetails, staffSearchTerm],
  );

  const toggleStaffSelection = (staffId: string) => {
    const newSelectedIds = formData.selectedStaffIds.includes(staffId)
      ? formData.selectedStaffIds.filter((id) => id !== staffId)
      : [...formData.selectedStaffIds, staffId];

    updateFormData({ selectedStaffIds: newSelectedIds });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Badge variant="secondary" className="px-3 py-1">
            {formData.selectedStaffIds.length} Selected
          </Badge>
          {formData.selectedStaffIds.length > 0 && (
            <Crown className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search staff..."
            value={staffSearchTerm}
            onChange={(e) => setStaffSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {isLoadingStaff && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {!isLoadingStaff && filteredStaff && filteredStaff.length > 0 && (
        <ScrollArea className="h-80 border-2 rounded-xl p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff: UserProfile) => {
              const isSelected = formData.selectedStaffIds.includes(staff._id);
              return (
                <div
                  key={staff._id}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      toggleStaffSelection(staff._id);
                    }
                  }}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => toggleStaffSelection(staff._id)}
                >
                  <Checkbox
                    id={`staff-${staff._id}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleStaffSelection(staff._id)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{staff.name}</p>
                      {staff.role && (
                        <Badge variant="outline" className="text-xs">
                          {staff.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {staff.email || "No email provided"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {!isLoadingStaff && (!filteredStaff || filteredStaff.length === 0) && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {staffSearchTerm
              ? "No staff found matching your search."
              : "No staff members found for this business."}
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(StaffSelectionStepComponent);
