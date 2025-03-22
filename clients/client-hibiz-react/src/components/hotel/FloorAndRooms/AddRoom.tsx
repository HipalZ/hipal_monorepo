import { useCallback, useMemo, useState } from "react"
import { Bed, Save, Layers } from "lucide-react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import useBusinessData from "@/components/store/useBusinessData"
import { useRoomCreation } from "@/components/store/hotel/useRoomCreation"
import { useBulkRoomCreation } from "@/components/store/hotel/useBulkRoomCreation"
import BasicInfoStep from "./Room/BasicInfoStep"
import FloorSelectionStep from "./Room/FloorSelectionStep"
import PreviewStep from "./Room/PreviewStep"
import StaffSelectionStep from "./Room/StaffSelectionStep"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StepIndicatior from "../HotelStaff/StepIndicatior"
import BulkRoomNamingStep from "./Room/BulkRoomNamingStep"
import BulkPreviewStep from "./Room/BulkPreviewStep"

// Step configuration
const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Staff" },
  { id: 3, label: "Floor" },
  { id: 4, label: "Preview" },
]

interface NewRoomCreationProps {
  onClose?: () => void
}

const NewRoomCreation = ({ onClose }: NewRoomCreationProps) => {
  const businessId = useBusinessData((s) => s.businessData?._id) as string
  const [creationMode, setCreationMode] = useState<"single" | "bulk">("single")

  const {
    currentStep: singleStep,
    formData: singleFormData,
    errors: singleErrors,
    isLoading: singleIsLoading,
    handleChange: singleHandleChange,
    toggleStaff: singleToggleStaff,
    handleNext: singleHandleNext,
    handleBack: singleHandleBack,
    handleSubmit: singleHandleSubmit,
  } = useRoomCreation(businessId, onClose)

  // Bulk room creation hook
  const {
    currentStep: bulkStep,
    formData: bulkFormData,
    errors: bulkErrors,
    isLoading: bulkIsLoading,
    handleChange: bulkHandleChange,
    toggleStaff: bulkToggleStaff,
    handleNext: bulkHandleNext,
    handleBack: bulkHandleBack,
    handleSubmit: bulkHandleSubmit,
    usePrefix,
    setUsePrefix,
    prefix,
    setPrefix,
    rangeStart,
    setRangeStart,
    rangeEnd,
    setRangeEnd,
    previewNames,
  } = useBulkRoomCreation(businessId, onClose)

  const handleModeChange = useCallback((value: string) => {
    setCreationMode(value as "single" | "bulk")
  }, [])

  const currentStep = useMemo(
    () => (creationMode === "single" ? singleStep : bulkStep),
    [creationMode, singleStep, bulkStep],
  )
  const isLoading = useMemo(
    () => (creationMode === "single" ? singleIsLoading : bulkIsLoading),
    [creationMode, singleIsLoading, bulkIsLoading],
  )
  // Single room creation hook


  // Memoized single step props
  const singleStepProps = useMemo(
    () => ({
      formData: singleFormData,
      errors: singleErrors,
      handleChange: singleHandleChange,
      toggleStaff: singleToggleStaff,
    }),
    [singleFormData, singleErrors, singleHandleChange, singleToggleStaff],
  )

  // Memoized bulk step props for staff and floor selection
  const bulkStepCommonProps = useMemo(
    () => ({
      formData: {
        name: "", // Add a dummy name to satisfy the type
        roomTypeId: bulkFormData.roomTypeId,
        staffIds: bulkFormData.staffIds,
        zoneId: bulkFormData.zoneId,
      },
      errors: bulkErrors,
      handleChange: bulkHandleChange,
    }),
    [bulkFormData, bulkErrors, bulkHandleChange],
  )

  // Memoized bulk naming step props
  const bulkNamingStepProps = useMemo(
    () => ({
      usePrefix,
      setUsePrefix,
      prefix,
      setPrefix,
      rangeStart,
      setRangeStart,
      rangeEnd,
      setRangeEnd,
      errors: bulkErrors,
      previewNames,
      formData: bulkFormData,
      handleChange: bulkHandleChange,
    }),
    [
      usePrefix,
      setUsePrefix,
      prefix,
      setPrefix,
      rangeStart,
      setRangeStart,
      rangeEnd,
      setRangeEnd,
      bulkErrors,
      previewNames,
      bulkFormData,
      bulkHandleChange,
    ],
  )

  // Memoized bulk preview step props
  const bulkPreviewStepProps = useMemo(
    () => ({
      previewNames,
      selectedRoomTypeId: bulkFormData.roomTypeId,
      selectedFloorId: bulkFormData.zoneId,
      selectedStaffIds: bulkFormData.staffIds,
    }),
    [previewNames, bulkFormData.roomTypeId, bulkFormData.zoneId, bulkFormData.staffIds],
  )

  // Render current step content
  const renderStepContent = useCallback(() => {
    if (creationMode === "single") {
      switch (singleStep) {
        case 1:
          return <BasicInfoStep {...singleStepProps} />
        case 2:
          return <StaffSelectionStep {...singleStepProps} />
        case 3:
          return <FloorSelectionStep {...singleStepProps} />
        case 4:
          return <PreviewStep {...singleStepProps} />
        default:
          return null
      }
    }
    if (creationMode === "bulk") {
      // Bulk creation mode
      switch (bulkStep) {
        case 1:
          return <BulkRoomNamingStep {...bulkNamingStepProps} />
        case 2:
          return <StaffSelectionStep {...{ ...bulkStepCommonProps, toggleStaff: bulkToggleStaff }} />
        case 3:
          return <FloorSelectionStep {...bulkStepCommonProps} />
        case 4:
          return <BulkPreviewStep {...bulkPreviewStepProps} />
        default:
          return null
      }
    }
  }, [
    creationMode,
    singleStep,
    bulkStep,
    singleStepProps,
    bulkNamingStepProps,
    bulkStepCommonProps,
    bulkPreviewStepProps,
    bulkToggleStaff,
  ])

  const buttons = useMemo(
    () => [
      {
        text: "",
        onClick: creationMode === "single" ? singleHandleBack : bulkHandleBack,
        isBackButton: true,
        className: "pl-3 rounded-md",
      },
      currentStep < 4
        ? {
          text: "Next",
          onClick: creationMode === "single" ? singleHandleNext : bulkHandleNext,
          className: "rounded-md",
        }
        : {
          text: isLoading ? "Creating..." : creationMode === "single" ? "Create Room" : "Create Bulk Rooms",
          onClick: creationMode === "single" ? singleHandleSubmit : bulkHandleSubmit,
          icon: <Save className="w-4 h-4 mr-2" />,
          className: "rounded-md",
          highlight: true,
          disable: isLoading || (creationMode === "bulk" && previewNames.length === 0),
        },
    ],
    [
      creationMode,
      currentStep,
      isLoading,
      previewNames.length,
      singleHandleBack,
      bulkHandleBack,
      singleHandleNext,
      bulkHandleNext,
      singleHandleSubmit,
      bulkHandleSubmit,
    ],
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="w-full max-w-md p-4 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{creationMode === "single" ? "Create Room" : "Bulk Create Rooms"}</h1>
        <Bed className="w-5 h-5 text-primary" />
      </div>

      <Tabs value={creationMode} onValueChange={handleModeChange} className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>Single Room</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            <span>Bulk Create</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <StepIndicatior currentStep={currentStep} steps={STEPS} />

      <div className="mb-6 hide-scrollbar h-[100dvh] overflow-auto pb-[17rem]">{renderStepContent()}</div>

      <AdvancedBottomButton fixed={true} maxWidth="30rem" buttons={buttons} />
    </div>
  )
}

export default NewRoomCreation

