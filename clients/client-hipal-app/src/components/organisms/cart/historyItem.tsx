import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaUser, FaClock } from "react-icons/fa";
import {
  MdRestaurantMenu,
  MdLocalOffer,
  MdTableBar,
  MdAddIcCall,
} from "react-icons/md";
import {
  type ICartHistory,
  useCartStore,
} from "@/components/store/useCartStore";

const MemoHistoryCartItems = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { cartHistory } = useCartStore();

  const toggleAccordion = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <>
      <section className="w-full py-1 text-xs text-center bg-primary text-base-100">
        Once Order get accepted the history will get delete.
      </section>
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
              className="flex justify-between p-4 cursor-pointer text-base-content bg-base-200/[0.6]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-base-content">
                <h3 className="flex items-center text-xl font-medium">
                  <MdTableBar className="mr-2" /> {cart?.tableName}
                </h3>
                <p className="flex items-center mt-1 text-sm font-semibold opacity-50">
                  <FaUser className="mr-1" /> {cart?.userId?.name || "User"}
                </p>
                <p className="flex items-center mt-1 text-sm font-semibold opacity-50">
                  <MdAddIcCall className="mr-1" />{" "}
                  {cart?.userId?.phone || "User"}
                </p>
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
                    <FaChevronDown className="text-xl text-base-content" />
                  ) : (
                    <FaChevronUp className="text-xl text-base-content" />
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
                  className="overflow-hidden bg-gray-50"
                >
                  <div className="pt-4">
                    {cart?.cart?.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-4 bg-white border-b border-primary"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="flex items-center text-sm font-medium text-base-content">
                            <MdRestaurantMenu className="mr-2 text-primary" />
                            {item?.dish?.name}
                          </h4>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">
                              Qty: {item?.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="pl-7">
                          {item?.portion?.name && (
                            <p className="text-xs text-base-content">
                              portion: {item.portion.name}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 pl-7">
                          {item?.extras?.length > 0 && (
                            <div className="text-sm text-base-content">
                              <p className="font-medium">Extras:</p>
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
        <center className="mt-12 text-xl">No history found</center>
      )}
    </>
  );
};

const HistoryCartItems = memo(MemoHistoryCartItems);
export default HistoryCartItems;
