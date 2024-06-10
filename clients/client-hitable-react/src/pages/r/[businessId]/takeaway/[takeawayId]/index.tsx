import Header from "@/components/molecules/header";
import { useEffect, useRef, useState } from "react";
import HiPalLogo from "@/assets/svg/hipalLogoNew.svg";
import { HiSearch, HiX } from "react-icons/hi";
import { useLogin } from "@/components/store/useLogin";
import { MdAlarm, MdDinnerDining } from "react-icons/md";
import { TbToolsKitchen2 } from "react-icons/tb";
import { SiGoogleassistant } from "react-icons/si";
import HeaderButton from "@/components/atoms/buttons/headerButton";
import { BiPlus } from "react-icons/bi";
import PopUp from "@/components/atoms/popUp";
import { PAGE_TYPES, newRoutes } from "@/components/utils/routes";
import { useOrderStore } from "@/components/store/useOrderStore";
import axios from "@/components/utils/axios";
import { toast } from "react-toastify";
import { ImWarning } from "react-icons/im";
import Loader from "@/components/atoms/loader";
import { useNavigate, useParams } from "react-router-dom";

const filterButtons = [
	{
		name: "Delay",
		Icon: MdAlarm,
		text: "Delay",
	},
	{
		name: "Cooked",
		Icon: TbToolsKitchen2,
		text: "Cooked",
	},
	{
		name: "Cooking",
		Icon: SiGoogleassistant,
		text: "Cooking",
	},
];
interface Dish {
	dishId: string;
	name: string;
	price: number;
	qty: number;
	comments: string;
	extras: {
		name: string;
		price: string;
		qty: number;
	}[];
}

interface Order {
	kotTime: string;
	orderId: string;
	dishStatus: string;
	kots: {
		businessId: string;
		kitchenId: string;
		zoneId: string;
		staffId: string;
		startedAt: number;
		cookedAt: number;
		status: string;
		dish: Dish;
		customerName: string;
		customerPhone: string;
		dishStatus: string;
		kotTime: string;
		tableName: string;
		dishType: string;
		category: string;
		date: string;
		kotDate: string;
		priority: boolean;
		isDeleted: boolean;
		inventory: boolean;
		orderId: string;
		id: string;
		match: boolean;
	}[];
	totalDishes: number;
	cookedDishes: number;
	isMatch: boolean;
}

