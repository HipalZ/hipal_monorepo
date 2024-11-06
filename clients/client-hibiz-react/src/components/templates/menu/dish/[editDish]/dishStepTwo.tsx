import { type ChangeEvent, memo, useCallback } from "react";
import { RiLinkUnlink } from "react-icons/ri";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import Background from "@/components/atom/feildBackground";
import DishImages from "./dishImages";
import { useParams } from "react-router-dom";
import type { DishType } from "@hi/db-models/src/validators";
import {
  compressImage,
  filterPayload,
  updateImage,
} from "@/components/utils/helper";
import useErrorToasts from "@/hooks/useError";
import { putDishData } from "@/hooks/useDish";
import toast from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import SectionLoader from "@/components/atom/sectionLoader";
import { useQueryClient } from "@tanstack/react-query";
import BottomButton from "@/components/atom/bottomButton";

const MemoDishFormTwo = () => {
  const { businessId } = useParams<{ businessId?: string }>();

  const {
    setDishStep,
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
    isLoading,
    editDish,
    resetStore,
    resetDishStore,
    setEditOpenMenu,
    setShowDeleteDish,
    dishStep,
    setIsLoading,
    removeRecommendationIds,
    removeCategoryIds,
    removeAddOnIds,
  } = useMenuPageStore((s) => ({
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
    isLoading: s.isLoading,
    setCropping: s.setCropping,
    editDish: s.editDish,
    resetStore: s.resetStore,
    resetDishStore: s.resetDishStore,
    setEditOpenMenu: s.setEditOpenMenu,
    setShowDeleteDish: s.setShowDeleteDish,
    dishStep: s.dishStep,
    setIsLoading: s.setIsLoading,
    removeRecommendationIds: s.removeRecommendationIds,
    removeCategoryIds: s.removeCategoryIds,
    removeAddOnIds: s.removeAddOnIds,
  }));

  const queryClient = useQueryClient();

  const errorToasts = useErrorToasts();

  const handleUpdateDish = async () => {
    if (dishTypes.length === 0 || dishName.length === 0 || dishPrice === 0) {
      return toast.error("Please fill all the required fields");
    }
    setIsLoading(true);
    let firstImage = imagePreviews?.first ?? "";
    let secondImage = imagePreviews?.second ?? "";
    let thirdImage = imagePreviews?.third ?? "";

    if (imagePreviews?.first !== null && imagePreviews?.first !== "") {
      firstImage = (await updateImage(
        imageFiles?.first as File,
        imagePreviews?.first as string,
        firstImage as string,
        setIsLoading,
      )) as string;
    }
    if (imagePreviews?.second !== "" && imagePreviews?.second !== null) {
      secondImage = (await updateImage(
        imageFiles?.second as File,
        imagePreviews?.second as string,
        secondImage as string,
        setIsLoading,
      )) as string;
    }
    if (imagePreviews?.third !== "" && imagePreviews?.third !== null) {
      thirdImage = (await updateImage(
        imageFiles?.third as File,
        imagePreviews?.third as string,
        thirdImage as string,
        setIsLoading,
      )) as string;
    }
    // Collect images
    let images: string[] = [firstImage, secondImage, thirdImage].filter(
      Boolean,
    );

    if (firstImage === "" && secondImage === "" && thirdImage === "") {
      images = [];
    }

    const payload: DishType = {
      _id: editDish?._id,
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
      removeCategoryIds: Object(removeCategoryIds),
      removeAddOnIds: Object(removeAddOnIds),
      removeRecommendationIds: Object(removeRecommendationIds),
      tags: tags,
      images: images,
    };
    const filteredPayload = filterPayload(payload);
    const { data, dishResponse } = await putDishData({
      ...filteredPayload,
      images,
    });
    if (dishResponse?.status === 200) {
      resetStore();
      resetDishStore();
      setEditOpenMenu(false);
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["getAlldishes"] });
      toast.success(data?.message);
      return;
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
    setDishStep("LINK_RECOMMENDATION_STEP");
  }, [dishStep]);

  const redirectTags = useCallback(() => {
    setDishStep("LINK_ADD_TAGS");
  }, [dishStep]);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDeleteDish(true)}
        className="absolute top-7 right-16"
      >
        <MdDelete
          size={30}
          className="px-2 py-1 text-red-500 bg-red-100 rounded-lg"
        />
      </button>
      <article id="uploadImages" className="mx-6 mb-4 lg:mx-16 lg:mt-6">
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
      <article id="writeDescription" className="mx-6 lg:mx-16 lg:mt-6">
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
            {dishDescription.length}/350
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
        <section id="addRecommendations" onClick={redirectRecommendations}>
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
      <BottomButton
        buttons={[
          {
            text: "Save",
            onClick: handleUpdateDish,
            isLoading: isLoading,
            disable: isLoading,
          },
        ]}
      />
    </>
  );
};
const DishStepTwo = memo(MemoDishFormTwo);
export default DishStepTwo;
