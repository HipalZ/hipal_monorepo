import { useActiveClass } from "@/components/store/useActiveClass";
import { cn } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import CustomModal from "./customModal";

interface IMainTypes {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}

const MemoMainTypes = (props: IMainTypes) => {
  const { parentCategory, childCategory } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainTypes = useMemo(
    () =>
      parentCategory?.filter((category) => category.subCategoryIds.length > 0),
    [parentCategory],
  );

  const subTypes = useMemo(
    () => childCategory?.filter((category) => category.dishIds.length > 0),
    [childCategory],
  );

  const {
    isActiveParentCategory,
    isActiveCategory,
    isActiveChildCategory,
    setActiveParentCategory,
    setActiveParentCategoryName,
    setActiveCategory,
    setActiveChildCategory,
    setActiveChildCategoryName,
    setObserverActive,
  } = useActiveClass((s) => ({
    isActiveParentCategory: s.isActiveParentCategory,
    isActiveCategory: s.isActiveCategory,
    setActiveParentCategory: s.setActiveParentCategory,
    setActiveParentCategoryName: s.setActiveParentCategoryName,
    setActiveCategory: s.setActiveCategory,
    isActiveChildCategory: s.isActiveChildCategory,
    setActiveChildCategory: s.setActiveChildCategory,
    setActiveChildCategoryName: s.setActiveChildCategoryName,
    setObserverActive: s.setObserverActive,
  }));

  const setMainCategory = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);
      setActiveParentCategory(category._id?.toString() ?? "");
      setActiveParentCategoryName(category.name ?? "");
      setActiveCategory(category.subCategoryIds[0]?.toString() ?? "");
      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
      setIsModalOpen(false);
    },
    [
      setActiveParentCategory,
      setActiveParentCategoryName,
      setActiveCategory,
      setObserverActive,
    ],
  );

  useEffect(() => {
    const hashUrl = window.location.hash;
    const hashValue = hashUrl.substring(1);
    if (hashValue) {
      setActiveCategory(hashValue);
      const subCategory = subTypes?.find((category) =>
        category.dishIds?.some((dish) => dish._id === hashValue),
      );
      if (subCategory) {
        setActiveChildCategory(subCategory._id?.toString() ?? "");
        setActiveChildCategoryName(subCategory.name ?? "");
        const parentCategoryId =
          subCategory.parentCategoryIds[0]?.toString() ?? "";
        const parentCategoryName = mainTypes.find(
          (category) => category._id?.toString() === parentCategoryId,
        )?.name;

        setActiveParentCategory(parentCategoryId);
        setActiveParentCategoryName(parentCategoryName ?? "");
      } else {
        setActiveChildCategory(hashValue);
      }
    } else {
      const parentCategory = mainTypes.find((category) =>
        category?.subCategoryIds.includes(isActiveCategory),
      );
      if (parentCategory) {
        setActiveParentCategory(parentCategory._id?.toString() ?? "");
        setActiveParentCategoryName(parentCategory.name ?? "");
        setActiveChildCategory(
          parentCategory.subCategoryIds[0]?.toString() ?? "",
        );
      }
    }
  }, [isActiveCategory, mainTypes, subTypes, isActiveChildCategory]);

  return (
    <>
      {/* Bottom Menu Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed px-4 py-2 rounded-full bottom-[5rem] transform -translate-x-1/2 left-1/2 bg-primary text-base-100"
      >
        Menu
      </button>

      {/* Custom Modal */}
      <CustomModal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="relative flex flex-col items-center justify-center p-4">
          <h2 className="absolute mb-4 text-xl font-bold top-4">Categories</h2>
          <section className="mt-8 max-h-[50dvh] overflow-auto  py-4 w-full hide-scrollbar">
            {mainTypes.length > 0 && (
              <div className="flex flex-col items-center w-full space-y-2">
                {mainTypes
                  .filter((item) => item?.visibility)
                  .map((item: CategoryType) => (
                    <button
                      type="button"
                      key={item?._id?.toString()}
                      onClick={() => setMainCategory(item)}
                      className={cn(
                        isActiveParentCategory === item._id?.toString()
                          ? " text-primary font-bold"
                          : " text-base-content",
                        "px-4 w-full flex justify-between items-center",
                      )}
                    >
                      <h3>{item?.name}</h3>
                      <h4>{item?.subCategoryIds?.length}</h4>
                    </button>
                  ))}
              </div>
            )}
          </section>
        </div>
      </CustomModal>
    </>
  );
};

const MainTypes = memo(MemoMainTypes);
export default MainTypes;
