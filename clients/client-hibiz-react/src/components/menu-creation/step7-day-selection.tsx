import { memo, useEffect, useState } from "react"
import { useMenuCreationStore, WeekDay } from "@/components/store/useMenuCreationStore"
import { cn } from "@/lib/utils"
import { Calendar, AlertCircle, Lock, Edit } from "lucide-react"
import { useGetAllLayouts } from "@/hooks/useMenuLayout"
import useBusinessData from "@/components/store/useBusinessData"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import EditDaysModal from "./edit-days-modal"
import toast from "react-hot-toast"

const dayNames = {
  [WeekDay.SUNDAY]: "Sunday",
  [WeekDay.MONDAY]: "Monday",
  [WeekDay.TUESDAY]: "Tuesday",
  [WeekDay.WEDNESDAY]: "Wednesday",
  [WeekDay.THURSDAY]: "Thursday",
  [WeekDay.FRIDAY]: "Friday",
  [WeekDay.SATURDAY]: "Saturday",
}

interface DayConflict {
  day: WeekDay
  menuName: string
  menuId: string
}

const Step7DaySelection = memo(() => {
  const businessId = useBusinessData((s) => s.businessData?._id) || ""
  const { allMenuLayouts, isLoading, refetch } = useGetAllLayouts(businessId)

  const { selectedDays, toggleSelectedDay, selectedZoneIds, editingMenuId } = useMenuCreationStore((state) => ({
    selectedDays: state.selectedDays,
    toggleSelectedDay: state.toggleSelectedDay,
    selectedZoneIds: state.selectedZoneIds,
    editingMenuId: state.editingMenuId,
  }))

  const [dayConflicts, setDayConflicts] = useState<Record<WeekDay, DayConflict[]>>({} as Record<WeekDay, DayConflict[]>)
  const [hasConflicts, setHasConflicts] = useState(false)
  const [showConflictDetails, setShowConflictDetails] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Check for day conflicts when zone selection or all menu layouts change
  useEffect(() => {
    if (isLoading || !allMenuLayouts?.data || selectedZoneIds.length === 0) return

    // Initialize conflicts object
    const conflicts: Record<WeekDay, DayConflict[]> = {
      [WeekDay.SUNDAY]: [],
      [WeekDay.MONDAY]: [],
      [WeekDay.TUESDAY]: [],
      [WeekDay.WEDNESDAY]: [],
      [WeekDay.THURSDAY]: [],
      [WeekDay.FRIDAY]: [],
      [WeekDay.SATURDAY]: [],
    }

    let conflictFound = false

    // Find menus that share zones with our current selection
    allMenuLayouts.data.forEach((menu) => {
      // Skip the current menu being edited
      if (editingMenuId && menu._id === editingMenuId) return

      // Check if this menu has any zones that overlap with our selection
      const hasOverlappingZones = menu.zoneIds.some((zoneId) => selectedZoneIds.includes(zoneId))

      if (hasOverlappingZones) {
        // For each day in this menu, record a conflict
        menu.days.forEach((day) => {
          conflicts[day].push({
            day: day as WeekDay,
            menuName: menu.name,
            menuId: menu._id,
          })
          conflictFound = true
        })
      }
    })

    setDayConflicts(conflicts)
    setHasConflicts(conflictFound)

    // Remove any selected days that now have conflicts
    selectedDays.forEach((day) => {
      if (conflicts[day]?.length > 0) {
        toggleSelectedDay(day)
      }
    })
  }, [selectedZoneIds, allMenuLayouts, isLoading, editingMenuId, selectedDays, toggleSelectedDay])

  // Handle day selection with conflict prevention
  const handleDaySelection = (day: WeekDay) => {
    const conflicts = dayConflicts[day] || []

    // Only allow toggling if there are no conflicts
    if (conflicts.length === 0) {
      toggleSelectedDay(day)
    }
  }

  // Get all days with conflicts for display
  const conflictingDays = Object.entries(dayConflicts)
    .filter(([_, conflicts]) => conflicts.length > 0)
    .map(([day, conflicts]) => ({
      day: Number(day) as WeekDay,
      conflicts,
    }))

  // Handle opening the edit modal
  const openEditModal = () => {
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    refetch()
    toast.success("Days updated. You can now select newly available days for your menu.")
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-[10rem]">
      <h2 className="text-xl font-semibold text-center">Select Days</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {hasConflicts && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle className="flex items-center justify-between">
                <span>Scheduling Conflicts</span>
                <Button variant="outline" size="sm" onClick={openEditModal} className="h-8 gap-1 text-xs">
                  <Edit className="w-3 h-3" />
                  Edit Days
                </Button>
              </AlertTitle>
              <AlertDescription>
                Some days are already assigned to other menus in the selected zone(s). Click "Edit Days" to modify
                existing layouts and free up days.
              </AlertDescription>
            </Alert>
          )}

          {/* Mobile-friendly conflict details */}
          {hasConflicts && (
            <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center font-medium text-gray-700">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  Unavailable Days
                </h4>
                <button
                  type="button"
                  onClick={() => setShowConflictDetails(!showConflictDetails)}
                  className="text-xs underline text-primary"
                >
                  {showConflictDetails ? "Hide details" : "Show details"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {conflictingDays.map(({ day }) => (
                  <span key={day} className="px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded-md">
                    {dayNames[day]}
                  </span>
                ))}
              </div>

              {showConflictDetails && (
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <h5 className="mb-2 text-xs font-medium text-gray-600">Assigned to:</h5>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {conflictingDays.map(({ day, conflicts }) => (
                      <li key={day} className="flex flex-col">
                        <span className="font-medium">{dayNames[day]}:</span>
                        <ul className="ml-4 list-disc">
                          {conflicts.map((conflict, idx) => (
                            <li key={idx}>{conflict.menuName}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500">
            Select the days when this menu should be available.
            {selectedZoneIds.length > 0
              ? " Days with a lock icon cannot be selected due to conflicts."
              : " Please select at least one zone first to see available days."}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(WeekDay)
              .filter((day) => !Number.isNaN(Number(day)))
              .map((day) => {
                const conflicts = dayConflicts[day as WeekDay] || []
                const hasConflict = conflicts.length > 0
                const isDisabled = hasConflict

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDaySelection(day as WeekDay)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-md border transition-colors relative",
                      selectedDays.includes(day as WeekDay)
                        ? "bg-primary text-white border-primary"
                        : isDisabled
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white hover:bg-gray-50 border-gray-200",
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-full text-xs",
                        selectedDays.includes(day as WeekDay)
                          ? "bg-white text-primary"
                          : isDisabled
                            ? "bg-gray-200 text-gray-500"
                            : "bg-gray-100 text-gray-700",
                      )}
                    >
                      {day}
                    </span>
                    <span className="font-medium">{dayNames[day as WeekDay]}</span>

                    {hasConflict && (
                      <div className="absolute top-1 right-1">
                        <Lock className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </button>
                )
              })}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                const allDays = [1, 2, 3, 4, 5, 6, 7] as WeekDay[]
                allDays.forEach((day) => {
                  // Only select days without conflicts
                  if (!selectedDays.includes(day) && (dayConflicts[day]?.length || 0) === 0) {
                    toggleSelectedDay(day)
                  }
                })
              }}
              className="text-sm text-primary hover:underline"
            >
              Select All Available
            </button>
            <button
              type="button"
              onClick={() => {
                const allDays = [1, 2, 3, 4, 5, 6, 7] as WeekDay[]
                allDays.forEach((day) => {
                  if (selectedDays.includes(day)) {
                    toggleSelectedDay(day)
                  }
                })
              }}
              className="text-sm text-gray-500 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 font-medium">Preview</h3>
          <div className="p-4 bg-white border border-gray-200 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h4 className="font-medium">This Layout Available Days</h4>
            </div> 

            {selectedDays.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedDays
                  .sort((a, b) => a - b)
                  .map((day) => (
                    <span
                      key={day}
                      className="flex items-center gap-1 px-2 py-1 text-sm rounded-md bg-primary/10 text-primary"
                    >
                      {dayNames[day]}
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No days selected</p>
            )}

            {selectedDays.length === 7 && (
              <p className="mt-2 text-sm text-gray-500">This menu will be available every day of the week.</p>
            )}

            {selectedDays.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                Note: You can proceed without selecting any days, but the menu won't be visible to customers.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Days Modal */}
      <EditDaysModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        selectedZoneIds={selectedZoneIds}
        currentEditingMenuId={editingMenuId}
      />
    </div>
  )
})

Step7DaySelection.displayName = "Step7DaySelection"
export default Step7DaySelection

