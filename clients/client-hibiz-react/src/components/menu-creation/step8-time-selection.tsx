import { memo, useState, useEffect, useCallback } from "react"
import { useMenuCreationStore } from "@/components/store/useMenuCreationStore"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CopyMenuConfirmModal from "./copy-menu-confirm-modal"

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const totalMinutes = hour * 60 + minute
      const label = formatMinutesForDisplay(totalMinutes)
      options.push({ value: totalMinutes, label })
    }
  }
  return options
}

// Format time for display (12-hour format with AM/PM)
const formatMinutesForDisplay = (totalMinutes: number) => {
  const hours24 = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 || 12

  const minutesPadded = mins.toString().padStart(2, "0")
  return `${hours12}:${minutesPadded} ${period}`
}

const timeOptions = generateTimeOptions()

const Step8TimeSelection = memo(() => {
  const {
    startTime,
    endTime,
    setTimeRange,
    setCopyCompleteMenu,
    sourceMenuName,
    showCopyMenuConfirmModal,
    setShowCopyMenuConfirmModal,
    setCurrentStep,
    copyMenuLayoutId,
  } = useMenuCreationStore((state) => ({
    startTime: state.startTime,
    endTime: state.endTime,
    setTimeRange: state.setTimeRange,
    showCopyMenuConfirmModal: state.showCopyMenuConfirmModal,
    setShowCopyMenuConfirmModal: state.setShowCopyMenuConfirmModal,
    sourceMenuName: state.sourceMenuName,
    setCopyCompleteMenu: state.setCopyCompleteMenu,
    setCurrentStep: state.setCurrentStep,
    copyMenuLayoutId: state.copyMenuLayoutId,
  }))

  // Initialize with default values if not set
  const [selectedStartTime, setSelectedStartTime] = useState(startTime || 240)
  const [selectedEndTime, setSelectedEndTime] = useState(endTime || 239)

  // Update store when selections change
  useEffect(() => {
    setTimeRange(selectedStartTime, selectedEndTime)
  }, [selectedStartTime, selectedEndTime, setTimeRange])

  // Calculate the end time based on start time (23 hours and 59 minutes later)
  const calculateEndTime = (startInMinutes: number) => {
    // 23 hours & 59 minutes after start
    const total = (startInMinutes + (23 * 60) + 59) % (24 * 60)
    return total
  }
  // Handle start time change
  const handleStartTimeChange = (value: number) => {
    setSelectedStartTime(value)
    setSelectedEndTime(calculateEndTime(value))
  }

  useEffect(() => {
    if (copyMenuLayoutId) {
      setShowCopyMenuConfirmModal(true)
    }
  }, [copyMenuLayoutId])

  // Handle copy menu confirmation
  const handleCopyMenuConfirm = useCallback(
    (copyComplete: boolean) => {
      setCopyCompleteMenu(copyComplete)
      setShowCopyMenuConfirmModal(false)
      // Proceed to the final step
      setCurrentStep(8)
    },
    [setCopyCompleteMenu, setCurrentStep],
  )

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold text-center">Select Time Range</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Left column */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Select the time range when this menu should be available.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select
                // The Select in shadcn/ui expects a string value
                value={selectedStartTime.toString()}
                onValueChange={(val) => handleStartTimeChange(Number(val))}
              >
                <SelectTrigger id="start-time">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p>Default time range: 4:00 AM to 3:59 AM (24 hours)</p>
            <p className="mt-1">
              Note: The end time is automatically set to 23 hours and 59 minutes
              after the start time by default, but you can adjust it if needed.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="mb-2 font-medium">Preview</h3>
          <div className="p-4 bg-white border border-gray-200 rounded shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h4 className="font-medium">Available Time</h4>
            </div>

            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <span>{formatMinutesForDisplay(selectedStartTime)}</span>
              <span>to</span>
              <span>{formatMinutesForDisplay(selectedEndTime)}</span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              This menu will be available during the selected time range on the
              chosen days.
            </p>
          </div>
        </div>
      </div>
      <CopyMenuConfirmModal
        isOpen={showCopyMenuConfirmModal}
        onClose={() => setShowCopyMenuConfirmModal(false)}
        onConfirm={handleCopyMenuConfirm}
        sourceMenuName={sourceMenuName}
      />
    </div>
  )
})

Step8TimeSelection.displayName = "Step8TimeSelection"
export default Step8TimeSelection

