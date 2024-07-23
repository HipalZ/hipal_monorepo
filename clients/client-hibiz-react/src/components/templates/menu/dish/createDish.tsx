import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import DishStepOne from "./dishStepOne";
import { memo, useCallback } from "react";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import DishStepTwo from "./dishStepTwo";
import { useAddons } from "@/hooks/useDishStore";
import ReactCropper from "@/components/cropper";
import { handleCrop } from "@/components/utils/helper";
import LinkItems from "./[editDish]/linkItems";
import LinkTags from "./[editDish]/linkTags";
import LinkAddons from "./[editDish]/linkAddons";
import PortionStep from "./[editDish]/portionStep";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const MemoCreateDish = () => {
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

  const { data: addons } = useAddons(dishStep);

  const goBack = useCallback(() => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        setOpenMenu(false);
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
      case DishSteps.LINK_ADDON_STEP:
        setDishStep(DishSteps.DISH_STEP_1);
        break;
      case DishSteps.LINK_RECOMMENDATION_STEP:
        setDishStep(DishSteps.DISH_STEP_2);
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
  }, [dishStep]);

  const handleHeader = () => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        return "Create Dish";
      case DishSteps.PORTION_STEP:
        return "Add Portions";
      case DishSteps.LINK_CATEGORY_STEP:
        return "Link Category";
      case DishSteps.LINK_ADDON_STEP:
        return "Link Addons";
      case DishSteps.LINK_RECOMMENDATION_STEP:
        return "Recommendations";
      case DishSteps.LINK_ADD_TAGS:
        return "Add Tags";
      case DishSteps.SHOW_CROPPER:
        return "Crop Image";
      default:
        return "Create Dish";
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
      <MemoizedHeader
        title={handleHeader()}
        onBack={goBack}
        leftIcon={<FaArrowLeft />}
        centerImage={Hi}
        rightImage={Hi}
        isIconBusinessShow={false}
      />
      {dishStep === "DISH_STEP_1" && <DishStepOne />}
      {dishStep === "DISH_STEP_2" && <DishStepTwo />}
      {dishStep === "PORTION_STEP" && <PortionStep />}
      {dishStep === "LINK_CATEGORY_STEP" && <LinkItems />}
      {dishStep === "LINK_RECOMMENDATION_STEP" && <LinkItems />}
      {dishStep === "LINK_ADD_TAGS" && <LinkTags />}
      {dishStep === "LINK_ADDON_STEP" && <LinkAddons data={addons || []} />}
      {dishStep === "SHOW_CROPPER" && (
        <section>
          <ReactCropper
            image={cropping.image}
            ref={cropperRef}
            width={400}
            height={400}
          />
          <center
            role="button"
            tabIndex={0}
            onClick={handleSaveCropper}
            onKeyUp={handleSaveCropper}
            className="px-4 py-2 mx-4 mt-4 text-white bg-black rounded-full"
          >
            Save
          </center>
        </section>
      )}
      {isLoading ? <LoadingSpinner /> : null}
    </>
  );
};

const CreateDish = memo(MemoCreateDish);
export default CreateDish;
