"use client";;
import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { RiNewspaperLine, RiQrScan2Line } from "react-icons/ri";
import { BiRightArrow, BiChevronDown, BiChevronUp } from "react-icons/bi";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/components/store/useCartStore";
import { useCart } from "@/components/store/useCart";
import { useLogin } from "@/components/store/useLogin";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useTableData from "@/components/store/useTableData";
import glassTable from "@/assets/cart/glassTable.png";
import order from "@/assets/call/order.png";
import CommonBottomButton from "@/components/atoms/bottomButton";
import MemoFoodType from "@/components/atoms/foodType";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { apiRpc } from "@hi/common";
import { usePaymentStore } from "@/components/store/usePaymentStore";

const MemoOrders = () => {
  const { cartHistory, setCartHistory } = useCartStore();
  const { setShowCart, cartPage, setCartPage } = useCart();
  const [expanded, setExpanded] = useState<string[]>(
    cartHistory.map((cart) => cart._id)
  );
  const { setShowScan } = usePaymentStore();
  const userDetails = useLogin((state) => state.userDetails);
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);
  const handleBack = useCallback(() => setShowCart(false), [setShowCart]);
  const openScanAndPay = useCallback(() => setShowScan(true), [setShowScan]);

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
      query: { businessId: outletInfo?.businessId || "", tableName },
    });
    const res = await response.json();
    setCartHistory(res.data);
    return res;
  };

  // Query for POS orders
  const { isLoading: isLoadingPos } = useQuery({
    queryKey: ["pos", userDetails?._id, outletInfo?.businessId, tableName],
    queryFn: getOrderFromPos,
    enabled: cartPage === "order",
    staleTime: 1000 * 30,
  });

  // Loading Spinner
  if (isLoadingPos) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinnerCircle />
      </div>
    );
  }

  // No Orders State
  if (!cartHistory?.length) {
    return (
      <>
        <center className="h-full flex items-center justify-center">
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="poppins-regular sticky top-0 flex-none bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-medium">Final Cart</h1>
          <div className="flex items-center gap-2 text-gray-600">
            {cartHistory[0]?.tableName && (
              <div className="text-sm text-gray-500 inline-flex items-center gap-1">
                <Image src={glassTable} alt="Table" className="pb-1" />
                <span className="text-base">Table {cartHistory[0]?.tableName}</span>
              </div>
            )}
          </div>
          <article onKeyDown={openScanAndPay} onClick={openScanAndPay} className="relative inline-block">
            <RiQrScan2Line size={36} />
            <span className="absolute -top-1 -right-1 block w-3 h-3 bg-green-600 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 block w-3 h-3 bg-green-600 rounded-full" />
          </article>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 pb-[5rem] overflow-auto">
        <AnimatePresence>
          {cartHistory.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2"
            >
              {/* User Header */}
              <div
                className="poppins-regular flex items-center justify-between h-16 p-2 bg-white border rounded-t-lg cursor-pointer"
                onClick={() => toggleAccordion(order._id)}
                onKeyDown={() => toggleAccordion(order._id)}
              >
                <section className="flex items-center gap-3">
                  <FaUser size={24} />
                  <h1 className="text-base font-normal w-[12rem]">
                    Orders by <strong className="text-black font-semibold">{order.name}</strong>
                  </h1>
                </section>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-black">{order.cart.length} Dishes</p>
                  {expanded.includes(order._id) ? <BiChevronUp size={20} /> : <BiChevronDown size={20} />}
                </div>
              </div>

              {/* Dishes */}
              <div className="border-b shadow-sm bg-white border-x rounded-b-lg">
                {expanded.includes(order._id) &&
                  order.cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-4"
                    >
                      <MemoFoodType types={item.dish.dishTypes} />
                      <div className="flex-1">
                        <h3 className="poppins-regular font-medium text-black">{item.dish.name}</h3>
                        {item.portion && <p className="text-sm italic text-black">{item.portion.name}</p>}
                        {item.extras.length > 0 && (
                          <p className="text-sm !italic text-black">{item.extras.map((e) => e.name).join(", ")}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-black">Qty: {item.quantity}</p>
                        <p className="font-medium">₹{(item.dish.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="p-2 text-center text-xs text-red-500 bg-red-50">
          Note: Some items added later will be added to the final bill.
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
  );
};

const Orders = memo(MemoOrders);
export default Orders
