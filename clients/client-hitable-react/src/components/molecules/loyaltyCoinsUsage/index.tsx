import MiddlePopUp from "@/components/atoms/middlePopUp";
import { startTransition, useEffect, useState } from "react";
import { BiShoppingBag } from "react-icons/bi";
import AvailedCoins from "../availedCoins";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { useLoyaltyDatas } from "@/components/store/useLoyaltyDatas";
import { paths } from "@/components/utils/paths";
import { toast } from "react-toastify";
import Loader from "@/components/atoms/loader";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

export function playSound() {
	const audio = new Audio("/sounds/redeem.mp3");
	audio.play();
  }
const LoyaltyCoinsUsage = ({
	closeModal,
	singleUserHist,
	loyaltyId,
	userPhone,
}: any) => {
	const params = useParams<{
		businessId: string;
	}>();
	const businessId = params?.businessId; 
	const navigate = useNavigate();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { loyaltyData } = useLoyaltyDatas();
	const [cvv, setCvv] = useState<any>(null);
	const [bill, setBill] = useState<any>(null);
	const [coinz, setCoinz] = useState<any>(null);
	const [userCoinz, setUserCoinz] = useState<any>(null);
	const [billId, setBillId] = useState<any>(null);
	const [isSending, setIsSending] = useState(false);
	useEffect(() => {
		setUserCoinz(singleUserHist?.totalReward);
	}, [singleUserHist?.totalReward]);
	const closeModalPop = () => {
		startTransition(()=>{
			navigate(singleRoute[PAGE_TYPES.LOYALTY](businessId || loyaltyData.businessId));
		})
		setIsModalOpen(false);
		closeModal();
	};

	const postLoyaltyCoinz = async () => {
		if (cvv === "" || cvv === null) {
			return toast.error("Please Enter HiCVV");
		}
		if (isSending) return;
		try {
			const config = {
				method: "POST",
				url: paths.postLoyaltyCoinz(true, true),

				data: {
					total: bill,
					billId: billId,
					loyaltyId: loyaltyId,
					userPhone: userPhone,
					claimedAmount: coinz,
					password: Number.parseInt(cvv),
				},
			};
			const response = await axios(config);
			if (response.status === 200) {
				toast.success("Amount claimed successfull");
				playSound();
				setIsModalOpen(true);
			} else if (response.status === 400 || response.status === 404) {
				toast.error("Wrong HiCVV");
			}
		} catch (error: any) {
			console.error("Error fetching business data:", error?.response.status);
			if (error?.response.status === 400) {
				//TODO: check the response 
				toast.error(error?.response?.data?.data?.message);
			}
		} finally {
			setIsSending(false);
		}
	};

	const handleHiCVV = (cvv:string) => {
		const sanitizedCVV = Math.abs(parseInt(cvv.replace(/[^0-9\b]/g, ""))).toString();
		setCvv(sanitizedCVV);
	};
	const handleBillId = (value: any) => {
		setBillId(value);
	};
	const handleBillAmount = (bill: string) => {
		const numericBill = Math.abs(parseInt(bill.replace(/[^0-9\b]/g, ""), 10));
		setBill(numericBill);
	  
		const canClaimCoinz = Math.round(
		  numericBill * ((loyaltyData?.setClaimAmount ?? 0) / 100),
		);
		const coinsToSet =
		  userCoinz !== undefined && canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz ?? 0;
	  
		setCoinz(coinsToSet);
	  };

	const handleCoinz = (coinz:string) => {
		let numericCoinz = Math.abs(parseInt(coinz.replace(/[^0-9\b]/g, ""), 10));
		const canClaimCoinz = Math.round(
			(bill && bill * (loyaltyData?.setClaimAmount / 100)) || 0,
		);
		const coinsToSet = numericCoinz > canClaimCoinz ? canClaimCoinz : numericCoinz;

		setCoinz(coinsToSet);
	};

	if (isSending) {
		return (
			<div>
				<Loader />
			</div>
		);
	}

	return (
		<div className="pb-20">
			<div className="px-6 pt-6">
				<h1 className="text-[#2C2C2C] text-base font-[600]">
					Loyalty coinz usage
				</h1>
				<div className="flex items-center">
					<div className="mr-6 my-[1rem] flex justify-start items-center">
						<div className="capitalize bg-blue-800 text-white text-lg flex justify-center items-center rounded-full border w-[55px] h-[55px]">
							{singleUserHist?.userName?.split("")[0] || "U"}
						</div>
					</div>
					<div>
						<h1 className="capitalize text-[#2C2C2C] text-base font-semibold">
							{singleUserHist?.userName || singleUserHist?.userPhone}
						</h1>
						<p className="text-[#2C2C2C] text-base font-[500]">
							Coins-{singleUserHist?.totalReward}
						</p>
					</div>
				</div>
				<div>
					<label className="text-sm font-[500] text-[#2C2C2C]">
						Enter the bill Id <span className="text-xs">(optional)</span>
					</label>
					<input
						type="text"
						onChange={(e) => handleBillId(e.target.value)}
						value={billId || ""}
						placeholder="Bill Id"
						className="w-full border border-[#79747E] rounded-xl px-4 py-1.5 mb-4 mt-2"
					/>
					<label className="text-sm font-[500] text-[#2C2C2C]">
						Enter the bill Amount
					</label>
					<input
						type="text"
						onChange={(e) => handleBillAmount(e.target.value)}
						value={bill || ""}
						className="w-full border border-[#79747E] rounded-xl px-4 py-1.5 mb-4 mt-2"
					/>
					<label className="text-sm font-[500] text-[#2C2C2C]">
						Enter the Hi-CVV
					</label>
					<input
						type="password"
						onChange={(e) => handleHiCVV(e.target.value)}
						value={cvv || ""}
						className="w-full border border-[#79747E] rounded-xl px-4 py-1.5 mb-4 mt-2"
					/>
					<label className="text-sm font-[500] text-[#2C2C2C]">
						Claiming coinz
					</label>
					<input
						type="text"
						onChange={(e) => handleCoinz(e.target.value)}
						value={coinz || ""}
						className="w-full border border-[#79747E] rounded-xl px-4 py-1.5 mb-4 mt-2"
					/>
				</div>
			</div>
			<div className="fixed bottom-0 flex items-center justify-between w-full h-20 px-5 bg-primary">
				<div className="flex items-center">
					<BiShoppingBag color="#fff" size={24} />
					<h1 className="mx-2 text-sm font-semibold text-base-100">
						Hi Coinz added
					</h1>
				</div>
				<button
					type="button"
					onClick={postLoyaltyCoinz}
					className="text-primary font-semibold leading-[1.15rem] px-9 py-4 rounded-full bg-base-100"
				>
					Confirm
				</button>
			</div>
			{isModalOpen && (
				<MiddlePopUp show={isModalOpen} onClose={closeModalPop}>
					<AvailedCoins
						userName={singleUserHist?.userName || singleUserHist?.userPhone}
						bill={bill}
						coinz={coinz}
					/>
				</MiddlePopUp>
			)}
		</div>
	);
};

export default LoyaltyCoinsUsage;
