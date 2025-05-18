import { apiRpc } from "@hi/common";
import type { ICategory, IDish } from "@/components/types/businessData";
import { BannerType } from "@/components/utils/bannerLayouts";
import { useParams } from "react-router-dom";

export const basicInfos = [
  {
    _id: 1,
    text: "Description",
  },
  {
    _id: 2,
    text: "Phone",
  },
  {
    _id: 3,
    text: "Amenities",
  },
  {
    _id: 4,
    text: "Tags",
  },
];

export interface IBannerType {
  _id: string;
  title: string;
  description: string;
  bannerType: BannerType;
}
export const bannerTypes = [
  {
    _id: "BANNER_TYPE_1",
    title: "Banner Type 1",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
    bannerType: BannerType.BANNER_TYPE_1,
  },
  {
    _id: "BANNER_TYPE_2",
    title: "Banner Type 2",
    description: "Lorem Ipsum is simply dummy text.",
    bannerType: BannerType.BANNER_TYPE_2,
  },
  {
    _id: "BANNER_TYPE_3",
    title: "Banner Type 3",
    description: "Lorem Ipsum is simply dummy text",
    bannerType: BannerType.BANNER_TYPE_3,
  },
];

export const colors = [
  {
    _id: "1",
    textColor: "#7A10FF",
    bgColor: "#C8AAEE",
  },
  {
    _id: "2",
    textColor: "#FF6464",
    bgColor: "#FBDADA",
  },
  {
    _id: "3",
    bgColor: "#FF6363",
    textColor: "#F4F4F4",
  },
  {
    _id: "4",
    bgColor: "#2F75C7",
    textColor: "#F4F4F4",
  },
  {
    _id: "5",
    bgColor: "#DAFBED",
    textColor: "#4ABD8D",
  },
  {
    _id: "6",
    textColor: "#E28E2B",
    bgColor: "#F1CB9F",
  },
];

// combining all dishes from all categories
export const combineAllDishes = async (categories: ICategory[]) => {
  const uniqueDishesMap = new Map<string, IDish>();

  categories.forEach((category) => {
    category?.dishIds.forEach((dish) => {
      if (dish?._id && !uniqueDishesMap.has(dish._id)) {
        uniqueDishesMap.set(dish._id, dish);
      }
    });
  });

  return Array.from(uniqueDishesMap.values());
};

//
export const getAllCategoryData = async (businessId: string) => {
  const { menuId } = useParams<{ menuId: string; businessId: string }>();

  const updatedQuery = menuId
    ? {
        menuId: menuId,
        businessId: businessId,
      }
    : {
        businessId: businessId,
      };
  const categoryResponse = await apiRpc.categories.$get({
    query: updatedQuery,
  });
  const data = await categoryResponse.json();
  const categories = data?.data;
  const allDishes = combineAllDishes(categories);
  return allDishes;
};
