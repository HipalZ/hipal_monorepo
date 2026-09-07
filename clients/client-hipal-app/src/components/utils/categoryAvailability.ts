import type { CategoryType, DishType } from "@hi/db-models/src/validators";

type CategoryTiming = {
  day?: number;
  start?: number;
  end?: number;
};

export type CategoryWithTimingState = CategoryType & {
  __isTimingAvailable?: boolean;
};

type PopulatedDish = string | DishType;

const MINUTES_IN_DAY = 1440;

const getSlotAppliesToday = (slotDay: number, currentDay: number) => {
  return slotDay === -1 || slotDay === currentDay;
};

const isInsideSlot = (slot: CategoryTiming, currentDay: number, currentMinutes: number) => {
  const slotDay = Number(slot.day ?? -1);
  const start = Number(slot.start ?? 0);
  const end = Number(slot.end ?? MINUTES_IN_DAY);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  if (!getSlotAppliesToday(slotDay, currentDay)) return false;
  if (start <= 0 && end >= MINUTES_IN_DAY) return true;

  if (start <= end) {
    return currentMinutes >= start && currentMinutes < end;
  }

  return currentMinutes >= start || currentMinutes < end;
};

export const isCategoryCurrentlyAvailable = (
  category: Pick<CategoryType, "availability" | "visibility" | "timings">,
  now = new Date(),
) => {
  if (category.availability === false || category.visibility === false) return false;

  const timings = (category.timings || []) as CategoryTiming[];
  if (timings.length === 0) return true;

  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return timings.some((slot) => isInsideSlot(slot, currentDay, currentMinutes));
};

export const applyCategoryTimingAvailability = (
  category: CategoryType,
  now = new Date(),
): CategoryWithTimingState => {
  const isTimingAvailable = isCategoryCurrentlyAvailable(category, now);
  const populatedDishes = (category.dishIds || []) as unknown as PopulatedDish[];

  return {
    ...category,
    __isTimingAvailable: isTimingAvailable,
    dishIds: populatedDishes.map((dish) => {
      if (typeof dish === "string") return dish;

      return {
        ...dish,
        availability: isTimingAvailable && dish.availability !== false,
      } as DishType;
    }) as CategoryType["dishIds"],
  };
};

export const isTimingDisabledCategory = (category: CategoryWithTimingState) => {
  return category.__isTimingAvailable === false;
};
