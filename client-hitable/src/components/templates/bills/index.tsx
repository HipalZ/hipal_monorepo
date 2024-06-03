 import Image from "next/image";
import React, { memo, useState } from "react";
import HiPalLogo from "@/assets/svg/hipalLogoNew.svg";
import { useRouter } from "next/router";
import { MdMenuOpen } from "react-icons/md";
import axios from "@/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
	startOfDay,
	endOfDay,
	startOfMonth,
	endOfMonth,
	subDays,
} from "date-fns";
import MiddlePopUp from "@/components/atoms/middlePopUp";
import { useBusinessStore } from "@/components/store/useBusinessData";
import Bills from "@/components/molecules/bills";
import Loader from "@/components/atoms/loader";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

function Bill({ setCurrentView }) {
	const router = useRouter();
	const businessData = useBusinessStore((s) => s.businessData);
	const [selectedRange, setSelectedRange] = useState("today");
	const [startDate, setStartDate] = useState(startOfDay(new Date()));
	const [endDate, setEndDate] = useState(endOfDay(new Date()));
	const [pageNumber, setPageNumber] = useState(1);
	const [isCustomDate, setIsCustomDate] = useState(false);
	const { businessId } = router.query as {
		businessId: string;
	};

	const pageNumberFunction = (newPage: number) => {
		setPageNumber(newPage);
	};

	const today = new Date();
	const yesterday = subDays(new Date(), 1);
	const startOfThisMonth = startOfMonth(new Date());
	const endOfThisMonth = endOfMonth(new Date());

	const formatDate = (date) => {
		const day = String(date?.getDate()).padStart(2, "0");
		const month = String(date?.getMonth() + 1).padStart(2, "0");
		const year = date?.getFullYear();
		return `${day}-${month}-${year}`;
	};

	const fetchReportForRange = (start, end) => {
		setStartDate(start);
		setEndDate(end);
	};

	const handleTodayClick = () => {
		setSelectedRange("today");
		fetchReportForRange(startOfDay(today), endOfDay(today));
	};

	const handleYesterdayClick = () => {
		setSelectedRange("yesterday");
		fetchReportForRange(startOfDay(yesterday), endOfDay(yesterday));
	};

	const handleThisMonthClick = () => {
		setSelectedRange("thisMonth");
		fetchReportForRange(startOfThisMonth, endOfThisMonth);
	};

	const handleCustomDatesClick = () => {
		setSelectedRange("custom");
		setIsCustomDate(!isCustomDate);
	};

	const fetchBillsData = async () => {
		if (!startDate || !endDate) {
			return;
		}

		const formattedStartDate = formatDate(startDate);
		const formattedEndDate = formatDate(endDate);
		let url = `/v1/payments/Sale/Bill?businessId=${businessId}&pageNumber=${pageNumber}`;
		console.log(formattedEndDate, formattedStartDate);
		if (formattedStartDate && formattedEndDate) {
			url += `&from=${formattedStartDate}&to=${formattedEndDate}`;
		}

		try {
			const res = await axios.get(url);
			return res.data;
		} catch (error) {
			console.error("Error fetching sales report:", error);
			toast.error("Error fetching sales report")
		}
	};

	const {
		isLoading,
		error: salesError,
		data: billsData,
	} = useQuery({
		queryKey: ["fetchBillsData", businessId, startDate, endDate, pageNumber],
		queryFn: fetchBillsData,
		enabled: !!businessId && !!startDate && !!endDate && !!pageNumber,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	if (salesError) {
		return (
			<div className="flex items-center justify-center h-screen">
				<button onClick={fetchBillsData} className="btn" type="button">
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen pb-6 bg-secondary">
			<div className="sticky top-0 z-20 bg-secondary">
				<div className="flex justify-between ml-[1.5rem] pt-[2rem]">
					<Image width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />

					<MdMenuOpen
						onClick={() => setCurrentView("setting")}
						className="mr-[1.5rem] text-2xl"
					/>
				</div>
				<div className="mt-4 ml-6 font-bold">{businessData?.businessName}</div>
				<div className="py-4 mx-6">
					<div className="flex flex-wrap items-center justify-start space-x-2">
						<button
							type="button"
							className={`border text-xs px-2 py-1 rounded-md ${
								selectedRange === "today"
									? "bg-primary text-base-100"
									: "bg-base-100"
							}`}
							onClick={handleTodayClick}
						>
							Today
						</button>
						<button
							type="button"
							className={`border text-xs px-2 py-1 rounded-md ${
								selectedRange === "yesterday"
									? "bg-primary text-base-100"
									: "bg-base-100"
							}`}
							onClick={handleYesterdayClick}
						>
							Yesterday
						</button>
						<button
							type="button"
							className={`border text-xs px-2 py-1 rounded-md ${
								selectedRange === "thisMonth"
									? "bg-primary text-base-100"
									: "bg-base-100"
							}`}
							onClick={handleThisMonthClick}
						>
							This Month
						</button>
						<button
							type="button"
							className={`border text-xs px-2 py-1 rounded-md ${
								selectedRange === "custom"
									? "bg-primary text-base-100"
									: "bg-base-100"
							}`}
							onClick={handleCustomDatesClick}
						>
							Custom dates
						</button>
					</div>
				</div>
				<div className="ml-6 text-xl font-bold">
					Sales{" "}
					{`${formatDate(startDate).slice(0, 5)} to ${formatDate(endDate).slice(
						0,
						5,
					)}`}
				</div>
			</div>
			<div className="mx-6 date-picker-container">
				{isCustomDate && (
					<MiddlePopUp
						show={isCustomDate}
						onClose={() => setIsCustomDate(false)}
					>
						<div className="flex justify-center p-2 date-picker-container item-center">
							<DatePicker
								selected={startDate}
								onChange={(dates) => {
									if (Array.isArray(dates) && dates.length === 2) {
										const [start, end] = dates;
										setStartDate(start);
										setEndDate(end);
									} else {
										setStartDate(dates);
										setEndDate(dates);
									}
								}}
								startDate={startDate}
								endDate={endDate}
								selectsRange
								inline
							/>
						</div>
					</MiddlePopUp>
				)}
			</div>
			<Bills pageNumber={pageNumber} pageNumberFunction={pageNumberFunction} billsData={billsData} />
		</div>
	);
}

export default memo(Bill) ;
