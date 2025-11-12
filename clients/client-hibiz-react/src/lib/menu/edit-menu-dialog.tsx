import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMenuStore } from '@/lib/menu/store';
import type { Category, Dish } from '@/lib/menu/types';
import { motion } from 'framer-motion';
import { Check, Edit2, MoveRight, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdvancedBottomButton from '../../../atom/bottomButton/advancedBottomButton';
import PopUp from '../../../atom/popUp';

interface EditMenuDialogProps {
  open: boolean;
  onClose: () => void;
  dish: Dish & { portions?: { name: string; price: number; default: boolean }[] };
  categoryId: string;
  subcategoryId: string;
  allCategories: Category[];
}

const dishTypeOptions = [
  { value: 'veg', label: 'Vegetarian', icon: '🥬' },
  { value: 'nonveg', label: 'Non-Veg', icon: '🍗' },
  { value: 'egg', label: 'Egg', icon: '🥚' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'alcoholic', label: 'Alcoholic', icon: '🍸' },
  { value: 'nonalcoholic', label: 'Non-Alcoholic', icon: '🥤' },
] as const;

export function EditMenuDialog({ open, onClose, dish, categoryId, subcategoryId, allCategories }: EditMenuDialogProps) {
  const updateDishDetails = useMenuStore((s) => s.updateDishDetails);
  const moveDishToSubCategory = useMenuStore((s) => s.moveDishToSubCategory);

  const [dishName, setDishName] = useState(dish.dishName);
  const [price, setPrice] = useState((dish.price ?? 0).toString());
  const [dishType, setDishType] = useState(dish.dishType as any);
  const [description, setDescription] = useState((dish as any).description ?? '');

  // Portions (edit if present). If present, we manage them here and hide single price field.
  const initialPortions = Array.isArray(dish.portions) ? dish.portions : undefined;
  const [portions, setPortions] = useState<{ name: string; price: number | string; default: boolean }[] | undefined>(
    initialPortions ? initialPortions.map((p) => ({ ...p })) : undefined,
  );

  // destination (subcat only)
  const [subSearch, setSubSearch] = useState('');
  const [selectedDest, setSelectedDest] = useState<{
    catId: string;
    subId: string;
    catName: string;
    subName: string;
  } | null>(() => {
    const cat = allCategories.find((c) => c.id === categoryId);
    const sub = cat?.subcategories.find((s) => s.id === subcategoryId);
    return cat && sub ? { catId: cat.id, subId: sub.id, catName: cat.name, subName: sub.name } : null;
  });

  const hasPortions = Array.isArray(portions) && portions.length > 0;

  const wordCount = useMemo(() => (description.trim().length ? description.trim().split(/\s+/).length : 0), [description]);
  const wordHintColor = wordCount >= 30 && wordCount <= 50 ? 'text-emerald-700' : 'text-slate-500';

  // Flatten all subcategories with their parent category ids/names
  const allSubs = useMemo(
    () =>
      allCategories.flatMap((cat) =>
        cat.subcategories.map((sub) => ({
          catId: cat.id,
          subId: sub.id,
          catName: cat.name,
          subName: sub.name,
        })),
      ),
    [allCategories],
  );

  const filteredSubs = useMemo(() => {
    const q = subSearch.trim().toLowerCase();
    if (!q) return allSubs;
    return allSubs.filter((x) => x.subName.toLowerCase().includes(q) || x.catName.toLowerCase().includes(q));
  }, [allSubs, subSearch]);

  const destinationChanged = !!selectedDest && (selectedDest.catId !== categoryId || selectedDest.subId !== subcategoryId);

  // minPrice preview for portions
  const minPrice = useMemo(() => {
    if (!hasPortions) return null;
    const nums = (portions ?? []).map((p) => Number(p.price || 0)).filter((n) => !Number.isNaN(n));
    return nums.length ? Math.min(...nums) : null;
  }, [portions, hasPortions]);

  // ---- portion handlers ----
  const ensureOneDefault = (list: typeof portions) => {
    if (!list || list.length === 0) return list;
    if (!list.some((p) => p.default)) {
      // if none marked default, make first default
      list = list.map((p, i) => ({ ...p, default: i === 0 }));
    }
    return list;
  };

  const setDefaultPortion = (index: number) => {
    if (!portions) return;
    setPortions(portions.map((p, i) => ({ ...p, default: i === index })));
  };

  const addPortion = () => {
    const next = [...(portions ?? [])];
    next.push({
      name: 'Regular',
      price: 0,
      default: next.length === 0, // first added becomes default automatically
    });
    setPortions(ensureOneDefault(next));
  };

  const updatePortion = (index: number, field: 'name' | 'price', value: string) => {
    if (!portions) return;
    const next = portions.map((p, i) => (i === index ? { ...p, [field]: field === 'price' ? value : value } : p));
    setPortions(next);
  };

  const removePortion = (index: number) => {
    if (!portions) return;
    const next = portions.filter((_, i) => i !== index);
    setPortions(ensureOneDefault(next));
  };

  const handleSave = () => {
    // normalize portions to numbers & ensure one default
    let normalizedPortions: { name: string; price: number; default: boolean }[] | undefined = undefined;

    if (hasPortions) {
      const fixed = ensureOneDefault(
        (portions ?? []).map((p) => ({
          name: String(p.name || 'Variant').trim() || 'Variant',
          price: Number(p.price || 0),
          default: !!p.default,
        })),
      );
      normalizedPortions = fixed ?? [];
    }

    // If portions exist, base "price" should be first portion's price by default
    const basePrice = normalizedPortions && normalizedPortions.length ? normalizedPortions[0].price : Number.parseFloat(price) || 0;

    // update local dish fields
    updateDishDetails(categoryId, subcategoryId, dish.id, {
      dishName,
      price: basePrice,
      dishType,
      description: description.trim(),
      // NEW: pass portions when present
      ...(normalizedPortions ? { portions: normalizedPortions } : { portions: undefined }),
    } as any);

    // move if destination changed
    if (destinationChanged && selectedDest) {
      moveDishToSubCategory(dish.id, categoryId, subcategoryId, selectedDest.catId, selectedDest.subId);
    }

    onClose();
  };

  return (
    <PopUp height="h-[100dvh] lg:h-[90dvh]" width="w-full max-w-[69rem]" show={open} onClose={onClose} hide>
      <motion.div
        className="hide-scrollbar h-[90dvh] overflow-auto rounded-2xl bg-white pb-[5rem] shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 w-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 lg:rounded-t-2xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Edit2 className="h-6 w-6" />
              <h3 className="text-xl font-bold">{dishName}</h3>
            </div>
            <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          {/* Left: Basics */}
          <section className="space-y-4">
            {/* Dish Name */}
            <div className="space-y-2">
              <Label htmlFor="dishName" className="text-primary text-base font-semibold">
                Dish Name
              </Label>
              <Input id="dishName" value={dishName} onChange={(e) => setDishName(e.target.value)} placeholder="Enter dish name" className="w-full" />
            </div>

            {/* Single Price (only if no portions) */}
            {!hasPortions && (
              <div className="space-y-2">
                <Label htmlFor="price" className="text-primary text-base font-semibold">
                  Price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                  className="w-full"
                />
              </div>
            )}

            {/* Dish Type */}
            <div className="space-y-2">
              <Label className="text-primary text-base font-semibold">Dish Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {dishTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDishType(option.value as any)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-3 transition-all ${
                      dishType === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                    {dishType === option.value && <Check className="ml-auto h-4 w-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc" className="text-primary text-base font-semibold">
                Description <span className="text-slate-400">(aim for 30–50 words)</span>
              </Label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief, appetizing description…"
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm outline-none ring-0 focus:border-blue-400"
                rows={5}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={wordHintColor}>{wordCount} words</span>
                <span className="text-slate-500">Focus on taste, key ingredients, and serving style.</span>
              </div>
            </div>
          </section>

          {/* Right: Portions + Destination */}
          <section className="space-y-6">
            {/* Portions editor (only if dish already has portions) */}
            {Array.isArray(initialPortions) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-primary text-base font-semibold">Portions / Variants</Label>
                  <button
                    type="button"
                    onClick={addPortion}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" /> Add portion
                  </button>
                </div>

                <div className="space-y-2">
                  {(portions ?? []).map((p, idx) => {
                    const isDefault = !!p.default;
                    return (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 items-center gap-2 rounded-lg border p-3 ${isDefault ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                      >
                        {/* default toggle */}
                        <div className="col-span-12 flex items-center gap-2 md:col-span-12">
                          <button
                            type="button"
                            onClick={() => setDefaultPortion(idx)}
                            className={`h-5 w-5 rounded-full border ${isDefault ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}
                            title="Set as default"
                          />
                          <span className="text-xs text-slate-600">{isDefault ? 'Default portion' : 'Mark default'}</span>
                        </div>

                        {/* name */}
                        <div className="col-span-7 md:col-span-7">
                          <Label className="mb-1 block text-xs text-slate-500">Name</Label>
                          <Input
                            value={p.name}
                            onChange={(e) => updatePortion(idx, 'name', e.target.value)}
                            placeholder="e.g., Half / Full / 30ml / Bottle"
                          />
                        </div>

                        {/* price */}
                        <div className="col-span-4 md:col-span-4">
                          <Label className="mb-1 block text-xs text-slate-500">Price (₹)</Label>
                          <Input
                            type="number"
                            value={String(p.price)}
                            onChange={(e) => updatePortion(idx, 'price', e.target.value)}
                            placeholder="0"
                          />
                        </div>

                        {/* remove */}
                        <div className="col-span-1 flex items-end justify-end md:col-span-1">
                          <button
                            type="button"
                            onClick={() => removePortion(idx)}
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* helper */}
                <p className="text-base text-primary">
                  Tip: First portion’s price will be used as the base price. Ensure at least one portion is marked default.
                </p>

                {/* quick preview */}
                <div className="text-sm text-slate-600">
                  {hasPortions ? (minPrice != null ? `Pricing via portions — from ₹${minPrice}` : 'Pricing via portions') : null}
                </div>
              </div>
            )}

            {/* Destination Subcategory (NO SELECTS) */}
            <div className="space-y-3">
              <Label className="text-primary text-base font-semibold">Move to Subcategory</Label>

              {/* Search box */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Search subcategory or category…"
                  className="w-full pl-9"
                />
              </div>

              {/* List */}
              <div className="hide-scrollbar max-h-56 overflow-auto rounded-lg border border-slate-200">
                {filteredSubs.length === 0 ? (
                  <div className="p-3 text-center text-sm text-slate-500">No subcategories found</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredSubs.map((item) => {
                      const active = selectedDest?.catId === item.catId && selectedDest?.subId === item.subId;
                      const isCurrent = categoryId === item.catId && subcategoryId === item.subId;

                      return (
                        <li key={`${item.catId}:${item.subId}`}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDest({
                                catId: item.catId,
                                subId: item.subId,
                                catName: item.catName,
                                subName: item.subName,
                              })
                            }
                            className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                              active ? 'bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex flex-1 flex-col">
                              <span className="text-sm font-medium text-slate-900">
                                {item.subName}
                                {isCurrent && (
                                  <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    current
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-500">{item.catName}</span>
                            </div>
                            {active && <Check className="h-4 w-4 flex-shrink-0 text-blue-600" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Change indicator */}
              {destinationChanged && selectedDest && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700"
                >
                  <MoveRight className="h-4 w-4" />
                  <span>
                    This dish will move to <b>{selectedDest.subName}</b> <span className="text-slate-600">({selectedDest.catName})</span>
                  </span>
                </motion.div>
              )}
            </div>
          </section>
        </div>
      </motion.div>

      <AdvancedBottomButton
        fixed
        maxWidth="30rem"
        buttons={[
          { text: 'cancel', onClick: onClose },
          { text: 'save changes', onClick: handleSave },
        ]}
      />
    </PopUp>
  );
}
