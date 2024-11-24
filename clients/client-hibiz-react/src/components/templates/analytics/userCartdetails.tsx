import { useState, memo, type FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaClock,
} from "react-icons/fa";
import { MdRestaurantMenu, MdAddIcCall } from "react-icons/md";
import PopUp from "@/components/atom/popUp";
import BottomButton from "@/components/atom/bottomButton";
import MemoizedHeader from "@/components/molecules/header";

interface CartItem {
  _id: string;
  dish: {
    name: string;
    price: number;
    description: string;
    images: string[];
  };
  portion: {
    name: string;
    price: number;
  } | null;
  quantity: number;
}

interface UserCart {
  _id: string;
  userId: { name: string; phone: string };
  tableName: string;
  cart: CartItem[];
  date: number;
}

const MemoCartPopup: FC<{ cartData: UserCart[]; onClose: () => void }> = ({
  cartData,
  onClose,
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <PopUp
      show={true}
      onClose={onClose}
      width="w-full"
      height="h-[100dvh] lg:h-[90dvh]"
      hide
    >
      <div className="h-[85lvh] overflow-auto pb-[7rem]">
        <article className="sticky top-0 z-50 bg-white">
          <MemoizedHeader
            onBack={onClose}
            title="User Cart Details"
            leftIcon={<FaArrowLeft />}
          />
        </article>
        <div className="grid items-start grid-cols-1 gap-4 m-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 auto-rows-min">
          {cartData.map((cart) => (
            <motion.div
              key={cart._id}
              layout
              className="overflow-hidden bg-white rounded-lg shadow-lg"
            >
              <motion.div
                onClick={() => toggleAccordion(cart._id)}
                className="flex justify-between p-4 cursor-pointer bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <h3 className="text-lg font-bold">{cart.tableName}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    <MdAddIcCall className="inline mr-1 text-indigo-500" />
                    {cart.userId.phone}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-gray-500">
                    <FaClock className="inline mr-1" />
                    {new Date(cart.date).toLocaleString()}
                  </p>
                  <motion.div>
                    {expanded === cart._id ? (
                      <FaChevronUp className="text-xl text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-xl text-gray-500" />
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
                    className="p-4 bg-gray-100"
                  >
                    <div className="space-y-4">
                      {cart.cart.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex p-4 bg-white rounded-lg shadow-md"
                        >
                          <img
                            src={item.dish.images[0]}
                            alt={item.dish.name}
                            className="object-cover w-16 h-16 mr-4 rounded-lg"
                          />
                          <div>
                            <h4 className="text-lg font-bold">
                              <MdRestaurantMenu className="inline mr-2 text-indigo-600" />
                              {item.dish.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {item.dish.description}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Price: ₹
                              {(
                                (item.portion?.price || item.dish.price) / 100
                              ).toFixed(2)}
                            </p>
                            <p className="text-sm font-semibold text-indigo-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <BottomButton
          buttons={[
            {
              text: "Close",
              onClick: onClose,
            },
          ]}
        />
      </div>
    </PopUp>
  );
};

const CartPopup = memo(MemoCartPopup);
export default CartPopup;
