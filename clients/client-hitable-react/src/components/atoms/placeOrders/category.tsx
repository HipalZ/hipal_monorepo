import SearchResultsGrid from '@/components/atoms/placeOrders/searchResultsGrid';
import { useOrderStore } from '@/components/store/useOrderData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { CategoryType } from '@hi/db-models/src/validators';
import { motion } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { memo, useState } from 'react';
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
  const [menuSyncWarningOpen, setMenuSyncWarningOpen] = useState(false);
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
        <Collapsible open={menuSyncWarningOpen} onOpenChange={setMenuSyncWarningOpen} className="mb-3">
          <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-800 transition-colors hover:bg-amber-100 data-[state=open]:rounded-b-none">
            <Info className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="flex-1 font-medium">Menu syncs every 10 min</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-amber-600 transition-transform duration-200 ${menuSyncWarningOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="rounded-b-md border border-t-0 border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Menu data is saved per table and will sync automatically every 10 minutes. Changes may take up to 10 min to reflect.
          </CollapsibleContent>
        </Collapsible>
        <SearchComponent />
        {searchActive && <SearchResultsGrid />}
        <h2 className="mb-6 pt-6 text-xl font-bold">{selectedCategory ? selectedCategory.name : 'Select a category'}</h2>
        <CompactDishGrid selectedCategory={selectedCategory as CategoryType} />
      </div>
      <LiveCart />
    </div>
  );
};

const Category = memo(MemoCategory);
export default Category;
