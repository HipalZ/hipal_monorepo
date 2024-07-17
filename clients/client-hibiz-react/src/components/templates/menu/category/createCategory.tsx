import MemoizedHeader from "@/components/molecules/header";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { memo, useCallback } from "react"
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import CategoryMainForm from "./categoryMainForm";



const CreateCategoryMain = () => {
    const { setOpenMenu, categoryStep, setCategoryStep } = useMenuPageStore(s => ({
        setOpenMenu: s.setOpenMenu,
        categoryStep: s.categoryStep,
        setCategoryStep: s.setCategoryStep
    }));
    const closeCategory = useCallback(() => {
        setOpenMenu(false);
    }, [])

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
            default:
                setOpenMenu(false);
                break;
        }
    }, [categoryStep])

    return (
        <>
            <MemoizedHeader
                title="Create Category"
                onBack={goBack}
                leftIcon={<FaArrowLeft />}
                centerImage={Hi}
                rightImage={Hi}
                isIconBusinessShow={false}
            />
            {
                categoryStep === "CATEGORY_STEP_1" && <CategoryMainForm />
            }
            {
                categoryStep === "CATEGORY_STEP_2" && <div>
                    Welcome to step 2
                </div>
            }
        </>
    )
}
const CreateCategory = memo(CreateCategoryMain)
export default CreateCategory