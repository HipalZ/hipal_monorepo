import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import HeaderButtonGroup from "@/components/molecules/headerButtonGroup";
import { MdMenuOpen } from "react-icons/md";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { HiArrowLeft } from "react-icons/hi";
import { useOrderStore } from "@/components/store/useOrderStore";
import axios from "@/axios";
import { useLogin } from "@/components/store/useLogin";
import Loader from "@/components/atoms/loader";

const TakeAwayDishStatus = dynamic(
	() => import("@/components/organisms/takeAwayDishStatus"),
	{
		ssr: false,
		loading: () => <Loader />,
	},
);
const TakeAwayPos = dynamic(
	() => import("@/components/organisms/takeAwayPos"),
	{
		loading: () => <Loader />,
	},
);
const TakeAwaySettle = dynamic(
	() => import("@/components/organisms/takeAwaySettle"),
	{
		loading: () => <Loader />,
	},
);

function PosTakeAway() {
	/********************* Using in settle pos and settle *************************/
	const [activeButton, setActiveButton] = useState("");
	const [categories, setCategories] = useState<any>([]);
	const zoneType = useLogin((s) => s?.selectedZone?.zoneType);
	const currentOrder = useOrderStore((s) => s.currentOrder);
	const [btnActive, setBtnActive] = useState(false);
	const [selectDishId, setSelectedDish] = useState<string>("");
	const router = useRouter();
	const { businessId, takeawayId, orderId } = router.query as {
		businessId: string;
		takeawayId: string;
		orderId: string;
	};

	useEffect(() => {
		if (currentOrder?.orderId === orderId) {
			setActiveButton("status");
		} else {
			setActiveButton("pos");
		}
	}, []);

	const handleOnClick = (str: string) => {
		setActiveButton(str);
	};

	const category = async () => {
		let response;
		try {
			if (zoneType === "Delivery") {
				response = await axios(
					`/v1/categories/:id/Delivery?businessId=${businessId}`,
				);
			} else {
				response = await axios(
					`/v1/categories/:id/Takeaway?businessId=${businessId}`,
				);
			}

			const { allCategoriesTypes, categories } = response.data.data;
			const data = {
				allCategoriesTypes,
				categories,
			};
			setCategories(data);
		} catch (error) {}
	};
	const goBackRouting = () => {
		router.push(routePaths[PAGE_TYPES.TAKE_AWAY](businessId, takeawayId));
	};
	useEffect(() => {
		category();
	}, []);
	useEffect(() => {}, [orderId]);

	return (
		<div className="relative min-h-screen space-y-6 bg-secondary">
			<div
				className={`${
					activeButton.toLowerCase() === ""
						? ""
						: "sticky top-0 z-40 bg-secondary px-6"
				} `}
			>
				<div className="flex justify-between pt-4">
					<HiArrowLeft
						onClick={goBackRouting}
						className="mr-[1.5rem] text-2xl"
					/>
					{orderId?.slice(0, 8)}
					<MdMenuOpen className="mr-[1.5rem] text-2xl" />
				</div>

				<HeaderButtonGroup
					activeButton={activeButton}
					onButtonClick={handleOnClick}
					showPos={true}
				/>
			</div>
			{activeButton.toLowerCase() === "status" && (
				<TakeAwayDishStatus
					activeButton={activeButton}
					setBtnActive={setBtnActive}
					setActiveButton={setActiveButton}
					setSelectedDish={setSelectedDish}
				/>
			)}
			{activeButton.toLowerCase() === "pos" &&
				(currentOrder?.orderId !== orderId || btnActive) && (
					<TakeAwayPos
						data={categories}
						activeButton={activeButton}
						btnActive={btnActive}
						selectDishId={selectDishId}
					/>
				)}
			{activeButton.toLowerCase() === "settle" && (
				<TakeAwaySettle activeButton={activeButton} />
			)}
		</div>
	);
}

export default PosTakeAway;
