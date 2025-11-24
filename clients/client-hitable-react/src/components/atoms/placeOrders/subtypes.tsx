import BottomPopUp from '@/components/atoms/universalPopup';
import { useCategories } from '@/components/hooks/useCategories';
import { useOrderStore } from '@/components/store/useOrderData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/components/utils/helpers';
import { motion } from 'framer-motion';
import { ImageIcon, Menu, RefreshCcw, Search } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import FloatingTableActions from './FloatingButton';

const MemoSubtypes = () => {
  const selectedCategory = useOrderStore((s) => s.selectedCategory);
  const setSelectedCategory = useOrderStore((s) => s.setSelectedCategory);
  const allCategories = useOrderStore((s) => s.allCategories);
  const { refetch } = useCategories();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  /** 🔎 Filter categories by search */
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return allCategories;
    return allCategories.filter((cat) => cat.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categorySearch, allCategories]);

  /** 🧭 Scroll + select + close */
  const handleNavigateToCategory = useCallback(
    (categoryId: string) => {
      const element = document.getElementById(categoryId);
      if (element) {
        element.style.scrollMarginTop = '5rem';
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setSelectedCategory(allCategories.find((c) => c._id === categoryId));
      setTimeout(() => {
        document.documentElement.style.scrollBehavior = 'auto';
      }, 2000);
      setShowCategoryModal(false);
    },
    [allCategories, setSelectedCategory],
  );

  /** ⚙️ Floating Actions */
  const customActions = [
    {
      label: 'Refresh Categories',
      icon: <RefreshCcw className="h-5 w-5" />,
      onClick: refetch,
      color: 'bg-purple-500 text-white',
    },
    {
      label: 'Categories',
      icon: <Menu className="h-5 w-5" />,
      onClick: () => setShowCategoryModal(true),
      color: 'bg-purple-500 text-white',
    },
  ];

  return (
    <>
      {/* 🧭 Left Scrollable Category Sidebar */}
      <ScrollArea className="w-1/4 bg-white pt-4">
        <div className="hide-scrollbar relative pb-[5rem] md:space-y-8">
          {allCategories?.map((category, index) => (
            <motion.div
              key={category?._id}
              id={category?._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 600,
                damping: 60,
              }}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'relative flex cursor-pointer flex-col items-center py-4 transition-all',
                selectedCategory?._id === category?._id ? 'rounded-l-2xl bg-purple-50' : 'hover:bg-gray-100',
              )}
            >
              {selectedCategory?._id === category._id && (
                <motion.div
                  layoutId="category-border"
                  className="absolute inset-0 border-r-4 border-purple-200"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 600,
                    damping: 60,
                  }}
                />
              )}

              <Avatar className="h-10 w-10">
                {category?.coverImage ? (
                  <AvatarImage src={category.coverImage} alt={category.name} />
                ) : (
                  <AvatarFallback>
                    <ImageIcon className="h-6 w-6 text-gray-500" />
                  </AvatarFallback>
                )}
              </Avatar>

              <h3 className="mt-2 text-center text-sm font-semibold md:text-base">{category?.name}</h3>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* 🟣 Floating Action Button */}
      <FloatingTableActions showPrimary={false} secondaryActions={customActions} />

      {/* 🧾 Category Navigation Modal */}
      {showCategoryModal && (
        <BottomPopUp
          show={showCategoryModal}
          rightTopBack
          onClose={() => setShowCategoryModal(false)}
          height="h-[90dvh]"
          width="w-full max-w-[28rem]"
        >
          <div className="p-4">
            <h3 className="mb-4 text-center text-lg font-semibold text-slate-800">All Categories</h3>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search category..."
                className="w-full pl-9"
              />
            </div>

            {/* Category List */}
            <div className="hide-scrollbar max-h-[70vh] overflow-auto rounded-lg">
              {filteredCategories.length === 0 ? (
                <div className="p-3 text-center text-sm text-slate-500">No categories found</div>
              ) : (
                <ul className="grid grid-cols-3 gap-2">
                  {filteredCategories.map((item) => {
                    const isSelected = item._id === selectedCategory?._id;
                    return (
                      <li key={item._id}>
                        <button
                          type="button"
                          onClick={() => handleNavigateToCategory(item._id)}
                          className={cn(
                            'flex w-full flex-col items-center justify-center rounded-lg border border-slate-200 px-2 py-1 transition-all duration-200 hover:bg-slate-50',
                            isSelected && 'border-purple-500 bg-purple-50 shadow-md',
                          )}
                        >
                          <Avatar className={cn('h-12 w-12 border transition-colors', isSelected ? 'border-purple-400' : 'border-transparent')}>
                            {item?.coverImage ? (
                              <AvatarImage src={item.coverImage} alt={item.name} />
                            ) : (
                              <AvatarFallback>
                                <ImageIcon className={cn('h-5 w-5', isSelected ? 'text-purple-500' : 'text-gray-500')} />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <p
                            className={cn(
                              'mt-2 text-center text-base font-semibold transition-colors',
                              isSelected ? 'text-purple-600' : 'text-slate-800',
                            )}
                          >
                            {item.name}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </BottomPopUp>
      )}
    </>
  );
};

const Subtypes = memo(MemoSubtypes);
export default Subtypes;
