import { memo, useCallback } from "react";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import MemoChoosePortions from "@/components/molecules/choosePortions";
import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras";
import type { DishType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";
import { HiMinusSm, HiPlusSm } from "react-icons/hi";
import MemoAlertVariant from "@/components/atoms/alertVariant";
import { useBottomPanel } from "@/components/store/useBottomPanel";
import { useCart } from "@/components/store/useCart";

function generateCartItemId(dishId, portionId, extras) {
  const sortedExtras = [...extras]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}:${e.quantity}`)
    .join("|");
  return `${dishId}_${portionId || "no_portion"}_${
    sortedExtras || "no_extras"
  }`;
}

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

  const { setShowCart, showCart } = useCart();

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
        id: generateCartItemId(addDish._id, null, []),
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
      id: generateCartItemId(
        selectedDish._id,
        selectedPortion?._id || null,
        selectedChoices.map((choice) => ({
          id: choice.id,
          quantity: choice.quantity,
        })),
      ),
      dish: selectedDish,
      portion: selectedPortion,
      extras: selectedChoices,
      quantity: 1,
    };
    addToCart(item);
    closeModal();
  }, [selectedDish, selectedPortion, selectedChoices, addToCart, closeModal]);

  const cartItemsForDish = cart.filter(
    (item) => item.dish._id === dishData._id,
  );

  const totalQuantity = cartItemsForDish.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const handleIncreaseQuantity = useCallback(() => {
    if (cartItemsForDish.length > 0) {
      const item = cartItemsForDish[0];
      setSelectedDish(item.dish);
      if (
        item?.dish?.portions?.length > 0 ||
        item?.dish?.addOnIds?.length > 0
      ) {
        setCartPopup("BOTTOM_PANEL");
        handleOpenModal();
        return;
      }
      updateCartItem({ ...item, quantity: item.quantity + 1 });
    }
  }, [cartItemsForDish, updateCartItem]);

  const handleDecreaseQuantity = useCallback(() => {
    if (cartItemsForDish.length > 0) {
      const item = cartItemsForDish[0];
      setSelectedDish(item.dish);
      if (
        item?.dish?.portions?.length > 0 ||
        item?.dish?.addOnIds?.length > 0
      ) {
        setShowCart(!showCart);
        return;
      }
      if (item.quantity > 1) {
        updateCartItem({ ...item, quantity: item.quantity - 1 });
      } else {
        removeFromCart(item.id);
      }
    }
  }, [cartItemsForDish, updateCartItem, removeFromCart]);
  return (
    <section>
      <article className="absolute bottom-0 scale-75 -right-2">
        {totalQuantity > 0 ? (
          <div className="relative z-10 flex items-center p-2 space-x-2 text-sm border rounded-full bg-base-100 border-primary text-primary">
            <button type="button" onClick={handleDecreaseQuantity}>
              <HiMinusSm size={16} />
            </button>
            <span className="w-1/3 px-2 text-xs font-bold text-center">
              {totalQuantity}
            </span>
            <button type="button" onClick={handleIncreaseQuantity}>
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
      </article>
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
                className="absolute on_active_bounce z-[103] bottom-0 rounded-full text-base-100 bg-primary w-[92%] mx-4 py-1.5"
                type="button"
                onClick={handleAddToCart}
              >
                Add Dish To Cart
              </button>
            </div>
          )}
        </MemoBottomPopUp>
      )}
    </section>
  );
};

const DishQuantityButton = memo(MemoDishQuantityButton);
export default DishQuantityButton;
