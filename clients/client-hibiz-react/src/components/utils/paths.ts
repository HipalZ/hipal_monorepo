export const API_URL = 'https://dev.api.hipal.life';

export const paths = {
  listAllBusiness: () => '/v1/businesses/get/allbusiness',
  getSingleBusiness: (businessId: string) => `/v1/businesses/get/Single/${businessId}`,
  getTheme: (businessId: string) => `/v1/settings?businessId=${businessId}`,
  getLoyalty: (businessId: string) => `/v1/businesses/${businessId}/loyalty`,
  getAllLoyaltyCustomers: (loyaltyId: string, pageNumber: number) =>
    `/v1/users/:businessId/getAllLoyaltyUsers?loyaltyId=${loyaltyId}&pageNumber=${pageNumber}`,
  getSingleLoyalCustomerHistory: (loyaltyId: string, phoneNumber: string, pageNumber: number, inTime: string, outTime: string) =>
    `/v1/users/:businessId/getUserRewardHistory?loyaltyId=${loyaltyId}&userPhone=${phoneNumber}&pageNumber=${pageNumber}&from=${inTime}&to=${outTime}`,
  getRewardHistory: (businessId: string, loyaltyId: string, pageNumber: number, from?: string, to?: string) =>
    `/v1/users/${businessId}/RewardHistory?loyaltyId=${loyaltyId}&pageNumber=${pageNumber}&from=${from}&to=${to}`,
  getZonesApi: (businessId: string) => `/v1/zones?businessId=${businessId}`,
  getStaffApi: (businessId: string) => `/v1/users/${businessId}`,
  getChargesApi: (businessId: string) => `/v1/dishes/:id/getCharges?businessId=${businessId}`,
  postZonesApi: () => '/v1/zones',
  updateZonesApi: (id: string) => `/v1/zones/${id}`,
  updateTableApi: (id: string) => `/v1/zones/:zoneId/tables/${id}`,
  postTablesApi: (zoneId: string) => `/v1/zones/${zoneId}/tables`,
  postBulkTableApi: (zoneId: string) => `/v1/zones/${zoneId}/bulkTables`,
  getTablesApi: (businessId: string) => `/v1/zones/all/tables?businessId=${businessId}`,
  getCharges: (businessId: string) => `/v1/dishes/:id/getCharges?businessId=${businessId}`,
  getZoneById: (id: string) => `/v1/zones/${id}`,
  getAllStaff: (businessId: string) => `/v1/users/${businessId}`,
  getCategoryApi: (businessId: string) => `/v1/categories?businessId=${businessId}`,
  getExtraApi: (businessId: string) => `/v1/dishes/:id/getExtra?businessId=${businessId}`,
  getAllDishes: (businessId: string) => `/v1/dishes?businessId=${businessId}`,
  postDishData: () => '/v1/dishes',
  getAllKitchens: (businessId: string) => `/v1/kitchens/?businessId=${businessId}`,
  getDishApi: (id: string) => `/v1/dishes/${id}`,
  updateDishData: (dishId: string) => `/v1/dishes/${dishId}`,
  deleteDishWithId: (dishId: string) => `/v1/dishes/${dishId}`,
};
