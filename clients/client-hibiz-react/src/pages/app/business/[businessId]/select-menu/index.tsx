import { memo, lazy, Suspense, useCallback, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaThList,
  FaCopy,
} from "react-icons/fa";
import { CategoryData } from "@/configs/test";
import MemoizedHeader from "@/components/molecules/header";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import {
  type Dish,
  useMenuCreationStore,
  type MenuLayout,
} from "@/components/store/useMenuCreationStore";
import NavigationButtons from "@/components/menu-creation/navigation-buttons";
import { useNavigate, useParams } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";
import StepIndicatior from "@/components/hotel/HotelStaff/StepIndicatior";
import {
  type CreateMenuLayoutPayload,
  useCreateMenuLayout,
  useGetAllLayouts,
  useUpdateMenuLayout,
} from "@/hooks/useMenuLayout";
import { Button } from "@/components/ui/button";
import {
  formatMinutesToTime,
  getDayNames,
  STEPS,
} from "@/components/utils/helper";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Boxes, ShieldCheck, ShieldMinus } from "lucide-react";
import ZoneAvailabilitySummary from "@/components/menu-creation/zone-availability-summary";

// Import new modal components
import CopyLayoutModal from "@/components/menu-creation/copy-layout-modal";
import { useGetAllZones } from "@/hooks/useZone";

// Lazy load step components for better performance
const Step1MenuType = lazy(
  () => import("@/components/menu-creation/step1-menu-type"),
);
const Step2CategoryLayout = lazy(
  () => import("@/components/menu-creation/step2-category-layout"),
);
const Step3DishLayout = lazy(
  () => import("@/components/menu-creation/step3-dish-layout"),
);
const Step4ColorSelection = lazy(
  () => import("@/components/menu-creation/step4-color-selection"),
);
const Step5Summary = lazy(
  () => import("@/components/menu-creation/step5-summary"),
);
const Step6ZoneSelection = lazy(
  () => import("@/components/menu-creation/step6-zone-selection"),
);
const Step7DaySelection = lazy(
  () => import("@/components/menu-creation/step7-day-selection"),
);
const Step8TimeSelection = lazy(
  () => import("@/components/menu-creation/step8-time-selection"),
);

