import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { memo, useCallback } from "react";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import { handleCrop } from "@/components/utils/helper";
import LinkTags from "./[editDish]/linkTags";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import SectionLoader from "@/components/atom/sectionLoader";
import EasyReactCropper from "@/components/cropper/cropper";
import ServiceStepOne from "./serviceStepOne";
import ServiceSepTwo from "./serviceStepTwo";
import LinkItems from "./[editDish]/linkItems";
import PortionStep from "./[editDish]/portionStep";

const MemoCreateService = () => {
  const {
    setOpenMenu,
    setDishStep,
    cropperRef,
    cropping,
    dishStep,
    isLoading,
    setImageFiles,
    setImagePreviews,
    imageFiles,
  } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    setDishStep: s.setDishStep,
    dishStep: s.dishStep,
    cropping: s.cropping,
    cropperRef: s.cropperRef,
    setImageFiles: s.setImageFiles,
    imageFiles: s.imageFiles,
    setImagePreviews: s.setImagePreviews,
    isLoading: s.isLoading,
  }));

  const goBack = useCallback(() => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        setOpenMenu(false);
        break;
      case DishSteps.DISH_STEP_2:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.LINK_CATEGORY_STEP:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.PORTION_STEP:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.LINK_ADD_TAGS:
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      case DishSteps.SHOW_CROPPER:
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      default:
        setOpenMenu(false);
        break;
    }
  }, [setDishStep, setOpenMenu, dishStep]);

  const handleHeader = () => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        return "Create Service";
      case DishSteps.DISH_STEP_2:
        return "Create Service";
      case DishSteps.PORTION_STEP:
        return "Add Varients";
      case DishSteps.LINK_CATEGORY_STEP:
        return "Link Items";
      case DishSteps.LINK_ADD_TAGS:
        return "Add Tags";
      case DishSteps.SHOW_CROPPER:
        return "Crop Image";
      default:
        return "Create Service";
    }
  };

  const handleSaveCropper = () => {
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
      {dishStep === "DISH_STEP_2" && <ServiceSepTwo />}
      {dishStep === "LINK_CATEGORY_STEP" && <LinkItems />}
      {dishStep === "PORTION_STEP" && <PortionStep />}
      {dishStep === "LINK_ADD_TAGS" && <LinkTags />}
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
      {isLoading ? <LoadingSpinner /> : null}
    </>
  );
};

const CreateService = memo(MemoCreateService);
export default CreateService;
