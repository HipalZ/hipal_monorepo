import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import ConfettiHeader from "@/components/organisms/confettiHeader";
import CartFriend from "@/assets/cart/cartFriends.png";
import { MdPerson } from "react-icons/md";
import CallTheCaptain from "./callTheCaptain";
import { useCart } from "@/components/store/useCart";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useUserToken } from "@hi/common/src/useUserToken";

interface IValidate {
  placeOrder?: () => void;
  isOpenMyOrders?: boolean;
}

const MemoHiCodeValidate = (props: IValidate) => {
  const accessToken = useUserToken.getState().accessToken;
  const { placeOrder, isOpenMyOrders } = props;
  const { setShowCart, setCartPage, setHiCodePopupBeforeBill } = useCart();
  const {
    setHiCodePopup,
    hiCodeUser,
    setHiCode: saveInPersist,
    tableName,
  } = useTableData();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const userDetails = useLogin((state) => state.userDetails);
  const setDirection = useLogin((state) => state.setDirection);
  const { setCheckLogin } = usePaymentStore();
  const placeholders = ["C", "O", "D", "E"];
  // State to manage each digit of the HiCode
  const [hiCodeDigits, setHiCodeDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);

  // Handle input change for each box
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // Allow only digits
    const newDigits = [...hiCodeDigits];
    newDigits[index] = value;
    setHiCodeDigits(newDigits);

    // Auto focus to next box if a digit is entered
    if (value && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace to delete and move focus backward
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !hiCodeDigits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle the HiCode verification
  const handleCodeVerification = async () => {
    const hiCode = hiCodeDigits.join("");

    if (!accessToken) {
      setCheckLogin(true);
      return;
    }
    if (!hiCode.trim() || hiCode.length !== 4) {
      toast.error("Please enter a valid 4-digit HiCode.");
      setError(true);
      return;
    }

    try {
      const response = await apiRpc.pos.validate_hicode.$post({
        json: {
          hiCode,
          businessId: outletInfo?.businessId,
          customerPhone: userDetails?.phone || "",
        },
      });

      const result = await response.json();
      if (result.err) {
        throw new Error(result.err);
      }
      if (!result.err) {
        saveInPersist(result?.data?.hiCode);
        if (isOpenMyOrders && outletInfo?.isPosEnabled) {
          setDirection("category");
          setCartPage("order");
          setShowCart(true);
          setHiCodePopupBeforeBill(false);
          console.log("triggered here");
          return;
        }
        setHiCodePopup(false);
        placeOrder?.();
      } else {
        throw new Error("Invalid HiCode");
      }
    } catch (error) {
      console.error("Error validating HiCode:", error);
      toast.error("Invalid HiCode. Please try again.");
      setError(true);
    }
  };

  const maskPhoneNumber = useCallback((phone: string) => {
    return `${phone?.slice(0, 2)}****${phone.slice(-4)}`;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex flex-col items-center justify-center p-6 bg-white"
    >
      <ConfettiHeader direction="top" />
      <Image
        src={CartFriend}
        alt="cart-friend"
        width={300}
        height={135}
        className="mt-8"
      />
      {hiCodeUser?.phone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center"
        >
          <h3 className="mt-4 text-2xl font-bold text-gray-800 space-grotesk-700">
            Ordering with friends?
          </h3>
          <p className="text-sm text-gray-500">
            Your table{" "}
            <span className="text-lg font-semibold">{tableName}</span> is
            already occupied!
          </p>
          <div className="flex items-center gap-4 pl-2 mt-4 text-left text-[#000000]">
            <article className="bg-[#6A35FF30] p-2 rounded-xl">
              <MdPerson size={28} className="text-[#6A35FF]" />
            </article>
            <span className="text-sm text-gray-500">
              The table admin is{" "}
              <span className="text-base font-semibold">
                {hiCodeUser?.name}
              </span>{" "}
              with number {maskPhoneNumber(hiCodeUser?.phone)}
            </span>
          </div>
        </motion.div>
      ) : (
        <h3 className="mb-4 text-2xl font-bold text-gray-800 space-grotesk-700">
          Enter 4 Digit HiCode
        </h3>
      )}
      <div className="flex justify-center gap-4 mb-4">
        {hiCodeDigits.map((digit, index) => (
          <input
            key={index?.toString()}
            id={`digit-${index}`}
            type="text"
            value={digit}
            placeholder={placeholders[index]}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            maxLength={1}
            className="text-black w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none"
          />
        ))}
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full pt-2 text-red-600"
        >
          Please enter a valid 4-digit code
        </motion.div>
      )}
      <button
        type="button"
        onClick={handleCodeVerification}
        className="bg-[#008800] mb-4 w-full text-sm text-white px-4 py-3 rounded-md"
      >
        Continue
      </button>
      <CallTheCaptain />
    </motion.div>
  );
};

const HiCodeValidate = memo(MemoHiCodeValidate);
export default HiCodeValidate;
