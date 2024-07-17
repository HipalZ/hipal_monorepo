"use client"
import React, { memo } from 'react'
import Section from "@/components/molecules/section"
import type { IUniquelyDishes } from '@/components/types/businessData'
import DiscountDishCard from '@/components/molecules/discountDishCard';
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useParams, useRouter } from 'next/navigation';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';

interface Props {
    uniquelyDishes: IUniquelyDishes[] | undefined
}
const MemoUniquelyDishes = (props: Props) => {
    const customLink = useParams()?.businessId as string
    const { uniquelyDishes } = props
    const router = useRouter();
    const handleRecommendedDishClick = (id: string) => {
      router.push(routePaths[PAGE_TYPES.DISH_ID](customLink, id));
    };
    return (
        <section className="mt-6 no-scrollbar">
            <Section title="Uniquely Yours" tag="h3">
                <div className="no-scrollbar">
                    <Splide
                        aria-labelledby="Special offers"
                        options={{
                            rewind: false,
                            width: "100%",
                            height:'auto',
                            gap: "0.75rem",
                            padding: "1rem",
                            perPage: 2,
                            perMove: 1,
                            focus:0,
                            autoWidth: true,
                            classes: {
                                pagination: "splide__pagination custom-pagination",
                                page: "splide__pagination__page custom-pagination__page",
                            },
                        }}
                    >
                        <div className="hidden splide__arrows">
                            <button
                                type="button"
                                className="splide__arrow splide__arrow--prev"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                className="splide__arrow splide__arrow--next"
                            >
                                Next
                            </button>
                        </div>
                        {uniquelyDishes?.map((dishData: IUniquelyDishes, key: number) => (
                            <SplideSlide
                                key={`${key}FilterPopularDishes${dishData?._id || ""}`}
                            >
                                {dishData && (
                                    <DiscountDishCard
                                        dishData={dishData}
                                        onClick={() => handleRecommendedDishClick(dishData._id)}
                                    />
                                )}
                            </SplideSlide>
                        ))}
                    </Splide>
                </div>
            </Section>
        </section>
    )
}

const UniquelyDishes = memo(MemoUniquelyDishes)
export default UniquelyDishes