import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useLogin } from "@/components/store/useLogin";
import useTableData from "@/components/store/useTableData";
import { apiRpc } from "@hi/common";
import CommonBottomButton from "@/components/atoms/bottomButton";
import { FaPhone } from "react-icons/fa";

const HiCodeValidate = ({ placeOrder }: { placeOrder: () => void }) => {
  const {
    setHiCodePopup,
    hiCodeUser,
    setHiCode: saveInPersist,
  } = useTableData();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const userDetails = useLogin((state) => state.userDetails);

  const [hiCode, setHiCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleCodeVerification = async () => {
    if (!hiCode.trim()) {
      toast.error("Please enter a HiCode.");
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

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
    } finally {
      setLoading(false);
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
      className="flex flex-col items-center justify-center p-6 bg-white"
    >
      {hiCodeUser.phone ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center"
        >
          <h3 className="mb-4 text-2xl font-bold text-gray-800 space-grotesk-700">
            Ask {hiCodeUser?.name} for the HiCode
          </h3>

          <div className="flex items-center justify-center text-primary">
            <FaPhone className="mr-2 text-primary" />
            <span className="text-lg">
              {maskPhoneNumber(hiCodeUser?.phone)}
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
            className="absolute top-[90%] pt-4 transform -translate-x-1/2  text-primary left-1/2 w-full"
          >
            Please enter a valid HiCode
          </motion.div>
        )}
      </div>
      {hiCodeUser.phone && (
        <section
          style={{
            borderRadius: "5px 20px 5px",
          }}
          className="p-4 text-sm text-center bg-primary text-base-100"
        >
          <h3>Hicode present in the {hiCodeUser?.name} cart</h3>
        </section>
      )}
      <CommonBottomButton
        fixed
        buttons={[
          {
            text: "Validate",
            onClick: handleCodeVerification,
            isLoading: loading,
            disable: loading,
          },
        ]}
      />
    </motion.div>
  );
};

export default HiCodeValidate;
