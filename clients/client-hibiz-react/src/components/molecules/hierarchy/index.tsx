import PopUp from '@/components/atom/popUp';
import { Hierarchy, useDishSelectionStore } from '@/components/store/useDishStore';
import { ICategory } from '@/components/types/businessData';
import React, { memo, useMemo, useState } from 'react';

interface ICategoryComponent {
  allCategories: ICategory[];
  closeModal: () => void;
  show: () => void;
}

const HierarchyComponent: React.FC<ICategoryComponent> = memo(({ allCategories, closeModal }) => {
  const { hierarchy, setHierarchy, setParentCategoryId, setParentCategory, categoryName } = useDishSelectionStore();
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

  const handleHierarchyChange = (hierarchyValue: Hierarchy) => {
    setHierarchy(hierarchyValue);

    if (hierarchyValue === 'CHILD') {
      setIsParentModalOpen(true);
    } else {
      closeModal();
    }
  };
  const parents = useMemo(() => allCategories.filter((category) => category.hierarchy === 'PARENT'), [allCategories]);

  const getParent = (category: ICategory) => {
    setSelectedCategory(category);
    setParentCategoryId(category._id);
    setParentCategory(category.name);
  };

  return (
    <div className="rounded-2xl bg-[#f5f5f5] p-4 shadow">
      <h3 className="pb-2 text-lg font-bold">Hierarchy</h3>
      <div className="space-y-4">
        <div className="flex items-start rounded-md border border-[#cacaca] bg-white p-2">
          <input
            type="radio"
            id="parent"
            name="hierarchy"
            checked={hierarchy === 'PARENT'}
            onChange={() => handleHierarchyChange('PARENT')}
            className="mt-1 rounded-sm focus:outline-none focus:ring-0"
          />
          <label htmlFor="parent" className="ml-2 flex flex-col">
            <span className="font-semibold">Parent</span>
            <span className="text-sm text-gray-600">A parent category is the big group that holds smaller groups.</span>
          </label>
        </div>

        <div className="flex items-start rounded-md border border-[#cacaca] bg-white p-2">
          <input
            type="radio"
            id="child"
            name="hierarchy"
            checked={hierarchy === 'CHILD'}
            onChange={() => handleHierarchyChange('CHILD')}
            className="mt-1 rounded-sm focus:outline-none focus:ring-0"
          />
          <label htmlFor="child" className="ml-2 flex flex-col">
            <span className="font-semibold">Child</span>
            <span className="text-sm text-gray-600">A child category is a sub-group within a main category.</span>
          </label>
        </div>
        {isParentModalOpen && (
          <PopUp
            show={isParentModalOpen}
            onClose={() => {
              setIsParentModalOpen(false);
              handleHierarchyChange('PARENT');
              setParentCategory('');
              setParentCategoryId('');
            }}
          >
            <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-[#f5f5f5] pb-[8rem] shadow">
              <div className="mx-4 py-4 font-semibold">Select Parent Category for {categoryName ? categoryName : 'Child Category'}</div>
              <div className="mx-6 grid grid-cols-2 gap-4">
                {parents
                  .filter((ele) => ele.name !== categoryName)
                  .map((parent) => (
                    <div
                      key={parent?._id}
                      onClick={() => getParent(parent)}
                      className={`rounded-md border border-[#cacaca] p-4 ${
                        selectedCategory?._id === parent?._id ? 'bg-[#2B354D]/90 text-white' : 'bg-white text-[#2B354D]'
                      }`}
                    >
                      <div className={`flex items-center justify-between`}>
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
                  className="fixed bottom-4 z-20 w-full px-6"
                >
                  <button type="button" className="on_active_bounce w-full max-w-[25rem] rounded-md bg-[#2B354D] py-2 text-white">
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
