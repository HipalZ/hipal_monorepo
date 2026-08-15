import { getMenuWithoutTableName } from "@/apis/commonApis";
import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import type { IMenuLayout, TimingType } from "../types/businessData.js";

interface RestaurantMenuLayout extends IMenuLayout {
  businessId?: string;
  days?: number[];
  default?: boolean;
  isActive?: boolean;
  startTime?: number;
  endTime?: number;
}

interface RestaurantMenuPayload {
  parentCategories: CategoryType[];
  childCategories: CategoryType[];
  timings: TimingType;
  menuData: IMenuLayout;
}

const DEFAULT_MENU_LAYOUT: IMenuLayout = {
  _id: "",
  menuType: 2,
  categoryLayout: 2,
  cardLayout: 1,
  primaryColor: "#000000",
  secondaryColor: "#ffffff",
};

const EMPTY_TIMINGS: TimingType = {
  _id: "",
  name: "",
  businessId: "",
  isPublished: false,
  heading: "",
  dishIds: [],
};

const getTodayWeekDay = () => {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
};

const isCurrentTimeInMenu = (menu: RestaurantMenuLayout) => {
  if (typeof menu.startTime !== "number" || typeof menu.endTime !== "number") {
    return true;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentValue =
    menu.startTime > 1440 || menu.endTime > 1440
      ? currentMinutes * 60 * 1000
      : currentMinutes;

  if (menu.startTime === menu.endTime + 1) {
    return true;
  }

  return menu.startTime <= currentValue && menu.endTime >= currentValue;
};

const hasMenuToday = (menu: RestaurantMenuLayout, today: number) => {
  return !Array.isArray(menu.days) || menu.days.includes(today);
};

const getActiveRestaurantMenu = async (businessId: string) => {
  const response = await (
    apiRpc as typeof apiRpc & {
      menu: {
        menuByBusiness: {
          [":businessId"]: {
            $get: (args: {
              param: { businessId: string };
            }) => Promise<Response>;
          };
        };
      };
    }
  ).menu.menuByBusiness[":businessId"].$get({
    param: { businessId },
  });
  const payload = (await response.json()) as {
    data?: RestaurantMenuLayout[];
  };
  const menus = payload?.data ?? [];
  const today = getTodayWeekDay();
  const currentlyAvailableMenus = menus.filter(
    (menu) => hasMenuToday(menu, today) && isCurrentTimeInMenu(menu)
  );

  return (
    currentlyAvailableMenus.find((menu) => menu.default) ??
    currentlyAvailableMenus[0] ??
    menus.find((menu) => menu.default && hasMenuToday(menu, today)) ??
    menus.find((menu) => hasMenuToday(menu, today)) ??
    menus.find((menu) => menu.default) ??
    menus[0] ??
    null
  );
};

const getRestaurantCategories = async (
  businessId: string,
  menuId?: string
): Promise<{
  parentCategories: CategoryType[];
  childCategories: CategoryType[];
}> => {
  const [parentCategoriesResponse, childCategoriesResponse] = await Promise.all(
    [
      apiRpc.categories.$get({
        query: {
          businessId,
          parent: "true",
          ...(menuId ? { menuId } : {}),
        },
      }),
      apiRpc.categories.$get({
        query: {
          businessId,
          dishes: "true",
          ...(menuId ? { menuId } : {}),
        },
      }),
    ]
  );

  const [parentCategories, childCategories] = await Promise.all([
    parentCategoriesResponse.json(),
    childCategoriesResponse.json(),
  ]);

  return {
    parentCategories: (parentCategories?.data ?? []) as CategoryType[],
    childCategories: (childCategories?.data ?? []) as CategoryType[],
  };
};

export const useGetAllRestaurantMenu = (businessId: string) => {
  const fetchRestaurantMenu = async (): Promise<RestaurantMenuPayload> => {
    const menuData =
      (await getActiveRestaurantMenu(businessId)) ??
      (await getMenuWithoutTableName(businessId));
    const menuId = menuData?._id;
    let categories = await getRestaurantCategories(businessId, menuId);

    if (
      menuId &&
      categories.parentCategories.length === 0 &&
      categories.childCategories.length === 0
    ) {
      categories = await getRestaurantCategories(businessId);
    }

    const response = await apiRpc["menu-banner"].explore[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const timingData = await response.json();

    return {
      parentCategories: categories.parentCategories,
      childCategories: categories.childCategories,
      timings:
        (timingData?.data as unknown as TimingType | undefined) ??
        EMPTY_TIMINGS,
      menuData: menuData ?? DEFAULT_MENU_LAYOUT,
    };
  };

  const {
    isLoading: menuLoading,
    data: menuData,
    refetch: refetchMenu,
  } = useQuery({
    queryKey: ["getRestaurantMenu", businessId],
    queryFn: fetchRestaurantMenu,
    enabled: !!businessId,
    staleTime: 1000 * 60,
  });

  return { menuLoading, menuData, refetchMenu };
};
