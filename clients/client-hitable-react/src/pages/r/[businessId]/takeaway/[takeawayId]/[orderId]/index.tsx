import { lazy, startTransition, useEffect, useState } from "react";
import HeaderButtonGroup from "@/components/molecules/headerButtonGroup";
import { MdMenuOpen } from "react-icons/md";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { HiArrowLeft } from "react-icons/hi";
import { useOrderStore } from "@/components/store/useOrderStore";
import axios from "@/components/utils/axios";
import { useLogin } from "@/components/store/useLogin";
import { useNavigate, useParams } from "react-router-dom";

const TakeAwayDishStatus = lazy(() => import("@/components/organisms/takeAwayDishStatus"));
const TakeAwayPos = lazy(() => import("@/components/organisms/takeAwayPos"));
const TakeAwaySettle = lazy(() => import("@/components/organisms/takeAwaySettle"));


function PosTakeAway() {
	/********************* Using in settle pos and settle *************************/
	const navigate = useNavigate();
	const [activeButton, setActiveButton] = useState("");
	const [categories, setCategories] = useState<any>([]);
	const zoneType = useLogin((s) => s?.selectedZone?.zoneType);
	const currentOrder = useOrderStore((s) => s.currentOrder);
	const [btnActive, setBtnActive] = useState(false);
	const [selectDishId, setSelectedDish] = useState<string>("");
	const { businessId, takeawayId, orderId } = useParams<{
		businessId: string;
		takeawayId: string;
		orderId: string;
	}>();

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
		} catch (error) {
			console.log(error);
		}
	};
	const goBackRouting = () => {
		startTransition(()=>{
			navigate(routePaths[PAGE_TYPES.TAKE_AWAY](businessId || '', takeawayId || ''));
		})
	};
	//TODO: convert this to useQuery
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
