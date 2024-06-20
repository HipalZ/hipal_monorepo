import HeaderButton from "@/components/atoms/buttons/headerButton";
import { memo, useState } from "react";
import {
	MdAlarm,
	MdDelete,
	MdOutlineLowPriority,
	MdPriorityHigh,
} from "react-icons/md";
import { TbToolsKitchen2 } from "react-icons/tb";
import { SiGoogleassistant } from "react-icons/si";
import { HiSearch, HiX } from "react-icons/hi";
import { BiBowlRice } from "react-icons/bi";
import type { IStatus } from "@/components/types/hiTableData";
import { useLogin } from "@/components/store/useLogin";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import DishStatusComponent from "@/components/atoms/dishStatus";
import Priority from "@/components/atoms/makePriority";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Loader from "@/components/atoms/loader";
import { useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

const headerButton = [
	{
		Icon: MdAlarm,
		text: "Delayed",
	},
	{
		Icon: TbToolsKitchen2,
		text: "Cooked",
	},
	{
		Icon: SiGoogleassistant,
		text: "Cooking",
	},
];

function Status() {
	const [search, setSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeButton, setActiveButton] = useState<string>("");
	const [statusData, setStatusData] = useState<IStatus[][]>([]);
	const [filteredStatusData, setFilteredStatusData] = useState<IStatus[][]>([]);
	const [selectedDishStatus, setSelectedDishStatus] = useState<IStatus | null>(
		null,
	);
	const zoneName = useLogin((s) => s.zoneName);
	const userDetails = useLogin((state) => state.userDetails);
	const params = useParams<{ businessId: string; zoneId: string }>();
	const { businessId, zoneId } = params;

	const [isPriorityPopupOpen, setIsPriorityPopupOpen] = useState(false);

	const makePriority = () => {
		setIsModalOpen(false);
		setIsPriorityPopupOpen(true);
	};
	const handleConfirm = (data: string) => {
		if (data === "Priority") {
			setIsModalOpen(false);
		}
	};

	const openModal = (kot: IStatus) => {
		setIsModalOpen(true);
		setSelectedDishStatus(kot);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	const popOver = (search = "") => {
		if (search.length > 0) {
			if (!searchOpen) {
				setSearchOpen(true);
			}
		} else {
			setSearchOpen(false);
		}
	};

	const searchClick = () => {
		setSearchOpen(!searchOpen);
		setSearch("");
		getAllStatusData();
	};

	const handleOnClick = (buttonText: string) => {
		const newActiveButton = activeButton === buttonText ? "" : buttonText;
		setActiveButton(newActiveButton);

		const newFilteredData = newActiveButton
			? statusData.map((group) =>
					group.filter(
						(item) =>
							item.dishStatus.toLowerCase() === newActiveButton.toLowerCase(),
					),
				)
			: statusData;
		setFilteredStatusData(newFilteredData);
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
			getAllStatusData();
			closeModal();
		} catch (error) {
			toast.error("Error updating dish status");
		}
	};

	async function getAllStatusData() {
		try {
			const response = await axios.get(
				`/v1/kitchens/getAllKotByWaiter/all?businessId=${businessId}&zoneId=${zoneId}&staffId=${userDetails?._id}`,
			);
			const data = response.data.data;
			setStatusData(data);
			setFilteredStatusData(data);
			return data;
		} catch (error) {
			toast.error("Error fetching status data");
		}
	}
	const { isLoading, error } = useQuery({
		queryKey: ["getAllStatusData", businessId, zoneId],
		queryFn: getAllStatusData,
		enabled: !!businessId && !!zoneId,
	});

	const searchStatus = filteredStatusData.map((item: IStatus[]) =>
		item.filter(
			(ele) =>
				ele?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
				ele?.dishStatus?.toLowerCase().includes(search.toLowerCase()) ||
				ele?.tableName?.toLowerCase().includes(search.toLowerCase()) ||
				ele?.dish?.name?.toLowerCase().includes(search.toLowerCase()),
		),
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	if (error) {
		<div className="flex items-center justify-center h-screen">
			<button onClick={getAllStatusData} className="btn" type="button">
				Retry
			</button>
		</div>;
	}

	return (
		<div className="relative min-h-screen pb-6 bg-secondary">
			<div className="sticky top-0 z-50 bg-secondary">
				<div className="flex justify-between">
					<div
						className={`${
							searchOpen ? "hidden" : ""
						} ml-6 mt-8 font-bold capitalize text-base-content text-[1rem] leading-[1.25rem]`}
					>
						{zoneName}
					</div>
					<div
						onClick={searchClick}
						className={`${
							searchOpen
								? "w-[100%] transition-all duration-300 mb-6"
								: "w-[30%] disabled"
						} mt-6 mx-6 `}
					>
						<label htmlFor="simple-search" className="sr-only">
							Search
						</label>
						<div className="relative">
							{searchOpen ? (
								<HiX className="absolute inset-y-0 w-4 h-4 text-primary/80 dark:text-primary flex items-center pointer-events-none top-[0.625rem] right-2" />
							) : (
								<HiSearch className="absolute inset-y-0 w-4 h-4 text-primary/80 dark:text-primary flex items-center pointer-events-none top-[0.625rem] right-2" />
							)}
							<input
								onChange={(e) => {
									setSearch(e.target.value);
									popOver(e.target.value);
								}}
								value={search}
								type="text"
								id="simple-search"
								className="border  border-gray-300 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-primary block w-full pl-4 p-1.5"
								placeholder="Search"
								required
							/>
						</div>
					</div>
				</div>
				<div
					className={`${
						searchOpen ? "hidden" : ""
					} sticky flex justify-between pb-6 mx-6 mt-6`}
				>
					{headerButton.map((ele) => (
						<HeaderButton
							key={ele.text}
							className={
								activeButton === ele.text
									? "bg-blue-500 focus:font-[500] focus:rounded-full focus:text-primary focus:btn-primary/10 "
									: ""
							}
							onClick={() => handleOnClick(ele.text)}
						>
							<ele.Icon className="mt-1 mr-1 -ml-1 text-primary" />
							{ele.text}
						</HeaderButton>
					))}
				</div>
			</div>

			<div className="pb-[5rem] masonry-layout mx-6">
				{searchStatus.length > 0 ? (
					<Orders data={searchStatus} openModal={openModal} />
				) : (
					<Orders data={filteredStatusData} openModal={openModal} />
				)}
			</div>
			{isModalOpen && (
				<DayOutPopup show={isModalOpen} onClose={() => setIsModalOpen(false)}>
					<div className="relative min-h-[45vh] rounded-t-3xl bg-secondary/50">
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
									{selectedDishStatus?.kotTime.slice(0, 5)}
								</div>
								<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
									{selectedDishStatus?.date}
								</div>
							</div>
						</div>
						{!selectedDishStatus?.isDeleted &&
							selectedDishStatus?.dishStatus === "cooking" &&
							!selectedDishStatus?.priority && (
								<div
									onClick={makePriority}
									className="flex items-center justify-between px-4 py-4 mx-6 mt-4 text-sm border bg-base-100 border-base-300 rounded-2xl"
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
								onClick={() => handleDishStatus(selectedDishStatus?._id || "")}
								className="py-4 w-[85%] space-x-2 text-base-100 bg-primary rounded-full"
							>
								Mark as delivered
							</button>
						</div>
					</div>
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
						kotId={selectedDishStatus?._id}
						getAllStatusData={getAllStatusData}
					/>
				</DayOutPopup>
			)}
		</div>
	);
}

export default memo(Status);

function OrderHeader({ kot }: { kot: IStatus }) {
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
			<div className="flex flex-col">
				<div className="text-right text-md font-[500] text-primary">
					{kot?.kotTime?.slice(0, 5)}
				</div>
				<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
					{kot?.kotDate?.slice(0, 10)}
				</div>
			</div>
		</div>
	);
}

function DishDetail({
	kot,
	openModal,
}: { kot: IStatus; openModal: (kot: IStatus) => void }) {
	return (
		<div className="flex justify-between mx-4 mt-4">
			<div className="w-[10%] font-[500]">{kot?.dish?.qty} x</div>
			<div className="w-[60%] -ml-4 font-[500]">
				{kot?.dish?.name}
				<div className="mt-1 text-sm font-semibold capitalize text-base-content/40">
					{kot?.dish?.portions?.name}
				</div>
				<div className="mt-1 mb-2 text-xs font-normal capitalize text-base-content/40">
					{kot?.dish?.extras?.map((extra) => extra?.name + ", ")}
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

function StatusButton({ kot }: { kot: IStatus }) {
	const statusDetails: {
		[key: string]: { className: string; iconColor: string };
	} = {
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
						<div
							className={`mb-[0.1rem] capitalize font-[500] text-lg ${status.className} pr-1 pl-1 ml-2 mt-[0.125rem]`}
						>
							<span className="text-[#F04B4B]">deleted</span>
						</div>
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

function Orders({
	data,
	openModal,
}: { data: IStatus[][]; openModal: (kot: IStatus) => void }) {
	return data.map((ele, i) => {
		const kot = ele[0];
		if (!kot) return null;
		return (
			<div key={i} className="mb-6 bg-base-100 masonry-item rounded-2xl">
				<OrderHeader kot={kot} />
				<div className="mx-4 mt-4 border-2 rounded-full border-gray-400/30"></div>
				{ele.map((kot: IStatus) => (
					<div key={kot._id}>
						<DishDetail kot={kot} openModal={openModal} />
						<div className="pt-4">
							<StatusButton kot={kot} />
						</div>
						<div className="mx-4 border-b border-dashed"></div>
					</div>
				))}
			</div>
		);
	});
}
