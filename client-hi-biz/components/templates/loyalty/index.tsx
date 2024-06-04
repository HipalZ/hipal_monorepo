import Header from "@/components/molecules/header";
import React, { useEffect } from "react";
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
import LoyalitySetup from "@/components/atom/loyalitySetup";
import useBusinessData from "@/components/store/useBusinessData";
import { useRouter } from "next/router";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoyaltyCSV from "./csv";

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

function Loyalty() {
	const { setSelectedIcon, selectedSubIcon } = useSelectedIcon();
	const isLoyaltyExists = useBusinessData((s) => s.isLoyaltyExists);
	const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
	const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
	const router = useRouter();

	useEffect(() => {
		let key = router.query.tab?.toString() || "Dashboard";
		setSelectedButton(key);
	}, [router.query.tab]);

	const TabsContent = () => {
		return (
			<div className="bg-[#f5f5f5] sticky z-20 top-0">
				<Header
					title="Loyalty"
					onBack={() => setSelectedIcon("")}
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
	useEffect(() => {
		setSelectedButton("Dashboard");
	}, []);
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
					<LoyalitySetup existsLoyalty={isLoyaltyExists} />
				</>
			)}
		</>
	);
}

export default Loyalty;
