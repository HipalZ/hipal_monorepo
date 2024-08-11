import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useCallback } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import BottomButton from "@/components/atom/bottomButton";

const MemoSelectCategory = () => {
  const {
    selectSingleParentCat,
    setSelectSingleParentCat,
    setCategoryStep,
    search,
    setSearch,
    catId,
    categoryStep,
  } = useMenuPageStore((state) => ({
    selectSingleParentCat: state.selectSingleParentCat,
    setSelectSingleParentCat: state.setSelectSingleParentCat,
    setCategoryStep: state.setCategoryStep,
    categoryStep: state.categoryStep,
    search: state.search,
    setSearch: state.setSearch,
    catId: state.catId,
  }));

  const { categories } = useCategoryStore((s) => ({
    categories: s.categories,
  }));

  const fuse = new Fuse(categories, {
    keys: ["name"],
    threshold: 0.3,
  });

  const filteredCategories = search
    ? fuse.search(search).map((result) => result.item)
    : categories;

  const handleSave = useCallback(() => {
    if (catId !== "") {
      setCategoryStep("EDIT_SUB_CATEGORY");
      return;
    }
    setCategoryStep("CATEGORY_STEP_1");
  }, [catId, categoryStep]);

  return (
    <>
      <input
        type="search"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className=" w-[92%] p-2 border rounded-2xl mx-6"
      />
      <div className="flex flex-wrap justify-center gap-4 mx-4 mt-4 lg:mx-0">
        {filteredCategories?.map((category: CategoryType) => (
          <div
            key={category._id?.toString()}
            className="flex relative items-center justify-between w-full p-4 bg-white rounded-lg shadow md:max-w-[14rem] lg:max-w-[14rem]"
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectSingleParentCat.includes(
                  category._id?.toString() ?? "",
                )}
                onChange={() =>
                  setSelectSingleParentCat(category._id?.toString() ?? "")
                }
                className="mr-2 text-sm text-black rounded"
              />
              <h3 className="text-lg font-semibold">{category.name}</h3>
            </label>
            <div className="absolute right-2">
              {category.visibility ? (
                <FaEye className="text-green-500" />
              ) : (
                <FaEyeSlash className="text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
      <BottomButton
        buttons={[
          {
            text: "Save",
            onClick: handleSave,
            type: "button",
          },
        ]}
      />
    </>
  );
};

const SelectCategory = memo(MemoSelectCategory);
export default SelectCategory;
