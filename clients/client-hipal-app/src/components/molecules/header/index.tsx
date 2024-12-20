import { memo, useMemo } from "react";
import QuickFilter from "@/components/atoms/quickFilter";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import SearchPanelCom from "./searchPanelCom";
import { useSearch } from "@/components/store/useSearch";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useTableData from "@/components/store/useTableData";
import Table from "@/assets/cart/Table.png";
import Image from "next/image";

function Header({ categories }: { categories: CategoryType[] }) {
  const { isSearchActive, showHeader } = useSearch();
  const { hiCode } = useTableData();

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const allDishes: DishType[] = useMemo(() => {
    const result: DishType[] = [];

    const collectDishes = (category: CategoryType) => {
      if (category.dishIds && category.dishIds.length > 0) {
        result.push(...category.dishIds);
      }

      if (category.subCategoryIds && category.subCategoryIds.length > 0) {
        for (const subCategory of category.subCategoryIds) {
          collectDishes(subCategory);
        }
      }
    };

    for (const category of categories) {
      collectDishes(category);
    }

    return result;
  }, [categories]);

  return (
    <div
      className={`${
        showHeader
          ? "sticky top-0 z-50 bg-[#ffffff] opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full"
      } transition-all duration-300 ease-in-out flex flex-col space-y-2 text-4xl py-2 text-black overflow-hidden`}
    >
      <div className="relative flex flex-col items-start justify-between w-full overflow-hidden">
        <h3 className="flex items-center justify-between w-full px-2 text-3xl">
          {outletInfo?.outLetType === "OTHER" ? "Catalogue" : "Menu"}
          {hiCode && (
            <h5 className="flex items-center gap-2 text-xl font-semibold opacity-80">
              <Image src={Table} width={36} height={36} alt="Table" />
              <span className="text-base">Table Code</span> {hiCode}
            </h5>
          )}
        </h3>
        {outletInfo?.outLetType !== "OTHER" && (
          <div className="mt-2 mr-2">
            <QuickFilter />
          </div>
        )}
      </div>
      {isSearchActive && <SearchPanelCom allDishes={allDishes} />}
    </div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
