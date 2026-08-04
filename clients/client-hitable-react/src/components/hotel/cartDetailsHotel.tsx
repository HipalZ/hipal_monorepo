import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import FoodType from "../atoms/dishType";
import { memo } from "react";
import type { Cart } from "../types/hotelData";
import { getCartItemLineTotal, getCartItemUnitPrice } from "../utils/cartPricing";

interface CartDetailsHotelProps {
    localCart: Cart[]
    setLocalCart: (cart: Cart[]) => void
    readOnly?: boolean
}

const MemoCartDetailsHotel = ({ localCart, setLocalCart, readOnly }: CartDetailsHotelProps) => {
    const removeItem = (itemId: string) => {
        const updatedCart = localCart.filter((item) => item.id !== itemId)
        setLocalCart(updatedCart)
    }

    const totalPrice = localCart.reduce((sum, item) => sum + getCartItemLineTotal(item), 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm"
        >
            {/* Header */}
            <div className="text-black px-4 py-3 bg-gray-200 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Order Details</span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="px-4 py-2 h-full overflow-y-auto max-h-96">
                {localCart.length > 0 ? (
                    localCart.map((item) => (
                        <div key={item?.id} className="py-2 border-b last:border-b-0 border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                        {item?.dish?.name}
                                        <FoodType types={item?.dish?.dishTypes} />
                                    </div>
                                    {item?.portion && <div className="text-xs text-gray-500">Portion: {item?.portion?.name}</div>}
                                    {item?.extras && item?.extras.length > 0 && (
                                        <div className="text-xs mt-1 text-gray-500">
                                            Extras:{" "}
                                            {item.extras.map((extra, index) => (
                                                <span key={extra.id}>
                                                    {extra.name} {extra.quantity > 1 ? `× ${extra.quantity}` : ""}
                                                    {index !== item.extras.length - 1 && ", "}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right text-gray-900">₹{getCartItemLineTotal(item)}</div>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500">
                                        ₹{getCartItemUnitPrice(item)} × {item?.quantity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Qty: {item?.quantity}</span>
                                    {!readOnly && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(item.id)}
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center text-gray-500">No items in cart</div>
                )}
            </div>

            {/* Footer with Total */}
            <div className="px-4 py-3 border-t bg-gray-200">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span>₹{totalPrice}</span>
                </div>
            </div>

        </motion.div>
    )
};

const CartDetailsHotel = memo(MemoCartDetailsHotel)
export default CartDetailsHotel;
