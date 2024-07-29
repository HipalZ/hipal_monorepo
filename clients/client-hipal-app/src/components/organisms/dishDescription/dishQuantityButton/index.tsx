import { memo, useCallback } from "react";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import MemoChoosePortions from "@/components/molecules/choosePortions";
import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras";
import type { DishType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";

const DishQuantityButton = ({ dishData }: { dishData: DishType }) => {
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

  const closeModal = useCallback(() => {
    setOpenBottomPanel(false);
    resetSelections()
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
    console.log("selectedDish", selectedDish);
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
        <div className="flex items-center p-2 space-x-2 text-sm border rounded-full bg-base-100 border-primary">
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
          className="bg-base-100 btn-sm text-primary active:bg-base-100 border border-primary min-w-[6.044rem] min-h-[2.241rem] !px-6 rounded-full font-medium text-[0.969rem] normal-case"
        >
          Add
        </button>
      )}

      {openBottomPanel && selectedDish._id === dishData._id && (
        <MemoBottomPopUp show={openBottomPanel} onClose={closeModal}>
          {cartPopup === "BOTTOM_PANEL" && (
            <div className="relative flex flex-col pb-12 mt-4 overflow-auto z-[103]">
              <div className="flex flex-col h-[70vh] space-y-4 divide-y-2 divide-base-200">
                <MemoChoosePortions dishData={selectedDish} />
                <ExtraWithDishWithSelect dishData={selectedDish} />
              </div>
              <button
                className="absolute on_active_bounce z-[103] bottom-4 rounded-full text-base-100 bg-primary w-[92%] mx-4 py-3"
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

const MemoDishQuantityButton = memo(DishQuantityButton);
export default MemoDishQuantityButton;

// {cartPopup === "ADD_NEW" && (
//   <div className="p-4 bg-white rounded-lg shadow-lg">
//     <p className="mb-4 text-lg font-semibold">Add Dish</p>
//     <button
//       type="button"
//       className="w-full px-4 py-2 mb-2 text-white rounded-full bg-primary"
//     >
//       Repeat Last
//     </button>
//     <button
//       type="button"
//       className="w-full px-4 py-2 text-white rounded-full bg-primary"
//     >
//       Add New
//     </button>
//   </div>
// )}
