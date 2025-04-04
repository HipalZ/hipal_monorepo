import type { CategoryType } from "@hi/db-models/src/validators";
import { fetchCommonData, getMenuData } from "../commonApis";
import { apiRpc } from "@hi/common";
import type { IMenuLayout } from "@/components/types/businessData";

async function fetchCategoryPageData(customLink: string, tableName: string) {
  // common api has business and settings data
  const { data, bizId } = await fetchCommonData(customLink);
  const menuData = await getMenuData(tableName, bizId)

  let parentCategories = { data: [] };
  if (menuData?.menuType === 1) {
    const parentCategoriesResponse = await apiRpc.categories.$get({
      query: {
        businessId: bizId,
        parent: "true",
        tableName: tableName,
      },
    });
    parentCategories = await parentCategoriesResponse.json();
  }

  const childCategoriesResponse = await apiRpc.categories.$get({
    query: {
      businessId: bizId,
      dishes: "true",
      tableName: tableName,
    },
  });

  const response = await apiRpc["menu-banner"].explore[":businessId"].$get({
    param: {
      businessId: bizId,
    },
  });
  const timingData = await response.json();

  const childCategories = await childCategoriesResponse.json();
  data["parentCategories"] = parentCategories?.data as unknown as CategoryType[];
  data["childCategories"] = childCategories?.data ?? [] as unknown as CategoryType[];
  data["timings"] = timingData?.data;
  data["menuData"] = menuData ?? {} as unknown as IMenuLayout // Include menu data in the response
  
  return data;
}

export const categoryApis = {
  all: fetchCategoryPageData,
};
