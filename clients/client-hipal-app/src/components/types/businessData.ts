import type { ICart } from "@/components/store/useCart"
import { ILoyaltySetting } from "../store/useLoyaltyData"

interface IBiz{
	businessName: string
	registeredName: string
	businessType: string
	gstRegistered: boolean
	multipleOutlets: boolean
	description:string
	tags: string[]
	customLink: string
	logo: string
	address: string
	staff: string[]
	id: string
	_id: string
}
export interface IBusinessData {
	_id: string
	settings?: ISettings
	businessesData?: IBiz
	business?:IBiz
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
export interface IExplore {
	wallpaper: string
	phone: string
	countryCode: string
	location: string
	openFrom: string
	close: string
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
export interface IThemes{
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
	id: string
}
export interface IDish {
	[x: string]: any
	businessId: string
	availability: false
	name: string
	price: number
	tax: null
	visibility: boolean
	discount: null
	avgTime: null
	dishType: string
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
	dishId: string
}

export interface IExtras {
	[x: string]: any
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
	hierarchy: string | "PARENT"
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
	extras: any[]
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
