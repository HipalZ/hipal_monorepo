import useBusinessData from "@/components/store/useBusinessData";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import Image from "next/image";
import React, { memo, useEffect, useState } from "react";
import { LuSettings } from "react-icons/lu";
import { MdAccountCircle, MdOutlineHeartBroken } from "react-icons/md";
import PieChart from "@/assets/svg/pie.svg";
import Bar from "@/assets/svg/barChart.svg";
import axios from "@/axios";
import { useRouter } from "next/router";
import LoadingSpinner from "../loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

type ILoyaltyDash = {
	allUsers: number;
	coinsIssued: number;
	coinsUsed: number;
	repeatUsed: number;
	usagePercentage: number;
	coinsGivenOut: number;
	coinsGivenUsed: number;
	newCustomer: number;
};

const LoyaltyDashboard = () => {
	const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
	const { isLoyaltyExists } = useBusinessData();
	const loyaltyId = useBusinessData((s) => s.existingLoyalty.loyaltyId);
	const setup = (str: string) => {
		setSelectedButton(str);
	};
	const router = useRouter();
	const [dashData, setDashData] = useState<ILoyaltyDash>({
		allUsers: 0,
		coinsIssued: 0,
		coinsUsed: 0,
		repeatUsed: 0,
		usagePercentage: 0,
		coinsGivenOut: 0,
		coinsGivenUsed: 0,
		newCustomer: 0,
	});
	let obj = [
		{
			title: "Coinz issued",
			coins: dashData?.coinsIssued,
		},
		{
			title: "Coinz used",
			coins: dashData?.coinsUsed,
		},
		{
			title: "Usage percentage",
			coins: dashData?.usagePercentage,
		},
		{
			title: "Repeat usage",
			coins: dashData?.repeatUsed,
		},
	];

	const getData = async () => {
		const config = {
			method: "GET",
			url: `/v1/users/:businessId/loyaltyDashboard?loyaltyId=${loyaltyId}`,
		};
		try {
			const response = await axios(config);
			const data = response?.data;
			setDashData(data);
			return data;
		} catch (err) {
			console.log(err);
		}
	};
	
	useEffect(() => {
		router.query.tab = "Dashboard";
		router.push(router);
	}, []);

	const {isLoading, error, data, refetch} = useQuery<ILoyaltyDash>({
		queryKey: ['loyaltyDashboard', loyaltyId],
		queryFn: getData,
		enabled: !!loyaltyId,
	})

	if(error)return <ErrorComponent refetch={refetch}/>

	return (
		<>
			{!isLoyaltyExists ? (
				<>
					<div className="flex flex-col items-center justify-center mt-12 space-y-4">
						<MdOutlineHeartBroken className="text-5xl opacity-30" />
						<div className="text-sm opacity-50">
							Please enable the loyalty to boost your business
						</div>
						<button
							type="button"
							onClick={() => setup("Set up")}
							className="flex justify-center items-center border py-2 rounded-lg border-[#cacaca]/50 px-4 focus:text-white focus:bg-[#2B354D]"
						>
							<LuSettings />
							<span className="ml-2 text-sm">Set up</span>
						</button>
					</div>
				</>
			) : (
				<div className="mx-6 mt-4">
					<div className="bg-[#2F80ED] rounded-lg px-4 py-4 text-white">
						<div className="text-sm">Users with Loyalty</div>
						<div className="flex items-center justify-start mt-4 text-3xl">
							{" "}
							<MdAccountCircle className="" />
							<span className="ml-2">
								{Number(dashData?.allUsers).toLocaleString("en-IN")}
							</span>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 mt-4">
						{obj.map((item, index) => (
							<div
								key={index.toString()}
								className="px-4 py-4 border border-[#cacaca] rounded-lg space-y-4"
							>
								<div className="text-sm opacity-50">{item?.title}</div>
								<div className="font-semibold">
									{Number(item?.coins).toLocaleString("en-IN")}
									{item?.title === "Usage percentage" ? "%" : ""}
								</div>
							</div>
						))}
					</div>
					<div className="lg:flex lg:justify-between">
						<div className="mt-4">
							<Image src={PieChart} width={425} height={425} alt="pie chart" />
						</div>
						<div className="pb-12 mt-4">
							<Image src={Bar} width={430} height={430} alt="pie chart" />
						</div>
					</div>
				</div>
			)}
			{isLoading && <LoadingSpinner />}
		</>
	);
};

export default memo(LoyaltyDashboard);
