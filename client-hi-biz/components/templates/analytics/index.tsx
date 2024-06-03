import { BsChevronLeft } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import AnalyticsCategory from "./category";
import AnalyticsDish from "./dish";
import axios from "@/axios";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import ErrorComponent from "@/components/errorComponent";
import Header from "@/components/molecules/header";
import Hi from "@/assets/svg/hi.svg";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import React, { memo } from "react";
import useTimings from "@/components/store/useTimings";

interface IAnalytics {
	[key: string]: string;
}

function Analytics() {
	const { inTime, outTime } = useTimings();
	const { setSelectedIcon, selectedSubIcon, setSelectedSubIcon } =
		useSelectedIcon();
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const getSalesReport = async () => {
		let url = `/v1/kitchens/:id/Category&Dishes?businessId=${businessId}`;

		if (inTime && outTime) {
			url += `&from=${inTime}&to=${outTime}`;
		}

		try {
			const res = await axios.get(url);
			return res.data;
		} catch (error) {
			console.error("Error fetching sales report:", error);
		}
	};

	const goAnalytics = (str: string) => {
		setSelectedSubIcon(str);
	};

	const { isLoading, error, data:analytics, refetch } = useQuery<IAnalytics | null>({
		queryKey: ['analytics', businessId, inTime, outTime],
		queryFn: getSalesReport,
		enabled: !!businessId && !!inTime && !!outTime,

	})

	if(isLoading) return <LoadingSpinner />
	if(error) return <ErrorComponent refetch={refetch}/>
	
	const analyticsRender = () => {
		switch (selectedSubIcon) {
			case "category":
				return <AnalyticsCategory />;
			case "dish":
				return <AnalyticsDish />;
			default:
				return (
					<>
						<div className="bg-[#f5f5f5]">
							<Header
								title="Analytics"
								onBack={() => setSelectedIcon("")}
								leftIcon={<BsChevronLeft />}
								centerImage={Hi}
								rightImage={Hi}
								isIconBusinessShow={true}
							/>
							<div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
								<div className="flex text-2xl">
									<span className="ml-2"> Analytics</span>
								</div>
							</div>
						</div>
						<DateRangePicker />

						{analytics && (
							<div className="grid grid-cols-2 gap-6 p-6">
								{analytics && Object.keys(analytics).map((key) => (
									<div
										key={key}
										className="bg-white p-4 rounded-md border border-[#cacaca]"
									>
										<h3 className="font-medium text-[#2B354D] text-sm mb-4 opacity-60">
											{key}
										</h3>
										<p className="text-[#2B354D] text-lg font-medium">
											{analytics[key]}
										</p>
									</div>
								))}
							</div>
						)}
						{analytics && (
							<div className="grid grid-cols-1 gap-6 mx-6">
								{analytics && Object.keys(analytics).map((key) => (
									<div
										key={key}
										onKeyDown={() => goAnalytics(key)}
										onClick={() => goAnalytics(key)}
										className="bg-white p-4 capitalize on_active_bounce flex justify-between items-center rounded-md border border-[#cacaca]"
									>
										<h3 className="font-medium text-[#2B354D]">{key}</h3>
										<p className="text-[#2F80ED] text-sm">View</p>
									</div>
								))}
							</div>
						)}
					</>
				);
		}
	};
	return <>{analyticsRender()}</>;
}

export default memo(Analytics);
