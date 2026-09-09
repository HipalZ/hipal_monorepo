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

const isFullDaySlot = (slot: CategoryTiming) => {
  return Number(slot.day ?? -1) === -1 && Number(slot.start ?? 0) <= 0 && Number(slot.end ?? MINUTES_IN_DAY) >= MINUTES_IN_DAY;
};

const getEffectiveTimingRules = (entity: { timings?: CategoryTiming[] }) => {
  const timings = Array.isArray(entity.timings) ? entity.timings : [];
  return timings.filter((slot) => !isFullDaySlot(slot));
};

const hasTimingRules = (entity: { timings?: CategoryTiming[] }) => {
  return getEffectiveTimingRules(entity).length > 0;
};

const areTimingsActive = (timings: CategoryTiming[], now = new Date()) => {
  if (!timings.length) return true;

  const { currentDay, currentMinutes } = getIndiaClock(now);
  return timings.some((slot) => isInsideSlot(slot, currentDay, currentMinutes));
};

export const getCategoryRefId = (value?: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const record = value as { _id?: unknown; id?: unknown; toString?: () => string };
    if (record._id) return getCategoryRefId(record._id);
    if (record.id) return getCategoryRefId(record.id);
    const stringValue = record.toString?.();
    return stringValue && stringValue !== "[object Object]" ? stringValue : "";
  }
  return String(value);
};

export const categoryRefsMatch = (left?: unknown, right?: unknown) => {
  return getCategoryRefId(left) === getCategoryRefId(right);
};

const findParentCategory = (category: CategoryType, parentCategories: CategoryType[]) => {
  const parentIds = category.parentCategoryIds || [];
  return parentCategories.find((parent) =>
    parentIds.some((parentId) => categoryRefsMatch(parentId, parent._id)),
  );
};

export const isCategoryCurrentlyAvailable = (
  category: Pick<CategoryType, "availability" | "visibility" | "timings">,
  now = new Date(),
) => {
  if (category.availability === false || category.visibility === false) return false;

  const timings = getEffectiveTimingRules(category);
  return areTimingsActive(timings, now);
};

export const isDishCurrentlyAvailable = (
  dish: Pick<DishType, "availability" | "visibility" | "timings">,
  now = new Date(),
) => {
  if (dish.availability === false || dish.visibility === false) return false;

  const timings = getEffectiveTimingRules(dish);
  return areTimingsActive(timings, now);
};

const resolveCategoryTimingAvailability = (
  category: CategoryType,
  parentCategories: CategoryType[],
  now = new Date(),
) => {
  const categoryHasTiming = hasTimingRules(category);
  const parentCategory = findParentCategory(category, parentCategories);
  const parentHasTiming = parentCategory ? hasTimingRules(parentCategory) : false;
  const timingSource = categoryHasTiming
    ? category
    : parentHasTiming
      ? parentCategory
      : null;

  return {
    categoryHasTiming,
    parentCategory,
    parentHasTiming,
    timingAvailable: timingSource
      ? areTimingsActive(getEffectiveTimingRules(timingSource), now)
      : true,
  };
};

const resolveDishTimingAvailability = (
  dish: DishType,
  category: CategoryType,
  parentCategory: CategoryType | undefined,
  categoryHasTiming: boolean,
  parentHasTiming: boolean,
  now = new Date(),
) => {
  const dishHasTiming = hasTimingRules(dish);
  const timingSource = dishHasTiming
    ? dish
    : categoryHasTiming
      ? category
      : parentHasTiming
        ? parentCategory
        : null;

  return timingSource
    ? areTimingsActive(getEffectiveTimingRules(timingSource), now)
    : true;
};

export const applyCategoryTimingAvailability = (
  category: CategoryType,
  now = new Date(),
  parentCategories: CategoryType[] = [],
): CategoryWithTimingState => {
  const categoryStaticAvailable = category.availability !== false && category.visibility !== false;
  const { categoryHasTiming, parentCategory, parentHasTiming, timingAvailable } =
    resolveCategoryTimingAvailability(category, parentCategories, now);
  const populatedDishes = (category.dishIds || []) as unknown as PopulatedDish[];
  let hasAvailableDish = false;

  const dishIds = populatedDishes.map((dish) => {
    if (typeof dish === "string") return dish;

    const dishStaticAvailable = dish.availability !== false && dish.visibility !== false;
    const dishTimingAvailable = resolveDishTimingAvailability(
      dish,
      category,
      parentCategory,
      categoryHasTiming,
      parentHasTiming,
      now,
    );
    const availability = categoryStaticAvailable && dishStaticAvailable && dishTimingAvailable;
    if (availability) hasAvailableDish = true;

    return {
      ...dish,
      availability,
    } as DishType;
  }) as CategoryType["dishIds"];

  return {
    ...category,
    __isTimingAvailable: categoryStaticAvailable && (timingAvailable || hasAvailableDish),
    dishIds,
  };
};

export const applyMenuTimingAvailability = (
  parentCategories: CategoryType[],
  childCategories: CategoryType[],
  now = new Date(),
) => {
  const timedChildCategories = (childCategories || []).map((category) =>
    applyCategoryTimingAvailability(category, now, parentCategories || []),
  );
  const timedParentCategories = (parentCategories || []).map((category) =>
    applyCategoryTimingAvailability(category, now),
  );

  return { timedParentCategories, timedChildCategories };
};

export const isTimingDisabledCategory = (category: CategoryWithTimingState) => {
  return category.__isTimingAvailable === false;
};
