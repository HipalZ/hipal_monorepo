import { Dish } from "@/components/types/businessData";
import React, { memo, useState } from "react";
import { toast } from "react-toastify";

type DishComponentProps = {
	dishes: Dish[];
	selectedDishes: Dish[];
	toggleDishSelection: (dish: Dish) => void;
	onClose: () => void;
	resetAndCloseDishModal: () => void;
};

const DishComponent: React.FC<DishComponentProps> = ({
	dishes,
	selectedDishes,
	toggleDishSelection,
	onClose,
	resetAndCloseDishModal,
}) => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredDishes = dishes.filter((dish) =>
		dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<>
			<div className="relative px-4 bg-[#f5f5f5] rounded-2xl shadow overflow-y-auto max-h-[80vh] pb-[8rem]">
				<section className="sticky pt-4 pb-2 top-0 z-20 bg-[#f5f5f5]">
					<h3 className="pb-2 text-lg font-bold">Add Dishes</h3>
					<input
						type="search"
						placeholder="Search for dishes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full p-2 mb-4 border border-gray-300 rounded-md"
					/>
				</section>
				<div className="space-y-4 ">
					{filteredDishes?.map((dish) => (
						<div
							onClick={() => toggleDishSelection(dish)}
							key={dish._id}
							className="flex items-center border border-[#cacaca] bg-white p-4 rounded-md"
						>
							<input
								type="checkbox"
								id={`checkbox-${dish._id}`}
								checked={selectedDishes.some(
									(selectedDish) => selectedDish._id === dish._id,
								)}
								className="w-4 h-4 form-checkbox focus:ring-0 focus:outline-none"
							/>
							<span className="ml-2 text-sm font-[550]">{dish.name}</span>
						</div>
					))}
				</div>
			</div>
			<div className="sticky flex mx-4 my-6 bottom-5">
				<button
					type="button"
					onClick={resetAndCloseDishModal}
					className="on_active_bounce border border-1 border-[#2B354D] text-[#2B354D] rounded-md bg-white py-2.5 w-full mr-2"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={() => {
						onClose();
						toast.success("Dishes added sucessfully");
					}}
					className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
				>
					Save
				</button>
			</div>
		</>
	);
};

export default memo(DishComponent);
