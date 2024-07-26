import { memo, useCallback } from "react";
import { cn } from "@hi/common/src/error-handler";
import { RiGitBranchLine, RiLinkUnlink } from "react-icons/ri";
import { TbCircuitSwitchClosed } from "react-icons/tb";
import useMenuPageStore, {
  type CategoryTypeToggle,
} from "@/components/store/useMenuStorage";
import Background from "@/components/atom/feildBackground";
import useBusinessData from "@/components/store/useBusinessData";
import toast from "react-hot-toast";
import { useSaveCategory } from "@/hooks/useCategory";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import BottomButton from "@/components/atom/bottomButton";

const CategoryMainForm = memo(() => {
  const {
    selectedCategory,
    setSelectedCategory,
    categoryStep,
    categoryName,
    setCategoryName,
    setCategoryStep,
    resetStore,
    selectIds,
    recommendationIds,
  } = useMenuPageStore((s) => ({
    selectedCategory: s.selectedCategory,
    setSelectedCategory: s.setSelectedCategory,
    categoryName: s.categoryName,
    setCategoryName: s.setCategoryName,
    setCategoryStep: s.setCategoryStep,
    resetStore: s.resetStore,
    selectIds: s.selectedIds,
    categoryStep: s.categoryStep,
    recommendationIds: s.recommendationIds,
  }));

  const businessData = useBusinessData((s) => s.businessData);
  const { mutate: createCategory, isPending } = useSaveCategory();

  const categoryChange = useCallback((type: CategoryTypeToggle) => {
    if (type !== selectedCategory) {
      resetStore();
    }
    setSelectedCategory(type);
  }, []);

  const handleSaveCategory = useCallback(() => {
    if (!categoryName) {
      toast.error("Category name is required");
      return;
    }
    if (selectedCategory === "SUB_CATEGORY" && selectIds.length === 0) {
      toast.error("Please select main category");
      return;
    }

    const commonPayload = {
      name: categoryName,
      businessId: businessData?._id.toString() || "",
    };

    const payload =
      selectedCategory === "MAIN_CATEGORY"
        ? { ...commonPayload, hierarchy: "PARENT", subCategoryIds: selectIds }
        : {
            ...commonPayload,
            hierarchy: "CHILD",
            parentCategoryIds: selectIds || [],
            dishIds: recommendationIds,
          };

    createCategory(payload);
  }, [
    selectedCategory,
    categoryName,
    selectIds,
    businessData?._id,
    recommendationIds,
  ]);

  const goToNextStep = useCallback(() => {
    if (categoryName?.trim() === "") {
      toast.error("Category name is required");
      return;
    }
    setCategoryStep("CATEGORY_STEP_2");
  }, [categoryStep, categoryName]);

  if (isPending) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Category Name*
        </label>
        <Background>
          <input
            type="text"
            id="name"
            placeholder="Enter Category Name"
            value={categoryName}
            maxLength={21}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
          />
        </Background>
      </article>

      <SelectionArea
        selectedCategory={selectedCategory}
        categoryChange={categoryChange}
      />
      {selectedCategory === "MAIN_CATEGORY" && (
        <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="name">
            Link Sub-Categories({selectIds?.length})
          </label>
          <Background>
            <button
              onClick={() => setCategoryStep("LINK_SUB_CATEGORY")}
              type="button"
              className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
            >
              <RiLinkUnlink className="mr-2" /> Link Sub Categories
            </button>
          </Background>
        </section>
      )}

      {selectedCategory === "SUB_CATEGORY" && (
        <>
          <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Main Categories({selectIds?.length})
            </label>
            <Background>
              <button
                onClick={() => setCategoryStep("LINK_MAIN_CATEGORY")}
                type="button"
                className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
              >
                <RiLinkUnlink className="mr-2" /> Link Main Categories
              </button>
            </Background>
          </section>

          <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Dishes ({recommendationIds?.length})
            </label>
            <Background>
              <button
                onClick={() => setCategoryStep("LINK_DISH")}
                type="button"
                className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
              >
                <RiLinkUnlink className="mr-2" /> Link Dishes
              </button>
            </Background>
          </section>
        </>
      )}
      <section className="mx-6">
        <FooterButtons
          saveCategory={handleSaveCategory}
          goToNextStep={goToNextStep}
        />
      </section>
    </>
  );
});

const SelectionArea = memo(
  ({
    selectedCategory,
    categoryChange,
  }: {
    selectedCategory: CategoryTypeToggle;
    categoryChange: (type: CategoryTypeToggle) => void;
  }) => {
    return (
      <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Category type*
        </label>
        <article className="p-4 mt-2 bg-white rounded-xl">
          <label className="text-xs font-semibold opacity-50" htmlFor="name">
            Select one type*
          </label>
          <article className="flex w-full mt-4">
            <button
              type="button"
              className={cn(
                "p-6 rounded-2xl flex-1 mx-2 text-left",
                selectedCategory === "MAIN_CATEGORY"
                  ? "bg-[#F1E9FB] text-[#8C63FF]"
                  : "bg-[#f4f4f490]",
              )}
              onClick={() => categoryChange("MAIN_CATEGORY")}
            >
              <RiGitBranchLine className="rotate-180" size={28} />
              Main categories
            </button>
            <button
              type="button"
              className={cn(
                "p-6 rounded-2xl flex-1 mx-2 text-left",
                selectedCategory === "SUB_CATEGORY"
                  ? "bg-[#F1E9FB] text-[#8C63FF]"
                  : "bg-[#f4f4f490]",
              )}
              onClick={() => categoryChange("SUB_CATEGORY")}
            >
              <TbCircuitSwitchClosed size={28} className="-ml-2 rotate-90" />
              Sub Categories
            </button>
          </article>
        </article>
      </section>
    );
  },
);

const FooterButtons = memo(
  ({
    saveCategory,
    goToNextStep,
  }: {
    saveCategory: () => void;
    goToNextStep: () => void;
  }) => (
    <BottomButton
      buttons={[
        { text: "Quick Save", onClick: saveCategory, type: "button" },
        { text: "Next", onClick: goToNextStep, type: "button" },
      ]}
    />
  ),
);

export default CategoryMainForm;
