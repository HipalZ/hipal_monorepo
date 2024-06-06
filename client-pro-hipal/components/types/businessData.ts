export interface IBusinessData {
	settings?: ISettings
	businessesData?: {
		businessName: string
		registeredName: string
		businessType: string
		gstRegistered: boolean
		multipleOutlets: boolean
		customLink: string
		logo: string
		address: string
		staff: string[]
		id: string
	}
	dishesData?: IDish[]
	dishData?: IDish
	categoryData?: ICategory[]
	categories?: ICategories[]
	allCategoriesTypes?: {
		main: ICategoryTypes
		sub: ICategorySubTypes
	}
}

export interface Category {
    name: string;
    id: string;
}

export interface Filter {
    timeToConsume: string;
    portionBestSuited: string;
    bestWeather: string;
    levelOfSpice: string;
    bestOccasion: string;
    texture: string;
    time: string;
    dishes: IDish[];
}

export interface Variant {
    id: string;
    extra: IExtraItem;
}

export interface DishData {
    businessId: string;
    name: string;
    price: number;
    avgTime: number;
    dishType: string;
    categories: Category[];
    portions: IPortion[];
    extras: IExtras[];
    kitchenId: string;
    filters: Filter;
    images: string[];
    description: string;
    tags: string[];
    links: string[];
    delayTime: number | null;
    availability: boolean;
    version: number;
    taxes: string[];
    visibility: boolean;
    id: string;
}

export interface RootObject {
    dishData: DishData;
    dishId: string;
    parentCategoryId: string;
    parentCategoryName: string;
    variants: Variant[];
}


export interface ICategories extends ICategory {
	dishes: IDish[]
}

export interface ISettings {
	businessId: string
	themes: {
		primaryColor: string
		secondaryColor: string
		accentColor: string
		fontFamily: string
		fontURL: string
		buttonStyle: string
		miniBanner: string
		specialBanner: string
		endBanner: string
		instagramLink: string
		facebookLink: string
		youtubeLink: string
		linkedinLink: string
		footerText: string
	}
	categoryOrder: string[]
	explore: {
		wallpaper: string
		phone: string
		countryCode: string
		location: string
		openFrom: string
		openTill: string
		specialOffers: {
			wallpaper: string
			offerName: string
			redirectType?: undefined
			redirectId?: undefined
			redirectName?: undefined
		}[]
		popular: {
			id: string
			name: string
		}[]
		highlights: {
			name: string
			stories: string[]
		}[]
	}
	navigation: {
		from: string
		to: string
		categoryCard: string
		dishCard: string
	}
	id: string
}
export interface IDish {
	_id:string
	businessId: string
	availability: false
	name: string
	price: number
	tax: null
	visibility: boolean
	discount: null
	avgTime: null
	dishType: string
	dishStatus: string
	categories: {
		id: string
		name: string
	}[]
	portions: IPortion[]
	extras: IExtras[]
	filters: {
		timeToConsume: string
		portionBestSuited: string
		levelOfSpice: string
		bestOccasion: string
		texture: string
		time: string
		bestWeather: string
		dishes: never[]
	}
	images: string[]
	description: string
	tags: never[]
	links: never[]
	version: number
	id: string
}
export interface IExtras {
	_id: string
	id: string
	addOnType?: string
	maxQuantity: number
	name?: string
	numOptions: number
	numSelections: number
	compulsory: number
	items: IExtraItem[]
}

export interface ICategory {
	_id: string
	businessId: string
	name: string
	visibility: boolean
	timerOn: boolean
	timerStart: null
	timerEnd: null
	availableDays: never[]
	hierarchy: string | 'PARENT'
	parentCategory: string
	parentCategoryId?: string
	coverImage: string
	links: never[]
	dishes: {
		id: string
		name: string
	}[]
	version: number
	id: string
}

export interface ICategoryTypes {
	[key: string]: ICategory
}

export interface ICategorySubTypes {
	[key: string]: ICategory[]
}

export interface IExtraItem {
	_id: string
	id: string
	ExtraType?: string
	name: string
	price: string
	maxQuantity: number
	availability:number
	visibility:number
}

export interface IPortion {
	name: string
	price: string
	discount: string
	default: boolean | string
}

export interface IEBill {
	businessId: string
	zoneId: string
	tableId: string
	staffId: string
	startedAt: number
	cookedAt: number
	status: string
	dish: {
		dishId: string
		name: string
		price: number
		qty: number
		comments: string
		extras: {
			name: string
			price: string
			qty: number
		}[]
		portions: {
			name: string
			price: string
			discount: string
			default: string
		}
	}
	customerName: string
	customerPhone: string
	dishStatus: string
	kotTime: string
	tableName: string
	date: string
	id: string
	_id: string
	subTotal: number
	Total: number
	CGST: number
	SGST: number
	discount: number
	claimedAmount: number
	serviceCharge: number
	logo: string
	businessName: string
}
export interface Item {
	name: string
	quantity: number
	amount: number
	extras: IExtras[]
	comments: string
}

export interface UserData {
	userPhone: string
	userName: string
	rewards: number
	currentBalance: number
	status: string
	date: string
	time: string
	businessName: string
	waiterName: string
	items: Item[]
	tableName: string
	day: string
	loyaltyId: string
	id: string
}

export interface IBill {
	businessId: string;
	zoneId: string;
	tableId: string;
	staffId: string;
	startedAt: number;
	cookedAt: number;
	status: string;
	dish: {
	  dishId: string;
	  name: string;
	  price: number;
	  qty: number;
	  comments: string;
	  extras: {
		name: string;
		price: string;
		quantity: number;
	  }[];
	  portions: {
		name: string;
		price: string;
		discount: string;
		default: string;
	  };
	};
	customerName: string;
	customerPhone: string;
	dishStatus: string;
	kotTime: string;
	tableName: string;
	date: string;
	id: string;
	_id: string;
	subTotal: number;
	Total: number;
	discount: number;
	CGST: number;
	SGST: number;
	businessName: string;
	claimedAmount: number;
	serviceCharge: string;
	tips: string;
	packingCharges: number;
	RxPayableGST: number;
	swiggyPayableGST: number;
  }