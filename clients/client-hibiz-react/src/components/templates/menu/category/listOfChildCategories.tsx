import type { CategoryType } from "@hi/db-models/src/validators";
import Fuse from "fuse.js";
import { FaCodeBranch, FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { useChildCategories } from "@/hooks/useCategory";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { memo, useCallback, useMemo, useState } from "react";
import { useCategoryStore } from "@/components/store/useCategoryStore";
import { BiSolidEditAlt } from "react-icons/bi";
import { RiImageAddFill } from "react-icons/ri";
import { PiCameraSlashFill } from "react-icons/pi";
import useBusinessData from "@/components/store/useBusinessData";
import { useLocation } from "react-router-dom";
import { apiRpc } from "@hi/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BottomButton from "@/components/atom/bottomButton";

const MemoListOfChildCategory = () => {
  const {
    setAvailability,
    setImagePreview,
    setCategoryName,
    setVisibility,
    search,
    visibilityFilter,
    sortOrder,
    setCategoryStep,
    setOpenMenu,
    setEditingSubCat,
    setCatId,
    setIdCheck,
    setRecommendationIds,
    setRemoveRecommendationIds,
    setSelectSingleParentCat,
    isMenuManager,
    setTimings
  } = useMenuPageStore((state) => ({
    search: state.search,
    visibilityFilter: state.visibilityFilter,
    sortOrder: state.sortOrder,
    setCategoryStep: state.setCategoryStep,
    setOpenMenu: state.setOpenMenu,
    setVisibility: state.setVisibility,
    setAvailability: state.setAvailability,
    setImagePreview: state.setImagePreview,
    setCategoryName: state.setCategoryName,
    setEditingSubCat: state.setEditingSubCat,
    setCatId: state.setCatId,
    setIdCheck: state.setIdCheck,
    setRemoveRecommendationIds: state.setRemoveRecommendationIds,
    setRecommendationIds: state.setRecommendationIds,
    setSelectSingleParentCat: state.setSelectSingleParentCat,
    isMenuManager: state.isMenuManager,
    setTimings: state.setTimings,
  }));
  const queryClient = useQueryClient();
  const pathname = useLocation().pathname;
  const { subCategories, setSubCategories } = useCategoryStore((state) => ({
    subCategories: state.subCategories,
    setSubCategories: state.setSubCategories,
  }));
  const businessId = useBusinessData((s) => s.businessData?._id);
  const [sequenceCategories, setSequenceCategories] = useState([]);
  const [sequenceMode, setSequenceMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const outLetType = useBusinessData((s) => s.outletInfo?.outLetType);

  const { isLoading } = useChildCategories();

  const fuse = new Fuse(subCategories, {
    keys: ["name"],
    threshold: 0.1,
  });

  const filteredCategories = useMemo(() => {
    // Start with a shallow copy of subCategories using slice()
    let filtered = subCategories.slice();

    if (search) {
      filtered = fuse.search(search).map((result) => result.item);
    }

    if (visibilityFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.visibility === (visibilityFilter === "visible")
      );
    }

    if (filtered.length === 0) return [];

    switch (sortOrder) {
      case "asc":
        return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
      case "desc":
        return filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [subCategories, search, visibilityFilter, sortOrder, fuse]);

  const editCategory = useCallback((category: CategoryType) => {
    if (category.parentCategoryIds.length > 0) {
      setSelectSingleParentCat(category.parentCategoryIds[0]);
    }
    setCategoryStep("EDIT_SUB_CATEGORY");
    setVisibility(category.visibility ?? false);
    setAvailability(category.availability ?? false);
    setImagePreview(category.coverImage ?? null);
    setIdCheck(category.parentCategoryIds);
    setRecommendationIds(category.dishIds);
    setRemoveRecommendationIds(category.dishIds);
    setCategoryName(category.name);
    setCatId(category._id?.toString() ?? "");
    setOpenMenu(true);
    setEditingSubCat(true);
    setTimings(category.timings ?? []);
  }, []);

  const { mutateAsync: saveSequenceToAPI } = useMutation({
    mutationFn: async (sequenceCategories: { categoryId: string; sequence: number }[]) => {
      const response = await apiRpc.categories.sequence[':businessId'].$post({
        param: {
          businessId,
        },
        json: sequenceCategories,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data?.err) {
        queryClient.invalidateQueries({ queryKey: ['parentCategories'] });
        setSequenceCategories([]);
        toast.success('Sequence updated successfully');
      } else {
        toast.error(data?.message);
      }
    },
    onError: () => {
      toast.error('Failed to update sequence');
    },
  });

  const toggleSequenceMode = async () => {
    if (sequenceMode) {
      const formattedSequenceCategories = sequenceCategories.map((category) => ({
        categoryId: category._id,
        sequence: category.sequence,
        hierarchy: "CHILD",
      }));
      await saveSequenceToAPI(formattedSequenceCategories);
    }
    setSequenceMode((prev) => !prev);
    setSelected(null);
    if (!sequenceMode) {
      const updatedSequenceCategories = subCategories.map((category, index) => ({
        _id: category._id,
        sequence: category.sequence === 0 ? index + 1 : category.sequence,
        hierarchy: "CHILD",
      }));
      setSequenceCategories(updatedSequenceCategories);
      setSubCategories(
        subCategories.map((category, index) => ({
          ...category,
          sequence: category.sequence === 0 ? index + 1 : category.sequence,
          hierarchy: "CHILD",
        }))
      );
    }
  };

  const handleSwap = useCallback(
    (category) => {
      if (!selected) {
        setSelected(category);
      } else {
        const updatedCategories = [...subCategories];
        const firstIndex = updatedCategories.findIndex(
          (c) => c._id === selected._id
        );
        const secondIndex = updatedCategories.findIndex(
          (c) => c._id === category._id
        );

        if (firstIndex !== -1 && secondIndex !== -1) {
          // Swap the categories
          [updatedCategories[firstIndex], updatedCategories[secondIndex]] =
            [updatedCategories[secondIndex], updatedCategories[firstIndex]];

          // Swap the sequence values
          const tempSequence = updatedCategories[firstIndex].sequence;
          updatedCategories[firstIndex].sequence = updatedCategories[secondIndex].sequence;
          updatedCategories[secondIndex].sequence = tempSequence;

          setSequenceCategories(
            updatedCategories.map(({ _id, sequence }) => ({ _id, sequence }))
          );
          setSubCategories(updatedCategories);
        }
        setSelected(null);
      }
    },
    [selected, subCategories, setSubCategories]
  );

  const isManage = !pathname.includes("allservices");
  const isServiceManager = pathname.includes("serviceManager");

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <section className="flex relative flex-wrap justify-start py-[7rem] gap-4 mx-4 lg:py-[5rem]">
      <h3 className="absolute left-0 text-xl font-semibold text-black lg:top-[2rem] top-[4rem]">
        {outLetType === "OTHER" ? "Catalogue" : "Categories"} (
        {filteredCategories?.length})
      </h3>{" "}
      {filteredCategories ? filteredCategories?.map((category, index) => (
        <div onKeyDown={() => (sequenceMode ? handleSwap(category) : null)} onClick={() => (sequenceMode ? handleSwap(category) : null)} key={category.name} className="relative w-full max-w-[28rem]">
          {sequenceMode && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 rounded-2xl">
              <span className="text-4xl font-bold text-white">{category.sequence || index + 1}</span>
            </div>
          )}
          <button
            type="button"
            key={category.name}
            onClick={() => editCategory(category)}

            className={`flex items-center justify-between w-full p-4 bg-white h-[4.5rem] rounded-2xl shadow max-w-[28rem] transition ${sequenceMode ? "cursor-pointer border-2" : ""
              } ${selected?._id === category._id ? "ring-2 ring-offset-2 ring-green-500" : ""}`}
          >
            {isManage ? (<figure className="flex items-center gap-4">
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
                {sequenceMode && (
                  <span className="text-xs text-gray-500">
                    Position: {category.sequence || index + 1}
                  </span>
                )}
                <div className="flex gap-2">
                  {category.visibility ? null : <FaEyeSlash className="text-red-500" />}
                  {category.coverImage ? null : <PiCameraSlashFill className="text-red-500" />}
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
              <button type="button" className="pl-4 text-black">
                <BiSolidEditAlt />
              </button>
            </article>
          </button>
        </div>
      )) : <center>No Sub Category</center>}
      {isServiceManager ? <BottomButton fixed buttons={[
        { text: sequenceMode ? "Done" : "Sequence", onClick: toggleSequenceMode, type: "button" },
      ]} /> : null}
    </section>
  );
};
const ListOfChildCategory = memo(MemoListOfChildCategory);
export default ListOfChildCategory;
