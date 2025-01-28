import AlertToRemove from "@/components/atoms/alertToRemove";
import CommonBottomButton from "@/components/atoms/bottomButton";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { DialogTitle } from "@headlessui/react";
import confetti from "canvas-confetti";
import { type ChangeEvent, memo, useCallback, useState } from "react";
import { GoAlert } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

const AvailableCoinz = () => {
  const {
    billValue,
    userCoinz,
    claimedCoinz,
    claimCouponz,
    setClaimCouponz,
    setClaimedCoinz,
    isModalOpen,
    setIsModalOpen,
  } = usePaymentStore();

  const { loyaltySetting } = useLoyaltyData();

  const handleApplyCoinz = useCallback(
    (finalValue: number) => {
      setClaimedCoinz(finalValue);
      handleCoins(finalValue);
    },
    [setClaimedCoinz],
  );

  const handleCoins = useCallback(async (claimedCoinz: number) => {
    // if has claim coinz then celebrate
    setIsModalOpen(false);
    if (claimedCoinz !== null && claimedCoinz > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      let audio: HTMLAudioElement;
      audio = new Audio("/sounds/Money.mp3");
      audio.play();
      return () => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    }
  }, [setIsModalOpen]);

  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  const { showAlert, setShowAlert } = useCouponTemp((s) => ({
    showAlert: s.showAlert,
    setShowAlert: s.setShowAlert,
  }));
  const [tempClaimedCoinz, setTempClaimedCoinz] = useState<number | null>(claimedCoinz || null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    userCoinz: number,
  ) => {
    const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ""));
    const canClaimCoinz = Math.round(billValue * (loyaltySetting?.setClaimedPercentage / 100) || 0);
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
      handleApplyCoinz(tempClaimedCoinz || 0);
    }
  }, [setShowAlert, tempClaimedCoinz, handleApplyCoinz, claimCouponz]);

  const replaceLoyalty = useCallback(() => {
    setClaimCouponz(0);
    setShowAlert(false);
    setAvailedCoupon({});
    toast.success("Coupon removed successfully");
    handleApplyCoinz(tempClaimedCoinz || 0);
  }, [
    setClaimCouponz,
    setShowAlert,
    handleApplyCoinz,
    tempClaimedCoinz,
    setAvailedCoupon,
  ]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

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
        <BottomPopUp height="40dvh" show={isModalOpen} onClose={closeModal}>
          <div className="h-[15rem] p-4 bg-white text-black overflow-hidden rounded-t-2xl">
            <h1 className="text-xl font-semibold">
              Available Coins :{" "}
              {claimedCoinz ? userCoinz - claimedCoinz : userCoinz}
            </h1>
            <br />
            <input
              onChange={(e) => handleChange(e, userCoinz)}
              type="tel"
              value={tempClaimedCoinz || null}
              placeholder="Enter the Coinz to apply"
              min={0}
              max={userCoinz}
              className="w-full border border-[#000] placeholder:text-sm pl-3 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-lg my-auto !py-2 text-black"
            />
            <p className="mt-2 text-center text-sm text-gray-600">
              Earn exciting rewards with every transaction!
            </p>
          </div>
          <CommonBottomButton
            fixed
            buttons={[
              {
                text: "Apply",
                onClick: handleNextClick,
                type: "button",
              },
            ]}
          />
        </BottomPopUp>
      )}
    </>
  );
};

const MemoAvailableCoinz = memo(AvailableCoinz);
export default MemoAvailableCoinz;
