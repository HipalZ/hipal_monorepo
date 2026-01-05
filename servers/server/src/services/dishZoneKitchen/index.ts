import { DishZoneKitchen, Zone } from "@hi/db-models";
import type { CartItem } from "../../utils/bill";

const cart = [
  {
    id: "690303f75a3f04a771b53e71_69598f3cf773b1052249341c_no_extras",
    portion: {
      name: "chicekn dada",
      price: 120,
      portionTypes: [],
      _id: "69598f3cf773b1052249341c",
      createdAt: "2026-01-03T21:50:52.566Z",
      updatedAt: "2026-01-03T21:50:52.566Z",
    },
    extras: [],
    quantity: 1,
    dish: {
      baseMenuDishId: null,
      baseMenuId: null,
      _id: "690303f75a3f04a771b53e71",
      businessId: "66a25e423318398937eb87f9",
      posDishId: "153514023",
      __v: 0,
      active: true,
      availability: true,
      avgPrepTime: 0,
      categoryIds: ["690303f75a3f04a771b53e70"],
      createdAt: "2025-10-30T06:21:41.016Z",
      description: "",
      discount: 0,
      dishTypes: ["VEG"],
      gst: 5,
      ignoreDiscount: "0",
      ignoreTax: "0",
      images: [],
      isDeleted: false,
      menuId: "690303f475777361c4f7f5da",
      name: "Spicy",
      portions: [
        {
          name: "chicekn dada",
          price: 120,
          portionTypes: [],
          _id: "69598f3cf773b1052249341c",
          createdAt: "2026-01-03T21:50:52.566Z",
          updatedAt: "2026-01-03T21:50:52.566Z",
        },
      ],
      pos: true,
      posTax: "345158,345159",
      price: 10,
      rank: 1,
      tags: [],
      timings: [],
      updatedAt: "2026-01-03T21:52:20.024Z",
      vat: 0,
      visibility: true,
      kitchenId: "6909b9305b105177389c3ad5",
    },
  },
  {
    id: "690303f75a3f04a771b53e74_no_portion_no_extras",
    portion: null,
    extras: [],
    quantity: 1,
    dish: {
      baseMenuDishId: null,
      baseMenuId: null,
      _id: "690303f75a3f04a771b53e74",
      businessId: "66a25e423318398937eb87f9",
      posDishId: "153514033",
      __v: 0,
      active: true,
      availability: true,
      avgPrepTime: 0,
      categoryIds: ["690303f75a3f04a771b53e70"],
      createdAt: "2025-10-30T06:21:41.213Z",
      description: "",
      discount: 0,
      dishTypes: ["VEG"],
      gst: 5,
      ignoreDiscount: "0",
      ignoreTax: "0",
      images: [],
      isDeleted: false,
      menuId: "690303f475777361c4f7f5da",
      name: "Cheese Slice",
      portions: [],
      pos: true,
      posTax: "345158,345159",
      price: 19,
      rank: 1,
      tags: [],
      timings: [],
      updatedAt: "2026-01-03T21:52:20.024Z",
      vat: 0,
      visibility: true,
      kitchenId: "6909b9305b105177389c3ad5",
    },
  },
];

const assignKitchenToDish = async (
  zoneId: string,
  businessId: string,
  cart: CartItem[],
) => {
  const zoneInfo = await Zone.findOne({ zoneId: zoneId });
  if (!zoneInfo) {
    throw new Error("Zone not found");
  }
  for (const dish of cart) {
    const dishId = dish.dish._id;
    if (!dishId) {
      throw new Error("DishId not found in cart");
    }
    const dishZoneKitchen = await DishZoneKitchen.findOne({
      dishId,
      zoneId: zoneInfo._id,
    });

    dish.dish.kitchenId =
      dishZoneKitchen?.kitchenId?.toString() || dish.dish.kitchenId;
  }
  return cart;
};

export default assignKitchenToDish;
