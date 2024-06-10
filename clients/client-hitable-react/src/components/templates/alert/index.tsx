import HeaderButton from "@/components/atoms/buttons/headerButton";
import Assistance from "@/components/atoms/status/assistance";
import Clean from "@/components/atoms/status/clean";
import Cooked from "@/components/atoms/status/cooked";
import Paid from "@/components/atoms/status/paid";
import  { memo, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";
import { MdCreditCard } from "react-icons/md";
import { SiGoogleassistant } from "react-icons/si";
import { TbToolsKitchen2 } from "react-icons/tb";
import { useLogin } from "@/components/store/useLogin";
import { useAlert } from "@/components/store/useAlert";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import Settle from "@/components/atoms/status/settle";
import Kitchen from "@/components/atoms/status/kitchen";
import PaymentFail from "@/components/atoms/status/paymentFail";
import PaidOnline from "@/components/atoms/status/paidOnline";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Loader from "@/components/atoms/loader";
import { useParams } from "react-router-dom";
import axiosInstance from "@/components/utils/axios";
import { IAlertData } from "@/components/types/hiTableData";

const filterButtons = [
	{
		name: "paid",
		Icon: MdCreditCard,
		text: "Payments",
	},
	{
		name: "cooked",
		Icon: TbToolsKitchen2,
		text: "Kitchen",
	},
	{
		name: "assist",
		Icon: SiGoogleassistant,
		text: "Assistance",
	},
];

const STATUS_COMPONENT_MAP: { [key: string]: React.ComponentType<any> } = {
	paid: Paid,
	paid_by_online: PaidOnline,
	fail: PaymentFail,
	cooked: Cooked,
	"need assistance": Assistance,
	"clean up": Clean,
	settle: Settle,
	kitchen: Kitchen,
	swiggy: Assistance,
};



function Alert() {
	const { paymentsData, alertData, setAlertData, setNewAlertsCount } =
		useAlert();
	const [search, setSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const [activeButton, setActiveButton] = useState("");
	const userDetail = useLogin((s) => s.userDetails);
	const [pageNumber, setPageNumber] = useState(1);
	const params = useParams<{ businessId: string; zoneId: string }>();
	const { businessId, zoneId } = params;

	const handleOnclick = (str: string) => {
		const newActiveButton = activeButton === str ? "" : str;
		setActiveButton(newActiveButton);
	};

	const handleItemClick = async (alertId: string) => {
		try {
			await axiosInstance.put(
				`/v1/kitchens/updateAlert/alert?alertId=${alertId}&businessId=${businessId}`,
			);
			onAlertData();
		} catch (error) {
			toast.error("Error updating alert");
		}
	};

	async function onAlertData() {
		try {
			const response = await axiosInstance.get(
				`/v1/kitchens/get/AllAlertByWaiter?staffId=${userDetail?.id}&businessId=${businessId}&isAlertOn=true&zoneId=${zoneId}`,
			);
			const data = await response.data;
			setAlertData(data);
			setNewAlertsCount(data.length);
			return data;
		} catch (error) {
			toast.error("Error fetching alerts");
		}
	}

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
	};
	const handlePrevPage = () => {
		if (pageNumber > 1) {
			setPageNumber(pageNumber - 1);
		}
	};

	const handleNextPage = () => {
		setPageNumber(pageNumber + 1);
	};

	const { isLoading, error } = useQuery({
		queryKey: [
			"fetchAlertData",
			businessId,
			pageNumber,
			userDetail?.id,
			zoneId,
		],
		queryFn: onAlertData,
		enabled: !!businessId && !!pageNumber && !!userDetail?.id && !!zoneId,
	});

	const searchData = alertData.filter(
		(ele) =>
			ele?.message?.toLowerCase().includes(search.toLowerCase()) ||
			ele?.tableName?.toLowerCase().includes(search.toLowerCase()) ||
			ele?.status?.toLowerCase().includes(search.toLowerCase()),
	);

	async function clearAllAlerts() {
		try {
			const response = await axiosInstance.put(
				`/v1/kitchens/updateAlert/alert?businessId=${businessId}&clearAll=true`,
			);
			if (response?.status === 200 || response?.status === 201) {
				const sound = new Audio("/sounds/trashSound.mp3");
				sound.play();
				onAlertData();
			}
		} catch (err) {
			console.log(err);
		}
	}
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}
	if (error) {
		<div className="flex items-center justify-center h-screen">
			<button onClick={onAlertData} className="btn" type="button">
				Retry
			</button>
		</div>;
	}
	return (
		<div className={" bg-secondary min-h-screen pb-20 relative"}>
			<div className="sticky top-0 z-50 bg-secondary">
				<div className="flex justify-between pb-6">
					<div
						className={`${
							searchOpen ? "hidden" : ""
						} ml-6 mt-8 font-bold capitalize text-base-content text-[1rem] leading-[1.25rem]`}
					>
						Alerts
					</div>
					<div className="flex items-center justify-end mr-6 space-x-4">
						<div
							onClick={() => clearAllAlerts()}
							className={`${searchOpen ? "hidden" : ""} mt-6`}
						>
							<button
								type="button"
								className="flex px-5 py-2 text-sm border bg-base-100 rounded-xl on_active_bounce"
							>
								Clear All
							</button>
						</div>

						<div
							className={`${
								searchOpen ? "w-[100%] transition-all mb-6" : "w-[30%] disabled"
							} mt-6 `}
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
									onClick={searchClick}
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
				</div>
				<div
					className={` sticky flex justify-between pb-6 mx-6 ${
						searchOpen ? "hidden" : ""
					} `}
				>
					{filterButtons.map(({ name, Icon, text }, index) => (
						<HeaderButton
							className={
								activeButton === name
									? "bg-blue-500 focus:font-[500] focus:rounded-full focus:text-primary focus:bg-primary/10 "
									: ""
							}
							onClick={() => handleOnclick(name)}
							key={index}
						>
							<Icon className="mt-1 mr-1 -ml-1 text-primary" />
							{text}
						</HeaderButton>
					))}
				</div>
			</div>

			<div className="space-y-4 bg-secondary">
				<div className="space-y-4 bg-secondary">
					{!searchOpen && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							<AlertList data={alertData} handleClick={handleItemClick} />
						</div>
					)}

					{searchOpen && search !== "" && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							<AlertList data={searchData} handleClick={handleItemClick} />
						</div>
					)}
				</div>
				<div className="space-y-4 bg-secondary">
					{!searchOpen && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							<AlertList data={paymentsData} handleClick={handleItemClick} />
						</div>
					)}

					{searchOpen && search !== "" && (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							<AlertList data={searchData} handleClick={handleItemClick} />
						</div>
					)}
				</div>
			</div>
			{!searchOpen && (
				<div className="fixed bottom-0 z-20 w-full py-2 bg-primary ">
					<div className="flex justify-between mx-[6rem] pb-2 mt-2">
						<button
							type="button"
							className={`p-2 mr-2 bg-base-100 rounded-full ${
								pageNumber === 1
									? "disabled:bg-gray-200 disabled:cursor-not-allowed"
									: ""
							}`}
							onClick={handlePrevPage}
						>
							<BsFillCaretLeftFill className="w-6 h-6 text-primary" />
						</button>
						<div className="text-base-100 text-[1.25rem] mt-1">
							{pageNumber}
						</div>

						<button
							type="button"
							className="p-2 ml-2 rounded-full bg-base-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
							onClick={handleNextPage}
						>
							<BsFillCaretRightFill className="w-6 h-6 text-primary" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default memo(Alert);

const AlertList = ({ data, handleClick }: { data: IAlertData[], handleClick: (alertId: string) => void }) => {
	return data.map((ele:IAlertData, index) => {
		const Component = STATUS_COMPONENT_MAP[ele?.status?.toLowerCase()];
		return (
			<div
				onKeyDown={() => handleClick(ele.id)}
				key={`${ele?.status?.toLowerCase()}-${ele.id || index}`}
				onClick={() => handleClick(ele.id)}
			>
				{Component && <Component {...ele} />}
			</div>
		);
	});
};
