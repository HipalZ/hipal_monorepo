import {
  type ChangeEvent,
  type FormEvent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { RiLinkUnlink } from "react-icons/ri";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import Background from "@/components/atom/feildBackground";
import {
  cn,
  filterPayload,
  foodTypes,
  updateImage,
  validateDish,
} from "@/components/utils/helper";
import type { DishType } from "@hi/db-models/src/validators";
import useErrorToasts from "@/hooks/useError";
import { putDishData } from "@/hooks/useDish";
import { useLocation, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Switch } from "@headlessui/react";
import { MdDelete } from "react-icons/md";
import PendingActions from "./pendingActions";
import SectionLoader from "@/components/atom/sectionLoader";
import { useQueryClient } from "@tanstack/react-query";
import BottomButton from "@/components/atom/bottomButton";

const MemoDishForm = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const queryClient = useQueryClient();

  const {
    setDishName,
    setDishTypes,
    setDishPrice,
    setDishStep,
    dishStep,
    dishDescription,
    calories,
    tags,
    recommendationIds,
    removeRecommendationIds,
    removeCategoryIds,
    removeAddOnIds,
    dishName,
    dishPrice,
    visibility,
    setVisibility,
    setAvailability,
    dishTypes,
    availability,
    portions,
    selectedCatIds,
    addonIds,
    resetStore,
    setEditOpenMenu,
    editDish,
    setShowDeleteDish,
    resetDishStore,
    imageFiles,
    imagePreviews,
    isMenuManager,
    isLoading,
    setIsMenuManager,
    setIsLoading,
    setOpenMenu,
  } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    setDishName: s.setDishName,
    selectedDish: s.selectedDish,
    setSelectedDish: s.setSelectedDish,
    setDishTypes: s.setDishTypes,
    setDishPrice: s.setDishPrice,
    setDishStep: s.setDishStep,
    dishStep: s.dishStep,
    calories: s.calories,
    dishDescription: s.dishDescription,
    tags: s.tags,
    recommendationIds: s.recommendationIds,
    dishName: s.dishName,
    dishPrice: s.dishPrice,
    visibility: s.visibility,
    setVisibility: s.setVisibility,
    dishTypes: s.dishTypes,
    availability: s.availability,
    setAvailability: s.setAvailability,
    portions: s.portions,
    selectedCatIds: s.selectedCatIds,
    addonIds: s.addonIds,
    resetStore: s.resetStore,
    editDish: s.editDish,
    setEditOpenMenu: s.setEditOpenMenu,
    removeCategoryIds: s.removeCategoryIds,
    removeAddOnIds: s.removeAddOnIds,
    removeRecommendationIds: s.removeRecommendationIds,
    resetDishStore: s.resetDishStore,
    setShowDeleteDish: s.setShowDeleteDish,
    imageFiles: s.imageFiles,
    imagePreviews: s.imagePreviews,
    isMenuManager: s.isMenuManager,
    setIsMenuManager: s.setIsMenuManager,
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
  }));
  const pathname = useLocation()?.pathname;
  const isManagerExists = pathname.includes("manager");
  const [displayedPrice, setDisplayedPrice] = useState("");
  const errorToasts = useErrorToasts();

  useEffect(() => {
    setDisplayedPrice(dishPrice?.toLocaleString("en-IN") || "");
    setIsMenuManager(isManagerExists);
  }, []);

  const toggleSelection = useCallback(
    (type: string) => {
      const isSelected = dishTypes.includes(type);
      if (isSelected && dishTypes.length === 1) {
        return;
      }
      const newSelectedTypes = isSelected
        ? dishTypes.filter((t) => t !== type)
        : [...dishTypes, type];

      setDishTypes(newSelectedTypes);
    },
    [dishTypes],
  );

  const handleDishPrice = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^0-9.]/g, "");
      const newPrice = numericValue ? Number(numericValue) : null;
      setDishPrice(newPrice ?? 0);
      setDisplayedPrice(newPrice?.toLocaleString("en-IN") ?? "");
    },
    [dishPrice, displayedPrice],
  );

  const handleFocus = useCallback(() => {
    setDisplayedPrice(dishPrice?.toString() || "");
  }, [dishPrice, displayedPrice]);

  const handleBlur = useCallback(() => {
    setDisplayedPrice(dishPrice?.toLocaleString("en-IN") || "");
  }, [dishPrice, displayedPrice]);

  const redirectToSection = useCallback((step) => {
    setDishStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    const value = validateDish(dishName, dishPrice, dishTypes);
    if (!value) return;
    setDishStep(DishSteps.DISH_STEP_2);
  }, [dishStep, dishName, dishPrice, dishTypes]);

  const handleSubmitDish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dishTypes.length === 0 || dishName.length === 0 || dishPrice === 0) {
      return toast.error("Please fill all the required fields");
    }
    setIsLoading(true);
    let firstImage: string = editDish?.images?.[0] ?? "";
    let secondImage: string = editDish?.images?.[1] ?? "";
    let thirdImage: string = editDish?.images?.[2] ?? "";
    firstImage = (await updateImage(
      imageFiles?.first as File,
      imagePreviews?.first as string,
      firstImage,
    )) as string;
    secondImage = (await updateImage(
      imageFiles?.second as File,
      imagePreviews?.second as string,
      secondImage,
    )) as string;
    thirdImage = (await updateImage(
      imageFiles?.third as File,
      imagePreviews?.third as string,
      thirdImage,
    )) as string;

    // Collect images
    const images: string[] = [firstImage, secondImage, thirdImage].filter(
      Boolean,
    );
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
    const { data, dishResponse } = await putDishData(filteredPayload);
    if (dishResponse?.status === 200) {
      resetStore();
      resetDishStore();
      setEditOpenMenu(false);
      setIsLoading(false);
      setOpenMenu(false);
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

  const handleVisibility = useCallback(() => {
    setVisibility(!visibility);
  }, [visibility]);

  const handleDishPage = useCallback(() => {
    setShowDeleteDish(true);
    setDishStep(DishSteps.CONFIRM_DELETE);
  }, [dishStep]);

  return (
    <form onSubmit={handleSubmitDish}>
      {isMenuManager ? <PendingActions /> : null}
      {isMenuManager ? null : (
        <article className="mx-6 lg:mx-16 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Dish Name*
          </label>
          <Background>
            <div className="relative">
              <input
                type="text"
                id="name"
                placeholder="Enter Dish Name"
                value={dishName}
                maxLength={50}
                minLength={3}
                required
                onChange={(e) => setDishName(e.target.value)}
                className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
              />
              <small className="absolute bottom-2 right-4">
                {dishName?.length}/{50}
              </small>
            </div>
          </Background>
        </article>
      )}
      {isMenuManager ? null : (
        <article className="mx-6 lg:mx-16 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="type">
            Dish Type*
          </label>
          <Background>
            <p className="text-sm text-gray-500">Choose Minimum 1 type</p>
            <section className="flex flex-wrap gap-2 mt-2">
              {foodTypes?.map((type) => {
                const isSelected = dishTypes.includes(type?.name);
                return (
                  <article
                    onClick={() => toggleSelection(type?.name)}
                    key={type?.name}
                    className={cn(
                      "capitalize flex justify-between items-center px-4 py-2 rounded-full gap-1 border border-[#CACACA]",
                      `${isSelected ? "bg-blue-200" : ""}`,
                    )}
                  >
                    <img
                      src={type?.icon}
                      loading="lazy"
                      alt={type?.name}
                      width="20"
                      height="20"
                    />
                    <p>{type?.name.replace(/_/g, " ").toLowerCase()}</p>
                  </article>
                );
              })}
            </section>
          </Background>
        </article>
      )}
      <article className="flex justify-between px-4 py-3 mx-6 my-4 bg-white rounded-full lg:mx-16 lg:mt-6">
        <h1 className="font-semibold opacity-50">Hide Dish</h1>
        <Switch
          checked={visibility}
          onChange={handleVisibility}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
      </article>
      <article className="flex justify-between px-4 py-3 mx-6 my-4 bg-white rounded-full lg:mx-16 lg:mt-6">
        <h1 className="font-semibold opacity-50">Dish Availability</h1>
        <Switch
          checked={availability}
          onChange={setAvailability}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
      </article>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        {isManagerExists ? null : (
          <article>
            <label className="font-semibold opacity-50" htmlFor="price">
              Prices & Portions*
            </label>
            <div className="bg-white rounded-2xl">
              <div className="relative p-3 mt-2">
                <small className="absolute ml-2 text-lg bottom-5 left-4">
                  ₹
                </small>
                <input
                  minLength={1}
                  maxLength={7}
                  onChange={handleDishPrice}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  value={displayedPrice}
                  placeholder="Enter Price"
                  type="text"
                  required
                  className="bg-white rounded-xl w-full pl-8 focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
                />
                <small className="absolute bottom-6 right-6">
                  {dishPrice?.toString()?.length}/{7}
                </small>
              </div>
              <section>
                <Background>
                  <button
                    onClick={() => redirectToSection(DishSteps.PORTION_STEP)}
                    type="button"
                    className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
                  >
                    + Add more portions
                  </button>
                </Background>
              </section>
            </div>
          </article>
        )}
        {portions.length > 0 ? (
          <div className="relative mb-4 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Portion Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {portions.map((portion, index) => (
                  <tr
                    key={`${portion?.name}+${index}`}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">{portion.name}</td>
                    <td className="px-6 py-4">{portion?.price ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <section
          id="linkCategories"
          onClick={() => redirectToSection(DishSteps.LINK_CATEGORY_STEP)}
        >
          <label className="font-semibold opacity-50" htmlFor="name">
            Link Categories ({selectedCatIds.length})
          </label>
          <Background>
            <button
              type="button"
              className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
            >
              <RiLinkUnlink className="mr-2" /> Link Categories
            </button>
          </Background>
        </section>
        <section onClick={() => redirectToSection(DishSteps.LINK_ADDON_STEP)}>
          <label className="font-semibold opacity-50" htmlFor="name">
            Link Add-ons ({addonIds.length})
          </label>
          <Background>
            <button
              type="button"
              className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
            >
              <RiLinkUnlink className="mr-2" /> Link Add-ons
            </button>
          </Background>
        </section>
      </article>
      <section className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Delete Dish
        </label>
        <Background>
          <button
            onClick={handleDishPage}
            type="button"
            className="bg-[#d32a2a] w-full py-2 rounded-full flex items-center justify-center text-white"
          >
            <MdDelete className="mr-2" /> Delete Dish
          </button>
        </Background>
      </section>
      <BottomButton
        buttons={[
          {
            text: "Quick Save",
            isLoading: isLoading,
            type: "submit",
          },
          {
            text: "Next",
            onClick: goToNextStep,
            type: "button",
          },
        ]}
      />
    </form>
  );
};

const DishStepOne = memo(MemoDishForm);
export default DishStepOne;
