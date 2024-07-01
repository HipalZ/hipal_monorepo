const withBusinessId = (customLink: string, route: string) => `/${customLink}${route}`

export const PAGE_TYPES = {
	EXPLORER: "explore",
	CATEGORY: "category",
	CATEGORY_BY_ID: "categoryById",
	DISH_ID: "dish",
	ALL_CATEGORY: "allCategory",
	FINAL_CART: "finalCart",
	LIVE_CART: "liveCart",
	SIGN_UP: "signUp",
	SIGN_IN: "signIn",
	OTP: "otp",
	PROFILE: "profile",
	PROFILE_EDIT: "editProfile",
	PROFILE_LIKES: "profileLikePage",
	ORDER_HISTORY: "orderHistory",
	BILL_HISTORY: "bill",
	PAYMENT: "payment",
	LOYALTY: "loyalty",
	LOYALTY_BY_ID: "loyaltyById",
	REVIEW_HISTORY: "reviewHistory",
	REVIEW: "review",
	SCAN: "scan",
	SEARCH: "search",
	HICODE: "hiCode",
	MODE: "mode",
}

export const routePaths = {
	[PAGE_TYPES.EXPLORER]: (customLink: string) => withBusinessId(customLink, "/explore"),
	[PAGE_TYPES.LOYALTY]: (customLink: string) => withBusinessId(customLink, "/loyalty"),
	[PAGE_TYPES.LOYALTY_BY_ID]: (customLink: string, loyaltyId: string) =>
		withBusinessId(customLink, `/loyalty/${loyaltyId}`),
	[PAGE_TYPES.CATEGORY]: (customLink: string) => withBusinessId(customLink, "/category"),

	[PAGE_TYPES.CATEGORY_BY_ID]: (customLink: string, categoryId: string) =>
		withBusinessId(customLink, `/category#${categoryId}`),
	[PAGE_TYPES.DISH_ID]: (customLink: string, dishId: string) =>
		withBusinessId(customLink, `/category#${dishId}`),

	[PAGE_TYPES.FINAL_CART]: (customLink: string) => withBusinessId(customLink, "/finalCart"),
	[PAGE_TYPES.LIVE_CART]: (customLink: string) => withBusinessId(customLink, "/liveCart"),

	[PAGE_TYPES.SIGN_UP]: (customLink: string) => withBusinessId(customLink, "/user/signup"),

	[PAGE_TYPES.SIGN_IN]: (customLink: string) => withBusinessId(customLink, "/user/signin"),

	[PAGE_TYPES.OTP]: (customLink: string) => withBusinessId(customLink, "/user/otp"),
	[PAGE_TYPES.HICODE]: (customLink: string) => withBusinessId(customLink, "/user/hicode"),

	[PAGE_TYPES.PROFILE]: (customLink: string) => withBusinessId(customLink, "/profile/userProfile"),

	[PAGE_TYPES.PROFILE_EDIT]: (customLink: string) =>
		withBusinessId(customLink, "/profile/editProfile"),

	[PAGE_TYPES.PROFILE_LIKES]: (customLink: string) =>
		withBusinessId(customLink, "/profile/profileLikePage"),

	[PAGE_TYPES.ORDER_HISTORY]: (customLink: string) => withBusinessId(customLink, "/orderHistory"),

	[PAGE_TYPES.BILL_HISTORY]: (customLink: string) => withBusinessId(customLink, "/bill"),

	[PAGE_TYPES.REVIEW_HISTORY]: (customLink: string) => withBusinessId(customLink, "/reviewHistory"),

	[PAGE_TYPES.REVIEW]: (customLink: string) => withBusinessId(customLink, "/review"),

	[PAGE_TYPES.SCAN]: (customLink: string) => withBusinessId(customLink, "/scan"),

	[PAGE_TYPES.PAYMENT]: (customLink: string) => withBusinessId(customLink, "/payment"),
	[PAGE_TYPES.MODE]: (customLink: string) => withBusinessId(customLink, "/mode"),

	[PAGE_TYPES.SEARCH]: (customLink: string) => withBusinessId(customLink, "/search"),

	status: (customLink: string) => withBusinessId(customLink, "/status"),
	payment: (customLink: string) => withBusinessId(customLink, "/payment"),
	login: (customLink: string) => withBusinessId(customLink, "/user/login"),
} as {
	[s: string]: (customLink: string, dishIdOrCategoryId?: string) => string

	status: (customLink: string) => string
	payment: (customLink: string) => string
	login: (customLink: string) => string
	mode: (customLink: string) => string
}

export const FLOW_TYPES = {
	DEFAULT: "default",
	MENU_TO_CHILD_CATEGORY: "menuToChildCategory",
	MENU_TO_PARENT_CATEGORY: "menuToParentCategory",
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
