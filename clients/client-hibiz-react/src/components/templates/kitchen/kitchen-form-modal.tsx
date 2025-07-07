import {
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import {
  useCreateKitchen,
  useUpdateKitchen,
  type KitchenData,
  type CreateKitchenPayload,
  type UpdatedKitchenPayload,
} from "@/hooks/useKItchenHook.ts";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, CheckCircle, ChefHat } from "lucide-react";
import PopUp from "@/components/atom/popUp";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton.tsx";
import { useParams } from "react-router-dom";

// Lazy load step components
const StepIndicator = lazy(() => import("./steps/step-indicator"));
const BasicInfoStep = lazy(() => import("./steps/basic-info-step"));
const StaffSelectionStep = lazy(() => import("./steps/staff-selection-step"));
const DishSelectionStep = lazy(() => import("./steps/dish-selection-step"));

interface KitchenFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingKitchen?: KitchenData | null;
}

export default function KitchenFormModal({
  isOpen,
  onClose,
  existingKitchen,
}: KitchenFormModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selectedStaffIds: [] as string[],
    selectedDishIds: [] as string[],
    removeDishIds: [] as string[],
  });
  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();
  const { createKitchen, isPending: isCreating } = useCreateKitchen();
  const { updateKitchen, isPending: isUpdating } = useUpdateKitchen();

  useEffect(() => {
    if (!isOpen) return;
    if (existingKitchen) {
      setFormData({
        name: existingKitchen.name,
        description: existingKitchen.description,
        selectedStaffIds: existingKitchen.staffIds || [],
        selectedDishIds: existingKitchen.dishIds || [],
        removeDishIds: existingKitchen.removeDishIds || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        selectedStaffIds: [],
        selectedDishIds: [],
        removeDishIds: [],
      });
    }
    setStep(1);
  }, [isOpen]);

  const hasName = formData.name.trim().length > 0;

  const validateCurrentStep = useCallback(() => {
    if (step === 1 && !hasName && !existingKitchen) {
      toast.error("Kitchen name is required.");
      return false;
    }

    return true;
  }, [step, hasName, existingKitchen]);

  const handleNextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      return;
    }
    setStep((s) => s + 1);
  }, [validateCurrentStep]);

  const handlePrevStep = useCallback(() => setStep((s) => s - 1), []);

  const goToDirectStep = useCallback(
    (targetStep: number) => {
      if (targetStep > step) {
        if (!validateCurrentStep()) {
          return;
        }
      }
      setStep(targetStep);
    },
    [step, validateCurrentStep],
  );

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error("Kitchen name cannot be empty.");
      return;
    }

    try {
      if (existingKitchen) {
        const payload: UpdatedKitchenPayload = {
          kitchenId: existingKitchen._id,
          name: formData.name,
          description: formData.description,
          staffIds: formData.selectedStaffIds,
          dishIds: formData.selectedDishIds,
          removeDishIds: formData.removeDishIds,
        };
        await updateKitchen(payload);
      } else {
        const payload: CreateKitchenPayload = {
          businessId,
          name: formData.name,
          description: formData.description,
          staffIds: formData.selectedStaffIds,
          dishIds: formData.selectedDishIds,
          menuId,
        };
        await createKitchen(payload);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting kitchen form:", error);
    }
  }, [
    formData,
    existingKitchen,
    updateKitchen,
    createKitchen,
    businessId,
    onClose,
  ]);

  const isPending = isCreating || isUpdating;

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const navigationButtons = useMemo(() => {
    const buttons = [];

    if (existingKitchen) {
      if (step > 1) {
        buttons.push({
          text: "Previous",
          isBackButton: true,
          icon: <ArrowLeft className="mr-2 h-4 w-4" />,
          onClick: handlePrevStep,
          className: "pl-3 rounded-md",
        });
      }
      if (step < 3) {
        buttons.push({
          text: "Next",
          icon: <ArrowRight className="ml-2 h-4 w-4" />,
          onClick: handleNextStep,
          className: "w-full",
        });
      }
      buttons.push({
        text: "Save",
        icon: isPending ? (
          <LoadingSpinner />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        ),
        onClick: handleSubmit,
        disable: isPending,
      });
    } else {
      if (step > 1) {
        buttons.push({
          text: "Previous",
          icon: <ArrowLeft className="mr-2 h-4 w-4" />,
          onClick: handlePrevStep,
        });
      }
      if (step < 3) {
        buttons.push({
          text: "Next",
          icon: <ArrowRight className="ml-2 h-4 w-4" />,
          onClick: handleNextStep,
          className: "w-full",
        });
      } else {
        buttons.push({
          text: "Create Kitchen",
          icon: isPending ? (
            <LoadingSpinner />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          ),
          onClick: handleSubmit,
          disable: isPending,
        });
      }
    }

    return buttons;
  }, [
    step,
    isPending,
    existingKitchen,
    onClose,
    handlePrevStep,
    handleNextStep,
    handleSubmit,
  ]);

  return (
    <PopUp
      height="h-[100dvh] xl:h-[80dvh]"
      onClose={onClose}
      show={isOpen}
      rightTopBack
      hide
    >
      <Card className="w-full mx-auto border-none shadow-none">
        <CardHeader className="pt-8 px-4 md:px-8 pb-0 flex justify-between">
          <section className="flex flex-col gap-4 lg:flex-row w-full items-start justify-between">
            <div className="flex flex-1 items-start md:items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="lg:text-3xl text-base md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {existingKitchen ? "Edit Kitchen" : "Create New Kitchen"}
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {existingKitchen
                    ? "Update your kitchen configuration"
                    : "Set up a new kitchen workspace"}
                </CardDescription>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="h-16 bg-gray-100 rounded animate-pulse" />
              }
            >
              <StepIndicator
                currentStep={step}
                goToDirectStep={goToDirectStep}
              />
            </Suspense>
          </section>
        </CardHeader>

        <CardContent className="px-6 md:px-8 pb-6 min-h-[400px] max-h-[60vh] overflow-y-auto">
          <div className="transition-all duration-300 ease-in-out">
            {step === 1 && (
              <Suspense fallback={<LoadingSpinner />}>
                <BasicInfoStep
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </Suspense>
            )}
            {step === 2 && (
              <Suspense fallback={<LoadingSpinner />}>
                <StaffSelectionStep
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </Suspense>
            )}
            {step === 3 && (
              <Suspense fallback={<LoadingSpinner />}>
                <DishSelectionStep
                  formData={formData}
                  updateFormData={updateFormData}
                  initialKitchenDishIds={existingKitchen?.dishIds}
                />
              </Suspense>
            )}
          </div>
        </CardContent>

        <div className="px-8 pb-8">
          <AdvancedBottomButton
            fixed={true}
            maxWidth="30rem"
            buttons={navigationButtons}
          />
        </div>
      </Card>
    </PopUp>
  );
}
