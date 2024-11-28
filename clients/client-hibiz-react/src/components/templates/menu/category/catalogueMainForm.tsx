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

const CatalogueMainForm = memo(() => {
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
    selectSingleParentCat,
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
    selectSingleParentCat: s.selectSingleParentCat,
  }));

  const businessData = useBusinessData((s) => s.businessData);
  const { mutate: createCategory, isPending } = useSaveCategory();

  const handleSaveCategory = useCallback(() => {
    if (!categoryName) {
      toast.error("Category name is required");
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
            parentCategoryIds: selectSingleParentCat || [],
            dishIds: recommendationIds,
          };

    createCategory(payload);
  }, [
    selectedCategory,
    categoryName,
    selectIds,
    businessData?._id,
    recommendationIds,
    selectSingleParentCat,
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
    <section className="flex flex-col gap-6 mx-6 lg:mx-16 lg:mt-6 lg:flex-row">
      <article className="flex-1">
        <label className="font-semibold opacity-50" htmlFor="name">
          Catalogue Name*
        </label>
        <Background>
          <input
            type="text"
            id="name"
            placeholder="Enter Catalogue Name"
            value={categoryName}
            maxLength={21}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
          />
        </Background>
      </article>
      <section className="flex-1">
        <label className="font-semibold opacity-50" htmlFor="name">
          Link Services ({recommendationIds?.length})
        </label>
        <Background>
          <button
            onClick={() => setCategoryStep("LINK_DISH")}
            type="button"
            className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
          >
            <RiLinkUnlink className="mr-2" /> Link Services
          </button>
        </Background>
      </section>
      <FooterButtons
        saveCategory={handleSaveCategory}
        goToNextStep={goToNextStep}
      />
    </section>
  );
});

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

export default CatalogueMainForm;
