import { useOrderStore } from '@/components/store/useOrderData';
import { cn } from '@/lib/utils';
import type { DishType } from '@hi/db-models/src/validators';
import { motion } from 'framer-motion';
import DishQuantityButton from './dishQuantityBtn';

const normalize = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, '');

const simpleScore = (name: string, term: string) => {
  const n = normalize(name);
  const t = normalize(term);

  if (!t) return 9999;
  if (n.startsWith(t)) return 0;
  if (n.includes(t)) return 1;
  let matched = 0;
  for (const c of t) if (n.includes(c)) matched++;
  return 100 - matched;
};

const SearchResultsGrid = () => {
  const allCategories = useOrderStore((s) => s.allCategories);
  const searchTerm = useOrderStore((s) => s.searchTerm);

  const allDishes = (allCategories?.flatMap((c) => c.dishIds) as DishType[]) ?? [];

  if (!searchTerm.trim()) return null;

  const filtered = [...allDishes]
    .filter((d) => normalize(d.name).includes(normalize(searchTerm)))
    .sort((a, b) => simpleScore(a.name, searchTerm) - simpleScore(b.name, searchTerm));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="mt-4 max-h-[55dvh] overflow-y-auto rounded-md border border-gray-300 bg-white shadow-md"
    >
      {filtered.length ? (
        filtered.map((dish) => {
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
              <div>
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
        <p className="p-4 text-sm text-gray-500">No matching dishes found.</p>
      )}
    </motion.div>
  );
};

export default SearchResultsGrid;
