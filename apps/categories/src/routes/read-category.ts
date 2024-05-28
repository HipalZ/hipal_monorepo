import express, { Request, Response } from "express";
import {
  ClientRoles,
  requireAuthorization,
  NotFoundError,
  currentUser,
} from "@hipal/common";
import { Category } from "../models/category";
import { Dish } from "../models/dish";

const router = express.Router();
import axios from "axios";
import { isEmpty } from "lodash";

export interface IBusinessData {
  settings?: ISettings;
  businessesData?: {
    businessName: string;
    registeredName: string;
    businessType: string;
    gstRegistered: boolean;
    multipleOutlets: boolean;
    customLink: string;
    logo: string;
    address: string;
    staff: string[];
    id: string;
  };
  dishesData?: IDish[];
  dishData?: IDish;
  categoryData?: ICategory[];
  categories?: ICategories[];
  allCategoriesTypes?: {
    main: ICategoryTypes;
    sub: ICategorySubTypes;
  };
}

export interface ICategories extends ICategory {
  dishes: IDish[];
}

export interface ISettings {
  businessId: string;
  themes: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    fontURL: string;
    buttonStyle: string;
    miniBanner: string;
    specialBanner: string;
    endBanner: string;
    instagramLink: string;
    facebookLink: string;
    youtubeLink: string;
    linkedinLink: string;
    footerText: string;
  };
  categoryOrder: string[];
  explore: {
    wallpaper: string;
    phone: string;
    countryCode: string;
    location: string;
    openFrom: string;
    openTill: string;
    specialOffers: {
      wallpaper: string;
      offerName: string;
      redirectType?: undefined;
      redirectId?: undefined;
      redirectName?: undefined;
    }[];
    popular: {
      id: string;
      name: string;
    }[];
    highlights: {
      name: string;
      stories: string[];
    }[];
  };
  navigation: {
    from: string;
    to: string;
    categoryCard: string;
    dishCard: string;
  };
  id: string;
}
export interface IDish {
  businessId: string;
  name: string;
  price: number;
  tax: null;
  visibility: boolean;
  discount: null;
  avgTime: null;
  dishType: string;
  categories: {
    id: string;
    name: string;
  }[];
  portions: IPortion[];
  extras: {
    name?: string;
    numOptions: number;
    numSelections: number;
    compulsory: number;
    items: IExtraItem[];
  }[];
  filters: {
    timeToConsume: string;
    portionBestSuited: string;
    levelOfSpice: string;
    bestOccasion: string;
    texture: string;
    time: string;
    bestWeather: string;
    dishes: never[];
  };
  images: string[];
  description: string;
  tags: never[];
  links: never[];
  version: number;
  id: string;
}

export interface ISpreadOption {}

export interface ICategory {
  businessId: string;
  name: string;
  visibility: boolean;
  timerOn: boolean;
  timerStart: null;
  timerEnd: null;
  availableDays: never[];
  hierarchy: string | "PARENT";
  parentCategory: string;
  parentCategoryId?: string;
  coverImage: string;
  links: never[];
  dishes: {
    id: string;
    name: string;
  }[];
  version: number;
  id: string;
}

export interface ICategoryTypes {
  [key: string]: ICategory;
}

export interface ICategorySubTypes {
  [key: string]: ICategory[];
}

export interface IExtraItem {
  name: string;
  price: string;
}

export interface IPortion {
  name: string;
  price: string;
  discount: string;
  default: boolean | string;
}

router.get(
  "/v1/categories",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId, queryCategories } = req.query;
    const query = { businessId, queryCategories };
    let existingCategories;

    if (queryCategories) {
      existingCategories = await Category.find(query).select(
        "name hierarchy  parentCategory parentCategoryId businessId id dishes availability visibility"
      );
      return res.status(200).send(existingCategories);
    }

    existingCategories = await Category.find({
      businessId,
    });

    if (!existingCategories) {
      throw new NotFoundError();
    }

    res.status(200).send(existingCategories);
  }
);

router.get(
  "/v1/categories/:id",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      throw new NotFoundError();
    }

    res.status(200).send(existingCategory);
  }
);

router.get(
  "/v1/categories/get/allChildCategory",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    let existingCategories = await Category.find({
      businessId,
    });

    if (!existingCategories) {
      throw new NotFoundError();
    }
    let filter;

    filter = existingCategories.filter((ele: any) => ele.hierarchy === "CHILD");
    if (filter.length == 0) {
      filter = existingCategories;
    }

    res.status(200).send({ status: true, data: filter });
  }
);

