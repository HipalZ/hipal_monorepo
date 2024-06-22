import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import { useCustomerzData } from '@/components/store/useCustomerzData';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import type { Review } from '@/components/types/businessData';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, useState } from 'react';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

function CustomerzReviews() {
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const { customerzName, customerzPhone, setCustomerzName } = useCustomerzData();
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const [pageNumber, setPageNumber] = useState(1);
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const handleClick = (newPage: number) => {
    setPageNumber(newPage);
  };
  const fetchBillsApi = async () => {
    try {
      const response = await axios.get(
        `/v1/payments/:id/customerReviews?businessId=${businessId}&phone=91${customerzPhone}&pageNumber=${pageNumber}&name=${customerzName}`,
      );
      setCustomerzName(response.data.data.customerName);
      setReviewsData(response.data.data.reviews);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['customerzReviews', businessId, customerzPhone, pageNumber],
    queryFn: fetchBillsApi,
    enabled: (selectedSubIcon === 'customerzReviews' && !!businessId && !!customerzPhone) || !!pageNumber,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="bg-white">
      <div className=" linear_gradient_background">
        <Header
          title="Reviews"
          onBack={() => setSelectedSubIcon('')}
          leftIcon={<FaArrowLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="mx-6 mt-6 rounded-lg bg-[#204D42] py-4 text-white">
          <div className="flex items-center justify-start">
            <div className="mx-4 rounded-full bg-white px-4 py-2 text-xl font-semibold text-[#204D42]">
              {customerzName ? customerzName.charAt(0) : null}
            </div>
            <div className="ml-2 text-xl font-normal">{customerzName}</div>
          </div>
        </div>
        <section className="mx-6 my-4">
          <article className="flex items-center justify-between">
            <h1 className="text-xl text-[#000000]">Reviews</h1>
          </article>
        </section>
      </div>
      <section className="relative w-full px-6 my-6 space-y-4 overflow-auto masonry-layout scroll-smooth">
        {reviewsData.length > 0 ? (
          reviewsData?.map((review: Review) => {
            const date = new Date(review.date);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
            return (
              <article key={review._id} className="bg-base-100 masonry-item rounded-xl border border-[#cacaca] bg-[#fbfbfb] p-4 ">
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
                {review.improvementAreas.length && <p>Suggest To Improve:-</p>}
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
          <div className="fixed flex flex-col text-center transform -translate-x-1/2 left-1/2 top-1/2">No Reviews Found</div>
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
    </div>
  );
}

export default memo(CustomerzReviews);
