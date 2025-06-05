import { memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuickFilter from "@/components/atoms/quickFilter";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import SearchPanelCom from "./searchPanelCom";
import { useSearch } from "@/components/store/useSearch";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useTableData from "@/components/store/useTableData";
import Table from "@/assets/cart/Table.png";
import Image from "next/image";

function Header({
  categories,
  primaryColor,
  secondaryColor,
}: {
  categories: CategoryType[];
  primaryColor: string;
  secondaryColor: string;
}) {
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

  if (outletInfo?.outLetType === "OTHER") {
    return null;
  }

  return (
    <motion.div
      style={{
        // background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundColor: `${secondaryColor}`,
      }}
      className="sticky top-0 z-[1000] flex flex-col space-y-2 text-4xl py-2 text-black overflow-hidden"
      initial={{ opacity: 0, y: -100 }}
      animate={{
        opacity: showHeader ? 1 : 0,
        y: showHeader ? 0 : -100,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="relative flex flex-col items-start justify-between w-full overflow-hidden">
        <h3 className="flex items-center justify-end w-full px-2 text-3xl">
          {hiCode && (
            <h5 className="flex items-center gap-2 text-xl font-semibold opacity-80">
              <Image src={Table} width={24} height={24} alt="Table" />
              <span className="text-sm">
                Table Code <b className="text-base">{hiCode}</b>
              </span>
            </h5>
          )}
        </h3>
        {outletInfo?.outLetType !== "OTHER" && (
          <motion.div
            className="mt-2 mr-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <QuickFilter />
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SearchPanelCom allDishes={allDishes} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
