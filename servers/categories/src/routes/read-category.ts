import express, { Request, Response } from 'express';

const router = express.Router();

import { Category } from '@hi/db-models';

router.get(
  '/v1/categories',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId, queryCategories } = req.query;
    const query = { businessId, queryCategories };
    let existingCategories;

    if (queryCategories) {
      existingCategories = await Category.find(query)
        .select('name hierarchy  parentCategory parentCategoryId businessId id availability visibility')
        .populate('dishes');
      return res.status(200).send(existingCategories);
    }

    existingCategories = await Category.find({
      businessId,
    });

    res.status(200).send(existingCategories);
  },
);

router.get(
  '/v1/categories/:id/test',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    res.status(200).send('working');
  },
);

router.get(
  '/v1/categories/:id',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const existingCategory = await Category.findById(id).populate('dishes');

    res.status(200).send(existingCategory);
  },
);

router.get(
  '/v1/categories/get/allChildCategory',
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

    let filter;

    filter = existingCategories.filter((ele: any) => ele.hierarchy === 'CHILD');
    if (filter.length == 0) {
      filter = existingCategories;
    }

    res.status(200).send({ status: true, data: filter });
  },
);

router.get(
  '/v1/categories/:id/allParentCategory',
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
      hierarchy: 'PARENT',
    });

    res.status(200).send(existingCategories);
  },
);

router.get(
  '/v1/categories/All/Categories',

  async (req: Request, res: Response) => {
    try {
      const { businessId } = req.query;

      const _categoryData = await Category.find({ businessId })
        .select('name  visibility hierarchy parentCategoryId parentCategory id  availability visibility')
        .populate({
          path: 'dishes',
          populate: {
            path: 'extras',
          },
        });
      return res.status(200).send({ data: { categories: _categoryData } });
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
  },
);

router.get(
  '/v1/categories/Active/Category',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    const existingCategory = await Category.find({
      businessId,
    });

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
  },
);

// router.get(
//   "/v1/categories/:id/Takeaway",

//   async (req: Request, res: Response) => {
//     try {
//       const { businessId } = req.query;
//       // https://dev.api.hipal.life/v1/settings/business/setting
//       // https://dev.api.hipal.life/v1/dishes/All/Dishes
//       // /v1/categories?businessId=${businessId}

//       const dishesData = await axios(
//         `${process.env.URL}/v1/dishes/:id/takeawayDishes?businessId=${businessId}`
//       );
//       const _categoryData = await Category.find({ businessId });
//       const data = {} as IBusinessData;

//       // data['businessesData'] = businessesData?.data || {}

//       let Takeaway = dishesData?.data?.filter(
//         (dishes: any) => dishes?.delivery?.dishPrice?.length > 1
//       );
//       const updatedData = Takeaway?.map((item: any) => ({
//         ...item,
//         price: item?.delivery?.dishPrice,
//         portions: item?.delivery?.portions || [],
//         extras: item?.delivery?.extras || [],
//         kitchenId: item.delivery?.kitchenId || "",
//       }));

//       data["dishesData"] = updatedData || {};

//       // data['categoryData'] = categoryData || {}
//       const sortCategories = () => {
//         const hashedCategories = new Map();

//         _categoryData?.forEach((category) => {
//           hashedCategories.set(category?.id, category);
//         });

//         const categoryOrder = data.settings?.categoryOrder || [];

//         const sortedCategories = new Map();

//         for (let categoryId of categoryOrder) {
//           if (hashedCategories?.has(categoryId)) {
//             sortedCategories.set(categoryId, hashedCategories?.get(categoryId));
//           }
//         }

//         const sortedCats = Array.from(sortedCategories.values());

//         if (isEmpty(sortedCats)) return _categoryData;

//         return sortedCats;
//       };
//       const categoryData = sortCategories();

//       const allCategoriesTypes = () => {
//         const mainType: any = {};
//         const subTypes: any = {};

//         categoryData.forEach((category) => {
//           if (!category?.visibility) return;

//           if (category?.hierarchy === "PARENT") {
//             mainType[category?.id] = category;
//             return;
//           } else if (!isEmpty(category?.dishes)) {
//             subTypes[category?.parentCategoryId] = {
//               ...subTypes[category?.parentCategoryId],
//               [category.id]: category,
//             };
//           }
//         });

//         // Removing empty main categories
//         Object.keys(mainType).forEach((key) => {
//           if (
//             !subTypes?.[mainType?.[key]?.id] &&
//             isEmpty(mainType?.[key]?.dishes)
//           )
//             delete mainType[key];
//         });

//         return {
//           main: mainType,
//           sub: subTypes,
//         };
//       };

