import SearchResultsGrid from '@/components/atoms/placeOrders/searchResultsGrid';
import { useOrderStore } from '@/components/store/useOrderData';
import type { CategoryType } from '@hi/db-models/src/validators';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useCategories } from '../../hooks/useCategories';
import SpinnerMemo from '../loadingSpinner';
import CompactDishGrid from './dishData';
import LiveCart from './liveCart';
import SearchComponent from './searchComponent';
import Subtypes from './subtypes';

const MemoCategory = () => {
  const { isLoading, error } = useCategories();
  const selectedCategory = useOrderStore((s) => s.selectedCategory);
  const searchActive = useOrderStore((s) => s.searchActive);
  if (isLoading) {
    return <SpinnerMemo />;
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-center text-red-500">
        Error loading categories.
      </motion.div>
    );
  }

  return (
    <div className="hide-scrollbar flex h-[100dvh] pt-[4.25rem] lg:hidden lg:pt-[7.25rem]">
      <Subtypes />
      <div className="w-3/4 overflow-auto border-l border-gray-200 p-2 pb-[5rem] md:p-4">
        <SearchComponent />
        {searchActive && <SearchResultsGrid />}
        <h2>Category name</h2>
        <CompactDishGrid selectedCategory={selectedCategory as CategoryType} />
      </div>
      <LiveCart />
    </div>
  );
};

const Category = memo(MemoCategory);
export default Category;
