import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { memo, useCallback, useRef } from "react";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import LinkItems from "./linkItems";
import { deleteDishData, useChildCategories, useDishes } from "@/hooks/useDish";
import { cn, handleCrop } from "@/components/utils/helper";
import DeleteDish from "./deleteDish";
import { useDishesStore } from "@/components/store/useDishesStore";
import toast from "react-hot-toast";
import useErrorToasts from "@/hooks/useError";
import AlertClosePopup from "@/components/common/alertClosePopup";
import SectionLoader from "@/components/atom/sectionLoader";
import EasyReactCropper from "@/components/cropper/cropper";

import type { Area } from "react-easy-crop";
import ServiceStepOne from "./serviceStepOne";
import ServiceStepTwo from "./serviceStepTwo";
import LinkTags from "./linkTags";
import PortionStep from "./portionStep";
interface CropperRef {
  getCroppedAreaPixels: () => Area | null;
}

const MemoEditService = () => {
  const { resetDishesStore } = useDishesStore((s) => ({
    resetDishesStore: s.resetDishesStore,
  }));

  const cropperRef = useRef<CropperRef>(null);

  const {
    setEditOpenMenu,
    setDishStep,
    cropping,
    dishStep,
    setImageFiles,
    setImagePreviews,
    imageFiles,
    showCropper,
    resetStore,
    editDish,
    isLoading,
    resetDishStore,
  } = useMenuPageStore((s) => ({
    setEditOpenMenu: s.setEditOpenMenu,
    setDishStep: s.setDishStep,
    dishStep: s.dishStep,
    showCropper: s.showCropper,
    cropping: s.cropping,
    setImageFiles: s.setImageFiles,
    imageFiles: s.imageFiles,
    setImagePreviews: s.setImagePreviews,
    selectedPage: s.selectedPage,
    resetStore: s.resetStore,
    editDish: s.editDish,
    resetDishStore: s.resetDishStore,
    isLoading: s.isLoading,
  }));

  const errorToasts = useErrorToasts();

  useChildCategories(dishStep);
  const { refetch } = useDishes();

  const goBack = useCallback(() => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        setEditOpenMenu(false);
        break;
      case DishSteps.DISH_STEP_2:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.PORTION_STEP:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.LINK_CATEGORY_STEP:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.LINK_ADD_TAGS:
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      default:
        setEditOpenMenu(false);
        break;
    }
  }, [dishStep]);

  const handleHeader = () => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        return `${editDish?.name}`;
      case DishSteps.PORTION_STEP:
        return `${editDish?.name}'s Portions`;

      case DishSteps.LINK_CATEGORY_STEP:
        return "Link Items";
      case DishSteps.LINK_ADD_TAGS:
        return `${editDish?.name}'s Tags`;

      default:
        return `${editDish?.name}`;
    }
  };

  const handleDelete = async () => {
    const { data, dishResponse } = await deleteDishData(Object(editDish?._id));
    if (dishResponse?.status === 200) {
      resetStore();
      resetDishesStore();
      resetDishStore();
      refetch();
      toast.success("Deleted successfully");
      setEditOpenMenu(false);
    }
    if (!data?.success) {
      errorToasts(data?.error);
    }
  };

  const handleSaveCropper = () => {
    console.log("handleSaveCropper");
    handleCrop(
      cropping,
      cropperRef,
      imageFiles,
      setImageFiles,
      setImagePreviews,
      setDishStep,
    );
  };

  return (
    <>
      <div
        className={cn({
          "pointer-events-none": showCropper,
        })}
      >
        <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
          <MemoizedHeader
            title={handleHeader()}
            onBack={goBack}
            leftIcon={<FaArrowLeft />}
            rightImage={Hi}
            isIconBusinessShow={false}
          />
        </header>
        {dishStep === "DISH_STEP_1" && <ServiceStepOne />}
        {dishStep === "DISH_STEP_2" && <ServiceStepTwo />}
        {dishStep === "LINK_CATEGORY_STEP" && <LinkItems />}
        {dishStep === "LINK_ADD_TAGS" && <LinkTags />}
        {dishStep === "PORTION_STEP" && <PortionStep />}
        {dishStep === "CONFIRM_DELETE" && (
          <DeleteDish handleDelete={handleDelete} />
        )}
        {dishStep === "ALERT" && <AlertClosePopup />}
      </div>
      {dishStep === "SHOW_CROPPER" && (
        <>
          <EasyReactCropper
            image={cropping.image}
            ref={cropperRef}
            width={400}
            height={400}
          />
          <footer className="absolute bottom-4 flex w-[92%] lg:w-[96%] gap-4 mx-4">
            <button
              type="button"
              onClick={handleSaveCropper}
              className="w-full py-3 text-white rounded-full bg-[#7D68FE]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <SectionLoader />
                  Loading...
                </div>
              ) : (
                "Save"
              )}
            </button>
          </footer>
        </>
      )}
    </>
  );
};

const EditService = memo(MemoEditService);
export default EditService;
