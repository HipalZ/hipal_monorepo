import Loader from '@/components/atoms/loader';

const PaymentModeSelector = ({
  billData,
  loading,
  paymentMethods,
  selectedPaymentMethod,
  handlePaymentMethodSelection,
  handleAmountChange,
  changeToGiveBack,
  finalClick,
}) => {
  return (
    <div className="relative min-h-[70vh]">
      <div className="mt-4 flex justify-between">
        <div className="text-base-content ml-6 font-[500] capitalize">Payment Mode</div>
        <div className="text-base-content mr-[1.5rem] font-[500] capitalize">₹ {billData.Total}</div>
      </div>
      {loading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className="mx-6 mt-4 max-h-[70vh] space-y-4 overflow-y-auto pb-[7rem]">
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <div className="flex items-center rounded-xl border px-4 py-2" onClick={() => handlePaymentMethodSelection(method?.mode)}>
                <input
                  id={`method-${method.id}`}
                  type="checkbox"
                  value={selectedPaymentMethod}
                  checked={selectedPaymentMethod.split('_').join(' ').toLowerCase() === method?.mode}
                />
                <div className="ml-4 line-clamp-1 font-medium capitalize">{method?.mode}</div>
              </div>

              {selectedPaymentMethod.split('_').join(' ').toLowerCase() === method?.mode && method?.mode === 'cash' && (
                <div className="mt-2 flex flex-col space-y-2">
                  <div className="flex items-center justify-between space-x-4">
                    <label className="flex flex-col">
                      <span className="mb-2 mt-2 text-sm font-medium">Cash In</span>
                      <input
                        type="text"
                        placeholder="Enter amount"
                        className="rounded-xl border px-3 py-2 focus:outline-none"
                        onChange={handleAmountChange}
                      />
                    </label>
                    <label className="flex w-full flex-col">
                      <span className="mb-2 mt-2 text-sm font-medium">Cash Out</span>
                      <div className="w-full rounded-lg border px-4 py-2">₹ {changeToGiveBack > 0 ? changeToGiveBack : 0}</div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
        <button type="button" className="text-base-100 bg-primary absolute bottom-3 left-2 rounded-full px-4 py-2 text-base font-[500]">
          ₹ Payment Modes
        </button>
        <button
          type="button"
          onClick={finalClick}
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
};

export default PaymentModeSelector;
