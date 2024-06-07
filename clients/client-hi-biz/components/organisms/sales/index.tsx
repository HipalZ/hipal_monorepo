import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import CollectionModeComponent from "@/components/atom/selectMode";
import useTimings from "@/components/store/useTimings";
import { useRouter } from "next/router";
import { memo, useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";

export interface ISalesResponse {
	grossSale: number;
	totalSale: ISaleMode[];
	charges: ICharge[];
	discounts: IDiscount[];
	tips: ITip[];
	dues: IDue[];
}

interface ISaleMode {
	mode: string;
	totalSale: number;
	commissionPercent: number;
	totalCommissionSale: number;
}

interface ICharge {
	mode: string;
	totalSale: number;
	commissionPercent: number;
	totalCommissionSale: number;
}

interface IDiscount {
	mode: string;
	totalSale: number;
	commissionPercent: number;
	totalCommissionSale: number;
}

interface ITip {
	waiterName: string;
	tips: number;
}

interface IDue {
	customerName: string;
	dues: number;
}

interface SalesComponentProps {
	salesData: ISalesResponse | null;
	isLoadingSales: boolean;
	runCost: number;
}

const SalesComponent: React.FC<SalesComponentProps> = ({
	salesData,
	isLoadingSales,
	runCost,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { inTime, outTime, selectedRange } = useTimings();
	const router = useRouter();
	const openModal = () => {
		setIsModalOpen(true);
	};
	const today = new Date();
	const formattedDate = today
		.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})
		.replace(/\//g, "-");

	const closeModal = () => {
		setIsModalOpen(false);
	};
	useEffect(() => {
		router.query.tab = "Dashboard";
		router.push(router);
	}, []);

	function getTips(arr: any) {
		if(arr?.length>0){
			return arr.reduce((acc, ele) => acc + ele?.tips, 0);
		}
	}

	function getDues(arr: any) {
		if(arr?.length>0){
			return arr.reduce((acc, ele) => acc + ele?.dues, 0);
		}
	}

	return (
		<div className="relative pb-12">
			{salesData?.grossSale !== 0 ? (
				<>
					<div className="mx-6 mt-6 bg-[#204D42] text-white p-4 rounded-lg">
						<div className="pb-2 text-xs">
							Gross Sales
							{inTime && outTime && (
								<>
									( {inTime.slice(0, 5)} to {outTime.slice(0, 5)} )
								</>
							)}
						</div>
						<div className="text-3xl font-medium">₹ {salesData?.grossSale}</div>
					</div>
					<div className="mt-4 masonry-layout">
						<div className="masonry-item">
							<div className="ml-6">Total Sales</div>
							<div className="mx-6 border border-[#cacaca] rounded-md mt-4">
								{salesData?.totalSale
									.filter((ele) => ele?.totalSale > 0)
									.map((ele, index, array) => (
										<div
											key={index.toString()}
											className={`${
												index < array.length - 1
													? "border-b border-[#cacaca]"
													: ""
											} mx-4 flex justify-between text-sm items-center py-4`}
										>
											{ele.totalSale > 0 && (
												<>
													<span> {ele?.mode}</span>
													<span>₹ {ele?.totalSale}</span>
												</>
											)}
										</div>
									))}
							</div>
						</div>
						{(selectedRange === "today" ||
							(formattedDate === outTime && formattedDate === inTime)) &&
							runCost > 0 && (
								<div className="mx-6 masonry-item">
									<div>Running Table</div>
									<div className="mt-4 border bg-white border-[#cacaca] p-4 flex justify-between items-center rounded-md">
										<div>Cost</div>
										<div>₹ {runCost}</div>
									</div>
								</div>
							)}
						<div className="masonry-item">
							<div className="ml-6">Charges</div>
							<div className="mx-6 border border-[#cacaca] rounded-md mt-4">
								{salesData?.charges
									.filter((ele) => ele?.totalSale > 0)
									.map((ele, index, array) => (
										<div
											key={index.toString()}
											className={`${
												index < array.length - 1
													? "border-b border-[#cacaca]"
													: ""
											} mx-4 flex justify-between text-sm items-center py-4`}
										>
											{ele?.totalSale > 0 && (
												<>
													<span>{ele?.mode}</span>
													<span>₹ {ele?.totalSale}</span>
												</>
											)}
										</div>
									))}
							</div>
						</div>
						<div className="masonry-item">
							<div className="ml-6">Discounts</div>
							<div className="mx-6 border border-[#cacaca] rounded-md mt-4">
								{salesData?.discounts
									.filter((ele) => ele?.totalSale > 0)
									.map((ele, index, array) => (
										<div
											key={index.toString()}
											className={`${
												index < array.length - 1
													? "border-b border-[#cacaca]"
													: ""
											} mx-4 flex justify-between text-sm items-center py-4`}
										>
											{ele?.totalSale > 0 && (
												<>
													<span>{ele?.mode}</span>
													<span>₹ {ele?.totalSale}</span>
												</>
											)}
										</div>
									))}
							</div>
						</div>
						<div className="masonry-item">
							<div className="mx-6 flex justify-between align-center">
								<h1>Total Dues</h1>
								<p>{getDues(salesData?.dues)}</p>
							</div>
							<div className="mx-6 border border-[#cacaca] rounded-md mt-4">
								{salesData?.dues.map((ele, index) => (
									<div
										key={index.toString()}
										className="mx-4 flex justify-between text-sm items-center py-4 border-b border-[#cacaca]"
									>
										<span>{ele?.customerName}</span>
										<span>₹ {ele?.dues}</span>
									</div>
								))}
							</div>
						</div>
						<div className="masonry-item">
							<div className="mx-6 flex justify-between align-center">
								<h1>Total Tips</h1>
								<p>{getTips(salesData?.tips)}</p>
							</div>
							<div className="mx-6 border border-[#cacaca] rounded-md mt-4">
								{salesData?.tips
									.filter((ele) => ele?.tips > 0)
									.map((ele, index) => (
										<div
											key={index.toString()}
											className="mx-4 flex justify-between text-sm items-center py-4 border-b border-[#cacaca]"
										>
											<span>{ele?.waiterName}</span>
											<span>₹ {ele?.tips}</span>
										</div>
									))}
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					<p>No Sales Found</p>
					<span>
						{inTime && outTime && (
							<div className="text-base">
								({inTime} to {outTime} )
							</div>
						)}
					</span>
				</div>
			)}
			<div className="fixed bottom-6 right-6 lg:right-[30rem]">
				<button
					type="button"
					onClick={openModal}
					className=" border bg-[#2B354D] text-white font-normal on_active_bounce border-[#2B354D] px-4 py-2 rounded-lg"
				>
					<div className="flex items-center justify-center text-white">
						<MdAdd className="mr-2" />
						Add a Mode
					</div>
				</button>
			</div>
			{isModalOpen && (
				<PopUp show={isModalOpen} onClose={closeModal}>
					<CollectionModeComponent closeModal={closeModal} />
				</PopUp>
			)}
			{isLoadingSales && <LoadingSpinner/>}
		</div>
	);
};

export default memo(SalesComponent);
