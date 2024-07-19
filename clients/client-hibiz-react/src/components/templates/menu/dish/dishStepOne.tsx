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
import { cn, filterPayload, foodTypes } from "@/components/utils/helper";
import type { DishType } from "@hi/db-models/src/validators";
import useErrorToasts from "@/hooks/useError";
import { postDishData } from "@/hooks/useDishStore";
import { useParams } from "react-router-dom";

const MemoDishForm = () => {
  const { businessId } = useParams<{ businessId?: string }>();
  const {
    setDishName,
    setDishTypes,
    setDishPrice,
    setDishStep,
    dishDescription,
    calories,
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
  } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    setDishName: s.setDishName,
    selectedDish: s.selectedDish,
    setSelectedDish: s.setSelectedDish,
    setDishTypes: s.setDishTypes,
    setDishPrice: s.setDishPrice,
    setDishStep: s.setDishStep,
    calories: s.calories,
    dishDescription: s.dishDescription,
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
  }));

  const [displayedPrice, setDisplayedPrice] = useState("");
  useEffect(() => {
    setDisplayedPrice(dishPrice?.toLocaleString("en-IN") || "");
  }, []);
  const toggleSelection = (type: string) => {
    const isSelected = dishTypes.includes(type);
    const newSelectedTypes = isSelected
      ? dishTypes.filter((t) => t !== type)
      : [...dishTypes, type];

    setDishTypes(newSelectedTypes);
  };

  const handleDishPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
    const newPrice = numericValue ? Number(numericValue) : null;
    setDishPrice(newPrice ?? 0);
    setDisplayedPrice(newPrice?.toLocaleString("en-IN") ?? "");
  };

  const handleFocus = () => {
    setDisplayedPrice(dishPrice?.toString() || "");
  };

  const handleBlur = () => {
    setDisplayedPrice(dishPrice?.toLocaleString("en-IN") || "");
  };

  const redirectToSection = useCallback((step) => {
    setDishStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    setDishStep(DishSteps.DISH_STEP_2);
  }, []);
  const errorToasts = useErrorToasts();

  const handleSubmitDish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
    };
    const filteredPayload = filterPayload(payload);
    const data = await postDishData(filteredPayload);
    console.log("data", data);
    if (!data?.success) {
      errorToasts(data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmitDish}>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Dish Name*
        </label>
        <Background>
          <input
            type="text"
            id="name"
            placeholder="Enter Dish Name"
            value={dishName}
            maxLength={21}
            minLength={3}
            required
            onChange={(e) => setDishName(e.target.value)}
            className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
          />
        </Background>
      </article>
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
                  <img src={type?.icon} loading="lazy" alt={type?.name} />
                  <p>{type?.name.replace(/_/g, " ").toLowerCase()}</p>
                </article>
              );
            })}
          </section>
        </Background>
      </article>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="price">
          Prices & Portions*
        </label>
        <div className="bg-white rounded-2xl">
          <div className="relative p-3 mt-2">
            <small className="absolute ml-2 text-lg bottom-5 left-4">₹</small>
            <input
              minLength={1}
              maxLength={6}
              onChange={handleDishPrice}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={displayedPrice}
              placeholder="Enter Price"
              type="text"
              required
              className="bg-white rounded-xl w-full pl-8 focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
            />
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
        <section
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
      <footer className="absolute bottom-4 flex w-[92%] lg:w-[96%] gap-4 mx-4">
        <button
          type="submit"
          className="w-full py-3 text-white bg-[#7D68FE] rounded-full"
        >
          Quick Save
        </button>
        <button
          onClick={goToNextStep}
          type="button"
          className="w-full py-3 text-white bg-black rounded-full"
        >
          Next
        </button>
      </footer>
    </form>
  );
};

const DishStepOne = memo(MemoDishForm);
export default DishStepOne;