const TakeAway = () => {
	const [search, setSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const [orders, setOrders] = useState<Order[]>([]);
	const searchRef = useRef(null);
	const zoneName = useLogin((s) => s.zoneName);
	const [activeButton, setActiveButton] = useState("");
	const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
	const [orderId, setOrderId] = useState("");
	const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
	const [loading, setLoading] = useState(false);

	const handleOnclick = (str: any) => {
		str = activeButton.length === 0 ? str : "";
		setActiveButton(str);
	};
	const navigate = useNavigate();

	const { businessId, takeawayId } = useParams<{
		businessId: string;
		takeawayId: string;
	}>();

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

	const handleOrderId = (e:any) => {
		const value = (e.target as HTMLInputElement).value;
		setOrderId(value);
	}

	const handleClick = () => {
		const orderExists = orders.some((order) => order.orderId === orderId);
		if (orderExists) {
			toast.error("Order already exists");
		} else {
			navigate(
				newRoutes[PAGE_TYPES.TAKE_AWAY_ID](businessId || '', takeawayId ||'', orderId),
			);
		}
	};

	const getTakeAwayOrders = async () => {
		if (loading) return;

		setLoading(true);
		try {
			const url = `/v1/kitchens/:id/orderBySwiggy?businessId?businessId=${businessId}&zoneId=${takeawayId}`;
			const response = await axios(url);
			const orders: Order[] = await response.data;
			setOrders(orders);
		} catch (error) {
			console.log("Error fetching orders:", error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		if (takeawayId) {
			getTakeAwayOrders();
		}
	}, []);

	if (loading)
		return (
			<div>
				<Loader />
			</div>
		);

	const goBack = () => {
		navigate(`/r/${businessId}/zone`);
	};

	return (
		<div className="bg-secondary min-h-screen pb-[7rem]">
			{" "}
			<Header goBack={goBack}>
				<img
					className="mr-6"
					width={68}
					height={25}
					src={HiPalLogo}
					alt="Hi Table Logo"
					loading="lazy"
				/>
			</Header>
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
						ref={searchRef}
						onClick={searchClick}
						className={`${
							searchOpen ? "w-[100%] mb-6" : "w-[30%] disabled"
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
					{filterButtons.map(({ name, Icon, text }, index) => (
						<HeaderButton
							onClick={() => handleOnclick(name)}
							key={`${index}${name}`}
							className={
								activeButton === name
									? "bg-blue-500 focus:font-semibold focus:rounded-full focus:text-primary focus:bg-primary/10 "
									: ""
							}
						>
							<Icon className="mt-1 mr-1 -ml-1 text-primary" />
							{text}
						</HeaderButton>
					))}
				</div>
			</div>
			<div className="mx-6 mt-6 masonry-layout">
				{orders.length === 0 ? (
					<p className="text-center text-gray-500">No orders found.</p>
				) : (
					<div className="masonry-item">
						{orders?.map((order) => (
							<div
								onClick={() => {
									setCurrentOrder(order);
									navigate(
										newRoutes[PAGE_TYPES.TAKE_AWAY_ID](
											businessId || '',
											takeawayId || '',
											order?.orderId,
										),
									);
								}}
								key={order?.orderId}
								className={`flex items-center justify-between p-4 mb-4 border flex-col-2 rounded-xl ${
									order.dishStatus === "cooking" ? "bg-primary/10" : ""
								}`}
							>
								<div>
									<div className="text-primary">
										{order?.kotTime?.slice(0, 5)}
									</div>
									<div className="font-semibold">{order?.orderId}</div>
									{!order.isMatch ? (
										<div className="text-sm text-[#AA1821] flex items-center">
											<ImWarning className="mr-2" /> Action Required!
										</div>
									) : (
										<div className="opacity-60">{order?.dishStatus}</div>
									)}
								</div>
								<div className="flex flex-col items-center justify-center mr-6 space-y-4">
									<MdDinnerDining className="opacity-50" />
									<div className="text-primary">
										{" "}
										{order?.totalDishes}/{order?.totalDishes}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
			<div
				onClick={() => setIsOrderModalOpen(true)}
				className="fixed left-0 right-0 flex justify-center on_active_bounce bottom-6"
			>
				<button
					type="button"
					className="flex items-center px-4 py-2 text-sm text-base-100 bg-primary rounded-xl"
				>
					<BiPlus className="mr-2 text-xl" /> Add new order
				</button>
			</div>
			{isOrderModalOpen && (
				<PopUp
					show={isOrderModalOpen}
					onClose={() => setIsOrderModalOpen(false)}
				>
					<div className="mx-6 mt-6">
						<div className="font-semibold">Please add order id</div>
						<div className="text-sm opacity-60 ">
							Add order id from <span className="text-primary">
								{zoneName}
							</span>{" "}
						</div>
						<div className="flex items-center mt-4">
							<div className="px-4 py-2 text-base-100 bg-primary rounded-l-3xl">
								NO
							</div>
							<input
								type="number"
								placeholder="Enter order number.."
								className="flex-grow px-3 py-[0.45rem] border border-primary rounded-r-3xl focus:outline-none"
								onChange={handleOrderId}
							/>
						</div>
						<div className="flex items-end justify-end pb-6">
							<button
								type="button"
								onClick={handleClick}
								className="px-8 py-2 mt-6 rounded-full text-base-100 bg-primary on_active_bounce"
							>
								Confirm
							</button>
						</div>
					</div>
				</PopUp>
			)}
		</div>
	);
};

export default TakeAway;
