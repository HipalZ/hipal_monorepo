import { memo } from "react"
import { Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { StepProps } from "./types"
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllHotelStaff } from "@/hooks/useHotelStaff"

const StaffSelectionStep = ({ formData, toggleStaff }: StepProps) => {
    const businessId = useBusinessData((s) => s.businessData?._id) as string
  const {staffLoading} = useGetAllHotelStaff(businessId as string)
  const staffData = useStaffDataStore((state) => state.staffData)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Assign Staff</h2>
      <p className="text-sm text-muted-foreground">Select staff members responsible for this room</p>

      {staffData.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Users className="w-8 h-8 text-muted-foreground" />
            <h3 className="font-medium">No Staff Members</h3>
            <p className="text-sm text-muted-foreground">No staff members available to assign</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {staffData.map((staff) => (
              <Card
                key={staff._id}
                className={`border cursor-pointer transition-all ${formData.staffIds.includes(staff._id) ? "border-primary" : ""}`}
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
                      <Label htmlFor={`staff-${staff._id}`} className="font-medium cursor-pointer">
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

          <div className="pt-2">
            <p className="text-sm font-medium">Selected staff: {formData.staffIds.length}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(StaffSelectionStep)

