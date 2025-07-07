"use client";

import dynamic from "next/dynamic";
import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaRegCheckCircle } from "react-icons/fa";
import { Trash2, EyeOff, User, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useParams, useRouter } from "next/navigation";

const OrdersHeader = dynamic(() => import("./headerOrders"));
const SwipeToPlaceOrder = dynamic(() => import("./swipeToPlaceOrder"));

const MemoOrders = () => {
  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const { cartHistory, setCartHistory } = useCartStore();
  const { setShowCart, cartPage, setCartPage } = useCart();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showDeletedOnly, setShowDeletedOnly] = useState(false);

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

  const handleConfirmBillPage = useCallback(() => {
    router.push(`/${customLink}/payment`);
  }, [setCartPage, customLink]);

  // Check if there are any deleted items globally
  const hasDeletedItems = useMemo(() => {
    return (
      cartHistory?.some((order) => order.cart.some((item) => item.isDeleted)) ||
      false
    );
  }, [cartHistory]);

  // Filter orders based on deleted items visibility
  const filteredOrders = useMemo(() => {
    if (!cartHistory) return [];

    if (showDeletedOnly) {
      return cartHistory.filter((order) =>
        order.cart.some((item) => item.isDeleted),
      );
    }

    return cartHistory;
  }, [cartHistory, showDeletedOnly]);

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
    console.log("this is res", res.data);

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

          {/* Deleted Items Filter Button */}
          {hasDeletedItems && (
            <div className="px-3 py-2 bg-white border-b border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center gap-2 ${
                  showDeletedOnly
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setShowDeletedOnly((prev) => !prev)}
              >
                {showDeletedOnly ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Show All Orders
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Show Only Orders with Deleted Items
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Scrollable Content */}
          <main className="flex-1 pb-20 overflow-auto bg-gray-50/50 hide-scrollbar">
            {filteredOrders.length === 0 && showDeletedOnly ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Trash2 className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  No Orders with Deleted Items
                </h3>
                <p className="text-sm">All items in your orders are active.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                // Count deleted items in this order
                const deletedItemsCount = order.cart.filter(
                  (item) => item.isDeleted,
                ).length;
                const totalItemsCount = order.cart.length;

                return (
                  <section
                    key={order._id}
                    className="px-3 py-2 max-w-3xl mx-auto"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-[#008800] ml-3">
                        ✔ ✔ Order Accepted
                      </h1>
                      {deletedItemsCount > 0 && (
                        <Badge variant="destructive" className="mr-3">
                          {deletedItemsCount} deleted item
                          {deletedItemsCount !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

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
                            src={celebration || "/placeholder.svg"}
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
                      {order.cart.map((item, index) => {
                        const isItemDeleted = item.isDeleted;
                        const itemContainerClasses = isItemDeleted
                          ? "bg-red-50 border-l-4 border-l-red-400"
                          : "";
                        const itemTextClasses = isItemDeleted
                          ? "line-through text-red-700 opacity-75"
                          : "";

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "flex items-start gap-4 p-4",
                              index !== order.cart.length - 1 &&
                                "border-b border-gray-100",
                              itemContainerClasses,
                            )}
                          >
                            <div className="flex-shrink-0">
                              <MemoFoodType types={item.dish.dishTypes} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={cn(
                                    "text-base font-medium truncate",
                                    itemTextClasses || "text-gray-900",
                                  )}
                                >
                                  {item?.dish?.name}
                                </h4>
                                {isItemDeleted && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Deleted
                                  </Badge>
                                )}
                              </div>

                              {item?.portion && (
                                <div
                                  className={cn(
                                    "text-xs text-gray-500",
                                    itemTextClasses,
                                  )}
                                >
                                  Portion: {item?.portion?.name}
                                </div>
                              )}

                              {item?.extras && item?.extras.length > 0 && (
                                <div
                                  className={cn(
                                    "text-xs mt-1 text-gray-500",
                                    itemTextClasses,
                                  )}
                                >
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
                                <p
                                  className={cn(
                                    "inline-flex italic mt-1 gap-1 text-sm text-gray-500",
                                    itemTextClasses,
                                  )}
                                >
                                  <span>⚠</span> {item?.dish?.instruction}
                                </p>
                              )}

                              {/* Deletion Details */}
                              {isItemDeleted && (
                                <div className="mt-2 p-2 bg-red-100 rounded-md text-xs text-gray-800">
                                  <div className="flex items-center gap-1 mb-1">
                                    <User className="h-3 w-3 text-gray-600" />
                                    <span className="font-medium">
                                      Deleted by:
                                    </span>
                                    <span>{item.deletedBy || "Unknown"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3 text-gray-600" />
                                    <span className="font-medium">Reason:</span>
                                    <span>
                                      {item.reasonOfDeletion ||
                                        "No reason provided"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div
                                className={cn(
                                  "px-2 py-1 text-sm font-medium rounded",
                                  isItemDeleted
                                    ? "text-red-600 bg-red-100 line-through"
                                    : "text-gray-600 bg-gray-50",
                                )}
                              >
                                × {item.quantity}
                              </div>

                              <p
                                className={cn(
                                  "mt-1 text-base font-semibold",
                                  itemTextClasses || "text-gray-900",
                                )}
                              >
                                {outletInfo?.currencySymbol}
                                {(
                                  (item?.dish?.price || item?.portion?.price) *
                                  item?.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Order Summary */}
                      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">
                            Total Items
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-gray-900">
                              {order.cart.reduce(
                                (acc, item) => acc + item.quantity,
                                0,
                              )}
                            </span>
                            {deletedItemsCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                ({deletedItemsCount} deleted)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>
                  </section>
                );
              })
            )}
          </main>

          {/* Bottom Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white">
            <div className="flex h-16 p-2 gap-2">
              <button
                onClick={handleBack}
                type="button"
                className="flex items-center justify-center px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <SwipeToPlaceOrder placeOrder={handleConfirmBillPage} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <center className="h-full flex items-center justify-center">
            <figure>
              <Image src={order || "/placeholder.svg"} alt="No orders" />
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
