const getApiUrl = process.env.NEXT_PUBLIC_API_HOST

export const paths = {
	listAllBusiness: () => `${getApiUrl}/v1/businesses/get/allbusiness`,
	sendOtp: () => `${getApiUrl}/v1/users/otp`,
	verifyOtp: () => `${getApiUrl}/v1/users?action=login`,
	businessData: (businessId: string) => `${getApiUrl}/v1/businesses/${businessId}`,
	categoryByBusiness: (businessId: string) =>
		`${getApiUrl}/v1/categories?businessId=${businessId}`,
	dishesData: (businessId: string) => `${getApiUrl}/v1/dishes?businessId=${businessId}`,
	settings: (businessId: string) => `${getApiUrl}/v1/settings?businessId=${businessId}`,
	getLoyaltySettings: (businessId: string) => `${getApiUrl}/v1/businesses/${businessId}/loyalty`,
	getUserReward: (userPhone: number, loyaltyId: string) =>
		`${getApiUrl}/v1/users/:businessId/getUserReward?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
	getUserRewardHistory: (userPhone: number, loyaltyId: string) =>
		`${getApiUrl}/v1/users/:businessId/getUserRewardHistory?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
}
