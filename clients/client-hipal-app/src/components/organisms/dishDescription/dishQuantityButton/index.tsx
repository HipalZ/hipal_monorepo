import { memo, useCallback, useMemo, useState } from "react";
import type { IDish, IExtraItem } from "@/components/types/businessData";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import MemoChoosePortions from "@/components/molecules/choosePortions";
import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras";
import { useDishCart } from "@/components/store/useDishCart";
import { useDishStore } from "@/components/store/useDishStore";
import { calculateTotalPrice } from "@/components/utils/helpers";

const DishQuantityButton = ({
  dishData,
  setSelectedDish,
}: {
  dishData: IDish;
  setSelectedDish: (dish: IDish,portion:string,extra:IExtraItem) => void;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [showRepeatPopup, setShowRepeatPopup] = useState(false);
  const { selectedExtras, selectedPortion, resetSelections } = useDishStore();
  const cartItems = useDishCart((state) => state.cartItems);
  const addToCart = useDishCart((state) => state.addToCart);
  const increaseQuantity = useDishCart((state) => state.increaseQuantity);
  const decreaseQuantity = useDishCart((state) => state.decreaseQuantity);
  const removeFromCart = useDishCart((state) => state.removeFromCart);

  const handleOpenModal = useCallback(() => {
    setOpenModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  const saveDish = useCallback((dish: IDish,portion:string,extra:IExtraItem) => {
    setSelectedDish(dish,portion,extra);
    closeModal();
  }, []);

  const handleClick = useCallback((dish: IDish) => {
    if (dish?.portions?.length > 0 || dish?.extras?.[0]?.items.length > 0) {
      handleOpenModal();
      return;
    }
    const existingCartItem = cartItems.find(
      (item) => item.dish._id === dish._id,
    );
    if (existingCartItem) {
      setShowRepeatPopup(true);
      return;
    }
    const totalPrice = calculateTotalPrice(
      dish,
      selectedPortion,
      selectedExtras,
    );
    addToCart({
      dish: dish,
      quantity: 1,
      selectedPortion,
      selectedPortionPrice:
        dish?.portions?.find((p) => p.name === selectedPortion)?.price || 0,
      selectedExtras: dish?.extras[0]?.items
        .filter((extra) => selectedExtras[extra._id] > 0)
        .map((extra) => ({
          extraId: extra._id,
          quantity: selectedExtras[extra._id],
          name: extra.name,
          pricePerUnit: extra.price,
        })),
      totalPrice,
    });
    resetSelections();
  }, [selectedPortion,selectedExtras,cartItems]);

  const handleIncreaseQuantity = useCallback(
    (dish: IDish) => {
      const existingCartItem = cartItems.find(
        (item) => item.dish._id === dish._id,
      );
      if (existingCartItem) {
        setShowRepeatPopup(true);
        return;
      }
      const totalPrice = calculateTotalPrice(
        dish,
        selectedPortion,
        selectedExtras,
      );
      addToCart({
        dish: dish,
        quantity: 1,
        selectedPortion,
        selectedPortionPrice:
          dish?.portions?.find((p) => p.name === selectedPortion)?.price || 0,
        selectedExtras: dish?.extras[0]?.items
          .filter((extra) => selectedExtras[extra._id] > 0)
          .map((extra) => ({
            extraId: extra._id,
            quantity: selectedExtras[extra._id],
            name: extra.name,
            pricePerUnit: extra.price,
          })),
        totalPrice,
      });
      resetSelections();
    },
    [cartItems,selectedPortion,selectedExtras],
  );

  const handleDecreaseQuantity = useCallback(
    (dishId: string) => {
      const existingCartItem = cartItems.find(
        (item) => item.dish._id === dishId,
      );
      if (existingCartItem && existingCartItem.quantity === 1) {
        removeFromCart(existingCartItem.id || "");
        return;
      }
      decreaseQuantity(existingCartItem?.id || "");
    },
    [cartItems],
  );

  const handleRepeatLast = useCallback(() => {
    const existingCartItem = cartItems.reverse().find(
      (item) => item.dish._id === dishData._id,
    );
    if (existingCartItem) {
      increaseQuantity(existingCartItem.id || "");
    }
    setShowRepeatPopup(false);
  }, [cartItems, dishData._id]);

  const handleAddNew = useCallback((dish: IDish) => {
    if (dish?.portions?.length > 0 || dish?.extras?.[0]?.items.length > 0) {
      handleOpenModal();
      return;
    }
    const totalPrice = calculateTotalPrice(
      dish,
      selectedPortion,
      selectedExtras,
    );
    addToCart({
      dish: dish,
      quantity: 1,
      selectedPortion,
      selectedPortionPrice:
        dish?.portions?.find((p) => p.name === selectedPortion)?.price || 0,
      selectedExtras: dish?.extras[0]?.items
        .filter((extra) => selectedExtras[extra._id] > 0)
        .map((extra) => ({
          extraId: extra._id,
          quantity: selectedExtras[extra._id],
          name: extra.name,
          pricePerUnit: extra.price,
        })),
      totalPrice,
    });
    resetSelections();
    setShowRepeatPopup(false);
  }, [selectedPortion,selectedExtras,cartItems]);

  const cartItem = useMemo(() => {
    return cartItems.find((item) => item.dish._id === dishData._id);
  }, [cartItems, dishData._id]);

  const totalQuantity = useMemo(() => {
    return cartItems
      .filter((item) => item.dish._id === dishData._id)
      .reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems, dishData._id]);

  return (
    <>
      {cartItem ? (
        <div className="flex items-center space-x-2 border rounded-full bg-base-100 border-primary">
          <button
            onClick={() => handleDecreaseQuantity(dishData._id)}
            type="button"
            className="btn-sm text-base-content min-w-[2.241rem] min-h-[2.241rem] !px-2 rounded-full font-medium text-[0.969rem] normal-case"
          >
            -
          </button>
          <span className="text-base-content">{totalQuantity}</span>
          <button
            onClick={() => handleIncreaseQuantity(dishData)}
            type="button"
            className="btn-sm text-base-content min-w-[2.241rem] min-h-[2.241rem] !px-2 rounded-full font-medium text-[0.969rem] normal-case"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleClick(dishData)}
          type="button"
          className="bg-base-100 btn-sm text-primary active:bg-base-100 border border-primary min-w-[6.044rem] min-h-[2.241rem] !px-6 rounded-full font-medium text-[0.969rem] normal-case"
        >
          Add
        </button>
      )}

      {openModal && (
        <MemoBottomPopUp show={openModal} onClose={closeModal}>
          <div className="relative flex flex-col pb-12 mt-4 overflow-auto">
            <div className="flex flex-col h-[70vh] space-y-4 divide-y-2 divide-base-200">
              <MemoChoosePortions dishData={dishData} />
              <ExtraWithDishWithSelect dishData={dishData} />
            </div>
            <button
              className="absolute bottom-4 rounded-full text-base bg-primary w-[92%] mx-4 py-3"
              type="button"
              onClick={() => saveDish(dishData,selectedPortion,selectedExtras)}
            >
              Add Dish To Cart
            </button>
          </div>
        </MemoBottomPopUp>
      )}

      {showRepeatPopup && (
        <MemoBottomPopUp
          show={showRepeatPopup}
          onClose={() => setShowRepeatPopup(false)}
        >
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <p className="mb-4 text-lg font-semibold">Add Dish</p>
            <button
              type="button"
              className="w-full px-4 py-2 mb-2 text-white rounded-full bg-primary"
              onClick={handleRepeatLast}
            >
              Repeat Last
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-white rounded-full bg-primary"
              onClick={() => handleAddNew(dishData)}
            >
              Add New
            </button>
          </div>
        </MemoBottomPopUp>
      )}
    </>
  );
};

const MemoDishQuantityButton = memo(DishQuantityButton);
export default MemoDishQuantityButton;
