import { Disclosure } from "@headlessui/react";
import { memo } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import useTimings from "@/components/store/useTimings";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import BillSummary from "../billSummary";

interface IProps {
	tips: any;
	pageNumberFunction: (data: number) => void;
	currentPage: number;
}
const TipsAccordion = memo(({ tips, pageNumberFunction, currentPage }: IProps) => {
	const { inTime, outTime } = useTimings();

	const handleClick = (newPage: number) => {
		if (newPage < 1) return;
		pageNumberFunction(newPage);
	};
	return (
		<>
			<div className="relative w-full px-6 pb-[10rem] mt-6 overflow-auto scroll-smooth space-y-4">
				{tips && tips.length > 0 ? (
					tips.map((bill: any, index: number) => (
						<div key={index.toString()}>
							{bill?.tips > 0 && (
								<Disclosure>
									{({ open }) => (
										<div className="border border-[#cacaca] rounded-xl">
											<Disclosure.Button
												className={`w-full p-4 rounded-xl ${bill?.settle
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
														{bill?.waiterName || bill?.customerName}
													</div>
													<div>
														<AiFillCaretDown
															className={`ml-2 h-3 w-3 ${open ? "transform rotate-180" : ""
																}`}
														/>
													</div>
												</div>
											</Disclosure.Button>
											<Disclosure.Panel className="mx-4 text-sm">
												<div className="flex justify-between border-y opacity-70 border-[#cacaca] text-base py-4">
													<div className="flex items-center">
														<MdPerson className="" />
														<span className="ml-2">{bill?.waiterName || bill?.customerName}</span>
													</div>
													<div>{bill?.tableName}</div>
												</div>
												{/* Here you can add code to display items and their amounts */}
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
																className="mt-1  font-medium opacity-70"
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
									)}
								</Disclosure>
							)}
						</div>
					))
				) : (
					<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
						No Tips Found
						<div className="text-base">
							{inTime && outTime ? `(${inTime} to ${outTime}  )` : ""}
						</div>
					</div>
				)}
			</div>
			<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
				{tips && tips.length >= 0 && (
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
				{tips && tips.length > 0 && (
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
})
export default TipsAccordion