router.get(
  "/v1/categories/:id/allParentCategory",
  // currentUser,
  // requireAuthorization([
  //   ClientRoles.RESTAURANT_OWNER,
  //   ClientRoles.RESTAURANT_FLOOR_MANAGER,
  //   ClientRoles.RESTAURANT_MANAGER,
  // ]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingCategories = await Category.find({
      businessId,
      hierarchy: "PARENT",
    });

    if (!existingCategories) {
      throw new NotFoundError();
    }

    res.status(200).send(existingCategories);
  }
);

router.get(
  "/v1/categories/All/Categories",

  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;

      // const businessesData = await axios(paths.businessData(businessId))
      const dishesData = await axios(
        `${process.env.URL}/v1/dishes/All/Dishes?businessId=${businessId}`
      );
      const _categoryData = await Category.find({ businessId }).select(
        "name  visibility hierarchy parentCategoryId parentCategory id dishes availability visibility"
      );
      const data = {} as IBusinessData;

      const categories = () => {
        let result = [] as any;

        _categoryData?.forEach((category) => {
          const newCategory = JSON.parse(JSON.stringify(category));
          newCategory.dishes = [];

          for (let dish of category?.dishes) {
            const newDish = dishesData?.data.find((d: any) => d.id === dish.id);

            if (!!newDish)
              newCategory.dishes = [...newCategory.dishes, newDish];
          }

          if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory];
        });

        return result;
      };

      data["categories"] = categories();

      res.status(200).send({ data: data });
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  }
);

router.get(
  "/v1/categories/:businessId/dishes",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const existingDishes = await Dish.find({
      businessId,
    });

    if (!existingDishes) {
      throw new NotFoundError();
    }

    res.status(200).send(existingDishes);
  }
);

router.get(
  "/v1/categories/Active/Category",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingCategory = await Category.find({
      businessId,
    });
    if (!existingCategory) {
      throw new NotFoundError();
    }
    let Active = 0;
    let visible = 0;
    let available = 0;

    existingCategory.forEach((element: any) => {
      if (element?.visibility && element?.availability) {
        Active += 1;
      }
      if (element?.visibility) {
        visible += 1;
      }
      if (element?.availability) available += 1;
    });

    return res.status(200).send({ active: Active, visible, available });
  }
);

