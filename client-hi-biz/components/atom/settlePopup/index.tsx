import {
  PAGE_TYPES,
  routePaths,
  routePathsWithIds,
} from "@/components/utils/routes";
import axios from '@/axios';
import { useRouter } from "next/router";
import React, { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}
interface SettlePopupProps {
  closeModal: () => void;
  selectedDuesIds: string[];
  selectedDuesTotal: number;
  paymentMethods: PaymentMethod[];
}

const SettlePopup: React.FC<SettlePopupProps> = ({
  closeModal,
  selectedDuesIds,
  selectedDuesTotal,
  paymentMethods,
}) => {
  const [paymentMode, setPaymentMode] = useState(""); // Set default payment mode to 'paytm'
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { businessId, duesPersonId } = router.query as {
    businessId: string;
    duesPersonId: string;
  };
  const handleSuggestionClick = (suggestion: string) => {
    setPaymentMode(suggestion);
  };
  const settleDues = async () => {
    if (!paymentMode || paymentMode.trim() === "") {
      return toast.error("Please select a payment mode");
    }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_HOST}/v1/payments/Settle/Dues`,
        {
          paymentIds: selectedDuesIds,
          mode: paymentMode,
        }
      );
      toast.success("Dues settled successfully");
      closeModal();
      router.push(routePathsWithIds[PAGE_TYPES.DUES](businessId, duesPersonId));
    } catch (error) {
      console.error("Error settling dues:", error);
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    inputRef.current?.addEventListener("focus", handleFocus);

    return () => {
      inputRef.current?.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem]">
      <h3 className="text-xl mb-2 font-medium text-[#2B354D]">
        Confirm payment of ₹ {selectedDuesTotal}
      </h3>

      <input
        ref={inputRef}
        type="text"
        value={paymentMode}
        onChange={(e) => setPaymentMode(e.target.value.toLowerCase())}
        className="border px-3 py-2 rounded mb-4 w-full focus:border focus:border-[#2B354D] focus:outline-none"
        placeholder="Enter Mode"
      />

      <span>Select payment mode</span>
      <div className="flex flex-wrap items-center justify-between gap-6 mt-4">
        {paymentMethods.map((method) => (
          <button
            type="button"
            key={method.id} // <-- Use the method's id for the key
            onClick={() => handleSuggestionClick(method.mode)}
            className={`font-medium text-sm px-3 on_active_bounce py-2 rounded-lg capitalize ${
              paymentMode === method.mode
                ? "bg-[#2B354D] text-white"
                : "bg-white text-[#2B354D]"
            }`}
          >
            {method.mode}
          </button>
        ))}
       
      </div>
      <button
        type="button"
        onClick={settleDues}
        className="w-full mt-6 mx-auto on_active_bounce text-white bg-[#2B354D] px-4 py-2 rounded-lg"
      >
        Pay ₹ {selectedDuesTotal}
      </button>
    </div>
  );
};

export default memo(SettlePopup);
