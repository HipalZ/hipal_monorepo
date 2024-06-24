import React, { startTransition } from "react";
import { useState, memo, useRef, useEffect, lazy } from "react";
import { BiBowlRice, BiPlus } from "react-icons/bi";
import type { IStatus } from "@/components/types/hiTableData";
import { MdDelete, MdOutlineLowPriority, MdPriorityHigh } from "react-icons/md";
import { useLogin } from "@/components/store/useLogin";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/atoms/loader";
import { toast } from "react-toastify";
import { HiX } from "react-icons/hi";
import DeleteMultipleDishes from "@/components/atoms/deleteMultipleDishes";
import { TbTransferIn } from "react-icons/tb";
import TransferMultipleDishes from "@/components/atoms/transferMultipleDishes";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

const DishStatusComponent = lazy(() => import("@/components/atoms/dishStatus"));

const Priority = lazy(() => import("@/components/atoms/makePriority"));

const DayOutPopup = lazy(() => import("@/components/atoms/dayoutPopup"));

const DishStatus = ({ activeButton }:{activeButton:string}):JSX.Element => {
	const params = useParams<{
		businessId: string;
		zoneId: string;
		tableId: string;
	}>();
	const { businessId, zoneId, tableId } = params;
	const navigate = useNavigate();
	const [statusData, setStatusData] = useState<IStatus[][]>([]);
	const [selectedDishStatus, setSelectedDishStatus] = useState<IStatus | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [multipleDishDeletePopup, setMultipleDishDeletePopup] = useState(false);
	const [transferMultipleDishPopup, setTransferMultipleDishPopup] =
		useState(false);
	const [isPriorityPopupOpen, setIsPriorityPopupOpen] = useState(false);
	const setGrouped_customers = useLogin((s) => s.setGrouped_customers);
	const [isFabOpen, setIsFabOpen] = useState(false);
	const fabRef = useRef<null | HTMLDivElement>(null);
	const retryCount = useRef(0);
	const openModal = (kot: IStatus) => {
		setIsModalOpen(true);
		setSelectedDishStatus(kot);
	};
	const handleConfirm = (data:string) => {
		if (data === "Priority") {
			setIsModalOpen(false);
		}
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};
	const groupedCustomers = statusData.flat().reduce((acc, customer) => {
		const { customerPhone, customerName } = customer;
		const existingCustomer = acc[customerPhone];

		if (customerName) {
			if (existingCustomer) {
				if (!existingCustomer.customerNames.includes(customerName)) {
					existingCustomer.customerNames = customerName;
				}
			} else {
				acc[customerPhone] = { customerPhone, customerNames: customerName };
			}
		}
		setGrouped_customers(acc);
		return acc;
	}, {});

	const getAllKotSpecificTable = async () => {
		try {
			const response = await axios.get(
				`/v1/kitchens/kots/allKot?businessId=${businessId}&tableId=${tableId}&zoneId=${zoneId}`,
			);
			const kotData = response.data.data;
			setStatusData(kotData);
			return kotData;
		} catch (error) {
			toast.error("Error fetching data");
		}
	};

	const makePriority = () => {
		setIsModalOpen(false);
		setIsPriorityPopupOpen(true);
	};

	const openMultipleDeleteModal = () => {
		setMultipleDishDeletePopup(true);
	};

	const handleDishStatus = async (kotId: string) => {
		try {
			const config = {
				method: "put",
				url: "/v1/kitchens/update/kots/dish",
				data: {
					kots: [kotId],
				},
			};
			await axios(config);
			refetch();
			closeModal();
		} catch (error) {
			toast.error("Error updating status try again");
		}
	};

	const toggleFab = () => {
		setIsFabOpen(!isFabOpen);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (fabRef.current && !fabRef?.current?.contains(event.target)) {
				setIsFabOpen(false);
			}
		};

		document.addEventListener("touchstart", handleClickOutside);
		return () => {
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, []);

	const { isLoading, error, data, refetch } = useQuery({
		queryKey: ["getAllKotSpecificTable", businessId, tableId, zoneId],
		queryFn: getAllKotSpecificTable,
		enabled: !!businessId && !!tableId && !!zoneId,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	const handleRetryClick = () => {
		retryCount.current += 1;
		if (retryCount.current >= 5) {
			startTransition(()=>{
				navigate(`/r/${businessId}/login`);
			})
		} else {
			getAllKotSpecificTable();
		}
	};
	if (error) {
		<div className="flex items-center justify-center h-screen">
			<Link to={`/r/${businessId}/login`}>
				<button className="btn" type="button">
					Home
				</button>
			</Link>
			<button onClick={handleRetryClick} className="btn" type="button">
				Retry
			</button>
		</div>;
	}

	return (
		<div>
			{activeButton.toLowerCase() === "status" && (
				<div className="pb-[5rem] masonry-layout mx-6 mt-4">
					<Orders data={statusData} openModal={openModal} />
					<div ref={fabRef} className="fixed bottom-[1rem] left-6">
						<div
							className={`flex flex-col space-y-2 transform origin-bottom ${
								isFabOpen ? "opacity-100 scale-y-1" : "opacity-0 scale-y-0"
							} fab-transition`}
						>
							<button
								type="button"
								onClick={() => setTransferMultipleDishPopup(true)}
								className="absolute flex items-center px-4 py-2 mr-2 text-sm border rounded-full bottom-12 text-nowrap border-base-100 text-base-100 bg-primary whitespace-nowrap"
							>
								<TbTransferIn size={20} /> &nbsp; Transfer Dishes
							</button>
						</div>
						<div
							className={`flex flex-col space-y-2 transform origin-bottom ${
								isFabOpen ? "opacity-100 scale-y-1" : "opacity-0 scale-y-0"
							} fab-transition`}
						>
							<button
								type="button"
								onClick={openMultipleDeleteModal}
								className="absolute bottom-0 flex items-center px-4 py-2 mr-2 text-sm border rounded-full text-nowrap border-base-100 text-base-100 bg-primary whitespace-nowrap"
							>
								<MdDelete size={20} /> &nbsp; Delete dishes
							</button>
						</div>
						<button
							type="button"
							onClick={toggleFab}
							className="flex items-center justify-center w-12 h-12 mt-2 rounded-full shadow-lg text-base-100 bg-primary"
						>
							{isFabOpen ? (
								<HiX className="text-2xl" />
							) : (
								<BiPlus className="text-3xl" />
							)}
						</button>
					</div>
				</div>
			)}
			{isModalOpen && (
				<DayOutPopup show={isModalOpen} onClose={() => setIsModalOpen(false)}>
					<div className="relative pb-[5rem] rounded-t-3xl bg-secondary/20">
						<div className="capitalize flex items-center font-[500] ml-6 pt-4 rounded-t-2xl text-base-content">
							{selectedDishStatus?.tableName}
						</div>
						<div className="mt-4 border border-b-dashed" />

						<div className="flex justify-between mx-4 mt-4 mb-6">
							<div className="w-[60%] mx-2 font-[500]">
								<div className="text-xl font-semibold capitalize">
									{selectedDishStatus?.dish?.name}
								</div>
								<DishStatusComponent selectedDishStatus={selectedDishStatus} />
							</div>
							<div className="flex flex-col space-y-4">
								<div className="text-right text-md font-[500] text-primary">
									{selectedDishStatus?.kotTime?.slice(0, 5)}
								</div>
								<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
									{selectedDishStatus?.kotDate?.slice(0, 10)}
								</div>
							</div>
						</div>
						{!selectedDishStatus?.isDeleted &&
							selectedDishStatus?.dishStatus === "cooking" &&
							!selectedDishStatus?.priority && (
								<div
									onClick={makePriority}
									className="flex items-center justify-between px-4 py-4 mx-6 mt-4 text-sm border border-base-300 bg-base-100 rounded-2xl"
								>
									<div className="flex items-center justify-center">
										<MdOutlineLowPriority />
										<span className="ml-2">Cook this item first</span>
									</div>
									<div className="text-[#F04B4B] font-medium">Cook First</div>
								</div>
							)}

						<div
							className={`${
								selectedDishStatus?.dishStatus !== "cooked" ||
								selectedDishStatus?.isDeleted
									? "hidden"
									: "fixed bottom-0 z-20 w-full py-2 mx-6 shadow-lg shadow-base-100"
							}`}
						>
							<button
								type="button"
								onClick={() =>
									handleDishStatus(
										selectedDishStatus?._id || selectedDishStatus?._id,
									)
								}
								className="py-4 w-[85%] space-x-2 text-base-100 bg-primary rounded-full"
							>
								Mark as delivered
							</button>
						</div>
					</div>
				</DayOutPopup>
			)}

			{multipleDishDeletePopup && (
				<DayOutPopup
					show={multipleDishDeletePopup}
					onClose={() => setMultipleDishDeletePopup(false)}
				>
					<DeleteMultipleDishes
						onClose={() => setMultipleDishDeletePopup(false)}
						statusData={statusData}
						refetch={refetch}
					/>
				</DayOutPopup>
			)}

			{isPriorityPopupOpen && (
				<DayOutPopup
					show={isPriorityPopupOpen}
					onClose={() => setIsPriorityPopupOpen(false)}
				>
					<Priority
						onConfirm={handleConfirm}
						closeModal={() => setIsPriorityPopupOpen(false)}
						selectedDishStatus={selectedDishStatus}
						kotId={selectedDishStatus?._id || selectedDishStatus?._id}
						getAllStatusData={refetch}
					/>
				</DayOutPopup>
			)}
			{transferMultipleDishPopup && (
				<DayOutPopup
					show={transferMultipleDishPopup}
					onClose={() => setTransferMultipleDishPopup(false)}
				>
					<TransferMultipleDishes
						onClose={() => setTransferMultipleDishPopup(false)}
						statusData={statusData}
						refetch={refetch}
					/>
				</DayOutPopup>
			)}
		</div>
	);
};

export default memo(DishStatus);

export function OrderHeader({ kot }: { kot: IStatus }) {
	return (
		<div className="flex justify-between pt-4 mx-4">
			<div className="flex flex-col">
				<div className="font-[600] capitalize text-xl">
					{kot?.tableName}
					{kot.switchedBy && kot.switchedBy !== "" ? (
						<h6 className="text-xs text-primary">
							Table Switched by {kot.switchedBy}
						</h6>
					) : null}
					{kot?.transferBy && kot?.transferBy !== "" ? (
						<h6 className="text-xs text-primary">
							Item Transferred by {kot.transferBy}
						</h6>
					) : null}
				</div>
				<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
					{kot?.customerName}
				</div>
			</div>
			<div className="flex flex-col space-y-2">
				<div className="text-right text-sm font-[500] text-primary">
					{kot?.kotTime?.slice(0, 5)}
				</div>
				<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
					{kot?.kotDate?.slice(0, 10)}
				</div>
			</div>
		</div>
	);
}

export function DishDetail({ kot, openModal }:{ kot: IStatus, openModal: (kot: IStatus) => void}) {
	return (
		<div className="flex justify-between mx-4 mt-4">
			<div className="w-[10%] font-[500]">{kot?.dish?.qty} x</div>
			<div className="w-[60%] -ml-4 font-[500]">
				{kot?.dish?.name}
				<div className="mt-1 text-sm font-semibold capitalize text-base-content/40">
					{kot?.dish?.portions?.name}
				</div>
				<div className="mt-1 mb-2 text-xs font-normal capitalize text-base-content/40">
					{kot?.dish?.extras?.map((extra) => `${extra?.name}, `)}
				</div>
				{kot?.instructions && (
					<span className="p-2 mt-1 text-xs font-normal capitalize border rounded-md bg-primary/10 border-primary text-base-content/60">
						{kot?.instructions}
					</span>
				)}
			</div>
			<div
				className={`${
					kot.dishStatus === "delivered" ? "" : ""
				} w-[15%] text-right text-md font-[500] text-primary`}
				onClick={() => openModal(kot)}
			>
				Status
			</div>
		</div>
	);
}

export function StatusButton({ kot }: { kot: IStatus }) {
	const statusDetails = {
		delivered: {
			className: "bg-[#DBFFE2] text-[#00BA34]",
			iconColor: "bg-[#00BA34]",
		},
		cooked: {
			className: "bg-[#E0EBFF] text-[#5591FF]",
			iconColor: "bg-[#5591FF]",
		},
		deleted: {
			className: "bg-[#F5E5E5] text-[#F04B4B]",
			iconColor: "bg-[#F04B4B]",
		},
		default: {
			className: "bg-[#FFF6DB] text-[#FFC318]",
			iconColor: "bg-[#FFC318]",
		},
	};

	let status = statusDetails[kot?.dishStatus] || statusDetails.default;

	if (kot?.isDeleted) {
		status = statusDetails.deleted;
	}

	return (
		<div className="pb-4 mx-4">
			<button
				type="button"
				className={`font-normal relative px-2 text-black rounded-full ${status.className}`}
			>
				<div className="flex items-center justify-center">
					{kot?.isDeleted ? (
						<div
							className={`w-[1.5rem] h-[1.5rem] ${status.iconColor} rounded-full flex items-center justify-center`}
						>
							<MdDelete className="text-base-100" />
						</div>
					) : (
						<div
							className={`w-[1.5rem] h-[1.5rem] ${status.iconColor} rounded-full flex items-center justify-center`}
						>
							<BiBowlRice className="text-base-100" />
						</div>
					)}

					{kot?.isDeleted ? (
						<>
							<div
								className={`mb-[0.1rem] capitalize font-[500] text-lg ${status.className} pr-1 pl-1 ml-2 mt-[0.125rem]`}
							>
								<span className="text-[#F04B4B]">deleted</span>
							</div>
						</>
					) : (
						<>
							<div
								className={`mb-[0.1rem] capitalize font-[500] text-lg ${status.className} pr-1 pl-1 ml-2 mt-[0.125rem]`}
							>
								{kot?.dishStatus}
							</div>
							{kot?.priority && (
								<div className="flex items-center ml-2">
									<div className="w-[1.5rem] h-[1.5rem] bg-[#FF4500] rounded-full flex items-center justify-center">
										<MdPriorityHigh className="text-base-100" />
									</div>
									<div className="ml-2 bg-[#FF4500] text-base-100 text-sm rounded-2xl px-2">
										Priority
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</button>
			{kot?.isDeleted && (
				<small className="text-[#FF4500] block mt-2">
					Dish Deleted by {kot.staffName}
				</small>
			)}
		</div>
	);
}

export function Orders({ data, openModal }:{ data: IStatus[][], openModal: (kot: IStatus) => void }) {
	return data.map((ele:IStatus[], i) => {
		const kot = ele[0];
		if (!kot) return null;
		return (
			<div key={i} className="pr-2 mb-6 bg-base-100 masonry-item rounded-2xl">
				<OrderHeader kot={kot} />
				<div className="mx-4 mt-4 border-2 rounded-full border-gray-400/30" />
				{ele.map((kot) => (
					<div key={kot._id}>
						<DishDetail kot={kot} openModal={openModal} />
						<div className="pt-4">
							<StatusButton kot={kot} />
						</div>
						<div className="mx-4 border-b border-dashed" />
					</div>
				))}
			</div>
		);
	});
}