router.get(
  "/v1/categories/:id/Takeaway",

  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;
      // https://dev.api.hipal.life/v1/settings/business/setting
      // https://dev.api.hipal.life/v1/dishes/All/Dishes
      // /v1/categories?businessId=${businessId}

      const dishesData = await axios(
        `${process.env.URL}/v1/dishes/:id/takeawayDishes?businessId=${businessId}`
      );
      const _categoryData = await Category.find({ businessId });
      const data = {} as IBusinessData;

      // data['businessesData'] = businessesData?.data || {}

      let Takeaway = dishesData?.data?.filter(
        (dishes: any) => dishes?.delivery?.dishPrice?.length > 1
      );
      const updatedData = Takeaway?.map((item: any) => ({
        ...item,
        price: item?.delivery?.dishPrice,
        portions: item?.delivery?.portions || [],
        extras: item?.delivery?.extras || [],
        kitchenId: item.delivery?.kitchenId || "",
      }));

      data["dishesData"] = updatedData || {};

      // data['categoryData'] = categoryData || {}
      const sortCategories = () => {
        const hashedCategories = new Map();

        _categoryData?.forEach((category) => {
          hashedCategories.set(category?.id, category);
        });

        const categoryOrder = data.settings?.categoryOrder || [];

        const sortedCategories = new Map();

        for (let categoryId of categoryOrder) {
          if (hashedCategories?.has(categoryId)) {
            sortedCategories.set(categoryId, hashedCategories?.get(categoryId));
          }
        }

        const sortedCats = Array.from(sortedCategories.values());

        if (isEmpty(sortedCats)) return _categoryData;

        return sortedCats;
      };
      const categoryData = sortCategories();

      const allCategoriesTypes = () => {
        const mainType: any = {};
        const subTypes: any = {};

        categoryData.forEach((category) => {
          if (!category?.visibility) return;

          if (category?.hierarchy === "PARENT") {
            mainType[category?.id] = category;
            return;
          } else if (!isEmpty(category?.dishes)) {
            subTypes[category?.parentCategoryId] = {
              ...subTypes[category?.parentCategoryId],
              [category.id]: category,
            };
          }
        });

        // Removing empty main categories
        Object.keys(mainType).forEach((key) => {
          if (
            !subTypes?.[mainType?.[key]?.id] &&
            isEmpty(mainType?.[key]?.dishes)
          )
            delete mainType[key];
        });

        return {
          main: mainType,
          sub: subTypes,
        };
      };

      data["allCategoriesTypes"] = allCategoriesTypes();

      const categories = () => {
        let result = [] as any;

        categoryData?.forEach((category) => {
          const newCategory = JSON.parse(JSON.stringify(category));
          newCategory.dishes = [];

          for (let dish of category.dishes) {
            const newDish = updatedData.find((d: any) => d.id === dish.id);

            if (!!newDish)
              newCategory.dishes = [...newCategory.dishes, newDish];
          }

          if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory];
        });

        return result;
      };
      data["categories"] = categories();

      res.status(200).send({ data: data });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/categories/:id/Delivery",

  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;
      // https://dev.api.hipal.life/v1/settings/business/setting
      // https://dev.api.hipal.life/v1/dishes/All/Dishes
      // /v1/categories?businessId=${businessId}

      const dishesData = await axios(
        `${process.env.URL}/v1/dishes/:id/deliveryDishes?businessId=${businessId}`
      );
      const _categoryData = await Category.find({ businessId });
      const data = {} as IBusinessData;

      // data['businessesData'] = businessesData?.data || {}

      let Takeaway = dishesData?.data?.filter(
        (dishes: any) => dishes?.take_away?.dishPrice?.length > 1
      );
      const updatedData = Takeaway?.map((item: any) => ({
        ...item,
        price: item?.take_away?.dishPrice,
        portions: item?.take_away?.portions || [],
        extras: item?.take_away?.extras || [],
        kitchenId: item.take_away?.kitchenId || "",
      }));

      data["dishesData"] = updatedData || {};

      // data['categoryData'] = categoryData || {}
      const sortCategories = () => {
        const hashedCategories = new Map();

        _categoryData?.forEach((category) => {
          hashedCategories.set(category?.id, category);
        });

        const categoryOrder = data.settings?.categoryOrder || [];

        const sortedCategories = new Map();

        for (let categoryId of categoryOrder) {
          if (hashedCategories?.has(categoryId)) {
            sortedCategories.set(categoryId, hashedCategories?.get(categoryId));
          }
        }

        const sortedCats = Array.from(sortedCategories.values());

        if (isEmpty(sortedCats)) return _categoryData;

        return sortedCats;
      };
      const categoryData = sortCategories();

      const allCategoriesTypes = () => {
        const mainType: any = {};
        const subTypes: any = {};

        categoryData.forEach((category) => {
          if (!category?.visibility) return;

          if (category?.hierarchy === "PARENT") {
            mainType[category?.id] = category;
            return;
          } else if (!isEmpty(category?.dishes)) {
            subTypes[category?.parentCategoryId] = {
              ...subTypes[category?.parentCategoryId],
              [category.id]: category,
            };
          }
        });

        // Removing empty main categories
        Object.keys(mainType).forEach((key) => {
          if (
            !subTypes?.[mainType?.[key]?.id] &&
            isEmpty(mainType?.[key]?.dishes)
          )
            delete mainType[key];
        });

        return {
          main: mainType,
          sub: subTypes,
        };
      };

      data["allCategoriesTypes"] = allCategoriesTypes();

      const categories = () => {
        let result = [] as any;

        categoryData?.forEach((category) => {
          const newCategory = JSON.parse(JSON.stringify(category));
          newCategory.dishes = [];

          for (let dish of category.dishes) {
            const newDish = updatedData.find((d: any) => d.id === dish.id);

            if (!!newDish)
              newCategory.dishes = [...newCategory.dishes, newDish];
          }

          if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory];
        });

        return result;
      };
      data["categories"] = categories();

      res.status(200).send({ data: data });
    } catch (err: any) {
      return res.status(500).send({ status: false, message: err.message });
    }
  }
);

router.get(
  "/v1/categories/:id/analytics",
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    let existingDishes = await Category.find({
      businessId,
    }).select("name hierarchy  parentCategory  parentCategoryId ");

    if (!existingDishes) {
      throw new NotFoundError();
    }

    res.status(200).send(existingDishes);
  }
);

export { router as readCategoriesRouter };
