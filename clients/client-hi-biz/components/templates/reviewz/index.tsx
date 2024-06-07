import Header from "@/components/molecules/header";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import { useRouter } from "next/router";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import DateRangePicker from "@/components/molecules/dateRangePicker";
import SubheaderButtonList from "@/components/atom/subHeaderBtn";
import { MdSpaceDashboard } from "react-icons/md";
import { MdOutlineArticle } from "react-icons/md";
import ReviewBarChart from "./reviewChart";
import axios from "@/axios";
import React, { memo, useEffect, useState } from "react";
import type { IReviewDashboard, Review } from "@/components/types/businessData";
import useTimings from "@/components/store/useTimings";
import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import { BiChevronsLeft, BiChevronsRight } from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const buttons = [
    {
        text: "Dashboard",
        Icon: MdSpaceDashboard,
    },
    {
        text: "Reviewz",
        Icon: MdOutlineArticle,
    },

];

const Reviewz = () => {
    const { setSelectedIcon, selectedSubIcon, setSelectedSubIcon } = useSelectedIcon();
    const router = useRouter();
    const { timeStampStart, timeStampEnd } =
        useTimings();
    const [pageNumber, setPageNumber] = useState(1);
    const { businessId } = router.query as {
        businessId: string;
    };
    const handleClick = (newPage: number) => {
        setPageNumber(newPage);
    };
    const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
    const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
    const [reviewzDashboard, setReviewzDashboard] = useState<IReviewDashboard>({});
    const [reviewsData, setReviewsData] = useState([]);
    const fetchReviewsDashboard = async () => {
        if(!businessId){return}
            try {
                const response = await axios.get(`/v1/payments/:id/reviewsDashboard?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}`)
                setReviewzDashboard(response.data)
                return response.data;
            } catch (err) {
                console.log('err', err);
            }
    }
    const fetchReviewsData = async() =>{
        if(!businessId){return}
        try{
            const response = await axios.get(`/v1/payments/:id/reviews?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`)
            setReviewsData(response.data);
            return response.data;
        }catch(err){
            console.log('err', err);
        }
    }
    useEffect(() => {
        setSelectedButton("Dashboard")
        setSelectedSubIcon("Dashboard")
    }, [])

    const {isLoading, error, data: reviewzData, refetch} = useQuery({
        queryKey: ['reviewsDashboard', businessId, timeStampStart, timeStampEnd],
        queryFn: fetchReviewsDashboard,
        enabled: !!businessId && selectedButton === "Dashboard"
    })

    const {isLoading: isReviewDataPending, error: reviewErrorData, data: reviewData, refetch: refetchReviewData} = useQuery({
        queryKey: ['reviewsData', businessId, timeStampStart, timeStampEnd, pageNumber],
        queryFn: fetchReviewsData,
        enabled: !!businessId && selectedButton === "Reviewz"
    })

    if(error) return <ErrorComponent refetch={refetch} />
    if(reviewErrorData) return <ErrorComponent refetch={refetchReviewData} />
    
    const ReviewDashboard = memo(() => {
        return (
            <section key={timeStampStart} className="p-6">
                <h1>Overall Rating {reviewzDashboard.data?.avgRating ||''}</h1>
                <div
                    className="Stars"
                    style={{
                        "--rating": reviewzDashboard.data?.avgRating
                    } as React.CSSProperties}
                />
                <section className="flex space-x-16 my-6">
                    <article>
                        <h1 className="text-sm">Positive reviews</h1>
                        <span className="text-2xl">{reviewzDashboard.data?.positiveRatingCount ||''}</span>
                    </article>
                    <article>
                        <h1 className="text-sm">Negative reviews</h1>
                        <span className="text-2xl">{reviewzDashboard.data?.negativeRatingCount ||''}</span>
                    </article>
                </section>
                <br />
                {reviewzDashboard.dailyReviewAnalysis && <section>
                    <ReviewBarChart data={reviewzDashboard.dailyReviewAnalysis} />
                </section>}
                <br />
                <section>
                    <article className="flex justify-between items-center">
                        <h1 className="text-xl text-[#2B354D]">
                            Latest Reviewz
                        </h1>
                        <button type="button" onClick={()=>{
                            setSelectedButton("Reviewz")
                        }} className="border border-[#2B354D] on_active_bounce font-medium px-4 py-2 rounded-xl focus:outline-none text-base">
                            View All
                        </button>
                    </article>
                </section>
                <section className="masonry-layout w-full my-6 overflow-auto scroll-smooth space-y-4">
                    {reviewzDashboard.latestReviews?.map((review) => {
                        const date = new Date(review.date);
                        const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
                        return (
                            <article key={review._id} className="bg-[#fbfbfb] p-4 border bg-base-100 border-[#cacaca] rounded-xl masonry-item space-y-4">
                                <h1>{formattedDate}</h1>
                                {review?.reviewRating && <div
                                    className="Stars"
                                    style={{
                                        "--rating": review?.reviewRating,
                                    } as React.CSSProperties}
                                />}
                                <p className="my-4">{review.description}</p>
                                {review.improvementAreas.length && <p>Suggest To Improve:-</p>}
                                <section className="overflow-x-auto flex flex-wrap gap-2 my-2">
                                    {review.improvementAreas?.map((suggestion) => {
                                        return (
                                            <h1 key={suggestion} className="inline-block truncate overflow-hidden px-5 py-2 justify-center items-center border bg-base-100 border-[#cacaca] rounded-full">
                                                <span >{suggestion}</span>
                                            </h1>
                                        )
                                    })}
                                </section>
                            </article>
                        )
                    })}
                </section>
            </section>
        )
    })
    ReviewDashboard.displayName = 'ReviewDashboard';
    const ReviewzList = memo(() => {
        return (
            <>
                <section className="relative masonry-layout w-full px-6 my-6 mb-[8rem] overflow-auto scroll-smooth">
                    {reviewsData.length ? reviewsData.map((review: Review) => {
                        const date = new Date(review.date);
                        const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
                        return (
                            <article key={review._id} className="p-4 border bg-base-100 border-[#cacaca] rounded-xl masonry-item ">
                                <h1>{formattedDate}</h1>
                                <div
                                    className="Stars"
                                    style={{
                                        "--rating": review.reviewRating,
                                    } as React.CSSProperties}
                                />
                                <p className="my-4">{review.description}</p>
                                {review.improvementAreas.length ? <p>Suggest To Improve:-</p> :null}
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
                    }):
                        <center>No Data</center>
                    }
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
            </>
        )
    })
    ReviewzList.displayName = 'ReviewzList';
    const renderData = () => {
        switch (selectedButton) {
            case "Dashboard":
                return (<ReviewDashboard />)
            case "Reviewz":
                return (<ReviewzList />)
            default:
                return (<ReviewDashboard />)
        }
    }
    return (
        <>
            <div className="bg-[#f5f5f5]">
                <Header
                    title="Reviewz"
                    onBack={() => {
                        router.query.tab = "";
                        setSelectedIcon("");
                    }}
                    leftIcon={<BsChevronLeft />}
                    centerImage={Hi}
                    rightImage={Hi}
                    isIconBusinessShow={true}
                />
                <SubheaderButtonList buttons={buttons} />
                <div className="flex justify-between items-center mt-4 pb-4 border-b border-[#cacaca]">
                    <div className="flex text-2xl">
                        <span className="ml-6"> Reviewz</span>
                    </div>
                </div>
            </div>
            <DateRangePicker />
            {renderData()}
        </>
    )
};

export default memo(Reviewz);


