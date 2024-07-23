import MemoizedHeader from "@/components/molecules/header";
import useMenuPageStore, {
  type CategoryStep,
} from "@/components/store/useMenuStorage";
import { memo, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import CategoryMainForm from "./categoryMainForm";
import SelectCategory from "./selectCategory";
import SelectSubCategory from "./selectSubCategory";
import AddCatImage from "./addCatImage";
import EditMainCategory from "./editCategory";
import LinkItems from "../dish/[editDish]/linkItems";

const CreateCategoryMain = () => {
  const {
    setOpenMenu,
    categoryStep,
    setCategoryStep,
    catId,
    isMainEditing,
    isSubCategoryEditing,
    openMenu,
  } = useMenuPageStore((s) => ({
    setOpenMenu: s.setOpenMenu,
    categoryStep: s.categoryStep as CategoryStep,
    setCategoryStep: s.setCategoryStep,
    selectedPage: s.selectedPage,
    isMainEditing: s.editingMainCat,
    isSubCategoryEditing: s.editingSubCat,
    catId: s.catId,
    openMenu: s.openMenu,
  }));

  const goBack = useCallback(() => {
    if (isMainEditing) {
      if (categoryStep === "EDIT_MAIN_CATEGORY") {
        setOpenMenu(false);
        return;
      }
      if (
        categoryStep === "LINK_MAIN_CATEGORY" ||
        categoryStep === "LINK_SUB_CATEGORY"
      ) {
        setCategoryStep("EDIT_MAIN_CATEGORY");
        return;
      }
    }

    if (isSubCategoryEditing) {
      if (categoryStep === "LINK_SUB_CATEGORY") {
        setOpenMenu(false);
        return;
      }
      if (
        categoryStep === "LINK_MAIN_CATEGORY" ||
        categoryStep === "LINK_SUB_CATEGORY"
      ) {
        setCategoryStep("EDIT_SUB_CATEGORY");
        return;
      }
      if (categoryStep === "LINK_DISH") {
        setCategoryStep("EDIT_SUB_CATEGORY");
        return;
      }
    }

    switch (categoryStep) {
      case "CATEGORY_STEP_1":
        setOpenMenu(false);
        break;
      case "CATEGORY_STEP_2":
        setCategoryStep("CATEGORY_STEP_1");
        break;
      case "CATEGORY_STEP_3":
        setCategoryStep("CATEGORY_STEP_2");
        break;
      case "LINK_MAIN_CATEGORY":
      case "LINK_SUB_CATEGORY":
        setCategoryStep("CATEGORY_STEP_1");
        break;
      case "LINK_DISH":
        setCategoryStep("CATEGORY_STEP_1");
        break;
      default:
        setOpenMenu(false);
        break;
    }
  }, [categoryStep, isMainEditing,openMenu]);

  return (
    <>
      <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
        <MemoizedHeader
          title={catId !== "" ? "Edit Category" : "Create Category"}
          onBack={goBack}
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
      </header>
      {categoryStep === "CATEGORY_STEP_1" && <CategoryMainForm />}
      {categoryStep === "LINK_MAIN_CATEGORY" && <SelectCategory />}
      {categoryStep === "LINK_SUB_CATEGORY" && <SelectSubCategory />}
      {categoryStep === "CATEGORY_STEP_2" && <AddCatImage />}
      {(categoryStep === "EDIT_MAIN_CATEGORY" ||
        categoryStep === "EDIT_SUB_CATEGORY") && <EditMainCategory />}
      {categoryStep === "LINK_DISH" && <LinkItems />}
    </>
  );
};
const CreateCategory = memo(CreateCategoryMain);
export default CreateCategory;
