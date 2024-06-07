import { memo } from 'react';

const PrintBillComponent = ({ sendPrintBill, closeModal }) => {
  return (
    <div className="relative mx-6 mt-6 pb-12">
      <div className="font-semibold">Print bill</div>
      <p className="text-sm opacity-70">Do you want print bill?</p>
      <button
        type="button"
        onClick={() => {
          sendPrintBill();
          closeModal();
        }}
        className="border-base-100 bg-primary text-base-100 absolute bottom-6 right-0 z-50 mr-2 rounded-full border px-6 py-2 text-sm font-[500]"
      >
        Print
      </button>
    </div>
  );
};

export default memo(PrintBillComponent);
