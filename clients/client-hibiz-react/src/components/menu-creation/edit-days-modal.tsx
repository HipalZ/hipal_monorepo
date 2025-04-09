import { memo, useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { WeekDay } from "@/components/store/useMenuCreationStore"
import { useGetAllLayouts, useQwickDaysUpdate } from "@/hooks/useMenuLayout"
import useBusinessData from "@/components/store/useBusinessData"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

// Day names mapping
const dayNames = {
    [WeekDay.SUNDAY]: "Sunday",
    [WeekDay.MONDAY]: "Monday",
    [WeekDay.TUESDAY]: "Tuesday",
    [WeekDay.WEDNESDAY]: "Wednesday",
    [WeekDay.THURSDAY]: "Thursday",
    [WeekDay.FRIDAY]: "Friday",
    [WeekDay.SATURDAY]: "Saturday",
}

interface EditDaysModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    selectedZoneIds: string[]
    currentEditingMenuId?: string
}

interface MenuDayState {
    [menuId: string]: {
        name: string
        days: WeekDay[]
        originalDays: WeekDay[]
        zoneIds: string[]
        changed: boolean
    }
}

const EditDaysModal = memo(
    ({ isOpen, onClose, onSuccess, selectedZoneIds, currentEditingMenuId }: EditDaysModalProps) => {
        const businessId = useBusinessData((s) => s.businessData?._id) || ""
        const { allMenuLayouts, isLoading, refetch } = useGetAllLayouts(businessId)
        const { updateMenuLayout, updatetingMenuLoader } = useQwickDaysUpdate()

        const [menuDays, setMenuDays] = useState<MenuDayState>({})
        const [saving, setSaving] = useState(false)

        // Group menus by zone for better organization
        const menusByZone = Object.values(menuDays).reduce(
            (acc, menu) => {
                menu.zoneIds.forEach((zoneId) => {
                    if (selectedZoneIds.includes(zoneId)) {
                        if (!acc[zoneId]) {
                            acc[zoneId] = []
                        }
                        acc[zoneId].push(menu)
                    }
                })
                return acc
            },
            {} as Record<string, (typeof Object.values<typeof menuDays>)[0][]>,
        )

        // Initialize menu days state when layouts data is loaded
        useEffect(() => {
            if (!isLoading && allMenuLayouts?.data) {
                const relevantMenus = allMenuLayouts.data.filter(
                    (menu) =>
                        // Skip the current menu being edited
                        menu._id !== currentEditingMenuId &&
                        // Only include menus that share zones with our selection
                        menu.zoneIds.some((zoneId) => selectedZoneIds.includes(zoneId)),
                )

                const initialState: MenuDayState = {}

                relevantMenus.forEach((menu) => {
                    initialState[menu._id] = {
                        name: menu.name,
                        days: [...menu.days] as WeekDay[],
                        originalDays: [...menu.days] as WeekDay[],
                        zoneIds: menu.zoneIds,
                        changed: false,
                    }
                })

                setMenuDays(initialState)
            }
        }, [isLoading, allMenuLayouts, selectedZoneIds, currentEditingMenuId])

        // Toggle day selection for a menu
        const toggleDay = (menuId: string, day: WeekDay) => {
            setMenuDays((prev) => {
                const menu = prev[menuId]
                if (!menu) return prev

                const newDays = [...menu.days]
                const dayIndex = newDays.indexOf(day)

                if (dayIndex >= 0) {
                    newDays.splice(dayIndex, 1)
                } else {
                    newDays.push(day)
                }

                // Check if days have changed from original
                const changed = JSON.stringify(newDays.sort()) !== JSON.stringify(menu.originalDays.sort())

                return {
                    ...prev,
                    [menuId]: {
                        ...menu,
                        days: newDays,
                        changed,
                    },
                }
            })
        }

        // Save changes to all modified menus
        const saveChanges = async () => {
            try {
                setSaving(true)

                // Find menus with changes
                const changedMenus = Object.entries(menuDays).filter(([_, menu]) => menu.changed)

                if (changedMenus.length === 0) {
                    toast.success("No changes to save")
                    onClose()
                    return
                }

                // Update each changed menu one by one
                for (const [menuId, menu] of changedMenus) {
                    const updatePayload = {
                        menuId,
                        businessId,
                        days: menu.days,
                    }

                    await updateMenuLayout(updatePayload)
                }
                onSuccess() // This just refreshes the data in the parent component
                onClose() // This only closes the modal
            } catch (error) {
                console.error("Failed to update menu days:", error)
                toast.error("Failed to update menu days")
            } finally {
                setSaving(false)
            }
        }

        // Check if any menus have changes
        const hasChanges = Object.values(menuDays).some((menu) => menu.changed)

        // Get all zone names for display
        const getZoneName = (zoneId: string) => {
            // This is a placeholder - in a real app, you would fetch zone names from your data
            return `Zone ${zoneId.substring(0, 4)}`
        }

        if (isLoading) {
            return (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogContent className="sm:max-w-[500px]">
                        <div className="flex items-center justify-center p-6">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="ml-2">Loading menu layouts...</span>
                        </div>
                    </DialogContent>
                </Dialog>
            )
        }

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Days in Existing Layouts</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <p className="mb-4 text-sm text-gray-500">
                            Deselect days from existing menu layouts to make them available for your new layout.
                        </p>

                        {Object.keys(menusByZone).length === 0 ? (
                            <div className="p-4 text-center rounded-md bg-gray-50">
                                <p>No conflicting menu layouts found for the selected zones.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(menusByZone).map(([zoneId, menus]) => (
                                    <div key={zoneId} className="p-4 border rounded-md">
                                        <h3 className="mb-3 font-medium">{getZoneName(zoneId)}</h3>

                                        <div className="space-y-4">
                                            {menus.map((menu) => (
                                                <div key={menu.name} className="p-3 rounded-md bg-gray-50">
                                                    <h4 className="flex justify-between mb-2 text-sm font-medium">
                                                        <span>{menu.name}</span>
                                                        {menu.changed && (
                                                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Modified</span>
                                                        )}
                                                    </h4>

                                                    <div className="flex flex-wrap gap-2">
                                                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                                                            const isSelected = menu.days.includes(day as WeekDay)
                                                            return (
                                                                <label
                                                                    key={day}
                                                                    className={`
                                  flex items-center gap-2 px-2 py-1 rounded-md border cursor-pointer
                                  ${isSelected ? "bg-primary/10 border-primary/30" : "bg-white border-gray-200"}
                                `}
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() =>
                                                                            toggleDay(
                                                                                Object.keys(menuDays).find((id) => menuDays[id].name === menu.name) || "",
                                                                                day as WeekDay,
                                                                            )
                                                                        }
                                                                    />
                                                                    <span className="text-sm">{dayNames[day as WeekDay]}</span>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={saveChanges} disabled={!hasChanges || saving || updatetingMenuLoader}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    },
)

EditDaysModal.displayName = "EditDaysModal"
export default EditDaysModal

