import { memo, useCallback } from "react";
import Fuse from "fuse.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import BottomButton from "@/components/atom/bottomButton";
import type { CategoryType } from "@hi/db-models/src/validators";

const MemoSelectSubCategory = () => {
  const {
    selectedIds,
    handleCategoryChange,
    catId,
    setCategoryStep,
    search,
    setSearch,
  } = useMenuPageStore((state) => ({
    selectedIds: state.selectedIds,
    handleCategoryChange: state.handleCategoryChange,
    setCategoryStep: state.setCategoryStep,
    search: state.search,
    setSearch: state.setSearch,
    catId: state.catId,
  }));

  const { subCategories } = useCategoryStore((s) => ({
    subCategories: s.subCategories,
  }));

  // Initialize Fuse with subcategories that have dishes
  const fuse = new Fuse(
    subCategories.filter((category) => category.dishIds.length > 0),
    {
      keys: ["name"],
      threshold: 0.3,
    },
  );

  // Apply search and filter out subcategories without dishes
  const filteredsubCategories = search
    ? fuse.search(search).map((result) => result.item)
    : subCategories.filter((category) => category.dishIds.length > 0);

  const handleSave = useCallback(() => {
    if (catId !== "") {
      setCategoryStep("EDIT_MAIN_CATEGORY");
      return;
    }
    setCategoryStep("CATEGORY_STEP_1");
  }, [catId, setCategoryStep]);

  return (
    <>
      <input
        type="search"
        placeholder="Search subcategories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-[92%] p-2 border rounded-2xl mx-6"
      />
      <div className="flex flex-wrap justify-start gap-3 mx-4 mt-4 lg:grid md:grid-cols-3 lg:mx-6">
        {filteredsubCategories?.map((category: CategoryType) => (
          <div
            key={category._id?.toString()}
            className="relative flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow md:max-w-[14.75rem] lg:max-w-[15rem]"
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(category?._id?.toString() ?? "")}
                onChange={() =>
                  handleCategoryChange(category?._id?.toString() ?? "")
                }
                className="mr-2 text-sm text-black rounded"
              />
              <h3 className="text-lg font-semibold">{category?.name}</h3>
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

const SelectSubCategory = memo(MemoSelectSubCategory);
export default SelectSubCategory;
