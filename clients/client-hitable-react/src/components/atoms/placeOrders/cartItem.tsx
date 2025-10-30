import { useCreateOrder } from '@/components/hooks/useCartApi';
import useBusinessData from '@/components/store/useBusinessData.ts';
import { useCart } from '@/components/store/useCart';
import { type ICartItem, useCartStore } from '@/components/store/useCartStore';
import { useHiClientZ } from '@/components/store/useHiClientzData';
import { useOrderStore } from '@/components/store/useOrderData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/utils/helpers';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Edit, Minus, Plus, Trash2, X } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import CommonBottomButton from '../bottomButton';
import FoodType from '../dishType';
import BottomPopUp from '../universalPopup';

const MemoizedCartItem = ({ hide, dishId }: { hide?: boolean; dishId?: string }) => {
  const cart = useCartStore((s) => s.cart);
  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const showInstructionPopup = useCartStore((s) => s.showInstructionPopup);
  const setShowInstructionPopup = useCartStore((s) => s.setShowInstructionPopup);
  const instructionText = useCartStore((s) => s.instructionText);
  const addInstructionToCartItem = useCartStore((s) => s.addInstructionToCartItem);
  const removeInstructionFromCartItem = useCartStore((s) => s.removeInstructionFromCartItem);

  const setInstructionText = useCartStore((s) => s.setInstructionText);
  const { setIsCartEdit, isCartEdit } = useCart();
  const captainData = useHiClientZ((s) => s.captainData);
  const { businessId } = useParams();
  const { setModalType, orderError, showOrderError, setShowOrderError } = useOrderStore();
  const { createOrder, isPending } = useCreateOrder();
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const [selectedCartItem, setSelectedCartItem] = useState<ICartItem | null>(null);
  const outletInfo = useBusinessData((s) => s.outletInfo);

  // Filter the cart items based on dishId (if provided)
  const filteredCart = useMemo(() => {
    return dishId ? cart.filter((cartItem) => cartItem.dish?._id === dishId) : cart;
  }, [cart, dishId]);

  const sanitizedCart = useMemo(() => {
    return filteredCart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return { ...item, dish: sanitizedDish };
    });
  }, [filteredCart]);

  const increaseQuantity = useCallback(
    (cartItem: ICartItem) => {
      updateCartItem({ ...cartItem, quantity: cartItem.quantity + 1 });
    },
    [updateCartItem],
  );

  const decreaseQuantity = useCallback(
    (cartItem: ICartItem) => {
      cartItem.quantity > 1 ? updateCartItem({ ...cartItem, quantity: cartItem.quantity - 1 }) : removeFromCart(cartItem.id);
    },
    [updateCartItem, removeFromCart],
  );

  const calculateTotalPrice = useCallback((cartItem: ICartItem) => {
    const basePrice = cartItem.dish.price;
    const extrasPrice = cartItem.extras?.reduce((total, extra) => (total + extra.price) * extra.quantity, 0) || 0;
    const portionPrice = cartItem.portion?.price || 0;

    if (portionPrice > 0) return (extrasPrice + portionPrice) * cartItem.quantity;

    return (basePrice + extrasPrice + portionPrice) * cartItem.quantity;
  }, []);

  const placeOrder = () => {
    const order = {
      businessId: businessId,
      userId: captainData._id,
      tableName: selectedTable?.name || '',
      customerPhone: captainData.phone,
      internalCart: sanitizedCart,
      customerName: captainData.name || '',
    };
    if (isCartEdit) {
      setIsCartEdit(false);
    }
    createOrder(order);
  };

  const handleAddInstruction = (cartItem: ICartItem) => {
    setSelectedCartItem(cartItem);
    setInstructionText(cartItem.dish.instruction || '');
    setShowInstructionPopup(true);
  };

  const handleSaveInstruction = () => {
    if (instructionText?.trim() === '') return toast.error("Instruction can't be empty");
    if (selectedCartItem) {
      addInstructionToCartItem(selectedCartItem.id, instructionText);
      setShowInstructionPopup(false);
    }
  };

  const handleRemoveInstruction = (cartItem: ICartItem) => {
    removeInstructionFromCartItem(cartItem.id);
  };

  return (
    <section className="hide-scrollbar h-[100dvh] overflow-auto pb-20 md:pt-20 lg:pt-0">
      <AnimatePresence>
        {filteredCart.length > 0 ? (
          <div className="mx-4 grid gap-4 py-[5.5rem] md:grid-cols-2 md:py-[2rem] lg:mx-0 lg:grid-cols-1 lg:py-0 2xl:grid-cols-2">
            {filteredCart.map((cartItem) => (
              <motion.div
                key={cartItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                  {/* Left Section */}
                  <div className="space-y-2">
                    <div className="mb-2 flex items-start gap-2">
                      <FoodType types={cartItem.dish.dishTypes} />
                      <h5 className="-mt-1 font-semibold text-gray-800">{cartItem.dish.name}</h5>
                    </div>
                    <div className="mb-1 mt-2 text-xs text-gray-500">
                      {cartItem.portion && <span className="mr-2 rounded-full bg-gray-100 px-1.5 py-0.5">{cartItem.portion.name}</span>}
                      {cartItem.extras?.length > 0 && (
                        <span className="italic">
                          Extra: {cartItem.extras.map((extra) => `${extra.name} (${extra.quantity * cartItem.quantity})`).join(', ')}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-green-600">₹{calculateTotalPrice(cartItem).toFixed(2)}</h3>
                    {cartItem?.dish?.instruction && (
                      <div className="relative rounded-md bg-gray-100 p-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleRemoveInstruction(cartItem)}
                          className="absolute left-4 top-1/2 w-2 -translate-x-1/2 -translate-y-1/2 transform text-red-500"
                        >
                          <X size={16} />
                        </Button>
                        <p className="flex items-center pl-6 text-sm text-gray-800">{cartItem?.dish?.instruction}</p>
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddInstruction(cartItem)}
                      className="!mt-4 flex items-center justify-center gap-1 rounded-full bg-blue-100 p-2 text-xs text-blue-600"
                    >
                      <Edit size={14} /> add instruction
                    </motion.button>
                  </div>

                  {/* Right Section */}
                  <div className="grid grid-rows-3 items-center justify-items-center gap-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => decreaseQuantity(cartItem)}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full',
                        cartItem.quantity === 1 ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {cartItem.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                    </motion.button>
                    <span className="text-sm font-semibold text-gray-800">{cartItem.quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => increaseQuantity(cartItem)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-500"
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-64 flex-col items-center justify-center">
            <p className="text-xl font-semibold text-gray-500">Your cart is empty!</p>
            <p className="mt-2 text-sm text-gray-400">Add some delicious items to your cart</p>
          </motion.div>
        )}
      </AnimatePresence>
      {showOrderError && (
        <BottomPopUp width="w-[30rem]" height="h-[50dvh]" show={showOrderError} onClose={() => setShowOrderError(false)}>
          <div className="p-6">
            <h3 className="mb-4 flex items-center text-xl font-bold text-red-600">
              <AlertCircle className="mr-2 h-6 w-6" />
              Order Error
            </h3>
            <p className="text-base text-gray-700">{orderError}</p>
          </div>
        </BottomPopUp>
      )}
      {showInstructionPopup && (
        <BottomPopUp width="w-[30rem]" height="h-[50dvh]" show={showInstructionPopup} onClose={() => setShowInstructionPopup(false)}>
          {outletInfo?.outLetType === 'OTHER' ? null : (
            <div className="p-4">
              <h3 className="mb-4 font-semibold text-gray-800">Add Instruction</h3>
              <Input
                label="Special Instruction"
                placeholder="Add your instruction..."
                value={instructionText}
                maxLength={100}
                minLength={2}
                onChange={(e) => setInstructionText(e.target.value)}
              />
            </div>
          )}
          <CommonBottomButton
            maxWidth="30rem"
            fixed={true}
            buttons={[
              {
                text: '',
                isBackButton: true,
                onClick: () => setShowInstructionPopup(false),
                className: 'rounded-md pl-2',
              },
              {
                text: 'Save',
                onClick: handleSaveInstruction,
                className: 'rounded-md shadow-md',
                disable: instructionText.length === 0,
                isLoading: isPending,
              },
            ]}
          />
        </BottomPopUp>
      )}
      {!hide && (
        <CommonBottomButton
          maxWidth="30rem"
          position="mid"
          fixed={true}
          shadow
          buttons={[
            {
              text: 'Back',
              isBackButton: true,
              onClick: () => setModalType('addItem'),
              className: 'rounded-md pl-3 lg:hidden flex items-center',
              disable: isPending,
              isLoading: isPending,
            },
            {
              text: 'Place Order',
              onClick: placeOrder,
              className: 'rounded-full py-6',
              disable: filteredCart.length === 0 || isPending,
              isLoading: isPending,
              swipe: true,
            },
          ]}
        />
      )}
    </section>
  );
};

const CartItem = memo(MemoizedCartItem);
export default CartItem;
