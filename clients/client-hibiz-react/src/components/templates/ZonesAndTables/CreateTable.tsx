import { lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useZoneStore from "@/components/store/useZone"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useCreateTable, useUpdateTable } from "@/hooks/useZone"
import useBusinessData from "@/components/store/useBusinessData"

const FirstStep = lazy(() => import("./firstStep"))
const SecondStep = lazy(() => import("./secondStep"))
const ThirdStep = lazy(() => import("./ThirdStep"))
const TablePreview = lazy(() => import("./TablePreview"))



const steps = ["Table Details", "Select Zone", "Select Staff", "Confirm"]

export default function CreateTable() {
  const {
    tableName,
    capacity,
    selectZone,
    selectedStaffIds,
    resetAllValues,
    currentStep,
    setCurrentStep,
    editTableId
  } = useZoneStore()

  const { createTable, isPending } = useCreateTable()
  const { updateTable, isPending: updatePending } = useUpdateTable()

  const businessData = useBusinessData(s => s.businessData)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }


  const handleConfirm = async () => {
    const payload = {
      name: tableName,
      capacity: capacity,
      internalZoneId: selectZone?._id || "",
      staffIds: selectedStaffIds,
      businessId: businessData?._id,

    }
    if (editTableId) {
      payload.tableId = editTableId
      await updateTable(payload)
    } else {
      await createTable(payload)
    }
  }




  const isNextDisabled = () => {
    if (currentStep === 0) {
      return !tableName || !capacity
    }
    if (currentStep === 1) {
      return !selectZone
    }
    return false
  }
  if (isPending || updatePending) return <LoadingSpinner />


  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-none">
      <CardHeader >
        <CardTitle className="flex justify-between">
          <span>
            {
              editTableId ? "Edit Table" : "Create Table"
            }
            -
          </span>
          <span>
            Step {currentStep + 1}
          </span>
        </CardTitle>
        <CardDescription>{steps[currentStep]}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<LoadingSpinner />}>
          {currentStep === 0 && <FirstStep />}
          {currentStep === 1 && <SecondStep />}
          {currentStep === 2 && <ThirdStep />}
          {currentStep === 3 && <TablePreview />}
        </Suspense>
      </CardContent>
      <AdvancedBottomButton
        fixed
        maxWidth="30rem"
        buttons={[
          {
            text: currentStep === 0 ? "Close" : "Previous",
            onClick: currentStep === 0 ? resetAllValues : handlePrevious,
            className: "pl-3 rounded-md w-full",
          },
          {
            text: currentStep < steps.length - 1 ? "Next" : "Confirm",
            onClick: currentStep < steps.length - 1 ? handleNext : handleConfirm,
            disable: isNextDisabled(),
            className: "rounded-md w-full"
          }
        ]}
      />

    </Card>
  )
}

