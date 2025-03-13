import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export const useGetAllRestaurantMenu = (businessId: string) => {
    const fetchRestaurantMenu = async () => {
        const data = {};

        const parentCategoriesResponse = await apiRpc.categories.$get({
            query: {
                businessId: businessId,
                parent: "true",
            },
        });
        const childCategoriesResponse = await apiRpc.categories.$get({
            query: {
                businessId: businessId,
                dishes: "true",
            },
        });

        const response = await apiRpc["menu-banner"].explore[":businessId"].$get({
            param: {
                businessId: businessId,
            },
        });
        const timingData = await response.json();

        const parentCategories = await parentCategoriesResponse.json();
        const childCategories = await childCategoriesResponse.json();
        data["parentCategories"] =
            parentCategories?.data ?? [];
        data["childCategories"] = childCategories?.data ?? [];
        data["timings"] = timingData?.data;
        console.log(data);
        return data;
    }

    const {
        isLoading: menuLoading,
        data: menuData,
        refetch: refetchMenu,
    } = useQuery({
        queryKey: ["getRestaurantMenu", businessId],
        queryFn: fetchRestaurantMenu,
        enabled: !!businessId,
        staleTime: 1000 * 60,
    })

    return { menuLoading, menuData, refetchMenu }
}