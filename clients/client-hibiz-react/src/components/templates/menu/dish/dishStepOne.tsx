import Background from '@/components/atom/feildBackground';
import useMenuPageStore, { DishSteps, type Timing } from '@/components/store/useMenuStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, filterPayload, foodTypes, storeImageAfterSave, validateDish } from '@/components/utils/helper';
import { postDishData } from '@/hooks/useDish';
import useErrorToasts from '@/hooks/useError';
import type { DishType, DishTypeEnumType } from '@hi/db-models/src/validators';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RiLinkUnlink } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import AdvancedBottomButton from '../../../atom/bottomButton/advancedBottomButton';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';

const MemoDishForm = () => {
  const { businessId, menuId } = useParams<{ businessId?: string; menuId: string }>();
  const [displayedPrice, setDisplayedPrice] = useState('');
  const queryClient = useQueryClient();
  const errorToasts = useErrorToasts();

  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const setDishName = useMenuPageStore((s) => s.setDishName);
  const setDishTypes = useMenuPageStore((s) => s.setDishTypes);
  const setDishPrice = useMenuPageStore((s) => s.setDishPrice);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const dishDescription = useMenuPageStore((s) => s.dishDescription);
  const calories = useMenuPageStore((s) => s.calories);
  const tags = useMenuPageStore((s) => s.tags);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const dishName = useMenuPageStore((s) => s.dishName);
  const dishPrice = useMenuPageStore((s) => s.dishPrice);
  const visibility = useMenuPageStore((s) => s.visibility);
  const dishTypes = useMenuPageStore((s) => s.dishTypes);
  const availability = useMenuPageStore((s) => s.availability);
  const portions = useMenuPageStore((s) => s.portions);
  const selectedCatIds = useMenuPageStore((s) => s.selectedCatIds);
  const addonIds = useMenuPageStore((s) => s.addonIds);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const resetDishStore = useMenuPageStore((s) => s.resetDishStore);
  const imageFiles = useMenuPageStore((s) => s.imageFiles);
  const imagePreviews = useMenuPageStore((s) => s.imagePreviews);
  const dishStep = useMenuPageStore((s) => s.dishStep);
  const setIsLoading = useMenuPageStore((s) => s.setIsLoading);
  const isLoading = useMenuPageStore((s) => s.isLoading);
  const avgPrepTime = useMenuPageStore((s) => s.avgPrepTime);
  const timings = useMenuPageStore((s) => s.timings);
  const setAvgPrepTime = useMenuPageStore((s) => s.setAvgPrepTime);
  const updateTiming = useMenuPageStore((s) => s.updateTiming);
  const addTiming = useMenuPageStore((s) => s.addTiming);
  const removeTiming = useMenuPageStore((s) => s.removeTiming);

  const hasAllDay = timings.some((t) => t.day === -1);
  const sanitizedTimings = hasAllDay ? [timings.find((t) => t.day === -1)!] : timings;

  useEffect(() => {
    if (dishTypes.length === 0) {
      setDishTypes(['VEG']);
    } else {
      setDishTypes(dishTypes);
    }
    setDisplayedPrice(dishPrice?.toLocaleString('en-IN') || '');
  }, []);

  const toggleSelection = useCallback(
    (type: string) => {
      const isSelected = dishTypes.includes(type as DishTypeEnumType);
      if (isSelected && dishTypes.length === 1) {
        return;
      }
      const newSelectedTypes = isSelected ? dishTypes.filter((t) => t !== type) : [...dishTypes, type];
      setDishTypes(newSelectedTypes as DishTypeEnumType[]);
    },
    [dishTypes],
  );

  const handleDishPrice = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/[^0-9.]/g, '');
      const newPrice = numericValue ? Number(numericValue) : null;
      setDishPrice(newPrice ?? 0);
      setDisplayedPrice(newPrice?.toLocaleString('en-IN') ?? '');
    },
    [dishPrice, displayedPrice],
  );

  const handleFocus = useCallback(() => {
    setDisplayedPrice(dishPrice?.toString() || '');
  }, [dishPrice, displayedPrice]);

  const handleBlur = useCallback(() => {
    setDisplayedPrice(dishPrice?.toLocaleString('en-IN') || '');
  }, [displayedPrice, dishPrice]);

  const redirectToSection = useCallback((step) => {
    setDishStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    const value = validateDish(dishName, dishPrice, dishTypes);
    if (!value) return;
    setDishStep(DishSteps.DISH_STEP_2);
  }, [dishStep, dishName, dishPrice, dishTypes]);

  const handleSubmitDish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateDish(dishName, dishPrice, dishTypes);
    setIsLoading(true);
    let firstImage: string | undefined;
    let secondImage: string | undefined;
    let thirdImage: string | undefined;

    if (imagePreviews?.first !== '') {
      firstImage = await storeImageAfterSave(imageFiles?.first as File, imagePreviews?.first as string);
    }
    if (imagePreviews?.second !== '') {
      secondImage = await storeImageAfterSave(imageFiles?.second as File, imagePreviews?.second as string);
    }
    if (imagePreviews?.third !== '') {
      thirdImage = await storeImageAfterSave(imageFiles?.third as File, imagePreviews?.third as string);
    }

    const images: string[] = [firstImage, secondImage, thirdImage].filter(Boolean);
    const payload: DishType = {
      businessId: Object(businessId),
      menuId: Object(menuId),
      name: dishName,
      price: dishPrice,
      visibility: visibility,
      availability: availability,
      calories: calories.toString(),
      dishTypes: dishTypes,
      description: dishDescription,
      categoryIds: Object(selectedCatIds),
      portions: portions,
      addOnIds: Object(addonIds),
      recommendationIds: Object(recommendationIds),
      tags: tags,
      images: images,
      timings: sanitizedTimings as Timing[],
      avgPrepTime: avgPrepTime,
    };
    const filteredPayload = filterPayload(payload);
    const { data, dishResponse } = await postDishData(filteredPayload);
    if (dishResponse?.status === 201) {
      resetStore();
      resetDishStore();
      setIsLoading(false);
      setOpenMenu(false);
      queryClient.invalidateQueries({ queryKey: ['getAllDishes'] });
      return toast.success(data?.message);
    }
    setIsLoading(false);
    if (dishResponse?.status === 400 && Array.isArray(data?.error?.issues)) {
      errorToasts(data?.error);
    }
    if (dishResponse?.status === 400 || data?.message) {
      toast.error(data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmitDish}>
      <section className="mx-6 flex flex-col gap-6 lg:mx-16 lg:mt-6 lg:flex-row">
        <article className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="name">
            Dish Name*
          </label>
          <Background>
            <div className="relative">
              <input
                type="text"
                id="name"
                placeholder="Enter Dish Name"
                value={dishName}
                maxLength={50}
                minLength={3}
                required
                onChange={(e) => setDishName(e.target.value)}
                className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
              />
              <small className="absolute bottom-2 right-4">
                {dishName?.length}/{50}
              </small>
            </div>
          </Background>
          <label className="font-semibold opacity-50" htmlFor="avgPrepTime">
            Average Preparation Time (mins)
          </label>
          <Background>
            <div className="relative">
              <input
                type="number"
                id="avgPrepTime"
                placeholder="e.g., 15"
                min={0}
                max={180}
                value={avgPrepTime}
                onChange={(e) => setAvgPrepTime(Number(e.target.value))}
                className="w-full rounded-xl border border-black bg-white p-2 focus:border-[#8C63FF] focus:ring-2 focus:ring-[#8C63FF]/20"
              />
              <small className="absolute bottom-2 right-4 text-gray-400">mins</small>
            </div>
          </Background>
        </article>
        <article className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="type">
            Dish Type*
          </label>
          <Background>
            <p className="text-sm text-gray-500">Choose Minimum 1 type</p>
            <section className="mt-2 flex flex-wrap gap-2">
              {foodTypes?.map((type) => {
                const isSelected = dishTypes.includes(type?.name);
                return (
                  <button
                    type="button"
                    onClick={() => toggleSelection(type?.name)}
                    key={type?.name}
                    className={cn(
                      'flex items-center justify-between gap-1 rounded-full border border-[#CACACA] px-4 py-2 capitalize',
                      `${isSelected ? 'bg-blue-200' : ''}`,
                    )}
                  >
                    <img src={type?.icon} loading="lazy" alt={type?.name} width="20" height="20" />
                    <p>{type?.name.replace(/_/g, ' ').toLowerCase()}</p>
                  </button>
                );
              })}
            </section>
          </Background>
        </article>
      </section>
      <section className="mx-6 flex flex-1 flex-col gap-6 lg:mx-16 lg:mt-6 lg:flex-row">
        <article className="flex-1">
          <label className="font-semibold opacity-50" htmlFor="price">
            Prices & Portions*
          </label>
          <div className="rounded-2xl bg-white">
            <div className="relative mt-2 p-3">
              <small className="absolute bottom-5 left-4 ml-2 text-lg">₹</small>
              <input
                minLength={1}
                maxLength={7}
                onChange={handleDishPrice}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={displayedPrice}
                placeholder="Enter Price"
                type="text"
                required
                className="w-full rounded-xl bg-white pl-8 focus:border-[#8C63FF] focus:bg-white focus:ring-0"
              />
              <small className="absolute bottom-6 right-6">
                {dishPrice?.toString()?.length}/{7}
              </small>
            </div>
            <section>
              <Background>
                <button
                  onClick={() => redirectToSection(DishSteps.PORTION_STEP)}
                  type="button"
                  className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2"
                >
                  + Add more portions
                </button>
              </Background>
            </section>
          </div>
          {portions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portion Name</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portions.map((portion, index) => (
                  <TableRow key={`${portion.name}+${index}`}>
                    <TableCell>{portion.name}</TableCell>
                    <TableCell>{portion.price ?? 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </article>
        <article className="flex-1">
          <section onClick={() => redirectToSection(DishSteps.LINK_CATEGORY_STEP)}>
            <label className="font-semibold opacity-50" htmlFor="name">
              Link Categories ({selectedCatIds.length})
            </label>
            <Background>
              <button type="button" className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2">
                <RiLinkUnlink className="mr-2" /> Link Categories
              </button>
            </Background>
          </section>
          <section>
            <label onClick={() => redirectToSection(DishSteps.LINK_ADDON_STEP)} className="font-semibold opacity-50" htmlFor="name">
              Link Add-ons ({addonIds.length})
            </label>
            <Background>
              <button
                onClick={() => redirectToSection(DishSteps.LINK_ADDON_STEP)}
                type="button"
                className="flex w-full items-center justify-center rounded-full bg-[#f4f4f4] py-2"
              >
                <RiLinkUnlink className="mr-2" /> Link Add-ons
              </button>
            </Background>
            <label className="font-semibold opacity-50" htmlFor="timings">
              Dish Availability Timings
            </label>
            <Background>
              <section className="mb-4 space-y-4">
                <div>
                  {timings.map((t, i) => (
                    <Card key={i} className="relative flex w-full items-center space-x-4 p-4 shadow-sm">
                      <CardHeader className="w-16 p-0">
                        <CardTitle className="text-sm font-medium">Slot {i + 1}</CardTitle>
                      </CardHeader>

                      <CardContent className="flex flex-1 flex-wrap items-center gap-3 p-0">
                        <Select
                          value={String(t.day)}
                          onValueChange={(val) => {
                            const day = Number(val);
                            // Prevent selecting All if other slots exist
                            const hasAllDay = timings.some((tm) => tm.day === -1);
                            if (day === -1 && (hasAllDay || timings.length > 1)) {
                              toast.error('“All day” can only exist as a single slot.');
                              return;
                            }

                            updateTiming(i, { day });
                            if (day === -1) updateTiming(i, { start: 0, end: 1440 });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-1">All Days</SelectItem>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
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

                        <Button variant="ghost" size="icon" onClick={() => removeTiming(i)} className="absolute bottom-1 right-1 hover:bg-red-50">
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
                  disabled={timings.some((t) => t.day === -1) && timings.length >= 1}
                  title={timings.some((t) => t.day === -1) ? '“All day” allows only one slot' : undefined}
                >
                  + Add Slot
                </Button>
              </section>
            </Background>
          </section>
        </article>
      </section>
      <AdvancedBottomButton
        fixed={true}
        backgroundColor="#fff"
        maxWidth="30rem"
        buttons={[
          {
            text: 'Quick Save',
            isLoading: isLoading,
            type: 'submit',
            className: '!bg-purple-600',
          },
          {
            text: 'Next',
            onClick: goToNextStep,
            type: 'button',
          },
        ]}
      />
    </form>
  );
};

const DishStepOne = memo(MemoDishForm);
export default DishStepOne;
