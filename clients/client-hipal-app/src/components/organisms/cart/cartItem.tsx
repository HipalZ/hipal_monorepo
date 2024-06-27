import React from 'react';
import FoodType, { FOOD_TYPES } from '@/components/atoms/foodType';
import { useCart } from '@/components/store/useCart';
import Image from 'next/image';
import PlaceholderImg from '@/components/atoms/placeholder';


const CartItem = ({ cartItem }) => {
    const { increaseQuantity, decreaseQuantity, removeDish } = useCart();
    const imageUrl = cartItem.dishData?.images[0] || cartItem.dishData?.images[1] || cartItem.dishData?.images[2];

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex flex-col w-[70%]">
                <FoodType type={cartItem.dishData.dishType as FOOD_TYPES} />
                <span className="text-lg font-semibold">{cartItem.dishData.name}</span>
            </div>
            <div className="relative flex items-center justify-between">
                {imageUrl ? (
                    <Image src={imageUrl} alt={cartItem.dishData.name} width={70} height={70} className="object-cover w-20 h-20 rounded-md" />
                ) : (
                    <PlaceholderImg className="w-20 h-20 rounded-md" />
                )}
                <div className="absolute transform -translate-x-1/2 translate-y-[50%] left-1/2 top-[70%] text-xs ">
                    {cartItem.variants.length > 1 ? (
                        <div className='flex items-center justify-between border bg-base-100 text-primary rounded-xl border-primary'>
                            <button onClick={() => decreaseQuantity(cartItem.dishId)} className="px-2 py-1">-</button>
                            <span className="mx-2">{cartItem.variants.length}</span>
                            <button onClick={() => increaseQuantity(cartItem.dishId)} className="px-2 py-1">+</button>
                        </div>
                    ) : (
                        <button onClick={() => removeDish(cartItem.dishId)} className="px-2 py-1 text-white bg-red-500 rounded">Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItem;
