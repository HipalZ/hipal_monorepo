"use client"
import CategoryHeader from '@/components/organisms/category/categoryHeader.client'
import PageName from '@/components/molecules/pageName'
import Footer from '@/components/molecules/footer'
import DishesList from '@/components/organisms/category/dishesList'
import CategoryPageBtn from '@/components/molecules/bottomButton/categoryPageBtn'
import TopBackground from '@/components/molecules/topBackground'
import { IBusinessData } from '@/components/types/businessData'
import { memo } from 'react'
import { useCart } from '@/components/store/useCart'
import { GiKnifeFork } from 'react-icons/gi'
import FoodType, { FOOD_TYPES } from '@/components/atoms/foodType'

const Category = memo(({ data }: { data: IBusinessData }) => {
    const { cart, showCart, increaseQuantity, decreaseQuantity, removeDish } = useCart();
    console.log(cart);

    return (
        <>
            {
                !showCart &&
                <div className="relative flex flex-col w-full pb-14">
                    <TopBackground themes={data?.settings?.themes} />
                    <CategoryHeader categories={data?.categories} allCategoriesTypes={data?.allCategoriesTypes} primaryColor={data?.settings?.themes?.primaryColor || ''} />
                    <div>
                        <div className="!mt-0 !scroll-smooth">
                            <DishesList allCategoriesTypes={data?.allCategoriesTypes} categories={data?.categories || []} />
                        </div>
                        <Footer
                            footerText={data?.settings?.themes?.footerText || ''}
                            instagramLink={data?.settings?.themes?.instagramLink || ''}
                            facebookLink={data?.settings?.themes?.facebookLink || ''}
                            youtubeLink={data?.settings?.themes?.youtubeLink || ''}
                            linkedinLink={data?.settings?.themes?.linkedinLink || ''}
                        />
                        <PageName />
                    </div>
                </div>
            }
            <CategoryPageBtn />

            {
                showCart && (
                    <div className="flex flex-col items-center justify-center overflow-auto">
                        <TopBackground themes={data?.settings?.themes} />
                        <h3 className='pt-4 text-2xl text-primary'>Wishlist</h3>
                        {Object.keys(cart).length === 0 ? (
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-base-100">
                                    <GiKnifeFork className="text-4xl text-primary-100" />
                                </div>
                                <div className="mt-4 text-2xl font-bold">Your cart is empty</div>
                            </div>
                        ) : (
                            <div className="w-full px-4">
                                {Object.values(cart).map((cartItem) => (
                                    <div key={cartItem.dishId} className="flex items-center justify-between p-4 border-b">
                                        <div className="flex flex-col w-[70%]">
                                            <FoodType type={cartItem.dishData.dishType as FOOD_TYPES} />
                                            <span className="text-lg font-semibold">{cartItem.dishData.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <img src={cartItem.dishData.images[0]} alt={cartItem.dishData.name} className="object-cover w-20 h-20 rounded-md" />
                                            <div className="flex items-center ml-4">
                                                {cartItem.variants.length > 1 ? (
                                                    <>
                                                        <button onClick={() => decreaseQuantity(cartItem.dishId)} className="px-2 py-1 bg-gray-200 rounded">-</button>
                                                        <span className="mx-2">{cartItem.variants.length}</span>
                                                        <button onClick={() => increaseQuantity(cartItem.dishId)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => removeDish(cartItem.dishId)} className="px-2 py-1 text-white bg-red-500 rounded">Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            }
        </>
    );
});

export default Category;
