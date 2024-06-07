import React from 'react';

function PaymentMode({ billData, paymentMethods, onMethodSelection, onContinue }) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState(null);

  const handlePaymentMethodSelection = (methodId: any) => {
    setSelectedPaymentMethod(methodId);
    if (onMethodSelection) {
      onMethodSelection(methodId);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className="text-base-content ml-6 mt-4 text-[1rem] font-[500] capitalize leading-[1.25rem]">Payment Mode</div>
        <div className="text-base-content mr-[7rem] mt-3 text-[1rem] font-[500] capitalize leading-[1.25rem]">
          ₹ {billData?.[billData.length - 1]?.Total}
        </div>
      </div>
      <div className="ml-6 mt-4">
        {paymentMethods &&
          paymentMethods.map((method: any) => (
            <div key={method.id} className="mt-2 flex items-center">
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
      <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
        <button type="button" className="text-base-100 bg-primary absolute bottom-3 left-6 mr-2  rounded-full px-4 py-2 text-base font-[500]">
          ₹ Payment Modes
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default PaymentMode;
