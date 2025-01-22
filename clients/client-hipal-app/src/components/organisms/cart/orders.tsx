"use client";;
import { memo, useState, useCallback, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { RiNewspaperLine } from "react-icons/ri";
import { BiRightArrow } from "react-icons/bi";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/components/store/useCartStore";
import { useCart } from "@/components/store/useCart";
import { useLogin } from "@/components/store/useLogin";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useTableData from "@/components/store/useTableData";
import order from "@/assets/call/order.png";
import CommonBottomButton from "@/components/atoms/bottomButton";
import MemoFoodType from "@/components/atoms/foodType";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { apiRpc } from "@hi/common";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { User, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from "@/components/utils/helpers";
const OrdersHeader = lazy(() => import("./headerOrders"));

const MemoOrders = () => {
  const { cartHistory, setCartHistory } = useCartStore();
  const { setShowCart, cartPage, setCartPage } = useCart();
  const [expanded, setExpanded] = useState<string[]>(
    cartHistory?.map((cart) => cart._id)
  );
  const { setShowScan } = usePaymentStore();
  const userDetails = useLogin((state) => state.userDetails);
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
  const handleBack = useCallback(() => setShowCart(false), [setShowCart]);

  // Toggle Accordion
  const toggleAccordion = useCallback((id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);
  const handleConfirmBillPage = useCallback(() => setCartPage("confirmPayment"), [setCartPage]);


  // Fetch Orders from POS
  const getOrderFromPos = async () => {
    const response = await apiRpc.pos.fetch_kot_by_table.$get({
      query: { businessId: outletInfo?.businessId || "", tableName, userId: userDetails?._id },
    });
    const res = await response.json();
    setCartHistory(res.data || []);
    if (Array.isArray(res?.data) && res.data.length > 0) {
      setExpanded(res.data.map((order) => order._id));
    } else {
      setExpanded([]);
    }
    return res;
  };

  // Query for POS orders
  const { isLoading: isLoadingPos } = useQuery({
    queryKey: ["pos", userDetails?._id, outletInfo?.businessId, tableName],
    queryFn: getOrderFromPos,
    enabled: cartPage === "order",
    staleTime: 1000 * 10,
  });

  // Loading Spinner
  if (isLoadingPos) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinnerCircle />
      </div>
    );
  }

  // No Orders State
  if (!cartHistory?.length) {
    return (
      <>
        <center className="flex items-center justify-center h-full">
          <figure>
            <Image src={order} alt="No orders" />
            <h1 className="text-xl font-semibold">No orders yet</h1>
          </figure>
        </center>
        <CommonBottomButton buttons={[{ text: "Back To Order More", onClick: handleBack }]} />
      </>
    );
  }

  // Main Component
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <OrdersHeader />

      {/* Scrollable Content */}
      <main className="flex-1 pb-20 overflow-auto bg-gray-50/50 hide-scrollbar">
        <AnimatePresence>
          {cartHistory.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl px-3 py-2 mx-auto"
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
                <section className="space-y-2">
                  <h3 className="text-sm text-gray-500 poppins-regular">
                    Orders by <span className="font-semibold text-gray-900">{order.name}</span>
                  </h3>
                  {order?.edited && <h3 className="text-sm text-gray-500 poppins-regular">
                    Order Edited by <span className="font-semibold text-gray-900">{order?.editedBy?.name}</span>
                  </h3>}
                  {order?.transferd && <div>
                    <h3 className="text-sm text-gray-500 poppins-regular">
                      Transferred by <span className="font-semibold text-gray-900">{order?.transferedBy?.name}</span>
                    </h3>
                  </div>}
                </section>
                <div className="flex items-center">
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
                    className="overflow-hidden bg-white border border-t-0 border-gray-100 shadow-sm rounded-b-xl"
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
                            <p className="mt-1 text-sm italic text-gray-500">
                              Extra: {item.extras.map(e => e.name).join(", ")}
                            </p>
                          )}
                          {item?.dish?.instruction?.length > 0 &&
                            <p className="inline-flex gap-1 mt-1 text-sm italic text-gray-500">
                              <span>⚠</span> {item?.dish?.instruction}
                            </p>}
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="px-2 py-1 text-sm font-medium text-gray-600 rounded bg-gray-50">
                            × {item.quantity}
                          </div>
                          <p className="mt-1 text-base font-semibold text-gray-900">
                            ₹{((item?.dish?.price || item?.portion?.price) * item?.quantity).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Order Summary */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
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

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="p-2 text-xs text-center text-red-500 bg-red-50">
          Note: Some items modified will be shown in final bill.
        </div>
        <div className="flex items-stretch h-16 gap-2 p-2">
          <button
            onClick={handleBack}
            type="button"
            className="flex items-center justify-center px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleConfirmBillPage}
            type="button"
            className="px-6 w-full inline-flex items-center justify-between bg-[#008800] rounded-lg text-white font-medium hover:bg-green-800"
          >
            <span className="inline-flex items-center gap-2">
              <RiNewspaperLine size={20} />
              Generate Final Bill
            </span>
            <BiRightArrow className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Orders = memo(MemoOrders);
export default Orders
