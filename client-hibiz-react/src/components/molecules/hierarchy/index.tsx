import PopUp from "@/components/atom/popUp";
import {
  Hierarchy,
  useDishSelectionStore,
} from "@/components/store/useDishStore";
import { ICategory } from "@/components/types/businessData";
import React, { memo, useMemo, useState } from "react";

interface ICategoryComponent {
  allCategories: ICategory[];
  closeModal: () => void;
  show: () => void;
}

const HierarchyComponent: React.FC<ICategoryComponent> = memo(({
  allCategories,
  closeModal,
}) => {
  const {
    hierarchy,
    setHierarchy,
    setParentCategoryId,
    setParentCategory,
    categoryName,
  } = useDishSelectionStore();
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );

  const handleHierarchyChange = (hierarchyValue: Hierarchy) => {
    setHierarchy(hierarchyValue);

    if (hierarchyValue === "CHILD") {
      setIsParentModalOpen(true);
    } else {
      closeModal();
    }
  };
  const parents = useMemo(
    () => allCategories.filter((category) => category.hierarchy === "PARENT"),
    [allCategories]
  );

  const getParent = (category: ICategory) => {
    setSelectedCategory(category);
    setParentCategoryId(category.id);
    setParentCategory(category.name);
  };

  return (
    <div className="p-4 bg-[#f5f5f5] rounded-2xl shadow">
      <h3 className="pb-2 text-lg font-bold">Hierarchy</h3>
      <div className="space-y-4">
        <div className="flex items-start bg-white p-2 border border-[#cacaca] rounded-md">
          <input
            type="radio"
            id="parent"
            name="hierarchy"
            checked={hierarchy === "PARENT"}
            onChange={() => handleHierarchyChange("PARENT")}
            className="mt-1 rounded-sm focus:outline-none focus:ring-0"
          />
          <label htmlFor="parent" className="flex flex-col ml-2">
            <span className="font-semibold">Parent</span>
            <span className="text-sm text-gray-600">
              A parent category is the big group that holds smaller groups.
            </span>
          </label>
        </div>

        <div className="flex items-start bg-white p-2 border border-[#cacaca] rounded-md">
          <input
            type="radio"
            id="child"
            name="hierarchy"
            checked={hierarchy === "CHILD"}
            onChange={() => handleHierarchyChange("CHILD")}
            className="mt-1 rounded-sm focus:outline-none focus:ring-0"
          />
          <label htmlFor="child" className="flex flex-col ml-2">
            <span className="font-semibold">Child</span>
            <span className="text-sm text-gray-600">
              A child category is a sub-group within a main category.
            </span>
          </label>
        </div>
        {isParentModalOpen && (
          <PopUp
            show={isParentModalOpen}
            onClose={() => {
              setIsParentModalOpen(false);
              handleHierarchyChange("PARENT");
              setParentCategory("");
              setParentCategoryId("");
            }}
          >
            <div className="bg-[#f5f5f5] rounded-2xl shadow overflow-y-auto max-h-[90vh] pb-[8rem]">
              <div className="py-4 mx-4 font-semibold">
                Select Parent Category for{" "}
                {categoryName ? categoryName : "Child Category"}
              </div>
              <div className="grid grid-cols-2 gap-4 mx-6">
                {parents
                  .filter((ele) => ele.name !== categoryName)
                  .map((parent) => (
                    <div
                      key={parent?.id}
                      onClick={() => getParent(parent)}
                      className={`p-4 border border-[#cacaca] rounded-md ${
                        selectedCategory?.id === parent?.id
                          ? "bg-[#2B354D]/90 text-white"
                          : "bg-white text-[#2B354D]"
                      }`}
                    >
                      <div className={`flex justify-between items-center`}>
                        <div className="font-medium">{parent?.name}</div>
                      </div>
                    </div>
                  ))}
              </div>

              {selectedCategory && (
                <div
                  onClick={() => {
                    setIsParentModalOpen(false);
                    closeModal();
                  }}
                  className="fixed z-20 w-full px-6 bottom-4"
                >
                  <button type="button" className="w-full max-w-[25rem] bg-[#2B354D] text-white rounded-md py-2 on_active_bounce">
                    Save
                  </button>
                </div>
              )}
            </div>
          </PopUp>
        )}
      </div>
    </div>
  );
});

export default HierarchyComponent;
