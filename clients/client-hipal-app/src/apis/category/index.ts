import { fetchCommonData } from "../commonApis";
import { apiRpc } from "@hi/common";

async function fetchCategoryPageData(customLink: string) {
  // common api has business and settings data
  const { data, bizId } = await fetchCommonData(customLink);

  const parentCategoriesResponse = await apiRpc.categories.$get({
    query: {
      businessId: bizId,
      parent: "true",
    },
  });
  const childCategoriesResponse = await apiRpc.categories.$get({
    query: {
      businessId: bizId,
      dishes: "true",
    },
  });
  const parentCategories = await parentCategoriesResponse.json();
  const childCategories = await childCategoriesResponse.json();
  data["parentCategories"] =
    parentCategories?.data as unknown as CategoryType[];
  data["childCategories"] = childCategories?.data as unknown as CategoryType[];
  return data;
}

export const categoryApis = {
  all: fetchCategoryPageData,
};
