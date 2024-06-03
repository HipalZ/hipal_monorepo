import type { SettlePageTypes } from "@/components/organisms/settle";
import { useBusinessStore } from "@/components/store/useBusinessData";
import React, { useState } from "react";
import { toast } from "react-toastify";


type ApplyDiscountProps = {
  onClose: () => void;
  openModal: (str: SettlePageTypes) => void;
};

const ApplyDiscount: React.FC<ApplyDiscountProps> = ({
  onClose,
  openModal,
}) => {
  const [password, setPassword] = useState("");
  const businessData = useBusinessStore((s) => s.businessData);

  const handleApplyDiscount = () => {
    if (password.trim() === "") {
      toast.error("please enter password");
      return;
    }
    if (
      businessData?.serviceControl?.discountPassword.toString() === password
    ) {
      setPassword("");
      onClose();
      openModal("DISCOUNT");
      return;
    }
    return toast.error("password is wrong");
  };

  return (
    <div className="mx-6">
      <div className="mt-4 font-semibold">
        Please enter password to apply discount!
      </div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mt-4 border rounded-md"
        placeholder="Enter Password"
      />
      <div className="flex justify-between mt-6 pb-9">
        <button
        type="button"
          onClick={handleApplyDiscount}
          className="w-full px-6 py-3 text-sm bg-primary text-base-100 rounded-3xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ApplyDiscount;
