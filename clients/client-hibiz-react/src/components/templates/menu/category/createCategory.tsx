import MemoizedHeader from "@/components/molecules/header";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { memo, useCallback } from "react"
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import CategoryMainForm from "./categoryMainForm";
import SelectCategory from "./selectCategory";
import SelectSubCategory from "./selectSubCategory";
import AddCatImage from "./addCatImage";

const CreateCategoryMain = () => {
    const { setOpenMenu, categoryStep, setCategoryStep } = useMenuPageStore(s => ({
        setOpenMenu: s.setOpenMenu,
        categoryStep: s.categoryStep,
        setCategoryStep: s.setCategoryStep,
        selectedPage: s.selectedPage,
    }));

    const goBack = useCallback(() => {
        switch (categoryStep) {
            case "CATEGORY_STEP_1":
                setOpenMenu(false);
                break;
            case "CATEGORY_STEP_2":
                setCategoryStep("CATEGORY_STEP_1")
                break;
            case "CATEGORY_STEP_3":
                setCategoryStep("CATEGORY_STEP_2")
                break;
            case "LINK_MAIN_CATEGORY":
                setCategoryStep("CATEGORY_STEP_1")
                break;
            case "LINK_SUB_CATEGORY":
                setCategoryStep("CATEGORY_STEP_1")
                break;
            default:
                setOpenMenu(false);
                break;
        }
    }, [categoryStep])

    return (
        < >
            <header className="sticky top-0 z-10 w-full rounded-t-2xl bg-base-100">
                <MemoizedHeader
                    title="Create Category"
                    onBack={goBack}
                    leftIcon={<FaArrowLeft />}
                    centerImage={Hi}
                    rightImage={Hi}
                    isIconBusinessShow={false}
                />
            </header>
            {
                categoryStep === "CATEGORY_STEP_1" && <CategoryMainForm />
            }
            {
                categoryStep === "LINK_MAIN_CATEGORY" && <SelectCategory />
            }
            {
                categoryStep === "LINK_SUB_CATEGORY" && <SelectSubCategory />
            }
            {
                categoryStep === "CATEGORY_STEP_2" && <AddCatImage />
            }
        </>
    )
}
const CreateCategory = memo(CreateCategoryMain)
export default CreateCategory