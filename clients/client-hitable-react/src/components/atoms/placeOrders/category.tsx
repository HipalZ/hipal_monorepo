import { useOrderStore } from '@/components/store/useOrderData';
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
        <h2 className="mb-6 pt-6 text-xl font-bold">{selectedCategory ? selectedCategory.name : 'Select a category'}</h2>
        <CompactDishGrid selectedCategory={selectedCategory} />
      </div>
      <LiveCart />
    </div>
  );
};

const Category = memo(MemoCategory);
export default Category;
