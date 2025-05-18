import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaUser, FaClock } from "react-icons/fa";
import {
  MdRestaurantMenu,
  MdLocalOffer,
  MdTableBar,
  MdAddIcCall,
} from "react-icons/md";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useDeleteCart } from "@/components/hooks/useCartApi";
import CreateBillButton from "./cartWithBillButton";

const MemoCartwithoutPos = () => {
  const { cartData, removeCart, setCartCount } = useLiteStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const { deleteCart } = useDeleteCart();

  const toggleAccordion = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const removeCartFn = (id: string) => {
    removeCart(id);
    deleteCart(id);
    setCartCount((prev) => prev - 1);
  };
  return (
    <>
      {cartData && cartData?.length > 0 ? (
        cartData.map((cart) => (
          <motion.div
            key={cart._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="self-start overflow-hidden bg-white rounded-lg shadow-lg"
          >
            <motion.div
              onClick={() => toggleAccordion(cart._id)}
              className="flex justify-between p-4 text-black bg-white cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-black">
                <h3 className="flex items-center text-xl font-bold">
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
                    {new Date(cart?.date).toLocaleDateString("en-In")}
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
                    <FaChevronDown className="text-xl text-black" />
                  ) : (
                    <FaChevronUp className="text-xl text-black" />
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
                  className="px-4 overflow-hidden bg-gray-50"
                >
                  <div className="pt-4 space-y-4">
                    {cart?.cart?.map((item) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-4 bg-white rounded-lg shadow-md"
                      >
                        <h4 className="flex items-center text-lg font-bold text-gray-800">
                          <MdRestaurantMenu className="mr-2 text-indigo-600" />
                          {item?.dish?.name}
                        </h4>
                        {item?.portion?.name && (
                          <p className="flex items-center mt-2 text-sm text-gray-600">
                            <MdLocalOffer className="mr-1 text-green-500" />
                            Portion: {item.portion.name}
                          </p>
                        )}
                        {item?.extras?.length > 0 && (
                          <p className="mt-1 text-sm text-gray-600">
                            Extras:{" "}
                            {item.extras.map((extra) => (
                              <p
                                key={extra.id}
                                className="flex items-center text-sm text-gray-600"
                              >
                                <MdLocalOffer className="mr-1 text-green-500" />
                                {extra.name}: {extra.quantity} x ${extra.price}
                              </p>
                            ))}
                          </p>
                        )}

                        <p className="mt-2 text-sm font-semibold text-indigo-600">
                          Quantity: {item?.quantity}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={() => removeCartFn(cart._id)}
                    className="w-[100%] mt-4 mb-4 px-4 py-2 text-white bg-red-600 rounded-xl"
                    type="button"
                  >
                    remove
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      ) : (
        <motion.div
          className="text-2xl font-semibold text-center col-span-full text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No Cart Found
        </motion.div>
      )}
      <CreateBillButton />
    </>
  );
};

const CartwithoutPos = memo(MemoCartwithoutPos);
export default CartwithoutPos;
