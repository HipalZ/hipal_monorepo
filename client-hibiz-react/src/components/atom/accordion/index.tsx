import { Disclosure } from "@headlessui/react";
import { AiFillCaretDown } from "react-icons/ai";
import { MdPerson } from "react-icons/md";
import { memo, startTransition, useEffect, useState } from "react";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import useTimings from "@/components/store/useTimings";
import type { BillsData } from "@/components/types/businessData";
import axios from "@/axios";
import PopUp from "../popUp";
import useDiscountStore from "@/components/store/useValueStore";
import { toast } from "react-toastify";
import SplitPaymentModal from "../splitPayment";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import BillSummary from "../billSummary";
import LoadingSpinner from "../loadingSpinner";
import { usePaymentMethodsStore } from "@/components/store/usePaymentStore";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export interface PaymentMethod {
	businessId: string;
	mode: string;
	commission: number;
	id: string;
}

const Bills = memo(({
	billsData,
	isLoadingBills,
	fetchBillsData,
	pageNumberFunction,
}: {
	billsData: BillsData | null;
	isLoadingBills: boolean;
	fetchBillsData: () => void;
	pageNumberFunction: (newPage: number) => void;
}) => {
	const { inTime, outTime } = useTimings();
	const location = useLocation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [footButton, setFootButton] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingPopup, setLoadingPopup] = useState(false);
	const userName = useOwnerLogin((s) => s.user?.name);
	const [editBillId, setEditBillId] = useState("");
	const { paymentMethods, lastUpdated, setPaymentMethods } =
		usePaymentMethodsStore();
	const {
		selectedPaymentMethod,
		setSelectedPaymentMethod,
		multiplePaymentMethods,
		setMultiplePaymentMethods,
	} = useDiscountStore();

	const navigate = useNavigate();
	const { businessId } = useParams<{ businessId: string }>()
	const [currentPage, setCurrentPage] = useState(1);
	const handleClick = (newPage: number) => {
		setCurrentPage(newPage);
		pageNumberFunction(newPage);
	};
	const openModal = async (modalContent: string) => {
		setFootButton(modalContent);
		setIsModalOpen(true);
	};
	const closeModal = () => {
		setIsModalOpen(false);
		setFootButton("");
	};

	const handlePaymentMethodSelection = async (methodId: string) => {
		if (methodId.toLowerCase() === "split payment") {
			setSelectedPaymentMethod(methodId);
			openModal(methodId);
		} else if (selectedPaymentMethod === methodId) {
			setSelectedPaymentMethod("");
		} else {
			setSelectedPaymentMethod(methodId);
		}
	};
	const handleMultiplePaymentMethodSelection = (methodId: string) => {
		if (multiplePaymentMethods.includes(methodId)) {
			setMultiplePaymentMethods(
				multiplePaymentMethods.filter((method) => method !== methodId),
			);
		} else {
			setMultiplePaymentMethods([...multiplePaymentMethods, methodId]);
		}
	};

	const finalClick = async () => {
		if (!selectedPaymentMethod) {
			return toast.error("Please Select the Mode");
		}
		if (selectedPaymentMethod === "split payment") {
			return toast.error("Please Select different Mode");
		}
		if (loading) {
			return;
		}

		setLoading(true);

		try {
			const config = {
				method: "put",
				url: `/v1/payments/${editBillId}`,
				data: {
					mode: selectedPaymentMethod,
					waiterName: userName,
				},
			};
			const res = await axios(config);
			if (res.status) {
				toast.success("paymode updated successfully");
				setSelectedPaymentMethod("");
				setEditBillId("");
				fetchBillsData();
				closeModal();
			}
		} catch (error: any) {
			console.error(error?.response?.data);
			toast.error(error?.response?.data);
		} finally {
			setLoading(false);
		}
	};

	const splitFinalClick = async (data: any) => {
		if (!selectedPaymentMethod) {
			return toast.error("Please Select the Mode");
		}
		if (loading) {
			return;
		}

		setLoading(true);

		try {
			const config = {
				method: "put",
				url: `/v1/payments/${editBillId}`,
				data: {
					mode: "multiple",
					modeBreakDown: data,
					waiterName: userName,
				},
			};

			const res = await axios(config);
			if (res.status) {
				setMultiplePaymentMethods([]);
				toast.success("pay mode updated successfully");
				setEditBillId("");
				fetchBillsData();
				closeModal();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get('tab') !== 'Bills') {
			params.set('tab', 'Bills');
			startTransition(() => {
				navigate({ search: params.toString() }, { replace: true });
			})
		}
	}, [location, navigate]);

	const fetchPaymentMethods = async () => {
		if (!(lastUpdated === null || Date.now() - lastUpdated > 3 * 60000)) {
			return;
		}
		try {
			const response = await axios.get(
				`/v1/payments/Get/Modes?businessId=${businessId}`,
			);
			setPaymentMethods(response.data);
		} catch (error) {
			console.error("Failed to fetch payment methods", error);
		}
	};

	return (
		<>
			{billsData && billsData.length > 0 ? (
				<div className="relative masonry-layout w-full px-6 pb-[10rem] mt-6 overflow-auto scroll-smooth space-y-4">
					{billsData.map((bill, index) => (
						<div key={index.toString()}>
							<Disclosure>
								{({ open }) => {
									let formattedEntries: any;
									if (bill?.mode?.toLowerCase() === "multiple") {
										formattedEntries = Object.entries(bill?.modeBreakDown)
											.map(([key, value]) => `${key}: ${value}`)
											.join("\n");
									}
									return (
										<>
											<div className="border border-[#cacaca] rounded-xl masonry-item ">
												<Disclosure.Button className="w-full p-4 ">
													<div className="flex justify-between">
														<div className="font-medium">₹ {bill?.total}</div>
														<div className="text-sm opacity-60">
															{bill?.paymentDate} {bill?.time}
														</div>
													</div>

													<div className="flex items-center justify-between">
														<div className="text-base font-medium opacity-70">
															{bill?.customerName === "undefined"
																? bill?.waiterName
																: bill?.customerName.slice(0, 16)}
														</div>
														<div className="flex items-center">
															<div>{bill?.tableName}</div>
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
															<MdPerson />
															<span className="ml-2">
																{bill?.waiterName}
															</span>
														</div>
														<div className="capitalize">
															{bill?.mode?.toLowerCase() === "multiple" ? (
																<pre className="text-sm font-medium">
																	{formattedEntries}
																</pre>
															) : (
																bill?.mode
															)}
														</div>
													</div>
													{/* Here you can add code to display items and their amounts */}
													<div className="border-b border-[#cacaca] pb-4">
														<div className="mt-4 font-medium">
															<div className="flex justify-between font-medium">
																<span>Items</span>
																<span>Rupees</span>
															</div>
														</div>
														{bill.items &&
															bill?.items?.map((item, index) => (
																<div
																	className="mt-1 font-medium opacity-70"
																	key={index}
																>
																	<div className="flex justify-between font-medium">
																		<span>{item?.name}</span>
																		<span>₹ {item?.amount}</span>
																	</div>
																</div>
															))}
													</div>
													<BillSummary {...bill} />
													<div
														onClick={async () => {
															setLoadingPopup(true);
															await fetchPaymentMethods();
															setLoadingPopup(false);
															openModal("settle");
															setEditBillId(bill?.id);
														}}
														className="border border-[#cacaca] font-semibold text-center rounded-md py-1 mb-4"
													>
														Edit Payment Mode
													</div>
													{isModalOpen && editBillId === bill.id && (
														<PopUp show={isModalOpen} onClose={closeModal}>
															{footButton.toLowerCase() === "settle" && (
																<div className="relative min-h-[70vh]">
																	<div className="flex justify-between mt-4">
																		<div className="capitalize font-[500] ml-6 text-[#002D4B] text-[1rem] leading-[1.25rem]">
																			Payment Mode
																		</div>
																		<div className="capitalize font-[500] mr-[1.5rem] text-[#002D4B] text-[1rem] leading-[1.25rem]">
																			₹ {bill?.total}
																		</div>
																	</div>
																	{loadingPopup ? (
																		<LoadingSpinner />
																	) : paymentMethods.filter(
																		(method) => method?.mode !== "dues",
																	).length > 0 ? (
																		<div className="mx-6 mt-4 space-y-4 overflow-y-auto max-h-[70vh] pb-[7rem]">
																			{paymentMethods
																				.filter(
																					(method) => method?.mode !== "dues",
																				)
																				.map((method) => {
																					return (
																						<div key={method.id}>
																							<div
																								className={`${bill?.mode === method?.mode
																										? "pointer-events-none opacity-50"
																										: ""
																									} flex items-center px-4 py-2 border rounded-xl`}
																								onClick={() =>
																									handlePaymentMethodSelection(
																										method?.mode,
																									)
																								}
																							>
																								<input
																									id={`method-${method.id}`}
																									type="checkbox"
																									value={selectedPaymentMethod}
																									checked={
																										selectedPaymentMethod ===
																										method?.mode
																									}
																								/>
																								<div className="ml-4 font-medium capitalize line-clamp-1">
																									{method?.mode}
																								</div>
																							</div>
																						</div>
																					);
																				})}
																		</div>
																	) : (
																		<div className="text-center">
																			No payment modes found
																		</div>
																	)}

																	<div className="w-full max-w-[28rem] h-[4rem] bg-[#2b354d] fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
																		<button type="button" className="absolute px-4 text-base py-2 font-[500]  text-white bg-[#2b354d] rounded-full bottom-3 left-2">
																			₹ Payment Modes
																		</button>
																		<button
																			type="button"
																			onClick={finalClick}
																			className={`absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-white border text-[#2b354d] bg-white rounded-full right-6 bottom-3 ${loading
																					? "opacity-50 cursor-not-allowed"
																					: ""
																				}`}
																			disabled={loading}
																		>
																			{loading ? "Loading..." : "Continue"}
																		</button>
																	</div>
																</div>
															)}
															{footButton.toLowerCase() === "split payment" && (
																<div className="relative min-h-[80vh]">
																	<div className="flex justify-between mt-4">
																		<div className="capitalize font-[500] ml-6 text-[#002D4B] text-[1rem] leading-[1.25rem]">
																			select payment methods
																		</div>
																		<div className="capitalize font-[500] mr-[1.5rem] text-[#002D4B] text-[1rem] leading-[1.25rem]">
																			₹ {bill?.total}
																		</div>
																	</div>
																	<div className="mx-6 mt-4 space-y-4 overflow-y-auto max-h-[70vh] pb-[7rem]">
																		{paymentMethods
																			.filter(
																				(method) =>
																					method?.mode !== "dues" &&
																					method?.mode !== "split payment" &&
																					method?.mode !== "complimentary",
																			)
																			.map((method) => (
																				<div

																					key={method.id}
																					className={`flex items-center px-4 py-2 border rounded-xl ${multiplePaymentMethods.includes(
																						method?.mode,
																					)
																							? "border-[#2b354d]"
																							: ""
																						}`}
																					onClick={() =>
																						handleMultiplePaymentMethodSelection(
																							method?.mode,
																						)
																					}
																				>
																					<input
																						id={`method-${method.id}`}
																						type="checkbox"
																						checked={multiplePaymentMethods.includes(
																							method?.mode,
																						)}
																					/>
																					<div className="ml-4 font-medium capitalize line-clamp-1">
																						{method?.mode}
																					</div>
																				</div>
																			))}
																	</div>

																	<div className="w-full h-[4rem] bg-[#2b354d] fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
																		<button
																			type="button"
																			onClick={() => {
																				if (multiplePaymentMethods.length > 1) {
																					openModal("split");
																					return;
																				} else {
																					toast.error(
																						"select atleast 2 payment methods",
																					);
																				}
																			}}
																			className={`absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-white border text-[#2b354d] bg-white rounded-full right-6 bottom-3 ${loading
																					? "opacity-50 cursor-not-allowed"
																					: ""
																				}`}
																			disabled={loading}
																		>
																			{loading ? "Loading..." : "Continue"}
																		</button>
																	</div>
																</div>
															)}
															{footButton.toLowerCase() === "split" && (
																<SplitPaymentModal
																	billAmount={bill?.total}
																	selectedMethods={multiplePaymentMethods}
																	splitFinalClick={splitFinalClick}
																/>
															)}
														</PopUp>
													)}
												</Disclosure.Panel>
											</div>
										</>
									);
								}}
							</Disclosure>
						</div>
					))}
				</div>
			) : (
				<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					<p>No Bills Found</p>
					<span>
						{inTime && outTime && (
							<div className="text-base">
								({inTime} to {outTime} )
							</div>
						)}
					</span>
				</div>
			)}
			<div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
				{billsData && billsData.length >= 0 && (
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
			{isLoadingBills && <LoadingSpinner />}
		</>
	);
})

export default Bills
