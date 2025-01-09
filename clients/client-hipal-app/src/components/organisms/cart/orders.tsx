"use client";

import { memo, useCallback, useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { RiNewspaperLine, RiQrScan2Line } from "react-icons/ri";
import { BiRightArrow } from "react-icons/bi";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/components/store/useCartStore";
import { useCart } from "@/components/store/useCart";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useLogin } from "@/components/store/useLogin";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useTableData from "@/components/store/useTableData";
import glassTable from "@/assets/cart/glassTable.png";
import Happy from "@/assets/cart/Happy.png";
import order from "@/assets/call/order.png";
import CommonBottomButton from "@/components/atoms/bottomButton";
import MemoFoodType from "@/components/atoms/foodType";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { apiRpc } from "@hi/common";

const MemoOrders = () => {
  // State and Store Hooks
  const [expanded, setExpanded] = useState<string | null>(null);
  const { cartHistory, setCartHistory } = useCartStore();
  const { setShowCart, cartPage, setCartPage } = useCart();
  const { setShowScan } = usePaymentStore();
  const userDetails = useLogin((state) => state.userDetails);
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const tableName = useTableData((state) => state.tableName);

  // Callbacks
  const toggleAccordion = useCallback(
    (id: string) => setExpanded(expanded === id ? null : id),
    [expanded],
  );

  const handleBack = useCallback(() => setShowCart(false), [setShowCart]);

  const openScanAndPay = useCallback(() => setShowScan(true), [setShowScan]);

  const handleConfirmBillPage = useCallback(() => setCartPage("payment"), [setCartPage]);

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
    <div className="montserrat-400 flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 flex-none bg-white border-b border-black">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-medium">Final Cart</h1>
          <div className="flex items-center gap-2 text-gray-600">
            {cartHistory[0]?.tableName && (
              <div className="text-sm text-gray-500 inline-flex items-center gap-1">
                <Image src={glassTable} alt="Table" />
                <span className="text-base">Table code {cartHistory[0]?.tableName}</span>
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
      <main className="flex-1 overflow-auto">
        <LayoutGroup>
          <motion.div layout className="divide-y">
            {cartHistory.map((cart) => (
              <div key={cart._id}>
                {cart.cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 border-b"
                  >
                    <div className="flex-shrink-0 w-5 h-5 my-1">
                      <MemoFoodType types={item?.dish?.dishTypes} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between w-full items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-[#525252]">{item.dish.name}</h3>
                          {item?.portion?.name && (
                            <p className="text-sm text-[#B0B0B0] -ml-4">{item?.portion?.name}</p>
                          )}
                          {item?.extras?.length > 0 && (
                            <p className="text-sm text-[#B0B0B0] -ml-4">{item.extras.map(e => e.name).join(", ")}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#B0B0B0]">Qty {item.quantity}</div>
                          <div className="font-medium">₹{(item.dish.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
            {/* Order Groups */}
            <div className="pt-4">
              {cartHistory.map((cart, index) => (
                <motion.div
                  key={cart._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center justify-between p-2 my-2 border border-[#D9D9D9] mx-4 rounded-lg"
                >
                  <section className="flex items-center gap-3">
                    <figure className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
                      <Image src={Happy} alt="happy" />
                    </figure>
                    <h1 className="text-sm font-medium w-[200px]">Orders by <strong>{cart.name}</strong></h1>
                  </section>
                  <button
                    type="button"
                    onClick={() => toggleAccordion(cart._id)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <p className="text-sm font-semibold text-black">{cart.cart.length} Dishes</p>
                    {/* <span className="float-right">View</span> */}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </LayoutGroup>
        <div className="h-20" />
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <div className="px-4 py-3 text-center text-sm text-red-500 bg-red-50">
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

const Orders = memo(MemoOrders)
export default Orders

