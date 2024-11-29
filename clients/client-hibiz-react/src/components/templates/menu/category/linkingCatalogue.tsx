import Background from "@/components/atom/feildBackground";
import useMenuPageStore from "@/components/store/useMenuStorage";
import { memo } from "react";
import { MdDelete } from "react-icons/md";
import { RiLinkUnlink } from "react-icons/ri";

const MemoLinkingCatalogueComp = () => {
  const {
    setCategoryStep,
    categoryStep,
    recommendationIds,
    isCatDelete,
    setIsCatDelete,
  } = useMenuPageStore((s) => ({
    setCategoryStep: s.setCategoryStep,
    categoryStep: s.categoryStep,
    recommendationIds: s.recommendationIds,
    selectIds: s.selectedIds,
    setIsCatDelete: s.setIsCatDelete,
    isCatDelete: s.isCatDelete,
    selectSingleParentCat: s.selectSingleParentCat,
  }));

  return (
    <>
      {categoryStep === "EDIT_SUB_CATEGORY" && (
        <>
          <section className="mt-4 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Services ({recommendationIds?.length})
            </label>
            <Background>
              <button
                type="button"
                onClick={() => setCategoryStep("LINK_DISH")}
                className="bg-[#f4f4f4] w-full py-2 rounded-full flex items-center justify-center"
              >
                <RiLinkUnlink className="mr-2" /> Link Services
              </button>
            </Background>
          </section>
          {!isCatDelete && (
            <section className="mt-4 lg:mt-6">
              <label className="font-semibold opacity-50" htmlFor="name">
                Delete Catalogue
              </label>
              <Background>
                <button
                  onClick={() => setIsCatDelete(true)}
                  type="button"
                  className="bg-[#d32a2a] w-full py-2 rounded-full flex items-center justify-center text-white"
                >
                  <MdDelete className="mr-2" /> Delete Catalogue
                </button>
              </Background>
            </section>
          )}
        </>
      )}
    </>
  );
};
const LinkingCatalogueComp = memo(MemoLinkingCatalogueComp);
export default LinkingCatalogueComp;
