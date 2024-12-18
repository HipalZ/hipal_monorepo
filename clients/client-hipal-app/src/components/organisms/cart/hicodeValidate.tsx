import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import ConfettiHeader from "@/components/organisms/confettiHeader";
import CartFriend from "@/assets/cart/cartFriends.png";
import Image from "next/image";
import { MdPerson } from "react-icons/md";
import CallTheCaptain from "./callTheCaptain";

const HiCodeValidate = ({ placeOrder }: { placeOrder: () => void }) => {
  const {
    setHiCodePopup,
    hiCodeUser,
    setHiCode: saveInPersist,
    tableName,
  } = useTableData();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const userDetails = useLogin((state) => state.userDetails);

  const [hiCode, setHiCode] = useState("");
  const [error, setError] = useState(false);

  const handleCodeVerification = async () => {
    if (!hiCode.trim()) {
      toast.error("Please enter a HiCode.");
      setError(true);
      return;
    }

    try {
      const response = await apiRpc.pos.validate_hicode.$post({
        json: {
          hiCode: hiCode,
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
        setHiCodePopup(false);
        placeOrder();
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
      <ConfettiHeader />
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
            Ordering with friends ?
          </h3>
          <p className="text-sm text-gray-500">
            Your table{" "}
            <span className="text-lg font-semibold">{tableName}</span> is
            already occupied !
          </p>
          <div className="flex items-center gap-4 pl-2 mt-4 text-left text-primary">
            <article className="bg-[#6A35FF30] p-2 rounded-xl">
              <MdPerson size={28} className=" text-[#6A35FF]" />
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
      <div className="relative w-full mb-4 text-center">
        <input
          type="text"
          value={hiCode}
          onChange={(e) => {
            setHiCode(e.target.value);
            setError(false);
          }}
          required
          maxLength={4}
          placeholder="Enter Code"
          className={`w-1/2 px-4 py-2 space-grotesk-700 bg-base-100 text-center text-primary border border-primary rounded-md focus:outline-none transition-all duration-300 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full pt-2 text-red-600 "
          >
            Please enter a valid Code
          </motion.div>
        )}
      </div>
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

export default HiCodeValidate;
