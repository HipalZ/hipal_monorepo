import React, { memo } from "react";
import { GiKnifeFork } from "react-icons/gi";
import { useCart } from "@/components/store/useCart";
import TopBackground from "@/components/molecules/topBackground";
import CartItem from "./cartItem";
import { IoIosArrowBack } from "react-icons/io";
import { IBusinessData } from "@/components/types/businessData";

const Cart = memo(({ data }:{data:IBusinessData}) => {
	const { cart , showCart, setShowCart} = useCart();

	return (
		<div className="relative flex flex-col items-center justify-center overflow-auto">
			<section className="fixed top-0 z-50 bg-base-100">
				<TopBackground halfTop themes={data?.settings?.themes} />
				<article className="flex items-center space-x-6 h-16 pl-5">
					<IoIosArrowBack onClick={()=>setShowCart(!showCart)} size={24}/>
					<p className="text-2xl text-primary">Bookmark</p>
				</article>
			</section>
            &nbsp;
			{Object.keys(cart).length === 0 ? (
				<div className="flex flex-col items-center justify-center pt-[20vh]">
					<div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-100">
						<GiKnifeFork className="text-4xl text-primary-100" />
					</div>
					<div className="mt-4 text-2xl font-bold">Your cart is empty</div>
				</div>
			) : (
				<div className="w-full px-4 py-[15vh]">
					{Object.values(cart).map((cartItem) => (
						<CartItem key={cartItem.dishId} cartItem={cartItem} />
					))}
				</div>
			)}
		</div>
	);
});

export default Cart;
