import CommonBottomButton from '@/components/atoms/bottomButton';
import { useCartStore } from '@/components/store/useCartStore';
import { Button } from '@/components/ui/button';
import type { DishType } from '@hi/db-models/src/validators';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { memo, useCallback } from 'react';
import BottomPopUp from '../../universalPopup';
import CartItem from '../cartItem';
import OrdersHeader from '../header';
import AddOnsWithDish from './extra';
import ChoosePortions from './portion';

function generateCartItemId(dishId, portionId, extras) {
  const sortedExtras = [...extras]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((e) => `${e.id}:${e.quantity}`)
    .join('|');
  return `${dishId}_${portionId || 'no_portion'}_${sortedExtras || 'no_extras'}`;
}

const MemoDishQuantityButton = ({ dishData }: { dishData: DishType }) => {
  const openBottomPanel = useCartStore((s) => s.openBottomPanel);
  const setOpenBottomPanel = useCartStore((s) => s.setOpenBottomPanel);
  const resetSelections = useCartStore((s) => s.resetSelections);
  const selectedDish = useCartStore((s) => s.selectedDish);
  const setSelectedDish = useCartStore((s) => s.setSelectedDish);
  const selectedPortion = useCartStore((s) => s.selectedPortion);
  const setSelectedPortion = useCartStore((s) => s.setSelectedPortion);
  const selectedChoices = useCartStore((s) => s.selectedChoices);
  const addToCart = useCartStore((s) => s.addToCart);
  const cart = useCartStore((s) => s.cart);
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const setCartPopup = useCartStore((s) => s.setCartPopup);
  const cartPopup = useCartStore((s) => s.cartPopup);

  const handleOpenModal = useCallback(() => {
    setOpenBottomPanel(true);
  }, [setOpenBottomPanel]);

  const closeModal = useCallback(() => {
    setOpenBottomPanel(false);
    resetSelections();
  }, [setOpenBottomPanel]);

  const handleClick = useCallback(
    (addDish: DishType) => {
      const portionCount = addDish?.portions?.length ?? 0;
      const hasAddOns = (addDish?.addOnIds?.length ?? 0) > 0;

      setSelectedDish(addDish);

      if (portionCount === 1 && !hasAddOns) {
        const onlyPortion = addDish.portions![0];
        setSelectedPortion(onlyPortion);

        const item = {
          id: generateCartItemId(addDish._id, onlyPortion._id, []),
          dish: addDish,
          portion: onlyPortion,
          extras: [],
          quantity: 1,
        };
        addToCart(item);
        resetSelections();
        return;
      }

      if (portionCount === 1 && hasAddOns) {
        setSelectedPortion(addDish.portions![0]); // preselect the only portion
        setCartPopup('BOTTOM_PANEL');
        handleOpenModal();
        return;
      }

      if (portionCount > 1) {
        setCartPopup('BOTTOM_PANEL');
        handleOpenModal();
        return;
      }

      if (!hasAddOns) {
        const item = {
          id: generateCartItemId(addDish._id, null, []),
          dish: addDish,
          portion: null,
          extras: [],
          quantity: 1,
        };
        addToCart(item);
        resetSelections();
        return;
      }

      setCartPopup('BOTTOM_PANEL');
      handleOpenModal();
    },
    [setSelectedDish, setSelectedPortion, setCartPopup, handleOpenModal, addToCart, resetSelections],
  );

  const handleAddToCart = useCallback(() => {
    const filteredChoices = selectedChoices?.filter((choice) => choice?.quantity > 0);
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
      extras: filteredChoices,
      quantity: 1,
    };
    addToCart(item);
    closeModal();
  }, [selectedDish, selectedPortion, selectedChoices, addToCart, closeModal]);

  const cartItemsForDish = cart.filter((item) => item.dish._id === dishData._id);

  const totalQuantity = cartItemsForDish.reduce((sum, item) => sum + item.quantity, 0);

  const handleIncreaseQuantity = useCallback(() => {
    const item = cartItemsForDish[0];
    if (!item) return;

    const portionCount = item?.dish?.portions?.length ?? 0;
    const hasAddOns = (item?.dish?.addOnIds?.length ?? 0) > 0;
    const onlyPortion = portionCount === 1 ? item.dish.portions![0] : null;

    setSelectedDish(item.dish);

    if (portionCount === 0 && !hasAddOns) {
      updateCartItem({ ...item, quantity: item.quantity + 1 });
      return;
    }

    if (portionCount === 1 && !hasAddOns && onlyPortion) {
      const updated = {
        ...item,
        id: generateCartItemId(item.dish._id, onlyPortion._id, item.extras ?? []),
        portion: onlyPortion,
        quantity: item.quantity + 1,
      };
      setSelectedPortion(onlyPortion); // keep UI in sync (optional)
      updateCartItem(updated);
      return;
    }

    if (portionCount === 1 && hasAddOns && onlyPortion) {
      setSelectedPortion(onlyPortion);
      setCartPopup('BOTTOM_PANEL');
      handleOpenModal();
      return;
    }

    setCartPopup('BOTTOM_PANEL');
    handleOpenModal();
  }, [cartItemsForDish, updateCartItem, setSelectedDish, setSelectedPortion, setCartPopup, handleOpenModal]);

  const handleDecreaseQuantity = useCallback(() => {
    if (cartItemsForDish.length > 0) {
      const item = cartItemsForDish[0];
      setSelectedDish(item.dish);
      if (item?.dish?.portions?.length > 0 || item?.dish?.addOnIds?.length > 0) {
        setCartPopup('EDIT');
        handleOpenModal();
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
    <>
      <div className="relative h-10 w-24">
        <AnimatePresence initial={false}>
          {totalQuantity > 0 ? (
            <motion.div
              key="quantity"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-between overflow-hidden rounded-md border border-gray-200 bg-white"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDecreaseQuantity}
                className="flex h-full w-8 items-center justify-center bg-gray-100 transition-colors hover:bg-gray-200"
              >
                <Minus className="h-4 w-4" />
              </motion.button>
              <motion.span
                key={totalQuantity}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="font-medium"
              >
                {totalQuantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleIncreaseQuantity}
                className="flex h-full w-8 items-center justify-center bg-gray-100 transition-colors hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Button onClick={() => handleClick(dishData)} variant="outline" className="h-full w-full rounded-md">
                Add
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {openBottomPanel && selectedDish._id === dishData._id && (
        <BottomPopUp show={openBottomPanel} onClose={closeModal} hide width={cartPopup === 'EDIT' ? 'w-[48rem]' : 'w-[30rem]'}>
          {cartPopup === 'BOTTOM_PANEL' && (
            <div className="relative mt-4 max-h-[90dvh] overflow-auto pb-12">
              <div className="flex flex-col divide-y-2 divide-[#ffffff] text-[#000000]">
                <ChoosePortions dishData={selectedDish} />
                <AddOnsWithDish dishData={selectedDish} />
                {/* {displayAlert && <MemoAlertVariant />} */}
              </div>
              <CommonBottomButton
                fixed
                maxWidth="30rem"
                buttons={[
                  {
                    text: 'close',
                    onClick: closeModal,
                    type: 'button' as const,
                    className: 'px-4 rounded',
                    isBackButton: true,
                  },
                  {
                    text: 'Add Item To Cart',
                    onClick: handleAddToCart,
                    type: 'button' as const,
                    className: 'px-4 rounded',
                    disable: selectedDish?.price === 0 && selectedDish.portions?.length > 0 && selectedPortion === null,
                  },
                ]}
              />
            </div>
          )}
          {cartPopup === 'EDIT' && (
            <div className="relative mt-4 max-h-[90dvh] overflow-auto pb-12">
              <OrdersHeader width="48rem" />
              <CartItem hide dishId={selectedDish?._id || ''} />
              <CommonBottomButton
                fixed
                maxWidth="30rem"
                position="mid"
                shadow
                buttons={[
                  {
                    text: 'Close',
                    onClick: closeModal,
                    type: 'button' as const,
                    className: 'px-4 w-full rounded',
                  },
                ]}
              />
            </div>
          )}
        </BottomPopUp>
      )}
    </>
  );
};

const DishQuantityButton = memo(MemoDishQuantityButton);
export default DishQuantityButton;
