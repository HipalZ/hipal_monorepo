import Table from '@/assets/cart/Table.png';
import QuickFilter from '@/components/atoms/quickFilter';
import { _useAllBusiness } from '@/components/store/useAllBusiness';
import { useSearch } from '@/components/store/useSearch';
import useTableData from '@/components/store/useTableData';
import type { CategoryType, DishType } from '@hi/db-models/src/validators';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { memo, useMemo } from 'react';
import SearchPanelCom from './searchPanelCom';

function Header({ categories, primaryColor, secondaryColor }: { categories: CategoryType[]; primaryColor: string; secondaryColor: string }) {
  const { isSearchActive, setIsSearchActive, setSearchText, setShowHeader, showHeader } = useSearch();
  const { hiCode } = useTableData();

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const allDishes: DishType[] = useMemo(() => {
    const result: DishType[] = [];

    const collectDishes = (category: CategoryType) => {
      if (category.dishIds && category.dishIds.length > 0) {
        result.push(...(category.dishIds.filter((dish) => typeof dish !== 'string') as unknown as DishType[]));
      }

      if (category.subCategoryIds && category.subCategoryIds.length > 0) {
        for (const subCategory of category.subCategoryIds) {
          if (typeof subCategory !== 'string') {
            collectDishes(subCategory);
          }
        }
      }
    };

    for (const category of categories) {
      collectDishes(category);
    }

    return result;
  }, [categories]);

  if (outletInfo?.outLetType === 'OTHER') {
    return null;
  }

  const openDishSearch = () => {
    setSearchText('');
    setIsSearchActive(true);
    setShowHeader(true);
  };

  return (
    <motion.div
      style={{
        // background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        backgroundColor: `${secondaryColor}`,
      }}
      className={`sticky top-0 z-[1000] flex flex-col pb-2 text-4xl text-black ${
        isSearchActive ? 'min-h-[100dvh] overflow-y-auto' : 'overflow-hidden'
      }`}
      initial={{ opacity: 0, y: -100 }}
      animate={{
        opacity: showHeader ? 1 : 0,
        y: showHeader ? 0 : -100,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="relative flex w-full flex-col items-start justify-between overflow-hidden">
        {hiCode && (
          <div className="flex w-full items-center justify-end px-2 text-3xl">
            <div className="flex items-center gap-2 text-xl font-semibold opacity-80">
              <Image src={Table} width={24} height={24} alt="Table" />
              <span className="text-sm">
                Table Code <b className="text-base">{hiCode}</b>
              </span>
            </div>
          </div>
        )}
        {outletInfo?.outLetType !== 'OTHER' && !isSearchActive && (
          <motion.div
            className="mt-2 flex w-full items-center gap-2 px-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="hide-scrollbar min-w-0 flex-1 overflow-x-auto">
              <QuickFilter />
            </div>
            <button
              type="button"
              onClick={openDishSearch}
              aria-label="Search dishes"
              className="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white p-2 text-sm font-semibold text-black"
              style={{
                color: primaryColor,
                borderColor: `${primaryColor}30`,
              }}
              disabled={isSearchActive}
            >
              <Search className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SearchPanelCom allDishes={allDishes} primaryColor={primaryColor} secondaryColor={secondaryColor} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const MemoHeader = memo(Header);
export default MemoHeader;
