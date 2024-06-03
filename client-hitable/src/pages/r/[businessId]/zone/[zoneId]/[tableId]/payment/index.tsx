import React from "react";

function PaymentMode({
  billData,
  paymentMethods,
  onMethodSelection,
  onContinue,
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState(null);

  const handlePaymentMethodSelection = (methodId: any) => {
    setSelectedPaymentMethod(methodId);
    if (onMethodSelection) {
      onMethodSelection(methodId);
    }
  };
 
  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="capitalize font-[500] ml-6 mt-4 text-base-content text-[1rem] leading-[1.25rem]">
          Payment Mode
        </div>
        <div className="capitalize font-[500] mr-[7rem] mt-3 text-base-content text-[1rem] leading-[1.25rem]">
          ₹ {billData?.[billData.length - 1]?.Total}
        </div>
      </div>
      <div className="mt-4 ml-6">
        {paymentMethods && paymentMethods.map((method:any) => (
          <div key={method.id} className="flex items-center mt-2">
            <input
              type="checkbox"
              value="0"
              checked={selectedPaymentMethod === method?.id}
              onChange={() => handlePaymentMethodSelection(method?.id)}
            />
            <label className="ml-2 line-clamp-1">{method?.name}</label>
          </div>
        ))}
      </div>
      <div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
        <button type="button" className="absolute px-4 text-base py-2 mr-2 font-[500]  text-base-100 bg-primary rounded-full bottom-3 left-6">
          ₹ Payment Modes
        </button>
        <button
        type="button"
          onClick={onContinue}
          className="absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default PaymentMode;
