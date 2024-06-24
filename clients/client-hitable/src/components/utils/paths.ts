export const paths = {
  listAllBusiness: () => `/v1/businesses/get/allbusiness`,
  getSingleUserHistory: (userPhone: number, loyaltyId: string, fieldMasks: string) =>
    `/v1/users/:businessId/getUserRewardHistory?userPhone=${userPhone}&loyaltyId=${loyaltyId}&fieldMasks=${fieldMasks}`,
  getUsersHistory: (pageNumber: number, businessId: string, loyaltyId: string, fieldMasks: string) =>
    `/v1/users/${businessId}/RewardHistory?loyaltyId=${loyaltyId}&pageNumber=${pageNumber}&fieldMasks=${fieldMasks}`,
  postWaiterLogin: () => `/v1/users/waiterLogin`,
  getLoyaltySettings: (businessId: string) => `/v1/businesses/${businessId}/loyalty`,
  postLoyaltyCoinz: (claim: boolean, HiLite: boolean) => `/v1/users/Reward?claim=${claim}&HiLite=${HiLite}`,
  getUserReward: (userPhone: number, loyaltyId: string) => `/v1/users/:businessId/getUserReward?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
  getActiveUser: (tableId: string, zoneId: string, businessId: string) =>
    `/v1/kitchens/:id/ActiveUser?tableId=${tableId}&zoneId=${zoneId}&businessId=${businessId}`,
  getDues: (businessId: string) => `/v1/payments/Get/Dues?businessId=${businessId}`,
  updateKotAndPayment: () => `/v1/kitchens/:id/settle-bill`,
  fetchBill: (businessId: string, zoneId: string, tableId: string) =>
    `/v1/kitchens/:id/temp-bill?businessId=${businessId}&zoneId=${zoneId}&tableId=${tableId}`,
};
