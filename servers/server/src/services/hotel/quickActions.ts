import { HotelService, HotelServiceCategory } from "@hi/db-models";

export const QUICK_ACTIONS_CATEGORY_KEY = "QUICK_ACTIONS";
export const CHECKOUT_SERVICE_KEY = "CHECKOUT";

const QUICK_ACTIONS_CATEGORY_NAME = "Quick Actions";

// acceptance / completion / delivery minutes
const DEFAULT_QUICK_ACTION_SERVICES = [
  {
    name: "Checkout",
    systemKey: CHECKOUT_SERVICE_KEY,
    avgAcceptanceTime: 2,
    avgCompletionTime: 15,
    avgDeliveryTime: 15,
  },
  {
    name: "Get Water",
    avgAcceptanceTime: 2,
    avgCompletionTime: 5,
    avgDeliveryTime: 4,
  },
  {
    name: "Room Cleaning",
    avgAcceptanceTime: 2,
    avgCompletionTime: 10,
    avgDeliveryTime: 9,
  },
  {
    name: "Get Towel",
    avgAcceptanceTime: 2,
    avgCompletionTime: 5,
    avgDeliveryTime: 4,
  },
] as const;

const createCheckoutService = async (
  businessId: string,
  categoryId: unknown,
) => {
  const checkoutDefaults = DEFAULT_QUICK_ACTION_SERVICES[0];
  const service = await HotelService.create({
    name: checkoutDefaults.name,
    businessId,
    categoryId,
    systemKey: CHECKOUT_SERVICE_KEY,
    avgAcceptanceTime: checkoutDefaults.avgAcceptanceTime,
    avgCompletionTime: checkoutDefaults.avgCompletionTime,
    avgDeliveryTime: checkoutDefaults.avgDeliveryTime,
  });
  await HotelServiceCategory.findByIdAndUpdate(categoryId, {
    $addToSet: { serviceIds: service._id },
  });
  return service;
};

/**
 * Idempotently seeds the "Quick Actions" category and its default services
 * for a business. First call creates everything; later calls only re-ensure
 * the system-critical Checkout service (admins may freely rename/delete the
 * other defaults without them coming back). A legacy service named
 * "checkout" (created before systemKey existed) is adopted, not duplicated.
 */
export const ensureQuickActionDefaults = async (businessId: string) => {
  let category = await HotelServiceCategory.findOne({
    businessId,
    systemKey: QUICK_ACTIONS_CATEGORY_KEY,
  });

  if (!category) {
    category = await HotelServiceCategory.create({
      name: QUICK_ACTIONS_CATEGORY_NAME,
      businessId,
      systemKey: QUICK_ACTIONS_CATEGORY_KEY,
      sequence: 0,
      serviceIds: [],
    });

    for (const defaults of DEFAULT_QUICK_ACTION_SERVICES) {
      const service = await HotelService.create({
        name: defaults.name,
        businessId,
        categoryId: category._id,
        ...("systemKey" in defaults ? { systemKey: defaults.systemKey } : {}),
        avgAcceptanceTime: defaults.avgAcceptanceTime,
        avgCompletionTime: defaults.avgCompletionTime,
        avgDeliveryTime: defaults.avgDeliveryTime,
      });
      await HotelServiceCategory.findByIdAndUpdate(category._id, {
        $addToSet: { serviceIds: service._id },
      });
    }

    return category;
  }

  // Category exists — only the Checkout service is system-critical.
  const checkoutService = await HotelService.findOne({
    businessId,
    systemKey: CHECKOUT_SERVICE_KEY,
  });
  if (checkoutService) {
    return category;
  }

  // Adopt a legacy name-based Checkout service instead of duplicating it.
  const legacyCheckout = await HotelService.findOne({
    businessId,
    name: { $regex: /^checkout$/i },
  });
  if (legacyCheckout) {
    await HotelServiceCategory.updateMany(
      { businessId, serviceIds: legacyCheckout._id },
      { $pull: { serviceIds: legacyCheckout._id } },
    );
    legacyCheckout.systemKey = CHECKOUT_SERVICE_KEY;
    legacyCheckout.categoryId = category._id as any;
    await legacyCheckout.save();
    await HotelServiceCategory.findByIdAndUpdate(category._id, {
      $addToSet: { serviceIds: legacyCheckout._id },
    });
    return category;
  }

  await createCheckoutService(businessId, category._id);
  return category;
};
