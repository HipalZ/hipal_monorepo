"use client";;
import { memo, useCallback, useState } from "react"
import { motion, LayoutGroup } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { useCartStore } from "@/components/store/useCartStore";
import { useCart } from "@/components/store/useCart"
import Image from "next/image";
import glassTable from "@/assets/cart/glassTable.png";
import MemoFoodType from "@/components/atoms/foodType";
import Happy from "@/assets/cart/Happy.png";
import { RiNewspaperLine, RiQrScan2Line } from "react-icons/ri";
import { BiRightArrow } from "react-icons/bi";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import order from "@/assets/call/order.png";
import CommonBottomButton from "@/components/atoms/bottomButton";

const MemoOrders = () => {
  const [expanded, setExpanded] = useState<string | null>(null)
  const { cartHistory } = useCartStore()
  const { setShowScan } = usePaymentStore()
  const { setCartPage, setShowCart } = useCart()

  const toggleAccordion = useCallback(
    (id: string) => {
      setExpanded(expanded === id ? null : id)
    },
    [expanded]
  )

  const handleBack = useCallback(() => {
    setShowCart(false)
  }, [setShowCart])

  const openScanAndPay = useCallback(() => {
    setShowScan(true);
  }, [setShowScan]);

  const handleConfirmBillPage = useCallback(() => {
    setCartPage("payment")
  }, [setCartPage]);


  if (cartHistory && cartHistory?.length === 0) return <>
    <center className="h-full flex items-center justify-center">
      <figure>
        <Image src={order} alt="order" />
        <h1 className="text-xl font-semibold">No orders yet</h1>
      </figure>
    </center>
    <CommonBottomButton buttons={
      [
        { text: "Back To Order More", onClick: handleBack },
      ]
    } />
  </>

  return (
    <div className="montserrat-400 flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 flex-none bg-white border-b border-black">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-medium">Final cart</h1>
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
                      <div className="flex-shrink-0">
                        <MemoFoodType types={item?.dish?.dishTypes} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between w-full items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-[#525252]">{item.dish.name}</h3>
                          {item?.portion?.name && (
                            <p className="text-sm text-[#B0B0B0] -ml-4">
                              {item?.portion?.name}
                            </p>
                          )}
                          {item?.extras?.length > 0 && (
                            <p className="text-sm text-[#B0B0B0] -ml-4">
                              {item.extras.map(e => e.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#B0B0B0]">Qty {item.quantity}</div>
                          <div className="font-medium">
                            ₹{(item.dish.price * item.quantity).toFixed(2)}
                          </div>
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
                  className="flex items-center justify-between p-4 border border-[#D9D9D9] mx-4 rounded-lg"
                >
                  <section className="flex items-center gap-3">
                    <figure className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
                      <Image src={Happy} alt="happy" />
                    </figure>
                    <h1 className="text-base font-medium">Orders by <strong>{cart.name}</strong></h1>
                  </section>
                  <button
                    type="button"
                    onClick={() => toggleAccordion(cart._id)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <p className="text-base font-semibold text-black">{cart.cart.length} Dishes</p>
                    <span className="float-right">View</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </LayoutGroup>

        {/* Extra space for bottom bar */}
        <div className="h-20" />
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        {/* Footer Note */}
        <div className="px-4 py-3 text-center text-sm text-red-500 bg-red-50">
          Note ! some items added later will added on final bill
        </div>
        <div className="flex items-stretch h-16 p-2 gap-2">
          <button
            onClick={handleBack}
            type="button"
            className="flex items-center justify-center px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex-1 flex items-stretch bg-[#008800] rounded-lg">
            <button
              onClick={handleConfirmBillPage}
              type="button"
              className="px-6 flex items-center justify-center text-white font-medium hover:bg-green-800"
            >
              <RiNewspaperLine /> Generate Final bill
              <BiRightArrow className="w-3 h-3 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Orders = memo(MemoOrders)
export default Orders

