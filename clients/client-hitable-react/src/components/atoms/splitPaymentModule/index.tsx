import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SplitPaymentModalProps {
  splitFinalClick: (data:PaymentBreakdown) => void;
  billAmount: number;
  selectedMethods: string[];
}

interface PaymentBreakdown {
  [method: string]: number;
}

const SplitPaymentModal = ({
  billAmount,
  selectedMethods,
  splitFinalClick,
}:SplitPaymentModalProps):JSX.Element => {
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown>(
    {}
  );

  useEffect(() => {
    const initialAmount = billAmount / selectedMethods.length;
    const initialBreakdown: PaymentBreakdown = selectedMethods.reduce(
      (acc, method) => {
        acc[method] = Math.round(initialAmount * 100) / 100;
        return acc;
      },
      {} as PaymentBreakdown
    );
    setPaymentBreakdown(initialBreakdown);
  }, [selectedMethods, billAmount]);

  const handleInputChange = (method: string, value: string) => {
    const inputAmount = Number(value);

    if (inputAmount > billAmount) {
      toast.error(`Amount cannot be greater than bill amount (${billAmount})`);
      return;
    }

    const updatedBreakdown = { ...paymentBreakdown };

    updatedBreakdown[method] = inputAmount;

    let remainingAmount = billAmount - inputAmount;

    selectedMethods.forEach((m) => {
      if (m !== method) {
        if (remainingAmount >= billAmount / selectedMethods.length) {
          updatedBreakdown[m] = remainingAmount / (selectedMethods.length - 1);
        } else {
          updatedBreakdown[m] = Math.min(
            remainingAmount,
            billAmount / selectedMethods.length
          );
          remainingAmount -= updatedBreakdown[m];
        }
      }
    });

    Object.keys(updatedBreakdown).forEach((key) => {
      updatedBreakdown[key] = Math.round(updatedBreakdown[key] * 100) / 100;
    });

    setPaymentBreakdown(updatedBreakdown);
  };


  return (
    <div className="p-6">
      <div className="flex justify-between pb-6 font-medium capitalize">
        <div>split payment</div>
        <div>₹ {billAmount?.toFixed(2)}</div>
      </div>
      <div className="pb-6 space-y-4">
        {selectedMethods.map((method) => (
          <div key={method} className="flex flex-col">
            <label className="pb-2 font-medium capitalize">{method}</label>
            <input
              type="number"
              value={paymentBreakdown[method] || 0}
              onChange={(e) => handleInputChange(method, e.target.value)}
              className="w-full rounded-2xl border border-[#79747E] p-2 pl-4 focus:outline-none focus:ring-0"
            />
          </div>
        ))}
      </div>

      <div className="flex items-end justify-end">
        {" "}
        <button
          className="w-[40%] py-2 rounded-full bg-primary text-base-100"
          onClick={()=>splitFinalClick(paymentBreakdown)}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default SplitPaymentModal;
