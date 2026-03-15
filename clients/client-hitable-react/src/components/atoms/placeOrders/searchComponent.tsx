import { useOrderStore } from '@/components/store/useOrderData';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';

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
  const searchTerm = useOrderStore((s) => s.searchTerm);
  const setSearchActive = useOrderStore((s) => s.setSearchActive);
  const setSearchTerm = useOrderStore((s) => s.setSearchTerm);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const allDishes = useMemo(() => {
    return allCategories?.flatMap((cat) => cat?.dishIds).sort((a, b) => a?.name?.localeCompare(b?.name));
  }, [allCategories]);

  const firstFiveDishNames = useMemo(
    () =>
      allDishes
        .slice(0, 5)
        .map((dish) => dish?.name)
        .filter(Boolean) as string[],
    [allDishes],
  );

  useEffect(() => {
    if (!firstFiveDishNames.length) return;
    const id = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % firstFiveDishNames.length);
    }, 3000);
    return () => clearInterval(id);
  }, [firstFiveDishNames.length]);

  const handleChange = (value: string) => {
    const term = value;
    setSearchTerm(term);
    setSearchActive(!!term.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchActive(false);
  };

  return (
    <div className="sticky -top-2 z-[2] -mx-2 -mt-4 w-full max-w-[87dvw] border-b border-gray-300 bg-white px-2 pb-2 pt-4 md:-top-4 md:pb-3 lg:mt-0 lg:border-none">
      <div className="relative w-full">
        <Input
          type="text"
          value={searchTerm}
          onFocus={() => {
            if (searchTerm.trim()) setSearchActive(true);
          }}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 pl-10 pr-10"
          placeholder="Search for"
        />
        {!searchTerm && <AnimatedPlaceholder text={firstFiveDishNames[placeholderIndex]} />}
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(MemoSearchComponent);
