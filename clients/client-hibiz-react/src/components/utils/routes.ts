const withoutBusinessId = (route: string) => `${route}`;
export const routeToDashboard = (businessId: string) =>
  `/app/business/${businessId}`;
export const routeToCustomerz = (businessId: string) =>
  `/app/business/${businessId}/customerz`;
export const routeToItems = (businessId: string) =>
  `/app/business/${businessId}/items?tab=items`;
export const PAGE_TYPES = {
  DASHBOARD: "dashboard",
  LOGIN: "login",
  OTP: "otp",
  BUSINESS: "business",
  BUSINESS_DETAILS: "business-details",
  ANALYTICS: "analytics",
  ALERTS: "alerts",
  KITCHEN: "kitchen",
  DINEIN: "dinein",
  SALES: "sales",
  TIPS: "tips",
  LOYALTY: "loyalty",
  STAFF: "staff",
  DUES: "dues",
  ALERT_SETTING: "alertSetting",
  STAFF_DETAILS: "staff-details",
  SETTINGS: "settings",
  PROFILE: "profile",
  CLEAR_DUE: "cleardue",
  ANALYTICS_CATEGORY: "category",
  ANALYTICS_DISH: "dish",
  ANALYTICS_COUPON: "coupon",
  ANALYTICS_LOYALTY: "loyalty",
  LOYALTY_ID: "loyaltyId",
  LOYALTY_HISTORY: "history",
  LOYALTY_CSV: "csv",
  ADD_DISH: "addDish",
  ITEMS: "items",
  CREATE: "create",
  EDIT_CATEGORY: "editCategory",
  ADD_ADD_ONS: "addAddOns",
  EDIT_ADD_ONS: "editAddOn",
  ADD_KITCHEN: "addKitchen",
  EDIT_KITCHEN: "editKitchen",
  ADD_BUSINESS: "addBusiness",
};

export const routePaths = {
  [PAGE_TYPES.DASHBOARD]: () => withoutBusinessId("/dashboard"),
  [PAGE_TYPES.LOGIN]: () => withoutBusinessId("/"),
  [PAGE_TYPES.OTP]: () => withoutBusinessId("/app/otp"),
  [PAGE_TYPES.BUSINESS]: () => withoutBusinessId("/app/business"),
  [PAGE_TYPES.PROFILE]: () => withoutBusinessId("/app/profile"),
  [PAGE_TYPES.ADD_BUSINESS]: () =>
    withoutBusinessId("app/business/addBusiness"),
};
export const routePathsWithId = {
  [PAGE_TYPES.BUSINESS_DETAILS]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}`),
  [PAGE_TYPES.ANALYTICS]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/analytics`),
  [PAGE_TYPES.ANALYTICS_CATEGORY]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/analytics/category`),
  [PAGE_TYPES.ANALYTICS_DISH]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/analytics/dish`),
  [PAGE_TYPES.ANALYTICS_COUPON]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/analytics/coupon`),
  [PAGE_TYPES.ANALYTICS_LOYALTY]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/analytics/loyalty`),
  [PAGE_TYPES.ALERTS]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/alerts`),
  [PAGE_TYPES.KITCHEN]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/kitchen`),
  [PAGE_TYPES.DINEIN]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/dinein`),
  [PAGE_TYPES.ADD_DISH]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/items/addDish`),
  [PAGE_TYPES.SALES]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/sales`),
  [PAGE_TYPES.LOYALTY]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/loyalty`),
  [PAGE_TYPES.LOYALTY_CSV]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/loyalty/csv`),
  [PAGE_TYPES.STAFF]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/staff`),
  [PAGE_TYPES.SETTINGS]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/settings`),
  [PAGE_TYPES.ALERT_SETTING]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/sales/alertSetting`),
  [PAGE_TYPES.ITEMS]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/items`),
  [PAGE_TYPES.CREATE]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/items/category/create`),
  [PAGE_TYPES.ADD_ADD_ONS]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/items/addOnDish`),
  [PAGE_TYPES.ADD_KITCHEN]: (businessId: string) =>
    withoutBusinessId(`/app/business/${businessId}/kitchen/addKitchen`),
};

export const routePathsWithIds = {
  [PAGE_TYPES.DUES]: (businessId: string, duesPersonId: string) =>
    withoutBusinessId(`/app/business/${businessId}/sales/${duesPersonId}`),
  [PAGE_TYPES.CLEAR_DUE]: (businessId: string, duesPersonId: string) =>
    withoutBusinessId(
      `/app/business/${businessId}/sales/${duesPersonId}/clear`,
    ),
  [PAGE_TYPES.STAFF_DETAILS]: (businessId: string, staffId: string) =>
    withoutBusinessId(`/app/business/${businessId}/staff/${staffId}`),
  [PAGE_TYPES.LOYALTY_ID]: (businessId: string, loyaltyId: string) =>
    withoutBusinessId(`/app/business/${businessId}/loyalty/${loyaltyId}`),
  [PAGE_TYPES.LOYALTY_HISTORY]: (businessId: string, loyaltyId: string) =>
    withoutBusinessId(`/app/business/${businessId}/loyalty/${loyaltyId}/coins`),
  [PAGE_TYPES.TIPS]: (businessId: string, tipsPersonId: string) =>
    withoutBusinessId(`/app/business/${businessId}/tips/${tipsPersonId}`),
  [PAGE_TYPES.EDIT_CATEGORY]: (businessId: string, categoryId: string) =>
    withoutBusinessId(
      `/app/business/${businessId}/items/category/${categoryId}`,
    ),
  [PAGE_TYPES.EDIT_ADD_ONS]: (businessId: string, addOnId: string) =>
    withoutBusinessId(`/app/business/${businessId}/items/addOnDish/${addOnId}`),
  [PAGE_TYPES.EDIT_KITCHEN]: (businessId: string, kitchenId: string) =>
    withoutBusinessId(`/app/business/${businessId}/kitchen/${kitchenId}`),
};
