import { useOrderStore } from '@/components/store/useOrderData';
import { cn } from '@/lib/utils';
import type { DishType } from '@hi/db-models/src/validators';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import DishQuantityButton from './dishQuantityBtn';

const SearchResultsGrid = () => {
  const allCategories = useOrderStore((s) => s.allCategories);
  const searchTerm = useOrderStore((s) => s.searchTerm);

  const allDishes = (allCategories ?? []).flatMap((cat) => cat.dishIds) as DishType[];

  // Setup Fuse
  const fuse = new Fuse(allDishes, {
    keys: ['name'], // you could add more keys if you want (e.g., tags)
    includeScore: true,
    threshold: 0.4, // adjust this: 0.0 is exact only, 1.0 is everything
    minMatchCharLength: 2,
  });

  const results = searchTerm.trim() ? fuse.search(searchTerm).map((r) => r.item) : [];

  if (!searchTerm.trim()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="mt-4 max-h-[55dvh] overflow-y-auto rounded-md border border-gray-300 bg-white shadow-md"
    >
      {results.length ? (
        results.map((dish) => {
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
                  {isUnavailable && <span className="rounded bg-red-100 px-2 py-[2px] text-[10px] font-semibold text-red-700">Not Available</span>}
                  {isHidden && <span className="rounded bg-red-100 px-2 py-[2px] text-[10px] font-semibold text-red-800">Hidden</span>}
                </div>
              </div>
              <DishQuantityButton dishData={dish} />
            </motion.div>
          );
        })
      ) : (
        <p className="p-4 text-sm text-gray-500">No matching dishes found.</p>
      )}
    </motion.div>
  );
};

export default SearchResultsGrid;
