import { useAlert } from "@/components/store/useAlert";
import { useEffect } from "react";
import React from "react";
import {
	MdAutorenew,
	MdOutlineReceiptLong,
	MdOutlineTableRestaurant,
} from "react-icons/md";
import { RxBell } from "react-icons/rx";

function TestFooter({ setCurrentView, currentView }) {
	const { newAlertsCount, newOrderCount } = useAlert();

	useEffect(() => {}, [newAlertsCount, newOrderCount]);

	return (
		<div className="fixed bottom-0 z-20 w-full py-2 bg-primary ">
			<div className="flex justify-between mx-6">
				<div onClick={() => setCurrentView("table")}>
					<button
						type="button"
						className={`${
							currentView === "table"
								? "bg-base-100/80 text-primary"
								: "bg-primary text-base-100"
						} px-4 py-1 rounded-full focus:outline-none transition duration-300`}
					>
						<MdOutlineTableRestaurant className="text-[1.2rem]" />
					</button>

					<div className={"text-sm ml-2 font-normal text-base-100"}>Tables</div>
				</div>
				<div onClick={() => setCurrentView("status")}>
					<button
						type="button"
						className={` ${
							currentView === "status"
								? "bg-base-100/80 text-primary"
								: "bg-primary text-base-100"
						} px-4 py-1 rounded-full focus:outline-none transition duration-300`}
					>
						<MdAutorenew className="text-[1.2rem]" />
					</button>
					<div className={"text-sm ml-2 font-normal text-base-100"}>Status</div>
				</div>

				<div onClick={() => setCurrentView("alert")} className="relative">
					<button
						type="button"
						className={`${
							currentView === "alert"
								? "bg-base-100/80 text-primary"
								: "bg-primary text-base-100"
						} px-4 py-1 rounded-full focus:outline-none transition duration-300`}
					>
						{newAlertsCount === 0 ? (
							<RxBell className="text-[1.2rem]" />
						) : (
							<>
								<span className="absolute bg-red-500 text-base-100 px-1 rounded-full ml-2 top-0 right-2 text-[0.625rem]">
									{newAlertsCount}
								</span>
								<RxBell className="text-[1.2rem]" />
							</>
						)}
					</button>

					<div className="ml-2 text-sm font-normal text-base-100">Alerts</div>
				</div>

				<div onClick={() => setCurrentView("order")} className="relative">
					<button
						type="button"
						className={`${
							currentView === "order"
								? "bg-base-100/80 text-primary"
								: "bg-primary text-base-100"
						} px-4 py-1 rounded-full focus:outline-none transition duration-300`}
					>
						{newOrderCount === 0 ? (
							<MdOutlineReceiptLong className="text-[1.2rem]" />
						) : (
							<>
								<span className="absolute bg-red-500 text-base-100 px-1 rounded-full ml-2 top-0 right-2 text-[0.625rem]">
									{newOrderCount}
								</span>
								<MdOutlineReceiptLong className="text-[1.2rem]" />
							</>
						)}
					</button>

					<div className={"text-sm ml-2 font-normal text-base-100"}>Orders</div>
				</div>
			</div>
		</div>
	);
}

export default TestFooter;
