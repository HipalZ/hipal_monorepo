import Header from "@/components/molecules/header";
import type React from "react";
import { memo, useEffect, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { useRouter } from "next/router";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import { useCustomerzData } from "@/components/store/useCustomerzData";
import axios from "@/axios";
import type { Review } from "@/components/types/businessData";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import ErrorComponent from "@/components/errorComponent";

function CustomerzReviews() {
    const router = useRouter();
    const [reviewsData, setReviewsData] = useState<Review[]>([])
    const { customerzName, customerzPhone, setCustomerzName } = useCustomerzData();
    const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
    const [pageNumber, setPageNumber] = useState(1);
    const { businessId } = router.query as {
        businessId: string;
    };
    const handleClick = (newPage: number) => {
        setPageNumber(newPage);
    };
    const fetchBillsApi = async () => {
        try {
            const response = await axios.get(`/v1/payments/:id/customerReviews?businessId=${businessId}&phone=91${customerzPhone}&pageNumber=${pageNumber}&name=${customerzName}`)
            setCustomerzName(response.data.customerName);
            setReviewsData(response.data.reviews);
            return response.data;
        } catch (err) {
            console.log(err);
        }
    }

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ['customerzReviews', businessId, customerzPhone, pageNumber],
        queryFn: fetchBillsApi,
        enabled: (selectedSubIcon === "customerzReviews" && !!businessId && !!customerzPhone) || !!pageNumber
    })

    if (isLoading) return <LoadingSpinner />
    if (error) return <ErrorComponent refetch={refetch} />

    return (
        <div className="bg-white">
            <div className="bg-[#f5f5f5] border-b border-[#CACACA]">
                <Header
                    title="Reviews"
                    onBack={() => setSelectedSubIcon("")}
                    leftIcon={<BsChevronLeft />}
                    centerImage={Hi}
                    rightImage={Hi}
                    isIconBusinessShow={true}
                />
                <div className="mx-6 mt-6 bg-[#204D42] text-white rounded-lg py-4">
                    <div className="flex items-center justify-start">
                        <div className="text-xl px-4 py-2 rounded-full mx-4 font-semibold bg-white text-[#204D42]">
                            {customerzName ? customerzName.charAt(0) : null}
                        </div>
                        <div className="ml-2 text-xl font-normal">
                            {customerzName}
                        </div>
                    </div>
                </div>
                <section className="mx-6 my-4">
                    <article className="flex justify-between items-center">
                        <h1 className="text-xl text-[#2B354D]">
                            Reviews
                        </h1>
                    </article>
                </section>
            </div>
            <section className="relative masonry-layout w-full px-6 my-6 overflow-auto scroll-smooth space-y-4">
                {reviewsData.length >0 ? reviewsData?.map((review: Review) => {
                    const date = new Date(review.date);
                    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
                    return (
                        <article key={review._id} className="bg-[#fbfbfb] p-4 border bg-base-100 border-[#cacaca] rounded-xl masonry-item ">
                            <h1>{formattedDate}</h1>
                            <div
                                className="Stars"
                                style={{
                                    "--rating": review.reviewRating,
                                } as React.CSSProperties}
                            />
                            <p className="my-4">{review.description}</p>
                            {review.improvementAreas.length && <p>Suggest To Improve:-</p>}
                            <section className="overflow-x-auto flex flex-wrap gap-4 my-2">
                                {review.improvementAreas.map((suggestion: string) => {
                                    return (
                                        <h1 key={suggestion} className="inline-block truncate overflow-hidden px-5 py-2 justify-center items-center border bg-base-100 border-[#cacaca] rounded-full">
                                            <span >{suggestion}</span>
                                        </h1>
                                    )
                                })}
                            </section>
                        </article>
                    )
                }) : <div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
                    No Reviews Found
                </div>}
            </section>
            <div className="fixed z-20 flex items-center justify-center space-x-4 transform -translate-x-1/2 bottom-[5rem] left-1/2">
                {reviewsData && reviewsData.length >= 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber - 1)}
                        disabled={pageNumber === 1}
                        className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
                    >
                        <BiChevronsLeft />
                    </button>
                )}
                <p className="w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]">
                    {pageNumber}
                </p>
                {reviewsData && reviewsData.length > 0 && (
                    <button
                        type="button"
                        onClick={() => handleClick(pageNumber + 1)}
                        className="text-base w-10 h-10 flex justify-center items-center bg-white text-black border rounded-full border-[#2B354D]"
                    >
                        <BiChevronsRight />
                    </button>
                )}
            </div>
        </div>
    );
}

export default memo(CustomerzReviews);
