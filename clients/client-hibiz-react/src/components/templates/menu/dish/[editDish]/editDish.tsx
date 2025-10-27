import Hi from '@/assets/svg/hi.svg';
import SectionLoader from '@/components/atom/sectionLoader';
import AlertClosePopup from '@/components/common/alertClosePopup';
import EasyReactCropper from '@/components/cropper/cropper';
import MemoizedHeader from '@/components/molecules/header';
import { useDishesStore } from '@/components/store/useDishesStore';
import useMenuPageStore, { DishSteps } from '@/components/store/useMenuStorage';
import { cn, handleCrop } from '@/components/utils/helper';
import { deleteDishData, useAddons, useChildCategories, useDishes } from '@/hooks/useDish';
import useErrorToasts from '@/hooks/useError';
import { memo, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';
import DeleteDish from './deleteDish';
import DishStepOne from './dishStepOne';
import DishStepTwo from './dishStepTwo';
import LinkAddons from './linkAddons';
import LinkItems from './linkItems';
import LinkTags from './linkTags';
import PortionStep from './portionStep';

import type { Area } from 'react-easy-crop';
interface CropperRef {
  getCroppedAreaPixels: () => Area | null;
}

const MemoEditDish = () => {
  const { resetDishesStore } = useDishesStore((s) => ({
    resetDishesStore: s.resetDishesStore,
  }));

  const cropperRef = useRef<CropperRef>(null);

  const setEditOpenMenu = useMenuPageStore((s) => s.setEditOpenMenu);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const cropping = useMenuPageStore((s) => s.cropping);
  const setImageFiles = useMenuPageStore((s) => s.setImageFiles);
  const imageFiles = useMenuPageStore((s) => s.imageFiles);
  const setImagePreviews = useMenuPageStore((s) => s.setImagePreviews);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const editDish = useMenuPageStore((s) => s.editDish);
  const resetDishStore = useMenuPageStore((s) => s.resetDishStore);
  const isLoading = useMenuPageStore((s) => s.isLoading);
  const dishStep = useMenuPageStore((s) => s.dishStep);
  const showCropper = useMenuPageStore((s) => s.showCropper);

  const errorToasts = useErrorToasts();

  useChildCategories(dishStep);
  const { refetch } = useDishes();
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
        setDishStep(DishSteps.DISH_STEP_1);
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
        return `${editDish?.name}`;
      case DishSteps.PORTION_STEP:
        return `${editDish?.name}'s Portions`;
      case DishSteps.LINK_CATEGORY_STEP:
        return `${editDish?.name}'s Categories`;
      case DishSteps.LINK_ADDON_STEP:
        return `${editDish?.name}'s Addons`;
      case DishSteps.LINK_RECOMMENDATION_STEP:
        return `${editDish?.name}`;
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
      toast.success(data?.message);
      setEditOpenMenu(false);
    }
    if (!data?.success) {
      errorToasts(data?.error);
    }
  };

  const handleSaveCropper = () => {
    handleCrop(cropping, cropperRef, imageFiles, setImageFiles, setImagePreviews, setDishStep);
  };

  return (
    <>
      <div
        className={cn({
          'pointer-events-none': showCropper,
        })}
      >
        <header className="bg-base-100 sticky top-0 z-10 w-full rounded-t-2xl">
          <MemoizedHeader title={handleHeader()} onBack={goBack} leftIcon={<FaArrowLeft />} rightImage={Hi} isIconBusinessShow={false} />
        </header>
        {dishStep === 'DISH_STEP_1' && <DishStepOne />}
        {dishStep === 'DISH_STEP_2' && <DishStepTwo />}
        {dishStep === 'PORTION_STEP' && <PortionStep />}
        {dishStep === 'LINK_CATEGORY_STEP' && <LinkItems />}
        {dishStep === 'LINK_RECOMMENDATION_STEP' && <LinkItems />}
        {dishStep === 'LINK_ADD_TAGS' && <LinkTags />}
        {dishStep === 'LINK_ADDON_STEP' && <LinkAddons data={addons || []} />}
        {dishStep === 'CONFIRM_DELETE' && <DeleteDish handleDelete={handleDelete} />}
        {dishStep === 'ALERT' && <AlertClosePopup />}
      </div>
      {dishStep === 'SHOW_CROPPER' && (
        <>
          <EasyReactCropper image={cropping.image} ref={cropperRef} width={400} height={400} />
          <footer className="absolute bottom-4 mx-4 flex w-[92%] gap-4 lg:w-[96%]">
            <button type="button" onClick={handleSaveCropper} className="w-full rounded-full bg-[#7D68FE] py-3 text-white" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <SectionLoader />
                  Loading...
                </div>
              ) : (
                'Save'
              )}
            </button>
          </footer>
        </>
      )}
    </>
  );
};

const EditDish = memo(MemoEditDish);
export default EditDish;
