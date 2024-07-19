import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import DishStepOne from "./dishStepOne";
import { memo, useCallback } from "react";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import DishStepTwo from "./dishStepTwo";
import PortionStep from "./portionStep";
import LinkItems from "./linkItems";
import {
  useAddons,
  useChildCategories,
  useDishStore,
} from "@/hooks/useDishStore";
import LinkTags from "./linkTags";
import LinkAddons from "./linkAddons";
import MiddlePopUp from "@/components/atom/middlePopUp";
import ReactCropper from "@/components/cropper";
import { handleCrop } from "@/components/utils/helper";

const MemoCreateDish = () => {
  const {
    setOpenMenu,
    setDishStep,
    cropperRef,
    cropping,
    dishStep,
    setShowCropper,
    setImageFiles,
    setImagePreviews,
    imageFiles,
    showCropper,
  } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    setDishStep: s.setDishStep,
    dishStep: s.dishStep,
    setShowCropper: s.setShowCropper,
    showCropper: s.showCropper,
    cropping: s.cropping,
    cropperRef: s.cropperRef,
    setImageFiles: s.setImageFiles,
    imageFiles: s.imageFiles,
    setImagePreviews: s.setImagePreviews,
  }));

  const { data: categories } = useChildCategories(dishStep);
  const { data: dishes } = useDishStore(dishStep);
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
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      case DishSteps.LINK_RECOMMENDATION_STEP:
        setDishStep(DishSteps.DISH_STEP_2);
        break;
      case DishSteps.LINK_ADD_TAGS:
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
      default:
        return "Create Dish";
    }
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
      {dishStep === "LINK_CATEGORY_STEP" && (
        <LinkItems categoryData={categories || []} />
      )}
      {dishStep === "LINK_RECOMMENDATION_STEP" && (
        <LinkItems dishesData={dishes || []} />
      )}
      {dishStep === "LINK_ADD_TAGS" && <LinkTags />}
      {dishStep === "LINK_ADDON_STEP" && <LinkAddons data={addons || []} />}
      <MiddlePopUp
        show={showCropper}
        onSave={() =>
          handleCrop(
            cropping,
            cropperRef,
            imageFiles,
            setImageFiles,
            setImagePreviews,
            setShowCropper,
          )
        }
        onClose={() => {
          setShowCropper(false);
        }}
      >
        <ReactCropper
          image={cropping.image}
          ref={cropperRef}
          width={400}
          height={400}
        />
      </MiddlePopUp>
    </>
  );
};

const CreateDish = memo(MemoCreateDish);
export default CreateDish;
