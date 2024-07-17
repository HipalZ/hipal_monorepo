import MemoizedHeader from "@/components/molecules/header";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { memo, useCallback } from "react"
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import CategoryMainForm from "./categoryMainForm";



const CreateCategoryMain = () => {
    const { setOpenMenu, } = useMenuPageStore(s => ({
        setOpenMenu: s.setOpenMenu,
    }));
    const closeCategory = useCallback(() => {
        setOpenMenu(false);
    }, [])

    return (
        <>
            <MemoizedHeader
                title="Create Category"
                onBack={closeCategory}
                leftIcon={<FaArrowLeft />}
                centerImage={Hi}
                rightImage={Hi}
                isIconBusinessShow={false}
            />
            <CategoryMainForm />
        </>
    )
}
const CreateCategory = memo(CreateCategoryMain)
export default CreateCategory