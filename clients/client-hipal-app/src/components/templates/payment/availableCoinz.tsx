import BottomPopUp from "@/components/atoms/bottomPopUp";
import BottomButton from "@/components/molecules/bottomButton";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { type ChangeEvent, memo, useCallback, useState } from "react";
import { toast } from "react-toastify";

interface IAvailableCoinz {
  isModalOpen: boolean;
  closeModal: () => void;
  handleApplyCoinz: (value: number) => void;
  setClaimAmount: number;
}

const AvailableCoinz = (props: IAvailableCoinz) => {
  const { isModalOpen, closeModal, handleApplyCoinz, setClaimAmount } = props;
  const { billValue, userCoinz, claimedCoinz, claimCouponz, setClaimCouponz } =
    usePaymentStore((s) => ({
      billValue: s.billValue,
      claimedCoinz: s.claimedCoinz,
      claimCouponz: s.claimCouponz,
      setClaimCouponz: s.setClaimCouponz,
      userCoinz: s.userCoinz,
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
      if (claimCouponz > 0) {
        setClaimCouponz(0);
        toast("Coupon is removed as you have added the coinz");
      }
    } else {
      setTempClaimedCoinz(userEnteredValue);
      if (claimCouponz > 0) {
        setClaimCouponz(0);
        toast("Coupon is removed as you have added the coinz");
      }
    }
  };

  // Update global state on button click
  const handleNextClick = useCallback((tempClaimedCoinz) => {
    handleApplyCoinz(tempClaimedCoinz);
  }, []);
  return (
    <BottomPopUp show={isModalOpen} onClose={closeModal}>
      <div className="h-[15rem] p-6 text-black bg-white overflow-hidden rounded-t-2xl">
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
          onClick={() => handleNextClick(tempClaimedCoinz)}
        >
          Next
        </button>
      </BottomButton>
    </BottomPopUp>
  );
};

const MemoAvailableCoinz = memo(AvailableCoinz);
export default MemoAvailableCoinz;
