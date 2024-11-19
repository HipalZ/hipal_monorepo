import Background from "@/components/atom/feildBackground";
import { useDishesStore } from "@/components/store/useDishesStore";
import { useMenuBanner } from "@/components/store/useMenuBanners";
import { Switch } from "@headlessui/react";
import { memo, useMemo } from "react";
import { TbUnlink } from "react-icons/tb";
import ShimmerImage from "../shimmer";
import { HiX } from "react-icons/hi";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import {
  useGetAllCategoryDataWithDishes,
  useSaveMenuBanner,
} from "@/hooks/useMenuBanner";
import BottomButton from "@/components/atom/bottomButton";

const MemoAddDishesToMenuBanner = () => {
  const {
    selectedDishes,
    isPublishing,
    headerTitle,
    setMenuBannerType,
    setHeaderTitle,
    setIsPublishing,
    removeDish,
  } = useMenuBanner((s) => ({
    headerTitle: s.headerTitle,
    isPublishing: s.isPublishing,
    setMenuBannerType: s.setMenuBannerType,
    setHeaderTitle: s.setHeaderTitle,
    setIsPublishing: s.setIsPublishing,
    selectedDishes: s.selectedDishes,
    removeDish: s.removeDish,
  }));

  const { isPending, saveMenuBanner } = useSaveMenuBanner();

  const changeHeading = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderTitle(e.target.value);
  };

  const { setDishes, dishes } = useDishesStore((s) => ({
    setDishes: s.setDishes,
    dishes: s.dishes,
  }));

  const { categoryData: categories, isLoading } =
    useGetAllCategoryDataWithDishes();

  useMemo(() => {
    if (categories && categories.length > 0) {
      const dishes = categories.flatMap((category) =>
        category.dishIds.filter(
          (dish) => dish.images && dish.images.length > 0,
        ),
      );
      return setDishes(dishes);
    }
    return setDishes([]);
  }, [categories]);

  const saveMenuBannerData = () => {
    const payload = {
      heading: headerTitle,
      dishIds: selectedDishes,
      isPublished: isPublishing,
    };
    saveMenuBanner(payload);
  };

  if (isLoading || isPending) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <section className="grid grid-cols-1 mx-6 mt-4 gap-x-8 md:grid-cols-2">
        <article>
          <h3 className="mt-2 text-lg font-semibold opacity-50">
            Menu Visibility
          </h3>
          <Background className="flex-1 mt-2">
            <section className="flex items-center justify-between text-nowrap">
              <h3>Switch this banner on / off</h3>
              <Switch
                checked={isPublishing}
                onChange={setIsPublishing}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>
            </section>
          </Background>
        </article>
        <article>
          {isPublishing && (
            <>
              <h3 className="mt-4 text-lg font-semibold opacity-50 md:mt-0">
                Add a Heading
              </h3>
              <Background>
                <input
                  type="text"
                  value={headerTitle}
                  placeholder={headerTitle || "Enter the name of the menu"}
                  minLength={2}
                  maxLength={20}
                  className="w-full px-4 py-3 border border-black rounded-2xl"
                  onChange={changeHeading}
                />
              </Background>

              <button
                type="button"
                onClick={() => setMenuBannerType("LINK_DISHES")}
                className="w-full mt-4 lg:mt-0 font-semibold flex items-center justify-center rounded-3xl py-2 border-[1rem] border-[#ffffff]"
              >
                <TbUnlink className="mr-2" />
                Link Dishes
              </button>
            </>
          )}
        </article>
      </section>
      {selectedDishes.length > 0 && (
        <>
          <h3 className="mt-6 ml-6 text-lg font-semibold opacity-50">
            Selected Dish
          </h3>
          <div className="w-[88%] md:w-[94%] mx-6 grid grid-cols-1 md:grid-cols-3 gap-x-4 pb-[5rem]">
            {selectedDishes.map((dishId) => {
              const dish = dishes.find((d) => d._id === dishId);
              return dish ? (
                <div
                  key={dish.id}
                  className="relative flex items-center h-[4rem] justify-between w-full px-4 py-3 mt-3 text-left bg-white rounded-lg shadow-md"
                >
                  <div className=" w-[90%] lg:w-[80%] md:w-[80%]">
                    {dish.name}
                  </div>
                  <div className="absolute right-4">
                    <ShimmerImage
                      src={dish?.images?.[0]}
                      alt={dish.name}
                      width={50}
                      height={50}
                      className="rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDish(dish._id)}
                    className="absolute flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full -top-2 -right-2"
                  >
                    <HiX />
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </>
      )}
      <BottomButton
        fixed
        buttons={[
          ...(selectedDishes.length !== 0
            ? [
                {
                  text: "Preview",
                  onClick: () => setMenuBannerType("LIVE"),
                },
              ]
            : []),
          {
            text: "Save",
            onClick: saveMenuBannerData,
          },
        ]}
      />
    </>
  );
};

const AddDishesToMenuBanner = memo(MemoAddDishesToMenuBanner);
export default AddDishesToMenuBanner;
