import React, { useState } from "react";
import { useCart } from "@/components/store/useCart";
import Image from "next/image";
import FoodType, { FOOD_TYPES } from "@/components/atoms/foodType";
import { FaBookmark } from "react-icons/fa";
import dynamic from "next/dynamic";
import DishData from "@/components/atoms/dishDescription";
import DishPopup from "@/components/atoms/dishPopup";
import { IDish } from "@/components/types/businessData";

const PlaceholderImg = dynamic(() => import("@/components/atoms/placeholder"));

const CartItem = ({ cartItem }) => {
	const { increaseQuantity, decreaseQuantity, removeDish } = useCart();
	const imageUrl =
		cartItem.dishData?.images[0] ||
		cartItem.dishData?.images[1] ||
		cartItem.dishData?.images[2];
	const [showDescription, setShowDescription] = useState(false);
    const [selectedDish, setSelectedDish] = useState({} as IDish)

    const openModal = (dishData:any) => {
		setSelectedDish(dishData)
		setShowDescription(true)
	}

	const closeModal = () => {
		setSelectedDish({} as IDish)
		setShowDescription(false)
	}
	return (
		<div className="flex items-center justify-between p-4 border-b">
			<div className="flex flex-col w-[70%]">
				<FoodType type={cartItem.dishData.dishType as FOOD_TYPES} />
				<span className="text-lg font-semibold my-2">
					{cartItem.dishData.name}
				</span>
				<span
					onClick={() => openModal(cartItem?.dishData)}
					className="bg-base-100/50 text-center px-2 py-0.25 w-12 rounded-full border-1 border border-primary text-sm"
				>
					Info
				</span>
			</div>
			<div className="relative flex items-center justify-between">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={cartItem.dishData.name}
						width={70}
						height={70}
						className="object-cover w-20 h-20 rounded-md"
					/>
				) : (
					<PlaceholderImg className="w-20 h-20 rounded-md" />
				)}
				<div className="absolute transform -translate-x-1/2 translate-y-[50%] left-1/2 top-[70%] text-xs ">
					{cartItem.variants.length > 1 ? (
						<div className="flex items-center justify-between border bg-base-100 text-primary rounded-xl border-primary">
							<button
								onClick={() => decreaseQuantity(cartItem.dishId)}
								className="px-2 py-1"
							>
								-
							</button>
							<span className="mx-2">{cartItem.variants.length}</span>
							<button
								onClick={() => increaseQuantity(cartItem.dishId)}
								className="px-2 py-1"
							>
								+
							</button>
						</div>
					) : (
						<button
							onClick={() => removeDish(cartItem.dishId)}
							className="px-10 py-1 bg-base-100 rounded-full"
						>
							<FaBookmark size={16} style={{ color: "var(--color-primary)" }} />
						</button>
					)}
				</div>
				{showDescription && (
					<DishData show={showDescription} onClose={closeModal}>
						<div className="relative py-4 mx-4 ">
							<DishPopup dishData={selectedDish} />
						</div>
					</DishData>
				)}
			</div>
		</div>
	);
};

export default CartItem;
