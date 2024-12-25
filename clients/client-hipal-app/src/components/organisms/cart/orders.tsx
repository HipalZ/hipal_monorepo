import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaUser, FaClock } from "react-icons/fa";
import { MdRestaurantMenu, MdLocalOffer, MdTableBar } from "react-icons/md";
import {
  type ICartHistory,
  useCartStore,
} from "@/components/store/useCartStore";
import { BiMoney } from "react-icons/bi";

const MemoOrders = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { cartHistory } = useCartStore();

  const toggleAccordion = useCallback(
    (id: string) => {
      setExpanded(expanded === id ? null : id);
    },
    [expanded],
  );

  const calculateCartTotal = useCallback((cart) => {
    if (!cart?.cart) return 0;
    return cart.cart.reduce((total, item) => {
      const portionPrice = item?.portion?.price ?? item?.dish?.price ?? 0;
      const extrasPrice =
        item?.extras?.reduce((extraTotal, extra) => {
          return extraTotal + extra.price * extra.quantity;
        }, 0) ?? 0;
      const itemTotalPrice = (portionPrice + extrasPrice) * item?.quantity;
      return total + itemTotalPrice;
    }, 0);
  }, []);
  return (
    <div>
      {cartHistory && cartHistory.length > 0 ? (
        cartHistory.map((cart: ICartHistory) => (
          <motion.div
            key={cart._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="self-start mt-4 overflow-hidden rounded-lg shadow-lg"
          >
            <motion.div
              onClick={() => toggleAccordion(cart._id)}
              className="flex justify-between p-4 bg-white cursor-pointer text-[#000000]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-[#000000]">
                <h3 className="flex items-center text-xl font-medium">
                  <MdTableBar className="mr-2" /> {cart?.tableName}
                </h3>
                <p className="flex items-center mt-1 text-sm font-semibold opacity-50">
                  <FaUser className="mr-1" /> {cart?.name || "User"}
                </p>
                {/* <p className="flex items-center mt-1 text-sm font-semibold opacity-50">
                  <BiMoney className="mr-1" />
                  Total: ₹{calculateCartTotal(cart).toFixed(2)}
                </p> */}
              </div>
              <div className="text-right">
                <div className="flex flex-col items-end mb-2 text-sm font-semibold opacity-80">
                  <p className="flex items-center">
                    <FaClock className="mr-1" />
                    {new Date(cart?.date).toLocaleDateString("en-GB")}
                  </p>
                  <p className="flex items-center mt-1 opacity-50">
                    {new Date(cart?.date).toLocaleTimeString()}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {expanded === cart._id ? (
                    <FaChevronDown className="text-xl text-[#000000]" />
                  ) : (
                    <FaChevronUp className="text-xl text-[#000000]" />
                  )}
                </motion.div>
              </div>
            </motion.div>

            <AnimatePresence>
              {expanded === cart._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-[#ffffff]"
                >
                  <div className="pb-2">
                    {cart?.cart?.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-4 py-2 bg-[#ffffff]"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="flex items-start flex-1 text-sm font-semibold opacity-80 text-[#000000]">
                            <MdRestaurantMenu className="mr-2 text-[#000000]" />
                            {item?.dish?.name}
                          </h4>
                          <div className="text-right flex-2">
                            <p className="text-sm font-semibold text-[#000000]">
                              Qty: {item?.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="pl-7">
                          {item?.portion?.name && (
                            <p className="text-xs text-[#000000]">
                              portion: {item.portion.name}
                            </p>
                          )}
                        </div>
                        <div className=" pl-7">
                          {item?.extras?.length > 0 && (
                            <div className="text-sm text-[#000000]">
                              <p className="text-xs font-medium">Extras:</p>
                              {item.extras.map((extra) => (
                                <p
                                  key={extra.id}
                                  className="flex items-center text-xs"
                                >
                                  <MdLocalOffer className="mr-1 text-green-500" />
                                  {extra.name}: {extra.quantity} x ₹
                                  {extra.price}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      ) : (
        <center className="mt-12 text-xl">No Order found</center>
      )}
    </div>
  );
};

const Orders = memo(MemoOrders);
export default Orders;
