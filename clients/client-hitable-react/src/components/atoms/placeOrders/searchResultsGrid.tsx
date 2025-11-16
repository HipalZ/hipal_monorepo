import { useOrderStore } from '@/components/store/useOrderData';
import { cn } from '@/lib/utils';
import type { DishType } from '@hi/db-models/src/validators';
import { AnimatePresence, motion } from 'framer-motion';
import DishQuantityButton from './dishQuantityBtn';

const SearchResultsGrid = () => {
  const allCategories = useOrderStore((s) => s.allCategories);
  const searchTerm = useOrderStore((s) => s.searchTerm);
  const searchActive = useOrderStore((s) => s.searchActive);

  const allDishes = (allCategories ?? []).flatMap((cat) => cat.dishIds) as DishType[];

  const needle = (searchTerm || '').toLowerCase().trim();

  const filteredDishes = !needle ? [] : (allDishes || []).filter((dish) => (dish?.name || '').toLowerCase().includes(needle));

  if (!searchActive || !needle) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="search-results"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="mt-2 grid max-h-[55dvh] grid-cols-1 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-md md:grid-cols-2"
      >
        {filteredDishes.length ? (
          filteredDishes.map((dish) => {
            const isUnavailable = !dish.availability;
            const isHidden = !dish.visibility;

            return (
              <motion.div
                key={dish._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex items-center justify-between border-b p-4 last:border-none',
                  (isUnavailable || isHidden) && 'bg-muted/20 opacity-90',
                )}
              >
                <div className="flex min-w-0 flex-col">
                  <p className="text-sm font-semibold">{dish.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold opacity-60">₹{dish.price}</p>
                    <span className={cn('rounded px-2 py-[2px] text-[10px] font-semibold', isUnavailable ? 'bg-red-100 text-red-700' : '')}>
                      {isUnavailable ? 'Not Available' : ''}
                    </span>
                    <span className={cn('rounded px-2 py-[2px] text-[10px] font-semibold', isHidden ? 'bg-red-100 text-red-800' : '')}>
                      {isHidden ? 'Hidden' : ''}
                    </span>
                  </div>
                </div>
                <DishQuantityButton dishData={dish} />
              </motion.div>
            );
          })
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-sm text-gray-500">
            No matching dishes found.
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchResultsGrid;
