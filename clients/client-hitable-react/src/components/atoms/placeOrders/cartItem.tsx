import { memo, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, Trash2 } from 'lucide-react'
import { type ICartItem, useCartStore } from "@/components/store/useCartStore"
import { cn } from "@/components/utils/helpers"
import FoodType from "../dishType"
import CommonBottomButton from "../bottomButton"
import { useOrderStore } from "@/components/store/useOrderData"
import { useCreateOrder } from "@/components/hooks/useCartApi"
import { useParams } from "react-router-dom"
import { useHiClientZ } from "@/components/store/useHiClientzData"
import { useCart } from "@/components/store/useCart"

const MemoizedCartItem = ({ hide, dishId }: { hide?: boolean; dishId?: string }) => {
    const { cart, updateCartItem, removeFromCart } = useCartStore();
    const { setIsCartEdit, isCartEdit } = useCart();
    const captainData = useHiClientZ(s => s.captainData);
    const { businessId } = useParams();
    const { setModalType } = useOrderStore();
    const { createOrder, isPending } = useCreateOrder();
    const selectedTable = useOrderStore(s => s.selectedTable);

    // Filter the cart items based on dishId (if provided)
    const filteredCart = useMemo(() => {
        return dishId
            ? cart.filter(cartItem => cartItem.dish?._id === dishId)
            : cart;
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
        [updateCartItem]
    );

    const decreaseQuantity = useCallback(
        (cartItem: ICartItem) => {
            cartItem.quantity > 1
                ? updateCartItem({ ...cartItem, quantity: cartItem.quantity - 1 })
                : removeFromCart(cartItem.id);
        },
        [updateCartItem, removeFromCart]
    );

    const calculateTotalPrice = useCallback(
        (cartItem: ICartItem) => {
            const basePrice = cartItem.dish.price;
            const extrasPrice =
                cartItem.extras?.reduce((total, extra) => total + extra.price * extra.quantity, 0) || 0;
            const portionPrice = cartItem.portion?.price || 0;

            return (basePrice + extrasPrice + portionPrice) * cartItem.quantity;
        },
        []
    );

    const placeOrder = () => {
        const order = {
            businessId: businessId,
            userId: captainData._id,
            tableName: selectedTable?.name || "",
            customerPhone: captainData.phone,
            internalCart: sanitizedCart,
            customerName: captainData.name || "",
        };
        if (isCartEdit) {
            setIsCartEdit(false);
        }
        createOrder(order);
    };

    return (
        <section className="h-screen lg:py-24 bg-gray-50">
            <AnimatePresence>
                {filteredCart.length > 0 ? (
                    <div className="mx-4 py-[5.5rem] md:py-[2rem] grid md:grid-cols-2 gap-4">
                        {filteredCart.map((cartItem) => (
                            <motion.div
                                key={cartItem.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-4 bg-white rounded-lg shadow-sm"
                            >
                                <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                                    {/* Left Section */}
                                    <div className="space-y-2">
                                        <div className="flex gap-2 mb-2">
                                            <FoodType types={cartItem.dish.dishTypes} />
                                            <h5 className="font-semibold text-gray-800">
                                                {cartItem.dish.name}
                                            </h5>
                                        </div>
                                        <div className="mt-2 mb-1 text-xs text-gray-500">
                                            {cartItem.portion && (
                                                <span className="mr-2 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                    {cartItem.portion.name}
                                                </span>
                                            )}
                                            {cartItem.extras?.length > 0 && (
                                                <span className="italic truncate">
                                                    Extra:{" "}
                                                    {cartItem.extras
                                                        .map(
                                                            (extra) =>
                                                                `${extra.name} (${extra.quantity})`
                                                        )
                                                        .join(", ")}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-1 text-sm font-bold text-green-600">
                                            ₹{calculateTotalPrice(cartItem).toFixed(2)}
                                        </h3>
                                    </div>

                                    {/* Right Section */}
                                    <div className="grid items-center grid-rows-3 gap-1 justify-items-center">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => decreaseQuantity(cartItem)}
                                            className={cn(
                                                "w-6 h-6 flex items-center justify-center rounded-full",
                                                cartItem.quantity === 1
                                                    ? "bg-red-100 text-red-500"
                                                    : "bg-gray-100 text-gray-600"
                                            )}
                                        >
                                            {cartItem.quantity === 1 ? (
                                                <Trash2 size={14} />
                                            ) : (
                                                <Minus size={14} />
                                            )}
                                        </motion.button>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {cartItem.quantity}
                                        </span>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => increaseQuantity(cartItem)}
                                            className="flex items-center justify-center w-6 h-6 text-green-500 bg-green-100 rounded-full"
                                        >
                                            <Plus size={14} />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64"
                    >
                        <p className="text-xl font-semibold text-gray-500">Your cart is empty!</p>
                        <p className="mt-2 text-sm text-gray-400">
                            Add some delicious items to your cart
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {!hide && (
                <CommonBottomButton
                    maxWidth="48rem"
                    position="mid"
                    fixed
                    shadow
                    buttons={[
                        {
                            text: "Back",
                            isBackButton: true,
                            onClick: () => setModalType("addItem"),
                            className: "rounded-md pl-3 flex items-center",
                            disable: isPending,
                            isLoading: isPending,
                        },
                        {
                            text: "Place Order",
                            onClick: placeOrder,
                            className: "rounded-md shadow-md",
                            highlight: filteredCart.length > 0,
                            disable: filteredCart.length === 0 || isPending,
                            isLoading: isPending,
                        },
                    ]}
                />
            )}
        </section>
    );
};


const CartItem = memo(MemoizedCartItem);
export default CartItem;