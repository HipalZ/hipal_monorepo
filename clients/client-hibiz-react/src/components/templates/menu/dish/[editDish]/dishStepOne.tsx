import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import Background from '@/components/atom/feildBackground';
import useMenuPageStore, { DishSteps } from '@/components/store/useMenuStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, filterPayload, foodTypes, updateImage, validateDish } from '@/components/utils/helper';
import { putDishData } from '@/hooks/useDish';
import useErrorToasts from '@/hooks/useError';
import { Switch } from '@headlessui/react';
import type { DishType } from '@hi/db-models/src/validators';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { type ChangeEvent, type FormEvent, memo, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdDelete } from 'react-icons/md';
import { RiLinkUnlink } from 'react-icons/ri';
import { useLocation, useParams } from 'react-router-dom';
import PendingActions from './pendingActions';

const MemoDishForm = () => {
  const { businessId, menuId } = useParams<{ businessId?: string; menuId?: string }>();
  const queryClient = useQueryClient();
  const setDishName = useMenuPageStore((s) => s.setDishName);
  const setDishTypes = useMenuPageStore((s) => s.setDishTypes);
  const setDishPrice = useMenuPageStore((s) => s.setDishPrice);
  const setDishStep = useMenuPageStore((s) => s.setDishStep);
  const dishStep = useMenuPageStore((s) => s.dishStep);
  const dishDescription = useMenuPageStore((s) => s.dishDescription);
  const calories = useMenuPageStore((s) => s.calories);
  const tags = useMenuPageStore((s) => s.tags);
  const recommendationIds = useMenuPageStore((s) => s.recommendationIds);
  const removeCategoryIds = useMenuPageStore((s) => s.removeCategoryIds);
  const removeAddOnIds = useMenuPageStore((s) => s.removeAddOnIds);
  const removeRecommendationIds = useMenuPageStore((s) => s.removeRecommendationIds);
  const dishName = useMenuPageStore((s) => s.dishName);
  const dishPrice = useMenuPageStore((s) => s.dishPrice);
  const visibility = useMenuPageStore((s) => s.visibility);
  const setVisibility = useMenuPageStore((s) => s.setVisibility);
  const dishTypes = useMenuPageStore((s) => s.dishTypes);
  const availability = useMenuPageStore((s) => s.availability);
  const setAvailability = useMenuPageStore((s) => s.setAvailability);
  const portions = useMenuPageStore((s) => s.portions);
  const selectedCatIds = useMenuPageStore((s) => s.selectedCatIds);
  const addonIds = useMenuPageStore((s) => s.addonIds);
  const resetStore = useMenuPageStore((s) => s.resetStore);
  const setEditOpenMenu = useMenuPageStore((s) => s.setEditOpenMenu);
  const resetDishStore = useMenuPageStore((s) => s.resetDishStore);
  const imageFiles = useMenuPageStore((s) => s.imageFiles);
  const imagePreviews = useMenuPageStore((s) => s.imagePreviews);
  const isMenuManager = useMenuPageStore((s) => s.isMenuManager);
  const isLoading = useMenuPageStore((s) => s.isLoading);
  const setIsLoading = useMenuPageStore((s) => s.setIsLoading);
  const setOpenMenu = useMenuPageStore((s) => s.setOpenMenu);
  const editDish = useMenuPageStore((s) => s.editDish);
  const setShowDeleteDish = useMenuPageStore((s) => s.setShowDeleteDish);
  const setIsMenuManager = useMenuPageStore((s) => s.setIsMenuManager);
  const setAvgPrepTime = useMenuPageStore((s) => s.setAvgPrepTime);
  const updateTiming = useMenuPageStore((s) => s.updateTiming);
  const addTiming = useMenuPageStore((s) => s.addTiming);
  const removeTiming = useMenuPageStore((s) => s.removeTiming);
  const avgPrepTime = useMenuPageStore((s) => s.avgPrepTime);
  const timings = useMenuPageStore((s) => s.timings);

  const pathname = useLocation()?.pathname;
  const isManagerExists = pathname.includes('manager');
  const [displayedPrice, setDisplayedPrice] = useState('');
  const errorToasts = useErrorToasts();

  useEffect(() => {
    setDisplayedPrice(dishPrice?.toLocaleString('en-IN') || '');
    setIsMenuManager(isManagerExists);
  }, []);

  const toggleSelection = useCallback(
    (type: string) => {
      const isSelected = dishTypes.includes(type);
      if (isSelected && dishTypes.length === 1) {
        return;
      }
      const newSelectedTypes = isSelected ? dishTypes.filter((t) => t !== type) : [...dishTypes, type];

      setDishTypes(newSelectedTypes);
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
  }, [dishPrice, displayedPrice]);

  const redirectToSection = useCallback((step) => {
    setDishStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    const value = validateDish(dishName, dishPrice, dishTypes);
    if (!value) return;
    setDishStep(DishSteps.DISH_STEP_2);
  }, [dishStep, dishName, dishPrice, dishTypes, setDishStep]);

  const hasAllDay = timings.some((t) => t.day === -1);
  const sanitizedTimings = hasAllDay ? [timings.find((t) => t.day === -1)!] : timings;

  const handleSubmitDish = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (dishTypes.length === 0 || dishName.length === 0 || dishPrice === 0) {
      return toast.error('Please fill all the required fields');
    }
    setIsLoading(true);
    let firstImage: string = editDish?.images?.[0] ?? '';
    let secondImage: string = editDish?.images?.[1] ?? '';
    let thirdImage: string = editDish?.images?.[2] ?? '';
    firstImage = (await updateImage(imageFiles?.first as File, imagePreviews?.first as string, firstImage)) as string;
    secondImage = (await updateImage(imageFiles?.second as File, imagePreviews?.second as string, secondImage)) as string;
    thirdImage = (await updateImage(imageFiles?.third as File, imagePreviews?.third as string, thirdImage)) as string;

    // Collect images
    const images: string[] = [firstImage, secondImage, thirdImage].filter(Boolean);
    const payload: DishType = {
      _id: editDish?._id,
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
      removeCategoryIds: Object(removeCategoryIds),
      removeAddOnIds: Object(removeAddOnIds),
      removeRecommendationIds: Object(removeRecommendationIds),
      tags: tags,
      images: images,
      timings: sanitizedTimings as Timing[],
      avgPrepTime: avgPrepTime,
    };
    const filteredPayload = filterPayload(payload);
    const { data, dishResponse } = await putDishData(filteredPayload);
    if (dishResponse?.status === 200) {
      resetStore();
      resetDishStore();
      setEditOpenMenu(false);
      setIsLoading(false);
      setOpenMenu(false);
      queryClient.invalidateQueries({ queryKey: ['getAllDishes'] });
      toast.success(data?.message);
      return;
    }
    setIsLoading(false);
    if (dishResponse?.status === 400 && Array.isArray(data?.error?.issues)) {
      errorToasts(data?.error);
    }
    if (dishResponse?.status === 400 || data?.message) {
      toast.error(data?.message);
    }
  };

  const handleVisibility = useCallback(() => {
    setVisibility(!visibility);
  }, [visibility]);

  const handleDishPage = useCallback(() => {
    setShowDeleteDish(true);
    setDishStep(DishSteps.CONFIRM_DELETE);
  }, [dishStep]);

  return (
    <form onSubmit={handleSubmitDish}>
      {isMenuManager ? <PendingActions /> : null}
      {isMenuManager ? null : (
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
          {isMenuManager ? null : (
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
                      <article
                        onClick={() => toggleSelection(type?.name)}
                        key={type?.name}
                        className={cn(
                          'flex items-center justify-between gap-1 rounded-full border border-[#CACACA] px-4 py-2 capitalize',
                          `${isSelected ? 'bg-blue-200' : ''}`,
                        )}
                      >
                        <img src={type?.icon} loading="lazy" alt={type?.name} width="20" height="20" />
                        <p>{type?.name.replace(/_/g, ' ').toLowerCase()}</p>
                      </article>
                    );
                  })}
                </section>
              </Background>
            </article>
          )}
        </section>
      )}
      <section className="mx-6 my-4 flex flex-col md:flex-row lg:mx-16 lg:mt-6">
        <article className="flex flex-1 justify-between rounded-full bg-white px-4 py-3">
          <h1 className="font-semibold opacity-50">Hide Dish</h1>
          <Switch
            checked={visibility}
            onChange={handleVisibility}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
        <article className="flex flex-1 justify-between rounded-full bg-white px-4 py-3">
          <h1 className="font-semibold opacity-50">Dish Availability</h1>
          <Switch
            checked={availability}
            onChange={setAvailability}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </article>
      </section>
      <section className="mx-6 flex flex-col gap-4 lg:mx-16 lg:mt-6 lg:flex-row">
        <article className="flex-1">
          {isManagerExists ? null : (
            <article>
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
            </article>
          )}
          {portions.length > 0 ? (
            <div className="relative mb-4 overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Portion Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {portions.map((portion, index) => (
                    <tr key={`${portion?.name}+${index}`} className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
                      <td className="px-6 py-4">{portion.name}</td>
                      <td className="px-6 py-4">{portion?.price ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>
        <article className="flex-1">
          <section id="linkCategories" onClick={() => redirectToSection(DishSteps.LINK_CATEGORY_STEP)}>
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
                  type="button"
                  onClick={() => addTiming({ day: 0, start: 0, end: 60 })}
                  disabled={timings.some((t) => t.day === -1) && timings.length >= 1}
                  title={timings.some((t) => t.day === -1) ? '“All day” allows only one slot' : undefined}
                >
                  + Add Slot
                </Button>
              </section>
            </Background>
          </section>
          <label className="font-semibold opacity-50" htmlFor="name">
            Delete Dish
          </label>
          <Background>
            <button
              onClick={handleDishPage}
              type="button"
              className="flex w-full items-center justify-center rounded-full bg-[#d32a2a] py-2 text-white"
            >
              <MdDelete className="mr-2" /> Delete Dish
            </button>
          </Background>
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
