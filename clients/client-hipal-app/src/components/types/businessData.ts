import type { ICart } from "@/components/store/useCart"
import type { ILoyaltySetting } from "../store/useLoyaltyData"

export interface IBiz {
	businessName: string;
	registeredName: string;
	businessType: string;
	gstRegistered: boolean;
	multipleOutlets: boolean;
	description: string;
	tags: string[];
	customLink: string;
	logo: string;
	address: string;
	staff: string[];
	_id: string;
	close: string;
	createdAt: string;
	fssaiLicenseNumber: string;
	gstNumber: string;
	gstPercentage: number;
	hibiz: boolean;
	hikitchen: boolean;
	hipeople: boolean;
	hitable: boolean;
	isHasDishData: boolean;
	isHasGst: boolean;
	isHasSetting: boolean;
	isPaymentIntegrated: boolean;
	kotPrinter: boolean;
	likes: string[];
	loyalty: boolean;
	open: string;
	serviceCharge: boolean;
	serviceChargePercentage: number;
	serviceChargeRemovalPass: string;
	serviceControl: {
	  discountPassword: string;
	};
	status: boolean;
	takeAwayName: string;
	tier: string;
	updatedAt: string;
	wallpaper: string;
	withPopCorn: boolean;
	location: string;
	phone: string;
	phoneNumber:string
	__v: number;
	id: string;
  }
  
export interface IBusinessData {
	_id: string
	settings?: ISettings
	business?: IBiz
	dishesData?: IDish[]
	dishData?: IDish
	categoryData?: ICategory[]
	categories?: ICategories[]
	allCategoriesTypes?: {
		main: ICategoryTypes
		sub: ICategorySubTypes
	}
	loyalty:ILoyaltySetting
	cart?: ICart[]
}

export interface ICategories extends ICategory {
	dishes: IDish[]
}

export interface IPopular {
	_id: string
	name: string

}
export interface IExplore {
	wallpaper: string
	phone: string
	countryCode?: string
	location: string
	openFrom?: string
	openTill?: string
	specialOffers?: {
		wallpaper: string
		offerName: string
		redirectType?: string
		redirectId?: string
		redirectName?: string
	}[]
	popular?: IPopular[]
	highlights?: {
		name: string
		stories: string[]
	}[]
}
export interface IThemes{
	primaryColor: string
	secondaryColor: string
	accentColor?: string
	fontFamily?: string
	fontURL?: string
	buttonStyle?: string
	miniBanner?: string
	specialBanner?: string
	endBanner?: string
	instagramLink?: string
	facebookLink?: string
	youtubeLink?: string
	linkedinLink?: string
	footerText?: string
}
export interface ISettings {
	businessId: string
	themes: IThemes
	categoryOrder: string[]
	explore: IExplore,
	navigation: {
		from: string
		to: string
		categoryCard: string
		dishCard: string
	}
	_id: string
}
export interface IDish {
	businessId: string
	availability: false
	name: string
	price: number
	tax: null
	visibility: boolean
	discount: null
	avgTime: null
	dishType: string
	categories:ICategory[]
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
	id:string
	_id: string
	dishId: string
}

export interface IExtras {
	_id: string
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
	hierarchy: string | "PARENT"
	parentCategory: string
	parentCategoryId?: string
	coverImage: string
	links: never[]
	dishes: {
		_id: string
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
	maxQuantity?: number
	id: string
	ExtraType?: string
	name: string
	price: string
}

export interface IPortion {
	name: string
	price: string
	discount: string
	default: boolean | string
}
export interface Item {
	name: string
	quantity: number
	amount: number
	extras: string[]
	comments: string
}

export interface UserData {
	userPhone: string
	userName: string
	rewards: number
	currentBalance: number
	status: string
	date: number
	time: string
	businessName: string
	waiterName: string
	items: Item[]
	tableName: string
	day: string
	loyaltyId: string
	id: string
	_id: string
}

export interface User {
	_id: string;
	name: string;
	email: string;
	phone: string;
	customRole: CustomRole[];
	password: string;
	role: string[];
	createdAt: string;
	updatedAt: string;
	__v: number;
  };
  
export interface  CustomRole  {
	businessId: string;
	customRoleId: string;
	role: string;
	accessControl: AccessControl;
	bookMark: boolean;
	_id: string;
  };
  
export interface  AccessControl {
	hibiz: boolean;
	_id: string;
  };