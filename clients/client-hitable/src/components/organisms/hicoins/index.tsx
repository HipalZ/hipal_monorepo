import { memo } from 'react';
import { BiShoppingBag } from 'react-icons/bi'; // Make sure to install 'react-icons' package

function MobileNumberForCoinz({ handlePhoneNumberChange, setIsCoinzModalOpen, closeModal }) {
  return (
    <div className="relative h-[25vh]">
      <div className="text-sm">
        <div className="text-base-content ml-6 mt-4 text-sm font-semibold capitalize">Please add mobile number for Hi Coinz</div>
        <div className="text-base-content ml-6 mt-1 text-sm font-medium capitalize opacity-60">Add user mobile number to claim Hi coinz</div>
        <div className="mx-6 mt-6 flex items-center">
          <div className="text-base-100 bg-primary rounded-l-3xl px-4 py-2">+ 91</div>
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter your phone number"
            className="border-primary flex-grow rounded-r-3xl border px-3 py-[0.45rem] focus:outline-none"
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>

      <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
        <button type="button" className="text-base-100 bg-primary absolute bottom-3 left-2 mr-2 rounded-full px-4 py-2 text-base font-[500]">
          <div className="flex items-center">
            <BiShoppingBag className="text-xl" /> <span className="ml-2 mt-1">Hi Coinz added</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCoinzModalOpen(true);
            closeModal();
          }}
          className="border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-6 py-2 text-sm font-semibold"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default memo(MobileNumberForCoinz);
