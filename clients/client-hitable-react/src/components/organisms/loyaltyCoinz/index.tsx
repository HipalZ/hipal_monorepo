import { memo, useState } from "react";
import { BiShoppingBag } from "react-icons/bi"; // Make sure 'react-icons' is installed

interface LoyaltyCoinzUsageProps {
	userDetails: {
		userName: string;
		rewards: number;
	};
	redeemCoins: boolean;
	setRedeemCoins: (value: boolean) => void;
	setIsCoinzModalOpen: (value: boolean) => void;
	setCvv: (value: string) => void;
	setCoinsToRedeem: (value: number) => void;
	maxClaimableAmount: number;
	handleRedeemCoins: () => void;
}

function LoyaltyCoinzUsage({
	userDetails,
	redeemCoins,
	setRedeemCoins,
	setIsCoinzModalOpen,
	setCvv,
	setCoinsToRedeem,
	maxClaimableAmount,
	handleRedeemCoins,
}:LoyaltyCoinzUsageProps) {
  const [localCoins,setLocalCoins] = useState<number>();

  const updateTheCoins = (e: React.ChangeEvent<HTMLInputElement>) => {
	const value = Math.round(Math.min(Number(e.target.value), maxClaimableAmount) * 100) / 100;
	setLocalCoins(value);
	setCoinsToRedeem(value);
  }
	return (
		<div className="pb-[5rem]">
			<div className="px-6 pt-6">
				<h1 className="text-[#2C2C2C] font-[600]">Loyalty coinz usage</h1>
				<div className="flex items-center">
					<div className="mr-6 my-[1rem] flex justify-start items-center">
						<div className="bg-primary text-base-100 text-xl flex justify-center items-center rounded-full border w-[55px] h-[55px]">
							{userDetails?.userName?.[0]}
						</div>
					</div>
					<div>
						<h1 className="text-[#2C2C2C] text-base font-semibold">
							{userDetails?.userName}
						</h1>
						<p className="text-[#2C2C2C] text-base font-[500]">
							{userDetails?.rewards} Coinz
						</p>
					</div>
				</div>
				<div className="pb-4">
					<div className="pb-4 text-sm font-semibold">Loyalty options</div>
					<button
						type="button"
						className={`${
							redeemCoins ? "text-base-100 bg-primary" : "text-primary"
						} mr-4 border rounded-3xl text-sm px-3 py-1  border-primary`}
						onClick={() => setRedeemCoins(true)}
					>
						Redeem coinz
					</button>
					<button
						type="button"
						className={`${
							!redeemCoins ? "text-base-100 bg-primary" : "text-primary"
						} mr-4 border rounded-3xl text-sm px-3 py-1  border-primary`}
						onClick={() => {
							setRedeemCoins(false);
							setIsCoinzModalOpen(false);
							setCvv("");
							setCoinsToRedeem(0);
						}}
					>
						No redeem
					</button>
				</div>
				{redeemCoins && (
					<div>
						<label className="text-sm font-[600] text-[#2C2C2C]">
							Enter the Hi-CVV
						</label>
						<input
							type="text"
							className="w-full border border-[#79747E] rounded-xl px-4 py-1.5 mb-4 mt-2"
							onChange={(e) => setCvv(e.target.value)}
						/>
						<label className="text-sm font-[600] text-[#2C2C2C]">
							Claiming coinz
						</label>
						<input
							type="number"
							placeholder={`Max: ${Math.ceil(maxClaimableAmount)}`}
							title="Enter the amount of coins to redeem. Values higher than your maximum claimable amount will be adjusted."
							value={localCoins}
							className="w-full border border-[#79747E] rounded-xl px-4 py-1.5 mb-4 mt-2"
							onChange={updateTheCoins}
						/>
					</div>
				)}
			</div>
			<div className="fixed bottom-0 flex items-center justify-between w-full h-16 px-5 bg-primary">
				<div className="flex items-center">
					<BiShoppingBag color="#fff" size={24} />
					<h1 className="mx-2 text-sm font-semibold text-base-100">
						Hi Coinz added
					</h1>
				</div>
				<button
					type="button"
					onClick={handleRedeemCoins}
					className="text-primary font-semibold leading-[1.15rem] px-9 py-3 rounded-full bg-base-100"
				>
					Confirm
				</button>
			</div>
		</div>
	);
}

export default memo(LoyaltyCoinzUsage);
