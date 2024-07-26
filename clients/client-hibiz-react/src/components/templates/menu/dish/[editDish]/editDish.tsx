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
  deleteDishData,
  useAddons,
  useChildCategories,
  useDishStore,
} from "@/hooks/useDishStore";
import LinkTags from "./linkTags";
import LinkAddons from "./linkAddons";
import ReactCropper from "@/components/cropper";
import { cn, handleCrop } from "@/components/utils/helper";
import DeleteDish from "./deleteDish";
import { useDishesStore } from "@/components/store/useDishesStore";
import toast from "react-hot-toast";
import useErrorToasts from "@/hooks/useError";
import AlertClosePopup from "@/components/common/alertClosePopup";

const MemoEditDish = () => {
  const { resetDishesStore } = useDishesStore((s) => ({
    resetDishesStore: s.resetDishesStore,
  }));

  const {
    setEditOpenMenu,
    setDishStep,
    cropperRef,
    cropping,
    dishStep,
    setImageFiles,
    setImagePreviews,
    imageFiles,
    showCropper,
    resetStore,
    editDish,
    resetDishStore,
  } = useMenuPageStore((s) => ({
    setEditOpenMenu: s.setEditOpenMenu,
    setDishStep: s.setDishStep,
    dishStep: s.dishStep,
    showCropper: s.showCropper,
    cropping: s.cropping,
    cropperRef: s.cropperRef,
    setImageFiles: s.setImageFiles,
    imageFiles: s.imageFiles,
    setImagePreviews: s.setImagePreviews,
    selectedPage: s.selectedPage,
    resetStore: s.resetStore,
    editDish: s.editDish,
    resetDishStore: s.resetDishStore,
  }));

  const errorToasts = useErrorToasts();

  useChildCategories(dishStep);
  const { refetch } = useDishStore();
  const { data: addons } = useAddons(dishStep);

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
        setEditOpenMenu(false);
        break;
    }
  }, [dishStep]);

  const handleHeader = () => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        return "Edit Dish";
      case DishSteps.PORTION_STEP:
        return "Edit Portions";
      case DishSteps.LINK_CATEGORY_STEP:
        return "Link Category";
      case DishSteps.LINK_ADDON_STEP:
        return "Link Addons";
      case DishSteps.LINK_RECOMMENDATION_STEP:
        return "Recommendations";
      case DishSteps.LINK_ADD_TAGS:
        return "Add Tags";
      default:
        return "Edit Dish";
    }
  };

  const handleDelete = async () => {
    const { data, dishResponse } = await deleteDishData(Object(editDish?._id));
    if (dishResponse?.status === 200) {
      resetStore();
      resetDishesStore();
      resetDishStore();
      refetch();
      toast.success(data?.message);
      setEditOpenMenu(false);
    }
    if (!data?.success) {
      errorToasts(data?.error);
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
      <div
        className={cn({
          "pointer-events-none": showCropper,
        })}
      >
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
        {dishStep === "CONFIRM_DELETE" && (
          <DeleteDish handleDelete={handleDelete} />
        )}
        {dishStep === "ALERT" && <AlertClosePopup />}
      </div>
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
    </>
  );
};

const EditDish = memo(MemoEditDish);
export default EditDish;
