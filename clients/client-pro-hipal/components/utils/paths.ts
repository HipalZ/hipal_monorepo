export const paths = {
	listAllBusiness: () => `/v1/businesses/get/allbusiness`,
	sendOtp: () => `/v1/users/otp`,
	verifyOtp: () => `/v1/users?action=login`,
	businessData: (businessId: string) => `/v1/businesses/${businessId}`,
	categoryByBusiness: (businessId: string) => `/v1/categories?businessId=${businessId}`,
	dishesData: (businessId: string) => `/v1/dishes?businessId=${businessId}`,
	settings: (businessId: string) => `/v1/settings?businessId=${businessId}`,
	getLoyaltySettings: (businessId: string) => `/v1/businesses/${businessId}/loyalty`,
	getUserReward: (userPhone: number, loyaltyId: string) =>
		`/v1/users/:businessId/getUserReward?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
	getUserRewardHistory: (userPhone: number, loyaltyId: string) =>
		`/v1/users/:businessId/getUserRewardHistory?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
}
