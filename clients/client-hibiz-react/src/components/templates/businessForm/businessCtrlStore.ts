import PlaceHolder from "@/assets/businessControl.png"
import ExploreIcon from '@/assets/hisite/exploreIcon.png'
import MenuIcon from '@/assets/hisite/menuIcon.png'
export const colors = [
	{
		primaryColor: "#FFF7F1",
		subColors: [
			{ id: 2, secondaryColor: "#35374B" },
			{ id: 3, secondaryColor: "#116D6E" },
			{ id: 4, secondaryColor: "#BE3144" },
			{ id: 5, secondaryColor: "#26144B" },
		],
	},
	{
		primaryColor: "#EDDEB8",
		subColors: [
			{ id: 1, secondaryColor: "#35374B" },
			{ id: 2, secondaryColor: "#116D6E" },
			{ id: 3, secondaryColor: "#BE3144" },
		],
	},
	{
		primaryColor: "#034C25",
		subColors: [
			{ id: 1, secondaryColor: "#F7E0BE" },
			{ id: 2, secondaryColor: "#116D6E" },
			{ id: 3, secondaryColor: "#BE3144" },
		],
	},
	{
		primaryColor: "#F34B10",
		subColors: [
			{ id: 1, secondaryColor: "#FEFCF5" },
			{ id: 2, secondaryColor: "#116D6E" },
			{ id: 3, secondaryColor: "#BE3144" },
		],
	},
];

export const businessCtrlServices = [
	{
		image: PlaceHolder,
		Title: "Staff",
		tags: [
			"Adding staff",
			"Permissions",
		],
		navigation: "staff",
	},
	{
		image: PlaceHolder,
		Title: "Hi Sites",
		tags: [
			"Explore Page",
			"Business Info",
		],
		navigation: "hisite",
	},
	{
		image: PlaceHolder,
		Title: "Settings",
		tags: [
			"Explore Page",
			"Business Info",
		],
		navigation: "settings",
	},
	{
		image: PlaceHolder,
		Title: "Manage Pages",
		tags: [
			"Explore Page",
			"Blogz",
		]
	},
	{
		image: PlaceHolder,
		Title: "Manage Menu",
		tags: [
			"creator",
			"manager",
		]
	},
]

export const hisiteServices = [
	{	
		_id:1,
		title:"Explore Page",
		description:"Manage how your business look",
		icon: ExploreIcon,
		navigateTo: "explorePage"
	},{
		_id:2,
		title:'Menu Page',
		description:'Manage your menu items',
		icon:MenuIcon
	}
]