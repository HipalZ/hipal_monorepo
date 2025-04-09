import { memo, useCallback } from "react"
import { useMenuCreationStore, MenuType, CategoryLayout, CardLayout, WeekDay } from "@/components/store/useMenuCreationStore"
import { FaCheck, FaEdit } from "react-icons/fa"
import PhonePreview from "./phone-preview"
import { CategoryData, ParentCategory } from "@/configs/test"
import useBusinessData from "@/components/store/useBusinessData"
import { Badge } from "@/components/ui/badge"
import { useGetAllZones } from "@/hooks/useZone"
import { formatMinutesToTime } from "../utils/helper"

// Sample parent categories based on the provided data
const sampleParentCategories = ParentCategory

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



const Step5Summary = memo(() => {
  const businessId = useBusinessData((s) => s.businessData?._id) || ""
  const { data: zones } = useGetAllZones(businessId)

  const {
    menuType,
    categoryLayout,
    cardLayout,
    primaryColor,
    secondaryColor,
    name:menuName,
    selectedZoneIds,
    selectedDays,
    startTime,
    endTime,
    copyMenuLayoutId,
    sourceMenuName,
    copyCompleteMenu,
    setCurrentStep,
  } = useMenuCreationStore((state) => ({
    menuType: state.menuType,
    categoryLayout: state.categoryLayout,
    cardLayout: state.cardLayout,
    primaryColor: state.primaryColor,
    secondaryColor: state.secondaryColor,
    name: state.name,
    selectedZoneIds: state.selectedZoneIds,
    selectedDays: state.selectedDays,
    startTime: state.startTime,
    endTime: state.endTime,
    copyMenuLayoutId: state.copyMenuLayoutId,
    sourceMenuName: state.sourceMenuName,
    copyCompleteMenu: state.copyCompleteMenu,
    setCurrentStep: state.setCurrentStep,
  }))

  // Get selected zone names
  const selectedZones = zones?.filter((zone) => selectedZoneIds.includes(zone._id || "")) || []

  const handleEditStep = useCallback(
    (step: number) => {
      setCurrentStep(step)
    },
    [setCurrentStep],
  )

  const getMenuTypeLabel = useCallback((type: MenuType | null) => {
    switch (type) {
      case MenuType.MAIN_SUB_DISH:
        return "Main Category → Sub Category → Dishes"
      case MenuType.SUB_DISH:
        return "Sub Category → Dishes"
      default:
        return "Not selected"
    }
  }, [])

  const getCategoryLayoutLabel = useCallback((layout: CategoryLayout | null) => {
    switch (layout) {
      case CategoryLayout.EDGE:
        return "Edge Layout (Categories on left)"
      case CategoryLayout.CLASSIC:
        return "Classic Layout (Categories on top)"
      default:
        return "Not selected"
    }
  }, [])

  const getCardLayoutLabel = useCallback((layout: CardLayout | null) => {
    switch (layout) {
      case CardLayout.GRID:
        return "Grid Layout"
      case CardLayout.HORIZONTAL:
        return "Horizontal Layout"
      default:
        return "Not selected"
    }
  }, [])

  // Get sample dishes for preview
  const sampleDishes = CategoryData.reduce((dishes, category) => {
    if (category.dishIds && category.dishIds.length) {
      dishes.push(...category.dishIds)
    }
    return dishes
  }, [] as any[])

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold text-center">Your Menu Configuration</h2>

      {/* Show copy information if this is a copied menu */}
      {copyMenuLayoutId && (
        <div className="p-4 mb-2 border rounded-lg bg-primary/10 border-primary/20">
          <h3 className="font-medium text-primary">Copied from: {sourceMenuName}</h3>
          {copyCompleteMenu && <p className="mt-2 text-lg font-bold text-primary">All menu items will be copied</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pb-[10rem]">
        {/* Phone Preview */}
        <div className="flex items-center justify-center">
          <PhonePreview
            categories={CategoryData}
            dishes={sampleDishes}
            parentCategories={menuType === MenuType.MAIN_SUB_DISH ? sampleParentCategories : []}
            showFinalPreview={true}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Your Selections</h3>

          <div className="space-y-4">
            {/* Menu Name & Zones */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Menu Name & Zones</h4>
                <p className="mb-1 text-sm text-gray-600">{menuName || "Not set"}</p>
                {selectedZones.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedZones.map((zone) => (
                      <Badge key={zone._id} variant="outline" className="text-xs">
                        {zone.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No zones selected</p>
                )}
              </div>
              <button
                onClick={() => handleEditStep(5)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit menu name and zones"
              >
                <FaEdit />
              </button>
            </div>

            {/* Menu Type */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Menu Type</h4>
                <p className="text-sm text-gray-600">{getMenuTypeLabel(menuType)}</p>
              </div>
              <button
                onClick={() => handleEditStep(1)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit menu type"
              >
                <FaEdit />
              </button>
            </div>

            {/* Category Layout */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Category Layout</h4>
                <p className="text-sm text-gray-600">{getCategoryLayoutLabel(categoryLayout)}</p>
              </div>
              <button
                onClick={() => handleEditStep(2)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit category layout"
              >
                <FaEdit />
              </button>
            </div>

            {/* Card Layout */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Dish Card Layout</h4>
                <p className="text-sm text-gray-600">{getCardLayoutLabel(cardLayout)}</p>
              </div>
              <button
                onClick={() => handleEditStep(3)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit card layout"
              >
                <FaEdit />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">Color Scheme</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    <span className="text-xs">{primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                    <span className="text-xs">{secondaryColor}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleEditStep(4)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit colors"
              >
                <FaEdit />
              </button>
            </div>

            {/* Available Days */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Available Days</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDays.length > 0 ? (
                    selectedDays
                      .sort((a, b) => a - b)
                      .map((day) => (
                        <span key={day} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          {dayNames[day]}
                        </span>
                      ))
                  ) : (
                    <p className="text-sm text-gray-600">No days selected</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEditStep(6)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit available days"
              >
                <FaEdit />
              </button>
            </div>

            {/* Time Range */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Time Range</h4>
                <p className="text-sm text-gray-600">
                  {formatMinutesToTime(startTime)} to {formatMinutesToTime(endTime)}
                </p>
              </div>
              <button
                onClick={() => handleEditStep(7)}
                className="p-2 text-gray-500 hover:text-primary"
                aria-label="Edit time range"
              >
                <FaEdit />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center p-3 mt-4 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2 text-primary">
              <FaCheck />
              <span className="font-medium">Your menu configuration is ready!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

Step5Summary.displayName = "Step5Summary"
export default Step5Summary

