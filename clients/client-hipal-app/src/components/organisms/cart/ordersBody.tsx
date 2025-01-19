import { useCartStore } from '@/components/store/useCartStore'
import { motion, AnimatePresence } from "framer-motion";
import React, { memo, useState, useCallback } from 'react'
import { User, ChevronUp, ChevronDown } from 'lucide-react'
import { apiRpc } from '@hi/common';
import { useCart } from '@/components/store/useCart';
import { useQuery } from '@tanstack/react-query';
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useTableData from "@/components/store/useTableData";
import { useLogin } from "@/components/store/useLogin";
import MemoFoodType from '@/components/atoms/foodType';
import { cn } from '@/components/utils/helpers';
import LoadingSpinnerCircle from "@/components/atoms/loader";

const MemoOrdersBody = () => {
    const { cartHistory, setCartHistory } = useCartStore()
    const [expanded, setExpanded] = useState<string[]>(
        cartHistory?.map((cart) => cart._id)
    );
    const { setShowCart, cartPage, setCartPage } = useCart();
    const userDetails = useLogin((state) => state.userDetails);
    const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
    const tableName = useTableData((state) => state.tableName);
    // Toggle Accordion
    const toggleAccordion = useCallback((id: string) => {
        setExpanded((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    }, []);
    // Fetch Orders from POS
    const getOrderFromPos = async () => {
        console.log('trigger')
        const response = await apiRpc.pos.fetch_kot_by_table.$get({
            query: { businessId: outletInfo?.businessId || "", tableName },
        });
        const res = await response.json();
        setCartHistory(res.data);
        if (res?.data?.length > 0) {
            setExpanded(res?.data.map((order) => order._id));
        }
        return res;
    };

    // Query for POS orders
    const { isLoading: isLoadingPos } = useQuery({
        queryKey: ["pos", userDetails?._id, outletInfo?.businessId, tableName],
        queryFn: getOrderFromPos,
        enabled: cartPage === "order",
        staleTime: 1000 * 30,
    });
    return (
        <>
            {isLoadingPos ?
                <div className="h-full flex items-center justify-center">
                    <LoadingSpinnerCircle />
                </div> : null}
            <main className="flex-1 pb-20 overflow-auto bg-gray-50/50">
                <AnimatePresence>
                    {cartHistory.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="px-3 py-2 max-w-3xl mx-auto"
                        >
                            {/* Order Header */}
                            <motion.div
                                className={cn(
                                    "flex items-center justify-between p-2 bg-white rounded-xl",
                                    "border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200",
                                    "cursor-pointer select-none",
                                    expanded.includes(order._id) && "rounded-b-none border-b-0"
                                )}
                                onClick={() => toggleAccordion(order._id)}
                                whileHover={{ scale: 1.002 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                <section className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full">
                                        <User className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 poppins-regular">Orders by</p>
                                        <h3 className="text-base font-semibold text-gray-900 poppins-regular">
                                            {order.name}
                                        </h3>
                                    </div>
                                </section>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 text-sm font-medium text-black rounded-full poppins-regular">
                                        {order?.cart?.length} items
                                    </span>
                                    {expanded.includes(order._id)
                                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                                        : <ChevronDown className="w-5 h-5 text-gray-400" />
                                    }
                                </div>
                            </motion.div>

                            {/* Order Details */}
                            <AnimatePresence>
                                {expanded.includes(order._id) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden bg-white border border-t-0 border-gray-100 rounded-b-xl shadow-sm"
                                    >
                                        {order.cart.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    "flex items-start gap-4 p-4",
                                                    index !== order.cart.length - 1 && "border-b border-gray-100"
                                                )}
                                            >
                                                <div className="flex-shrink-0">
                                                    <MemoFoodType types={item.dish.dishTypes} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-medium text-gray-900 truncate">
                                                        {item?.dish?.name}
                                                    </h4>
                                                    {item.portion && (
                                                        <p className="italic mt-0.5 text-sm text-gray-500">
                                                            {item?.portion?.name}
                                                        </p>
                                                    )}
                                                    {item.extras.length > 0 && (
                                                        <p className="italic mt-1 text-sm text-gray-500">
                                                            Extra: {item.extras.map(e => e.name).join(", ")}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <div className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded">
                                                        × {item.quantity}
                                                    </div>
                                                    <p className="mt-1 text-base font-semibold text-gray-900">
                                                        ₹{((item?.dish?.price || item?.portion?.price) * item?.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* Order Summary */}
                                        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-500">
                                                    Total Items
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {order.cart.reduce((acc, item) => acc + item.quantity, 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </main>
        </>
    )
}

const OrdersBody = memo(MemoOrdersBody)
export default OrdersBody