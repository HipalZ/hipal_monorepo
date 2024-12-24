import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { useCart } from "@/components/store/useCart";

const MemoPaymentAlert = ({ onClick }: { onClick: () => void }) => {
  const { setCartPage, setShowCart } = useCart();
  const proceedToPayment = () => {
    setCartPage("payment");
    onClick();
  };
  const shineVariants = {
    initial: { x: "-100%" },
    animate: { x: "100%" },
  };
  const orderMore = useCallback(() => {
    onClick();
    setShowCart(false);
  }, [setShowCart]);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md p-4 mx-4 mt-[15dvh] text-red-700 bg-red-100 border-l-4 border-red-500 rounded shadow-md"
      >
        <div className="flex items-center mb-2">
          <FaExclamationTriangle className="mr-2 text-red-500" />
          <h2 className="text-lg font-semibold">Warning: Order Finalization</h2>
        </div>
        <p className="mb-4">
          You and your friends won't be able to place any further orders if you
          proceed to payment.
        </p>
        <button
          type="button"
          onClick={proceedToPayment}
          className="relative w-full px-4 py-3 overflow-hidden text-base-100 bg-primary rounded-xl"
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            variants={shineVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 2,
              repeat: Infinity,
              // repeatDelay: 1,
              ease: "backInOut",
            }}
            style={{
              background: "var(--shine-effect)",
            }}
          />
          Continue to pay
        </button>
      </motion.div>
      <CommonBottomButton
        fixed
        buttons={[
          {
            text: "Order more",
            onClick: orderMore,
            type: "button",
          },
          // {
          //   text: "Continue",
          //   onClick: proceedToPayment,
          //   type: "button",
          // },
        ]}
      />
    </>
  );
};

const PaymentAlert = memo(MemoPaymentAlert);
export default PaymentAlert;
