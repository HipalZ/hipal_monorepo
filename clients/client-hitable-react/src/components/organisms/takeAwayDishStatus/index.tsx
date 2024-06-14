import type React from "react";
import { useState } from "react";
import { OrderHeader, StatusButton } from "../dishStatus";
import axios from "@/components/utils/axios";
import { useOrderStore } from "@/components/store/useOrderStore";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { toast } from "react-toastify";
import { useLogin } from "@/components/store/useLogin";
import DayOutPopup from "@/components/atoms/dayoutPopup";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { ImWarning } from "react-icons/im";
import { useNavigate, useParams } from "react-router-dom";

const TakeAwayDishStatus = ({
	setBtnActive,
	setActiveButton,
	setSelectedDish,
}: {
	setBtnActive: (str: boolean) => void;
	setActiveButton: (str: string) => void;
	setSelectedDish: (str: string) => void;
}): JSX.Element => {
	const navigate = useNavigate();
	const { businessId, orderId, takeawayId } = useParams<{
		businessId: string;
		orderId: string;
		takeawayId: string;
	}>();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const userName = useLogin((s) => s.userDetails.name);
	const currentOrder = useOrderStore((s) => s.currentOrder);
	const zoneName = useLogin((s) => s.zoneName);
	const [footButton, setFootButton] = useState("");
	const basicCheck = currentOrder?.orderId === orderId;
	const [password, setPassword] = useState("");

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};
	const openModal = () => {
		setIsModalOpen(true);
	};

	const deleteKot = async () => {
		try {
			const config = {
				method: "put",
				url: `/v1/kitchens/:id/orderBySwiggy?businessId=${businessId}&orderId=${orderId}`,
				body: {
					deletedBy: userName,
					zoneName: zoneName,
					password: password,
				},
			};
			await axios(config);
			toast.error(`Order ${orderId} has been deleted by ${userName}`);
			navigate(
				routePaths[PAGE_TYPES.TAKE_AWAY](businessId || "", takeawayId || ""),
			);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="px-6 pb-12 masonry-layout">
			<div className="relative shadow-md bg-base-100 masonry-item rounded-t-2xl">
				{basicCheck && (
					<>
						{" "}
						<div
							onClick={() => {
								openModal();
								setFootButton("edit");
							}}
							className="absolute text-primary top-3.5 right-16"
						>
							manage
						</div>{" "}
						<OrderHeader kot={currentOrder?.kots?.[0]} />
					</>
				)}

				{basicCheck &&
					currentOrder?.kots?.map((kot) => (
						<div
							key={kot?._id}
							className={`relative mb-4 ${
								kot.match ? "bg-base-100" : "bg-[#FF6262]/20"
							} `}
						>
							<div className="mt-4 border-2 rounded-full border-gray-400/30" />
							<div className="flex flex-col justify-between">
								<div className="flex items-center justify-between p-4">
									<div className="font-normal">1 x {kot?.dish?.name}</div>
								</div>
								<div className="ml-6 -mt-2 opacity-70">
									{kot?.dish?.extras &&
										kot?.dish?.extras.map((extra, i) => (
											<p key={i}>{extra?.name}</p>
										))}
								</div>
								<div className="pt-2">
									{" "}
									{!kot.match ? (
										<div className="flex justify-between px-4 pb-6">
											<div className="flex justify-center items-center text-[#CB202D] text-sm space-x-2">
												<ImWarning />
												<div>Dish not found</div>
											</div>
											<button
												type="button"
												onClick={() => {
													setBtnActive(true);
													setActiveButton("pos");
													setSelectedDish(kot._id);
												}}
												className="px-4 py-2 text-sm rounded-full bg-base-100 text-primary"
											>
												Add Dish
											</button>
										</div>
									) : (
										<StatusButton kot={kot} />
									)}
								</div>
							</div>
						</div>
					))}
			</div>
			{isModalOpen && (
				<DayOutPopup show={isModalOpen} onClose={() => setIsModalOpen(false)}>
					{footButton === "edit" && (
						<>
							{" "}
							<div className="flex justify-between pb-2 m-4 text-sm border-b-4">
								<div className="font-medium text-primary">
									Manage Order {orderId}
								</div>
								<div className="text-primary">
									{currentOrder?.kotTime?.slice(0, 5)}
								</div>
							</div>
							<div className="flex items-center justify-between p-4 mx-4 my-8 text-sm border rounded-2xl">
								<div className="flex">
									<MdKeyboardDoubleArrowRight size={20} className="mr-2" />
									Delete Order
								</div>
								<div
									onClick={() => {
										openModal();
										setFootButton("temp");
									}}
									className="font-medium text-red-500"
								>
									Delete
								</div>
							</div>
						</>
					)}
					{footButton === "temp" && (
						<div className="flex items-center justify-center my-4">
							<div className="px-6 bg-base-100">
								<div className="mb-4 text-sm font-semibold">
									Are you sure, you want to delete order?
								</div>
								<p className="mb-4 text-sm text-base-content/60">
									Deleting an item will result in removing it from the running
									order and from the kitchen.
								</p>
								<span className="my-4 text-sm font-semibold">
									Password for deleting
								</span>
								<div className="pt-4">
									<input
										type="password"
										placeholder="Enter password"
										className="w-full px-4 py-2 mb-4 border rounded-xl border-base-content focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
										value={password}
										onChange={handlePasswordChange}
									/>
								</div>

								<div className="flex justify-between mt-4 text-sm">
									<button
										type="button"
										className="px-4 py-2 mr-2 font-medium text-base-content"
										onClick={() => setIsModalOpen(false)}
									>
										Cancel
									</button>
									<button
										type="button"
										className="w-[40%] px-4 py-2 text-base-100 rounded-full bg-primary"
										onClick={deleteKot}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					)}
				</DayOutPopup>
			)}
		</div>
	);
};

export default TakeAwayDishStatus;
