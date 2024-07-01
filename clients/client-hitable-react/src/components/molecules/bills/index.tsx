import { Disclosure } from "@headlessui/react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import { memo } from "react";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import type { BillsData } from "@/components/types/hiTableData";
import BillSummary from "@/components/atoms/billSummary";
export interface PaymentMethod {
	businessId: string;
	mode: string;
	commission: number;
	id: string;
}

function Bills({
	billsData,
	pageNumber: currentPage,
	pageNumberFunction,
}: {
	billsData: BillsData | null;
	pageNumber: number;
	pageNumberFunction: (newPage: number) => void;
}) {
	const handleClick = (newPage: number) => {
		if (newPage < 1) return;
		pageNumberFunction(newPage);
	};

	return (
		<>
			<div className="relative masonry-layout w-full px-6 pb-[10rem] mt-6 overflow-auto scroll-smooth space-y-4">
				{billsData && billsData.length > 0 ? (
					billsData.map((bill) => (
						<div key={bill._id}>
							<Disclosure>
								{({ open }) => (
									<>
										<div className="border bg-base-100 border-[#cacaca] rounded-xl masonry-item ">
											<Disclosure.Button className="w-full p-4 space-y-2">
												<div className="flex justify-between">
													<div className="font-medium">₹ {bill?.total}</div>
													<div className="text-sm opacity-60">
														{bill?.date?.slice(0, 16)} | {bill?.time}
													</div>
												</div>

												<div className="flex items-center justify-between">
													<div className="text-base font-medium opacity-70">
														{bill.customerName === "undefined"
															? bill?.waiterName
															: bill?.customerName?.slice(0, 16)}
													</div>
													<div className="flex items-center justify-end">
														<div className="opacity-60">{bill?.tableName}</div>
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
														<span className="ml-2">{bill?.waiterName}</span>
													</div>{" "}
													<div>{bill?.mode}</div>
												</div>
												{/* Here you can add code to display items and their amounts */}
												<div className="border-b border-[#cacaca] pb-4">
													<div className="mt-4 font-medium">
														<div className="flex justify-between font-medium">
															<span>items</span>
															<span>Rupees</span>
														</div>
													</div>
													{bill?.items?.map((item, index) => (
														<div
															className="mt-1 font-medium opacity-70"
															key={`${item.name}-${item.amount}${index}`}
														>
															<div className="flex justify-between font-medium">
																<span>{item?.name}</span>
																<span>₹ {item?.amount}</span>
															</div>
														</div>
													))}
												</div>
												<BillSummary {...bill} />
											</Disclosure.Panel>
										</div>
									</>
								)}
							</Disclosure>
						</div>
					))
				) : (
					<div className="mt-4 text-xl font-medium text-center text-primary opacity-60">
						No Bills Found
					</div>
				)}
			</div>
			<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
				{billsData && billsData.length >= 0 && (
					<button
						type="button"
						onClick={() => handleClick(currentPage - 1)}
						className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
					>
						<BiChevronsLeft />
					</button>
				)}
				<p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
					{currentPage}
				</p>
				{billsData && billsData.length > 0 && (
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

export default memo(Bills);
