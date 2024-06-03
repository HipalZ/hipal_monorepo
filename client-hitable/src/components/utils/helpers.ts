import isEmpty from "lodash-es/isEmpty";
import { ICartDish, ICartExtra, ICart, ICartVariant } from "../store/useCart";
import { IBusinessData, IKot, IStatus } from "../types/hiTableData";
import axios from "@/axios";

export const getPrice = (price: number | string) => {
  if (!price || price === 0) {
    // return 'FREE'
    return "";
  }

  return `₹${price}`;
};

export const getTimeIn12HrFormat = (time: string) => {
  if (!time || !time.includes(":")) return "";

  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);

  const amPm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${amPm}`;
};

export const getPriceOfExtra = (extra: ICartExtra) => {
  let arrExtra = Object?.values(extra);
  let extraPrice = 0;
  for (let i = 0; i < arrExtra.length; i++) {
    let obj = arrExtra[i];
    extraPrice += parseInt(`${obj?.price || 0}`) * parseInt(`${obj?.quantity}`);
  }

  return extraPrice;
};

export function getDishPriceByVarient(
  variant: ICartVariant,
  cartDish: ICartDish
) {
  const dishPrice = cartDish?.dishData?.price;
  const { extra } = variant;
  let price = 0;
  price += parseInt(`${variant?.portion?.price || dishPrice}`);

  if (!isEmpty(extra)) price += getPriceOfExtra(extra);

  return price;
}

export const getDishPrice = (cartDish: ICartDish) => {
  let dishPrice = 0;
  cartDish.variants.map(
    (variant) => (dishPrice += getDishPriceByVarient(variant, cartDish))
  );
  return dishPrice;
};

export const getGrandTotalPrice = (cart: ICart) => {
  let grandTotal = 0;
  const cartItems = Object.values(cart);
  for (const cartDish of cartItems) {
    grandTotal += getDishPrice(cartDish);
  }
  return grandTotal;
};

export function getGrandTotal(cart: any, data: IBusinessData) {
  let total = 0;

  if (isEmpty(cart)) return total;

  Object.keys(cart).forEach((dishId) => {
    let dishPriceByVariants = 0;
    const cartDish = cart[dishId];

    if (
      cartDish?.variants?.length > 0 &&
      Object.keys(cartDish?.variants?.[0]?.extra || {})?.length > 0 &&
      cartDish?.variants?.[0]?.portion
    ) {
      cart?.[dishId]?.variants?.forEach((variant) => {
        const { portion, extra } = variant;
        if (isEmpty(portion) && isEmpty(extra)) {
          dishPriceByVariants += 1;
        } else {
          dishPriceByVariants += portion?.price || 0;

          Object.keys(extra).forEach((key) => {
            const { price, quantity } = extra[key];
            dishPriceByVariants += price * quantity;
          });
        }
      });
    } else {
      dishPriceByVariants = cartDish?.variants?.length || 1;
    }

    total +=
      dishPriceByVariants *
      (data?.dishesData?.find((d) => d.id === dishId)?.price || 1);
  });
  return total;
}

export const addInstruction = (
  cart,
  tableId,
  dishId,
  variantId,
  instruction
) => {
  // Check if the table exists in the cart
  if (!cart[tableId]) {
    console.warn(`Table with ID ${tableId} not found in cart`);
    return cart;
  }

  // Find the dish in the cart by dishId
  const dish = cart[tableId][dishId];
  if (!dish) {
    console.warn(`Dish with ID ${dishId} not found in table cart`);
    return cart;
  }

  // Find the variant within the dish by variantId
  const variant = dish.variants.find((v) => v.id === variantId);
  if (!variant) {
    console.warn(`Variant with ID ${variantId} not found in dish`);
    return cart;
  }

  // Add the instruction to the variant
  variant.instruction = instruction;

  // Return the updated cart
  return cart;
};

export const deleteInstruction = (cart, tableId, dishId, variantId) => {
  // Check if the table exists in the cart
  if (!cart[tableId]) {
    console.warn(`Table with ID ${tableId} not found in cart`);
    return cart;
  }

  const dish = cart[tableId][dishId];
  if (!dish) {
    console.warn(`Dish with ID ${dishId} not found in table cart`);
    return cart;
  }

  const variant = dish.variants.find((v) => v.id === variantId);
  if (!variant) {
    console.warn(`Variant with ID ${variantId} not found in dish`);
    return cart;
  }
  delete variant.instruction;

  return cart;
};

export const getCompletedTableApi = async (businessId: string) => {
  let url = `/v1/payments?id=${businessId}`;

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("Error fetching Table report:", error);
  }
};

export const getUpdatedCart = (kot: IStatus, isDeleted: boolean) => {
  let cart = {};
  const dishData = {
    businessId: kot.businessId,
    name: kot.dish.name,
    price: kot.dish.price,
    kitchenId: kot.kitchenId,
    delete: isDeleted,
  };
  const variants: any = [];
  if (kot.dish.extras && kot.dish.extras.length > 0) {
    const extraVariants = {};
    kot.dish.extras.forEach((extra, index) => {
      extraVariants[`${extra?.name}${index}`] = {
        name: extra.name,
        price: extra.price,
        quantity: extra.quantity,
      };
    });

    if (kot.dish.portions) {
      variants.push({
        extra: extraVariants,
        portion: kot.dish.portions,
      });
    } else {
      variants.push({
        extra: extraVariants,
      });
    }
  } else {
    if (kot.dish.portions) {
      variants.push({
        extra: {},
        portion: kot.dish.portions,
      });
    } else {
      variants.push({
        extra: {},
      });
    }
  }
  cart[kot.dish.dishId] = {
    dishData,
    dishId: kot.dish.dishId,
    variants,
    quantity: kot.dish.qty,
  };

  return cart;
};

export function timestampToTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  const minutes = "0" + date.getMinutes();
  const seconds = "0" + date.getSeconds();

  // Will display time in HH:MM:SS format
  const formattedTime = hours + ":" + minutes.substr(-2);

  return formattedTime;
}

export const cartToKots = (
  cart,
  businessId:string,
  tableId:string,
  zoneId:string,
  tableName:string,
  customerName:string,
  customerPhone:string
) => {
  const kotArray = [];
  for (const dish of Object.values(cart)) {
    for (const variant of dish?.variants) {
      const extras = variant?.extra ? Object.values(variant.extra) : [];
      const portions = variant?.portion ? variant?.portion : {};

      const kotObject = {
        businessId: businessId,
        kitchenId: dish?.dishData?.kitchenId,
        zoneId: zoneId,
        tableId: tableId,
        staffId: "5",
        dish: {
          dishId: dish?.dishId,
          name: dish?.dishData?.name,
          price: dish?.dishData?.price,
          qty: 1,
          comments: "spicy",
          extras,
          portions,
        },
        dishType: dish?.dishData?.dishType,
        category:
          dish?.parentCategoryName || dish?.dishData?.categories?.[0]?.name,
        customerName: customerName,
        customerPhone: customerPhone,
        instructions: variant?.instruction,
        dishStatus: "cooking",
        tableName: tableName,
        avgTime: dish?.dishData?.avgTime,
        taxes: dish?.dishData?.taxes,
      };

      kotArray.push(kotObject);
    }
  }

  return kotArray;
};