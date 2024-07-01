import QuantityPicker from "@/components/atoms/quantityPicker";
import BottomPanel from "@/components/molecules/bottomPanel";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import { ICart, useCart } from "@/components/store/useCart";
import { IDish } from "@/components/types/hiTableData";
import { memo, useCallback } from "react";
import { useParams } from "react-router-dom";

function DishQuantityBtn({
  dishData,
  isDeleteAble,
  categoryName,
}: {
  dishData: IDish;
  isDeleteAble?: boolean;
  categoryName: string;
}) {
  const { openBottomPanel, closeBottomPanel } = useBottomPanel();
  let params = useParams<{
		tableId: string;
	}>();
	let {  tableId } = params;
  if (!tableId) {
    tableId = "012345";
  }
  const cart = useCart((s) => s.cart)
  const setCart: any = useCart((s) => s.setCart)

  const handleQty = useCallback(
    (quantity: number) => {
      handleDishQty(
        tableId,
        cart,
        dishData,
        categoryName,
        openBottomPanel,
        setCart,
        closeBottomPanel
      )(quantity);
    },
    [
      tableId,
      cart,
      dishData,
      categoryName,
      openBottomPanel,
      setCart,
      closeBottomPanel,
    ]
  );

  const handleDeleteItem = () => {
    const updatedCart = { ...cart };

    if (updatedCart[tableId] && updatedCart[tableId][dishData._id]) {
      delete updatedCart[tableId][dishData._id];

      if (Object.keys(updatedCart[tableId]).length === 0) {
        delete updatedCart[tableId];
      }
    }
    setCart(tableId, dishData._id, updatedCart[tableId] || {});

    closeBottomPanel(dishData._id);
  };


  return (
    <>
      {(cart?.[tableId]?.[dishData._id]?.variants?.length || 0) <= 0 && !isDeleteAble ? (
        <button
          className="bg-base-100 btn-sm text-primary active:bg-base-100 border border-primary min-w-[6.044rem] min-h-[2.241rem] !px-6 rounded-full font-medium text-[0.969rem] normal-case"
          onClick={() => {
            handleQty((cart[tableId]?.[dishData._id]?.variants?.length || 0)+1);
          }}
        >
          Add
        </button>
      ) : (
        <QuantityPicker
          quantity={(cart[tableId]?.[dishData._id]?.variants?.length || 0)}
          setQuantity={handleQty}
          minQuantity={0}
          isDeleteAble={isDeleteAble as boolean}
          onDeleteItem={handleDeleteItem}
        />
      )}

      <BottomPanel dishData={dishData} categoryName={categoryName} />
    </>
  );
}

export default memo(DishQuantityBtn);

export function handleDishQty(
  tableId: string,
  cart: ICart,
  dishData: IDish,
  categoryName: string,
  openBottomPanel: (panelName: string) => void,
  setCart: (tableId: string, dishId: string, data: any) => void,
  closeBottomPanel: (panelName: string) => void
): (newQuantity: number) => void {
  return (newQuantity: number) => {
    const addedDishId = crypto.randomUUID();
    // Retrieve the specific table's cart or initialize it if it does not exist
    const tableCart = cart[tableId] || {};

    // Adding the dish to the cart
    if ((tableCart?.[dishData?._id]?.variants?.length || 0) < newQuantity) {
      // const thisDish = dishData as IDish;
      if (
        dishData?.portions?.length > 0 ||
        (dishData?.extras?.[0]?.numSelections || 0) > 0
      ) {
        openBottomPanel(dishData?._id);
      }

      const portion = dishData?.portions?.find((p) => p?.default === true);
      const extra = {};
      let index = 0;
      dishData?.extras?.forEach((extra) => {
        extra.items?.forEach((e: any) => {
          extra[e.name + index] = {
            ...e,
            quantity: 0,
          };
          index++;
        });
      });
      // If dish is not already in the cart for this table, add it
      if (!tableCart[dishData?._id]) {
        tableCart[dishData?._id] = {
          dishData: dishData,
          dishId: dishData?._id,
          parentCategoryName: categoryName,
          variants: [{ _id: addedDishId, extra: extra, portion: portion }],
        };
      } else {
        // If dish is already in the cart, update it
        tableCart[dishData?._id].variants.push({
          _id: addedDishId,
          extra: extra,
          portion: portion,
        });
      }
      setCart(tableId, dishData._id, tableCart[dishData?._id]);
    } else {
      // Handle reducing the quantity of the dish in the cart
      if (tableCart[dishData?._id]) {
        const variants = tableCart[dishData?._id].variants;
        if (variants.length > 0) {
          variants.pop();
          if (variants.length === 0) {
            delete tableCart[dishData?._id];
          } else {
            tableCart[dishData?._id].variants = variants;
          }
        }

        setCart(tableId, dishData._id, tableCart[dishData?._id]);
      }

      closeBottomPanel(dishData?._id);
    }
  };
}
