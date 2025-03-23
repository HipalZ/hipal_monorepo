import { lazy, Suspense, useMemo } from "react"
import { User, UserPlus } from "lucide-react"
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton"
import LoadingSpinner from "@/components/atom/loadingSpinner"
import { useStepNavigation } from "@/hooks/useStepNavigation"
import { useStaffSubmission } from "@/hooks/useStaffSubmission"

const FirstStep = lazy(() => import("./FirstStep"))
const SecondStep = lazy(() => import("./SecondStep"))
const ThirdStep = lazy(() => import("./ThirdStep"))
const ForthStep = lazy(() => import("./ForthStep"))
const StepIndicatior = lazy(() => import("./StepIndicatior"))

const steps = [
    { id: 1, label: "Info" },
    { id: 2, label: "Role" },
    { id: 3, label: "Services" },
    { id: 4, label: "Preview" },
]

const AddStaffToHotel = () => {
    const { currentStep, handleNext, handleBack } = useStepNavigation()
    const { isSubmitting, handleSubmit, addStaffLoader,updateStaffLoader,isEditMode } = useStaffSubmission()

    const buttons = useMemo(
        () => [
            {
                text: "",
                onClick: handleBack,
                isBackButton: true,
                className: "pl-3 rounded-md",
            },
            currentStep < 4
                ? {
                    text: "Next",
                    onClick: handleNext,
                    className: "rounded-md w-full",
                }
                : {
                    text: isEditMode ? "Update Staff" : "Add Staff",
                    onClick: handleSubmit,
                    icon: <User className="w-4 h-4 ml-2" />,
                    className: "rounded-md w-full",
                    highlight: true,
                    disable: isSubmitting,
                },
        ],
        [currentStep, handleBack, handleNext, handleSubmit, isSubmitting,isEditMode],
    )

    if (addStaffLoader || updateStaffLoader) {
        return <LoadingSpinner />
    }

    return (
        <div className="w-full max-w-md p-4 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Add New Staff</h1>
                <div className="flex items-center space-x-1">
                    <UserPlus className="w-5 h-5 text-primary" />
                </div>
            </div>

            <StepIndicatior currentStep={currentStep} steps={steps} />

            {/* Step content */}
            <div className="mb-6 h-[80dvh] overflow-auto pb-[10rem] hide-scrollbar">
                <Suspense fallback={<LoadingSpinner />}>

                    {
                        currentStep === 1 && (
                            <FirstStep />
                        )
                    }
                    {
                        currentStep === 2 && (
                            <SecondStep />
                        )
                    }
                    {
                        currentStep === 3 && (
                            <ThirdStep />
                        )
                    }
                    {
                        currentStep === 4 && (
                            <ForthStep />
                        )
                    }
                </Suspense>
            </div>

            <AdvancedBottomButton fixed={true} maxWidth="30rem" buttons={buttons} />
        </div>
    )
}

export default AddStaffToHotel

