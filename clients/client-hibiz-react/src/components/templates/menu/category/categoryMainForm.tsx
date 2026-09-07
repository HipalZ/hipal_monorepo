import BottomButton from '@/components/atom/bottomButton';
import Background from '@/components/atom/feildBackground';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import useMenuPageStore, { type CategoryTypeToggle, type Timing } from '@/components/store/useMenuStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCategory } from '@/hooks/useCategory';
import { cn } from '@hi/common/src/error-handler';
import { X } from 'lucide-react';
import { memo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RiGitBranchLine, RiLinkUnlink } from 'react-icons/ri';
import { TbCircuitSwitchClosed } from 'react-icons/tb';
import { useParams } from 'react-router-dom';

// Map human labels to index values
const dayIndex: Record<string, number> = {
  All: -1,
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const CategoryMainForm = memo(() => {
  const setCategoryName = useMenuPageStore((s) => s.setCategoryName);
  const selectedCategory = useMenuPageStore((s) => s.selectedCategory);
  const setSelectedCategory = useMenuPageStore((s) => s.setSelectedCategory);
  const setCategoryStep = useMenuPageStore((s) => s.setCategoryStep);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const selectIds = useMenuPageStore((s) => s.selectedIds);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const selectSingleParentCat = useMenuPageStore((s) => s.selectSingleParentCat);
  const timings = useMenuPageStore((s) => s.timings);
  const updateTiming = useMenuPageStore((s) => s.updateTiming);
  const addTiming = useMenuPageStore((s) => s.addTiming);
  const removeTiming = useMenuPageStore((s) => s.removeTiming);
  const categoryName = useMenuPageStore((s) => s.categoryName);
  const categoryInfo = useMenuPageStore((s) => s.categoryInfo);
  const setCategoryInfo = useMenuPageStore((s) => s.setCategoryInfo);

  const { businessId, menuId } = useParams<{
    businessId: string;
    menuId: string;
  }>();
  const { mutate: createCategory, isPending } = useSaveCategory();

  const categoryChange = useCallback(
    (type: CategoryTypeToggle) => {
      if (type !== selectedCategory) resetStore();
      setSelectedCategory(type);
    },
    [resetStore, selectedCategory, setSelectedCategory],
  );

  const handleSaveCategory = useCallback(() => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    const commonPayload = {
      name: categoryName,
      businessId: businessId?.toString() || '',
      menuId,
      timings: timings as Timing[],
      categoryInfo,
    };

    const payload =
      selectedCategory === 'MAIN_CATEGORY'
        ? { ...commonPayload, hierarchy: 'PARENT', subCategoryIds: selectIds }
        : {
            ...commonPayload,
            hierarchy: 'CHILD',
            parentCategoryIds: selectSingleParentCat || [],
            dishIds: recommendationIds,
          };

    createCategory(payload);
  }, [categoryName, categoryInfo, businessId, menuId, selectedCategory, selectIds, selectSingleParentCat, recommendationIds, timings, createCategory]);

  const goToNextStep = useCallback(() => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }
    setCategoryStep('CATEGORY_STEP_2');
  }, [categoryName, setCategoryStep]);

  if (isPending) return <LoadingSpinner />;

  return (
    <>
      <article className="mx-6 lg:mx-16 lg:mt-6">
        <label className="font-semibold opacity-50" htmlFor="name">
          Category Name*
        </label>
        <Background>
          <input
            type="text"
            id="name"
            placeholder="Enter Category Name"
            value={categoryName}
            maxLength={21}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
          />
        </Background>
      </article>

      <article className="mx-6 lg:mx-16 lg:mt-6 mt-4">
        <label className="font-semibold opacity-50" htmlFor="info">
          Category Info (Optional)
        </label>
        <Background>
          <input
            type="text"
            id="info"
            placeholder="Enter Category Description"
            value={categoryInfo}
            maxLength={120}
            onChange={(e) => setCategoryInfo(e.target.value)}
            className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
          />
        </Background>
      </article>

      <SelectionArea selectedCategory={selectedCategory} categoryChange={categoryChange} />

      {selectedCategory === 'MAIN_CATEGORY' && (
        <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
          <label className="font-semibold opacity-50" htmlFor="link-sub">
            Link Sub-Categories ({selectIds.length})
          </label>
          <Background>
            <button
              onClick={() => setCategoryStep('LINK_SUB_CATEGORY')}
              type="button"
              className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2"
            >
              <RiLinkUnlink className="mr-2" /> Link Sub Categories
            </button>
          </Background>
        </section>
      )}

      {selectedCategory === 'SUB_CATEGORY' && (
        <>
          <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="link-main">
              Link Main Categories ({selectSingleParentCat.length})
            </label>
            <Background>
              <button
                onClick={() => setCategoryStep('LINK_MAIN_CATEGORY')}
                type="button"
                className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2"
              >
                <RiLinkUnlink className="mr-2" /> Link Main Categories
              </button>
            </Background>
          </section>

          <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
            <label className="font-semibold opacity-50" htmlFor="link-dish">
              Link Dishes ({recommendationIds.length})
            </label>
            <Background>
              <button
                onClick={() => setCategoryStep('LINK_DISH')}
                type="button"
                className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2"
              >
                <RiLinkUnlink className="mr-2" /> Link Dishes
              </button>
            </Background>
          </section>
        </>
      )}

      {/* Timings Section */}
      <section className="mx-6 my-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Schedule</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {timings.map((t, i) => (
            <Card key={i} className="relative flex items-center space-x-4 p-4 shadow-md">
              <CardHeader className="w-16 p-0">
                <CardTitle className="text-sm font-medium">Slot {i + 1}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-wrap items-center gap-3 p-0">
                <Select
                  value={String(t.day)}
                  onValueChange={(val) => {
                    const day = Number(val);

                    updateTiming(i, { day });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dayIndex).map(([label, val]) => (
                      <SelectItem key={val} value={String(val)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="time"
                  value={`${String(Math.floor(t.start / 60)).padStart(2, '0')}:${String(t.start % 60).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateTiming(i, { start: h * 60 + m });
                  }}
                  className="w-24"
                />

                <Input
                  type="time"
                  value={`${String(Math.floor(t.end / 60)).padStart(2, '0')}:${String(t.end % 60).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateTiming(i, { end: h * 60 + m });
                  }}
                  className="w-24"
                />

                <Button variant="ghost" size="icon" onClick={() => removeTiming(i)} className="absolute bottom-0 right-0">
                  <X className="h-5 w-5 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => addTiming({ day: 0, start: 0, end: 60 })}
        >
          + Add Slot
        </Button>
      </section>

      <FooterButtons saveCategory={handleSaveCategory} goToNextStep={goToNextStep} />
    </>
  );
});

const SelectionArea = memo(
  ({ selectedCategory, categoryChange }: { selectedCategory: CategoryTypeToggle; categoryChange: (type: CategoryTypeToggle) => void }) => (
    <section className="mx-6 mt-4 lg:mx-16 lg:mt-6">
      <label className="font-semibold opacity-50" htmlFor="name">
        Category type*
      </label>
      <article className="mt-2 rounded-xl bg-white p-4">
        <label className="text-xs font-semibold opacity-50" htmlFor="type">
          Select one type*
        </label>
        <article className="mt-4 flex w-full">
          <button
            type="button"
            className={cn(
              'mx-2 flex-1 rounded-2xl p-6 text-left',
              selectedCategory === 'MAIN_CATEGORY' ? 'bg-[#F1E9FB] text-[#8C63FF]' : 'bg-[#f4f4f490]',
            )}
            onClick={() => categoryChange('MAIN_CATEGORY')}
          >
            <RiGitBranchLine className="rotate-180" size={28} />
            Main categories
          </button>
          <button
            type="button"
            className={cn(
              'mx-2 flex-1 rounded-2xl p-6 text-left',
              selectedCategory === 'SUB_CATEGORY' ? 'bg-[#F1E9FB] text-[#8C63FF]' : 'bg-[#f4f4f490]',
            )}
            onClick={() => categoryChange('SUB_CATEGORY')}
          >
            <TbCircuitSwitchClosed size={28} className="-ml-2 rotate-90" />
            Sub Categories
          </button>
        </article>
      </article>
    </section>
  ),
);

const FooterButtons = memo(({ saveCategory, goToNextStep }: { saveCategory: () => void; goToNextStep: () => void }) => (
  <BottomButton
    buttons={[
      { text: 'Quick Save', onClick: saveCategory, type: 'button' },
      { text: 'Next', onClick: goToNextStep, type: 'button' },
    ]}
  />
));

export default CategoryMainForm;
