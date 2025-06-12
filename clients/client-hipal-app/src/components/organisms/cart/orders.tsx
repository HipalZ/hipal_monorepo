"use client";
import { memo, useState, useCallback, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaRegCheckCircle } from "react-icons/fa";
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
import { cn } from "@/components/utils/helpers";
import celebration from "@/assets/cart/celebration.png";
const OrdersHeader = lazy(() => import("./headerOrders"));

const MemoOrders = () => {
  const { cartHistory, setCartHistory } = useCartStore();
  const { setShowCart, cartPage, setCartPage } = useCart();
  const [expanded, setExpanded] = useState<string[]>([]);
  const userDetails = useLogin((state) => state.userDetails);
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
  const handleBack = useCallback(() => setShowCart(false), [setShowCart]);

  // Toggle Accordion
  const toggleAccordion = useCallback((id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const handleConfirmBillPage = useCallback(
    () => setCartPage("confirmPayment"),
    [setCartPage],
  );

  // Fetch Orders from POS
  const getOrderFromPos = async () => {
    const response = await apiRpc.pos.fetch_kot_by_table.$get({
      query: {
        businessId: outletInfo?.businessId || "",
        tableName,
        userId: userDetails?._id,
      },
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
      <div className="h-full flex items-center justify-center">
        <LoadingSpinnerCircle />
      </div>
    );
  }

  // Main Component
  return (
    <>
      {cartHistory?.length ? (
        <div className="flex flex-col h-screen bg-gray-100">
          {/* Header */}
          <OrdersHeader />

          {/* Scrollable Content */}
          <main className="flex-1 pb-20 overflow-auto bg-gray-50/50 hide-scrollbar">
            {cartHistory.map((order) => (
              <section key={order._id} className="px-3 py-2 max-w-3xl mx-auto">
                <h1 className="text-[#008800] ml-3 mb-2">✔ ✔ Order Accepted</h1>
                <article
                  className={cn(
                    "space-y-2 py-2 bg-white rounded-t-xl",
                    "shadow-sm hover:shadow-md transition-shadow duration-200",
                    "cursor-pointer select-none",
                  )}
                >
                  <article className="pl-3 pr-2 flex justify-between gap-2 items-center text-sm text-gray-500 space-y-2 poppins-regular">
                    <span className="inline-flex items-center">
                      <Image
                        src={celebration}
                        alt="celebration"
                        className="-ml-2"
                      />
                      <span>
                        Orders by{" "}
                        <span className="font-semibold text-gray-900 ml-1">
                          {order.name}
                        </span>
                      </span>
                    </span>
                    <div
                      className="flex items-center"
                      onClick={() => toggleAccordion(order._id)}
                      onKeyDown={() => toggleAccordion(order._id)}
                    >
                      <span className="bg-[#4D12FF] text-white px-3 py-1 rounded-full text-sm poppins-regular">
                        {expanded.includes(order?._id) ? "Less" : "More"}
                      </span>
                    </div>
                  </article>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`${
                        expanded.includes(order._id) ? "block" : "hidden"
                      } overflow-hidden bg-white space-y-3`}
                    >
                      <article className="flex items-center gap-2 pl-3 pr-2">
                        <FaRegCheckCircle color="#008800" size={20} />
                        <h3 className="text-sm text-gray-500 poppins-regular">
                          Accepted by{" "}
                          <span className="font-semibold text-gray-900">
                            {order?.editedBy?.name}
                          </span>
                        </h3>
                      </article>
                      <article>
                        {order?.transferd && (
                          <div className="space-y-2">
                            <h3 className="bg-[#FF9C9C] text-sm text-[#8D0F16] poppins-regular p-1 pl-2">
                              Transferred:{" "}
                              <span className="font-semibold">
                                {order?.fromTable} → {order?.toTable}
                              </span>
                            </h3>
                          </div>
                        )}
                      </article>
                    </motion.div>
                  </AnimatePresence>
                </article>
                {/* Order Details */}
                <section className="overflow-hidden bg-white border border-t-0 border-gray-100 rounded-b-xl shadow-sm">
                  {order.cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex items-start gap-4 p-4",
                        index !== order.cart.length - 1 &&
                          "border-b border-gray-100",
                      )}
                    >
                      <div className="flex-shrink-0">
                        <MemoFoodType types={item.dish.dishTypes} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {item?.dish?.name}
                        </h4>
                        {item?.portion && (
                          <div className={"text-xs text-gray-500"}>
                            Portion: {item?.portion?.name}
                          </div>
                        )}
                        {item?.extras && item?.extras.length > 0 && (
                          <div className="text-xs mt-1 text-gray-500">
                            Extras:{" "}
                            {item.extras.map((extra, index) => (
                              <span key={extra.id}>
                                {extra.name}{" "}
                                {extra.quantity > 1
                                  ? `× ${extra.quantity}`
                                  : ""}
                                {index !== item.extras.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        )}
                        {item?.dish?.instruction?.length > 0 && (
                          <p className="inline-flex italic mt-1 gap-1 text-sm text-gray-500">
                            <span>⚠</span> {item?.dish?.instruction}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="px-2 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded">
                          × {item.quantity}
                        </div>
                        <p className="mt-1 text-base font-semibold text-gray-900">
                          {outletInfo?.currencySymbol}
                          {(
                            (item?.dish?.price || item?.portion?.price) *
                            item?.quantity
                          ).toFixed(2)}
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
                      <span className="text-base font-semibold text-gray-900">
                        {order.cart.reduce(
                          (acc, item) => acc + item.quantity,
                          0,
                        )}
                      </span>
                    </div>
                  </div>
                </section>
              </section>
            ))}
          </main>

          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white">
            <div className="p-2 text-center text-xs text-red-500 bg-red-50">
              Note: Some items modified will be shown in final bill.
            </div>
            <div className="flex items-stretch h-16 p-2 gap-2">
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
      ) : (
        <>
          <center className="h-full flex items-center justify-center">
            <figure>
              <Image src={order} alt="No orders" />
              <h1 className="text-xl font-semibold">No orders yet</h1>
            </figure>
          </center>
          <CommonBottomButton
            buttons={[{ text: "Back To Order More", onClick: handleBack }]}
          />
        </>
      )}
    </>
  );
};

const Orders = memo(MemoOrders);
export default Orders;
