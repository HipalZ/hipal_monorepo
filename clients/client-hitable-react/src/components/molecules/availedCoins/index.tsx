import loyaltyLottie from "@/assets/animation/lottie-loyalty.json";
import { Player } from "@lottiefiles/react-lottie-player";
import { useLoyaltyStore } from "@/components/store/useLoyaltyData";
interface IAvailedCoinsProps {
  userName: string;
  bill: number;
  coinz: number;

}
const AvailedCoins = ({ userName, bill, coinz }:IAvailedCoinsProps) => {
  const setReward = useLoyaltyStore(s=>s.setReward);
  let remainingAmount = bill - coinz;

  return (
    <div className="px-6 pt-6">
      <h1 className="text-[#2C2C2C] text-base font-[600] mb-2">
        <span className="capitalize">{userName}</span> has availed coinz of
      </h1>
      <div className="h-[200px]">
        <Player
          autoplay
          loop
          src={loyaltyLottie}
          style={{ height: "250px", width: "250px" }}
        />
      </div>
      <div className="mt-4 text-[#2C2C2C] font-medium text-base space-y-2 pb-2">
        <div className="flex justify-between font-medium">
          <span className="text-base font-semibold">Actual bill value</span>
          <span className="text-xl font-semibold">{bill}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-base font-semibold">Discount after coinz</span>
          <span className="text-xl font-semibold">{coinz}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-base font-semibold">Final Bill value</span>
          <span className="text-xl font-semibold">{bill - coinz}</span>
        </div>
        {remainingAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-base font-semibold">Reward amount</span>
            <span className="text-xl font-semibold">
              {Math.floor((remainingAmount * setReward) / 100)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailedCoins;
