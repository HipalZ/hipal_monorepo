import { useOrderStore } from '@/components/store/useOrderData';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DishType } from '@hi/db-models/src/validators';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import DishQuantityButton from './dishQuantityBtn';

const AnimatedPlaceholder = ({ text }: { text: string }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={text || 'placeholder'}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="pointer-events-none absolute left-[7.5rem] top-[0.55rem] text-sm text-gray-400 md:top-[0.5] lg:left-[7rem]"
    >
      {text || 'Search by dish name'}...
    </motion.span>
  </AnimatePresence>
);

const MemoSearchComponent = () => {
  const allCategories = useOrderStore((s) => s.allCategories);
  const searchActive = useOrderStore((s) => s.searchActive);
  const searchTerm = useOrderStore((s) => s.searchTerm);
  const setSearchActive = useOrderStore((s) => s.setSearchActive);
  const setSearchTerm = useOrderStore((s) => s.setSearchTerm);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const allDishes = useMemo(() => {
    return allCategories?.flatMap((cat) => cat.dishIds) as DishType[];
  }, [allCategories]);

  // up to 5 names for animated placeholder (guard against empty list)
  const firstFiveDishNames = useMemo(() => {
    return (allDishes || [])
      .slice(0, 5)
      .map((dish) => dish?.name)
      .filter(Boolean) as string[];
  }, [allDishes]);

  const filteredDishes = useMemo(() => {
    const needle = (searchTerm || '').toLowerCase().trim();
    if (!needle) return allDishes;
    return (allDishes || []).filter((dish) => (dish?.name || '').toLowerCase().includes(needle));
  }, [allDishes, searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchActive(false);
  };

  // rotate placeholder every 3s, only if we have names
  useEffect(() => {
    if (!firstFiveDishNames.length) return;
    const id = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % firstFiveDishNames.length);
    }, 3000);
    return () => clearInterval(id);
  }, [firstFiveDishNames.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky -top-2 z-[1] -mx-2 -mt-4 w-full max-w-[87dvw] border-b border-gray-300 bg-white px-2 pb-2 pt-4 placeholder:text-base md:-top-4 md:pb-3 lg:mt-0 lg:border-none"
    >
      <div className="relative w-full">
        <Input
          type="text"
          value={searchTerm}
          onFocus={() => setSearchActive(true)}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-gray-300 pl-10 pr-10"
          placeholder="Search for"
        />
        {!searchTerm && <AnimatedPlaceholder text={firstFiveDishNames[placeholderIndex]} />}
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <button
          type="button"
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searchActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 grid max-h-[55dvh] grid-cols-1 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-md md:grid-cols-2"
          >
            {filteredDishes?.length ? (
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

                        {/* Availability badge */}
                        <span className={cn('rounded px-2 py-[2px] text-[10px] font-semibold', isUnavailable ? 'bg-red-100 text-red-700' : '')}>
                          {isUnavailable ? 'Not Available' : ''}
                        </span>

                        {/* Visibility badge */}
                        <span className={cn('rounded px-2 py-[2px] text-[10px] font-semibold', isHidden ? 'bg-red-100 text-red-800' : '')}>
                          {isHidden ? 'Hidden' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Still orderable */}
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
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default memo(MemoSearchComponent);
