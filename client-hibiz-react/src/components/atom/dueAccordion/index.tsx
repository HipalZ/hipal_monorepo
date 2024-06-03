import { Disclosure } from "@headlessui/react";
import { memo, startTransition, useState } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import useTimings from "@/components/store/useTimings";
import type { IDuesData } from "@/components/types/businessData";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import { PAGE_TYPES, routePathsWithIds } from "@/components/utils/routes";
import BillSummary from "../billSummary";
import { useNavigate, useParams } from "react-router-dom";

const DueAccordion = memo(({ activeDues }: { activeDues: IDuesData | null }) =>{
	const navigate = useNavigate();
	const dues = activeDues?.items || [];
	const { inTime, outTime } = useTimings();
	const { businessId, duesPersonId } = useParams<{
		businessId: string;
		duesPersonId: string;
	}>();
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 20;

	const totalPages = dues ? Math.ceil(dues.length / itemsPerPage) : 0;

	const handleClick = (newPage: number) => {
		setCurrentPage(newPage);
	};

	const settleDues = () => {
		startTransition(()=>{
			navigate(
				routePathsWithIds[PAGE_TYPES.CLEAR_DUE](businessId || '', duesPersonId || ""),
			);
		})
	};

	return (
		<>
			<div className="relative w-full px-6 pb-[10rem] mt-6 overflow-auto scroll-smooth space-y-4">
				{dues && dues.length > 0 ? (
					dues
						.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
						.map((bill, index) => (
							<div key={index.toString()}>
								<Disclosure>
									{({ open }) => (
										<>
											<div className="border border-[#cacaca] rounded-xl">
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
															{bill?.date.slice(0, 16)}
														</div>
													</div>

													<div className="flex items-center justify-between">
														<div className="text-base font-medium opacity-70">
															{bill?.customerName}
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
															<MdPerson />
															<span className="ml-2">{bill?.customerName}</span>
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
															? bill?.items?.map((item, index) => (
																	<div
																		className="mt-1  font-medium opacity-70"
																		key={index}
																	>
																		<div className="flex justify-between font-medium">
																			<span>{item?.name}</span>
																			<span>₹ {item?.amount}</span>
																		</div>
																	</div>
															  ))
															: null}
													</div>
													<BillSummary {...bill}/>
												</Disclosure.Panel>
											</div>
										</>
									)}
								</Disclosure>
							</div>
						))
				) : (
					<div>
						<div className="text-center text-xl font-medium text-[#2B354D] mt-4 opacity-60">
							No Dues Found {activeDues?.userName}
							<div className="text-base">
								({inTime && outTime ? `${inTime} to ${outTime} ` : ""} )
							</div>
						</div>
					</div>
				)}
				<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-20 left-1/2">
					{dues && dues.length > 0 && (
						<button
							type="button"
							onClick={() => handleClick(currentPage > 1 ? currentPage - 1 : 1)}
							disabled={currentPage === 1}
							className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
						>
							<BiChevronsLeft />
						</button>
					)}
					{[...Array(totalPages)].map((_, idx) => (
						<button
							type="button"
							key={idx}
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
					{dues && dues.length > 0 && (
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
			</div>
			<div onClick={settleDues} className="fixed w-full bottom-6 px-6">
				<button
					type="button"
					className="w-full text-white bg-[#2B354D] border font-semibold on_active_bounce border-[#2B354D] px-4 py-2 rounded-lg mt-4"
				>
					<div className="flex justify-center items-center">Settle</div>
				</button>
			</div>
		</>
	);
})

export default DueAccordion;
