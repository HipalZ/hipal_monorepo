import Header from "@/components/molecules/header";
import { memo, startTransition, useEffect } from "react";
import { BsChevronLeft, BsPerson } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { MdSpaceDashboard } from "react-icons/md";
import { BiSolidReceipt } from "react-icons/bi";
import { LuSettings } from "react-icons/lu";
import SubheaderButtonList from "@/components/atom/subHeaderBtn";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import LoyaltyDashboard from "@/components/atom/loyaltyDashboard";
import LoyaltyCustomer from "@/components/atom/loyaltyCustomer";
import LoyaltyCoins from "@/components/atom/loyaltyCoins";
import LoyaltySetup from "@/components/atom/loyalitySetup";
import useBusinessData from "@/components/store/useBusinessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoyaltyCSV from "./csv";
import { useNavigate, useParams } from "react-router-dom";

const buttons = [
	{
		text: "Dashboard",
		Icon: MdSpaceDashboard,
	},
	{
		text: "Customer",
		Icon: BsPerson,
	},
	{
		text: "Coins",
		Icon: BiSolidReceipt,
	},
	{
		text: "Set up",
		Icon: LuSettings,
	},
];

const Loyalty = memo(()=> {
	const navigate = useNavigate();
	const {businessId} = useParams<{businessId : string}>();
	const { selectedSubIcon } = useSelectedIcon();
	const isLoyaltyExists = useBusinessData((s) => s.isLoyaltyExists);
	const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
	const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);

	useEffect(() => {
        const params = new URLSearchParams(location.search);
        const key = params.get('tab') || "Dashboard";
        setSelectedButton(key);
    }, []);

	const handleBack = () => {
		const params = new URLSearchParams(location.search);
		params.delete('tab');
		startTransition(()=>{
			navigate(`/app/business/${businessId}/`);
		})
		setSelectedButton("")
	}

	const TabsContent = () => {
		return (
			<div className="bg-[#f5f5f5] sticky z-20 top-0">
				<Header
					title="Loyalty"
					onBack={handleBack}
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={false}
				/>
				<SubheaderButtonList buttons={buttons} />
				<div className="flex justify-between items-center mt-2 px-6 pb-4 border-b border-[#cacaca]">
					<div className="flex text-2xl">
						<span className="ml-2"> {selectedButton}</span>
					</div>
				</div>
			</div>
		);
	};

	return (
		<>
			{selectedButton === "Dashboard" ? (
				<>
					<TabsContent />
					<LoyaltyDashboard />
				</>
			) : selectedButton === "Customer" ? (
				<>
					<TabsContent />
					<LoyaltyCustomer />
				</>
			) : selectedButton === "Coins" ? (
				selectedSubIcon !== "uploadCSV" ? (
					<>
						<TabsContent />
						<LoyaltyCoins />
					</>
				) : (
					<LoyaltyCSV />
				)
			) : (
				<>
					<TabsContent />
					<LoyaltySetup existsLoyality={isLoyaltyExists} />
				</>
			)}
		</>
	);
})

export default Loyalty;
