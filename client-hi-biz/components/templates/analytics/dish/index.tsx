import DateRangePicker from "@/components/molecules/dateRangePicker";
import Header from "@/components/molecules/header";
import React, { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import useTimings from "@/components/store/useTimings";
import { useRouter } from "next/router";
import axios from "@/axios";
import { BiChevronsLeft, BiChevronsRight, BiDownload } from "react-icons/bi";
import ExcelJS from "exceljs";
import { Disclosure } from "@headlessui/react";
import { AiFillCaretDown } from "react-icons/ai";
import { IoFastFoodOutline } from "react-icons/io5";
import type { IAnalyticsItem } from "@/components/types/businessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

function AnalyticsDish() {
	const [dish, setDish] = useState<IAnalyticsItem[] | null>(null);
	const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
	const { inTime, outTime } = useTimings();
	const [currentPage, setCurrentPage] = useState(1);
	const router = useRouter();
	const { businessId } = router.query as { businessId: string };

	const getDish = async () => {
		let url = `/v1/kitchens/:id/Dishes?businessId=${businessId}`;
		if (inTime && outTime) {
			url += `&from=${inTime}&to=${outTime}`;
		}
		try {
			const res = await axios.get(url);
			setDish(res.data);
			return res.data;
		} catch (error) {
			console.error("Error fetching sales report:", error);
		}
	};

	const itemsPerPage = 20;

	const totalPages = dish ? Math.ceil(dish.length / itemsPerPage) : 0;

	const handleClick = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const exportToExcel = async () => {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Dishes");
	
		// Define columns for categories and dishes
		worksheet.columns = [
			{ header: "Category Name", key: "categoryName", width: 20 },
			{ header: "Category Percentage", key: "categoryPercentage", width: 18 },
			{ header: "Category Orders", key: "categoryOrders", width: 15 },
			{ header: "Dish Name", key: "dishName", width: 20 },
			{ header: "Dish Percentage", key: "dishPercentage", width: 15 },
			{ header: "Dish Orders", key: "dishOrders", width: 12 }
		];
	
		// Set bold header
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
			if (colNumber !== 4) {  // Skip the fourth column
				cell.alignment = { horizontal: 'center' };
			}
		});
		// Adding category and dish data
		dish?.forEach(category => {
			category.dishes.forEach(dish => {
				const row = worksheet.addRow({
					categoryName: category.categoryName,
					categoryPercentage: category.percentage,
					categoryOrders: category.orders,
					dishName: dish.name,
					dishPercentage: dish.percentage,
					dishOrders: dish.orders
				});
				// Apply center alignment to each cell in the row
				row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
					if (colNumber !== 4) {  // Skip the fourth column
						cell.alignment = { horizontal: 'center' };
					}
				});
			});
		});
	
		const buffer = await workbook.xlsx.writeBuffer();
		triggerDownload(buffer);
	};
	const triggerDownload = (buffer: any) => {
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `Dishes_Analytics_${inTime}_to_${outTime}.xlsx`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const {isLoading, error, data, refetch} = useQuery({
		queryKey: ['getDish', businessId, inTime, outTime, selectedSubIcon==='dish'],
		queryFn: getDish,
		enabled: !!businessId && !!inTime && !!outTime && selectedSubIcon==='dish',
	})

	if(error) return <ErrorComponent refetch={refetch}/>
	return (
		<div className="relative">
			<div className="bg-[#f5f5f5] sticky top-0 z-20">
				<Header
					title="Analytics"
					onBack={() => setSelectedSubIcon("")}
					leftIcon={<BsChevronLeft />}
					centerImage={Hi}
					rightImage={Hi}
					isIconBusinessShow={true}
				/>
				<div className="flex justify-between items-center mt-6 px-6 pb-2 border-b border-[#cacaca]">
					<div className="ml-2 text-xl"> Dish</div>
					<div
						onKeyDown={exportToExcel}
						onClick={exportToExcel}
						className="bg-white on_active_bounce text-sm space-x-2 py-1 px-2 flex justify-center items-center border border-[#cacaca] rounded-lg"
					>
						<BiDownload />
						<button type="button">CSV</button>
					</div>
				</div>
				<DateRangePicker />
			</div>
			<div className="relative masonry-layout w-full px-6 pb-[2rem] mt-6 overflow-auto scroll-smooth space-y-4">
				{isLoading ? (
					<LoadingSpinner />
				) : dish && dish.length > 0 ? (
					<>
						<div className="masonry-item">
							{dish?.map((eachDish: IAnalyticsItem) => (
								<>
									<Disclosure>
										{({ open }) => {
											return (
												<>
													<div className="border border-[#cacaca] rounded-lg my-4">
														<Disclosure.Button className="w-full p-4">
															<section className="flex justify-between items-center">
																<h1 className="text-base font-semibold capitalize">
																	{eachDish?.categoryName}
																</h1>
																<AiFillCaretDown
																	className={`ml-2 h-4 w-4 ${
																		open ? "transform rotate-180" : ""
																	}`}
																/>
															</section>
															<section className="mt-2 text-base flex justify-between items-center">
																<h1>{eachDish?.orders} orders</h1>
																<h1>{eachDish?.percentage} %</h1>
															</section>
														</Disclosure.Button>
														{eachDish?.dishes?.map((eachChild, index) => {
															return (
																<Disclosure.Panel
																	key={index.toString()}
																	className="mx-4 text-sm"
																>
																	<div className="pb-4 space-y-2 text-sm font-medium">
																		<hr className="bg-[#cacaca]" />
																		<div className="flex justify-between items-center">
																			<div className="flex items-center">
																				<IoFastFoodOutline className="text-2xl" />
																				<span className="ml-2">
																					{eachChild?.name}
																				</span>
																			</div>
																			<div className="flex justify-between items-center">
																				<span>{eachChild?.orders}</span>
																			</div>
																		</div>
																	</div>
																</Disclosure.Panel>
															);
														})}
													</div>
												</>
											);
										}}
									</Disclosure>
								</>
							))}
						</div>
						<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
							{dish && dish.length > 0 && (
								<button
									type="button"
									onClick={() =>
										handleClick(currentPage > 1 ? currentPage - 1 : 1)
									}
									disabled={currentPage === 1}
									className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
								>
									<BiChevronsLeft />
								</button>
							)}

							{[...Array(totalPages)].map((_, idx) => (
								<button
									type="button"
									key={idx.toString()}
									onClick={() => handleClick(idx + 1)}
									disabled={currentPage === idx + 1}
									className={`w-10 h-10 flex justify-center items-center ${
										currentPage === idx + 1
											? "bg-[#2B354D] border-[#2B354D] border rounded-full text-white"
											: "bg-white text-black border rounded-full border-[#2B354D]"
									}`}
									style={{
										display:
											idx >= currentPage - 1 && idx <= currentPage + 1
												? "inline-flex"
												: "none",
									}}
								>
									{idx + 1}
								</button>
							))}

							{dish && dish.length > 0 && (
								<button
									type="button"
									onClick={() =>
										handleClick(
											currentPage < totalPages ? currentPage + 1 : totalPages,
										)
									}
									className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
									disabled={currentPage === totalPages}
								>
									<BiChevronsRight />
								</button>
							)}
						</div>
					</>
				) : (
					<>
						<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
							No Dish Analytics Found
							<div className="text-base">
								({inTime && outTime ? `${inTime} to ${outTime} ` : ""} )
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default memo(AnalyticsDish);
