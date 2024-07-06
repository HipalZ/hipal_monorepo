// const getApiUrl = process.env.NEXT_PUBLIC_API_HOST

export const paths = {
	listAllBusiness: () => "/businesses/get/allbusiness",
	sendOtp: () => "/users/otp",
	verifyOtp: () => "/users?action=login",
	businessData: (businessId: string) => `/businesses/${businessId}`,
	businessNameLogo : (businessId: string, nameLogo:string) => `/businesses/${businessId}?nameLogo=${nameLogo}`,
	categoryByBusiness: (businessId: string) => `/categories?businessId=${businessId}`,
	dishesData: (businessId: string) => `/dishes?businessId=${businessId}`,
	settings: (businessId: string) => `/settings?businessId=${businessId}`,
	getLoyaltySettings: (businessId: string) => `/businesses/${businessId}/loyalty`,
	getUserReward: (userPhone: number, loyaltyId: string) =>
		`/users/:businessId/getUserReward?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
	getUserRewardHistory: (userPhone: number, loyaltyId: string) =>
		`/users/:businessId/getUserRewardHistory?userPhone=${userPhone}&loyaltyId=${loyaltyId}`,
}
