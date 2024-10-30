import { useActiveClass } from "@/components/store/useActiveClass";
import { cn } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useCallback, useMemo, useState } from "react";
import CustomModal from "./customModal";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

interface IMainTypes {
  parentCategory: CategoryType[];
}

const MemoMainTypes = (props: IMainTypes) => {
  const { parentCategory } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainTypes = useMemo(
    () =>
      parentCategory?.filter((category) => category.subCategoryIds.length > 0),
    [parentCategory],
  );
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const {
    isActiveParentCategory,
    setActiveParentCategory,
    setActiveCategory,
    setObserverActive,
  } = useActiveClass((s) => ({
    isActiveParentCategory: s.isActiveParentCategory,
    isActiveCategory: s.isActiveCategory,
    setActiveParentCategory: s.setActiveParentCategory,
    setActiveCategory: s.setActiveCategory,
    isActiveChildCategory: s.isActiveChildCategory,
    setObserverActive: s.setObserverActive,
  }));

  const setMainCategory = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);
      setActiveParentCategory(category._id?.toString() ?? "");
      setActiveCategory(category.subCategoryIds[0]?.toString() ?? "");
      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
      setIsModalOpen(false);
    },
    [setActiveParentCategory, setActiveCategory, setObserverActive],
  );

  return (
    <>
      {mainTypes.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="fixed px-6 py-2 rounded-xl bottom-[5rem] transform -translate-x-1/2 left-1/2 bg-primary text-base-100"
          >
            {outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
          </button>

          <CustomModal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="relative flex flex-col items-center justify-center p-4">
              <h2 className="absolute mb-4 text-xl font-bold top-4">
                Categories
              </h2>
              <section className="mt-8 max-h-[50dvh] overflow-auto py-4 w-full hide-scrollbar">
                {mainTypes.length > 0 && (
                  <div className="flex flex-col items-center w-full space-y-2">
                    {mainTypes
                      .filter((item) => item?.visibility)
                      .map((item: CategoryType) => (
                        <button
                          type="button"
                          key={item._id?.toString()}
                          onClick={() => setMainCategory(item)}
                          className={cn(
                            isActiveParentCategory === item._id?.toString()
                              ? " text-primary font-bold"
                              : " text-base-content",
                            "px-4 w-full flex justify-between items-center",
                          )}
                        >
                          <h3>{item.name}</h3>
                          <h4>{item.subCategoryIds?.length}</h4>
                        </button>
                      ))}
                  </div>
                )}
              </section>
            </div>
          </CustomModal>
        </>
      ) : null}
    </>
  );
};

const MainTypes = memo(MemoMainTypes);
export default MainTypes;
