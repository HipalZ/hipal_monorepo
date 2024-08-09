import Background from "@/components/atom/feildBackground";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { memo } from "react";
import { MdDelete } from "react-icons/md";
import { RiLinkUnlink } from "react-icons/ri";

const MemoLinkingCategoryComp = () => {
  const {
    setCategoryStep,
    categoryStep,
    recommendationIds,
    selectIds,
    isCatDelete,
    setIsCatDelete,
    selectSingleParentCat
  } = useMenuPageStore((s) => ({
    setCategoryStep: s.setCategoryStep,
    categoryStep: s.categoryStep,
    recommendationIds: s.recommendationIds,
    selectIds: s.selectedIds,
    setIsCatDelete: s.setIsCatDelete,
    isCatDelete: s.isCatDelete,
    selectSingleParentCat: s.selectSingleParentCat,
  }));

  console.log(selectSingleParentCat);
  
  return (
    <>
      {categoryStep === "EDIT_MAIN_CATEGORY" && (
        <>
          <section className="mt-4 lg:mt-6">
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
          {!isCatDelete && (
            <section className="mt-4 lg:mt-6">
              <label className="font-semibold opacity-50" htmlFor="name">
                Delete Category
              </label>
              <Background>
                <button
                  onClick={() => setIsCatDelete(true)}
                  type="button"
                  className="bg-[#d32a2a] w-full py-2 rounded-full flex items-center justify-center text-white"
                >
                  <MdDelete className="mr-2" /> Delete Category
                </button>
              </Background>
            </section>
          )}
        </>
      )}

      {categoryStep === "EDIT_SUB_CATEGORY" && (
        <>
          <section className="mt-4 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Main Categories({selectSingleParentCat?.length})
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

          <section className="mt-4 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Dishes ({recommendationIds?.length})
            </label>
            <Background>
              <button
                type="button"
                onClick={() => setCategoryStep("LINK_DISH")}
                className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
              >
                <RiLinkUnlink className="mr-2" /> Link Dishes
              </button>
            </Background>
          </section>
          {!isCatDelete && (
            <section className="mt-4 lg:mt-6">
              <label className="font-semibold opacity-50" htmlFor="name">
                Delete Category
              </label>
              <Background>
                <button
                  onClick={() => setIsCatDelete(true)}
                  type="button"
                  className="bg-[#d32a2a] w-full py-2 rounded-full flex items-center justify-center text-white"
                >
                  <MdDelete className="mr-2" /> Delete Category
                </button>
              </Background>
            </section>
          )}
        </>
      )}
    </>
  );
};
const LinkingCategoryComp = memo(MemoLinkingCategoryComp);
export default LinkingCategoryComp;
