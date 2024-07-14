
import { apiRpc } from '@hi/common';
import type { ICategory } from '@/components/types/businessData';

export interface IBizPayload {
    customTiming?: { day: string; openTime: string; closeTime: string; }[];
    fixCloseTime?: string;
    fixOpenTime?: string;
    socialMediaLinks?: { icon: string; link: string; }[];
    name?:string;
    socialMedia?: { icon: string; link: string; }[];
    footerDescription?: string;
    businessId: string;
    specialBannerUrl?: string | undefined;
    logoUrl?: string | undefined;
    endBannerUrl?: string | undefined;
    fssai?: string;
    gst?: string;
    description?: string;
    phone?: string;
    location?: string;
    amenities?: string[];
    tags?: string[];
    avgPricingForTwo?:string;
    isCustomTime: boolean;
}

export interface IBannerPayload {
    businessId?: string;
    isPublished: boolean;
    bannerType?: string;
    bannerImage?: string;
    heading?: string;
    headingColor?: string;
    headingFontWeight?: string;
    headingAlign?: string;
    paragraph?: string;
    paragraphColor?: string;
    paragraphFontWeight?: string;
    paragraphAlign?: string;
    buttonColor?: string;
    callToAction?: string;
    backgroundColor?: string;
    redirectionId?: string;
    redirectionType?: string;
    redirectionName?: string;
    _id?:string
}

export interface BasicInfo{
    _id:number
    text:string
}
export const basicInfos = [
    {
        _id: 1,
        text: 'Description',
    }, {
        _id: 2,
        text: 'Phone',
    },{
        _id: 3,
        text: 'Amenities',
    }, {
        _id: 4,
        text: 'Tags',
    }, 
]
export enum BannerType {
    BANNER_TYPE_0 = 'BANNER_TYPE_0',
    BANNER_TYPE_1 = 'BANNER_TYPE_1',
    BANNER_TYPE_2 = 'BANNER_TYPE_2',
    BANNER_TYPE_3 = 'BANNER_TYPE_3',
}
export interface IBannerType {
    _id: string;
    title: string;
    description: string;
    bannerType: BannerType;
}
export const bannerTypes = [
    {
        _id: 'BANNER_TYPE_1',
        title: 'Banner Type 1',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        bannerType: BannerType.BANNER_TYPE_1,
    }, {
        _id: 'BANNER_TYPE_2',
        title: 'Banner Type 2',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        bannerType: BannerType.BANNER_TYPE_2,
    }, {
        _id: 'BANNER_TYPE_3',
        title: 'Banner Type 3',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        bannerType: BannerType.BANNER_TYPE_3,
    }
];

export const colors = ([
    {
        _id: '1',
        textColor: '#7A10FF',
        bgColor: '#C8AAEE'
    },
    {
        _id: '2',
        textColor: '#FF6464',
        bgColor: '#FBDADA'
    },
    {
        _id: '3',
        bgColor: '#FF6363',
        textColor: '#F4F4F4'
    },
    {
        _id: '4',
        bgColor: '#2F75C7',
        textColor: '#F4F4F4'
    },
    {
        _id: '5',
        bgColor: '#DAFBED',
        textColor: '#4ABD8D'
    },
    {
        _id: '6',
        textColor: '#E28E2B',
        bgColor: '#F1CB9F'
    }
])


export const combineAllDishes = (categories: ICategory[]) => {
    return categories.reduce((dishes, category) => {
        return dishes.concat(category?.dishes)
    }, []);
};

export const getAllCategoryData = async (businessId: string) => {
    const categoryResponse = await apiRpc.categories.$get({
        query: {
            businessId: businessId
        },
    });
    const data = await categoryResponse.json();
    const categories = data?.data;
    const allDishes = combineAllDishes(categories);
    return allDishes;
};
