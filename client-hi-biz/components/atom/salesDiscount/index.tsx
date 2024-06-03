import { Disclosure } from "@headlessui/react";
import { memo, useEffect, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import useTimings from "@/components/store/useTimings";
import { useRouter } from "next/router";
import axios from "@/axios";
import type { Bill } from "@/components/types/businessData";
import BillSummary from "../billSummary";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import LoadingSpinner from "../loadingSpinner";
import { useQuery } from "@tanstack/react-query";

interface IDiscount extends Bill {
	totalDiscount: number;
	data: Bill[];
}
function SalesDiscount() {
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };
	const [currentPage, setCurrentPage] = useState(1);

	const handleClick = (newPage: number) => {
		setCurrentPage(newPage);
	};
	const { inTime, outTime } = useTimings();

	// sales report api
	const getSalesReport = async () => {
		let url = `/v1/payments/:id/discount?businessId=${businessId}&pageNumber=${currentPage}`;
		if (inTime && outTime) {
			url += `&from=${inTime}&to=${outTime}`;
		}
		try {
			const res = await axios.get(url);
			return res.data
		} catch (error) {
			console.error("Error fetching sales report:", error);
		}
	};

	useEffect(() => {
		router.query.tab = "Discount";
		router.push(router);
	}, []);

	const {isLoading, error, data:salesData} = useQuery<IDiscount>({
		queryKey: ["discount", businessId, currentPage, inTime, outTime],
		queryFn: getSalesReport,
		enabled: !!businessId && !!inTime && !!outTime && !!currentPage,
	})

	if(isLoading) return <LoadingSpinner />
	if(error) return <div>Error: {error.message}</div>

	return (
		<>
			<div className="mx-6 mt-6 bg-[#204D42] text-white p-4 rounded-lg">
				<div className="pb-2 text-xs">Total discounts</div>
				<div className="text-3xl font-normal">
					₹ {salesData?.totalDiscount}
				</div>
			</div>
			{salesData && salesData.data.length > 0 ? (
				<div className="pb-[6rem] masonry-layout mx-6 mt-6">
					{salesData.data.map((bill: Bill, index: number) => (
						<div key={index.toString()}>
							{bill?.discount > 0 && (
								<Disclosure>
									{({ open }) => (
										<>
											<div className="border masonry-item border-[#cacaca] rounded-xl">
												<Disclosure.Button
													className={`w-full p-4 rounded-xl ${
														bill?.settle
															? "bg-[#219653]/10 border-[#219653]"
															: ""
													}`}
												>
													<div className="flex justify-between">
														<div className="font-medium">₹ {bill?.total}</div>
														<div className="text-sm opacity-60">
															{bill?.paymentDate} {bill?.time}
														</div>
													</div>

													<div className="flex items-center justify-between">
														<div className="text-base font-medium opacity-70">
															{bill?.customerName === "undefined"
																? bill?.waiterName.slice(0, 16)
																: bill?.customerName.slice(0, 16)}
														</div>
														<div>
															<AiFillCaretDown
																className={`ml-2 h-3 w-3 ${
																	open ? "transform rotate-180" : ""
																}`}
															/>
														</div>
													</div>
												</Disclosure.Button>
												<Disclosure.Panel className="mx-4 text-sm">
													<div className="flex justify-between border-y opacity-70 border-[#cacaca] text-base py-4">
														<div className="flex items-center">
															<MdPerson className="" />
															<span className="ml-2">
																{bill?.waiterName.slice(0, 16)}
															</span>
														</div>
														<div>{bill?.tableName}</div>
													</div>
													<div className="border-b border-[#cacaca] pb-4">
														<div className="mt-4 font-medium">
															<div className="flex justify-between font-medium">
																<span>items</span>
																<span>Rupees</span>
															</div>
														</div>
														{bill.items
															? bill?.items?.map((item: any, index: number) => (
																	<div
																		className="mt-1 font-medium opacity-70"
																		key={index.toString()}
																	>
																		<div className="flex justify-between font-medium">
																			<span>{item?.name}</span>
																			<span>₹ {item?.amount}</span>
																		</div>
																	</div>
															  ))
															: null}
													</div>

													<BillSummary {...bill} />
												</Disclosure.Panel>
											</div>
										</>
									)}
								</Disclosure>
							)}
						</div>
					))}
				</div>
			) : (
				<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					<p>No Discounts Found</p>
					{inTime && outTime && (
						<div className="text-base">
							({inTime} to {outTime})
						</div>
					)}
				</div>
			)}
			<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
				{salesData && salesData.data.length >= 0 && (
					<button
						type="button"
						onClick={() => handleClick(currentPage - 1)}
						disabled={currentPage === 1}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsLeft />
					</button>
				)}
				<p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
					{currentPage}
				</p>
				{salesData && salesData.data.length > 0 && (
					<button
						type="button"
						onClick={() => handleClick(currentPage + 1)}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsRight />
					</button>
				)}
			</div>
		</>
	);
}

export default memo(SalesDiscount);