//       data["allCategoriesTypes"] = allCategoriesTypes();

//       const categories = () => {
//         let result = [] as any;

//         categoryData?.forEach((category) => {
//           const newCategory = JSON.parse(JSON.stringify(category));
//           newCategory.dishes = [];

//           for (let dish of category.dishes) {
//             const newDish = updatedData.find((d: any) => d.id === dish.id);

//             if (!!newDish)
//               newCategory.dishes = [...newCategory.dishes, newDish];
//           }

//           if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory];
//         });

//         return result;
//       };
//       data["categories"] = categories();

//       res.status(200).send({ data: data });
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

// router.get(
//   "/v1/categories/:id/Delivery",

//   async (req: Request, res: Response) => {
//     try {
//       const { businessId } = req.query;
//       // https://dev.api.hipal.life/v1/settings/business/setting
//       // https://dev.api.hipal.life/v1/dishes/All/Dishes
//       // /v1/categories?businessId=${businessId}

//       const dishesData = await axios(
//         `${process.env.URL}/v1/dishes/:id/deliveryDishes?businessId=${businessId}`
//       );
//       const _categoryData = await Category.find({ businessId });
//       const data = {} as IBusinessData;

//       // data['businessesData'] = businessesData?.data || {}

//       let Takeaway = dishesData?.data?.filter(
//         (dishes: any) => dishes?.take_away?.dishPrice?.length > 1
//       );
//       const updatedData = Takeaway?.map((item: any) => ({
//         ...item,
//         price: item?.take_away?.dishPrice,
//         portions: item?.take_away?.portions || [],
//         extras: item?.take_away?.extras || [],
//         kitchenId: item.take_away?.kitchenId || "",
//       }));

//       data["dishesData"] = updatedData || {};

//       // data['categoryData'] = categoryData || {}
//       const sortCategories = () => {
//         const hashedCategories = new Map();

//         _categoryData?.forEach((category) => {
//           hashedCategories.set(category?.id, category);
//         });

//         const categoryOrder = data.settings?.categoryOrder || [];

//         const sortedCategories = new Map();

//         for (let categoryId of categoryOrder) {
//           if (hashedCategories?.has(categoryId)) {
//             sortedCategories.set(categoryId, hashedCategories?.get(categoryId));
//           }
//         }

//         const sortedCats = Array.from(sortedCategories.values());

//         if (isEmpty(sortedCats)) return _categoryData;

//         return sortedCats;
//       };
//       const categoryData = sortCategories();

//       const allCategoriesTypes = () => {
//         const mainType: any = {};
//         const subTypes: any = {};

//         categoryData.forEach((category) => {
//           if (!category?.visibility) return;

//           if (category?.hierarchy === "PARENT") {
//             mainType[category?.id] = category;
//             return;
//           } else if (!isEmpty(category?.dishes)) {
//             subTypes[category?.parentCategoryId] = {
//               ...subTypes[category?.parentCategoryId],
//               [category.id]: category,
//             };
//           }
//         });

//         // Removing empty main categories
//         Object.keys(mainType).forEach((key) => {
//           if (
//             !subTypes?.[mainType?.[key]?.id] &&
//             isEmpty(mainType?.[key]?.dishes)
//           )
//             delete mainType[key];
//         });

//         return {
//           main: mainType,
//           sub: subTypes,
//         };
//       };

//       data["allCategoriesTypes"] = allCategoriesTypes();

//       const categories = () => {
//         let result = [] as any;

//         categoryData?.forEach((category) => {
//           const newCategory = JSON.parse(JSON.stringify(category));
//           newCategory.dishes = [];

//           for (let dish of category.dishes) {
//             const newDish = updatedData.find((d: any) => d.id === dish.id);

//             if (!!newDish)
//               newCategory.dishes = [...newCategory.dishes, newDish];
//           }

//           if (!isEmpty(newCategory?.dishes)) result = [...result, newCategory];
//         });

//         return result;
//       };
//       data["categories"] = categories();

//       res.status(200).send({ data: data });
//     } catch (err: any) {
//       return res.status(500).send({ status: false, message: err.message });
//     }
//   }
// );

router.get(
  '/v1/categories/:id/analytics',
  // currentUser,
  // requireAuthorization([ClientRoles.RESTAURANT_OWNER,ClientRoles.RESTAURANT_FLOOR_MANAGER,ClientRoles.RESTAURANT_MANAGER]),
  async (req: Request, res: Response) => {
    const { businessId } = req.query;
    let existingDishes = await Category.find({
      businessId,
    }).select('name hierarchy  parentCategory  parentCategoryId ');

    res.status(200).send(existingDishes);
  },
);

export { router as readCategoriesRouter };
