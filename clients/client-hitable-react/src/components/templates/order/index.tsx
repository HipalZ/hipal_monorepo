import  { memo, useState } from "react";
import { useLogin } from "@/components/store/useLogin";
import { toast } from "react-toastify";
import { useAlert } from "@/components/store/useAlert";
import { type ICartDish, useCart } from "@/components/store/useCart";
import { useTable } from "@/components/store/useTable";
import { useBusinessStore } from "@/components/store/useBusinessData";
import { MdOutlineNoFood } from "react-icons/md";
import { BiStopwatch } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/atoms/loader";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/components/utils/axios";

interface IProps {
	setCurrentView: (view: string) => void;
}

function Orders({ setCurrentView }: IProps) {
	const { orderData, setOrderData, setNewOrderCount } = useAlert();
	const [orderAcceptedIds, setOrderAcceptedIds] = useState<string[]>([]);
	const setTableData = useTable((s) => s.setTableData);
	const { setCart } = useCart();
	const businessData = useBusinessStore((s) => s.businessData);
	const navigate = useNavigate();
	const params = useParams<{ businessId: string; zoneId: string }>();
	const { businessId, zoneId } = params;

	const userDetail = useLogin((s) => s.userDetails);

	const result = async () => {
		try {
			const config = {
				method: "GET",
				url: `/v1/kitchens/all/WaiterOrder?businessId=${businessId}&zoneId=${zoneId}&staffId=${userDetail?._id}`,
			};
			const response = await axiosInstance(config);
			const data = response.data;
			setOrderData(data);
			setNewOrderCount(data.length);
			return data;
		} catch (error) {
			toast.error("Failed to fetch orders");
		}
	};

	const {
		isLoading,
		error,
		data: order,
	} = useQuery({
		queryKey: ["fetchOrders", businessId, zoneId, userDetail?._id],
		queryFn: result,
		enabled: !!businessId && !!zoneId && !!userDetail?._id,
	});

	const addOrderAcceptedId = (id: string) => {
		setOrderAcceptedIds((prevIds) => [...prevIds, id]);
	};

	const acceptOrder = async (id: string) => {
		addOrderAcceptedId(id);
		try {
			await axiosInstance.put(`/v1/kitchens/:id/acceptOrder/${id}`, {
				waiterName: userDetail?.name,
				kotPrinter: businessData?.kotPrinter,
			});
		} catch (error) {
			console.error("Failed to update order status:", error);
		}
	};

	const rejectOrder = async (id: string) => {
		addOrderAcceptedId(id);
		try {
			await axiosInstance.put(`/v1/kitchens/reject/Order/${id}`, {
				waiterName: userDetail?.name,
			});
		} catch (error) {
			console.error("Failed to update order status:", error);
		}
	};

	const editOrder = async (id: string) => {
		addOrderAcceptedId(id);
		try {
			const res = await axiosInstance.put(`/v1/kitchens/Edit/Order/${id}`, {
				waiterName: userDetail?.name,
			});
			toast.info("Please edit the order");

			const orderData = res.data;
			const tableId = orderData.tableId;
			const cartData = orderData.cart;

			for (const [dishId, dishData] of Object.entries(cartData)) {
				setCart(tableId, dishId, dishData as ICartDish);
			}

			setTableData({
				id: tableId,
				name: orderData.tableName,
			});
			rejectOrder(id);
			navigate(`/r/${businessId}/zone/${zoneId}/${tableId}?edit`);
		} catch (error) {
			console.error("Failed to update order status:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<button onClick={result} className="btn" type="button">
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-secondary">
			<div className="flex justify-between">
				<div className="mt-8 ml-6 font-bold capitalize text-base-content">
					Orders
				</div>

				<div
					onClick={() => {
						setCurrentView("history");
					}}
					className="px-3 py-2 mt-8 mr-6 font-bold capitalize rounded-lg text-primary-content bg-primary"
				>
					<BiStopwatch />
				</div>
			</div>

			{orderData.length > 0 ? (
				<div className="pb-[5rem]">
					{orderData.map((ele) => {
						if (orderAcceptedIds.includes(ele._id)) {
							return null;
						}
						return (
							<div
								key={ele._id}
								className={"bg-base-100 mx-6 rounded-2xl mt-6 mb-[1.5rem]"}
							>
								<div className="flex justify-between pt-4 mx-4">
									<div className="flex flex-col">
										<div className="font-[500] capitalize">{ele.tableName}</div>
										<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
											{ele?.items?.[0]?.customerName}
										</div>
									</div>
									<div className="flex flex-col">
										<div className="text-right text-md font-[500] text-primary">
											{ele?.time}
										</div>
										<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
											{ele?.date}
										</div>
									</div>
								</div>
								<div className="mx-4 mt-4 border-2 rounded-full border-gray-400/50" />
								<div className="relative pt-2 pb-[4.875rem]">
									{ele.items.map((item, i) => (
										<div
											key={`${item?.dish?.dishId}dish${i}`}
											className="flex mx-4 mt-4"
										>
											<div className="w-[10%] font-[500]">
												{item?.dish?.qty} x
											</div>
											<div className="w-[80%] ml-1 font-[500]">
												{item?.dish?.name}
												<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
													{item?.dish?.portions?.name}
												</div>
												<div className="mt-1 text-sm font-normal capitalize text-base-content/40">
													{item?.dish?.extras?.map(
														(extra) => `${extra?.name}, `,
													)}
												</div>
											</div>
										</div>
									))}

									<div className="absolute inline-flex right-6 bottom-4">
										<button
											type="button"
											disabled={orderAcceptedIds.includes(ele._id)}
											onClick={() => editOrder(ele?._id)}
											className="text-md mr-12 font-[500] text-primary py-1 px-6 rounded-2xl"
										>
											Edit
										</button>
										<button
											type="button"
											disabled={orderAcceptedIds.includes(ele._id)}
											onClick={() => rejectOrder(ele?._id)}
											className="text-md font-[500] text-primary py-1 px-6 rounded-2xl"
										>
											Reject
										</button>
										<button
											type="button"
											disabled={orderAcceptedIds.includes(ele._id)}
											onClick={() => acceptOrder(ele?._id)}
											className="active_on_bounce border border-primary  text-md font-[500] text-primary py-1 px-6 rounded-2xl"
										>
											{orderAcceptedIds.includes(ele._id)
												? "Accepting..."
												: "Accept"}
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="absolute left-0 right-0 flex flex-col items-center m-auto font-bold top-[30%]">
					<MdOutlineNoFood className="mb-4 text-[5rem] text-primary/30 md:text-[5rem] lg:text-[7rem]" />
					<div className="text-xl md:text-2xl lg:text-2xl xl:text-2xl opacity-60">
						No orders ...
					</div>
				</div>
			)}
		</div>
	);
}

export default memo(Orders);
