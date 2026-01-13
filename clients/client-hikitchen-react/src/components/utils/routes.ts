const BASE_ROUTE = 'r';

const withBusinessId = (businessId: string, route: string) => `/${BASE_ROUTE}/${businessId}${route}`;

export const PAGE_TYPES = {
  LOGIN: 'login',
  KITCHENS: 'kitchens',
  KITCHEN_DETAIL: 'kitchen',
  SETTING: 'setting',
};

export const singleRoute = {
  [PAGE_TYPES.LOGIN]: (businessId: string) => withBusinessId(businessId, '/login'),
  [PAGE_TYPES.KITCHENS]: (businessId: string) => withBusinessId(businessId, '/kitchens'),
  [PAGE_TYPES.SETTING]: (businessId: string) => withBusinessId(businessId, '/setting'),
};

export const doubleRoute = {
  [PAGE_TYPES.KITCHEN_DETAIL]: (businessId: string, kitchenId: string) => withBusinessId(businessId, `/kitchens/${kitchenId}`),
};
