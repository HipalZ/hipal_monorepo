import AlertToRemove from "@/components/atoms/alertToRemove";
import CommonBottomButton from "@/components/atoms/bottomButton";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useUpdateBill } from "@/components/hooks/usePayments";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { DialogTitle } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { type ChangeEvent, memo, useCallback, useMemo, useState } from "react";
import { GoAlert } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";

const AvailableCoinz = () => {
  const {
    billValue,
    userCoinz,
    claimedCoins,
    claimCouponz,
    setClaimCouponz,
    setClaimedCoins,
    isModalOpen,
    setIsModalOpen,
    billData,
  } = usePaymentStore();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const { addCoins, removeCoinz, removeCouponz } = useUpdateBill();
  const { loyaltySetting } = useLoyaltyData();
  const addCoinsMutation = useMutation({ mutationFn: addCoins });
  const removeCoinsMutation = useMutation({ mutationFn: removeCoinz });
  const removeCouponMutation = useMutation({ mutationFn: removeCouponz });
  const handleApplyCoinz = async (finalValue: number) => {
    setClaimedCoins(finalValue);
    handleCoins(finalValue);
    if (outletInfo?.isPosEnabled) {
      await addCoinsMutation.mutateAsync({
        coinz: finalValue,
      });
    }
  };

  const handleCoins = useCallback(
    async (claimedCoins: number) => {
      // if has claim coinz then celebrate
      setIsModalOpen(false);
      if (claimedCoins !== null && claimedCoins > 0) {
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
    },
    [setIsModalOpen],
  );

  const { setAvailedCoupon } = useCouponz((s) => ({
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  const { showAlert, setShowAlert } = useCouponTemp((s) => ({
    showAlert: s.showAlert,
    setShowAlert: s.setShowAlert,
  }));
  const [tempClaimedCoins, setTempClaimedCoins] = useState<number | null>(
    claimedCoins || null,
  );

  const maxClaim = useMemo(() => {
    const canClaimCoinz = Math.round(
      (billData?.subTotal || billValue) *
        (loyaltySetting?.setClaimedPercentage / 100) || 0,
    );
    return canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;
  }, [
    billData?.subTotal,
    billValue,
    loyaltySetting?.setClaimedPercentage,
    userCoinz,
  ]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const userEnteredValue = Number(event.target.value.replace(/[^0-9.]/g, ""));
    if (userEnteredValue > maxClaim) {
      toast.error(`You can use up to ${maxClaim} Coinz only.`);
      setTempClaimedCoins(maxClaim);
    } else {
      setTempClaimedCoins(userEnteredValue);
    }
  };

  // Update global state on button click
  const handlePosLogic = useCallback(async () => {
    if (claimedCoins > 0) {
      setShowAlert(false);
      setClaimedCoins(0);
      await removeCoinsMutation.mutateAsync();
      closeModal();
      return;
    }

    if (billData?.couponId) {
      setShowAlert(true);
      return;
    }
    handleApplyCoinz(tempClaimedCoins || 0);
    closeModal();
  }, [
    claimedCoins,
    billData?.couponId,
    tempClaimedCoins,
    handleApplyCoinz,
    removeCoinsMutation,
    setShowAlert,
    setClaimedCoins,
  ]);

  const replaceLoyalty = useCallback(async () => {
    setClaimCouponz(0);
    setShowAlert(false);
    setAvailedCoupon({});
    toast.success("Coupon removed successfully");
    await removeCouponMutation.mutateAsync({});
    handleApplyCoinz(tempClaimedCoins || 0);
  }, [
    setClaimCouponz,
    setShowAlert,
    handleApplyCoinz,
    tempClaimedCoins,
    setAvailedCoupon,
    removeCouponMutation.mutateAsync,
  ]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const checkAvailableCoinz = useMemo(() => {
    if (claimedCoins) {
      return userCoinz - claimedCoins;
    }
    return userCoinz;
  }, [claimedCoins, userCoinz]);

  const handlePopCornLogic = async () => {
    if (claimedCoins > 0) {
      setShowAlert(true);
      setClaimedCoins(0);
    } else {
      handleApplyCoinz(tempClaimedCoins || 0);
    }
    closeModal();
  };

  if (
    claimedCoins &&
    !tempClaimedCoins &&
    typeof claimedCoins === "number" &&
    typeof tempClaimedCoins !== "number"
  ) {
    setTempClaimedCoins(claimedCoins);
  }

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
              Available Coins : {claimCouponz ? userCoinz : checkAvailableCoinz}
            </h1>
            <br />
            <input
              onChange={(e) => handleChange(e)}
              type="tel"
              value={tempClaimedCoins || null}
              placeholder="Enter the Coinz to apply"
              min={0}
              maxLength={5}
              max={userCoinz}
              disabled={claimedCoins > 0}
              className="w-full border border-[#000] placeholder:text-sm pl-3 min-h-[3rem] mx-auto font-semibold text-[1rem] rounded-lg my-auto !py-2 text-black"
            />
            <p className="my-2 text-sm text-center text-gray-600">
              Earn exciting rewards with every transaction!
            </p>
            {outletInfo?.isPosEnabled ? (
              <p className="text-xs text-center text-gray-600">
                *Note:- coinz can be applied only on bill subtotal amount upto{" "}
                {maxClaim}, tips will not be considered.
              </p>
            ) : (
              <p className="text-xs text-center text-gray-600">
                *Note:- coinz can be applied upto {maxClaim}, tips will not be
                considered.
              </p>
            )}
          </div>
          <CommonBottomButton
            fixed
            buttons={[
              {
                text: claimedCoins === 0 ? "Apply" : "Remove",
                onClick: outletInfo?.isPosEnabled
                  ? handlePosLogic
                  : handlePopCornLogic,
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
