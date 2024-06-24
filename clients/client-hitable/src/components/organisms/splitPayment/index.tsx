import { memo } from 'react';
import { toast } from 'react-toastify';

function SplitPaymentSelector({
  billData,
  paymentMethods,
  multiplePaymentMethods,
  handleMultiplePaymentMethodSelection,
  setIsSplitModalOpen,
  loading,
}) {
  return (
    <div className="relative min-h-[80vh]">
      <div className="mt-4 flex justify-between">
        <div className="text-base-content ml-6 font-[500] capitalize">select payment methods</div>
        <div className="text-base-content mr-[1.5rem] font-[500] capitalize">₹ {billData[billData.length - 1]?.Total}</div>
      </div>
      <div className="mx-6 mt-4 max-h-[70vh] space-y-4 overflow-y-auto pb-[7rem]">
        {paymentMethods
          .filter((method) => method?.mode !== 'dues' && method?.mode !== 'split payment' && method?.mode !== 'complimentary')
          .map((method) => (
            <div
              key={method.id}
              className={`flex items-center rounded-xl border px-4 py-2 ${multiplePaymentMethods.includes(method?.mode) ? 'border-primary' : ''}`}
              onClick={() => handleMultiplePaymentMethodSelection(method?.mode)}
              onKeyDown={() => handleMultiplePaymentMethodSelection(method?.mode)}
            >
              <input id={`method-${method.id}`} type="checkbox" checked={multiplePaymentMethods.includes(method?.mode)} />
              <label htmlFor={`method-${method.id}`} className="ml-4 line-clamp-1 font-medium capitalize">
                {method?.mode}
              </label>
            </div>
          ))}
      </div>

      <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
        <button
          type="button"
          onClick={() => {
            if (multiplePaymentMethods.length > 1) {
              setIsSplitModalOpen(true);
            } else {
              toast.error('Select at least 2 payment methods');
            }
          }}
          className={`border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500] ${
            loading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default memo(SplitPaymentSelector);
