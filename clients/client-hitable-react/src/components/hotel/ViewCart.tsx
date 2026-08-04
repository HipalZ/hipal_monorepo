import { motion } from "framer-motion";
import { ShoppingCart } from 'lucide-react';
import { useHotelStore } from '../store/useHotelStore';
import { lazy, memo } from "react";
import { getCartItemExtrasTotal, getCartItemLineTotal, getCartItemUnitPrice } from "../utils/cartPricing";

const FoodType = lazy(() => import("../atoms/dishType"));

const MemoViewCart = () => {
    const { cartData } = useHotelStore();
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-y-auto bg-white border border-gray-200 shadow-sm"
        >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium">Order Details</span>
            </div>

            {/* Cart Items */}
            <div className="px-4 py-2">
                {cartData?.map((item) => {
                    const unitPrice = getCartItemUnitPrice(item);
                    const extrasPrice = getCartItemExtrasTotal(item);
                    const totalPrice = getCartItemLineTotal(item);

                    return (
                        <div key={item?.id} className="py-2 border-b last:border-b-0 border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                    <div className="font-medium flex items-center gap-2">
                                        {item?.dish?.name}
                                        <FoodType types={item?.dish?.dishTypes} />
                                    </div>
                                    {item?.portion?.name && (
                                        <div className="text-xs text-gray-500">
                                            Portion: {item?.portion?.name}
                                        </div>
                                    )}
                                    {item?.extras && item?.extras.length > 0 && (
                                        <div className="text-xs mt-1 text-gray-500">
                                            Extras:{" "}
                                            {item.extras.map((extra, index) => (
                                                <span key={extra.id}>
                                                    {extra.name}
                                                    {extra.quantity > 1 ? ` × ${extra.quantity}` : ""}
                                                    {index !== item.extras.length - 1 && ", "}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right text-gray-900 font-medium">
                                    ₹{totalPrice}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500">
                                        ₹{unitPrice + extrasPrice} × {item.quantity}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const ViewCart = memo(MemoViewCart);
export default ViewCart;
