import axios from "@/utils/axios";
import { initializeAllBusiness } from "@/components/store/useAllBusiness";
import { paths } from "@/components/utils/paths";
import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { isEmpty, set } from "lodash-es";
import { ICategory } from "@/components/types/businessData";

async function fetchCategoryPageData(businessId: string) {
    const settings = (await axios(paths.settings(businessId))) || {};
    const businessData = await axios(paths.businessData(businessId));
    const loyalty = await axios(paths.getLoyaltySettings(businessId)) || {};
    const dishesData = (await axios(paths.dishesData(businessId))) || {};
    const _categoryData = (await axios(paths.categoryByBusiness(businessId))) || {};
    
    const data = {
        settings: settings?.data?.[0] || {},
        business: businessData?.data || {},
        loyalty: loyalty?.data || {},
        dishesData: dishesData?.data || {},
        categories: [],
        allCategoriesTypes: {}
    };
console.log('a', _categoryData?.data)
    // Process categories and dishes
    const sortCategories = () => {
        const hashedCategories = new Map();
        _categoryData?.data.forEach((category:any) => {
            hashedCategories.set(category?._id, category);
        });

        const categoryOrder = data.settings?.categoryOrder || [];
        const sortedCategories = new Map();
        for (let categoryId of categoryOrder) {
            if (hashedCategories?.has(categoryId)) {
                sortedCategories.set(categoryId, hashedCategories?.get(categoryId));
            }
        }
        return Array.from(sortedCategories.values());
    };
    
    const categoryData = sortCategories();

    const allCategoriesTypes = () => {
        const mainType = {};
        const subTypes = {};
        categoryData.forEach((category) => {
            if (!category?.visibility) return;
            if (category?.hierarchy === "PARENT") {
                mainType[category?._id] = category;
            } else if (!isEmpty(category?.dishes)) {
                subTypes[category?.parentCategoryId] = {
                    ...subTypes[category?.parentCategoryId],
                    [category._id]: category,
                };
            }
        });

        // Removing empty main categories
        Object.keys(mainType).forEach((key) => {
            if (!subTypes?.[mainType?.[key]?._id] && isEmpty(mainType?.[key]?.dishes))
                delete mainType[key];
        });

        return {
            main: mainType,
            sub: subTypes,
        };
    };

    data.allCategoriesTypes = allCategoriesTypes();

    const categories = () => {
        let result = [];
        categoryData?.forEach((category) => {
            const newCategory = JSON.parse(JSON.stringify(category));
            newCategory.dishes = [];
            for (let dishId of category.dishes) {
                const newDish = dishesData?.find((d) => d._id === dishId);
                if (newDish) newCategory.dishes.push(newDish);
            }
            if (!isEmpty(newCategory?.dishes)) result.push(newCategory);
        });
        return result;
    };
    data.categories = categories();

    set(data, "settings.explore.openFrom", getTimeIn12HrFormat(data?.settings?.explore?.openFrom));
    set(data, "settings.explore.openTill", getTimeIn12HrFormat(data?.settings?.explore?.openTill));

    return data;
}

export const categoryApis = {
    all: fetchCategoryPageData
};

export async function fetchAllBusinessIds() {
    const response = await axios.get(paths.listAllBusiness());
    return response.data.map((business: { _id: string }) => business._id);
}
