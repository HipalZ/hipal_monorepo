import { memo, useCallback } from "react";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import MemoChoosePortions from "@/components/molecules/choosePortions";
import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras";
import type { DishType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";
import MemoAlertVariant from "@/components/atoms/alertVariant";
import { useBottomPanel } from "@/components/store/useBottomPanel";

const MemoDishQuantityButton = ({ dishData }: { dishData: DishType }) => {
  const {
    openBottomPanel,
    setOpenBottomPanel,
    cartPopup,
    setCartPopup,
    removeFromCart,
    selectedDish,
    setSelectedDish,
    selectedPortion,
    selectedChoices,
    addToCart,
    cart,
    resetSelections,
    updateCartItem,
  } = useCartStore();

  const handleOpenModal = useCallback(() => {
    setOpenBottomPanel(true);
  }, [setOpenBottomPanel]);

  const { displayAlert } = useBottomPanel((s) => ({
    displayAlert: s.displayAlert,
  }));

  const closeModal = useCallback(() => {
    setOpenBottomPanel(false);
    resetSelections();
  }, [setOpenBottomPanel]);

  const handleClick = useCallback(
    (addDish: DishType) => {
      setSelectedDish(addDish);
      if (addDish?.portions?.length > 0 || addDish?.addOnIds?.length > 0) {
        setCartPopup("BOTTOM_PANEL");
        handleOpenModal();
        return;
      }
      const item = {
        id: addDish._id,
        dish: addDish,
        portion: null,
        extras: [],
        quantity: 1,
      };
      addToCart(item);
      resetSelections();
    },
    [setSelectedDish, setCartPopup, handleOpenModal],
  );

  const handleAddToCart = useCallback(() => {
    const item = {
      id: selectedDish._id,
      dish: selectedDish,
      portion: selectedPortion,
      extras: selectedChoices,
      quantity: 1,
    };
    addToCart(item);
    closeModal();
  }, [selectedDish, selectedPortion, selectedChoices, addToCart, closeModal]);

  const handleIncreaseQuantity = useCallback(
    (item) => {
      updateCartItem({ ...item, quantity: item.quantity + 1 });
    },
    [updateCartItem],
  );

  const handleDecreaseQuantity = useCallback(
    (item) => {
      if (item.quantity > 1) {
        updateCartItem({ ...item, quantity: item.quantity - 1 });
      } else {
        removeFromCart(item.id);
      }
    },
    [updateCartItem, removeFromCart],
  );

  const cartItem = cart.find((item) => item?.id === dishData?._id);

  return (
    <>
      {cartItem ? (
        <div className="relative z-10 flex items-center p-2 space-x-2 text-sm border rounded-full bg-base-100 border-primary text-primary">
          <button
            type="button"
            onClick={() => handleDecreaseQuantity(cartItem)}
          >
            <HiMinusSm size={16} />
          </button>
          <span className="w-1/3 px-2 text-xs font-bold text-center">
            {cartItem.quantity}
          </span>
          <button
            type="button"
            onClick={() => handleIncreaseQuantity(cartItem)}
          >
            <HiPlusSm size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleClick(dishData)}
          type="button"
          className="relative z-10 bg-base-100 btn-sm text-primary active:bg-base-100 border border-primary min-w-[6.044rem] min-h-[2.241rem] !px-6 rounded-full font-medium text-[0.969rem] normal-case"
        >
          Add
        </button>
      )}

      {openBottomPanel && selectedDish._id === dishData._id && (
        <MemoBottomPopUp show={openBottomPanel} onClose={closeModal}>
          {cartPopup === "BOTTOM_PANEL" && (
            <div className="relative flex flex-col pb-12 mt-4 overflow-auto z-[103]">
              <div className="flex flex-col h-[70vh] space-y-4 divide-y-2 divide-base-200 text-base-content">
                <MemoChoosePortions dishData={selectedDish} />
                <ExtraWithDishWithSelect dishData={selectedDish} />
                {displayAlert && <MemoAlertVariant />}
              </div>
              <button
                className="absolute on_active_bounce z-[103] bottom-4 rounded-full text-base-100 bg-primary w-[92%] mx-4 py-1.5"
                type="button"
                onClick={handleAddToCart}
              >
                Add Dish To Cart
              </button>
            </div>
          )}
        </MemoBottomPopUp>
      )}
    </>
  );
};

const DishQuantityButton = memo(MemoDishQuantityButton);
export default DishQuantityButton;
