import axios from "@/utils/axios";
import { paths } from "@/components/utils/paths";
import { isEmpty } from "lodash-es";

async function fetchCategoryPageData(businessId: string) {
    const settingsResponse = (await axios(paths.settings(businessId))) || {};
    const businessResponse = await axios(paths.businessData(businessId));
    const loyaltyResponse = await axios(paths.getLoyaltySettings(businessId)) || {};
    const dishesResponse = (await axios(paths.dishesData(businessId))) || {};
    const categoriesResponse = (await axios(paths.categoryByBusiness(businessId))) || {};
    const data = {
        settings: settingsResponse?.data?.[0] || {},
        business: businessResponse?.data || {},
        loyalty: loyaltyResponse?.data || {},
        dishesData: dishesResponse?.data || {},
        categories: categoriesResponse?.data || [],
        allCategoriesTypes: {}
    };
    // Process categories and dishes
    const sortCategories = () => {
        const hashedCategories = new Map();
        categoriesResponse?.data.forEach((category:any) => {
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
                const newDish = dishesResponse?.find((d) => d._id === dishId);
                if (newDish) newCategory.dishes.push(newDish);
            }
            if (!isEmpty(newCategory?.dishes)) result.push(newCategory);
        });
        return result;
    };
    data.categories = categories();
    return data;
}

export const categoryApis = {
    all: fetchCategoryPageData
};

export async function fetchAllBusinessIds() {
    const response = await axios.get(paths.listAllBusiness());
    return response.data.map((business: { _id: string }) => business._id);
}
