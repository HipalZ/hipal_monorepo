import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import ErrorComponent from '@/components/errorComponent';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import Header from '@/components/molecules/header';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { IReviewDashboard, Review } from '@/components/types/businessData';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import React, { memo, startTransition, useEffect, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';
import { MdOutlineArticle, MdSpaceDashboard } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import ReviewBarChart from './reviewChart';

const buttons = [
  {
    text: 'Dashboard',
    Icon: MdSpaceDashboard,
  },
  {
    text: 'Reviewz',
    Icon: MdOutlineArticle,
  },
];

const Reviewz = () => {
  const navigate = useNavigate();
  const { setSelectedIcon, setSelectedSubIcon } = useSelectedIcon();
  const { timeStampStart, timeStampEnd } = useTimings();
  const [pageNumber, setPageNumber] = useState(1);
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const handleClick = (newPage: number) => {
    setPageNumber(newPage);
  };
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const [reviewzDashboard, setReviewzDashboard] = useState<IReviewDashboard>({});
  const [reviewsData, setReviewsData] = useState([]);
  const fetchReviewsDashboard = async () => {
    if (!businessId) {
      return;
    }
    try {
      const response = await axios.get(`/v1/payments/:id/reviewsDashboard?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}`);
      setReviewzDashboard(response.data.data);
      return response.data.data;
    } catch (err) {
      console.log('err', err);
    }
  };
  const fetchReviewsData = async () => {
    if (!businessId) {
      return;
    }
    try {
      const response = await axios.get(
        `/v1/payments/:id/reviews?businessId=${businessId}&from=${timeStampStart}&to=${timeStampEnd}&pageNumber=${pageNumber}`,
      );
      setReviewsData(response.data.data);
      return response.data.data;
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    setSelectedButton('Dashboard');
    setSelectedSubIcon('Dashboard');
  }, []);

  const {
    isLoading,
    error,
    data: reviewzData,
    refetch,
  } = useQuery({
    queryKey: ['reviewsDashboard', businessId, timeStampStart, timeStampEnd],
    queryFn: fetchReviewsDashboard,
    enabled: !!businessId && selectedButton === 'Dashboard',
  });

  const {
    isLoading: isReviewDataPending,
    error: reviewErrorData,
    data: reviewData,
    refetch: refetchReviewData,
  } = useQuery({
    queryKey: ['reviewsData', businessId, timeStampStart, timeStampEnd, pageNumber],
    queryFn: fetchReviewsData,
    enabled: !!businessId && selectedButton === 'Reviewz',
  });

  if (error) return <ErrorComponent refetch={refetch} />;
  if (reviewErrorData) return <ErrorComponent refetch={refetchReviewData} />;

  const ReviewDashboard = memo(() => {
    return (
      <section key={timeStampStart} className="p-6">
        <h1>Overall Rating {reviewzDashboard.data?.avgRating || ''}</h1>
        <div
          className="Stars"
          style={
            {
              '--rating': reviewzDashboard.data?.avgRating,
            } as React.CSSProperties
          }
        />
        <section className="flex my-6 space-x-16">
          <article>
            <h1 className="text-sm">Positive reviews</h1>
            <span className="text-2xl">{reviewzDashboard.data?.positiveRatingCount || ''}</span>
          </article>
          <article>
            <h1 className="text-sm">Negative reviews</h1>
            <span className="text-2xl">{reviewzDashboard.data?.negativeRatingCount || ''}</span>
          </article>
        </section>
        <br />
        {reviewzDashboard.dailyReviewAnalysis && (
          <section>
            <ReviewBarChart data={reviewzDashboard.dailyReviewAnalysis} />
          </section>
        )}
        <br />
        <section>
          <article className="flex items-center justify-between">
            <h1 className="text-xl text-[#000000]">Latest Reviewz</h1>
            <button
              type="button"
              onClick={() => {
                setSelectedButton('Reviewz');
              }}
              className="on_active_bounce rounded-xl border border-[#000000] px-4 py-2 text-base font-medium focus:outline-none"
            >
              View All
            </button>
          </article>
        </section>
        <section className="w-full my-6 space-y-4 overflow-auto masonry-layout scroll-smooth">
          {reviewzDashboard.latestReviews?.map((review) => {
            const date = new Date(review.date);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
            return (
              <article key={review._id} className="bg-base-100 masonry-item space-y-4 rounded-xl border border-[#cacaca] bg-[#fbfbfb] p-4">
                <h1>{formattedDate}</h1>
                {review?.reviewRating && (
                  <div
                    className="Stars"
                    style={
                      {
                        '--rating': review?.reviewRating,
                      } as React.CSSProperties
                    }
                  />
                )}
                <p className="my-4">{review.description}</p>
                {review.improvementAreas.length && <p>Suggest To Improve:-</p>}
                <section className="flex flex-wrap gap-2 my-2 overflow-x-auto">
                  {review.improvementAreas?.map((suggestion) => {
                    return (
                      <h1
                        key={suggestion}
                        className="bg-base-100 inline-block items-center justify-center overflow-hidden truncate rounded-full border border-[#cacaca] px-5 py-2"
                      >
                        <span>{suggestion}</span>
                      </h1>
                    );
                  })}
                </section>
              </article>
            );
          })}
        </section>
      </section>
    );
  });
  ReviewDashboard.displayName = 'ReviewDashboard';
  const ReviewzList = memo(() => {
    return (
      <>
        <section className="masonry-layout relative my-6 mb-[8rem] w-full overflow-auto scroll-smooth px-6">
          {reviewsData.length ? (
            reviewsData.map((review: Review) => {
              const date = new Date(review.date);
              const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
              return (
                <article key={review._id} className="bg-base-100 masonry-item rounded-xl border border-[#cacaca] p-4 ">
                  <h1>{formattedDate}</h1>
                  <div
                    className="Stars"
                    style={
                      {
                        '--rating': review.reviewRating,
                      } as React.CSSProperties
                    }
                  />
                  <p className="my-4">{review.description}</p>
                  {review.improvementAreas.length ? <p>Suggest To Improve:-</p> : null}
                  <section className="flex flex-wrap gap-4 my-2 overflow-x-auto">
                    {review.improvementAreas.map((suggestion: string) => {
                      return (
                        <h1
                          key={suggestion}
                          className="bg-base-100 inline-block items-center justify-center overflow-hidden truncate rounded-full border border-[#cacaca] px-5 py-2"
                        >
                          <span>{suggestion}</span>
                        </h1>
                      );
                    })}
                  </section>
                </article>
              );
            })
          ) : (
            <center>No Data</center>
          )}
        </section>
        <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
          {reviewsData && reviewsData.length >= 0 && (
            <button
              type="button"
              onClick={() => handleClick(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
            >
              <BiChevronsLeft />
            </button>
          )}
          <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-black">{pageNumber}</p>
          {reviewsData && reviewsData.length > 0 && (
            <button
              type="button"
              onClick={() => handleClick(pageNumber + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
            >
              <BiChevronsRight />
            </button>
          )}
        </div>
      </>
    );
  });
  ReviewzList.displayName = 'ReviewzList';
  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
    setSelectedIcon('');
  };
  const renderData = () => {
    switch (selectedButton) {
      case 'Dashboard':
        return <ReviewDashboard />;
      case 'Reviewz':
        return <ReviewzList />;
      default:
        return <ReviewDashboard />;
    }
  };
  return (
    <>
     <div className="linear_gradient_background">
        <Header title="Reviewz" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <SubheaderButtonList buttons={buttons} />
        <div className="flex items-center justify-between pb-4 mt-4">
          <div className="flex text-2xl">
            <span className="ml-6"> Reviewz</span>
          </div>
        </div>
      </div>
      <DateRangePicker />
      {renderData()}
    </>
  );
};

export default memo(Reviewz);
