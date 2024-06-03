import type { IDish } from "@/components/types/businessData";
import { PAGE_TYPES, routePathsWithId } from "@/components/utils/routes";
import { memo, startTransition, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DishContent = memo(({
	dishes,
	searchText,
}: { dishes: IDish[]; searchText: string }) => {
	const navigate = useNavigate();
	const [dishesData, setDishesData] = useState<IDish[]>([]);
	const dishData = useMemo(
		() =>
			(dishes || []).filter((dish) =>
				dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase()),
			),
		[dishes, searchText],
	);

	useEffect(() => {
		setDishesData(dishes);
	}, [dishes]);
	const { businessId } = useParams<{ businessId: string }>();
	const handleEditButton = (zone: any) => {
		const { id } = zone;
		startTransition(() => {
			navigate(`/app/business/${businessId}/items/editDish/${id}`);
		})
	};
	const [isLoading, setIsLoading] = useState(false);
	const addDish = () => {
		setIsLoading(true);
		startTransition(() => {
			navigate(routePathsWithId[PAGE_TYPES.ADD_DISH](businessId || ''));
		})
		setIsLoading(false);
	};

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (params.get('tab') !== 'Dish') {
			params.set('tab', 'Dish');
			startTransition(() => {
				navigate({ search: params.toString() }, { replace: true });
			})
		}
	}, [location, navigate]);

	return (
		<div className="grid grid-cols-1 mb-28 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
			{searchText === "" ? (
				dishesData && dishesData.length > 0 ? (
					dishesData.map((dish: IDish) => (
						<div
							key={dish.id}
							className="flex justify-between mx-6 p-4 border border-[#cacaca] m-4 rounded-md my-3 px-4 py-4"
						>
							<h1 className="truncate w-72">{dish?.name}</h1>
							<button
								type="button"
								className="text-[#2F80ED]"
								onClick={() => handleEditButton(dish)}
							>
								Edit
							</button>
						</div>
					))
				) : (
					<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
						No Dishes Found
					</div>
				)
			) : dishData && dishesData.length > 0 ? (
				dishData.map((dish: IDish) => (
					<div
						key={dish.id}
						className="flex justify-between mx-6 p-4 border border-[#cacaca] m-4 rounded-md my-3 px-4 py-4"
					>
						<h1 className="truncate w-72">{dish?.name}</h1>
						<button
							type="button"
							className="text-[#2F80ED]"
							onClick={() => handleEditButton(dish)}
						>
							Edit
						</button>
					</div>
				))
			) : (
				<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
					No Dishes Found
				</div>
			)}

			<div className="fixed w-full px-6 bottom-5">
				<button
					type="button"
					onClick={addDish}
					className="on_active_bounce bg-[#2B354D]  text-white rounded-md  py-2.5 w-full"
				>
					{isLoading ? 'Loading...' : 'Add Dish'}
				</button>
			</div>
		</div>
	);
});

export default DishContent
