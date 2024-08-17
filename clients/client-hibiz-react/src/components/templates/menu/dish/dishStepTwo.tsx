import { type ChangeEvent, memo, useCallback } from "react";
import { RiLinkUnlink } from "react-icons/ri";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import Background from "@/components/atom/feildBackground";
import { useParams } from "react-router-dom";
import type { DishType } from "@hi/db-models/src/validators";
import {
  compressImage,
  filterPayload,
  storeImageAfterSave,
} from "@/components/utils/helper";
import useErrorToasts from "@/hooks/useError";
import { postDishData } from "@/hooks/useDishStore";
import toast from "react-hot-toast";
import DishImages from "./[editDish]/dishImages";
import SectionLoader from "@/components/atom/sectionLoader";
import { useQueryClient } from "@tanstack/react-query";

const MemoDishFormTwo = () => {
  const { businessId } = useParams<{ businessId?: string }>();

  const {
    setDishStep,
    dishStep,
    dishDescription,
    calories,
    setDishDescription,
    setCalories,
    tags,
    recommendationIds,
    dishName,
    dishPrice,
    visibility,
    dishTypes,
    availability,
    portions,
    selectedCatIds,
    addonIds,
    imageFiles,
    imagePreviews,
    setCropping,
    resetStore,
    resetDishStore,
    isLoading,
    setIsLoading,
    setOpenMenu,
  } = useMenuPageStore((s) => ({
    dishStep: s.dishStep,
    setDishStep: s.setDishStep,
    calories: s.calories,
    dishDescription: s.dishDescription,
    setDishDescription: s.setDishDescription,
    setCalories: s.setCalories,
    tags: s.tags,
    recommendationIds: s.recommendationIds,
    dishName: s.dishName,
    dishPrice: s.dishPrice,
    visibility: s.visibility,
    dishTypes: s.dishTypes,
    availability: s.availability,
    portions: s.portions,
    selectedCatIds: s.selectedCatIds,
    addonIds: s.addonIds,
    imageFiles: s.imageFiles,
    imagePreviews: s.imagePreviews,
    setCropping: s.setCropping,
    resetStore: s.resetStore,
    resetDishStore: s.resetDishStore,
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    setOpenMenu: s.setOpenMenu,
  }));

  const queryClient = useQueryClient();

  const errorToasts = useErrorToasts();

  const handleAddDish = async () => {
    if (dishTypes.length === 0 || dishName.length === 0 || dishPrice === 0) {
      return toast.error("Please fill all the required fields");
    }
    setIsLoading(true);
    let firstImage: string | undefined;
    let secondImage: string | undefined;
    let thirdImage: string | undefined;

    if (imagePreviews?.first !== "") {
      firstImage = await storeImageAfterSave(
        imageFiles?.first as File,
        imagePreviews?.first as string,
        setIsLoading,
      );
    }
    if (imagePreviews?.second !== "") {
      secondImage = await storeImageAfterSave(
        imageFiles?.second as File,
        imagePreviews?.second as string,
        setIsLoading,
      );
    }
    if (imagePreviews?.third !== "") {
      thirdImage = await storeImageAfterSave(
        imageFiles?.third as File,
        imagePreviews?.third as string,
        setIsLoading,
      );
    }

    const images: string[] = [firstImage, secondImage, thirdImage].filter(
      Boolean,
    );

    const payload: DishType = {
      businessId: Object(businessId),
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
      queryClient.invalidateQueries({ queryKey: ["getAlldishes"] });
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
      if (e.target.value.length > 100) return;
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
    setDishStep("LINK_RECOMMENDATION_STEP");
  }, [dishStep]);

  const redirectTags = useCallback(() => {
    setDishStep("LINK_ADD_TAGS");
  }, [dishStep]);

  return (
    <>
      <article className="mx-6 mb-4 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Dish Images
        </label>
        <Background>
          <DishImages
            handleImageChange={handleImageChange}
            img={imagePreviews}
          />
        </Background>
      </article>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="type">
          Dish Description
        </label>
        <div className="relative p-3 my-2 bg-white rounded-2xl">
          <textarea
            value={dishDescription}
            onChange={handleDescription}
            className="w-full resize-none rounded-2xl h-[8rem]"
            placeholder="Add description"
          />
          <small className="absolute bottom-6 right-6">
            {dishDescription.length}/100
          </small>
        </div>
      </article>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="price">
          Calories
        </label>
        <Background>
          <div className="relative">
            <input
              placeholder="Add calories"
              type="number"
              value={calories}
              className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
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
            <button
              type="button"
              className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
            >
              <RiLinkUnlink className="mr-2" /> Link Recommendation
            </button>
          </Background>
        </section>
        <section onClick={redirectTags}>
          <label className="font-semibold opacity-50" htmlFor="name">
            Tags ({tags.length})
          </label>
          <Background>
            <button
              type="button"
              className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
            >
              <RiLinkUnlink className="mr-2" /> Link Tags
            </button>
          </Background>
        </section>
      </article>
      <footer className="absolute bottom-4 flex w-[92%] lg:w-[96%] gap-4 mx-4">
        <button
          type="button"
          onClick={handleAddDish}
          className="w-full py-3 text-white bg-black rounded-full"
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
  );
};
const DishStepTwo = memo(MemoDishFormTwo);
export default DishStepTwo;
