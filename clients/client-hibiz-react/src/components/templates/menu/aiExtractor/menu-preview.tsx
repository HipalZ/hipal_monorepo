import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Category, Dish } from '@/lib/menu/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Edit2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import PopUp from '../../../atom/popUp';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { EditCategoryDialog } from './edit-category-dialog';
import { EditMenuDialog } from './edit-menu-dialog';
import { EditSubcategoryDialog } from './edit-subCat-dialog';
import MenuStatsStrip from './MenuStatsStrip';

interface MenuPreviewProps {
  categories: Category[];
  isEditing: boolean;
}

const dishTypeColors = {
  veg: 'bg-green-100 text-green-700 border-green-300',
  nonveg: 'bg-red-100 text-red-700 border-red-300',
  egg: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  vegan: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  alcoholic: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  nonalcoholic: 'bg-sky-100 text-sky-700 border-sky-300',
  mix: 'bg-slate-100 text-slate-700 border-slate-300',
} as const;

const dishTypeIcons = {
  veg: '🥬',
  nonveg: '🍗',
  egg: '🥚',
  vegan: '🌱',
  alcoholic: '🍸',
  nonalcoholic: '🥤',
  mix: '🍽️',
} as const;

export function MenuPreview({ categories, isEditing }: MenuPreviewProps) {
  const [editingDish, setEditingDish] = useState<{
    dish: Dish;
    categoryId: string;
    subcategoryId: string;
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [editingSub, setEditingSub] = useState<{
    categoryId: string;
    subcategoryId: string;
    subcategoryName: string;
  } | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [dishSearch, setDishSearch] = useState('');

  const allSubs = categories.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      catId: cat.id,
      catName: cat.name,
      subId: sub.id,
      subName: sub.name,
    })),
  );

  const allDishes = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.dishes.map((dish) => ({
          dishId: dish.id,
          dishName: dish.dishName,
          subId: sub.id,
          catId: cat.id,
        })),
      ),
    );
  }, [categories]);

  console.log('allSubs', allSubs);
  console.log('allDishes', allDishes);

  const filteredSubs = allSubs.filter(
    (x) => x.subName.toLowerCase().includes(subSearch.toLowerCase()) || x.catName.toLowerCase().includes(subSearch.toLowerCase()),
  );

  const handleNavigateToSub = (subId: string) => {
    const element = document.getElementById(subId);
    if (element) {
      element.style.scrollMarginTop = '5rem';
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'auto';
    }, 3000);
    setShowCategoryModal(false);
  };

  const searchQuery = dishSearch.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    return categories
      .map((cat) => {
        const filteredSubs = cat.subcategories
          .map((sub) => {
            const filteredDishes = sub.dishes.filter((dish) => dish.dishName.toLowerCase().includes(searchQuery));
            return filteredDishes.length > 0 ? { ...sub, dishes: filteredDishes } : null;
          })
          .filter(Boolean);

        return filteredSubs.length > 0 ? { ...cat, subcategories: filteredSubs } : null;
      })
      .filter(Boolean) as Category[];
  }, [categories, searchQuery]);

  const highlightMatch = useMemo(
    () => (text: string) => {
      if (!searchQuery) return text;
      return text.replace(
        new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
        '<mark class="bg-yellow-300 text-black">$1</mark>',
      );
    },
    [searchQuery],
  );

  if (categories.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <p className="text-lg">No extracted menu yet.</p>
        <p className="mt-2 text-sm">Upload files and click "Extract Menu" to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-[7rem] z-40 -ml-4 flex w-full max-w-[69rem] items-center gap-3 bg-white px-4 py-4 backdrop-blur-md md:absolute md:top-0 md:ml-0 lg:top-[0] xl:-top-[3rem]">
        <Search className="h-4 w-4 text-slate-500" />
        <Input type="search" value={dishSearch} onChange={(e) => setDishSearch(e.target.value)} placeholder="Search dishes..." className="flex-1" />
        <Button
          size="lg"
          disabled={dishSearch.length !== 0}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700"
          onClick={() => setShowCategoryModal(true)}
        >
          Categories
        </Button>
      </div>
      <div className="hide-scrollbar mt-8 max-h-[calc(80dvh-4rem)] overflow-auto pb-[10rem] pr-2 pt-24 lg:max-h-[calc(80dvh-4rem)] lg:pt-24 xl:max-h-[calc(90dvh-4rem)] xl:pt-4">
        <MenuStatsStrip categoriesCount={categories.length} subcategoriesCount={allSubs.length} dishesCount={allDishes.length} />
        {filteredCategories.map((cat, catIndex) => (
          <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIndex * 0.1 }}>
            <div>
              {cat.subcategories.map((sub, subIndex) => (
                <motion.div
                  key={sub.id}
                  id={sub.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: catIndex * 0.1 + subIndex * 0.05 }}
                  className="bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-primary text-poppins text-base font-semibold md:text-2xl">
                        {sub.name}{' '}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingSub({
                                categoryId: cat.id,
                                subcategoryId: sub.id,
                                subcategoryName: sub.name,
                              })
                            }
                            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            title="Edit subcategory name"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                      </h3>

                      <span className="text-secondary text-poppins rounded-full bg-gray-100 px-2 py-1 text-base font-semibold">
                        {sub.dishes.length} item{sub.dishes.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 bg-gray-100 p-4 md:grid-cols-2 lg:grid-cols-3">
                    {sub.dishes.map((dish, dishIndex) => {
                      const typeKey =
                        (dish.dishType as keyof typeof dishTypeColors) in dishTypeColors ? (dish.dishType as keyof typeof dishTypeColors) : 'mix';
                      const hasPortions = Array.isArray(dish.portions) && dish.portions.length > 0;
                      const minPrice = hasPortions ? Math.min(...dish.portions.map((p: any) => Number(p.price || 0))) : Number(dish.price || 0);

                      return (
                        <motion.div
                          key={dish.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: catIndex * 0.1 + subIndex * 0.05 + dishIndex * 0.03 }}
                          className={cn(
                            'group relative rounded-lg p-4 transition-all',
                            isEditing ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : '',
                            'bg-white',
                          )}
                          onClick={() => {
                            if (isEditing) {
                              setEditingDish({ dish, categoryId: cat.id, subcategoryId: sub.id });
                            }
                          }}
                        >
                          {isEditing && (
                            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="rounded-full bg-blue-600 p-1.5 text-white">
                                <Edit2 className="h-3 w-3" />
                              </div>
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-start gap-2 pb-2">
                                <span className="text-lg">{dishTypeIcons[typeKey]}</span>
                                <h4
                                  className="text-primary -ml-2 text-base font-semibold lg:text-lg"
                                  dangerouslySetInnerHTML={{ __html: highlightMatch(dish.dishName) }}
                                />{' '}
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', dishTypeColors[typeKey])}>
                                  {String(dish.dishType || '').toUpperCase()}
                                </span>
                                <p className="text-sm font-bold text-gray-900">
                                  {hasPortions ? `₹${minPrice}` : dish.price !== undefined ? `₹${dish.price}` : ''}
                                </p>
                              </div>

                              {/* Type chip & portions */}
                              <div className="flex flex-wrap items-center gap-2">
                                {hasPortions && (
                                  <Table className="mt-2 w-full rounded-lg border border-slate-200">
                                    <TableHeader>
                                      <TableRow className="bg-slate-50">
                                        <TableHead className="text-xs font-semibold text-slate-600">#</TableHead>
                                        <TableHead className="text-xs font-semibold text-slate-600">Portion</TableHead>
                                        <TableHead className="text-right text-xs font-semibold text-slate-600">Price (₹)</TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                      {dish?.portions.map((p: any, idx: number) => (
                                        <TableRow
                                          key={idx}
                                          className={cn('transition-colors hover:bg-slate-50', p.default ? 'bg-emerald-50/50' : '')}
                                        >
                                          <TableCell className="text-xs text-slate-700">
                                            <div className="flex items-center gap-2">
                                              {p.default && (
                                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_4px_1px_rgba(16,185,129,0.6)]" />
                                              )}
                                              {idx + 1}
                                            </div>
                                          </TableCell>

                                          <TableCell className="text-xs font-medium text-slate-800">{p.name}</TableCell>
                                          <TableCell className="text-right text-xs font-semibold text-slate-700">₹{p.price}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>

                              {/* Description */}
                              {typeof (dish as Dish).description === 'string' && (dish as Dish)?.description.trim().length > 0 && (
                                <p
                                  className="text-secondary text-poppins mt-2 text-sm font-semibold leading-4 opacity-60"
                                  title={(dish as Dish).description}
                                >
                                  {(dish as Dish).description}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit dialogs */}
      {editingDish && (
        <EditMenuDialog
          open={!!editingDish}
          onClose={() => setEditingDish(null)}
          dish={editingDish.dish}
          categoryId={editingDish.categoryId}
          subcategoryId={editingDish.subcategoryId}
          allCategories={categories}
        />
      )}

      {editingCategory && (
        <EditCategoryDialog
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          categoryId={editingCategory.id}
          categoryName={editingCategory.name}
        />
      )}

      {editingSub && ( // 👈 NEW
        <EditSubcategoryDialog
          open={!!editingSub}
          onClose={() => setEditingSub(null)}
          categoryId={editingSub.categoryId}
          subcategoryId={editingSub.subcategoryId}
          subcategoryName={editingSub.subcategoryName}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <PopUp
          show={showCategoryModal}
          rightTopBack
          onClose={() => setShowCategoryModal(false)}
          height="h-[80dvh] lg:h-[80dvh]"
          width="w-full max-w-[30rem]"
          hide={false}
        >
          <div className="p-4">
            <h3 className="mb-4 text-center text-lg font-semibold text-slate-800">All Subcategories</h3>

            {/* Search box */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={subSearch} onChange={(e) => setSubSearch(e.target.value)} placeholder="Search subcategory..." className="w-full pl-9" />
            </div>

            {/* Subcategory list */}
            <div className="hide-scrollbar max-h-[60vh] overflow-auto rounded-lg border border-slate-200 pb-[10rem]">
              {filteredSubs.length === 0 ? (
                <div className="p-3 text-center text-sm text-slate-500">No subcategories found</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {filteredSubs.map((item) => (
                    <li key={item.subId}>
                      <button
                        type="button"
                        onClick={() => handleNavigateToSub(item.subId)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.subName}</p>
                          <p className="text-xs text-slate-500">{item.catName}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </PopUp>
      )}
    </>
  );
}
