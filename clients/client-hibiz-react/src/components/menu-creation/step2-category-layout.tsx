import { memo, useCallback } from "react";
import {
  CategoryLayout,
  useMenuCreationStore,
  MenuType,
  type Category,
} from "@/components/store/useMenuCreationStore";
import { ParentCategory } from "@/configs/test";
import PhonePreview from "./phone-preview";

// Sample parent categories based on the provided data
const sampleParentCategories = ParentCategory;

interface Step2CategoryLayoutProps {
  categories: Category[];
}

const Step2CategoryLayout = memo(({ categories }: Step2CategoryLayoutProps) => {
  const { categoryLayout, setCategoryLayout, menuType } = useMenuCreationStore(
    (state) => ({
      categoryLayout: state.categoryLayout,
      setCategoryLayout: state.setCategoryLayout,
      menuType: state.menuType,
    }),
  );

  const handleSelectLayout = useCallback(
    (layout: CategoryLayout) => {
      setCategoryLayout(layout);
    },
    [setCategoryLayout],
  );

  // Get sample dishes for preview
  const sampleDishes = categories.reduce((dishes, category) => {
    if (category.dishIds && category.dishIds.length) {
      dishes.push(...category.dishIds);
    }
    return dishes;
  }, [] as any[]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2 className="text-xl font-semibold text-center">
        Choose Category Layout
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pb-[10rem]">
        {/* Phone Preview */}
        <div className="flex items-center justify-center">
          <PhonePreview
            categories={categories}
            dishes={sampleDishes}
            parentCategories={
              menuType === MenuType.MAIN_SUB_DISH ? sampleParentCategories : []
            }
            showDishLayout={true}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Edge Layout */}
            <button
              type="button"
              onClick={() => handleSelectLayout(CategoryLayout.EDGE)}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                categoryLayout === CategoryLayout.EDGE
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <h3 className="mb-2 text-lg font-medium">Edge Layout</h3>
              <p className="mb-4 text-sm text-center text-gray-500">
                Categories on the left sidee with dishes on the right
              </p>

              <div className="w-full h-32 max-w-xs overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex h-full">
                  <div className="w-1/4 h-full border-r border-gray-200 bg-gray-50" />
                  <div className="grid w-3/4 h-full grid-cols-2 gap-1 p-1">
                    <div className="bg-gray-100 rounded" />
                    <div className="bg-gray-100 rounded" />
                    <div className="bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </button>

            {/* Classic Layout */}
            <button
              type="button"
              onClick={() => handleSelectLayout(CategoryLayout.CLASSIC)}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                categoryLayout === CategoryLayout.CLASSIC
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <h3 className="mb-2 text-lg font-medium">Classic Layout</h3>
              <p className="mb-4 text-sm text-center text-gray-500">
                Categories at the top with dishes below
              </p>

              <div className="w-full h-32 max-w-xs overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-col h-full">
                  <div className="h-10 border-b border-gray-200 bg-gray-50" />
                  <div className="grid flex-1 grid-cols-2 gap-1 p-1">
                    <div className="bg-gray-100 rounded" />
                    <div className="bg-gray-100 rounded" />
                    <div className="bg-gray-100 rounded" />
                    <div className="bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </button>
            {/* Collapse Layout */}
            <button
              type="button"
              onClick={() => handleSelectLayout(CategoryLayout.COLLAPSE)}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                categoryLayout === CategoryLayout.COLLAPSE
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <h3 className="mb-2 text-lg font-medium">Collapse Layout</h3>
              <p className="mb-4 text-sm text-center text-gray-500">
                Items are collapsible sections under sub-categories
              </p>

              <div className="w-full h-32 max-w-xs overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex flex-col h-full justify-center px-4 gap-2">
                  <div className="h-6 w-24 bg-gray-100 rounded-sm" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

Step2CategoryLayout.displayName = "Step2CategoryLayout";
export default Step2CategoryLayout;
