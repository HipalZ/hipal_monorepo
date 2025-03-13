import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, UserCircle, Phone } from "lucide-react"
import useRoomFormStore from "@/components/store/hotel/useRoomFormStore"
import useBusinessData from "@/components/store/useBusinessData"
import { useGetAllHotelStaff } from "@/hooks/useHotelStaff"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useStaffDataStore } from "@/components/store/hotel/useHotelStaff"

const FourthStepRoom: React.FC = () => {
  const businessId = useBusinessData((s) => s.businessData?._id)
  const { isLoading: staffLoading } = useGetAllHotelStaff(businessId as string)

  const { selectedStaffIds, toggleStaff } = useRoomFormStore((state) => ({
    selectedStaffIds: state.selectedStaffIds,
    toggleStaff: state.toggleStaff,
  }))

  // Get staff data from store
  const staffData = useStaffDataStore((state) => state.staffData)

  // Check if a staff member is selected
  const isStaffSelected = (staffId: string) => {
    return selectedStaffIds.includes(staffId)
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    const roleBadgeColors: Record<string, string> = {
      MANAGER: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      HELP_DESK: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      RECEPTIONIST: "bg-amber-100 text-amber-800 hover:bg-amber-100",
      MAINTENANCE: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      ELECTRICIAN: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      PLUMBER: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
      SECURITY: "bg-red-100 text-red-800 hover:bg-red-100",
      HOUSEKEEPING: "bg-green-100 text-green-800 hover:bg-green-100",
      CLEANER: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
      LAUNDRY: "bg-sky-100 text-sky-800 hover:bg-sky-100",
      WAITER: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
      KITCHEN: "bg-rose-100 text-rose-800 hover:bg-rose-100",
    }
    return roleBadgeColors[role] || "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  if (staffLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Assign Staff</h2>
      <p className="text-sm text-muted-foreground">Select staff members responsible for this room</p>

      {staffData.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <User className="w-8 h-8 text-muted-foreground" />
            <h3 className="font-medium">No Staff Members</h3>
            <p className="text-sm text-muted-foreground">Please add staff members first.</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {staffData.map((staff) => (
              <Card
                key={staff._id}
                className={`border cursor-pointer transition-all ${isStaffSelected(staff._id) ? "border-primary" : ""}`}
                onClick={() => toggleStaff(staff._id)}
              >
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`staff-${staff._id}`}
                      checked={isStaffSelected(staff._id)}
                      onCheckedChange={() => toggleStaff(staff._id)}
                      className="pointer-events-none"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <UserCircle className="w-4 h-4 text-primary" />
                        <Label htmlFor={`staff-${staff._id}`} className="font-medium cursor-pointer">
                          {staff.name}
                        </Label>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3 mr-1" />
                        {staff.phone}
                      </div>
                    </div>
                  </div>

                  {staff.customRole && staff.customRole.length > 0 && (
                    <Badge variant="secondary" className={getRoleBadgeColor(staff.customRole[0].role)}>
                      {staff.customRole[0].role.replace(/_/g, " ")}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium">Selected staff: {selectedStaffIds.length}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default memo(FourthStepRoom)

