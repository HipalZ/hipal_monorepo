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
  storeImageAfterSave,
  validateDish,
} from "@/components/utils/helper";
import type { DishType, DishTypeEnumType } from "@hi/db-models/src/validators";
import useErrorToasts from "@/hooks/useError";
import { postDishData } from "@/hooks/useDish";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import BottomButton from "@/components/atom/bottomButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MemoDishForm = () => {
  const { businessId, menuId } = useParams<{
    businessId?: string;
    menuId: string;
  }>();
  const [displayedPrice, setDisplayedPrice] = useState("");
  const queryClient = useQueryClient();
  const errorToasts = useErrorToasts();

  const isLoading = useMenuPageStore((s) => s.isLoading);
  const setIsLoading = useMenuPageStore((s) => s.setIsLoading);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const dishStep = useMenuPageStore((s) => s.dishStep);
  const dishName = useMenuPageStore((s) => s.dishName);
  const setDishName = useMenuPageStore((s) => s.setDishName);
  const dishPrice = useMenuPageStore((s) => s.dishPrice);
  const setDishPrice = useMenuPageStore((s) => s.setDishPrice);
  const dishTypes = useMenuPageStore((s) => s.dishTypes);
  const setDishTypes = useMenuPageStore((s) => s.setDishTypes);
  const dishDescription = useMenuPageStore((s) => s.dishDescription);
  const calories = useMenuPageStore((s) => s.calories);
  const tags = useMenuPageStore((s) => s.tags);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const visibility = useMenuPageStore((s) => s.visibility);
  const availability = useMenuPageStore((s) => s.availability);
  const portions = useMenuPageStore((s) => s.portions);
  const selectedCatIds = useMenuPageStore((s) => s.selectedCatIds);
  const addonIds = useMenuPageStore((s) => s.addonIds);
  const imageFiles = useMenuPageStore((s) => s.imageFiles);
  const imagePreviews = useMenuPageStore((s) => s.imagePreviews);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const resetDishStore = useMenuPageStore((s) => s.resetDishStore);

  useEffect(() => {
    if (dishTypes.length === 0) {
      setDishTypes(["VEG"]);
    } else {
      setDishTypes(dishTypes);
    }
    setDisplayedPrice(dishPrice?.toLocaleString("en-IN") || "");
  }, []);

  const toggleSelection = useCallback(
    (type: string) => {
      const isSelected = dishTypes.includes(type as DishTypeEnumType);
      if (isSelected && dishTypes.length === 1) {
        return;
      }
      const newSelectedTypes = isSelected
        ? dishTypes.filter((t) => t !== type)
        : [...dishTypes, type];
      setDishTypes(newSelectedTypes as DishTypeEnumType[]);
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
  }, [displayedPrice, dishPrice]);

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
    validateDish(dishName, dishPrice, dishTypes);
    setIsLoading(true);
    let firstImage: string | undefined;
    let secondImage: string | undefined;
    let thirdImage: string | undefined;

    if (imagePreviews?.first !== "") {
      firstImage = await storeImageAfterSave(
        imageFiles?.first as File,
        imagePreviews?.first as string,
      );
    }
    if (imagePreviews?.second !== "") {
      secondImage = await storeImageAfterSave(
        imageFiles?.second as File,
        imagePreviews?.second as string,
      );
    }
    if (imagePreviews?.third !== "") {
      thirdImage = await storeImageAfterSave(
        imageFiles?.third as File,
        imagePreviews?.third as string,
      );
    }

    const images: string[] = [firstImage, secondImage, thirdImage].filter(
      Boolean,
    );
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
      queryClient.invalidateQueries({ queryKey: ["getAllDishes"] });
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

  return (
    <form onSubmit={handleSubmitDish}>
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
                <button
                  type="button"
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
                </button>
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
        {portions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portion Name</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portions.map((portion, index) => (
                <TableRow key={`${portion.name}+${index}`}>
                  <TableCell>{portion.name}</TableCell>
                  <TableCell>{portion.price ?? "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
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