const MemoSelectMenu = () => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { businessId } = useParams<{ businessId: string }>();
  const { isLoading, allMenuLayouts, refetch } = useGetAllLayouts(
    businessId as string,
  );
  const { updatetingMenuLoader, updateMenuLayout } = useUpdateMenuLayout();
  const { createMenuLoader, createMenuLayout } = useCreateMenuLayout();
  const { data: zones, isLoading: zonesLoading } = useGetAllZones(
    businessId as string,
  );

  const {
    currentStep,
    resetStore,
    setCurrentStep,
    canProceed,
    editingMenuId,
    setMenuData,
    showCreationFlow,
    name: layoutName,
    setShowCreationFlow,
    setCopyMenuLayoutId,
    setSourceMenuName,
  } = useMenuCreationStore((state) => ({
    currentStep: state.currentStep,
    resetStore: state.resetStore,
    editingMenuId: state.editingMenuId,
    setMenuData: state.setMenuData,
    showCreationFlow: state.showCreationFlow,
    setShowCreationFlow: state.setShowCreationFlow,
    setCurrentStep: state.setCurrentStep,
    canProceed: state.canProceed,
    name: state.name,
    setCopyMenuLayoutId: state.setCopyMenuLayoutId,
    setSourceMenuName: state.setSourceMenuName,
    setCopyCompleteMenu: state.setCopyCompleteMenu,
    copyMenuLayoutId: state.copyMenuLayoutId,
    sourceMenuName: state.sourceMenuName,
  }));
  const navigate = useNavigate();

  // State for modals
  const [showCopyLayoutModal, setShowCopyLayoutModal] = useState(false);

  // Get sample dishes for previews
  const sampleDishes = useMemo(() => {
    return CategoryData.reduce((dishes, category) => {
      if (category?.dishIds?.length) {
        dishes.push(...category.dishIds);
      }
      return dishes;
    }, [] as Dish[]);
  }, []);

  const handleBack = useCallback(() => {
    if (showCreationFlow) {
      setShowCreationFlow(false);
      resetStore();
      return;
    }
    return navigate(`/app/business/${businessId}`);
  }, [businessId, navigate, resetStore, setShowCreationFlow, showCreationFlow]);

  const handleComplete = useCallback(
    async (payload: CreateMenuLayoutPayload) => {
      try {
        if (editingMenuId) {
          const updatePayload = {
            menuId: editingMenuId,
            ...payload,
          };
          await updateMenuLayout(updatePayload);
        } else {
          await createMenuLayout(payload);
        }
        refetch();
      } catch (error) {
        console.error("Failed to save menu:", error);
      }
    },
    [createMenuLayout, editingMenuId, updateMenuLayout, refetch],
  );

  const activeOrDeactive = useCallback(
    async (menuId: string | undefined, businessId: string) => {
      if (!menuId) return;

      const currentMenuLayout = allMenuLayouts?.data?.find(
        (menu) => menu._id === menuId,
      );
      if (!currentMenuLayout) return;

      if (
        confirm(
          `Are you sure you want to ${
            currentMenuLayout.isActive ? "deactivate" : "activate"
          } this ${currentMenuLayout.name} layout?`,
        )
      ) {
        await updateMenuLayout({
          menuId,
          isActive: !currentMenuLayout.isActive,
          businessId,
        });
        // Refresh data after activation/deactivation
        refetch();
        toast.success(
          `Menu layout ${
            currentMenuLayout.isActive ? "deactivated" : "activated"
          } successfully`,
        );
      }
    },
    [allMenuLayouts?.data, updateMenuLayout, refetch],
  );

  const handleCreateNew = useCallback(() => {
    resetStore();
    setShowCreationFlow(true);
  }, [resetStore, setShowCreationFlow]);

  const handleStepClick = useCallback(
    (stepId: number) => {
      if (stepId === currentStep) return;

      if (stepId > currentStep) {
        for (let i = currentStep; i < stepId; i++) {
          if (!canProceed()) {
            toast.error(
              `Please complete step ${i} before proceeding to step ${stepId}`,
            );
            return;
          }
          setCurrentStep(i + 1);
        }
        setCurrentStep(stepId);
      } else {
        setCurrentStep(stepId);
      }
    },
    [canProceed, currentStep, setCurrentStep],
  );

  const handleEditLayout = useCallback(
    (layout: MenuLayout) => {
      resetStore();
      setMenuData(layout);
      setShowCreationFlow(true);
    },
    [resetStore, setMenuData, setShowCreationFlow],
  );

  // Handle selecting a layout to copy
  const handleCopyLayoutSelect = useCallback(
    (layoutId: string) => {
      // Find the selected layout
      const selectedLayout = allMenuLayouts?.data?.find(
        (layout) => layout._id === layoutId,
      );
      if (!selectedLayout) return;

      resetStore();

      setCopyMenuLayoutId(layoutId);
      setSourceMenuName(selectedLayout.name);

      setMenuData({
        ...selectedLayout,
        _id: "",
        name: `Copy of ${selectedLayout.name}`,
        zoneIds: [],
        days: [1, 2, 3, 4, 5, 6, 7],
      });

      setShowCreationFlow(true);
      setCurrentStep(5);
    },
    [
      allMenuLayouts?.data,
      resetStore,
      setCopyMenuLayoutId,
      setCurrentStep,
      setMenuData,
      setShowCreationFlow,
      setSourceMenuName,
    ],
  );

  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return <Step1MenuType />;
      case 2:
        return <Step2CategoryLayout categories={CategoryData} />;
      case 3:
        return <Step3DishLayout sampleDishes={sampleDishes} />;
      case 4:
        return (
          <Step4ColorSelection
            sampleCategories={CategoryData}
            sampleDishes={sampleDishes}
          />
        );
      case 5:
        return <Step6ZoneSelection />;
      case 6:
        return <Step7DaySelection />;
      case 7:
        return <Step8TimeSelection />;
      case 8:
        return <Step5Summary />;
      default:
        return <div>Unknown step</div>;
    }
  }, [currentStep, sampleDishes]);

  const goToEditMenu = useCallback(
    (menuId: string) => {
      navigate(`${menuId}`);
    },
    [navigate, businessId],
  );

  const getZoneDetails = useCallback(
    (zoneId: string) => {
      const zone = zones?.find((zone) => zone._id === zoneId);
      return zone || { _id: zoneId, name: `Zone ${zoneId.substring(0, 4)}` };
    },
    [zones],
  );

  if (isLoading || zonesLoading || createMenuLoader || updatetingMenuLoader) {
    return <LoadingSpinner />;
  }

  if (showCreationFlow || !allMenuLayouts || allMenuLayouts.data.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="sticky top-0 !z-[1000] w-full linear_gradient_background">
          <MemoizedHeader
            title={
              editingMenuId ? `Editing ${layoutName}` : "Create Menu Layout"
            }
            leftIcon={<FaArrowLeft />}
            onBack={handleBack}
          />
        </div>

        <div className="container max-w-4xl px-4 py-6 mx-auto">
          <StepIndicatior
            currentStep={currentStep}
            steps={STEPS}
            onStepClick={handleStepClick}
          />

          <div className="mt-6 overflow-hidden bg-white border border-gray-100 rounded-lg shadow-sm">
            <Suspense
              fallback={
                <div className="flex justify-center p-8">
                  <LoadingSpinner />
                </div>
              }
            >
              {renderStep()}
            </Suspense>
          </div>

          <NavigationButtons
            onComplete={handleComplete}
            isLoading={editingMenuId ? updatetingMenuLoader : createMenuLoader}
            isEditing={!!editingMenuId}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-[10rem]">
      <div className="sticky top-0 !z-[1000] w-full linear_gradient_background">
        <MemoizedHeader
          title="Menu Layouts"
          leftIcon={<FaArrowLeft />}
          onBack={handleBack}
        />
      </div>

      <CopyLayoutModal
        isOpen={showCopyLayoutModal}
        onClose={() => setShowCopyLayoutModal(false)}
        onSelect={handleCopyLayoutSelect}
      />

      <div className="px-4 py-6 mx-auto">
        {zones && allMenuLayouts?.data && (
          <ZoneAvailabilitySummary
            menuLayouts={allMenuLayouts.data}
            zones={zones}
          />
        )}

        <h2 className="pb-4 text-xl font-semibold">Your Menu Layouts</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {allMenuLayouts?.data?.map((layout) => {
            // Generate a gradient based on the layout's primary color or use a default
            const primaryColor = layout?.primaryColor || "#ec4899";
            const isActive = layout?.isActive;

            return (
              <div
                key={layout._id}
                className={cn(
                  "relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl",
                  "border border-gray-100",
                  "transform hover:-translate-y-1 cursor-pointer",
                  !isActive && "opacity-75 grayscale",
                )}
                style={{
                  background: `linear-gradient(90deg, ${primaryColor}40, ${primaryColor}10)`,
                }}
                onClick={() => goToEditMenu(layout._id)}
              >
                {/* Status indicator */}
                <div className="absolute scale-125 top-4 right-4">
                  <div
                    className={cn(
                      "flex items-center px-2 py-1 text-xs font-medium rounded-full",
                      isActive
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-100 text-gray-800",
                    )}
                  >
                    <span
                      className={cn(
                        "w-2 h-2 mr-1 rounded-full",
                        isActive ? "bg-green-500" : "bg-gray-500",
                      )}
                    />
                    {isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start mb-4">
                    {/* 3D Icon based on menu type */}
                    <div
                      className="flex items-center justify-center w-12 h-12 mr-4 rounded-lg shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                        transform:
                          "perspective(500px) rotateY(-15deg) rotateX(10deg)",
                        boxShadow: `0 10px 15px -3px ${primaryColor}20, 0 4px 6px -4px ${primaryColor}40`,
                      }}
                    >
                      {layout?.menuType === 1 ? (
                        <FaLayerGroup className="text-xl text-white" />
                      ) : (
                        <FaThList className="text-xl text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className="text-xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        {layout?.name || "Unnamed Menu"}
                      </h3>
                      <p className="text-sm font-semibold text-gray-600">
                        {layout?.menuType === 1
                          ? "Main → Sub → Dishes"
                          : "Sub → Dishes"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {layout?.zoneIds?.map((zoneId) => {
                      const zone = getZoneDetails(zoneId);
                      return (
                        <div
                          key={zoneId}
                          className="flex items-center p-2 rounded-lg bg-gray-50"
                        >
                          <div
                            className="flex items-center justify-center w-8 h-8 mr-3 rounded-full"
                            style={{
                              background: `${primaryColor}20`,
                              color: primaryColor,
                            }}
                          >
                            <FaMapMarkerAlt />
                          </div>
                          <span className="font-medium text-gray-700">
                            {zone?.name || "Unknown zone"}
                          </span>
                        </div>
                      );
                    })}

                    <div className="flex items-center p-2 rounded-lg bg-gray-50">
                      <div
                        className="flex items-center justify-center w-8 h-8 mr-3 rounded-full"
                        style={{
                          background: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                      >
                        <FaCalendarAlt />
                      </div>
                      <span className="font-medium text-gray-700">
                        {layout?.days
                          ? getDayNames(layout.days)
                          : "No days selected"}
                      </span>
                    </div>

                    <div className="flex items-center p-2 rounded-lg bg-gray-50">
                      <div
                        className="flex items-center justify-center w-8 h-8 mr-3 rounded-full"
                        style={{
                          background: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                      >
                        <FaClock />
                      </div>
                      <span className="font-medium text-gray-700">
                        {layout?.startTime !== undefined &&
                        layout?.endTime !== undefined
                          ? `${formatMinutesToTime(
                              layout.startTime,
                            )} - ${formatMinutesToTime(layout.endTime)}`
                          : "No time set"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    {!outletInfo?.isPosEnabled ? (
                      <Button
                        variant="default"
                        className="transition-transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToEditMenu(layout._id);
                        }}
                      >
                        <Boxes className="w-4 h-4 mr-2" />
                        Go to Menu
                      </Button>
                    ) : null}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        layout?._id &&
                          activeOrDeactive(layout._id, businessId as string);
                      }}
                      variant={layout?.isActive ? "destructive" : "default"}
                      className="transition-transform hover:scale-105"
                    >
                      {layout?.isActive ? (
                        <ShieldMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 mr-2" />
                      )}
                      {layout?.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        layout?._id && handleEditLayout(layout);
                      }}
                      variant="default"
                      className="transition-transform hover:scale-105"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {outletInfo?.isPosEnabled ? null : (
        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: "Copy Existing Layout",
              icon: <FaCopy />,
              onClick: () => setShowCopyLayoutModal(true),
              className: "pl-3 rounded-md w-full",
              disable: isLoading,
            },
            {
              text: "Create New Menu Layout",
              icon: <FaPlus />,
              onClick: handleCreateNew,
              className: "pl-3 rounded-md w-full",
              disable: isLoading,
            },
          ]}
        />
      )}
    </main>
  );
};

// Use React.memo for better performance
const SelectMenu = memo(MemoSelectMenu);
export default SelectMenu;
