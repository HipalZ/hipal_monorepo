import useFloorFormStore from '@/components/store/hotel/useFloorStore';
import { useStaffDataStore } from '@/components/store/hotel/useHotelStaff';
import useBusinessData from '@/components/store/useBusinessData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { findBusinessRole } from '@/components/utils/helper';
import { Check, Users } from 'lucide-react';
import { memo } from 'react';

const StaffPreviewStep: React.FC = () => {
  const { selectedStaffIds } = useFloorFormStore();
  const staffData = useStaffDataStore((s) => s.staffData);
  const businessId = useBusinessData((s) => s?.outletInfo?.businessId);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="text-primary flex items-center gap-2 font-medium">
            <Users className="h-4 w-4" />
            <h3>Assigned Staff</h3>
          </div>
          <Badge variant="outline" className="px-2 py-0.5">
            {selectedStaffIds.length} selected
          </Badge>
        </div>

        <div className="pl-6">
          {staffData.length > 0 ? (
            <div className="max-h-[200px] space-y-2 overflow-y-auto pr-2">
              {staffData.map((staff) => {
                const isSelected = selectedStaffIds.includes(staff._id);
                return (
                  <div
                    key={staff._id}
                    className={`flex items-center justify-between rounded-md p-2 ${isSelected ? 'bg-muted/50' : 'bg-transparent'}`}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="text-primary h-3.5 w-3.5" />}
                      <span className="font-medium">{staff.name}</span>
                      {findBusinessRole(staff.customRole, businessId) && (
                        <Badge variant="outline" className="text-xs">
                          {findBusinessRole(staff.customRole, businessId)?.role.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">No staff available</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(StaffPreviewStep);
