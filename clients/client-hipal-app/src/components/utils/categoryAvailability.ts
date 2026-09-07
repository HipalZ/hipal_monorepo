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
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const getIndiaClock = (now: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((part) => part.type === "weekday")?.value || "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return {
    currentDay: WEEKDAY_INDEX[weekday] ?? now.getDay(),
    currentMinutes: hour * 60 + minute,
  };
};

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

  const { currentDay, currentMinutes } = getIndiaClock(now);

  return timings.some((slot) => isInsideSlot(slot, currentDay, currentMinutes));
};

export const isDishCurrentlyAvailable = (
  dish: Pick<DishType, "availability" | "visibility" | "timings">,
  now = new Date(),
) => {
  if (dish.availability === false || dish.visibility === false) return false;

  const timings = (dish.timings || []) as CategoryTiming[];
  if (timings.length === 0) return true;

  const { currentDay, currentMinutes } = getIndiaClock(now);

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
        availability: isTimingAvailable && isDishCurrentlyAvailable(dish, now),
      } as DishType;
    }) as CategoryType["dishIds"],
  };
};

export const isTimingDisabledCategory = (category: CategoryWithTimingState) => {
  return category.__isTimingAvailable === false;
};
