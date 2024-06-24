const BASE_ROUTE = 'r'

const withBusinessId = (businessId: string, route: string) => `/${BASE_ROUTE}/${businessId}${route}`

export const PAGE_TYPES = {
	EXPLORER: 'explore',
	CATEGORY: 'category',
	CATEGORY_BY_ID: 'categoryById',
	DISH_ID: 'dish',
	ALL_CATEGORY: 'allCategory',
	FINAL_CART: 'finalCart',
	LIVE_CART: 'liveCart',
	SIGN_UP: 'signUp',
	SIGN_IN: 'signIn',
	OTP: 'otp',
	PROFILE: 'profile',
	PROFILE_EDIT: 'editProfile',
	PROFILE_LIKES: 'profileLikePage',
	ORDER_HISTORY: 'orderHistory',
	BILL_HISTORY: 'bill',
	PAYMENT: 'payment',
	LOYALTY: 'loyalty',
	LOYALTY_BY_ID: 'loyaltyById',
	REVIEW_HISTORY: 'reviewHistory',
	REVIEW: 'review',
	SCAN: 'scan',
	SEARCH: 'search',
	HICODE: 'hiCode',
	MODE: 'mode',
}

export const routePaths = {
	[PAGE_TYPES.EXPLORER]: (businessId: string) => withBusinessId(businessId, '/explore'),
	[PAGE_TYPES.LOYALTY]: (businessId: string) => withBusinessId(businessId, '/loyalty'),
	[PAGE_TYPES.LOYALTY_BY_ID]: (businessId: string, loyaltyId: string) =>
		withBusinessId(businessId, `/loyalty/${loyaltyId}`),
	[PAGE_TYPES.CATEGORY]: (businessId: string) => withBusinessId(businessId, '/category'),

	[PAGE_TYPES.CATEGORY_BY_ID]: (businessId: string, categoryId: string) =>
		withBusinessId(businessId, `/category#${categoryId}`),
	[PAGE_TYPES.DISH_ID]: (businessId: string, dishId: string) =>
		withBusinessId(businessId, `/category#${dishId}`),

	[PAGE_TYPES.ALL_CATEGORY]: (businessId: string) => withBusinessId(businessId, '/category/all'),

	[PAGE_TYPES.FINAL_CART]: (businessId: string) => withBusinessId(businessId, '/finalCart'),
	[PAGE_TYPES.LIVE_CART]: (businessId: string) => withBusinessId(businessId, '/liveCart'),

	[PAGE_TYPES.SIGN_UP]: (businessId: string) => withBusinessId(businessId, '/user/signup'),

	[PAGE_TYPES.SIGN_IN]: (businessId: string) => withBusinessId(businessId, '/user/signin'),

	[PAGE_TYPES.OTP]: (businessId: string) => withBusinessId(businessId, '/user/otp'),
	[PAGE_TYPES.HICODE]: (businessId: string) => withBusinessId(businessId, '/user/hicode'),

	[PAGE_TYPES.PROFILE]: (businessId: string) => withBusinessId(businessId, '/profile/userProfile'),

	[PAGE_TYPES.PROFILE_EDIT]: (businessId: string) =>
		withBusinessId(businessId, '/profile/editProfile'),

	[PAGE_TYPES.PROFILE_LIKES]: (businessId: string) =>
		withBusinessId(businessId, '/profile/profileLikePage'),

	[PAGE_TYPES.ORDER_HISTORY]: (businessId: string) => withBusinessId(businessId, '/orderHistory'),

	[PAGE_TYPES.BILL_HISTORY]: (businessId: string) => withBusinessId(businessId, '/bill'),

	[PAGE_TYPES.REVIEW_HISTORY]: (businessId: string) => withBusinessId(businessId, '/reviewHistory'),

	[PAGE_TYPES.REVIEW]: (businessId: string) => withBusinessId(businessId, '/review'),

	[PAGE_TYPES.SCAN]: (businessId: string) => withBusinessId(businessId, '/scan'),

	[PAGE_TYPES.PAYMENT]: (businessId: string) => withBusinessId(businessId, '/payment'),
	[PAGE_TYPES.MODE]: (businessId: string) => withBusinessId(businessId, '/mode'),

	[PAGE_TYPES.SEARCH]: (businessId: string) => withBusinessId(businessId, '/search'),

	status: (businessId: string) => withBusinessId(businessId, '/status'),
	payment: (businessId: string) => withBusinessId(businessId, '/payment'),
	login: (businessId: string) => withBusinessId(businessId, '/user/login'),
} as {
	[s: string]: (businessId: string, dishIdOrCategoryId?: string) => string

	status: (businessId: string) => string
	payment: (businessId: string) => string
	login: (businessId: string) => string
	mode: (businessId: string) => string
}

export const FLOW_TYPES = {
	DEFAULT: 'default',
	MENU_TO_CHILD_CATEGORY: 'menuToChildCategory',
	MENU_TO_PARENT_CATEGORY: 'menuToParentCategory',
}

export const FLOW = {
	[FLOW_TYPES.DEFAULT]: {
		[PAGE_TYPES.EXPLORER]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.CATEGORY],
		},
		[PAGE_TYPES.CATEGORY]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.FINAL_CART],
		},
		[PAGE_TYPES.ALL_CATEGORY]: {
			from: routePaths[PAGE_TYPES.CATEGORY],
			to: routePaths[PAGE_TYPES.CATEGORY],
		},

		[PAGE_TYPES.FINAL_CART]: {
			from: routePaths[PAGE_TYPES.CATEGORY],
			to: routePaths.payment,
		},
		[PAGE_TYPES.PROFILE]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.PROFILE_EDIT],
		},
		[PAGE_TYPES.REVIEW]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.REVIEW],
		},
		[PAGE_TYPES.PAYMENT]: {
			from: routePaths[PAGE_TYPES.FINAL_CART],
			to: routePaths[PAGE_TYPES.FINAL_CART],
		},
		[PAGE_TYPES.MODE]: {
			from: routePaths[PAGE_TYPES.PAYMENT],
			to: routePaths[PAGE_TYPES.MODE],
		},
	},
	[FLOW_TYPES.MENU_TO_CHILD_CATEGORY]: {
		[PAGE_TYPES.EXPLORER]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.ALL_CATEGORY],
		},
		[PAGE_TYPES.CATEGORY]: {
			from: routePaths[PAGE_TYPES.ALL_CATEGORY],
			to: routePaths[PAGE_TYPES.FINAL_CART],
		},
		[PAGE_TYPES.ALL_CATEGORY]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.CATEGORY],
		},
		[PAGE_TYPES.FINAL_CART]: {
			from: routePaths[PAGE_TYPES.CATEGORY],
			to: routePaths.payment,
		},
		[PAGE_TYPES.PROFILE]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.PROFILE_EDIT],
		},
		[PAGE_TYPES.REVIEW]: {
			from: routePaths[PAGE_TYPES.EXPLORER],
			to: routePaths[PAGE_TYPES.REVIEW],
		},
		[PAGE_TYPES.PAYMENT]: {
			from: routePaths[PAGE_TYPES.FINAL_CART],
			to: routePaths[PAGE_TYPES.EXPLORER],
		},
	},
}
