import Background from '@/components/atom/feildBackground';
import useMenuPageStore, { DishSteps } from '@/components/store/useMenuStorage';
import { compressImage, filterPayload, storeImageAfterSave } from '@/components/utils/helper';
import { postDishData } from '@/hooks/useDish';
import useErrorToasts from '@/hooks/useError';
import type { DishType } from '@hi/db-models/src/validators';
import { useQueryClient } from '@tanstack/react-query';
import { type ChangeEvent, memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RiLinkUnlink } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../../../atom/bottomButton/advancedBottomButton';
import DishImages from './[editDish]/dishImages';

const MemoDishFormTwo = () => {
  const { businessId, menuId } = useParams<{ businessId?: string; menuId: string }>();

  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const dishStep = useMenuPageStore((s) => s.dishStep);
  const dishDescription = useMenuPageStore((s) => s.dishDescription);
  const setDishDescription = useMenuPageStore((s) => s.setDishDescription);
  const calories = useMenuPageStore((s) => s.calories);
  const setCalories = useMenuPageStore((s) => s.setCalories);
  const tags = useMenuPageStore((s) => s.tags);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const dishName = useMenuPageStore((s) => s.dishName);
  const dishPrice = useMenuPageStore((s) => s.dishPrice);
  const visibility = useMenuPageStore((s) => s.visibility);
  const dishTypes = useMenuPageStore((s) => s.dishTypes);
  const availability = useMenuPageStore((s) => s.availability);
  const portions = useMenuPageStore((s) => s.portions);
  const selectedCatIds = useMenuPageStore((s) => s.selectedCatIds);
  const addonIds = useMenuPageStore((s) => s.addonIds);
  const imageFiles = useMenuPageStore((s) => s.imageFiles);
  const imagePreviews = useMenuPageStore((s) => s.imagePreviews);
  const setCropping = useMenuPageStore((s) => s.setCropping);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const resetDishStore = useMenuPageStore((s) => s.resetDishStore);
  const isLoading = useMenuPageStore((s) => s.isLoading);
  const setIsLoading = useMenuPageStore((s) => s.setIsLoading);

  const queryClient = useQueryClient();

  const errorToasts = useErrorToasts();

  const handleAddDish = async () => {
    if (dishTypes.length === 0 || dishName.length === 0 || dishPrice === 0) {
      return toast.error('Please fill all the required fields');
    }
    setIsLoading(true);
    let firstImage: string | undefined;
    let secondImage: string | undefined;
    let thirdImage: string | undefined;

    if (imagePreviews?.first !== '') {
      firstImage = await storeImageAfterSave(imageFiles?.first as File, imagePreviews?.first as string, setIsLoading);
    }
    if (imagePreviews?.second !== '') {
      secondImage = await storeImageAfterSave(imageFiles?.second as File, imagePreviews?.second as string, setIsLoading);
    }
    if (imagePreviews?.third !== '') {
      thirdImage = await storeImageAfterSave(imageFiles?.third as File, imagePreviews?.third as string, setIsLoading);
    }

    const images: string[] = [firstImage, secondImage, thirdImage].filter(Boolean);

    const payload: DishType = {
      businessId: Object(businessId),
      menuId: Object(menuId),
      name: dishName,
      price: dishPrice,
      visibility: visibility,
      availability: availability,
      calories: calories.toString(),
      dishTypes: dishTypes,
      description: dishDescription,
      categoryIds: Object(selectedCatIds),
      portions: portions,
      addOnIds: Object(addonIds),
      recommendationIds: Object(recommendationIds),
      tags: tags,
      images: images,
    };
    const filteredPayload = filterPayload(payload);
    const { data, dishResponse } = await postDishData(filteredPayload);
    if (dishResponse?.status === 201) {
      resetStore();
      resetDishStore();
      setIsLoading(false);
      setOpenMenu(false);
      queryClient.invalidateQueries({ queryKey: ['getAllDishes'] });
      return toast.success(data?.message);
    }
    setIsLoading(false);
    if (dishResponse?.status === 400 && Array.isArray(data?.error?.issues)) {
      errorToasts(data?.error);
    }
    if (dishResponse?.status === 400 || data?.message) {
      toast.error(data?.message);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const type = event?.target?.dataset?.type;
    const file = event?.target?.files?.[0];
    if (file) {
      compressImage(file, (compressedFile) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = () => {
          setCropping({ image: reader.result, type });
          setDishStep(DishSteps.SHOW_CROPPER);
        };
      });
    }
  };

  const handleDescription = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.value.length > 350) return;
      setDishDescription(e.target.value);
    },
    [dishDescription],
  );

  const handleCalories = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length > 6) return;
      setCalories(value);
    },
    [calories],
  );

  const redirectRecommendations = useCallback(() => {
    setDishStep('LINK_RECOMMENDATION_STEP');
  }, [dishStep]);

  const redirectTags = useCallback(() => {
    setDishStep('LINK_ADD_TAGS');
  }, [dishStep]);

  return (
    <>
      <article className="mx-6 mb-4 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Dish Images
        </label>
        <Background>
          <DishImages handleImageChange={handleImageChange} img={imagePreviews} />
        </Background>
      </article>
      <section className="mx-6 flex flex-col gap-4 lg:mx-16 lg:mt-6 lg:flex-row">
        <article className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="type">
            Dish Description
          </label>
          <div className="relative my-2 rounded-2xl bg-white p-3">
            <textarea
              value={dishDescription}
              onChange={handleDescription}
              className="h-[8rem] w-full resize-none rounded-2xl"
              placeholder="Add description"
            />
            <small className="absolute bottom-6 right-6">{dishDescription.length}/350</small>
          </div>
        </article>
        <article className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="price">
            Calories
          </label>
          <Background>
            <div className="relative">
              <input
                placeholder="Add calories"
                type="number"
                value={calories}
                className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
                onChange={handleCalories}
              />
              <small className="absolute bottom-2 right-4">Kcal</small>
            </div>
          </Background>
          <section onClick={redirectRecommendations}>
            <label className="font-semibold opacity-50" htmlFor="name">
              Recommendation ({recommendationIds.length})
            </label>
            <Background>
              <button type="button" className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2">
                <RiLinkUnlink className="mr-2" /> Link Recommendation
              </button>
            </Background>
          </section>
          <section onClick={redirectTags}>
            <label className="font-semibold opacity-50" htmlFor="name">
              Tags ({tags.length})
            </label>
            <Background>
              <button type="button" className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2">
                <RiLinkUnlink className="mr-2" /> Link Tags
              </button>
            </Background>
          </section>
        </article>
      </section>

      <AdvancedBottomButton
        fixed={true}
        backgroundColor="#fff"
        maxWidth="30rem"
        buttons={[
          {
            text: 'Save',
            onClick: handleAddDish,
            isLoading: isLoading,
            className: ' w-full',
          },
        ]}
      />
    </>
  );
};
const DishStepTwo = memo(MemoDishFormTwo);
export default DishStepTwo;
