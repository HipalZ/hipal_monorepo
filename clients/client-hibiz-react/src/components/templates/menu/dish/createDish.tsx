import LoadingSpinner from '@/components/atom/loadingSpinner';
import SectionLoader from '@/components/atom/sectionLoader';
import EasyReactCropper from '@/components/cropper/cropper';
import MemoizedHeader from '@/components/molecules/header';
import useMenuPageStore, { DishSteps } from '@/components/store/useMenuStorage';
import { handleCrop } from '@/components/utils/helper';
import { useAddons } from '@/hooks/useDish';
import { memo, useCallback } from 'react';
import LinkAddons from './[editDish]/linkAddons';
import LinkItems from './[editDish]/linkItems';
import LinkTags from './[editDish]/linkTags';
import PortionStep from './[editDish]/portionStep';
import DishStepOne from './dishStepOne';
import DishStepTwo from './dishStepTwo';

const MemoCreateDish = () => {
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const cropperRef = useMenuPageStore((s) => s.cropperRef);
  const cropping = useMenuPageStore((s) => s.cropping);
  const dishStep = useMenuPageStore((s) => s.dishStep);
  const isLoading = useMenuPageStore((s) => s.isLoading);
  const setImageFiles = useMenuPageStore((s) => s.setImageFiles);
  const setImagePreviews = useMenuPageStore((s) => s.setImagePreviews);
  const imageFiles = useMenuPageStore((s) => s.imageFiles);

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
  }, [setDishStep, setOpenMenu, dishStep]);

  const handleHeader = useCallback(() => {
    switch (dishStep) {
      case DishSteps.DISH_STEP_1:
        return 'Create Dish';
      case DishSteps.PORTION_STEP:
        return 'Add Portions';
      case DishSteps.LINK_CATEGORY_STEP:
        return 'Link Category';
      case DishSteps.LINK_ADDON_STEP:
        return 'Link Addons';
      case DishSteps.LINK_RECOMMENDATION_STEP:
        return 'Recommendations';
      case DishSteps.LINK_ADD_TAGS:
        return 'Add Tags';
      case DishSteps.SHOW_CROPPER:
        return 'Crop Image';
      default:
        return 'Create Dish';
    }
  }, [dishStep]);

  const handleSaveCropper = () => {
    handleCrop(cropping, cropperRef, imageFiles, setImageFiles, setImagePreviews, setDishStep);
  };

  return (
    <>
      <header className="bg-base-100 sticky top-0 z-10 w-full rounded-t-2xl">
        <MemoizedHeader title={handleHeader()} onBack={goBack} />
      </header>
      {dishStep === 'DISH_STEP_1' && <DishStepOne />}
      {dishStep === 'DISH_STEP_2' && <DishStepTwo />}
      {dishStep === 'PORTION_STEP' && <PortionStep />}
      {dishStep === 'LINK_CATEGORY_STEP' && <LinkItems />}
      {dishStep === 'LINK_RECOMMENDATION_STEP' && <LinkItems />}
      {dishStep === 'LINK_ADD_TAGS' && <LinkTags />}
      {dishStep === 'LINK_ADDON_STEP' && <LinkAddons data={addons || []} />}
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
      {isLoading ? <LoadingSpinner /> : null}
    </>
  );
};

const CreateDish = memo(MemoCreateDish);
export default CreateDish;
