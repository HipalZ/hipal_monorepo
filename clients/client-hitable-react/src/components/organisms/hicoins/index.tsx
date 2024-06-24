import { memo } from 'react';
import { BiShoppingBag } from 'react-icons/bi'; // Make sure to install 'react-icons' package

interface MobileNumberForCoinzProps {
  handlePhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsCoinzModalOpen: (value: boolean) => void;
  closeModal: () => void;
}

function MobileNumberForCoinz({ handlePhoneNumberChange, setIsCoinzModalOpen, closeModal }:MobileNumberForCoinzProps) {
  return (
    <div className="relative h-[25vh]">
      <div className="text-sm">
        <div className="mt-4 ml-6 text-sm font-semibold capitalize text-base-content">
          Please add mobile number for Hi Coinz
        </div>
        <div className="mt-1 ml-6 text-sm font-medium capitalize text-base-content opacity-60">
          Add user mobile number to claim Hi coinz
        </div>
        <div className="flex items-center mx-6 mt-6">
          <div className="px-4 py-2 text-base-100 bg-primary rounded-l-3xl">
            + 91
          </div>
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter your phone number"
            className="flex-grow px-3 py-[0.45rem] border border-primary rounded-r-3xl focus:outline-none"
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>

      <div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
        <button
          type="button"
          className="absolute px-4 text-base py-2 mr-2 font-[500] text-base-100 bg-primary rounded-full bottom-3 left-2"
        >
          <div className="flex items-center">
            <BiShoppingBag className="text-xl" />{" "}
            <span className="mt-1 ml-2">Hi Coinz added</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCoinzModalOpen(true);
            closeModal();
          }}
          className="absolute z-50 px-6 py-2 mr-2 text-sm font-semibold border rounded-full border-base-100 text-primary bg-base-100 right-6 bottom-3"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default memo(MobileNumberForCoinz);
