import AlertToRemove from "@/components/atoms/alertToRemove";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import BottomButton from "@/components/molecules/bottomButton";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { DialogTitle } from "@headlessui/react";
import { type ChangeEvent, memo, useCallback, useState } from "react";
import { GoAlert } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

interface IAvailableCoinz {
  closeModal: () => void;
  handleApplyCoinz: (value: number) => void;
  setClaimAmount: number;
}

const AvailableCoinz = (props: IAvailableCoinz) => {
  const { closeModal, handleApplyCoinz, setClaimAmount } = props;
  const {
    billValue,
    userCoinz,
    claimedCoinz,
    claimCouponz,
    setClaimCouponz,
    isModalOpen,
  } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimedCoinz: s.claimedCoinz,
    claimCouponz: s.claimCouponz,
    setClaimCouponz: s.setClaimCouponz,
    userCoinz: s.userCoinz,
    isModalOpen: s.isModalOpen,
  }));

  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  const { showAlert, setShowAlert } = useCouponTemp((s) => ({
    showAlert: s.showAlert,
    setShowAlert: s.setShowAlert,
  }));
  const [tempClaimedCoinz, setTempClaimedCoinz] = useState(claimedCoinz);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    userCoinz: number,
  ) => {
    const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ""));
    const canClaimCoinz = Math.round(billValue * (setClaimAmount / 100) || 0);
    const coinsToSet = canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;
    if (userEnteredValue > coinsToSet) {
      setTempClaimedCoinz(coinsToSet);
    } else {
      setTempClaimedCoinz(userEnteredValue);
    }
  };

  // Update global state on button click
  const handleNextClick = useCallback(() => {
    if (claimCouponz > 0) {
      setShowAlert(true);
    } else {
      handleApplyCoinz(tempClaimedCoinz);
    }
  }, [setShowAlert, tempClaimedCoinz]);

  const replaceLoyalty = useCallback(() => {
    setClaimCouponz(0);
    setShowAlert(false);
    setAvailedCoupon({});
    toast.success("Coupon removed successfully");
    handleApplyCoinz(tempClaimedCoinz);
  }, [
    setClaimCouponz,
    setShowAlert,
    handleApplyCoinz,
    tempClaimedCoinz,
    setAvailedCoupon,
  ]);

  return (
    <>
      {showAlert ? (
        <AlertToRemove onClose={() => setShowAlert(false)} show>
          <DialogTitle
            as="h3"
            className="flex items-center justify-center mb-4 text-lg font-medium leading-6 text-gray-900"
          >
            <GoAlert className="w-12 h-12 mr-2 text-yellow-500" />
            Applying Coin removes the Coupon!
          </DialogTitle>
          <div className="mt-2">
            <p className="text-sm text-center text-gray-500">
              Are you sure you want to remove the coupon?
            </p>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#9267EC] border border-transparent rounded-md hover:bg-[#9267EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={replaceLoyalty}
            >
              <IoCheckmark className="w-4 h-4 mr-2" />
              Yes
            </button>
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#EC678D] border border-transparent rounded-md hover:bg-[#EC678D] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              onClick={() => setShowAlert(false)}
            >
              <RxCross2 className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </AlertToRemove>
      ) : (
        <BottomPopUp show={isModalOpen} onClose={closeModal}>
          <div className="h-[15rem] p-6 bg-white text-black overflow-hidden rounded-t-2xl">
            <h1 className="text-xl font-semibold">
              Available Coins :{" "}
              {claimedCoinz ? userCoinz - claimedCoinz : userCoinz}
            </h1>
            {tempClaimedCoinz > 0 ? (
              <p className="mt-1 text-xs">
                Max Coinz can claim upto {tempClaimedCoinz}
              </p>
            ) : null}
            <br />
            <input
              onChange={(e) => handleChange(e, userCoinz)}
              type="tel"
              value={tempClaimedCoinz}
              placeholder="Enter the coinz to apply"
              min={0}
              max={userCoinz}
              className="border border-[#000] pl-4 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-[1rem] min-w-389 min-w-[95%] my-auto !py-2 text-black"
            />
          </div>
          <BottomButton>
            <button
              type="button"
              className="w-full px-4 py-3 text-white bg-black rounded-full"
              onClick={handleNextClick}
            >
              Apply
            </button>
          </BottomButton>
        </BottomPopUp>
      )}
    </>
  );
};

const MemoAvailableCoinz = memo(AvailableCoinz);
export default MemoAvailableCoinz;
