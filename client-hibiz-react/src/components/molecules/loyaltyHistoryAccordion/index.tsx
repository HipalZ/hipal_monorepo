import BillSummary from "@/components/atom/billSummary";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import type { Item } from "@/pages/app/business/[businessId]/loyalty/[loyaltyId]";
import { Disclosure } from "@headlessui/react";
import { memo, useEffect, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import { MdPerson } from "react-icons/md";

const LoyaltyHistoryAccordion = ({
	itemsData,
	isLoading,
	pageNumberFunction,
	pageNumber,
}: {
	itemsData: Item[];
	isLoading: boolean;
	pageNumberFunction: (newPage: number) => void;
	pageNumber: number;
}) => {
	const [items, setItems] = useState<Item[]>([]);
	useEffect(() => {
		setItems(itemsData);
	}, [itemsData]);
	const [currentPage, setCurrentPage] = useState(1);
	const handleClick = (newPage: number) => {
		setCurrentPage(newPage);
		pageNumberFunction(newPage);
	};

	return (
		<>
			<div className="relative masonry-layout w-full px-6 pb-[10rem] mt-6 overflow-auto scroll-smooth space-y-4">
				{isLoading ? (
					<LoadingSpinner />
				) : items.length > 0 ? (
					items.map((item) => (
						<Disclosure key={item.id}>
							{({ open }) => (
								<Disclosure>
									{({ open }) => (
										<>
											<div className="border border-[#cacaca] rounded-xl masonry-item">
												<Disclosure.Button
													className={`w-full px-4 py-2 rounded-t-xl ${
														item?.status === "plus"
															? "bg-[#EEF7EA] border-[#219653] text-[#3E5743]"
															: ""
													}`}
												>
													<div
														className={`flex justify-between  ${
															item?.status === "plus"
																? "text-[#3E5743] font-semibold"
																: "text-[#F2634C] font-semibold"
														}`}
													>
														<div className="space-x-2">
															<span>₹ {item?.rewards}</span>
															{
																<span className="text-sm">
																	{item?.status === "plus"
																		? "added"
																		: "deducted"}
																</span>
															}
														</div>
														<div className="text-sm font-normal opacity-60">
															{item?.day} {item?.time}
														</div>
													</div>

													<div className="flex items-center justify-between space-y-4 ">
														<div
															className={`text-sm font-medium opacity-70 mt-2 ${
																item?.status === "plus" ? "text-[#3E5743]" : ""
															}`}
														>
															<span className="capitalize">
																{" "}
																{item?.userName}
															</span>{" "}
															<span className="">( {item?.userPhone} )</span>
														</div>
														<div className="flex items-center">
															<p>{item?.tableName}</p>
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
															<span className="ml-2">{item?.waiterName}</span>
														</div>{" "}
														<div>{item?.tableName}</div>
													</div>
													{/* Here you can add code to display items and their amounts */}
													<div className="border-b border-[#cacaca] pb-4">
														<div className="mt-4 font-medium">
															<div className="flex justify-between font-medium">
																<span>items</span>
																<span>Rupees</span>
															</div>
														</div>
														{item?.items?.map((item: Item, index: number) => (
																<div
																	className="mt-1 font-medium opacity-70"
																	key={index.toString()}
																>
																	<div className="flex justify-between font-medium">
																		<span>{item?.name}</span>
																		<span>₹ {item?.amount || item?.price}</span>
																	</div>
																</div>
															))}
													</div>

													<BillSummary {...item} />
												</Disclosure.Panel>
											</div>
										</>
									)}
								</Disclosure>
							)}
						</Disclosure>
					))
				) : (
					<>
						<span className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 left-1/2">
							No data Found
						</span>
					</>
				)}
			</div>
			<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
				{items && items.length >= 0 && (
					<button
						type="button"
						onClick={() => handleClick(pageNumber - 1)}
						disabled={pageNumber === 1}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsLeft />
					</button>
				)}
				<p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
					{pageNumber || currentPage}
				</p>
				{items && items.length > 0 && (
					<button
						type="button"
						onClick={() => handleClick(pageNumber + 1)}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsRight />
					</button>
				)}
			</div>
		</>
	);
};

export default memo(LoyaltyHistoryAccordion);
