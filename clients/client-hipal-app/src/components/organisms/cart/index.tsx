import React, { memo } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { useCart } from "@/components/store/useCart";
import CartItem from "./cartItem";

const Cart = () => {
	const { cart} = useCart();

	return (
		<div className="h-[80vh] overflow-y-auto pb-[5rem]">
			<article className="flex items-center space-x-6 h-16 pl-5">
				<p className="text-2xl text-primary">Bookmark</p>
			</article>
			&nbsp;
			{Object.keys(cart).length === 0 ? (
				<div className="flex flex-col items-center justify-center pt-[20vh]">
					<div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-100">
						<GiKnifeFork className="text-4xl text-primary-100" />
					</div>
					<div className="mt-4 text-2xl font-bold">Your cart is empty</div>
				</div>
			) : (
				<div className="w-full px-4">
					{Object.values(cart).map((cartItem) => (
						<CartItem key={cartItem.dishId} cartItem={cartItem} />
					))}
				</div>
			)}
		</div>
	);
}

const MemoCart = memo(Cart);
export default MemoCart;
