import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import { FaCodeBranch, FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useParentCategories } from "@/hooks/useCategory";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import { BiSolidEditAlt } from "react-icons/bi";
import { RiImageAddFill } from "react-icons/ri";
import { PiCameraSlashFill } from "react-icons/pi";

const MemoListOfParentCategory = () => {
  const {
    setAvailability,
    setImagePreview,
    setSelectedIds,
    setCategoryName,
    setVisibility,
    search,
    visibilityFilter,
    sortOrder,
    setCategoryStep,
    isMenuManager,
    setOpenMenu,
    setEditingCat,
    setCatId,
    setIdCheck,
  } = useMenuPageStore((state) => ({
    search: state.search,
    visibilityFilter: state.visibilityFilter,
    sortOrder: state.sortOrder,
    setCategoryStep: state.setCategoryStep,
    setOpenMenu: state.setOpenMenu,
    setVisibility: state.setVisibility,
    setAvailability: state.setAvailability,
    setImagePreview: state.setImagePreview,
    setSelectedIds: state.setSelectedIds,
    setCategoryName: state.setCategoryName,
    setEditingCat: state.setEditingMainCat,
    setCatId: state.setCatId,
    setIdCheck: state.setIdCheck,
    isMenuManager: state.isMenuManager,
  }));
  const { categories } = useCategoryStore((state) => ({
    setCategories: state.setCategories,
    categories: state.categories,
  }));
  const { isLoading } = useParentCategories();

  const fuse = useMemo(
    () =>
      new Fuse(categories, {
        keys: ["name"],
        threshold: 0.3,
      }),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    let filtered = search
      ? fuse.search(search).map((result) => result.item)
      : categories;
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.visibility === (visibilityFilter === "visible"),
      );
    }
    if (Object.keys(filtered).length === 0) return [];
    return sortOrder === "asc"
      ? filtered.sort((a, b) => a.name.localeCompare(b.name))
      : filtered.sort((a, b) => b.name.localeCompare(a.name));
  }, [search, categories, fuse, visibilityFilter, sortOrder]);

  const editCategory = useCallback((category: CategoryType) => {
    setCategoryStep("EDIT_MAIN_CATEGORY");
    setVisibility(category.visibility ?? false);
    setAvailability(category.availability ?? false);
    setImagePreview(category.coverImage ?? null);
    setSelectedIds(category.subCategoryIds);
    setIdCheck(category.subCategoryIds);
    setCategoryName(category.name);
    setCatId(category._id?.toString() ?? "");
    setOpenMenu(true);
    setEditingCat(true);
  }, []);

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="flex relative flex-wrap justify-start py-[7rem] gap-4 mx-4 lg:py-[5rem]">
      <h3 className="absolute left-0 text-xl font-semibold text-black lg:top-[2rem] top-[4rem]">
       main category ({filteredCategories?.length})
      </h3>
      {filteredCategories.map((category) => (
        <button
          type="button"
          key={category.name}
          className="flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] md:max-w-[19rem] lg:max-w-[21.5rem]"
        >
          {isMenuManager ? (
            <figure className="flex items-center gap-4">
              {category.coverImage ? (
                <img
                  src={category.coverImage}
                  alt={category.name}
                  className="w-12 h-12 rounded-xl"
                />
              ) : (
                <div className="p-4 bg-[#A5A5A5] rounded-xl opacity-50">
                  <RiImageAddFill />
                </div>
              )}
              <article className="flex flex-col items-start">
                <h3 className="mb-2 -mt-1 font-semibold">{category.name}</h3>
                <div className="flex gap-2">
                  {category.visibility ? null : (
                    <FaEyeSlash className="text-red-500" />
                  )}
                  {category.coverImage ? null : (
                    <PiCameraSlashFill className="text-red-500" />
                  )}
                </div>
              </article>
            </figure>
          ) : (
            <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
          )}

          <article className="flex">
            {!isMenuManager ? (
              
              <div>
                {category.visibility ? (
                  <FaEye className="text-green-500" />
                ) : (
                  <FaEyeSlash className="text-red-500" />
                )}
              </div>
              
            ) : (
              <div className="flex items-center gap-1 font-semibold opacity-50">
                <FaCodeBranch className="rotate-180" />
                {category.subCategoryIds.length}
              </div>
            )}
            <button
              onClick={() => editCategory(category)}
              type="button"
              className="pl-4 text-black"
            >
              <BiSolidEditAlt />
            </button>
          </article>
        </button>
      ))}
    </section>
  );
};
const ListOfParentCategory = memo(MemoListOfParentCategory);
export default ListOfParentCategory;
